import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/Button';
import { OrdersIcon, ReportsIcon, LogsIcon, UsersIcon } from '../components/icons';

const AdminDashboardPage = ({ userInfo }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo || userInfo.role !== 'admin') {
      alert('Bạn không có quyền truy cập trang admin');
      navigate('/home');
    }
  }, [userInfo, navigate]);

  const [stats, setStats] = useState({ orders: 0, products: 0, reports: 0, logs: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const ordersRes = await api.get('/orders');
        const productsRes = await fetch('http://localhost:5000/api/products');
        const reportsRes = await api.get('/reports');
        const logsRes = await api.get('/admin-logs');

        setStats({
          orders: (ordersRes.data || []).length || 0,
          products: (await productsRes.json()).length || 0,
          reports: (reportsRes.data || []).length || 0,
          logs: (logsRes.data || []).length || 0,
        });
      } catch (err) {
        console.error('Lỗi fetch dashboard stats:', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gray-50" style={{ backgroundColor: "#FEF7F6" }}>
      <div className="max-w-6xl mx-auto ">
        <h1 className="text-2xl font-bold mb-4 ">Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ">
          <div className="bg-white p-4 rounded-lg shadow  hover:bg-slate-200 transition">
            <p className="text-sm text-gray-500">Tổng đơn hàng</p>
            <p className="text-2xl font-bold">{stats.orders}</p>
            <Link to="/admin/orders" className="text-sm text-indigo-600 hover:underline">Xem chi tiết</Link>
          </div>
          <div className="bg-white p-4 rounded-lg shadow  hover:bg-slate-200 transition">
            <p className="text-sm text-gray-500">Sản phẩm</p>
            <p className="text-2xl font-bold">{stats.products}</p>
            <Link to="/admin/products" className="text-sm text-indigo-600 hover:underline">Quản lý</Link>
          </div>
          <div className="bg-white p-4 rounded-lg shadow  hover:bg-slate-200 transition">
            <p className="text-sm text-gray-500">Báo cáo</p>
            <p className="text-2xl font-bold">{stats.reports}</p>
            <Link to="/admin/reports" className="text-sm text-indigo-600 hover:underline">Xem báo cáo</Link>
          </div>
          <div className="bg-white p-4 rounded-lg shadow  hover:bg-slate-200 transition">
            <p className="text-sm text-gray-500">Admin Logs</p>
            <p className="text-2xl font-bold">{stats.logs}</p>
            <Link to="/admin/logs" className="text-sm text-indigo-600 hover:underline">Xem logs</Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <div className="flex gap-4 mt-3">
            <Button
              onClick={() => navigate('/admin/orders')}
              size="md"
              icon={OrdersIcon}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow "
            >
              Quản lý đơn hàng
            </Button>
            <Button
              onClick={() => navigate('/admin/reports')}
              size="md"
              icon={ReportsIcon}
              className="bg-yellow-500 hover:bg-yellow-600 text-white shadow "
            >
              Tạo báo cáo
            </Button>
            <Button
              onClick={() => navigate('/admin/logs')}
              size="md"
              icon={LogsIcon}
              className="bg-gray-500 hover:bg-gray-600 text-white shadow"
            >
              Xem logs
            </Button>
            <Button
              onClick={() => navigate('/admin/users')}
              size="md"
              icon={UsersIcon}
              className="bg-green-500 hover:bg-green-600 text-white shadow"
            >
              Quản lý users
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
