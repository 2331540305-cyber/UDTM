import express from "express";
import {
  getCartItems,
  addCartItem,
  updateCartItem,
  deleteCartItem,
} from "../controllers/cartItemController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:cart_id", protect, getCartItems);
router.post("/", protect, addCartItem);
router.put("/", protect, updateCartItem);
router.delete("/:cart_item_id", protect, deleteCartItem);

export default router;
