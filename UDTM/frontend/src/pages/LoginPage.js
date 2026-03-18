import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase.js";

export default function LoginPage({ user, setUser }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!identifier || !password) return alert("Vui lòng nhập đầy đủ thông tin!");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message || "Sai thông tin đăng nhập!");
      localStorage.setItem("userInfo", JSON.stringify(data));
      if (data.token) localStorage.setItem("token", data.token);
      alert("Đăng nhập thành công!");
      // Nếu là admin, chuyển tới admin dashboard
      if (data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/home');
      }
    } catch (err) {
      console.error(err);
      alert("Không thể kết nối máy chủ!");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;
      const res = await fetch("http://localhost:5000/api/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: googleUser.email,
          displayName: googleUser.displayName,
          googleUid: googleUser.uid,
          photoURL: googleUser.photoURL,
        }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message || "Không thể xác thực tài khoản!");
      localStorage.setItem("userInfo", JSON.stringify(data));
      if (data.token) localStorage.setItem("token", data.token);
      alert("Đăng nhập Google thành công!");
      if (data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/home');
      }
    } catch (error) {
      console.error(error);
      alert(error.message || "Lỗi đăng nhập Google");
    } finally {
      setLoadingGoogle(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-pink-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 transform transition-all hover:scale-105">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Đăng nhập</h1>
            <p className="text-gray-600">Chào mừng bạn trở lại</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email / Username / SĐT</label>
              <input
                type="text"
                placeholder="Nhập email, username hoặc sđt"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-indigo-400 transition-all outline-none placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu</label>
              <input
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-indigo-400 transition-all outline-none placeholder-gray-400"
              />
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => alert("Tính năng khôi phục mật khẩu sẽ sớm có")}
                className="text-sm text-pink-500 hover:text-indigo-600 font-semibold transition"
              >
                Quên mật khẩu?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-white font-bold bg-gradient-to-r from-indigo-500 to-pink-500 bg-[length:200%_200%] animate-gradient-x hover:from-pink-500 hover:to-indigo-500 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-sm text-gray-500 font-medium">Hoặc</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          <div className="space-y-3 mb-6">
            <button
              onClick={handleGoogleLogin}
              disabled={loadingGoogle}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-semibold text-gray-900 bg-gradient-to-r from-pink-200 to-indigo-200 bg-[length:200%_200%] animate-gradient-x hover:from-indigo-400 hover:to-pink-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loadingGoogle ? "Đang kết nối..." : "Đăng nhập với Google"}
            </button>
          </div>

          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Chưa có tài khoản?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-pink-500 hover:text-indigo-600 font-bold transition"
              >
                Tạo tài khoản ngay
              </button>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">Thông tin của bạn được bảo mật 100%</p>
          </div>
        </div>
      </div>

      {/* Custom Tailwind Animation */}
      <style>
        {`
          @keyframes gradient-x {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-gradient-x {
            animation: gradient-x 3s ease infinite;
          }
        `}
      </style>
    </div>
  );
}
