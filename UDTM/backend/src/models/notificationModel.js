import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    notification_id: { type: String, required: true, unique: true },
    user_id: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["order", "payment", "system"],
      default: "system",
    },
    is_read: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

const Notification = mongoose.model(
  "Notification",
  notificationSchema,
  "notifications"
);

export default Notification;
