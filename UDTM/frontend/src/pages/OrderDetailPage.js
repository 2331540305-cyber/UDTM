import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

const statusSteps = [
  { key: "pending", label: "Chờ xử lý", icon: "1" },
  { key: "confirmed", label: "Đã xác nhận", icon: "2" },
  { key: "shipping", label: "Đang giao", icon: "3" },
  { key: "completed", label: "Đã giao", icon: "4" },
];

export default function OrderDetailPage({ orders = [] }) {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      // Try local orders passed from App first
      const local = orders.find(
        (o) => o.order_id == id || o.id == id || o._id == id
      );
      if (local) {
        setOrder(local);
        setLoading(false);
        return;
      }

      // If not found locally, and user logged in, fetch from backend
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const res = await api.get("/orders/my");
          const myOrders = res.data.orders || res.data || [];
          const found = myOrders.find(
            (o) => o.order_id == id || o._id == id || o.id == id
          );
          if (found) setOrder(found);
        }
      } catch (err) {
        console.error("Lỗi lấy đơn hàng:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
    // Real-time poll every 3 seconds
    const interval = setInterval(fetchOrder, 3000);
    return () => clearInterval(interval);
  }, [id, orders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="w-12 h-12 text-indigo-600 animate-spin mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" strokeWidth="4" opacity="0.25"></circle>
            <path
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy đơn hàng</h2>
          <p className="text-gray-600 mb-6">Đơn hàng bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <Link
            to="/orders"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            ← Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const total = order.items?.reduce(
    (sum, p) => sum + (p.price || 0) * (p.quantity || 1),
    0
  ) || order.total_amount || 0;
  const status = order.order_status || "pending";
  const currentStatusIdx = statusSteps.findIndex((s) => s.key === status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Đơn hàng #{order.order_id || order.id}
            </h1>
            <p className="text-gray-600">
              {new Date(order.created_at || order.date).toLocaleString("vi-VN")}
            </p>
          </div>
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 12H5m7 7l-7-7 7-7" />
            </svg>
            Quay lại
          </Link>
        </div>

        {/* Status Timeline */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Trạng thái giao hàng</h3>
          <div className="flex items-center justify-between">
            {statusSteps.map((step, idx) => (
              <div key={step.key} className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold transition-all shadow-lg ${
                    idx === currentStatusIdx
                      ? "bg-yellow-400 text-gray-900 scale-125 animate-pulse"
                      : idx < currentStatusIdx
                      ? "bg-green-500 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {step.icon}
                </div>
                <p
                  className={`text-sm font-semibold mt-3 text-center transition-all ${
                    idx === currentStatusIdx
                      ? "text-yellow-600 text-base"
                      : idx < currentStatusIdx
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  {step.label}
                </p>
                {idx < statusSteps.length - 1 && (
                  <div
                    className={`h-1 w-full mt-3 ml-6 transition-all ${
                      idx < currentStatusIdx
                        ? "bg-green-500"
                        : idx === currentStatusIdx
                        ? "bg-yellow-400"
                        : "bg-gray-300"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-indigo-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                </svg>
                Thông tin giao hàng
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                    Người nhận
                  </p>
                  <p className="font-semibold text-gray-900">
                    {order.customer_name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                    </svg>
                    Điện thoại
                  </p>
                  <p className="font-semibold text-gray-900">
                    {order.customer_phone || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z" />
                    </svg>
                    Địa chỉ giao hàng
                  </p>
                  <p className="font-semibold text-gray-900">
                    {order.delivery_address || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 8h-2.02c-.26-1.23-1.3-2.06-2.48-2.06-1.18 0-2.22.83-2.48 2.06h-2.04c-.26-1.23-1.3-2.06-2.48-2.06-1.18 0-2.22.83-2.48 2.06H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-12c0-1.1-.9-2-2-2zm-12.5.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm5 0c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5z" />
                    </svg>
                    Phương thức thanh toán
                  </p>
                  <p className="font-semibold text-gray-900 capitalize">
                    {order.payment_method || "COD"}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-indigo-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
                Sản phẩm ({order.items?.length || 0})
              </h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {order.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{item.name || "Sản phẩm"}</p>
                      <p className="text-sm text-gray-600">
                        {item.price?.toLocaleString("vi-VN") || 0}₫ × {item.quantity}
                      </p>
                    </div>
                    <p className="font-bold text-gray-900">
                      {(item.price * item.quantity).toLocaleString("vi-VN")}₫
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar: Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Tóm tắt đơn hàng</h3>
              <div className="space-y-3 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal:</span>
                  <span>{total.toLocaleString("vi-VN")}₫</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Phí vận chuyển:</span>
                  <span className="text-green-600 font-semibold">Miễn phí</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4">
                <span className="text-lg font-bold text-gray-900">Tổng cộng:</span>
                <span className="text-3xl font-bold text-green-600">
                  {total.toLocaleString("vi-VN")}₫
                </span>
              </div>

              {/* Status Badge */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-2">Trạng thái</p>
                <p className="font-bold text-lg text-blue-600 capitalize flex items-center gap-2">
                  {status === "pending" && (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                      </svg>
                      Chờ xử lý
                    </>
                  )}
                  {status === "confirmed" && (
                    <>
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                      </svg>
                      Đã xác nhận
                    </>
                  )}
                  {status === "shipped" && (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18 18.5a1.5 1.5 0 01-3 0 1.5 1.5 0 013 0zM9 18.5a1.5 1.5 0 01-3 0 1.5 1.5 0 013 0z" />
                        <path d="M20 8h-3V4H3c-1.11 0-2 .9-2 2v11h2a3 3 0 003 3 3 3 0 003-3h6a3 3 0 003 3 3 3 0 003-3h2v-5l-3-4z" />
                      </svg>
                      Đang giao
                    </>
                  )}
                  {status === "delivered" && (
                    <>
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                      </svg>
                      Đã giao
                    </>
                  )}
                  {status === "cancelled" && (
                    <>
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                      </svg>
                      Đã hủy
                    </>
                  )}
                </p>
              </div>

              {/* Payment Status Badge */}
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600 mb-2">Thanh toán</p>
                <div className="space-y-2">
                  <p className="font-semibold text-green-700 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    {order.payment_method || "COD"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Số tiền: <span className="font-semibold text-gray-900">{total.toLocaleString("vi-VN")}₫</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
