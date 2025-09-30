import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
} from "../models/productModel.js";
import db from "../db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cloudinary from "cloudinary";
import streamifier from "streamifier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cloudinary config
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper: upload to Cloudinary
async function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const cld_upload_stream = cloudinary.v2.uploader.upload_stream(
      { folder: "products" },
      (error, result) => {
        if (result) {
          resolve(result.secure_url);
        } else {
          console.error("Cloudinary upload error:", error);
          reject(error);
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(cld_upload_stream);
  });
}

// GET /products
export const fetchAllProducts = (req, res) => {
  getAllProducts((err, results) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Gagal ambil produk", error: err });

    // Add stock status to each product
    const productsWithStockStatus = results.map((product) => ({
      ...product,
      stockStatus: getStockStatus(product.stock, product.low_stock_threshold),
      isLowStock: product.stock <= (product.low_stock_threshold || 5),
      isOutOfStock: product.stock <= 0,
    }));

    res.json(productsWithStockStatus);
  });
};

// GET /products/:id
export const fetchProductById = (req, res) => {
  const id = req.params.id;
  getProductById(id, (err, result) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Gagal ambil produk", error: err });
    if (!result)
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    res.json(result);
  });
};

// POST /products
export const addProduct = (req, res) => {
  const data = req.body;
  createProduct(data, (err, results) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Gagal tambah produk", error: err });
    res.json({
      message: "Produk berhasil ditambahkan",
      productId: results.insertId,
    });
  });
};

// PUT /products/:id
export const editProduct = (req, res) => {
  const id = req.params.id;
  const data = req.body;
  updateProduct(id, data, (err, results) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Gagal update produk", error: err });
    res.json({ message: "Produk berhasil diupdate" });
  });
};

// DELETE /products/:id
export const removeProduct = (req, res) => {
  const id = req.params.id;
  deleteProduct(id, (err, results) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Gagal hapus produk", error: err });
    res.json({ message: "Produk berhasil dihapus" });
  });
};

// POST /products/upload-image - Upload product image to Cloudinary
export const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded" });
    }

    // If buffer exists (memoryUpload), use it. Otherwise try to read from disk path
    let buffer = null;
    if (req.file.buffer) {
      buffer = req.file.buffer;
    } else if (req.file.path) {
      // multer.diskStorage provided a path; read the file into a buffer
      buffer = fs.readFileSync(req.file.path);
    }

    if (!buffer) {
      return res
        .status(400)
        .json({ message: "Uploaded file has no buffer or path" });
    }

    const imageUrl = await uploadToCloudinary(buffer);
    return res.status(200).json({ imageUrl });
  } catch (err) {
    console.error("Error uploading product image:", err);
    return res
      .status(500)
      .json({ message: "Failed to upload image", error: err.message });
  }
};

// Helper function to validate image URLs
export const validateImageUrl = async (url) => {
  try {
    if (!url) return false;

    // Check if it's a local uploaded file
    if (url.includes("/uploads/")) {
      const filename = url.split("/uploads/")[1];
      const filePath = path.join(__dirname, "../uploads/", filename);
      return fs.existsSync(filePath);
    }

    // For external URLs, we'll assume they're valid
    // In production, you might want to make an HTTP request to check
    return url.startsWith("http") || url.startsWith("https");
  } catch (error) {
    return false;
  }
};

// GET /products/validate-images - Check all product images
export const validateAllProductImages = async (req, res) => {
  getAllProducts(async (err, results) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Gagal ambil produk", error: err });

    const validationResults = await Promise.all(
      results.map(async (product) => {
        const isValid = await validateImageUrl(product.image_url);
        return {
          id: product.id,
          name: product.name,
          image_url: product.image_url,
          isValid: isValid,
          needsFixing: !isValid,
        };
      })
    );

    const needsFixing = validationResults.filter((p) => p.needsFixing);

    res.json({
      message: "Image validation complete",
      total: results.length,
      valid: validationResults.filter((p) => p.isValid).length,
      invalid: needsFixing.length,
      products: validationResults,
      needsFixing: needsFixing,
    });
  });
};

// DEBUG: Check product images
export const debugProductImages = (req, res) => {
  getAllProducts((err, results) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Gagal ambil produk", error: err });

    const imageDebug = results.map((product) => ({
      id: product.id,
      name: product.name,
      image_url: product.image_url,
      image_url_type: typeof product.image_url,
      image_url_length: product.image_url ? product.image_url.length : 0,
    }));

    res.json({
      message: "Debug product images",
      count: results.length,
      products: imageDebug,
    });
  });
};

// Helper function to determine stock status
const getStockStatus = (stock, threshold = 5) => {
  if (stock <= 0) return "out_of_stock";
  if (stock <= threshold) return "low_stock";
  return "in_stock";
};

// NEW: Get low stock products for admin alerts
export const getLowStockProducts = (req, res) => {
  const query = `
        SELECT id, name, stock, low_stock_threshold, price 
        FROM products 
        WHERE stock <= low_stock_threshold OR stock <= 5
        ORDER BY stock ASC
    `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error getting low stock products:", err);
      return res
        .status(500)
        .json({ message: "Error fetching low stock products" });
    }
    res.json(results);
  });
};

// NEW: Update product stock
export const updateProductStock = (req, res) => {
  const { id } = req.params;
  const { stock, low_stock_threshold } = req.body;

  const query = `
        UPDATE products 
        SET stock = ?, low_stock_threshold = ? 
        WHERE id = ?
    `;

  db.query(query, [stock, low_stock_threshold || 5, id], (err, result) => {
    if (err) {
      console.error("Error updating stock:", err);
      return res.status(500).json({ message: "Error updating stock" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Stock updated successfully" });
  });
};
