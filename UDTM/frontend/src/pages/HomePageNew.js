import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export default function HomePageNew({ products: initialProducts = [], addToCart, user, cart, setUser }) {
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Gradient styles pastel xanh – hồng
  const gradientTextStyle = {
    background: "linear-gradient(90deg, #40a8e6 30%, #415ba8 50%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent"
  };

  const gradientBtnStyle = {
    background: "linear-gradient(90deg, #40a8e6 30%, #415ba8 50%)",
    color: "#fff"
  };

  // Read query string `q` to set initial searchTerm from Header search
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q") || params.get("search") || "";
    if (q && q !== searchTerm) setSearchTerm(q);
  }, [location.search]);

  // Load user info từ localStorage
  useEffect(() => {
    const stored = localStorage.getItem("userInfo");
    if (stored) {
      try {
        setUserInfo(JSON.parse(stored));
      } catch (e) {
        console.error("Lỗi parse userInfo:", e);
      }
    }
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data.data || data);
        }
      } catch (err) {
        console.error("Lỗi fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/products");
        if (res.ok) {
          const data = await res.json();
          setProducts(data.data || data);
          setError("");
        } else {
          setError("Không thể tải danh sách sản phẩm");
        }
      } catch (err) {
        console.error("Lỗi fetch products:", err);
        setError("Lỗi kết nối server");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter & Search
  useEffect(() => {
    let result = products;

    if (selectedCategory) {
      const sel = categories.find((c) => c._id === selectedCategory || c.category_id === selectedCategory);
      if (sel) {
        const { _id: selId, category_id: selCode, category_name: selName } = sel;
        result = result.filter((p) => {
          const prodCategoryId = p.category_id || null;
          const prodCategoryField = p.category;
          if (prodCategoryId && prodCategoryId === selCode) return true;
          if (prodCategoryField && typeof prodCategoryField === 'object' && prodCategoryField._id === selId) return true;
          if (prodCategoryField && typeof prodCategoryField === 'string' && (prodCategoryField === selName || prodCategoryField === selCode)) return true;
          if (p._id && p._id === selId) return true;
          return false;
        });
      }
    }

    if (searchTerm) {
      result = result.filter(
        (p) =>
          (p.product_name && p.product_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (p.short_description && p.short_description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (sortBy === "price_asc") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "price_desc") result.sort((a, b) => b.price - a.price);
    else if (sortBy === "newest") result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    else if (sortBy === "popular") result.sort((a, b) => b.stock - a.stock);

    setFilteredProducts(result);
  }, [products, selectedCategory, searchTerm, sortBy]);

  const handleAddToCart = (product) => {
    if (!userInfo) {
      alert("Vui lòng đăng nhập trước!");
      navigate("/login");
      return;
    }
    if (addToCart) addToCart(product);
    alert(`Đã thêm ${product.product_name || product.name} vào giỏ hàng`);
  };

  const handleViewDetails = (productId) => navigate(`/product/${productId}`);

  const proxiedImage = (url) => {
    if (!url) return url;
    try {
      const u = new URL(url);
      if (u.hostname.includes("cloudinary.com") || u.hostname.includes("images.unsplash.com")) {
        return `${API_BASE}/api/image-proxy?url=${encodeURIComponent(url)}`;
      }
    } catch (e) {
      return url;
    }
    return url;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#c5e7fb] to-[#506fca] text-white py-4 px-6">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ ...gradientTextStyle }}>Chào mừng đến TEO</h1>
            <p className="text-white text-sm mt-1">Điện thoại, Laptop, Phụ kiện chính hãng giá tốt</p>
          </div>
          {userInfo && (
            <div className="text-right">
              <p className="text-xs opacity-75">Xin chào,</p>
              <p className="text-sm font-semibold truncate max-w-[120px]">{userInfo.full_name || userInfo.username}</p>
            </div>
          )}
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="bg-blue-50 sticky top-16 z-40 shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tìm theo xu hướng</label>
              <div className="flex gap-2 flex-wrap">
                {["iPhone", "Laptop", "Sạc"].map((term) => (
                  <button
                    key={term}
                    onClick={() => { setSearchTerm(term); window.scrollTo({ top: 400, behavior: "smooth" }); }}
                    className="px-4 py-2 bg-gradient-to-r from-[#60B4E8] to-[#ffdbe1] text-white rounded-lg text-sm font-semibold border-2 border-[#60B4E8] hover:border-[#FFC0CB] hover:shadow-md transition-all"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Danh mục</label>
              <select
                value={selectedCategory || ""}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#60B4E8]"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((cat) => (
                  <option key={cat._id || cat.category_id} value={cat._id || cat.category_id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sắp xếp</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#60B4E8]"
              >
                <option value="newest">Mới nhất</option>
                <option value="popular">Phổ biến</option>
                <option value="price_asc">Giá thấp → cao</option>
                <option value="price_desc">Giá cao → thấp</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div className="text-gray-600">
            <p className="font-semibold text-lg">{isLoading ? "Đang tải sản phẩm..." : `Tìm thấy ${filteredProducts.length} sản phẩm`}</p>
          </div>
          {(searchTerm || selectedCategory) && (
            <button
              onClick={() => { setSearchTerm(""); setSelectedCategory(null); }}
              className="text-[#8ad2ff] hover:text-[#FFC0CB] font-semibold flex items-center gap-1"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-6 flex items-start gap-3">
            <span>{error}</span>
          </div>
        )}

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-[#60B4E8]"></div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product._id || product.product_id}
                className="bg-white rounded-lg border border-gray-200 hover:border-[#f82a4c] hover:shadow-lg transition-all duration-300 overflow-hidden group"
              >
                <div className="relative h-40 bg-gray-100 overflow-hidden">
                  {product.photo ? (
                    <img
                      src={proxiedImage(product.photo)}
                      alt={product.product_name || product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m0 0l8 4m-8-4v10l8 4m0-10l8 4m-8-4v10" />
                      </svg>
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-red-600 text-white px-3 py-1 rounded font-bold text-sm">HẾT HÀNG</span>
                    </div>
                  )}
                </div>

                <div className="p-3">
                  <p className="text-xs text-gray-500 font-semibold uppercase mb-1">
                    {(() => {
                      const id = product.category_id || (product.category && product.category._id) || product.category;
                      const cat = categories.find((c) => c._id === id || c.category_id === id);
                      return cat ? cat.category_name : "Khác";
                    })()}
                  </p>

                  <h3 className="text-sm font-bold line-clamp-2 mb-2 group-hover:text-[#22a34d]" style={{ ...gradientTextStyle }}>
                    {product.product_name || product.name}
                  </h3>

                  {product.short_description && (
                    <p className="text-xs text-gray-600 line-clamp-1 mb-2">{product.short_description}</p>
                  )}

                  <div className="mb-3 pb-3 border-b border-gray-200">
                    <p className="text-lg font-bold text-red-600">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.price)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      {product.stock > 0 ? `${product.stock} sản phẩm có sẵn` : "Hết hàng"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewDetails(product._id || product.product_id)}
                      className="flex-1 px-2 py-2 border-2 border-gray-300 text-gray-700 rounded hover:border-[#60B4E8] hover:text-[#60e8a0] text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                    >
                      Chi tiết
                    </button>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      style={gradientBtnStyle}
                      className="flex-1 px-2 py-2 rounded disabled:bg-gray-400 disabled:cursor-not-allowed text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                    >
                      Mua
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-gray-600 text-lg font-semibold mb-6">Không tìm thấy sản phẩm nào</p>
            <button
              onClick={() => { setSearchTerm(""); setSelectedCategory(null); }}
              style={gradientBtnStyle}
              className="px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Xóa bộ lọc và thử lại
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
