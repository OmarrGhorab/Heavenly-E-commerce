import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cloudinary from '../lib/cloudinary.js';
import Order from "../models/order.model.js";
import { emailService } from '../services/email.service.js';

dotenv.config();

// Constants
const AUTH_CONSTANTS = {
  RATE_LIMIT: 3,
  TIME_WINDOW: 24 * 60 * 60,
  TOKEN_EXPIRATION: {
    ACCESS: '15m',
    REFRESH: '7d',
    VERIFICATION: '15m',
    RESET: '15m'
  },
  COOKIE_CONFIG: {
    HTTP_ONLY: true,
    SECURE: process.env.NODE_ENV === 'production', // Use `false` locally
    SAME_SITE: 'strict'
  }  
};

// Helpers
const tokenManager = {
  generateTokens: (userId) => ({
    accessToken: jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: AUTH_CONSTANTS.TOKEN_EXPIRATION.ACCESS
    }),
    refreshToken: jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: AUTH_CONSTANTS.TOKEN_EXPIRATION.REFRESH
    })
  }),

  storeRefreshToken: async (userId, token) => {
    await redis.set(`refresh-token:${userId}`, token, "EX", 7 * 24 * 60 * 60);
  },

  verifyToken: (token, secret) => jwt.verify(token, secret)
};

const cookieManager = {
  setCookies: (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
      ...AUTH_CONSTANTS.COOKIE_CONFIG,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      ...AUTH_CONSTANTS.COOKIE_CONFIG,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  },

  clearCookies: (res) => {
    res.clearCookie("accessToken", {
      ...AUTH_CONSTANTS.COOKIE_CONFIG,
    });
    res.clearCookie("refreshToken", {
      ...AUTH_CONSTANTS.COOKIE_CONFIG,
    });
  }
};


