import express from "express";
import { addToWishlist, removeFromWishlist, getWishlist, checkWishlistStatus } from "../controllers/wishlistController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Add to wishlist
router.post("/add", authMiddleware, addToWishlist);

// Remove from wishlist
router.delete("/remove/:productId", authMiddleware, removeFromWishlist);

// Get user's wishlist
router.get("/", authMiddleware, getWishlist);

// Check if product is in wishlist
router.get("/check/:productId", authMiddleware, checkWishlistStatus);

export default router;
