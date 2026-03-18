import React from "react";
import proxiedImage from "../utils/image";

export default function CartItem({ product, removeFromCart, updateCartItem }) {
  const decrease = () => {
    const next = Math.max(1, (product.quantity || 1) - 1);
    if (updateCartItem) updateCartItem(product.id, next);
  };

  const increase = () => {
    const next = (product.quantity || 1) + 1;
    if (updateCartItem) updateCartItem(product.id, next);
  };

  const subtotal = (product.price || 0) * (product.quantity || 1);

  return (
    <div className="flex gap-4 p-4 border border-gray-200 rounded bg-white hover:shadow-md transition">
      {/* Product Image */}
      <div className="w-24 h-24 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
        {product.photo || product.image || product.photoURL ? (
          <img
            src={proxiedImage(product.photo || product.image || product.photoURL)}
            alt={product.name || product.product_name}
            className="w-full h-full object-cover"
            onError={(e) => (e.target.src = "https://via.placeholder.com/200?text=No+Image")}
          />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h18v18H3V3z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 14l2.5-3 2 2.5L16 10l4 6H4l4-2z"
            />
          </svg>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-semibold text-gray-900">{product.name || product.product_name}</p>
            <p className="text-sm text-gray-600">Mã: {product.product_id || "-"}</p>
          </div>
          <button
            onClick={() => removeFromCart(product.id)}
            className="text-gray-400 hover:text-red-600 p-1"
            title="Xóa khỏi giỏ"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"
              />
            </svg>
          </button>
        </div>

        {/* Price and Quantity Controls */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <button
              onClick={decrease}
              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              title="Giảm"
            >
              −
            </button>
            <span className="px-3 py-1 border border-gray-300 rounded text-center min-w-[40px]">
              {product.quantity || 1}
            </span>
            <button
              onClick={increase}
              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              title="Tăng"
            >
              +
            </button>
          </div>

          <div className="text-right">
            <p className="text-lg font-bold text-red-600">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(subtotal)}
            </p>
            <p className="text-sm text-gray-500">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(product.price || 0)}{" "}
              / cái
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

