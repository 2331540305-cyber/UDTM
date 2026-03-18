import express from "express";
import {
  getSellerDashboard,
  getSellerProducts,
  getSellerOrders,
  createProduct,
  updateProduct,
  deleteProduct,
  getSellerEarnings,
  approveOrder,
  updateOrderStatus,
} from "../controllers/sellerController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication and seller role (checked in controller)

// Dashboard stats
router.get("/dashboard", protect, getSellerDashboard);

// Products management
router.get("/products", protect, getSellerProducts);
router.post("/products", protect, createProduct);
router.patch("/products/:id", protect, updateProduct);
router.delete("/products/:id", protect, deleteProduct);

// Orders management
router.get("/orders", protect, getSellerOrders);
router.patch("/orders/:orderId/status", protect, updateOrderStatus);
router.patch("/orders/:orderId/approve", protect, approveOrder);

// Earnings/Revenue
router.get("/earnings", protect, getSellerEarnings);

export default router;
