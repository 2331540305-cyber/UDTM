import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Header({ userInfo, cartCount = 0 }) {
  const [localCount, setLocalCount] = useState(cartCount);
  const [searchInput, setSearchInput] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [pulse, setPulse] = useState(false);
  const navigate = useNavigate();

  // Khi prop cartCount thay đổi, cập nhật local state và kích hoạt animation
  useEffect(() => {
    if (cartCount !== localCount) {
      setLocalCount(cartCount);
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 350);
      return () => clearTimeout(t);
    }
  }, [cartCount]);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");
    alert("Đã đăng xuất!");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 shadow-lg text-white" style={{ 
  background: "linear-gradient(90deg, #A7D8FF 0%, #FFC1E3 100%)" 
}}>
  <div className="container mx-auto px-4 py-3">
    <div className="flex justify-between items-center">
      {/* Logo */}
      <Link
        to="/home"
        className="text-2xl font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
      >
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 4a2 2 0 012-2h6a2 2 0 012 2v16a2 2 0 01-2 2H9a2 2 0 01-2-2V4z" />
          <path d="M11 18h2v1h-2z" opacity="0.5" />
        </svg>
        <span className="text-2xl font-bold">TEO</span>
      </Link>

      {/* Search Bar */}
      <div className="hidden md:flex flex-1 mx-6">
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const q = searchInput.trim();
              if (q) navigate(`/home?q=${encodeURIComponent(q)}`);
              else navigate("/home");
            }
          }}
          className="w-full max-w-[720px] px-4 py-2 rounded-l-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-200"
        />
        <button
          onClick={() => {
            const q = searchInput.trim();
            if (q) navigate(`/home?q=${encodeURIComponent(q)}`);
            else navigate("/home");
          }}
          className="px-4 py-2 rounded-r-lg transition-colors"
          style={{
            background: "linear-gradient(90deg, #60B4E8 0%, #FF9ED1 100%)",
            color: "#fff",
          }}
        >
          <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>

      {/* Right Menu */}
      <div className="flex items-center gap-6">
        {/* Cart - chỉ dành cho buyer */}
        {userInfo?.role === "buyer" && (
          <Link
            to="/cart"
            className="relative hover:opacity-90 transition-all p-2 rounded-lg flex items-center gap-1"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {localCount > 0 && (
              <span className={`absolute -top-1 -right-1 bg-white text-blue-600 text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold transform ${pulse ? 'scale-110 animate-pulse' : ''}`}>
                {localCount}
              </span>
            )}
          </Link>
        )}

        {/* User Menu */}
        {userInfo ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm opacity-75">Xin chào</p>
              <p className="text-sm font-semibold truncate max-w-[120px]">{userInfo.full_name || userInfo.username}</p>
            </div>
            <div className="flex gap-2">
              {userInfo?.role === "seller" && (
                <button
                  onClick={() => navigate("/seller")}
                  className="p-2 rounded-lg transition-colors border-2 border-white"
                  style={{
                    background: "linear-gradient(90deg, #A7D8FF 0%, #FFC1E3 100%)",
                    color: "#fff"
                  }}
                  title="Quản lý cửa hàng"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                  </svg>
                </button>
              )}
              {userInfo?.role === "admin" && (
                <button
                  onClick={() => navigate('/admin')}
                  className="p-2 rounded-lg transition-colors border-2 border-white"
                  style={{
                    background: "linear-gradient(90deg, #A7D8FF 0%, #FFC1E3 100%)",
                    color: "#fff"
                  }}
                  title="Admin Dashboard"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zM13 3v6h8V3h-8zm0 10h8v8h-8v-8z" />
                  </svg>
                </button>
              )}
              {userInfo?.role === "buyer" && (
                <button
                  onClick={() => navigate("/orders")}
                  className="p-2 rounded-lg transition-colors border-2 border-white"
                  style={{
                    background: "linear-gradient(90deg, #A7D8FF 0%, #FFC1E3 100%)",
                    color: "#fff"
                  }}
                  title="Xem đơn hàng"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 3H5a2 2 0 00-2 2v14a2 2 0 002 2h4m0 0h10a2 2 0 002-2V5a2 2 0 00-2-2h-4m0 0V1m0 0h2v2h-2V1z" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => navigate("/payment-history")}
                className="p-2 rounded-lg transition-colors border-2 border-white"
                style={{
                  background: "linear-gradient(90deg, #A7D8FF 0%, #FFC1E3 100%)",
                  color: "#fff"
                }}
                title="Lịch sử giao dịch"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                </svg>
              </button>
              <button
                onClick={() => navigate("/profile")}
                className="p-2 rounded-lg transition-colors border-2 border-white"
                style={{
                  background: "linear-gradient(90deg, #A7D8FF 0%, #FFC1E3 100%)",
                  color: "#fff"
                }}
                title="Tài khoản"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12a3 3 0 100-6 3 3 0 000 6z" />
                  <path fillRule="evenodd" d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1zM7 12a5 5 0 1110 0 5 5 0 01-10 0z" />
                </svg>
              </button>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg transition-colors border-2"
                style={{
                  background: "linear-gradient(90deg, #60B4E8 0%, #FF9ED1 100%)",
                  borderColor: "#60B4E8",
                  color: "#fff"
                }}
                title="Đăng xuất"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 3a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2H5zm6 13H7v-3h4v3zm0-5H7v-3h4v3zm6-4a1 1 0 011 1v10a1 1 0 01-1 1h-2v-2h2V8h-2V6h2z" />
                  <path d="M18 11h3v2h-3z" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
              style={{
                background: "#fff",
                color: "#60B4E8"
              }}
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              style={{
                background: "linear-gradient(90deg, #60B4E8 0%, #FF9ED1 100%)",
                color: "#fff",
                border: "2px solid #60B4E8"
              }}
            >
              Đăng ký
            </Link>
          </div>
        )}
      </div>
    </div>
  </div>
</header>

  );
}
