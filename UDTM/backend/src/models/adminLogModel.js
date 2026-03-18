import mongoose from "mongoose";

const adminLogSchema = new mongoose.Schema(
  {
    log_id: { type: String, required: true, unique: true },
    admin_id: { type: String, required: true },
    admin_name: { type: String }, // tên admin
    action: { type: String, required: true }, // ví dụ: 'delete_user', 'update_product', 'create_product', etc
    target_type: { type: String }, // loại đối tượng: 'user', 'product', 'order', 'category', etc
    target_id: { type: String }, // id đối tượng bị tác động
    description: { type: String },
    old_data: { type: mongoose.Schema.Types.Mixed }, // dữ liệu cũ (để tracking changes)
    new_data: { type: mongoose.Schema.Types.Mixed }, // dữ liệu mới
    ip_address: { type: String }, // địa chỉ IP
    user_agent: { type: String }, // thông tin trình duyệt
    status: { type: String, enum: ['success', 'failed'], default: 'success' },
    error_message: { type: String }, // nếu có lỗi
    created_at: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

// Index để tối ưu query
adminLogSchema.index({ admin_id: 1, created_at: -1 });
adminLogSchema.index({ action: 1, created_at: -1 });
adminLogSchema.index({ target_id: 1, created_at: -1 });

const AdminLog = mongoose.model("AdminLog", adminLogSchema, "admin_logs");
export default AdminLog;
