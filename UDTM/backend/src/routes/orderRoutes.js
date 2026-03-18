// routes/orderRoutes.js
import express from "express";
import {
  createOrder,
  getOrder,
  listOrders,
  updateOrder,
  getMyOrders,
  deleteMyOrders,
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Tạo đơn hàng
router.post("/", createOrder);
// Lấy danh sách orders của user đang đăng nhập
router.get("/my", protect, getMyOrders);

// Xóa orders của user hiện tại (hỗ trợ ?olderThanDays=30)
router.delete("/my", protect, deleteMyOrders);

// Lấy danh sách orders theo user_id (public/admin)
router.get("/", listOrders);

// Lấy chi tiết 1 order
router.get("/:id", getOrder);

// Cập nhật order (ví dụ: đổi phương thức thanh toán -> cod)
router.patch("/:id", protect, updateOrder);

export default router;
