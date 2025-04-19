import Notification from "../models/notification.model.js";

export const markNotificationAsRead = async (req, res) => {
  const { id } = req.params;
    try {
      const notification = await Notification.findByIdAndUpdate(
        id, 
        { read: true },
        { new: true }  // Return the updated document
      );
      console.log(notification)
      res.json(notification);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update notification' });
    }
};

export const getUserNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const query =
      req.user.role === "admin"
        ? { userId: "admin" }
        : { userId: req.user._id.toString() };

    const totalNotifications = await Notification.countDocuments(query); 

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 }) 
      .skip((page - 1) * limit) 
      .limit(Number(limit)) 
      .lean();

    const transformedNotifications = notifications.map((notification) => ({
      ...notification,
      id: notification._id, 
    }));

    res.status(200).json({
      total: totalNotifications, 
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(totalNotifications / limit), 
      data: transformedNotifications, 
    });
  } catch (error) {
    console.error("Error fetching notifications:", error.message);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};


export const createNotification = async (req, res) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Unauthenticated" });
  
    const { orderId, message, newStatus } = req.body;
    if (!orderId || !message) { 
      return res.status(400).json({ error: "orderId and message are required" });
    }
  
    try {
      const newNotification = new Notification({
        userId: user._id,
        orderId,
        message,
        newStatus,
      });
      await newNotification.save();
      res.status(201).json(newNotification);
    } catch (error) {
      res.status(500).json({ error: "Failed to create notification" });
    }
};

export const markAllAsRead = async (req, res) => {
  try {
    const { _id, role } = req.user;

    // Define filter based on user role
    const filter = role === "admin" ? { userId: "admin" } : { userId: _id.toString() };

    // Update unread notifications
    const updateResult = await Notification.updateMany(filter, { $set: { read: true } });

    return res.status(200).json({
      message: "All notifications marked as read",
      modifiedCount: updateResult.modifiedCount,
      matchedCount: updateResult.matchedCount
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to mark notifications as read",
      error: error.message
    });
  }
};
