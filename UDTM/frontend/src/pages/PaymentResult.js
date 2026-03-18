import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function PaymentResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const query = new URLSearchParams(location.search);
  const responseCode = query.get("vnp_ResponseCode"); // VNPay return field

  const isSuccess = responseCode === "00";

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 px-6">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center w-full max-w-md">
        {isSuccess ? (
          <>
            <h1 className="text-3xl text-green-600 font-bold">
              🎉 Thanh toán thành công!
            </h1>
            <p className="mt-2">Cảm ơn bạn đã mua hàng ❤️</p>
          </>
        ) : (
          <>
            <h1 className="text-3xl text-red-600 font-bold">
              ❌ Thanh toán thất bại
            </h1>
            <p className="mt-2">Vui lòng thử lại sau.</p>
          </>
        )}

        <button
          onClick={() => navigate("/orders")}
          className="mt-5 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Xem đơn hàng
        </button>
      </div>
    </div>
  );
}