const userHelper = {
  getSafeUserData: (user) => ({
    _id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    photo: user.photo
  }),

  handleVerificationFlow: async (email) => {
    const verificationToken = jwt.sign(
      { email }, 
      process.env.JWT_SECRET, 
      { expiresIn: AUTH_CONSTANTS.TOKEN_EXPIRATION.VERIFICATION }
    );

    await redis.set(`verify-email-token:${email}`, verificationToken, 'EX', 900);
    await User.updateOne({ email }, { verificationToken });
    return `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
  }
};

// Controllers
export const authController = {
  async signup(req, res) {
    try {
      const { username, email, password, gender } = req.body;
      const normalizedGender = gender.toLowerCase();

      const existingUser = await User.findOne({ $or: [{ username }, { email }] });
      if (existingUser) {
        if (!existingUser.isVerified) {
          const tokenExists = await redis.get(`verify-email-token:${email}`);
          if (tokenExists) {
            return res.status(200).json({ 
              message: "Verification email already sent. Check your inbox." 
            });
          }
          
          const verificationLink = await userHelper.handleVerificationFlow(email);
          await emailService.sendVerificationEmail(email, verificationLink);
          return res.status(200).json({ 
            message: "New verification email sent." 
          });
        }
        return res.status(400).json({ message: "User already exists." });
      }

      const newUser = await User.create({
        username,
        email,
        password,
        gender: normalizedGender,
        isVerified: false,
        photo: normalizedGender === 'male' 
          ? process.env.CLOUDINARY_DEFAULT_MALE 
          : process.env.CLOUDINARY_DEFAULT_FEMALE
      });

      const verificationLink = await userHelper.handleVerificationFlow(email);
      await emailService.sendVerificationEmail(email, verificationLink);

      return res.status(201).json({
        user: userHelper.getSafeUserData(newUser),
        message: "Account Created. Check Your Email or Spam folder to Verify."
      });
    } catch (error) {
      console.error('Signup Error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async verifyEmail(req, res) {
    try {
      const { token } = req.params;
      const { email } = tokenManager.verifyToken(token, process.env.JWT_SECRET);
      
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: 'User not found.' });
      if (user.isVerified) {
        return res.status(200).json({ message: 'Email already verified.' });
      }

      const storedToken = await redis.get(`verify-email-token:${email}`);
      if (!storedToken || storedToken !== token) {
        return res.status(400).json({ message: 'Invalid or expired token.' });
      }

      user.isVerified = true;
      await user.save();
      await redis.del(`verify-email-token:${email}`);

      return res.status(200).json({ 
        user: userHelper.getSafeUserData(user), 
        message: 'Email verified successfully.' 
      });
    } catch (error) {
      const errorMessage = error.name === 'TokenExpiredError' 
        ? 'Token expired. Request a new one.' 
        : 'Invalid token.';
      res.status(400).json({ message: errorMessage });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: "Invalid credentials." });
      }
      if (!user.isVerified) {
        return res.status(403).json({ message: "Verify your email to login." });
      }

      const { accessToken, refreshToken } = tokenManager.generateTokens(user._id);
      await tokenManager.storeRefreshToken(user._id, refreshToken);
      cookieManager.setCookies(res, accessToken, refreshToken);

      return res.status(200).json({
        user: userHelper.getSafeUserData(user),
        message: "Login successful."
      });
    } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  },

  async logout(req, res) {
    try {
      const { refreshToken } = req.cookies;
      if (!refreshToken) return res.status(401).json({ message: "No token provided." });

      const { userId } = tokenManager.verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      await redis.del(`refresh-token:${userId}`);
      
      cookieManager.clearCookies(res);
      res.status(200).json({ message: "Logout successful." });
    } catch (error) {
      console.error("Logout Error:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  },

  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.cookies;
      const { userId } = tokenManager.verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      
      const storedToken = await redis.get(`refresh-token:${userId}`);
      if (storedToken !== refreshToken) {
        return res.status(403).json({ message: "Invalid token." });
      }

      const { accessToken } = tokenManager.generateTokens(userId);
      res.cookie("accessToken", accessToken, {
        ...AUTH_CONSTANTS.COOKIE_CONFIG,
        maxAge: 15 * 60 * 1000
      });

      res.status(200).json({ accessToken, message: "Token refreshed." });
    } catch (error) {
      res.status(403).json({ message: "Invalid or expired token." });
    }
  },

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "User not found." });

      const attemptsKey = `forgot-password-attempts:${email}`;
      const attempts = parseInt(await redis.get(attemptsKey) || 0) + 1;
      
      if (attempts > AUTH_CONSTANTS.RATE_LIMIT) {
        return res.status(429).json({ message: 'Too many attempts. Try later.' });
      }

      const resetToken = jwt.sign(
        { userId: user._id, email },
        process.env.JWT_RESET_SECRET,
        { expiresIn: AUTH_CONSTANTS.TOKEN_EXPIRATION.RESET }
      );

      await redis.set(`resetToken:${email}`, resetToken, "EX", 900);
      await redis.set(attemptsKey, attempts, "EX", AUTH_CONSTANTS.TIME_WINDOW);

      const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
      await emailService.sendPasswordResetEmail(email, resetLink);

      res.json({ message: "Password reset email sent.", attempts });
    } catch (error) {
      console.error('Password Reset Error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { newPassword } = req.body;
      
      const { email } = tokenManager.verifyToken(token, process.env.JWT_RESET_SECRET);
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "User not found." });

      const storedToken = await redis.get(`resetToken:${email}`);
      if (!storedToken || storedToken !== token) {
        return res.status(400).json({ message: "Invalid token." });
      }

      user.password = newPassword;
      await user.save();
      await redis.del(`resetToken:${email}`);

      res.json({ message: "Password updated successfully." });
    } catch (error) {
      const message = error.name === "TokenExpiredError" 
        ? "Token expired. Request new reset." 
        : "Invalid token.";
      res.status(400).json({ message });
    }
  }
};

export const profileController = {
  async getProfile(req, res) {
    try {
      res.status(200).json({
        message: 'Profile retrieved',
        profile: userHelper.getSafeUserData(req.user)
      });
    } catch (error) {
      console.error("Profile Error:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  },

  async updateProfile(req, res) {
    try {
      const user = await User.findById(req.user._id);
      const { username, oldPassword, newPassword, image } = req.body;

      if (image) {
        user.photo = await handleImageUpload(image, user.photo);
      }

      if (username) user.username = username;
      if (oldPassword && newPassword) {
        if (!(await user.comparePassword(oldPassword))) {
          return res.status(400).json({ message: 'Invalid password' });
        }
        user.password = newPassword;
      }

      await user.save();
      res.status(200).json({
        message: 'Profile updated',
        user: userHelper.getSafeUserData(user)
      });
    } catch (error) {
      console.error('Update Error:', error);
      res.status(500).json({ 
        message: error.message.startsWith('Cloudinary') 
          ? 'Image upload failed' 
          : 'Server error' 
      });
    }
  }
};

export const orderController = {
  async getUserOrders(req, res) {
    try {
      const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
      res.status(orders.length ? 200 : 404).json({
        success: !!orders.length,
        message: orders.length ? 'Orders found' : 'No orders',
        orders
      });
    } catch (error) {
      console.error('Order Error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
};

// Utility Functions
async function handleImageUpload(image, oldImageUrl) {
  if (oldImageUrl && oldImageUrl.includes('res.cloudinary.com')) {
    const publicId = oldImageUrl.split('/').pop().split('.')[0]; // Extracts public_id from URL
    await cloudinary.uploader.destroy(`profile-photos/${publicId}`); // Deletes the old image
  }

  if (image.startsWith('data:image/')) {
    const result = await cloudinary.uploader.upload(image, {
      folder: 'profile-photos',
      transformation: [{ width: 500, height: 500, crop: 'limit', quality: 'auto', format: 'webp' }]
    });
    return result.secure_url;
  }

  if (image.includes('res.cloudinary.com')) {
    return image;
  }

  throw new Error('Invalid image format');
}

// const uploadDefaultImages = async () => {
//   try {
//       // Path to local images
//       // Convert `import.meta.url` to the directory path
//       const __dirname = path.dirname(fileURLToPath(import.meta.url));

//       const maleImagePath = path.resolve(__dirname, '..', 'images', 'male.png');
//       const femaleImagePath = path.resolve(__dirname, '..', 'images', 'female.png');
//       const logoImagePath = path.resolve(__dirname, '..', 'Logo.webp')
//       // Upload male default photo
//       const malePhoto = await cloudinary.uploader.upload(maleImagePath, {
//           folder: "defaults",
//           public_id: "male",
//           transformation: [{ width: 500, height: 500, crop: 'limit', format: 'webp', quality: 'auto' }],
//       });
//       console.log("Male photo uploaded:", malePhoto.secure_url);

//       // Upload female default photo
//       const femalePhoto = await cloudinary.uploader.upload(femaleImagePath, {
//           folder: "defaults",
//           public_id: "female",
//           transformation: [{ width: 500, height: 500, crop: 'limit', format: 'webp', quality: 'auto' }],
//       });
//       console.log("Female photo uploaded:", femalePhoto.secure_url);

//       const logoPhoto = await cloudinary.uploader.upload(logoImagePath, {
//         folder: "defaults",
//         public_id: "logo",
//         transformation: [
//             { width: 500, height: 500, crop: 'limit', format: 'webp', quality: 'auto' },
//         ],
//     });
//     console.log("Logo photo uploaded:", logoPhoto.secure_url);
//   } catch (error) {
//       console.error("Error uploading default images:", error);
//   }
// };

// Call the upload function once u call it u dont have to call it again so comment it out
// uploadDefaultImages();
