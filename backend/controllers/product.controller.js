import {
    getAllProductsService,
    getProductByIdService,
    createProductService,
    editProductService,
    deleteProductService,
    toggleFeaturedProductService,
    recommendedProductService,
    searchAndFilterProductsService,
    rateProductService,
    highestRatingProductsService,
    getFeaturedProductsService
  } from '../services/product.service.js';
  import {
    addCommentService,
    getCommentService,
    editCommentService,
  } from '../services/comment.service.js';
  
  export const getAllProducts = async (req, res, next) => {
    try {
      const products = await getAllProductsService();
      res.status(200).json({ products });
    } catch (error) {
      next(error);
    }
  };
  
  export const getProductById = async (req, res, next) => {
    try {
      const product = await getProductByIdService(req.params.id);
      res.status(200).json({ message: 'Product fetched successfully', product });
    } catch (error) {
      next(error);
    }
  };

  export const getFeaturedProducts = async (req, res, next) => {
    try {
      const featuredProducts = await getFeaturedProductsService();
      res.status(200).json(featuredProducts);
    } catch (error) {
      next(error);
    }
  };
  
  export const createProduct = async (req, res, next) => {
    try {
      const product = await createProductService(req.body, req.body.images);
      res.status(201).json({
        message: 'Product created successfully',
        product: { ...product.toObject(), discountedPrice: product.discountedPrice },
      });
    } catch (error) {
      next(error);
    }
  };
  
  export const editProduct = async (req, res, next) => {
    try {
      const product = await editProductService(req.params.productId, req.body, req.user);
      res.status(200).json({
        message: 'Product updated successfully',
        product: { ...product.toObject(), discountedPrice: product.discountedPrice },
      });
    } catch (error) {
      next(error);
    }
  };
  
  export const deleteProduct = async (req, res, next) => {
    try {
      await deleteProductService(req.params.id);
      res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
  
  export const toggleFeaturedProduct = async (req, res, next) => {
    try {
      const product = await toggleFeaturedProductService(req.params.id);
      res.json(product);
    } catch (error) {
      next(error);
    }
  };
  
  export const recommendedProduct = async (req, res, next) => {
    try {
      const products = await recommendedProductService();
      res.status(200).json(products);
    } catch (error) {
      next(error);
    }
  };
  
  export const searchAndFilterProducts = async (req, res, next) => {
    try {
      const result = await searchAndFilterProductsService(req.query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
  
  export const rateProduct = async (req, res, next) => {
    try {
      const result = await rateProductService(req.params.productId, req.body.rating, req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
  
  export const highestRatingProducts = async (req, res, next) => {
    try {
      const topProducts = await highestRatingProductsService();
      res.status(200).json(topProducts);
    } catch (error) {
      next(error);
    }
  };
  
  // Comment-related endpoints
  export const addComment = async (req, res, next) => {
    try {
      const comment = await addCommentService(req.params.productId, req.user._id, req.body.content);
      res.status(201).json({ message: 'Comment added successfully', comment });
    } catch (error) {
      next(error);
    }
  };
  
  export const getComment = async (req, res, next) => {
    try {
      const result = await getCommentService(req.params.productId, req.query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
  
  export const editComment = async (req, res, next) => {
    try {
      const comment = await editCommentService(req.params.productId, req.params.commentId, req.body, req.user._id);
      res.status(200).json({ message: 'Comment edited successfully', comment });
    } catch (error) {
      next(error);
    }
  };
  