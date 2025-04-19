import Order from '../models/order.model.js';
import { emailService } from './email.service.js';
import { stripe } from '../lib/stripe.js';
import { sendNotification } from './payment.service.js';

// Cancel an order (if it is still pending)
export const cancelOrderService = async (orderId, userId) => {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) throw new Error("Order not found");
  if (order.shippingStatus !== "Pending") throw new Error("Order cannot be cancelled at this stage");
  
  order.shippingStatus = "Cancelled";
  await order.save();
  await emailService.sendCancellationConfirmationEmail(order.email, order._id);
  
  // Send notifications to user and admin (call a notification helper if available)
  await sendNotification({
    recipientId: "admin",
    orderId: order._id,
    newStatus: order.shippingStatus, // e.g., "Cancelled"
    message: `User cancelled order #${order._id.toString().slice(0, 8)}.`
  });

  await sendNotification({
    recipientId: order.user.toString(),
    orderId: order._id,
    newStatus: order.shippingStatus,
    message: "Your order has been cancelled."
  });

  const cancelFee = Math.round(order.totalAmount * 0.05);
  const totalRefund = order.totalAmount - cancelFee;
  const refund = await stripe.refunds.create({
    payment_intent: order.paymentIntentId,
    amount: totalRefund,
  });

  order.refundDetails.refunded = true;
  order.refundDetails.refundAmount = totalRefund;
  order.refundDetails.cancellationFee = cancelFee;
  order.shippingStatus = "Cancelled";
  await order.save();

  await emailService.sendRefundUpdateEmail(order.email, order._id, totalRefund / 100);
  await sendNotification({
    recipientId: order.user._id.toString(),
    orderId: order._id,
    newStatus: order.shippingStatus, // e.g., "Refunded"
    message: `Order Cancelled successfully. A 5% fee of $${refundedFee} was applied, so your refund amount is $${totalRefund}.`
  });
  
  return { order, refund };
};

// Request a refund for a delivered order
export const refundOrderService = async (orderId, userId) => {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order || order.shippingStatus !== "Delivered") throw new Error("Refund request is only available for delivered orders");
  if (order.refundDetails.adminRefundApproval !== "Pending" && order.refundDetails.adminRefundApproval !== null) {
    throw new Error("Refund request has already been processed");
  }
  
  order.refundDetails.adminRefundApproval = "Pending";
  await order.save();
  
  await sendNotification({
    recipientId: "admin",
    orderId: order._id,
    newStatus: "Refund Requested",
    message: `User ${order.user} requested a refund for order #${order._id.toString().slice(0, 8)}`
  });
  return order;
};

// Approve or reject a refund request (admin only)
export const approveRefundService = async (orderId, decision) => {
  if (!["Approved", "Rejected"].includes(decision)) throw new Error("Invalid action");
  
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");
  if (order.refundDetails.adminRefundApproval !== "Pending") throw new Error("Refund request has already been processed");
  
  order.refundDetails.adminRefundApproval = decision;
  if (decision === "Approved") {
    order.shippingStatus = "Refunded";
  }
  await order.save();
  
    // For user:
    await sendNotification({
        recipientId: order.user.toString(),
        orderId: order._id,
        newStatus: order.shippingStatus,
        message: `Your refund request has been ${decision.toLowerCase()}.`,
        extra: { refundApproval: decision }
    });
  
     // For admin:
    await sendNotification({
        recipientId: "admin",
        orderId: order._id,
        newStatus: order.shippingStatus,
        message: `Refund request for order #${order._id.toString().slice(0, 8)} has been ${decision.toLowerCase()}.`,
        extra: { refundApproval: decision },
        cacheKeyPrefix: "missedAdminNotifications:" // Use a different Redis key if needed
    });
  return order;
};

// Process a refund (admin only)
export const processRefundService = async (orderId) => {
  const order = await Order.findById(orderId).populate("user");
  if (!order) throw new Error("Order not found");
  if (order.refundDetails.adminRefundApproval !== "Approved") throw new Error("Refund is not approved yet");
  if (order.refundDetails.refunded) throw new Error("Order has already been refunded");
  if (!order.paymentIntentId) throw new Error("No payment transaction found for this order");

  const refundedFee = Math.round(order.totalAmount * 0.10);
  const totalRefund = order.totalAmount - refundedFee;
  const refund = await stripe.refunds.create({
    payment_intent: order.paymentIntentId,
    amount: totalRefund,
  });

  order.refundDetails.refunded = true;
  order.refundDetails.refundAmount = totalRefund;
  order.refundDetails.refundFee = refundedFee;
  order.shippingStatus = "Refunded";
  await order.save();
  
  await emailService.sendRefundUpdateEmail(order.email, order._id, totalRefund / 100);
  await sendNotification({
    recipientId: order.user._id.toString(),
    orderId: order._id,
    newStatus: order.shippingStatus, // e.g., "Refunded"
    message: `Refund processed successfully. A 10% fee of $${refundedFee} was applied, so your refund amount is $${totalRefund}.`
  });
  
  return { order, refund };
};

// Get orders for a user with pagination
export const getUserOrdersService = async (userId, query) => {
  const { page = 1, limit = 10 } = query;
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const totalOrders = await Order.countDocuments({ user: userId });
  const orders = await Order.find({ user: userId })
    .populate({ path: "products.product", select: "title price images" })
    .sort({ createdAt: -1 })
    .skip((pageNumber - 1) * limitNumber)
    .limit(limitNumber)
    .lean();
  
  if (!orders || orders.length === 0) throw new Error("No orders found for this user");
  
  const formattedOrders = orders.map(order => ({
    ...order,
    products: order.products.map(p => ({
      productId: p.product?._id,
      title: p.product?.title || "Unknown Product",
      color: p.color,
      size: p.size,
      quantity: p.quantity,
      image: p.product?.images?.[0] || "https://via.placeholder.com/150",
    })),
  }));
  
  return {
    orders: formattedOrders,
    pagination: {
      total: totalOrders,
      page: pageNumber,
      pages: Math.ceil(totalOrders / limitNumber),
    },
  };
};
