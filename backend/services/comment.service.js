import Comment from '../models/comment.model.js';
import Product from '../models/product.model.js';
import Order from '../models/order.model.js';
import User from '../models/user.model.js';

export const addCommentService = async (productId, userId, content) => {
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    throw new Error('Content is required and cannot be empty.');
  }

  const existingComment = await Comment.findOne({ product: productId, user: userId });
  if (existingComment) {
    throw new Error('You have already commented on this product. Please edit your existing comment instead.');
  }

  const order = await Order.findOne({
    user: userId,
    "products.product": productId,
    shippingStatus: "Delivered",
  });
  if (!order) {
    throw new Error('You must purchase this product before commenting.');
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new Error('Product not found.');
  }

  const comment = await Comment.create({
    user: userId,
    content,
    product: productId,
  });

  product.comments.push(comment._id);
  await product.save();
  await User.findByIdAndUpdate(userId, { $push: { comments: comment._id } });

  return await Comment.findById(comment._id).populate('user', 'username photo');
};

export const getCommentService = async (productId, query) => {
  const { page = 1, limit = 10 } = query;
  const pageNumber = Math.max(1, parseInt(page));
  const pageLimit = Math.max(1, parseInt(limit));

  const product = await Product.findById(productId)
    .populate({
      path: 'comments',
      options: { skip: (pageNumber - 1) * pageLimit, limit: pageLimit },
      populate: { path: 'user', select: 'username photo' },
    })
    .populate({ path: 'ratings.user', select: 'username photo' });

  if (!product) throw new Error('Product not found');

  const totalComments = await Comment.countDocuments({ product: productId });

  return {
    product: {
      id: product._id,
      comments: product.comments,
      ratings: product.ratings,
    },
    page: pageNumber,
    limit: pageLimit,
    totalComments,
  };
};

export const editCommentService = async (productId, commentId, data, userId) => {
  const product = await Product.findById(productId);
  if (!product) throw new Error('Product not found');

  const comment = await Comment.findById(commentId);
  if (!comment) throw new Error('Comment not found');

  if (comment.user.toString() !== userId.toString()) {
    throw new Error('You are not authorized to edit this comment');
  }

  comment.content = data.content || comment.content;
  comment.rating = data.rating || comment.rating;
  await comment.save();

  // Optionally, recalculate product ratings here

  return comment;
};
