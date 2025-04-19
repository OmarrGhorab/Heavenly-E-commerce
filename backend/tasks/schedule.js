import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import cron from "node-cron";
console.log("Cron job script started...");
cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Checking for expired verification tokens and users...");

    // Step 1: Find all expired users from MongoDB (createdAt > 15 min ago)
    const expiredUsers = await User.find({
      isVerified: false,
      createdAt: { $lt: new Date(Date.now() - 15 * 60 * 1000) }, // 15 minutes ago
    });

    for (let user of expiredUsers) {
      console.log(`User ${user.email} expired. Deleting...`);

      // Delete the user from MongoDB
      await User.findByIdAndDelete(user._id);

      // Remove verification token from Redis (if it exists)
      await redis.del(`verify-email-token:${user.email}`);
      console.log(`Deleted verification token for ${user.email}`);

      // Remove refresh token from Redis
      await redis.del(`refresh-token:${user._id}`);
      console.log(`Deleted refresh token for ${user.email}`);
    }

    console.log("Expired users cleanup completed.");
  } catch (error) {
    console.error("Error during scheduled cleanup of verification tokens:", error);
  }
});
