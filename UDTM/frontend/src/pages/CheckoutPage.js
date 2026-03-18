import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function CheckoutPage({ cart, userInfo: propUserInfo, onClearCart }) {
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("userInfo"));
    if (stored) setUserInfo(stored);
  }, []);

  const displayUserInfo = userInfo || propUserInfo;

  // Chỉ buyer mới có thể thanh toán
  if (displayUserInfo?.role !== "buyer") {
    return (
      <div className="min-h-screen py-8" style={{ backgroundColor: "#E1F0FF" }}>
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white p-12 rounded-lg text-center">
            <svg className="mx-auto w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4v2m0 0v2m0-6v-2m0 0V7a2 2 0 012-2h2.586a1 1 0 00.707-.293l-1.414-1.414a2 2 0 10-2.828 2.828L9.172 7H7a2 2 0 00-2 2v2m14-6a1 1 0 11-2 0 1 1 0 012 0zm-7 11a1 1 0 11-2 0 1 1 0 012 0zm7-7a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Thanh toán chỉ dành cho người mua</h2>
            <p className="text-gray-600 mb-6">Bạn đang đăng nhập với tư cách {displayUserInfo?.role}. Chỉ người mua mới có thể thanh toán.</p>
            <button
              onClick={() => navigate("/home")}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Quay lại trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  const user_id = displayUserInfo?.user_id || "U001";
  const total = cart.reduce((sum, p) => sum + (p.price || 0) * (p.quantity || 1), 0);

  const handleCheckout = async () => {
    if (!displayUserInfo?.full_name || !displayUserInfo?.phone || !displayUserInfo?.address) {
      alert("Vui lòng cập nhật thông tin tài khoản trước");
      return;
    }

    setLoading(true);
    try {
      const items = cart.map((item) => ({
        product_id: item.product_id || item._id || item.id,
        product_name: item.name || item.product_name,
        price: item.price || 0,
        quantity: item.quantity || 1,
        subtotal: (item.price || 0) * (item.quantity || 1),
        seller_id: item.seller_id || item.seller || "SYSTEM",
        product_image: item.photo || item.image || null,
      }));

      const response = await api.post("/orders", {
        user_id,
        items,
        customer_name: displayUserInfo.full_name,
        customer_phone: displayUserInfo.phone,
        customer_email: displayUserInfo.email,
        delivery_address: displayUserInfo.address,
        total_amount: total,
        status: "pending",
      });

      const created = response.data?.order || response.data;
      const createdOrderId = created?.order_id || created?._id || created?.id;
      if (createdOrderId) {
        // Xóa giỏ hàng từ server
        try {
          await api.delete("/carts");
        } catch (err) {
          console.warn("Lỗi xóa giỏ khỏi server:", err);
        }
        
        // Xóa giỏ hàng state
        if (onClearCart) {
          onClearCart();
        }
        
        navigate(`/payment?order_id=${createdOrderId}`, {
          state: { order_id: createdOrderId },
        });
      }
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Lỗi tạo đơn hàng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-indigo-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Xác nhận đơn hàng</h1>
          <p className="text-gray-600 mt-2">Vui lòng kiểm tra thông tin trước khi thanh toán</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Delivery Info & Order Review */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Info */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-pink-500 hover:shadow-xl transition-transform transform hover:-translate-y-1">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="bg-pink-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
                Thông tin giao hàng
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tên người nhận</label>
                  <p className="px-4 py-3 bg-gray-100 border-2 border-gray-300 rounded-lg text-gray-900">
                    {userInfo?.full_name || "Chưa cập nhật"}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
                    <p className="px-4 py-3 bg-gray-100 border-2 border-gray-300 rounded-lg text-gray-900">
                      {userInfo?.phone || "Chưa cập nhật"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <p className="px-4 py-3 bg-gray-100 border-2 border-gray-300 rounded-lg text-gray-900">
                      {userInfo?.email || "Chưa cập nhật"}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ giao hàng</label>
                  <p className="px-4 py-3 bg-gray-100 border-2 border-gray-300 rounded-lg text-gray-900 whitespace-pre-wrap">
                    {userInfo?.address || "Chưa cập nhật"}
                  </p>
                </div>

                <button
                  onClick={() => navigate("/profile")}
                  className="text-blue-600 hover:text-blue-700 text-sm font-semibold mt-2 flex items-center gap-1"
                >
                  ✏️ Cập nhật thông tin
                </button>
              </div>
            </div>

            {/* Order Review */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-indigo-500 hover:shadow-xl transition-transform transform hover:-translate-y-1">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="bg-indigo-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
                Kiểm tra đơn hàng
              </h2>

              <div className="space-y-3">
                {cart.length === 0 ? (
                  <p className="text-gray-600">Giỏ hàng trống</p>
                ) : (
                  cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center pb-3 border-b last:border-b-0">
                      <div>
                        <p className="font-semibold text-gray-900">{item.name || item.product_name}</p>
                        <p className="text-sm text-gray-600">
                          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.price || 0)} x {item.quantity}
                        </p>
                      </div>
                      <p className="font-bold text-pink-600">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format((item.price || 0) * (item.quantity || 1))}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right: Summary & Checkout */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-lg sticky top-24 border-t-4 border-green-500 hover:shadow-xl transition-transform transform hover:-translate-y-1">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
                Tóm tắt
              </h2>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6 pb-6 border-b-2 border-gray-200">
                <div className="flex justify-between text-gray-700">
                  <span>Tổng sản phẩm:</span>
                  <span className="font-semibold text-indigo-600">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(total)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Phí vận chuyển:</span>
                  <span className="font-semibold text-green-600">Miễn phí</span>
                </div>
              </div>

              {/* Total */}
              <div className="mb-6">
                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                  <span className="text-lg font-bold text-gray-900">Tổng cộng:</span>
                  <span className="text-3xl font-bold text-pink-600">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(total)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={loading || cart.length === 0}
                className="w-full py-4 rounded-2xl text-white font-bold bg-gradient-to-r from-pink-500 to-red-500 hover:from-red-500 hover:to-pink-500 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "⏳ Đang xử lý..." : "💳 Thanh toán"}
              </button>

              {/* Back Button */}
              <button
                onClick={() => navigate("/cart")}
                disabled={loading}
                className="w-full mt-3 py-3 rounded-2xl text-gray-900 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 transition font-semibold"
              >
                Quay lại giỏ hàng
              </button>

              {/* Security Badge */}
              <div className="mt-6 pt-6 border-t-2 border-gray-200 text-center text-xs text-gray-600">
                <p className="mb-2"> Giao dịch an toàn</p>
                <p>Thanh toán được bảo mật 100%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
