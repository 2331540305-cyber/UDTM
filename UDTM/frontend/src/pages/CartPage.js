import React from "react";
import { useNavigate } from "react-router-dom";
import CartItem from "../components/CartItem";

export default function CartPage({ cart, removeFromCart, updateCartItem, userInfo }) {
  const navigate = useNavigate();
  
  // Chỉ buyer mới có giỏ hàng
  if (userInfo?.role !== "buyer") {
    return (
      <div className="min-h-screen py-8" style={{ backgroundColor: "#E1F0FF" }}>
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white p-12 rounded-lg text-center">
            <svg className="mx-auto w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4v2m0 0v2m0-6v-2m0 0V7a2 2 0 012-2h2.586a1 1 0 00.707-.293l-1.414-1.414a2 2 0 10-2.828 2.828L9.172 7H7a2 2 0 00-2 2v2m14-6a1 1 0 11-2 0 1 1 0 012 0zm-7 11a1 1 0 11-2 0 1 1 0 012 0zm7-7a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Giỏ hàng chỉ dành cho người mua</h2>
            <p className="text-gray-600 mb-6">Bạn đang đăng nhập với tư cách {userInfo?.role}. Chỉ người mua mới có thể sử dụng giỏ hàng.</p>
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

  const total = cart.reduce((sum, p) => sum + (p.price || 0) * (p.quantity || 1), 0);

  const gradientTextStyle = {
    background: "linear-gradient(90deg, #60B4E8 0%, #FFC0CB 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent"
  };

  const gradientBtnStyle = {
    background: "linear-gradient(90deg, #60B4E8 0%, #FFC0CB 100%)",
    color: "#fff"
  };

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: "#E1F0FF" }}>
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2" style={gradientTextStyle}>
          Xác nhận giỏ hàng
        </h1>
        <p className="text-gray-600 mb-6">Kiểm tra đơn hàng của bạn trước khi thanh toán</p>

        {cart.length === 0 ? (
          <div className="bg-white p-12 rounded-lg text-center">
            <svg className="mx-auto w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-600 mb-4">Giỏ hàng của bạn đang trống</p>
            <button
              onClick={() => navigate("/home")}
              style={gradientBtnStyle}
              className="px-6 py-2 rounded hover:brightness-90"
            >
              Mua ngay
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-4" style={gradientTextStyle}>Giỏ hàng</h2>
                <div className="space-y-4">
                  {cart.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center">
                        <img
                          src={product.photo}
                          alt={product.name}
                          className="w-20 h-20 rounded-lg object-cover mr-4"
                        />
                        <div>
                          <h3 className="font-bold">{product.name}</h3>
                          <p className="text-red-600 font-semibold">
                            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.price)}
                          </p>
                          <div className="flex items-center mt-2">
                            <button
                              onClick={() => updateCartItem(product.id, Math.max(1, product.quantity - 1))}
                              className="px-3 py-1 bg-gray-200 rounded-l hover:bg-gray-300"
                            >-</button>
                            <span className="px-4 py-1 border-t border-b">{product.quantity || 1}</span>
                            <button
                              onClick={() => updateCartItem(product.id, (product.quantity || 1) + 1)}
                              className="px-3 py-1 bg-gray-200 rounded-r hover:bg-gray-300"
                            >+</button>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="text-red-600 hover:text-red-800 font-semibold"
                      >Xóa</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg sticky top-24">
                <h2 className="text-xl font-bold mb-4" style={gradientTextStyle}>Tóm tắt đơn hàng</h2>
                <div className="space-y-3 mb-4 pb-4 border-b">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tổng sản phẩm:</span>
                    <span className="font-semibold">{cart.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tạm tính:</span>
                    <span className="font-semibold">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(total)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí vận chuyển:</span>
                    <span className="font-semibold text-blue-600">Miễn phí</span>
                  </div>
                </div>
                <div className="mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Tổng cộng:</span>
                    <span className="text-3xl font-bold text-red-600">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(total)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/checkout")}
                  style={gradientBtnStyle}
                  className="w-full py-3 rounded-lg font-bold text-lg hover:brightness-90"
                >
                  Tiếp tục thanh toán
                </button>
                <button
                  onClick={() => navigate("/home")}
                  className="w-full mt-3 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  Tiếp tục mua sắm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}