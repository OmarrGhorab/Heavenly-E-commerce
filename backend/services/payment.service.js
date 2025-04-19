import { stripe } from '../lib/stripe.js';
import { v4 as uuidv4 } from 'uuid';
import Coupon from '../models/coupon.model.js';
import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';
import { emailService } from './email.service.js';
import { redis } from '../lib/redis.js';
import { io } from '../server.js';
import * as Sentry from '@sentry/node';
import crypto from 'crypto';
import Notification from '../models/notification.model.js';

export const handleStripeWebhookService = async (body, headers) => {
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "checkout.session.completed") {
      await handleSuccessfulPaymentService(event.data.object);
    }
  } catch (error) {
    console.error("Webhook service error:", error.message);
    if (process.env.SENTRY_DSN && typeof Sentry.captureException === "function") {
      Sentry.captureException(error);
    }
    throw error;
  }
};

export const handleSuccessfulPaymentService = async (stripeSession) => {
  if (
    !stripeSession.metadata ||
    typeof stripeSession.metadata !== "object" ||
    !stripeSession.metadata.userId ||
    !stripeSession.metadata.shippingDetails
  ) {
    throw new Error("Invalid or incomplete metadata");
  }

  const { userId, shippingDetails, couponCode } = stripeSession.metadata;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error(`Invalid user ID format: ${userId}`);
  }

  // Validate user existence
  const user = await User.findById(userId).populate("cartItems.product");
  if (!user || user.cartItems.length === 0) {
    throw new Error(`User not found or cart is empty: ${userId}`);
  }

  // Sanitize metadata JSON
  const shippingInfo = JSON.parse(shippingDetails);
  const currency = stripeSession.currency?.toUpperCase() || "USD";

  // Retrieve full Stripe session with expanded fields
  const fullSession = await stripe.checkout.sessions.retrieve(stripeSession.id, {
    expand: ['payment_intent', 'payment_intent.latest_charge']
  });

  const paymentIntentId = fullSession.payment_intent?.id || null;
  const receiptUrl = fullSession.payment_intent?.latest_charge?.receipt_url || null;
  const customerEmail = fullSession.customer_email;

  // Start transaction for atomic operations
  const mongoSession = await mongoose.startSession();
  let newOrder;
  
  try {
    await mongoSession.startTransaction();

    // Check for duplicate order
    const existingOrder = await Order.findOne({ stripeSessionId: stripeSession.id }).session(mongoSession);
    if (existingOrder) {
      await mongoSession.commitTransaction();
      return;
    }

    // Prepare atomic stock updates
    const bulkOps = user.cartItems.map(item => ({
      updateOne: {
        filter: { 
          _id: item.product._id,
          stock: { $gte: item.quantity }
        },
        update: { $inc: { stock: -item.quantity } }
      }
    }));

    const bulkResult = await Product.bulkWrite(bulkOps, { session: mongoSession, ordered: false });

    if (bulkResult.modifiedCount !== user.cartItems.length) {
      throw new Error("Some products failed to update stock");
    }

    // Create the order
    newOrder = new Order({
      user: userId,
      products: user.cartItems.map(item => ({
        product: item.product._id,
        title: item.product.title,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        price: item.product.price
      })),
      shippingDetails: shippingInfo,
      totalAmount: Math.round(stripeSession.amount_total),
      currency,
      paymentStatus: "paid",
      shippingStatus: "Pending",
      stripeSessionId: stripeSession.id,
      receiptUrl,
      email: customerEmail,
      paymentIntentId,
      couponCode: couponCode || "none",
    });
    await user.orders.push(newOrder._id);
    await newOrder.save({ session: mongoSession });

    // Clear the cart after successful order placement
    user.cartItems = [];
    await user.save({ session: mongoSession });
    await emailService.sendOrderConfirmationEmail(newOrder.email, newOrder._id, newOrder.receiptUrl);

    // Commit transaction
    await mongoSession.commitTransaction();
  } catch (error) {
    await mongoSession.abortTransaction();
    throw error;
  } finally {
    mongoSession.endSession();
  }

  // Deactivate coupon if used
  if (couponCode && couponCode !== "none") {
    await Coupon.updateOne({ code: couponCode, userId }, { $set: { isActive: false } });
  }

  // Send notifications
  await sendNotification({
    recipientId: "admin",
    orderId: newOrder._id,
    newStatus: "New Order",
    message: `New order placed by user ${userId}.`,
    extra: { totalAmount: newOrder.totalAmount, currency: newOrder.currency }
  });

  await sendNotification({
    recipientId: userId,
    orderId: newOrder._id,
    newStatus: "Order Placed",
    message: "Your order has been successfully placed and is being processed.",
    extra: { totalAmount: newOrder.totalAmount, currency: newOrder.currency }
  });
};

  

