import express from "express";
import { checkout, getOrders, getAllOrders, updateOrderStatus, deleteOrder, getOrderItems, getOrderDetails, createPayment, handlePaymentWebhook, cancelOrder, refundOrder } from "../controllers/orderController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Checkout = simpan pesanan + kosongkan cart
router.post("/checkout", authMiddleware, checkout);

// Lihat semua order milik user
router.get("/", authMiddleware, getOrders);

// Get order details with items
router.get("/details/:orderId", authMiddleware, getOrderDetails);

// Payment routes
router.post("/create-payment", authMiddleware, createPayment);
router.post("/payment-webhook", handlePaymentWebhook); // No auth needed for webhook

// Admin routes
router.get("/admin/all", authMiddleware, getAllOrders);
router.get("/admin/:orderId/items", authMiddleware, getOrderItems);
router.put("/admin/:id/status", authMiddleware, updateOrderStatus);
router.delete("/admin/:id", authMiddleware, deleteOrder);
router.post("/admin/:id/refund", authMiddleware, refundOrder); // Admin-triggered refund
router.patch("/admin/:id/cancel", authMiddleware, cancelOrder); // Admin cancel order and restore stock

// Customer cancel order
router.patch("/:id/cancel", authMiddleware, cancelOrder);

export default router;