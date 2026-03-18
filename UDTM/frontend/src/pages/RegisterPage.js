import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState("buyer");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!fullName || !username || !email || !phone || !password || !confirmPassword || !address) {
      setErrorMsg("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Mật khẩu không khớp!");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg("Email không hợp lệ!");
      return;
    }

    if (!/^0\d{9}$/.test(phone)) {
      setErrorMsg("Số điện thoại phải có 10 chữ số bắt đầu bằng 0!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          username,
          email,
          phone,
          password,
          address,
          role,
          status: "active",
        }),
      });
      const data = await res.json();
      if (!res.ok) return setErrorMsg(data.message || "Đăng ký thất bại!");
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      setErrorMsg("Không thể kết nối máy chủ!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-pink-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 transform transition-all hover:scale-105">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Tạo tài khoản</h1>
            <p className="text-gray-600">Tham gia cộng đồng của chúng tôi ngay hôm nay</p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-lg text-sm font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {[
              { label: "Tên đầy đủ", value: fullName, setter: setFullName },
              { label: "Tên đăng nhập", value: username, setter: setUsername },
              { label: "Email", value: email, setter: setEmail, type: "email" },
              { label: "Số điện thoại", value: phone, setter: setPhone, type: "tel" },
            ].map((field, idx) => (
              <div key={idx}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{field.label}</label>
                <input
                  type={field.type || "text"}
                  placeholder={`Nhập ${field.label.toLowerCase()}`}
                  value={field.value}
                  onChange={(e) => field.setter(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-indigo-400 transition-all outline-none placeholder-gray-400"
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ</label>
              <textarea
                placeholder="Nhập địa chỉ của bạn"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows="2"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-indigo-400 transition-all outline-none placeholder-gray-400"
              />
            </div>

            {[{ label: "Mật khẩu", value: password, setter: setPassword }, { label: "Xác nhận mật khẩu", value: confirmPassword, setter: setConfirmPassword }].map((field, idx) => (
              <div key={idx}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{field.label}</label>
                <input
                  type="password"
                  placeholder={`Nhập ${field.label.toLowerCase()}`}
                  value={field.value}
                  onChange={(e) => field.setter(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-indigo-400 transition-all outline-none placeholder-gray-400"
                />
              </div>
            ))}

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Loại tài khoản</label>
              <div className="grid grid-cols-2 gap-3">
                {["buyer", "seller"].map((r) => (
                  <label
                    key={r}
                    className={`flex items-center p-3 border-2 rounded-xl cursor-pointer transition hover:border-indigo-600 ${role === r ? "bg-indigo-50 border-indigo-600" : "border-gray-200 bg-white"}`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r}
                      checked={role === r}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="ml-2 text-sm font-semibold text-gray-900">
                      {r === "buyer" ? "Người mua" : "Người bán"}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3 px-4 rounded-xl text-white font-bold bg-gradient-to-r from-indigo-500 to-pink-500 bg-[length:200%_200%] animate-gradient-x hover:from-pink-500 hover:to-indigo-500 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang đăng ký..." : "Tạo tài khoản"}
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-4">
            Bằng cách đăng ký, bạn đồng ý với Điều khoản sử dụng và Chính sách bảo mật
          </p>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-600 text-sm">
              Đã có tài khoản?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-indigo-600 hover:text-indigo-700 font-bold transition"
              >
                Đăng nhập
              </button>
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Thông tin của bạn được bảo mật 100%
          </p>
        </div>
      </div>

      {/* Tailwind custom animation */}
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
