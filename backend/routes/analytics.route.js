import express from 'express';
import { adminRoute, protectRoute } from '../middleware/auth.middleware.js';
import {
  getAnalyticsData,
  getDailySalesData,
  getAllOrders,
  updateStatus,
} from '../controllers/analytics.controller.js';

const router = express.Router();

router.get(
  "/",
  protectRoute,
  adminRoute,
  async (req, res) => {
    try {
      const startDate = new Date(req.query.startDate);
      const endDate = new Date(req.query.endDate);
      const analyticsData = await getAnalyticsData();
      const dailySalesData = await getDailySalesData(startDate, endDate);
      res.json({ analyticsData, dailySalesData });
    } catch (error) {
      console.error("Error in analytics route:", error.message);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);


router.get("/all-orders", protectRoute, adminRoute, getAllOrders);

router.patch("/all-orders/:orderId/status", protectRoute, adminRoute, updateStatus);

export default router;
