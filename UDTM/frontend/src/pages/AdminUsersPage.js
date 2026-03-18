import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { RefreshIcon, DownloadIcon, EyeIcon } from '../components/icons';

const AdminUsersPage = ({ userInfo }) => {
  const [users, setUsers] = useState([]);
  const [roleCounts, setRoleCounts] = useState({});
  const [filterRole, setFilterRole] = useState('all');
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const navigate = useNavigate();
  
  useEffect(() => {
    if (!userInfo || userInfo.role !== 'admin') {
      alert('Bạn không có quyền truy cập trang admin');
      navigate('/home');
    }
    fetchUsers();
    fetchRoleCounts();
  }, [userInfo, navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data || []);
    } catch (err) {
      console.error('Lỗi fetch users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchRoleCounts = async () => {
    try {
      const res = await api.get('/users/roles');
      setRoleCounts(res.data.counts || {});
    } catch (err) {
      console.error('Lỗi fetch role counts:', err);
      setRoleCounts({});
    }
  };

  const filteredUsers = users
    .filter(u => filterRole === 'all' || u.role === filterRole)
    .filter(u => {
      if (!q) return true;
      const str = `${u.user_id} ${u.email} ${u.username}`.toLowerCase();
      return str.includes(q.toLowerCase());
    });

  filteredUsers.sort((a, b) => {
    let av = a[sortBy] || '';
    let bv = b[sortBy] || '';
    if (sortBy === 'created_at') {
      av = new Date(a.created_at || 0).getTime();
      bv = new Date(b.created_at || 0).getTime();
    } else {
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
    }
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const startIndex = (page - 1) * pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages]);

  const changeRole = async (user_id, newRole) => {
    if (userInfo?.user_id === user_id && newRole !== 'admin') {
      return alert('Bạn không thể hạ quyền admin của chính mình');
    }
    try {
      await api.patch(`/users/${user_id}/role`, { role: newRole });
      alert('Role updated');
      fetchUsers();
      fetchRoleCounts();
    } catch (err) {
      console.error('Lỗi cập nhật role:', err);
      alert('Không thể cập nhật role');
    }
  };

  const exportCSV = () => {
    const headers = ['user_id', 'username', 'email', 'phone', 'role', 'status', 'created_at'];
    const rows = filteredUsers.map(u => headers.map(h => JSON.stringify(u[h] || '')).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `users_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteUser = async (user_id) => {
    if (!window.confirm('Bạn có chắc muốn xóa user này?')) return;
    try {
      await api.delete(`/users/${user_id}`);
      alert('Deleted');
      fetchUsers();
      fetchRoleCounts();
    } catch (err) {
      console.error('Lỗi delete user:', err);
      alert('Không thể xóa user');
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100" style={{ backgroundColor: "#FEF7F6" }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Quản lý Users</h1>
        
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover: underline">Tổng: {users.length}</span>
            <span className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded">Buyer: {roleCounts.buyer || 0}</span>
            <span className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded">Seller: {roleCounts.seller || 0}</span>
            <span className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded">Admin: {roleCounts.admin || 0}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input 
              value={q} 
              onChange={e => setQ(e.target.value)} 
              placeholder="Tìm kiếm users..." 
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select 
              value={filterRole} 
              onChange={e => setFilterRole(e.target.value)} 
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">-- Tất cả --</option>
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
              <option value="admin">Admin</option>
            </select>
            <select 
              value={sortBy} 
              onChange={e => setSortBy(e.target.value)} 
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="created_at">Created</option>
              <option value="username">Username</option>
              <option value="email">Email</option>
              <option value="role">Role</option>
            </select>
            <select 
              value={sortDir} 
              onChange={e => setSortDir(e.target.value)} 
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>

            <Button 
              onClick={() => { fetchUsers(); fetchRoleCounts(); }} 
              variant="primary" 
              size="sm" 
              icon={RefreshIcon} 
              className="bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Refresh
            </Button>
            <Button 
              onClick={() => { setQ(''); setFilterRole('all'); setSortBy('created_at'); setSortDir('desc'); }} 
              variant="ghost" 
              size="sm" 
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 rounded"
            >
              Clear
            </Button>
            <Button 
              onClick={exportCSV} 
              variant="primary" 
              size="sm" 
              icon={DownloadIcon} 
              className="bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Export CSV
            </Button>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-600">Loading users...</p>
        ) : (
          <div className="bg-white p-4 rounded shadow">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-3 border-b text-sm">ID</th>
                  <th className="p-3 border-b text-sm">Email</th>
                  <th className="p-3 border-b text-sm">Username</th>
                  <th className="p-3 border-b text-sm">Role</th>
                  <th className="p-3 border-b text-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length === 0 ? (
                  <tr><td colSpan="5" className="p-3 text-gray-600">Không có người dùng phù hợp.</td></tr>
                ) : (
                  paginatedUsers.map(u => (
                    <tr key={u.user_id} className="hover:bg-gray-50">
                      <td className="p-3 border-b">{u.user_id}</td>
                      <td className="p-3 border-b">{u.email}</td>
                      <td className="p-3 border-b">{u.username}</td>
                      <td className="p-3 border-b">
                        <select 
                          value={u.role} 
                          onChange={e => changeRole(u.user_id, e.target.value)} 
                          className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="buyer" disabled={u.user_id === userInfo?.user_id}>buyer</option>
                          <option value="seller" disabled={u.user_id === userInfo?.user_id}>seller</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td className="p-3 border-b flex items-center gap-2">
                        <Button 
                          onClick={() => { setSelectedUser(u); setShowModal(true); }} 
                          variant="secondary" 
                          size="sm" 
                          icon={EyeIcon} 
                          className="bg-indigo-500 hover:bg-indigo-600 text-blue-500 rounded"
                        >
                          View
                        </Button>
                        <button 
                          disabled={u.user_id === userInfo?.user_id} 
                          className={`px-3 py-1 ${u.user_id === userInfo?.user_id ? 'bg-gray-400 text-white' : 'bg-red-500 hover:bg-red-600 text-white'} rounded`} 
                          onClick={() => deleteUser(u.user_id)}
                        >
                          {u.user_id === userInfo?.user_id ? 'Cannot delete' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="flex flex-wrap items-center gap-2 mt-4 justify-between">
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 border rounded bg-gray-200 hover:bg-gray-300" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</button>
                <span className="text-gray-700">Page {page} / {Math.max(1, Math.ceil(filteredUsers.length / pageSize))}</span>
                <button className="px-3 py-1 border rounded bg-gray-200 hover:bg-gray-300" disabled={page >= Math.ceil(filteredUsers.length / pageSize)} onClick={() => setPage(p => p + 1)}>Next</button>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Page size: </label>
                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white w-11/12 md:w-1/2 rounded p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">User Details - {selectedUser.user_id}</h2>
              <button className="px-3 py-1 bg-gray-300 hover:bg-gray-400 rounded text-gray-800" onClick={() => { setShowModal(false); setSelectedUser(null); }}>Close</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700">
              <div><strong>Username: </strong>{selectedUser.username}</div>
              <div><strong>Email: </strong>{selectedUser.email}</div>
              <div><strong>Full name: </strong>{selectedUser.full_name}</div>
              <div><strong>Phone: </strong>{selectedUser.phone}</div>
              <div><strong>Address: </strong>{selectedUser.address}</div>
              <div><strong>Role: </strong>{selectedUser.role}</div>
              <div><strong>Status: </strong>{selectedUser.status}</div>
              <div><strong>Created At: </strong>{new Date(selectedUser.created_at).toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
