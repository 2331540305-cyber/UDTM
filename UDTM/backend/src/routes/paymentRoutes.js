import express from "express";
import {
  listPayments,
  createPaymentRecord,
  getMyPayments,
  deleteMyPayments,
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ==============================
// PAYMENT HISTORY ROUTES
// ==============================
router.get("/", listPayments);

// Lấy lịch sử payment của user đang đăng nhập
router.get("/my", protect, getMyPayments);

// Xóa lịch sử payment (user): hỗ trợ query olderThanDays
router.delete("/my", protect, deleteMyPayments);

// ==============================
// MANUAL PAYMENT CREATION (admin only)
// ==============================
router.post("/", createPaymentRecord);

export default router;
