import express from "express";
import http from "http";
import dotenv from "dotenv";
import { connectDB } from "../backend/lib/db.js";
import { setupGlobalMiddlewares } from "../backend/config/middleware.js";
import { handleSocketConnection } from "../backend/socketHandler.js";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

// Import Routes
import authRoutes from "../backend/routes/auth.route.js";
import productRoutes from "../backend/routes/product.route.js";
import cartRoutes from "../backend/routes/cart.route.js";
import wishlistRoutes from "../backend/routes/wishlist.route.js";
import couponRoutes from "../backend/routes/coupon.route.js";
import paymentsRoutes from "../backend/routes/payments.route.js";
import analyticsRoutes from "../backend/routes/analytics.route.js";
import notificationRoute from "../backend/routes/notification.route.js";
import mongoose from "mongoose";
import { handleStripeWebhook } from "../backend/controllers/payments.controller.js";
import '../backend/tasks/schedule.js'
import cors from "cors";

dotenv.config();
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: [process.env.CLIENT_URL, 'http://localhost:5173'],
  credentials: true,
};
app.use(cors(corsOptions));

// Handle Stripe webhooks before body parsing middleware
app.use('/api/payments/stripe-webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Apply global middlewares (including CORS configuration)
setupGlobalMiddlewares(app);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoute);
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

app.get('/', (req, res) => {
  res.send('Hello World');
});

// global error handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  if (process.env.NODE_ENV === "production") {
    console.error(err); // Log error
  }
  res.status(statusCode).json({
    success: false,
    message: err.message || "Something went wrong",
    stack: process.env.NODE_ENV === "development" ? err.stack : null,
  });
});

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL, 'http://localhost:5173'],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

const userSockets = new Map();
io.on("connection", (socket) => {
  handleSocketConnection(socket, io, userSockets);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendPath = path.join(__dirname, "../frontend/dist");

// Serve static files with explicit MIME types
app.use(express.static(frontendPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Connect to DB and Start Server
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Worker ${process.pid} running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to DB", error);
    process.exit(1);
  });

process.on("SIGINT", async () => {
  console.log("Shutting down...");
  try {
    await mongoose.connection.close();
    io.close(); // Close WebSocket connections
    server.close(() => {
      console.log("Server closed.");
      process.exit(0);
    });
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
});
  
export { io, userSockets };
export default app;