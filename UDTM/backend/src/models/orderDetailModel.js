import mongoose from "mongoose";

const orderDetailSchema = new mongoose.Schema(
  {
    order_detail_id: { type: String, required: true, unique: true },
    order_id: { type: String, required: true },      // liên kết với orders.order_id
    product_id: { type: String, required: true },    // id sản phẩm (product_id)
    seller_id: { type: String },                     // người bán (nếu có)
    quantity: { type: Number, required: true, default: 1 },
    price: { type: Number, required: true },         // giá 1 sp thời điểm đặt
    subtotal: { type: Number, required: true },      // price * quantity
    created_at: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

const OrderDetail = mongoose.model("OrderDetail", orderDetailSchema, "order_details");
export default OrderDetail;
