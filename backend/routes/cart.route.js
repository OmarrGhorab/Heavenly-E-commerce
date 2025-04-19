import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getCartItems, addToCart, removeAllFromCart, updateQuantity } from '../controllers/cart.controller.js';

const router = express.Router();

router.get('/', protectRoute, getCartItems);
router.post("/", protectRoute, addToCart);
router.delete("/", protectRoute, removeAllFromCart);
router.patch("/:cartItemId", protectRoute, updateQuantity);

export default router;
