import express from "express";
import { fetchAllProducts, addProduct, editProduct, removeProduct, fetchProductById, uploadProductImage, validateAllProductImages, getLowStockProducts, updateProductStock } from "../controllers/productController.js";
import { memoryUpload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// GET all products
router.get("/", fetchAllProducts);

// Validate all product images
router.get("/validate-images", validateAllProductImages);

// Get low stock products for admin alerts
router.get("/low-stock", getLowStockProducts);

// Upload product image with multer error handling
router.post(
  "/upload-image",
  (req, res, next) => {
    // Use memoryUpload.single but capture multer errors
    const uploader = memoryUpload.single('image');
    uploader(req, res, function (err) {
      if (err) {
        console.error('Multer upload error:', err);
        // Multer errors have .code (e.g., 'LIMIT_FILE_SIZE')
        const status = err.code === 'LIMIT_FILE_SIZE' ? 400 : 400;
        return res.status(status).json({ message: err.message, code: err.code || 'MULTER_ERROR' });
      }
      next();
    });
  },
  uploadProductImage
);

// GET produk by id
router.get("/:id", fetchProductById);

// POST new product
router.post("/", addProduct);

// PUT update product by id
router.put("/:id", editProduct);

// PUT update product stock
router.put("/:id/stock", updateProductStock);

// DELETE product by id
router.delete("/:id", removeProduct);

export default router;
