import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

// SVG Icons
const ChartIcon = () => (
  <svg className="inline w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="inline w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const TrashIcon = () => (
  <svg className="inline w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const SearchIcon = () => (
  <svg className="inline w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="inline w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 1119.414 9.414 1 1 0 01-1.414-1.414A5.002 5.002 0 104.659 5.259V4a1 1 0 01-1-1zm5 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
  </svg>
);

const ClearIcon = () => (
  <svg className="inline w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const DeleteIcon = () => (
  <svg className="inline w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const AdminLogsPage = ({ userInfo }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo || userInfo.role !== 'admin') {
      alert('Bạn không có quyền truy cập trang admin');
      navigate('/home');
    }
  }, [userInfo, navigate]);

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [showStats, setShowStats] = useState(false);

  // Bộ lọc
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    action: '',
    target_type: '',
    admin_id: '',
    start_date: '',
    end_date: '',
    search: '',
  });

  // Phân trang
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    pages: 1,
  });

  const fetchLogs = async (filterParams = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: filters.page,
        limit: filters.limit,
        ...filters,
        ...filterParams,
      });

      const res = await api.get(`/admin-logs?${params}`);
      setLogs(res.data.logs || []);
      setPagination(res.data.pagination || {});
    } catch (err) {
      console.error('Lỗi fetch logs:', err);
      alert('Lỗi khi tải logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const res = await api.get('/admin-logs/statistics/overview');
      setStatistics(res.data);
      setShowStats(true);
    } catch (err) {
      console.error('Lỗi fetch thống kê:', err);
      alert('Lỗi khi tải thống kê');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1, // reset page khi đổi filter
    }));
  };

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, page: 1 }));
    fetchLogs();
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      action: '',
      target_type: '',
      admin_id: '',
      start_date: '',
      end_date: '',
      search: '',
    });
  };

  const deleteLog = async (logId) => {
    if (!window.confirm('Bạn có chắc muốn xóa log này?')) return;
    try {
      await api.delete(`/admin-logs/${logId}`);
      alert('Đã xóa');
      fetchLogs();
    } catch (err) {
      console.error('Lỗi xóa log:', err);
      alert('Lỗi xóa log');
    }
  };

  const deleteOldLogs = async () => {
    const days = prompt('Xóa logs cũ hơn bao nhiêu ngày? (mặc định 90)', '90');
    if (days === null) return;

    if (!window.confirm(`Bạn có chắc muốn xóa logs cũ hơn ${days} ngày?`)) return;

    try {
      const res = await api.delete('/admin-logs/batch/old', {
        data: { days: parseInt(days) },
      });
      alert(res.data.message);
      fetchLogs();
    } catch (err) {
      console.error('Lỗi xóa logs cũ:', err);
      alert('Lỗi xóa logs cũ');
    }
  };

  const exportLogs = async (format = 'json') => {
    try {
      const params = new URLSearchParams({
        format,
        start_date: filters.start_date,
        end_date: filters.end_date,
      });

      const res = await api.get(`/admin-logs/export?${params}`);

      if (format === 'csv') {
        // Download CSV file
        const element = document.createElement('a');
        element.setAttribute(
          'href',
          'data:text/csv;charset=utf-8,' + encodeURIComponent(res.data)
        );
        element.setAttribute('download', `logs_${new Date().toISOString()}.csv`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      } else {
        // Download JSON
        const element = document.createElement('a');
        element.setAttribute(
          'href',
          'data:text/json;charset=utf-8,' +
            encodeURIComponent(JSON.stringify(res.data, null, 2))
        );
        element.setAttribute('download', `logs_${new Date().toISOString()}.json`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }
    } catch (err) {
      console.error('Lỗi export logs:', err);
      alert('Lỗi export logs');
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-50 to-gray-100" style={{ backgroundColor: '#FEF7F6' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
              <span className="text-5xl">📋</span>
              Admin Logs - Quản Lý Nhật Ký
            </h1>
            <p className="text-gray-600 mt-2">Theo dõi và kiểm tra các hành động của admin</p>
          </div>
        </div>

        {/* Nút thống kê và export */}
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => {
              fetchStatistics();
            }}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded shadow transition flex items-center"
          >
            <ChartIcon /> Xem Thống Kê
          </button>
          <button
            onClick={() => exportLogs('json')}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded shadow transition flex items-center"
          >
            <DownloadIcon /> Export JSON
          </button>
          <button
            onClick={() => exportLogs('csv')}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded shadow transition flex items-center"
          >
            <DownloadIcon /> Export CSV
          </button>
          <button
            onClick={() => deleteOldLogs()}
            className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded shadow transition flex items-center"
          >
            <TrashIcon /> Xóa Logs Cũ
          </button>
        </div>

        {/* Thống kê */}
        {showStats && statistics && (
          <div className="mb-6 bg-white rounded shadow p-4 border-l-4 border-green-500">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center">
                <ChartIcon /> Thống Kê
              </h2>
              <button
                onClick={() => setShowStats(false)}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="bg-blue-50 p-4 rounded">
                <h3 className="font-bold mb-2">Hành Động Phổ Biến</h3>
                {statistics.actionStats &&
                  statistics.actionStats.slice(0, 5).map((stat) => (
                    <div key={stat._id} className="text-sm">
                      {stat._id}: {stat.count}
                    </div>
                  ))}
              </div>

              <div className="bg-green-50 p-4 rounded">
                <h3 className="font-bold mb-2">Admin Hoạt Động</h3>
                {statistics.adminStats &&
                  statistics.adminStats.slice(0, 5).map((stat) => (
                    <div key={stat._id} className="text-sm">
                      {stat.admin_name || stat._id}: {stat.count}
                    </div>
                  ))}
              </div>

              <div className="bg-yellow-50 p-4 rounded">
                <h3 className="font-bold mb-2">Loại Đối Tượng</h3>
                {statistics.targetTypeStats &&
                  statistics.targetTypeStats.map((stat) => (
                    <div key={stat._id} className="text-sm">
                      {stat._id || 'N/A'}: {stat.count}
                    </div>
                  ))}
              </div>

              <div className="bg-purple-50 p-4 rounded">
                <h3 className="font-bold mb-2">Hoạt Động Hàng Ngày (Top 5)</h3>
                {statistics.dailyStats &&
                  statistics.dailyStats.slice(-5).map((stat) => (
                    <div key={stat._id} className="text-sm">
                      {stat._id}: {stat.count}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Bộ lọc */}
        <div className="bg-white rounded shadow p-4 mb-4 border-t-4 border-blue-500">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <SearchIcon /> Bộ Lọc & Tìm Kiếm
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <input
              type="text"
              name="search"
              placeholder="Tìm kiếm (Log ID, Target ID, Description)..."
              value={filters.search}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              name="action"
              value={filters.action}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Tất Cả Hành Động --</option>
              <option value="create_product">create_product</option>
              <option value="update_product">update_product</option>
              <option value="delete_product">delete_product</option>
              <option value="create_user">create_user</option>
              <option value="update_user">update_user</option>
              <option value="delete_user">delete_user</option>
              <option value="create_order">create_order</option>
              <option value="update_order">update_order</option>
              <option value="delete_order">delete_order</option>
            </select>

            <select
              name="target_type"
              value={filters.target_type}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Tất Cả Loại --</option>
              <option value="product">product</option>
              <option value="user">user</option>
              <option value="order">order</option>
              <option value="category">category</option>
              <option value="payment">payment</option>
            </select>

            <input
              type="text"
              name="admin_id"
              placeholder="Admin ID"
              value={filters.admin_id}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="date"
              name="start_date"
              value={filters.start_date}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="date"
              name="end_date"
              value={filters.end_date}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded shadow transition flex items-center"
            >
              <SearchIcon /> Tìm Kiếm
            </button>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-semibold rounded shadow transition flex items-center"
            >
              <ClearIcon /> Clear Filters
            </button>
          </div>
        </div>

        {/* Bảng logs */}
        {loading ? (
          <div className="bg-white rounded shadow p-8 text-center">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600 font-medium">Đang tải dữ liệu...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded shadow overflow-hidden mb-4 border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200">
                  <tr>
                    <th className="p-3 font-semibold text-gray-800">Log ID</th>
                    <th className="p-3 font-semibold text-gray-800">Admin ID</th>
                    <th className="p-3 font-semibold text-gray-800">Hành Động</th>
                    <th className="p-3 font-semibold text-gray-800">Loại Đối Tượng</th>
                    <th className="p-3 font-semibold text-gray-800">Mục Tiêu ID</th>
                    <th className="p-3 font-semibold text-gray-800">Mô Tả</th>
                    <th className="p-3 font-semibold text-gray-800">Trạng Thái</th>
                    <th className="p-3 font-semibold text-gray-800">Thời Gian</th>
                    <th className="p-3 font-semibold text-gray-800 text-right">Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length > 0 ? (
                    logs.map((log) => (
                      <tr key={log.log_id} className="hover:bg-gray-50 border-b transition">
                        <td className="p-3 text-blue-600 font-mono text-xs">{log.log_id}</td>
                        <td className="p-3">{log.admin_id}</td>
                        <td className="p-3">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                            {log.target_type || 'N/A'}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-xs">{log.target_id || 'N/A'}</td>
                        <td className="p-3 max-w-xs truncate">{log.description || 'N/A'}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold flex items-center w-fit ${
                              log.status === 'success'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {log.status === 'success' ? '✓' : '✗'} {log.status}
                          </span>
                        </td>
                        <td className="p-3 text-xs whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString('vi-VN')}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded transition text-xs flex items-center gap-1"
                            onClick={() => deleteLog(log.log_id)}
                            title="Xóa log này"
                          >
                            <DeleteIcon /> Xóa
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="p-3 text-center text-gray-500">
                        Không có logs nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Phân trang */}
            <div className="bg-white rounded shadow p-4 flex items-center justify-between">
              <div className="text-sm text-gray-600 font-medium">
                Hiển thị {logs.length} / {pagination.total} logs
              </div>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      page: Math.max(1, prev.page - 1),
                    }))
                  }
                  disabled={pagination.page === 1}
                  className="px-3 py-2 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition flex items-center gap-1"
                >
                  ← Trước
                </button>

                <span className="px-3 py-2 bg-gray-100 rounded font-medium">
                  {pagination.page} / {pagination.pages}
                </span>

                <button
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      page: Math.min(pagination.pages, prev.page + 1),
                    }))
                  }
                  disabled={pagination.page >= pagination.pages}
                  className="px-3 py-2 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition flex items-center gap-1"
                >
                  Tiếp →
                </button>

                <select
                  value={filters.limit}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      limit: parseInt(e.target.value),
                      page: 1,
                    }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="10">10/trang</option>
                  <option value="20">20/trang</option>
                  <option value="50">50/trang</option>
                  <option value="100">100/trang</option>
                </select>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminLogsPage;
