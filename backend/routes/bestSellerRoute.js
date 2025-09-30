import express from "express";
import {
    getBestSellers,
    getBestSellersByCategory,
    getTrendingProducts,
    calculateBestSellers,
    getBestSellersInfo,
    triggerBestSellersUpdate
} from "../controllers/bestSellerController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get best sellers for homepage (public)
router.get("/", getBestSellers);

// Get best sellers by category (public)
router.get("/category/:categoryId", getBestSellersByCategory);

// Get trending products (public)
router.get("/trending", getTrendingProducts);

// Get best sellers calculation info (public)
router.get("/info", getBestSellersInfo);

// Calculate best sellers (admin only)
router.post("/admin/calculate", authMiddleware, calculateBestSellers);

// Manual trigger for best sellers update (public for testing)
router.post("/trigger-update", triggerBestSellersUpdate);

export default router;
