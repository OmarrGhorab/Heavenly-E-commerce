import {
  createCheckoutSessionService,
  handleStripeWebhookService,
} from '../services/payment.service.js';
import {
  cancelOrderService,
  refundOrderService,
  approveRefundService,
  processRefundService,
  getUserOrdersService,
} from '../services/order.service.js';

export const createCheckoutSession = async (req, res, next) => {
  try {
    const session = await createCheckoutSessionService(req.user, req.body);
    res.json({ sessionId: session.id });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const order = await cancelOrderService(req.params.orderId, req.user._id);
    res.status(200).json({ message: "Order cancelled successfully", order });
  } catch (error) {
    next(error);
  }
};

export const refundOrder = async (req, res, next) => {
  try {
    const order = await refundOrderService(req.params.orderId, req.user._id);
    res.status(200).json({ message: "Refund request submitted successfully", order });
  } catch (error) {
    next(error);
  }
};

export const approveRefund = async (req, res, next) => {
  try {
    const { decision } = req.body;
    const order = await approveRefundService(req.params.orderId, decision);
    res.status(200).json({ message: `Refund request ${decision} successfully`, order });
  } catch (error) {
    next(error);
  }
};

export const processRefund = async (req, res, next) => {
  try {
    const result = await processRefundService(req.params.orderId);
    res.json({ message: "Refund processed successfully", refund: result.refund });
  } catch (error) {
    next(error);
  }
};

export const getUserOrders = async (req, res, next) => {
  try {
    const ordersData = await getUserOrdersService(req.user._id, req.query);
    res.status(200).json(ordersData);
  } catch (error) {
    next(error);
  }
};

export const handleStripeWebhook = async (req, res, next) => {
  try {
    await handleStripeWebhookService(req.body, req.headers);
    res.status(200).end();
  } catch (error) {
    next(error);
  }
};