export const createCheckoutSessionService = async (user, body) => {
  const { products, shippingDetails, coupon } = body;

  if (!Array.isArray(products) || products.length === 0) {
    throw new Error("PRODUCTS_REQUIRED");
  }

  // Validate shipping details...
  const requiredFields = ["name", "phone", "address"];
  const missingFields = requiredFields.filter(field => !shippingDetails?.[field]);
  if (missingFields.length > 0) {
    throw new Error(`Missing shipping fields: ${missingFields.join(", ")}`);
  }

  // Fetch products, build line items, and calculate total amount
  const productIds = products.map(p => new mongoose.Types.ObjectId(p.id));
  const dbProducts = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map();
  dbProducts.forEach(p => productMap.set(p._id.toString(), p));

  const lineItems = [];
  let totalAmount = 0;
  products.forEach(product => {
    const dbProduct = productMap.get(product.id);
    if (!dbProduct) throw new Error(`Product not found: ${product.id}`);
    const price = dbProduct.isSale ? dbProduct.discountedPrice : dbProduct.price;
    const amount = Math.round(price * 100);
    totalAmount += amount * product.quantity;
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: { name: dbProduct.title, images: dbProduct.images?.slice(0, 1) || [] },
        unit_amount: amount,
      },
      quantity: product.quantity,
    });
  });

  // Handle coupon if provided
  let stripeCouponId = null;
  if (coupon) {
    const foundCoupon = await Coupon.findOne({
      code: coupon,
      userId: user._id,
      isActive: true,
      expirationDate: { $gt: new Date() },
    });
    if (!foundCoupon || foundCoupon.discountPercentage < 1 || foundCoupon.discountPercentage > 100) {
      throw new Error("INVALID_COUPON");
    }
    stripeCouponId = await createStripeCoupon(foundCoupon.discountPercentage);
  }

  // Create metadata with product info and shipping details
  // const metadataProducts = products.map(product => {
  //   return { id: product.id, quantity: product.quantity, color: product.color, size: product.size, title: product.title };
  // });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: lineItems,
    success_url: `${process.env.CLIENT_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/cart`,
    customer_email: user.email,
    discounts: stripeCouponId ? [{ coupon: stripeCouponId }] : [],
    metadata: {
      userId: user._id.toString(),
      shippingDetails: JSON.stringify(shippingDetails),
      // products: JSON.stringify(metadataProducts),
      couponCode: coupon || 'none'
    },
    payment_intent_data: {
      metadata: {
        idempotency_key: uuidv4()
      }
    },
  });

  // Optionally, if totalAmount exceeds a threshold, generate a new coupon for the user.
  if (totalAmount > 20000) {
    await createNewCoupon(user._id);
  }

  return session;
};

// Helper functions for coupon creation
async function createStripeCoupon(discountPercentage) {
  try {
    const coupon = await stripe.coupons.create({
      percent_off: discountPercentage,
      duration: 'once',
    });
    return coupon.id;
  } catch (error) {
    console.error('Error creating Stripe coupon:', error.message);
    throw new Error('Failed to create Stripe coupon');
  }
}

async function createNewCoupon(userId) {
  const couponCode = "GIFT" + crypto.randomBytes(3).toString('hex').toUpperCase();
  const newCoupon = new Coupon({
    code: couponCode,
    discountPercentage: 10,
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    userId: userId
  });
  await newCoupon.save();
  return newCoupon;
}

export async function sendNotification({ 
  recipientId, 
  orderId, 
  newStatus, 
  message, 
  extra = {}, 
  cacheKeyPrefix = "missedNotifications" 
}) {
  // Save the notification to the database
  const savedNotification = await new Notification({
    userId: recipientId.toString(),
    orderId,
    message,
    newStatus,
    ...extra,
    read: false,
  }).save();

  // Build the payload with auto-generated fields like createdAt
  const payload = {
    id: savedNotification._id,
    createdAt: savedNotification.createdAt,
    orderId,
    newStatus,
    message,
    ...extra,
  };

  // Handle real-time notifications via sockets
  const recipientRoom = io.sockets.adapter.rooms.get(recipientId);
  if (recipientRoom && recipientRoom.size > 0) {
    io.to(recipientId).emit("orderStatusUpdated", payload);
  } else if (redis.status === "ready") {
    const redisKey = `${cacheKeyPrefix}:${recipientId}`;
    await redis.rpush(redisKey, JSON.stringify(payload));
    await redis.expire(redisKey, 86400); // Expire after 24 hours
  }

  return payload;
}
