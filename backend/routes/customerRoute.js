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
import { sendVerificationEmail } from "../services/emailService.js";
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

// Test email endpoint
router.post("/test-email", async (req, res) => {
  try {
    const { to } = req.body;
    if (!to) {
      return res.status(400).json({ message: "Email 'to' is required" });
    }

    const result = await sendVerificationEmail(to, "test-token-123");
    res.json({
      message: "Email sent successfully",
      to,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("Test email failed:", error);
    res.status(500).json({
      message: "Failed to send test email",
      error: error.message,
    });
  }
});

// Admin routes (add auth middleware for debugging)
router.get("/admin/all", authMiddleware, getAllCustomers);
router.delete("/admin/:id", authMiddleware, deleteCustomer);
router.post("/admin", authMiddleware, createCustomer);
router.put("/admin/:id", authMiddleware, updateCustomer);
router.get("/admin/:id/login-history", authMiddleware, getCustomerLoginHistory);

export default router;
