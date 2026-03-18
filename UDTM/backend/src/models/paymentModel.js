import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    payment_id: { type: String, required: true, unique: true }, // ví dụ PAY20250001

    order_id: { type: String, required: true }, // O123...
    user_id: { type: String, required: true },

    amount: { type: Number, required: true }, // số tiền thanh toán

    method: {
      type: String,
      enum: ["vnpay", "cod"],
      default: "vnpay",
    },

    // ---- VNPAY FIELDS ----
    transaction_no: { type: String, default: "" }, // vnp_TransactionNo
    response_code: { type: String, default: "" }, // vnp_ResponseCode
    bank_code: { type: String, default: "" }, // vnp_BankCode
    pay_date: { type: String, default: "" }, // vnp_PayDate

    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export default mongoose.model("Payment", PaymentSchema);
