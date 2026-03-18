import React, { useEffect, useState } from "react";
import Button from '../components/Button';
import { PlusIcon } from '../components/icons';
import proxiedImage from "../utils/image";
import { useParams, useNavigate } from "react-router-dom";

export default function ProductDetailPage({ addToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [mainImage, setMainImage] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/products/${id}`);
        if (!res.ok) throw new Error("Không thể lấy sản phẩm");
        const data = await res.json();
        const prod = data.data || data;
        setProduct(prod);
        const imgs = prod.images || (prod.photo ? [prod.photo] : []);
        setMainImage(imgs[0] || null);
        setError("");
      } catch (err) {
        console.error("Lỗi khi fetch product:", err);
        setError("Không thể tải sản phẩm. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  
  const getTrailerUrl = (p) => {
    if (!p) return null;
    return p.trailer || p.trailer_url || p.video || null;
  };

  const handleAdd = () => {
    if (!product) return;
    const item = { ...product, quantity: qty };
    if (addToCart) addToCart(item);
    navigate('/cart');
  };

  if (loading) return (
    <div className="p-8 flex justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-red-600"></div>
    </div>
  );

  if (error) return (
    <div className="p-8 text-center text-red-600">{error}</div>
  );

  if (!product) return (
    <div className="p-8 text-center">Sản phẩm không tồn tại</div>
  );

  const images = product.images || (product.photo ? [product.photo] : []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Images */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded shadow p-4">
                <div className="mb-4">
              {/* Trailer (YouTube embed or direct video) */}
              {getTrailerUrl(product) ? (
                (() => {
                  const url = getTrailerUrl(product);
                  const isYouTube = /youtube\.com|youtu\.be/.test(url);
                  if (isYouTube) {
                    // convert to embed URL
                    let videoId = null;
                    const ytMatch = url.match(/[?&]v=([^&/]+)/);
                    if (ytMatch && ytMatch[1]) videoId = ytMatch[1];
                    else {
                      const short = url.match(/youtu\.be\/(.+)$/);
                      if (short && short[1]) videoId = short[1];
                    }
                    const embed = videoId ? `https://www.youtube.com/embed/${videoId}` : url;
                    return (
                      <div className="w-full h-96 bg-black">
                        <iframe title="Trailer" src={embed} className="w-full h-full" frameBorder="0" allowFullScreen></iframe>
                      </div>
                    );
                  }
                  // fallback to HTML5 video player
                  return (
                    <video controls src={url} className="w-full h-96 object-contain bg-black" />
                  );
                })()
              ) : mainImage ? (
                <img src={proxiedImage(mainImage)} alt={product.product_name || product.name} className="w-full h-96 object-contain" />
              ) : (
                <div className="w-full h-96 flex items-center justify-center bg-gray-100 text-gray-400">No image</div>
              )}
            </div>

            <div className="flex gap-3">
              {images.map((src, idx) => (
                <button key={idx} onClick={() => setMainImage(src)} className="border rounded p-1 bg-white">
                  <img src={proxiedImage(src)} alt={`thumb-${idx}`} className="w-20 h-20 object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Info */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded shadow p-6">
            <h1 className="text-2xl font-bold mb-2">{product.product_name || product.name}</h1>
            <p className="text-sm text-gray-500 mb-4">Mã: {product.product_id || product._id}</p>

            <div className="flex items-center gap-4 mb-4">
              <p className="text-3xl font-bold text-red-600">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price || 0)}
              </p>
              <p className="text-sm text-gray-500">{product.stock > 0 ? `${product.stock} sản phẩm có sẵn` : 'Hết hàng'}</p>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold mb-2">Mô tả</h4>
              <div className="text-sm text-gray-700 leading-relaxed">
                {product.short_description || product.description || 'Không có mô tả'}
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <label className="text-sm">Số lượng</label>
              <input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} className="w-20 px-3 py-2 border rounded" />
              <Button onClick={handleAdd} disabled={product.stock === 0} variant="danger" size="md" icon={PlusIcon}>Thêm vào giỏ</Button>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Chi tiết sản phẩm</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                {product.seller_id && <li><strong>Người bán:</strong> {product.seller_id}</li>}
                {product.category && <li><strong>Danh mục:</strong> {product.category}</li>}
                {product.status && <li><strong>Trạng thái:</strong> {product.status}</li>}
                {product.created_at && <li><strong>Ngày tạo:</strong> {new Date(product.created_at).toLocaleString()}</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
