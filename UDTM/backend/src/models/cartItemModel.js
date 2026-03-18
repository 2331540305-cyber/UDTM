import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    cart_item_id: { type: String, required: true, unique: true },
    cart_id: { type: String, required: true },
    product_id: { type: String, required: true },
    quantity: { type: Number, default: 1 },
  },
  { timestamps: false }
);

const CartItem = mongoose.model("CartItem", cartItemSchema, "cart_items");
export default CartItem;
