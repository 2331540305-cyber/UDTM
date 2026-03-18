import AdminLog from "../models/adminLogModel.js";
import User from "../models/userModel.js";

// 🪶 Ghi log tự động (được gọi từ các controller khác)
export const logAdminAction = async (
  req,
  adminId,
  adminName,
  action,
  targetType,
  targetId,
  description,
  oldData = null,
  newData = null,
  status = "success",
  errorMessage = null
) => {
  try {
    const newLog = await AdminLog.create({
      log_id: "LG" + Date.now() + Math.random().toString(36).substr(2, 9),
      admin_id: adminId,
      admin_name: adminName,
      action,
      target_type: targetType,
      target_id: targetId,
      description,
      old_data: oldData,
      new_data: newData,
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.headers['user-agent'] || '',
      status,
      error_message: errorMessage,
      created_at: new Date(),
    });
    return newLog;
  } catch (error) {
    console.error("Lỗi khi ghi log:", error);
  }
};

// 📋 Lấy tất cả log (chỉ admin) - có lọc, tìm kiếm, phân trang
export const getAllLogs = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Chỉ admin mới được xem log" });
    }

    const {
      page = 1,
      limit = 20,
      action,
      target_type,
      admin_id,
      start_date,
      end_date,
      search,
    } = req.query;

    // Xây dựng filter
    const filter = {};

    if (action) filter.action = action;
    if (target_type) filter.target_type = target_type;
    if (admin_id) filter.admin_id = admin_id;

    // Lọc theo khoảng thời gian
    if (start_date || end_date) {
      filter.created_at = {};
      if (start_date) {
        filter.created_at.$gte = new Date(start_date);
      }
      if (end_date) {
        filter.created_at.$lte = new Date(new Date(end_date).getTime() + 86400000); // +1 ngày
      }
    }

    // Tìm kiếm theo description hoặc target_id
    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: "i" } },
        { target_id: { $regex: search, $options: "i" } },
        { log_id: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const total = await AdminLog.countDocuments(filter);
    const logs = await AdminLog.find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      logs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔎 Lấy log theo ID
export const getLogById = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Chỉ admin mới được xem log" });
    }

    const log = await AdminLog.findOne({ log_id: req.params.id });
    if (!log) return res.status(404).json({ message: "Không tìm thấy log" });
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📊 Thống kê hành động admin
export const getLogsStatistics = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Chỉ admin mới được xem thống kê" });
    }

    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Thống kê theo action
    const actionStats = await AdminLog.aggregate([
      {
        $match: {
          created_at: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$action",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Thống kê theo admin
    const adminStats = await AdminLog.aggregate([
      {
        $match: {
          created_at: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$admin_id",
          admin_name: { $first: "$admin_name" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Thống kê theo loại đối tượng
    const targetTypeStats = await AdminLog.aggregate([
      {
        $match: {
          created_at: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$target_type",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Thống kê theo ngày
    const dailyStats = await AdminLog.aggregate([
      {
        $match: {
          created_at: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$created_at" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.json({
      actionStats,
      adminStats,
      targetTypeStats,
      dailyStats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🗑️ Xóa log (admin)
export const deleteLog = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Không có quyền xóa log" });
    }

    const log = await AdminLog.findOne({ log_id: req.params.id });
    if (!log) return res.status(404).json({ message: "Không tìm thấy log" });

    await log.deleteOne();
    res.json({ message: "Đã xóa log" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🗑️ Xóa logs cũ (tuần/tháng/quý)
export const deleteOldLogs = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Không có quyền xóa log" });
    }

    const { days = 90 } = req.body; // mặc định xóa logs cũ hơn 90 ngày

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await AdminLog.deleteMany({
      created_at: { $lt: cutoffDate },
    });

    res.json({
      message: `Đã xóa ${result.deletedCount} log cũ`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📄 Export logs ra CSV
export const exportLogs = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Chỉ admin mới được export log" });
    }

    const { format = "json", start_date, end_date } = req.query;

    const filter = {};
    if (start_date || end_date) {
      filter.created_at = {};
      if (start_date) filter.created_at.$gte = new Date(start_date);
      if (end_date)
        filter.created_at.$lte = new Date(
          new Date(end_date).getTime() + 86400000
        );
    }

    const logs = await AdminLog.find(filter).sort({ created_at: -1 });

    if (format === "csv") {
      let csv =
        "Log ID,Admin ID,Admin Name,Action,Target Type,Target ID,Description,Status,Created At\n";
      logs.forEach((log) => {
        csv += `"${log.log_id}","${log.admin_id}","${log.admin_name}","${log.action}","${log.target_type}","${log.target_id}","${log.description}","${log.status}","${log.created_at}"\n`;
      });

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=logs.csv");
      res.send(csv);
    } else {
      res.json(logs);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
