import Coupon from '../models/coupon.model.js';

const handleError = (res, error, message = "Server error") => {
  console.error(message, error.message);
  return res.status(500).json({
    message,
    error: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  });
};

export const getCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({
      userId: req.user._id,
      isActive: true,
    });
    // Return the coupon or null if none is found.
    res.json(coupon || null);
  } catch (error) {
    handleError(res, error, "Error retrieving coupon");
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    const coupon = await Coupon.findOne({
      code,
      userId: req.user._id,
      isActive: true,
    });

    if (!coupon) {
      return res.status(400).json({ message: "Coupon not found or inactive" });
    }

    // Check if the coupon has expired.
    if (coupon.expirationDate < new Date()) {
      coupon.isActive = false;
      await coupon.save();
      return res.status(400).json({ message: "Coupon has expired" });
    }

    res.json({
      message: "Coupon is valid",
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
      expirationDate: coupon.expirationDate,
    });
  } catch (error) {
    handleError(res, error, "Error validating coupon");
  }
};
