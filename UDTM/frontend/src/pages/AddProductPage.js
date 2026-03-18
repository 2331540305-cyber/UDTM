import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const AddProductPage = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [trailerUrl, setTrailerUrl] = useState("");
  const [trailerFile, setTrailerFile] = useState(null);
  const [trailerPreview, setTrailerPreview] = useState(null);

  const [formData, setFormData] = useState({
    product_name: "",
    short_description: "",
    description: "",
    price: "",
    stock: "",
    category_id: "",
    category: "",
    photo: "",
    trailer: "",
    status: "active",
  });

  const [errors, setErrors] = useState({});

  // Gradient pastel xanh – hồng cho text và button
  const gradientTextStyle = {
    background: "linear-gradient(90deg, #60B4E8 30%, #FFC0CB 70%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  };

  const gradientBtnStyle = {
    background: "linear-gradient(90deg, #60B4E8 30%, #FFC0CB 70%)",
    color: "#fff",
  };

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("userInfo"));
    if (!stored || stored.role !== "seller") {
      alert("Chỉ seller mới có quyền thêm sản phẩm");
      navigate("/home");
      return;
    }
    setUserInfo(stored);

    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");
        const catList = Array.isArray(res.data) ? res.data : (res.data.categories || []);
        setCategories(catList);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, [navigate]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.product_name.trim()) newErrors.product_name = "Tên sản phẩm là bắt buộc";
    if (!formData.price || formData.price <= 0) newErrors.price = "Giá phải lớn hơn 0";
    if (!formData.stock || formData.stock < 0) newErrors.stock = "Số lượng không được âm";
    if (!formData.category_id) newErrors.category_id = "Vui lòng chọn danh mục";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCategoryChange = (e) => {
    const selectedId = e.target.value;
    const selectedCategory = categories.find((c) => c.category_id === selectedId);
    setFormData((prev) => ({
      ...prev,
      category_id: selectedId,
      category: selectedCategory?.category_name || "",
    }));
    if (errors.category_id) setErrors((prev) => ({ ...prev, category_id: "" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return alert("Vui lòng chọn tệp hình ảnh");
    if (file.size > 5 * 1024 * 1024) return alert("Kích thước hình ảnh không được vượt quá 5MB");
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleTrailerFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024 * 1024) return alert("Kích thước video không được vượt quá 500MB");
    setTrailerFile(file);
    setTrailerUrl("");
    const reader = new FileReader();
    reader.onloadend = () => setTrailerPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const uploadImage = async () => {
    if (!imageFile) return null;
    const uploadData = new FormData();
    uploadData.append("file", imageFile);
    try {
      const res = await api.post("/upload", uploadData, { headers: { "Content-Type": "multipart/form-data" } });
      return res.data.url || null;
    } catch (err) {
      alert("Lỗi tải ảnh: " + err.message);
      return null;
    }
  };

  const uploadTrailerFile = async () => {
    if (!trailerFile) return null;
    const uploadData = new FormData();
    uploadData.append("file", trailerFile);
    try {
      const res = await api.post("/upload", uploadData, { headers: { "Content-Type": "multipart/form-data" } });
      return res.data.url || null;
    } catch (err) {
      console.warn("Lỗi tải video:", err.message); 
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      let photoUrl = formData.photo;
      let finalTrailerUrl = trailerUrl;

      if (imageFile) {
        const uploadedImage = await uploadImage();
        if (!uploadedImage) return setLoading(false);
        photoUrl = uploadedImage;
      }

      if (trailerFile) {
        const uploadedTrailer = await uploadTrailerFile();
        if (!uploadedTrailer) return setLoading(false);
        finalTrailerUrl = uploadedTrailer;
      }

      const res = await api.post("/seller/products", {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        photo: photoUrl,
        trailer: finalTrailerUrl || "",
      });

      if (res.data.success) {
        alert("Sản phẩm đã được thêm thành công!");
        navigate("/seller");
      } else alert("Thêm sản phẩm thành công");
    } finally {
      setLoading(false);
    }
  };

  if (!userInfo) return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c5e7fb] via-[#a2c4f8] to-[#ffdbe1] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <button onClick={() => navigate("/seller")} className="mb-4 flex items-center gap-2 font-semibold" style={{ color: "#313b7d" }}>
            ← Quay lại
          </button>
          <h1 className="text-3xl font-bold" style={{ color: "#313b7d" }}>Thêm sản phẩm mới</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow">
          {/* Product Name */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Tên sản phẩm <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="product_name"
              value={formData.product_name}
              onChange={handleInputChange}
              placeholder="Nhập tên sản phẩm"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 ${
                errors.product_name ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.product_name && <p className="text-red-500 text-sm mt-1">{errors.product_name}</p>}
          </div>

          {/* Category */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Danh mục <span className="text-red-500">*</span></label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleCategoryChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((cat) => (
                <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
              ))}
            </select>
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Giá (₫) <span className="text-red-500">*</span></label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                step="1000"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 ${
                  errors.price ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Số lượng <span className="text-red-500">*</span></label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 ${
                  errors.stock ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
          </div>

          {/* Short Description */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Mô tả ngắn</label>
            <input
              type="text"
              name="short_description"
              value={formData.short_description}
              onChange={handleInputChange}
              placeholder="Mô tả ngắn về sản phẩm"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Mô tả chi tiết</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Nhập mô tả chi tiết sản phẩm"
              rows="5"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>

          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Hình ảnh minh họa</label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input type="file" accept="image/*" onChange={handleImageChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"/>
                <p className="text-xs text-gray-500 mt-1">Tối đa 5MB, định dạng: JPG, PNG, GIF</p>
              </div>
              {imagePreview && <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-lg border border-gray-300"/>}
            </div>
          </div>

          {/* Trailer */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Video Trailer (Tùy chọn)</label>
            <div className="space-y-3">
              <input type="url" value={trailerUrl} onChange={(e)=>setTrailerUrl(e.target.value)} placeholder="https://youtu.be/..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"/>
              <input type="file" accept="video/*" onChange={handleTrailerFileChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"/>
              {(trailerUrl || trailerPreview) && (
                <div className="mt-3 bg-gray-100 p-3 rounded-lg">
                  {trailerPreview ? (
                    <video width="100%" height="200" controls className="rounded-lg">
                      <source src={trailerPreview} type="video/mp4"/>
                    </video>
                  ) : trailerUrl.includes("youtu") ? (
                    <iframe width="100%" height="200" src={`https://www.youtube.com/embed/${trailerUrl.split("v=")[1]?.split("&")[0]}`} title="Video Preview" allowFullScreen className="rounded-lg"></iframe>
                  ) : (
                    <video width="100%" height="200" controls className="rounded-lg">
                      <source src={trailerUrl} type="video/mp4"/>
                    </video>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Trạng thái</label>
            <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300">
              <option value="active">Hoạt động</option>
              <option value="inactive">Ẩn</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button type="submit" disabled={loading} style={{ color: "#313b7d" }} className="flex-1 py-2 rounded-lg font-semibold hover:bg-blue-400 transition ">
              {loading ? "Đang xử lý..." : "Thêm sản phẩm"}
            </button>
            <button type="button" onClick={()=>navigate("/seller")} className="flex-1 py-2 rounded-lg bg-slate-300 text-gray-100 hover:bg-slate-400 transition">
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductPage;
