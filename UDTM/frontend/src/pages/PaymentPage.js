import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

const PaymentPage = ({ onClearCart }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("vnpay");
  const [userInfo, setUserInfo] = useState(null);

  const orderId =
    new URLSearchParams(location.search).get("order_id") ||
    location.state?.order_id;

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    setUserInfo(user);

    if (orderId) fetchOrderDetails();
    else {
      setLoading(false);
      alert("Không tìm thấy đơn hàng");
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/${orderId}`);
      let orderData = response.data.order || response.data;

      if (orderData.items && Array.isArray(orderData.items)) {
        const enrichedItems = await Promise.all(
          orderData.items.map(async (item) => {
            if (!item.product_image && item.product_id) {
              try {
                const productRes = await api.get(`/products/${item.product_id}`);
                const product = productRes.data || {};
                return {
                  ...item,
                  product_image: product.photo || product.image || product.image_url || null,
                };
              } catch {
                return item;
              }
            }
            return item;
          })
        );
        orderData.items = enrichedItems;
      }

      setOrder(orderData);
    } catch (err) {
      console.error(err);
      alert("Lỗi tải thông tin đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!order) return;

    setProcessing(true);
    try {
      if (paymentMethod === "vnpay") {
        const payRes = await api.post("/vnpay/create", {
          orderId: order.order_id,
          amount: order.total_amount,
        });
        const payUrl = payRes.data?.payment_url;
        if (payUrl) window.location.href = payUrl;
        else throw new Error("Không nhận được URL thanh toán từ VNPay");
      } else if (paymentMethod === "cod") {
        await api.patch(`/orders/${order.order_id}`, {
          payment_method: "cod",
          payment_status: "success",
          order_status: "completed",
        });
        
        // Xóa giỏ hàng sau thanh toán COD
        if (onClearCart) {
          onClearCart();
        }
        
        alert("Đơn hàng xác nhận thành công! Sẽ được giao COD. Cảm ơn bạn!");
        navigate("/orders");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi thanh toán: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const proxiedImage = (url) => {
    if (!url) return "/logo192.png";
    if (url.includes("cloudinary.com") || url.includes("unsplash.com")) {
      return `/api/image-proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
  };

  const handleImageError = (e) => (e.target.src = "/logo192.png");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Đang tải thông tin đơn hàng...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Không tìm thấy đơn hàng</h1>
          <button
            onClick={() => navigate("/home")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  const orderItems = order.items || [];
  const totalAmount = order.total_amount || 0;
  const shippingFee = 30000;
  const subtotal = totalAmount - shippingFee;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-indigo-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Xác nhận thanh toán</h1>
          <p className="text-gray-600 mt-2">
            Mã đơn hàng: <span className="font-semibold">{order.order_id}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Info */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-transform transform hover:-translate-y-1">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">1</span>
                Thông tin giao hàng
              </h2>
              <div className="space-y-2 text-gray-700">
                <p><span className="font-semibold">Tên:</span> {userInfo?.full_name || userInfo?.username || "N/A"}</p>
                <p><span className="font-semibold">Điện thoại:</span> {userInfo?.phone || "Chưa cập nhật"}</p>
                <p><span className="font-semibold">Địa chỉ:</span> {userInfo?.address || "Chưa cập nhật"}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-transform transform hover:-translate-y-1">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-indigo-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">2</span>
                Chi tiết đơn hàng ({orderItems.length} sản phẩm)
              </h2>
              <div className="space-y-4">
                {orderItems.map((item, idx) => (
                  <div key={idx} className="flex gap-4 pb-4 border-b last:border-b-0">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.product_image || "/logo192.png"}
                        alt={item.product_name}
                        className="w-20 h-20 rounded-lg object-cover mr-4"
                        onError={(e) => e.target.src = "/logo192.png"}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 line-clamp-2">{item.product_name}</h3>
                      <p className="text-sm text-gray-600 mt-1">Số lượng: <span className="font-semibold">{item.quantity}</span></p>
                      <p className="text-sm text-gray-600">Giá: <span className="font-semibold">{item.price.toLocaleString()}đ</span></p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg text-red-600">{(item.subtotal || item.price * item.quantity).toLocaleString()}đ</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-transform transform hover:-translate-y-1">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">3</span>
                Phương thức thanh toán
              </h2>
              <div className="space-y-3">
                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${paymentMethod === "vnpay" ? "border-blue-600 bg-blue-50" : "border-gray-300 bg-white"}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="vnpay"
                    checked={paymentMethod === "vnpay"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-blue-600 cursor-pointer"
                  />
                  <div className="ml-4">
                    <p className="font-semibold text-gray-900">Thanh toán VNPay</p>
                    <p className="text-sm text-gray-600">Thẻ tín dụng / Thẻ ghi nợ / Ví điện tử</p>
                  </div>
                </label>

                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${paymentMethod === "cod" ? "border-green-600 bg-green-50" : "border-gray-300 bg-white"}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-green-600 cursor-pointer"
                  />
                  <div className="ml-4">
                    <p className="font-semibold text-gray-900">Thanh toán khi nhận hàng (COD)</p>
                    <p className="text-sm text-gray-600">Thanh toán tiền mặt khi nhận hàng</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-lg sticky top-24 hover:shadow-xl transition-transform transform hover:-translate-y-1">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Tóm tắt đơn hàng</h2>

              <div className="space-y-3 mb-6 pb-6 border-b">
                <div className="flex justify-between text-gray-700"><span>Tổng sản phẩm:</span><span>{orderItems.length}</span></div>
                <div className="flex justify-between text-gray-700"><span>Giá gốc:</span><span className="font-semibold">{subtotal.toLocaleString()}đ</span></div>
                <div className="flex justify-between text-gray-700"><span>Phí vận chuyển:</span><span className="font-semibold">{shippingFee.toLocaleString()}đ</span></div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Tổng cộng:</span>
                  <span className="text-3xl font-bold text-red-600">{totalAmount.toLocaleString()}đ</span>
                </div>
              </div>

              <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                <p>Trạng thái: <span className="font-semibold">Chờ thanh toán</span></p>
                <p className="mt-1">Phương thức: {paymentMethod === "vnpay" ? "VNPay" : "COD"}</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handlePayment}
                  disabled={processing}
                  className="w-full py-3 rounded-2xl text-white font-bold bg-gradient-to-r from-pink-500 to-red-500 hover:from-red-500 hover:to-pink-500 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? "Đang xử lý..." : paymentMethod === "vnpay" ? "Thanh toán VNPay" : "Xác nhận đặt hàng"}
                </button>

                <button
                  onClick={() => navigate("/home")}
                  disabled={processing}
                  className="w-full py-3 rounded-2xl font-semibold text-gray-900 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 transition disabled:bg-gray-200"
                >
                  Tiếp tục mua sắm
                </button>
              </div>

              <div className="mt-6 pt-6 border-t text-center text-xs text-gray-600">
                 Giao dịch được bảo mật 100%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
