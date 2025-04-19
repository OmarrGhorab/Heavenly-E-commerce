import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import { emailService } from '../services/email.service.js';
import { sendNotification } from "../services/payment.service.js";

function getDatesInRange(startDate, endDate) {
  const dates = [];
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
}

export const getAnalyticsData = async () => {
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();

  const salesData = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalSales: { $sum: 1 },
        totalRevenue: { $sum: "$totalAmount" },
      },
    },
  ]);
  const { totalSales, totalRevenue } = salesData[0] || { totalSales: 0, totalRevenue: 0 };

  return {
    users: totalUsers,
    products: totalProducts,
    totalSales,
    totalRevenue,
  };
};

export const getDailySalesData = async (startDate, endDate) => {
  try {
    const dailySalesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sales: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const dateArray = getDatesInRange(startDate, endDate);

    return dateArray.map((date) => {
      const foundData = dailySalesData.find((item) => item._id === date);
      return {
        date,
        sales: foundData ? foundData.sales : 0,
        revenue: foundData ? foundData.revenue : 0,
      };
    });
  } catch (error) {
    throw error;
  }
};

export const getAllOrders = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied - Only admins can view orders" });
    }
    const { page = 1, limit = 10, search = "" } = req.query;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const query = {};
    if (search) {
      query.$expr = {
        $regexMatch: {
          input: { $toString: "$_id" },
          regex: search,
          options: "i",
        },
      };
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate("user", "_id username email")
      .populate({ path: "products.product", select: "title price images" })
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .lean();

    const formattedOrders = orders.map((order) => ({
      ...order,
      products: order.products.map((p) => ({
        productId: p.product ? p.product._id : null,
        title: p.product ? p.product.title : "Unknown Product",
        color: p.color,
        size: p.size,
        quantity: p.quantity,
        image: p.product && p.product.images ? p.product.images[0] : "https://via.placeholder.com/150",
      })),
    }));

    return res.status(200).json({
      success: true,
      orders: formattedOrders,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateStatus = async (req, res) => {
  const { orderId } = req.params;
  const { newStatus } = req.body;
  try {
    const validStatuses = ["Pending", "Shipped", "Delivered", "Cancelled", "Refunded"];
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { shippingStatus: newStatus },
      { new: true }
    ).populate("user");

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    const userId = updatedOrder.user._id.toString();

    // Send status update email
    await emailService.sendStatusUpdateEmail(updatedOrder.email, orderId, newStatus);

    // Use the generic notification function
    const notificationPayload = await sendNotification({
      recipientId: userId,
      orderId: updatedOrder._id,
      newStatus: updatedOrder.shippingStatus,
      message: `Your order status has been updated to ${newStatus}.`,
      extra: { timestamp: new Date().toISOString() },
      cacheKeyPrefix: "missedNotifications" // Optional; adjust if needed.
    });

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${newStatus}`,
      order: updatedOrder,
      notification: notificationPayload,
    });
  } catch (error) {
    console.error("Error updating order status:", error.message);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
