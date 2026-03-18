import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const AdminProductsPage = ({ userInfo }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo || userInfo.role !== 'admin') {
      alert('Bạn không có quyền truy cập trang admin');
      navigate('/home');
    }
  }, [userInfo, navigate]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/products');
      const data = await res.json();
      setProducts(data || []);
    } catch (err) {
      console.error('Lỗi fetch products (admin):', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const deleteProduct = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    try {
      await api.delete(`/products/${id}`);
      alert('Đã xóa sản phẩm');
      fetchProducts();
    } catch (err) {
      console.error('Lỗi delete product:', err);
      alert('Không thể xóa sản phẩm');
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50" style={{ backgroundColor: "#FEF7F6" }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Quản lý sản phẩm</h1>
        {loading ? (<p>Loading...</p>) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map(p => (
              <div key={p.product_id || p._id} className="bg-white p-4 rounded shadow">
                <div className="flex gap-3 items-center">
                  <img src={p.photo || p.image_url || '/logo192.png'} className="w-20 h-20 object-cover" alt={p.product_name || p.name} />
                  <div className="flex-1">
                    <div className="font-semibold">{p.product_name || p.name}</div>
                    <div className="text-sm text-gray-500">{p.category}</div>
                    <div className="text-sm text-gray-500">{p.price?.toLocaleString()} VND</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => navigate(`/admin/edit-product/${p.product_id || p._id}`)} className="px-3 py-1 bg-indigo-400 text-white rounded hover:bg-indigo-700">Chỉnh sửa</button>
                    <button onClick={() => deleteProduct(p.product_id || p._id)} className="px-3 py-1 bg-red-400 text-white rounded hover:bg-red-700">Xóa</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProductsPage;