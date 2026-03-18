import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { deleteMyOrders } from "../services/orderService";

const statusConfig = {
  pending: { label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-800", icon: "⏳" },
  confirmed: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-800", icon: "✓" },
  shipping: { label: "Đang giao", color: "bg-purple-100 text-purple-800", icon: "🚚" },
  shipped: { label: "Đang giao", color: "bg-purple-100 text-purple-800", icon: "🚚" },
  delivered: { label: "Đã giao", color: "bg-green-100 text-green-800", icon: "✔" },
  completed: { label: "Hoàn thành", color: "bg-green-100 text-green-800", icon: "✔" },
  cancelled: { label: "Hủy", color: "bg-red-100 text-red-800", icon: "✕" },
  canceled: { label: "Hủy", color: "bg-red-100 text-red-800", icon: "✕" },
};

const OrderCard = ({ order }) => {
  const total =
    order.items?.reduce((sum, p) => sum + (p.price || 0) * (p.quantity || 1), 0) ||
    order.total_amount ||
    0;
  const status = order.order_status || "pending";
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-400 to-blue-300 p-4 flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-white">Đơn #{order.order_id || order.id}</h3>
          <p className="text-indigo-100 text-sm">
            {new Date(order.created_at || order.date).toLocaleString("vi-VN")}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${config.color}`}
        >
          {config.icon} {config.label}
        </span>
      </div>

      {/* Body */}
      <div className="p-6 space-y-4">
        {/* Shipping Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 font-medium">Người nhận</p>
            <p className="text-gray-900 font-semibold">{order.customer_name || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Địa chỉ</p>
            <p className="text-gray-900 text-sm">{order.delivery_address || "N/A"}</p>
          </div>
        </div>

        {/* Items */}
        <div className="border-t border-gray-100 pt-4">
          <p className="text-sm font-semibold text-gray-900 mb-2">Sản phẩm ({order.items?.length || 0})</p>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between text-gray-700 text-sm">
                <span>{item.name || "Sản phẩm"} (x{item.quantity})</span>
                <span className="font-semibold">
                  {(item.price * item.quantity).toLocaleString("vi-VN")}₫
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
          <span className="font-semibold text-gray-900">Tổng cộng:</span>
          <span className="text-2xl font-bold text-green-600">{total.toLocaleString("vi-VN")}₫</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Link
            to={`/order/${order.order_id || order.id}`}
            className="flex-1 bg-indigo-300 hover:bg-indigo-400 text-white font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
            </svg>
            Xem chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function OrderListPage({ orders = [] }) {
  const [myOrders, setMyOrders] = useState(orders);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");
      try {
        if (token) {
          const res = await api.get("/orders/my");
          const data = res.data.orders || res.data || [];
          setMyOrders(data);
        } else {
          const saved = localStorage.getItem("orders");
          if (saved) setMyOrders(JSON.parse(saved));
        }
      } catch (err) {
        console.error("Fetch orders error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    
    // Fetch lại khi page được focus (trở về từ OrderDetailPage)
    const handleFocus = () => {
      console.log("📄 OrderListPage focused, fetching fresh data...");
      fetchOrders();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  if (loading) return <p className="text-center mt-20 text-gray-500">Đang tải danh sách...</p>;
  if (myOrders.length === 0) return <p className="text-center mt-20 text-gray-500">Bạn chưa có đơn hàng</p>;

  const handleRefresh = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      if (token) {
        const res = await api.get("/orders/my");
        const data = res.data.orders || res.data || [];
        setMyOrders(data);
      }
    } catch (err) {
      console.error("Refresh error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with Refresh Button */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Danh sách đơn hàng</h1>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition flex items-center gap-2"
            title="Làm mới danh sách"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Làm mới
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myOrders.map(order => (
            <OrderCard key={order.order_id || order.id} order={order} />
          ))}
        </div>
      </div>
    </div>
  );
}
