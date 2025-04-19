import Product from '../models/product.model.js';
import cloudinary from '../lib/cloudinary.js';
import mongoose from 'mongoose';
import { redis } from '../lib/redis.js';
import { updateFeaturedProductsCache } from './cache.service.js';
import Order from '../models/order.model.js';

// Retrieve all products
export const getAllProductsService = async () => {
  return await Product.find({}).lean();
};

// Retrieve a product by its ID
export const getProductByIdService = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid product ID');
  }
  const product = await Product.findById(id);
  if (!product) throw new Error('Product not found');
  return product;
};

// Create a new product with image uploads and sale validations
export const createProductService = async (data, imagesData) => {
  let uploadedImages = [];

  if (!Array.isArray(imagesData)) {
    throw new Error('Images must be an array of image objects containing base64 data.');
  }

  const uploadPromises = imagesData.map((imgObj) => {
    const imageBase64 = imgObj.base64;
    if (imageBase64 && typeof imageBase64 === 'string') {
      return cloudinary.uploader.upload(imageBase64, { folder: 'products', transformation: [{ width: "1000", crop: "limit", dpr: "auto", format: 'webp', quality: "auto", fetch_format: "auto" }]
      });
    }
    return Promise.reject('Invalid or missing base64 string');
  });

  const responses = await Promise.allSettled(uploadPromises);
  responses.forEach(result => {
    if (result.status === 'fulfilled') {
      uploadedImages.push(result.value.secure_url);
    } else {
      console.error('Image upload failed:', result.reason);
    }
  });

  let saleData = {};
  if (data.isSale) {
    if (typeof data.discount !== 'number' || data.discount < 0 || data.discount > 100) {
      throw new Error('Invalid discount value. It should be between 0 and 100.');
    }
    if (!data.saleStart || !data.saleEnd) {
      throw new Error('Sale start and end dates are required when sale is active.');
    }
    const saleStartDate = new Date(data.saleStart);
    const saleEndDate = new Date(data.saleEnd);
    if (saleEndDate <= saleStartDate) {
      throw new Error('Sale end date must be after the sale start date.');
    }
    saleData = { isSale: true, discount: data.discount, saleStart: saleStartDate, saleEnd: saleEndDate };
  }

  const product = await Product.create({
    ...data,
    images: uploadedImages,
    sizes: data.sizes || [],
    colors: data.colors || [],
    ...saleData,
  });

  return product;
};

// Edit an existing product
export const editProductService = async (productId, data, user) => {
  const product = await Product.findById(productId);
  if (!product) throw new Error('Product not found');
  if (user.role !== 'admin') throw new Error('You are not authorized to edit this product');

  product.title = data.title || product.title;
  product.description = data.description || product.description;
  product.price = data.price || product.price;
  product.stock = data.stock || product.stock;
  product.category = data.category || product.category;
  product.colors = Array.isArray(data.colors) ? data.colors : product.colors;
  product.sizes = Array.isArray(data.sizes) ? data.sizes : product.sizes;

  if (typeof data.isSale !== 'undefined') {
    if (data.isSale) {
      if (typeof data.discount !== 'number' || data.discount <= 0 || data.discount > 100) {
        throw new Error('Invalid discount value. It should be between 1 and 100.');
      }
      if (data.saleStart && data.saleEnd) {
        const saleStartDate = new Date(data.saleStart);
        const saleEndDate = new Date(data.saleEnd);
        if (saleEndDate <= saleStartDate) {
          throw new Error('Sale end date must be after the sale start date.');
        }
        product.discount = data.discount;
        product.saleStart = saleStartDate;
        product.saleEnd = saleEndDate;
        product.isSale = true;
      } else {
        throw new Error('Sale start and end dates are required when sale is active.');
      }
    } else {
      product.isSale = false;
      product.discount = undefined;
      product.saleStart = undefined;
      product.saleEnd = undefined;
    }
  }

  await product.save();

  // Refresh the featured products cache if necessary
  const featuredProducts = await redis.get("featured_products");
  if (featuredProducts) {
    let featuredList = JSON.parse(featuredProducts);
    const index = featuredList.findIndex(p => p._id === productId);
    if (index !== -1) {
      featuredList[index] = product;
      await redis.set("featured_products", JSON.stringify(featuredList), 'EX', '3600');
    }
  }

  return product;
};

// Delete a product and clean up related resources
export const deleteProductService = async (id) => {
  const product = await Product.findById(id);
  if (!product) throw new Error('Product not found');

  // Remove images from Cloudinary
  if (product.images && Array.isArray(product.images)) {
    const deletePromises = product.images.map((imageUrl) => {
      const publicId = imageUrl.split('/').pop().split('.')[0];
      return cloudinary.uploader.destroy(`products/${publicId}`);
    });
    await Promise.allSettled(deletePromises);
  }

  await Product.findByIdAndDelete(id);

  // Remove from featured cache if applicable and clear any related product caches
  const featuredProducts = await redis.get("featured_products");
  if (featuredProducts) {
    let featuredList = JSON.parse(featuredProducts);
    const newFeaturedList = featuredList.filter(p => p._id !== id);
    await redis.set("featured_products", JSON.stringify(newFeaturedList), 'EX', '3600');
  }
  const keys = await redis.keys("products:*");
  if (keys.length > 0) {
    await redis.del(...keys);
  }
};

// Toggle the product's featured status
export const toggleFeaturedProductService = async (id) => {
  const product = await Product.findById(id);
  if (!product) throw new Error('Product not found');
  product.isFeatured = !product.isFeatured;
  const updatedProduct = await product.save();
  await updateFeaturedProductsCache();
  return updatedProduct;
};

export const recommendedProductService = async () => {
    return await Product.aggregate([
      { $sample: { size: 6 } },
      { $project: {
          _id: 1,
          title: 1,
          description: 1,
          image: 1,
          price: 1,
          images: 1,
          colors: 1,
          sizes: 1,
          isSale: 1,
          averageRating: 1,
          saleStart: 1,
          saleEnd: 1,
          numberOfRatings: 1,
          stock: 1,
          discount: 1
      } }
    ]);
  };

  export const searchAndFilterProductsService = async (queryParams) => {
    const {
      keyword,
      title,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 9,
      categories
    } = queryParams;
  
    const query = {};
  
    if (categories) {
      query.category = { 
        $in: Array.isArray(categories) ? categories : categories.split(',')
      };
    }
  
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }
  
    if (title) {
      query.title = title;
    }
  
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
  
    const pageNumber = Number(page);
    const pageLimit = Number(limit);
    const skip = (pageNumber - 1) * pageLimit;
  
    const products = await Product.find(query)
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(pageLimit);
  
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / pageLimit);
  
    return {
      message: "Fetched products successfully with filtering",
      products,
      page: pageNumber,
      totalPages,
      totalProducts,
    };
  };

  export const rateProductService = async (productId, rating, userId) => {
    if (rating === undefined) throw new Error('Rating is required.');
    if (typeof rating !== 'number') throw new Error('Rating must be a number.');
    if (rating < 0 || rating > 5) throw new Error('Rating must be between 0 and 5.');
    if (!mongoose.Types.ObjectId.isValid(productId)) throw new Error('Invalid product ID');
  
    const product = await Product.findById(productId);
    if (!product) throw new Error('Product not found');
  
    // Ensure the user has purchased this product
    const order = await Order.findOne({
      user: userId,
      'products.product': productId,
      shippingStatus: 'Delivered'
    });
    if (!order) throw new Error('You must purchase this product before rating it.');

    const existingRating = product.ratings.find(r => r.user.toString() === userId.toString());
    if (existingRating) {
      existingRating.rating = rating;
    } else {
      product.ratings.push({ user: userId, rating });
    }
  
    const totalRatings = product.ratings.reduce((acc, r) => acc + r.rating, 0);
    const newAverageRating = totalRatings / product.ratings.length;
    product.averageRating = newAverageRating;
    product.numberOfRatings = product.ratings.length;
    await product.save();
    

  
    return {
      message: 'Rating added/updated successfully',
      averageRating: newAverageRating,
      numberOfRatings: product.numberOfRatings
    };
  };


  export const highestRatingProductsService = async () => {
    // These constants can be adjusted based on your overall data.
    const globalAverageRating = 4.0;
    const minVotesThreshold = 5;
  
    const topRatings = await Product.aggregate([
      { 
        $match: { 
          averageRating: { $gte: 4, $lte: 5 },
          numberOfRatings: { $gt: 5 }
        }
      },
      {
        $addFields: {
          weightedRating: {
            $divide: [
              {
                $add: [
                  { $multiply: [ "$averageRating", { $ifNull: [ "$numberOfRatings", 0 ] } ] },
                  { $multiply: [ globalAverageRating, minVotesThreshold ] }
                ]
              },
              { $add: [ { $ifNull: [ "$numberOfRatings", 0 ] }, minVotesThreshold ] }
            ]
          }
        }
      },
      { $sort: { weightedRating: -1 } },
      { $limit: 10 }
    ]);
  
    return topRatings;
  };

  export const getFeaturedProductsService = async () => {
    let featuredProducts = await redis.get("featured_products");
    if (featuredProducts) {
      return JSON.parse(featuredProducts);
    }
    featuredProducts = await Product.find({ isFeatured: true }).lean();
    if (!featuredProducts) {
      throw new Error("No featured products found");
    }
    // Cache the result for faster access next time
    await redis.set("featured_products", JSON.stringify(featuredProducts), 'EX', '3600');
    return featuredProducts;
  };
