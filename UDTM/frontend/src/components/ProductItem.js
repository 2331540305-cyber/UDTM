import React, { useState } from "react";
import proxiedImage from "../utils/image";
import { useNavigate } from "react-router-dom";

export default function ProductItem({ product, onAddToCart, onViewDetails }) {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(product._id || product.product_id);
    } else {
      navigate(`/product/${product._id || product.product_id}`);
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {product.photo ? (
          <img
            src={proxiedImage(product.photo)}
            alt={product.product_name || product.name}
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            📦 No Image
          </div>
        )}

        {/* Stock Badge */}
        <div className="absolute top-2 right-2">
          {product.stock > 0 ? (
            <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
              ✅ Có sẵn
            </span>
          ) : (
            <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
              ❌ Hết hàng
            </span>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
          {product.category || "Khác"}
        </p>

        {/* Product Name */}
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 hover:text-[#5FB4E8]">
          {product.product_name || product.name}
        </h3>

        {/* Description */}
        {(product.short_description || product.description) && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">
            {product.short_description || product.description}
          </p>
        )}

        {/* Price */}
        <div className="mb-3">
          <p className="text-lg font-bold text-[#5FB4E8]">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(product.price)}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleViewDetails}
            className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs font-medium transition-colors"
          >
            Chi tiết
          </button>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex-1 px-3 py-2 bg-[#5FB4E8] text-white rounded hover:bg-[#4da6d8] disabled:bg-gray-300 disabled:cursor-not-allowed text-xs font-medium transition-colors"
          >
            🛒 Thêm
          </button>
        </div>
      </div>
    </div>
  );
}
