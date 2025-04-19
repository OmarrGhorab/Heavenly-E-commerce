import { redis } from '../lib/redis.js';
import Product from '../models/product.model.js';

export const updateFeaturedProductsCache = async () => {
  try {
    const featuredProducts = await Product.find({ isFeatured: true }).lean();
    await redis.set("featured_products", JSON.stringify(featuredProducts), "EX", 3600);
  } catch (error) {
    console.error("Error updating featured products cache:", error.message);
  }
};
