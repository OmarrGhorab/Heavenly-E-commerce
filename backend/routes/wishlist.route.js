import express from 'express'
import { protectRoute } from '../middleware/auth.middleware.js';
import { addFavouriteItems, deleteFavouriteItems, getFavouriteItems } from '../controllers/wishlist.controller.js';

const router = express.Router();

router.get('/', protectRoute, getFavouriteItems);
router.post('/', protectRoute, addFavouriteItems);
router.delete('/:productId', protectRoute, deleteFavouriteItems);
export default router;