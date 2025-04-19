import mongoose from "mongoose";
import Product from "../models/product.model.js";

export const addFavouriteItems = async (req, res) => {
  const { productId } = req.body;
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized: User not found in request' });
  }

  // Validate productId
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: 'Invalid product ID' });
  }

  try {
    // Check if the product is already in favourites
    const existingItem = user.favourite.find(
      (favId) => favId.toString() === productId
    );

    if (!existingItem) {
      user.favourite.push(productId); // Add to favourites
      await user.save();

      return res.status(201).json({ message: 'Product added to favourites' });
    } else {
      return res.status(200).json({ message: 'Favourite product already exists' });
    }
  } catch (error) {
    console.error('Error in addFavouriteItems controller:', error.message);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getFavouriteItems = async (req, res) => {
  try {
    const user = req.user;
    
    // Fetch favourite products from MongoDB using lean() for faster performance
    const favouriteProducts = await Product.find({
      _id: { $in: user.favourite }
    }).lean();

    // You can choose to return an empty array if none found
    return res.status(200).json(favouriteProducts);
  } catch (error) {
    console.error("Error in getFavouriteItems controller:", error.message);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteFavouriteItems = async (req, res) => {
  const { productId } = req.params;

  try {
    const user = req.user;
    
    if (!user.favourite) {
      user.favourite = []; // Initialize if undefined
    }

    if (!productId) {
      // Clear entire wishlist if no productId is provided
      user.favourite = [];
      await user.save();
      return res.status(200).json({ message: "All items deleted from wishlist" });
    } else {
      // Remove specific item by filtering using toString()
      user.favourite = user.favourite.filter(
        (favId) => favId.toString() !== productId
      );
      await user.save();
      return res.status(200).json({ message: "Item deleted successfully from wishlist" });
    }
  } catch (error) {
    console.error("Error in deleteFavouriteItems controller:", error.message);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
