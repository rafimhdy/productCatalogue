import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import productRoutes from "./routes/productRoute.js";
import categoryRoutes from "./routes/categoryRoute.js";
import adminRoute from "./routes/adminRoute.js";
import authRoutes from "./routes/authRoute.js";
import customerRoutes from "./routes/customerRoute.js";
import cartRoutes from "./routes/cartRoute.js";
import orderRoutes from "./routes/orderRoute.js";
import wishlistRoutes from "./routes/wishlistRoute.js";
import reviewRoutes from "./routes/reviewRoute.js";
import bestSellerRoutes from "./routes/bestSellerRoute.js";

dotenv.config();

// Remove console logs in production
if (process.env.NODE_ENV === "production") {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}

const app = express();
const port = process.env.PORT || 5000;

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoute);
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/best-sellers", bestSellerRoutes);

// Test endpoint
app.get("/", (req, res) => {
  res.send("Backend API berjalan 🚀");
});

// Jalankan server
app.listen(port, () => {
  console.log(`🚀 Server berjalan di http://localhost:${port}`);
});

app.post("/test", (req, res) => {
  res.json({ ok: true });
});
