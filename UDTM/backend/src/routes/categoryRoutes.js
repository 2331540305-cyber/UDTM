import express from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// admin có thể CRUD danh mục
router.post("/", protect, createCategory);
router.get("/", getCategories);
router.get("/:category_id", getCategoryById);
router.put("/:category_id", protect, updateCategory);
router.delete("/:category_id", protect, deleteCategory);

export default router;
