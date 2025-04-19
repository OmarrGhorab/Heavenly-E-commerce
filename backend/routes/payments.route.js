import express from 'express';
import { adminRoute, protectRoute } from '../middleware/auth.middleware.js';
import {  approveRefund, cancelOrder, createCheckoutSession, getUserOrders, processRefund, refundOrder } from '../controllers/payments.controller.js';
import Order from '../models/order.model.js';


const router = express.Router();

router.post('/create-checkout-session', protectRoute, createCheckoutSession);
router.get('/verify-order/:sessionId', protectRoute, async (req, res) => {
  try {
    const order = await Order.findOne({ 
      stripeSessionId: req.params.sessionId,
      paymentStatus: 'paid'
    }).populate({
      path: "products.product",
      select: "title price images",
    });

    if (!order) {
      return res.status(404).json({ valid: false });
    }
    
    res.json({
      valid: true,
      order: {
        id: order._id,
        amount: order.totalAmount,
        shippingStatus: order.shippingStatus,
        createdAt: order.createdAt,
        shippingDetails: order.shippingDetails || null,
        coupon: order.coupon || null,
        products: order.products.map(p => ({
          productId: p.product?._id,  
          title: p.product?.title || "Unknown Product",    
          color: p.color,
          size: p.size,
          image: p.image || p.product?.images?.[0], 
          quantity: p.quantity,
          price: p.product?.price || 0,  
          discountedPrice: p.discountedPrice ?? null
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


router.put('/cancel/:orderId', protectRoute, cancelOrder);
router.post('/request-refund/:orderId', protectRoute, refundOrder);
router.put('/approve-refund/:orderId', protectRoute, adminRoute, approveRefund);
router.post("/process-refund/:orderId", protectRoute, adminRoute, processRefund);
router.get('/get-user-orders', protectRoute, getUserOrders);

// router.post('/stripe-webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);
export default router;