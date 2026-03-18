import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const [userInfo, setUserInfo] = useState({
    full_name: "",
    phone: "",
    email: "",
    address: "",
  });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const gradientTextStyle = {
    background: "linear-gradient(90deg, #60B4E8 0%, #FFC0CB 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent"
  };

  const gradientBtnStyle = {
    background: "linear-gradient(90deg, #60B4E8 0%, #FFC0CB 100%)",
    color: "#fff",
    boxShadow: "0 4px 14px rgba(96, 180, 232, 0.4)",
  };

  const inputStyle = "w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 transition";

  useEffect(() => {
    const stored = localStorage.getItem("userInfo");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUserInfo({
          full_name: parsed.full_name || parsed.name || "",
          phone: parsed.phone || "",
          email: parsed.email || "",
          address: parsed.address || "",
        });
      } catch (e) {
        console.error("Lỗi parse userInfo:", e);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const stored = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const merged = { ...stored, ...userInfo };
      localStorage.setItem("userInfo", JSON.stringify(merged));
      alert("Đã lưu thông tin tài khoản");
      navigate(-1);
    } catch (err) {
      console.error("Lỗi lưu thông tin:", err);
      alert("Lưu thất bại. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-extrabold mb-8" style={gradientTextStyle}>
          Cập nhật thông tin cá nhân
        </h1>

        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Họ tên</label>
              <input
                name="full_name"
                value={userInfo.full_name}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
              <input
                name="phone"
                value={userInfo.phone}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                name="email"
                value={userInfo.email}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ</label>
              <textarea
                name="address"
                value={userInfo.address}
                onChange={handleChange}
                className={`${inputStyle} resize-none`}
                rows={3}
              />
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition transform hover:scale-105"
                style={gradientBtnStyle}
              >
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>

              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 rounded-xl font-semibold bg-gray-200 hover:bg-gray-300 transition"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
