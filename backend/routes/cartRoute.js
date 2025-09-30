import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getCart, addToCart, updateCartItem, removeFromCart } from "../controllers/cartController.js";

const router = express.Router();

router.get("/", authMiddleware, getCart);
router.post("/", authMiddleware, addToCart);
router.put("/", authMiddleware, updateCartItem);
router.delete("/", authMiddleware, removeFromCart);

export default router;
