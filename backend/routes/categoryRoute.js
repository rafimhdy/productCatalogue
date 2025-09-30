import express from "express";
import {
    fetchCategories,
    fetchCategoryById,
    addCategory,
    editCategory,
    removeCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

// GET semua kategori
router.get("/", fetchCategories);

// GET kategori by id
router.get("/:id", fetchCategoryById);

// POST kategori baru
router.post("/", addCategory);

// PUT update kategori
router.put("/:id", editCategory);

// DELETE kategori
router.delete("/:id", removeCategory);

export default router;
