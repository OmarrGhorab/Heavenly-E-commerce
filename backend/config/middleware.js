import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";
import dotenv from "dotenv";

dotenv.config();

export const setupGlobalMiddlewares = (app) => {
  app.use(cookieParser());
  app.use(
    compression({
      level: 6, // Adjust compression level (0-9)
      threshold: 1024, // Only compress responses larger than 1KB
      filter: (req, res) => {
        if (req.headers["x-no-compression"]) {
          return false; // Skip compression if this header is present
        }
        return compression.filter(req, res);
      },
    })
  );
  app.use(express.json({ limit: "10mb" })); // Global JSON limit

  app.use(express.urlencoded({ extended: true }));  // Allows complex, nested objects in URL-encoded data. 
  app.use(mongoSanitize());

  // Security headers with Helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "https://js.stripe.com",
            "https://apis.google.com",
          ],
          styleSrc: [
            "'self'",
            "https://fonts.googleapis.com",
          ],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: [
            "'self'",
            "data:",
            "https://res.cloudinary.com",
            "https://*.stripe.com"
          ],
          connectSrc: [
            "'self'",
            "https://sweet-adventure-production.up.railway.app",
            "wss://sweet-adventure-production.up.railway.app",
            "https://checkout.stripe.com"
          ],
          frameSrc: [
            "'self'",
            "https://js.stripe.com",
            "https://hooks.stripe.com"
          ],
          objectSrc: ["'none'"],
          formAction: ["'self'"],
          upgradeInsecureRequests: [] // Add if using HTTPS
        }
      }
    })
  );

  // Rate limiter for general API requests
  const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 200, // Allow 500 requests per minute
    message: "Too many requests, slow down!",
    headers: true,
    keyGenerator: (req) => req.ip,
  });


  app.use("/api/", apiLimiter);
};