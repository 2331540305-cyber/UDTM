import express from "express";
import {
  getAllLogs,
  getLogById,
  deleteLog,
  deleteOldLogs,
  getLogsStatistics,
  exportLogs,
  logAdminAction,
} from "../controllers/adminLogController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Routes tĩnh PHẢI ĐẶT TRƯỚC routes động
router.get("/statistics/overview", protect, getLogsStatistics); // xem thống kê
router.get("/export", protect, exportLogs);       // export logs
router.delete("/batch/old", protect, deleteOldLogs); // xóa logs cũ

// Routes động
router.get("/", protect, getAllLogs);              // xem tất cả log (có lọc, tìm kiếm, phân trang)
router.get("/:log_id", protect, getLogById);       // xem 1 log
router.delete("/:log_id", protect, deleteLog);     // xóa 1 log

export default router;
