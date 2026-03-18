import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function PaymentCallbackPage() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState("checking");
  const navigate = useNavigate();

  useEffect(() => {
    const checkPayment = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/vnpay/return?" + params.toString()
        );

        const data = await res.json();
        setStatus(data.code === "00" ? "success" : "failed");
      } catch (err) {
        setStatus("failed");
      }
    };

    checkPayment();
  }, []);

  return (
    <div className="text-center mt-20">
      {status === "checking" && <p>Đang xác minh...</p>}
      {status === "success" && (
        <h1 className="text-green-600 text-2xl">Thanh toán thành công!</h1>
      )}
      {status === "failed" && (
        <h1 className="text-red-600 text-2xl">Thanh toán thất bại!</h1>
      )}

      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={() => navigate("/orders")}
      >
        Xem đơn hàng
      </button>
    </div>
  );
}
