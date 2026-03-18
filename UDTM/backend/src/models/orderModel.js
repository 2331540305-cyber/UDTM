import mongoose from "mongoose";

const OrderDetailSchema = new mongoose.Schema({
  product_id: { type: String, required: true },
  product_name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  seller_id: { type: String, required: true },
  subtotal: { type: Number, required: true },
  product_image: { type: String, default: null },
});

const OrderSchema = new mongoose.Schema(
  {
    order_id: { type: String, required: true, unique: true },

    user_id: { type: String, required: true }, // buyer id

    items: {
      type: [OrderDetailSchema],
      required: true,
    },

    total_amount: { type: Number, required: true },

    payment_method: {
      type: String,
      enum: ["vnpay", "cod"],
      default: "vnpay",
    },

    payment_status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    order_status: {
      type: String,
      enum: ["pending", "confirmed", "shipping", "completed", "canceled"],
      default: "pending",
    },

    // ---- Shipping Information ----
    customer_name: { type: String, default: "" },
    customer_phone: { type: String, default: "" },
    customer_email: { type: String, default: "" },
    delivery_address: { type: String, default: "" },

    // ---- VNPAY Info ----
    vnp_response_code: { type: String, default: "" }, // vnp_ResponseCode
    vnp_transaction_no: { type: String, default: "" }, // vnp_TransactionNo
    vnp_bank_code: { type: String, default: "" },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export default mongoose.model("Order", OrderSchema);
