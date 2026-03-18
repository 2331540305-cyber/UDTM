import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    report_id: { type: String, required: true, unique: true },
    // report_type historically indicated granularity (daily/monthly/custom) but
    // frontend currently submits 'sales' or 'orders' as types. Allow both sets
    // of values for compatibility.
    report_type: { type: String, enum: ["daily", "monthly", "custom", "sales", "orders"], default: "daily" },
    period_start: { type: Date },
    period_end: { type: Date },
    total_revenue: { type: Number, default: 0 },
    total_orders: { type: Number, default: 0 },
    top_seller: { type: String },
    top_product: { type: String },
    notes: { type: String },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const Report = mongoose.model("Report", reportSchema, "reports");
export default Report;
