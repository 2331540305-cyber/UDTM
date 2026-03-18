import express from "express";
import { generateReport, getReports, getReportById } from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, generateReport);   // tạo báo cáo
router.get("/", protect, getReports);        // lấy tất cả báo cáo
router.get("/:report_id", protect, getReportById);  // lấy 1 báo cáo cụ thể

export default router;
