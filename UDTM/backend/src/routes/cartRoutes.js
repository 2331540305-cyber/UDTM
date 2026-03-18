import express from "express";
import {
  getMyCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getMyCart);
router.post("/", protect, addToCart);
router.put("/", protect, updateCartItem);
router.delete("/:cart_item_id", protect, removeFromCart);
router.delete("/", protect, clearCart);

export default router;
