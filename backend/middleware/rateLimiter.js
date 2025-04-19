import rateLimit from 'express-rate-limit';
import RedisStore from "rate-limit-redis";
import { redis } from "../lib/redis.js";

export const authLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
  }),
  keyGenerator: (req) => req.body.email || req.ip,
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, 
  message: "Too many login/signup attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});