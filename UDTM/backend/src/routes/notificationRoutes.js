import express from "express";
import {
  createNotification,
  getMyNotifications,
  markAsRead,
  deleteNotification,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// tạo, xem, cập nhật, xóa thông báo
router.post("/", protect, createNotification);
router.get("/my", protect, getMyNotifications);
router.put("/notification_id/read", protect, markAsRead);
router.delete("/:notification_id", protect, deleteNotification);

export default router;
