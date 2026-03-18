import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { PlusIcon } from '../components/icons';

const AdminReportsPage = ({ userInfo }) => {
  const navigate = useNavigate();
  useEffect(() => {
    if (!userInfo || userInfo.role !== 'admin') {
      alert('Bạn không có quyền truy cập trang admin');
      navigate('/home');
    }
  }, [userInfo, navigate]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [reportType, setReportType] = useState('sales');
  const [notes, setNotes] = useState('');
  const [manualRevenue, setManualRevenue] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports');
      setReports(res.data || []);
    } catch (err) {
      console.error('Lỗi fetch reports:', err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const createReport = async () => {
    if (!periodStart || !periodEnd) return alert('Chọn khoảng thời gian');
    // Validate manualRevenue if present
    if (manualRevenue !== '' && Number(manualRevenue) < 0) return alert('Tổng doanh thu không thể là số âm');
    try {
      const body = { period_start: periodStart, period_end: periodEnd, report_type: reportType };
      if (notes && typeof notes === 'string') body.notes = notes;
      if (manualRevenue !== '') body.total_revenue = Number(manualRevenue);
      const res = await api.post('/reports', body);
      alert('Báo cáo tạo thành công: ' + res.data.report_id);
      // reset form
      setPeriodStart('');
      setPeriodEnd('');
      setNotes('');
      setManualRevenue('');
      fetchReports();
    } catch (err) {
      console.error('Lỗi tạo report:', err);
      alert('Lỗi tạo report');
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50" style={{ backgroundColor: "#FEF7F6" }}>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Báo cáo hệ thống</h1>
        <div className="bg-white p-4 rounded shadow mb-4">
            <div className="flex gap-2 items-center">
            <input value={periodStart} onChange={e=>setPeriodStart(e.target.value)} type="date" className="p-2 border rounded" />
            <input value={periodEnd} onChange={e=>setPeriodEnd(e.target.value)} type="date" className="p-2 border rounded" />
            <select value={reportType} onChange={e=>setReportType(e.target.value)} className="p-2 border rounded">
              <option value="sales">Sales</option>
              <option value="orders">Orders</option>
            </select>
              <input value={manualRevenue} onChange={e=>setManualRevenue(e.target.value)} type="number" min="0" placeholder="Tổng doanh thu (nếu muốn)" className="p-2 border rounded w-44" />
              <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Nội dung báo cáo (ghi chú)" className="p-2 border rounded" rows={1} />
            <Button onClick={createReport} variant="primary" size="md" icon={PlusIcon} className="shadow-lg">Tạo</Button>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Báo cáo gần đây</h2>
          {loading ? (<p>Đang tải ...</p>) : (
            <ul className="space-y-2">
              {reports.map(r => (
                <li key={r.report_id} className="p-3 border rounded">
                  <div className="flex justify-between">
                    <div>
                      <div className="text-sm font-semibold">{r.report_type} — {r.report_id}</div>
                      <div className="text-xs text-gray-500">{new Date(r.period_start).toLocaleDateString()} - {new Date(r.period_end).toLocaleDateString()}</div>
                      {r.notes && (<div className="text-sm text-gray-700 mt-1">{r.notes}</div>)}
                    </div>
                    <div className="text-sm font-semibold">Tổng doanh thu: {r.total_revenue?.toLocaleString() || 0} VND</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReportsPage;