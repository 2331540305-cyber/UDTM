import express from "express";
import {
  createReview,
  getReviewsByProduct,
  deleteReview,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createReview);
router.get("/:product_id", getReviewsByProduct);
router.delete("/:review_id", protect, deleteReview);

export default router;
