import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
    getAllAdmins,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    getAdminProfile,
    getAdminById,
    loginAdmin
} from "../controllers/adminController.js";

const router = express.Router();

// Public routes
router.post("/login", loginAdmin);

// Protected routes - require authentication
router.use(authMiddleware);

// Admin CRUD operations
router.get("/all", getAllAdmins);
router.post("/create", createAdmin);
router.get("/:id", getAdminById);
router.put("/:id", updateAdmin);
router.delete("/:id", deleteAdmin);
router.get("/profile", getAdminProfile);

export default router;
