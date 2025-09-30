import express from "express";
import {
    createReview,
    getProductReviews,
    getUserReviews,
    canUserReviewProduct,
    getProductRatingSummary,
    updateAllProductRatings
} from "../controllers/reviewController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a new review (authenticated customers only)
router.post("/", authMiddleware, createReview);

// Get reviews for a specific product (public)
router.get("/product/:productId", getProductReviews);

// Get user's reviews (authenticated)
router.get("/user", authMiddleware, getUserReviews);

// Check if user can review a product (authenticated)
router.get("/can-review/:productId", authMiddleware, canUserReviewProduct);

// Get product rating summary (public)
router.get("/summary/:productId", getProductRatingSummary);

// Update all product ratings (admin only)
router.post("/admin/update-all", authMiddleware, updateAllProductRatings);

export default router;
