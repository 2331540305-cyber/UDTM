import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { RefreshIcon } from '../components/icons';

const AdminOrdersPage = ({ userInfo }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo || userInfo.role !== 'admin') {
      alert('Bạn không có quyền truy cập trang admin');
      navigate('/home');
    }
  }, [userInfo, navigate]);

  const [orders, setOrders] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders');
      setOrders(res.data || []);
    } catch (err) {
      console.error('Lỗi fetch orders (admin):', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filtered = orders.filter(o => {
    if (!q) return true;
    return (
      o.order_id?.includes(q) ||
      o.user_id?.includes(q) ||
      o.items?.some(it => it.product_name?.toLowerCase().includes(q.toLowerCase()))
    );
  });

  return (
    <div className="min-h-screen p-8 bg-gray-50" style={{ backgroundColor: "#FEF7F6" }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Quản lý đơn hàng</h1>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Tìm kiếm theo ID, buyer hoặc tên sản phẩm"
            className="flex-1 p-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Button
            onClick={fetchOrders}
            variant="primary"
            size="md"
            icon={RefreshIcon}
            className="shadow bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
          >
            Refresh
          </Button>
        </div>

        {loading ? (
          <p>Đang tải đơn hàng...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-600">Không tìm thấy đơn hàng nào</p>
        ) : (
          <div className="space-y-6">
            {filtered.map(order => (
              <div key={order.order_id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Order ID: {order.order_id}</p>
                    <p className="text-sm text-gray-500">Buyer: {order.user_id}</p>
                    <p className="text-sm text-gray-500">
                      Trạng thái: {order.order_status} / {order.payment_status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">{order.total_amount?.toLocaleString()} VND</p>
                    <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <ul className="space-y-3">
                    {order.items?.map(it => (
                      <li key={it.product_id} className="flex items-center gap-4">
                        <img
                          src={it.product_image || '/logo192.png'}
                          alt={it.product_name}
                          className="w-14 h-14 rounded object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium">{it.product_name}</p>
                          <p className="text-xs text-gray-500">
                            qty: {it.quantity} x {it.price?.toLocaleString()} VND
                          </p>
                          <p className="text-xs text-gray-500">Seller ID: {it.seller_id}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrdersPage;
