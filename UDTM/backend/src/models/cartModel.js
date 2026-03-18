import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    cart_id: { type: String, required: true, unique: true },
    user_id: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

const Cart = mongoose.model("Cart", cartSchema, "carts");
export default Cart;
