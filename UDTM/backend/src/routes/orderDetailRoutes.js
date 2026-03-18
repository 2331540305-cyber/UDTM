import express from "express";
import {
  createOrderDetail,
  createOrderDetailsBulk,
  getDetailsByOrder,
  getAllOrderDetails,
  updateOrderDetail,
  deleteOrderDetail,
} from "../controllers/orderDetailController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrderDetail);              // tạo 1 chi tiết
router.post("/bulk", protect, createOrderDetailsBulk);     // tạo nhiều chi tiết cùng lúc
router.get("/", protect, getAllOrderDetails);              // admin
router.get("/order/:order_id", protect, getDetailsByOrder); // lấy theo order_id
router.put("/:order_detail_id", protect, updateOrderDetail);            // cập nhật theo order_detail_id
router.delete("/:order_detail_id", protect, deleteOrderDetail);         // xóa theo order_detail_id

export default router;
