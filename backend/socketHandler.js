import { redis } from "./lib/redis.js";
import Notification from "./models/notification.model.js";

export const handleSocketConnection = async (socket, io, userSockets) => {
  const { userId, isAdmin } = socket.handshake.query;
  const recipientId = userId.toString();
  const isAdminFlag = isAdmin === "true";
  const cacheKeyPrefix = "missedNotifications";

  if (isAdminFlag) {
    socket.join("admin");
    console.log(`Admin connected: ${recipientId}`);

    // Fetch and send missed admin notifications from Redis
    const redisKey = `${cacheKeyPrefix}:admin`;
    redis.lrange(redisKey, 0, -1)
      .then((missedNotifications) => {
        if (missedNotifications.length > 0) {
          missedNotifications.forEach((notification) => {
            io.to("admin").emit("newOrder", JSON.parse(notification));
          });
          return redis.del(redisKey);
        }
      })
      .catch(console.error);
  } else {
    socket.join(recipientId);
    userSockets.set(recipientId, socket.id);
    console.log(`User connected: ${recipientId}`);

    // Fetch and send missed notifications for this user from Redis
    const redisKey = `${cacheKeyPrefix}:${recipientId}`;
    console.log(redisKey)
    redis.lrange(redisKey, 0, -1)
      .then((missedNotifications) => {
        console.log(missedNotifications)
        if (missedNotifications.length > 0) {
          missedNotifications.forEach((notification) => {
            io.to(recipientId).emit("orderStatusUpdated", JSON.parse(notification));
          });
          return redis.del(redisKey);
        }
      })
      .catch(console.error);
  }

  socket.on("orderStatusUpdated", async (data) => {
    const { userId: targetUserId, orderId, newStatus, message } = data;
    const payload = { orderId, message, newStatus };
    const redisKey = `${cacheKeyPrefix}:${targetUserId}`;

    try {
      const notification = new Notification({
        userId: targetUserId.toString(),
        orderId,
        message,
        newStatus,
        read: false,
      });
      await notification.save();

      const recipientRoom = io.sockets.adapter.rooms.get(targetUserId);
      if (recipientRoom && recipientRoom.size > 0) {
        io.to(targetUserId).emit("orderStatusUpdated", payload);
      } else if (redis.status === "ready") {
        await redis.rpush(redisKey, JSON.stringify(payload));
        await redis.expire(redisKey, 86400);
        console.log(`User ${targetUserId} not connected, storing missed notification`);
      }
    } catch (err) {
      console.error("Error in orderStatusUpdated event:", err);
    }
  });

  socket.on("newOrder", async (newOrder) => {
    console.log("newOrder event triggered with data:", newOrder);
    const payload = {
      orderId: newOrder._id,
      message: `A new order has been placed by user ${recipientId}.`,
    };
    const redisKey = `${cacheKeyPrefix}:admin`;

    try {
      const notification = new Notification({
        userId: "admin",
        orderId: newOrder._id,
        message: payload.message,
        read: false,
      });
      await notification.save();

      const adminRoom = io.sockets.adapter.rooms.get("admin");
      if (adminRoom && adminRoom.size > 0) {
        io.to("admin").emit("newOrder", payload);
      } else if (redis.status === "ready") {
        await redis.rpush(redisKey, JSON.stringify(payload));
        await redis.expire(redisKey, 86400);
        console.log("Admin not connected, storing missed notification");
      }
    } catch (err) {
      console.error("Error in newOrder event:", err);
    }
  });

  socket.on("disconnect", () => {
    if (isAdminFlag) {
      console.log(`Admin disconnected: ${recipientId}`);
    } else {
      console.log(`User disconnected: ${recipientId}`);
      userSockets.delete(recipientId);
    }
  });
};
