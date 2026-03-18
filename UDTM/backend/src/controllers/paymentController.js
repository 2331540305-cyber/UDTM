// controllers/paymentController.js
import Payment from "../models/paymentModel.js";
import Order from "../models/orderModel.js";

// =====================================================
// Lấy danh sách thanh toán
// =====================================================
export const listPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ created_at: -1 });
    return res.json(payments);
  } catch (err) {
    console.error("❌ listPayments error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ------------------------
// GET PAYMENTS FOR AUTHENTICATED USER
// Trả về lịch sử giao dịch (payments) theo user_id
// ------------------------
export const getMyPayments = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const payments = await Payment.find({ user_id: user.user_id }).sort({ created_at: -1 });

    return res.json({ payments });
  } catch (err) {
    console.error("❌ getMyPayments error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ------------------------
// DELETE PAYMENTS FOR AUTHENTICATED USER
// - If query `olderThanDays` provided, delete payments older than that
// - If not provided, delete all payments for the user
// ------------------------
export const deleteMyPayments = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const olderThanDays = parseInt(req.query.olderThanDays || "", 10);
    let filter = { user_id: user.user_id };

    if (!isNaN(olderThanDays) && olderThanDays > 0) {
      const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
      filter.created_at = { $lt: cutoff };
    }

    const result = await Payment.deleteMany(filter);

    return res.json({ message: "Payments deleted", deletedCount: result.deletedCount });
  } catch (err) {
    console.error("❌ deleteMyPayments error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// =====================================================
// Tạo payment thủ công (ít dùng – dành cho admin)
// =====================================================
export const createPaymentRecord = async (req, res) => {
  try {
    const {
      payment_id,
      order_id,
      user_id,
      amount,
      method,
      transaction_no,
      response_code,
      bank_code,
      pay_date,
      status
    } = req.body;

    const payment = await Payment.create({
      payment_id,
      order_id,
      user_id,
      amount,
      method,
      transaction_no,
      response_code,
      bank_code,
      pay_date,
      status,
    });

    // Update order nếu thành công
    if (status === "success") {
      await Order.findOneAndUpdate(
        { order_id },
        {
          payment_status: "paid",
          order_status: "confirmed",
          vnp_transaction_no: transaction_no || "",
          vnp_response_code: response_code || "",
          vnp_bank_code: bank_code || "",
        }
      );
    }

    return res.status(201).json(payment);
  } catch (err) {
    console.error("❌ createPaymentRecord error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
