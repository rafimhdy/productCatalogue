import express from "express";
import {
  loginCustomer,
  registerCustomer,
  getAllCustomers,
  deleteCustomer,
  testAdminConnection,
  verifyEmail,
  createCustomer,
  updateCustomer,
  getCustomerProfile,
  updateCustomerProfile,
  changeCustomerPassword,
  getCustomerLoginHistory,
} from "../controllers/customerController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", loginCustomer);
router.post("/register", registerCustomer);
router.get("/verify-email", verifyEmail);

// Dashboard routes for authenticated customers
router.get("/profile", authMiddleware, getCustomerProfile);
router.put("/profile", authMiddleware, updateCustomerProfile);
router.put("/change-password", authMiddleware, changeCustomerPassword);

// Test endpoint (no auth required for debugging)
router.get("/admin/test", testAdminConnection);

// Admin routes (add auth middleware for debugging)
router.get("/admin/all", authMiddleware, getAllCustomers);
router.delete("/admin/:id", authMiddleware, deleteCustomer);
router.post("/admin", authMiddleware, createCustomer);
router.put("/admin/:id", authMiddleware, updateCustomer);
router.get("/admin/:id/login-history", authMiddleware, getCustomerLoginHistory);

export default router;
