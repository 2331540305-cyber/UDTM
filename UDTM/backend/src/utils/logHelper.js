import { logAdminAction } from "../controllers/adminLogController.js";

/**
 * Helper function để ghi log hành động admin
 * @param {Object} req - Express request object
 * @param {String} action - Hành động (create_product, update_product, etc)
 * @param {String} targetType - Loại đối tượng (product, user, order, etc)
 * @param {String} targetId - ID của đối tượng bị tác động
 * @param {String} description - Mô tả chi tiết
 * @param {Object} oldData - Dữ liệu cũ (nếu có)
 * @param {Object} newData - Dữ liệu mới (nếu có)
 * @param {String} status - Trạng thái (success, failed) - mặc định: success
 * @param {String} errorMessage - Thông báo lỗi (nếu status = failed)
 */
export const createAdminLog = async (
  req,
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
    // Kiểm tra user có phải admin không
    if (!req.user || req.user.role !== "admin") {
      return;
    }

    await logAdminAction(
      req,
      req.user.user_id,
      req.user.name || "Unknown",
      action,
      targetType,
      targetId,
      description,
      oldData,
      newData,
      status,
      errorMessage
    );
  } catch (error) {
    console.error("Lỗi khi ghi admin log:", error);
  }
};

/**
 * Helper để log thay đổi dữ liệu
 * So sánh oldData và newData, chỉ trả về những field bị thay đổi
 */
export const getChangedFields = (oldData, newData) => {
  const changes = {};

  for (let key in newData) {
    if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
      changes[key] = {
        old: oldData[key],
        new: newData[key],
      };
    }
  }

  return changes;
};
