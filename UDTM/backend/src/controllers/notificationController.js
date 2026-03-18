import Notification from "../models/notificationModel.js";

// 📨 Tạo thông báo mới
export const createNotification = async (req, res) => {
  try {
    const { user_id, message, type } = req.body;

    const newNoti = await Notification.create({
      notification_id: "NT" + Date.now(),
      user_id,
      message,
      type,
      is_read: false,
      created_at: new Date(),
    });

    res.status(201).json(newNoti);
  } catch (error) {
    console.error("Lỗi tạo thông báo:", error);
    res.status(500).json({ message: error.message });
  }
};

// 🔍 Lấy tất cả thông báo của user hiện tại
export const getMyNotifications = async (req, res) => {
  try {
    const noti = await Notification.find({ user_id: req.user.user_id }).sort({
      created_at: -1,
    });
    res.json(noti);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Đánh dấu thông báo đã đọc
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const noti = await Notification.findOne({ notification_id: id });
    if (!noti) return res.status(404).json({ message: "Không tìm thấy thông báo" });

    noti.is_read = true;
    await noti.save();

    res.json({ message: "Đã đánh dấu đã đọc" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🗑️ Xóa thông báo (nếu cần)
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const noti = await Notification.findOne({ notification_id: id });

    if (!noti) return res.status(404).json({ message: "Không tìm thấy thông báo" });

    await noti.deleteOne();
    res.json({ message: "Đã xóa thông báo" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
