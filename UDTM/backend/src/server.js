// ⚠️ PHẢI ĐẶT DÒNG NÀY TRÊN ĐẦU TIÊN
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import adminLogRoutes from "./routes/adminLogRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import cartItemRoutes from "./routes/cartItemRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import orderDetailRoutes from "./routes/orderDetailRoutes.js";
import vnpayRoutes from "./routes/vnpayRoutes.js";
import imageProxyRoutes from "./routes/imageProxy.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import { upload, uploadImage } from "./middleware/uploadMiddleware.js";
import userRoutes from "./routes/userRoutes.js";

// Kết nối MongoDB
connectDB();

const app = express();

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));

// Serve static files
app.use("/uploads", express.static("uploads"));

// Routers
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/image-proxy", imageProxyRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin-logs", adminLogRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/cart-items", cartItemRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/order-details", orderDetailRoutes);
app.use("/api/vnpay", vnpayRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/users", userRoutes);

// Upload endpoint
app.post("/api/upload", upload.single("file"), uploadImage);

// Error middleware
import { notFound, errorHandler } from "./middleware/errorHandler.js";
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
});
