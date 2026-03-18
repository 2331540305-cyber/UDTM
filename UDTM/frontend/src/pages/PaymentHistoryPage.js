import React, { useEffect, useState } from "react";
import { getMyPayments, deleteMyPayments } from "../services/paymentService";

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await getMyPayments();
        const data = res.data.payments || res.data || [];
        setPayments(data);
      } catch (err) {
        console.error("Fetch payments error:", err);
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-pink-50">
        <p className="text-gray-700 text-lg">Đang tải...</p>
      </div>
    );

  const handleDeleteAll = async () => {
    const ok = window.confirm(
      "Bạn chắc chắn muốn xóa toàn bộ lịch sử giao dịch? Hành động này không thể hoàn tác."
    );
    if (!ok) return;

    try {
      await deleteMyPayments();
      setPayments([]);
      alert("Đã xóa toàn bộ lịch sử giao dịch.");
    } catch (err) {
      console.error("Xóa lịch sử lỗi:", err);
      alert("Xóa lịch sử thất bại. Vui lòng thử lại.");
    }
  };

  if (!payments || payments.length === 0)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-pink-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800">Không có giao dịch</h2>
          <p className="text-gray-600 mt-2">Bạn chưa có lịch sử thanh toán nào.</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Lịch sử giao dịch</h1>

          <button
            onClick={handleDeleteAll}
            className="px-5 py-3 rounded-xl font-semibold bg-gradient-to-r from-red-400 to-pink-500 text-white shadow hover:opacity-90 transition"
          >
            Xóa lịch sử
          </button>
        </div>

        <div className="space-y-4">
          {payments.map((p) => (
            <div
              key={p.payment_id || p._id}
              className="bg-white p-5 rounded-2xl shadow-lg border border-pink-100 hover:shadow-xl transition"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1 text-sm text-gray-700">
                  <div>
                    Mã đơn:{" "}
                    <span className="font-semibold text-gray-900">{p.order_id}</span>
                  </div>
                  <div>
                    Phương thức:{" "}
                    <span className="font-semibold">{p.method}</span>
                  </div>
                  <div>
                    Trạng thái:{" "}
                    <span
                      className={`font-semibold ${
                        p.status === "success" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-bold text-red-500">
                    {(p.amount || 0).toLocaleString()}₫
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(
                      p.created_at || p.pay_date || Date.now()
                    ).toLocaleString("vi-VN")}
                  </div>
                </div>
              </div>

              {p.transaction_no && (
                <div className="mt-3 text-sm text-gray-800">
                  Mã giao dịch: {p.transaction_no}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
