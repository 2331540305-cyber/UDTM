import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const SellerDashboardPage = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("userInfo"));
    if (!stored || stored.role !== "seller") {
      alert("Chỉ seller mới có quyền truy cập");
      navigate("/home");
      return;
    }
    setUserInfo(stored);
  }, [navigate]);

  useEffect(() => {
    if (!userInfo) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [dashRes, prodRes, ordRes, earnRes] = await Promise.all([
          api.get("/seller/dashboard"),
          api.get("/seller/products"),
          api.get("/seller/orders"),
          api.get("/seller/earnings"),
        ]);
        console.log("Dashboard:", dashRes.data);
        console.log("Products:", prodRes.data);
        console.log("Orders:", ordRes.data);
        console.log("Earnings:", earnRes.data);
        
        setDashboard(dashRes.data.dashboard);
        setProducts(prodRes.data.products || []);
        setOrders(ordRes.data.orders || []);
        setEarnings(earnRes.data.earnings);
      } catch (err) {
        console.error("Fetch seller data error:", err);
        alert("Lỗi tải dữ liệu: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userInfo]);

  // Hàm refresh dữ liệu
  const refreshOrders = async () => {
    try {
      console.log("🔄 Refreshing orders...");
      const res = await api.get("/seller/orders");
      console.log("Updated orders:", res.data);
      setOrders(res.data.orders || []);
      alert("✅ Cập nhật thành công!");
    } catch (err) {
      console.error("Refresh error:", err);
      alert("❌ Lỗi cập nhật: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="w-12 h-12 text-indigo-600 animate-spin mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth="4" opacity="0.25"></circle>
          </svg>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-blue-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Bảng điều khiển Seller</h1>
          <p className="text-gray-600 mt-2">Xin chào, {userInfo?.full_name || userInfo?.username}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          {["overview", "products", "orders", "earnings"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-semibold transition flex items-center gap-2 ${
                activeTab === tab
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab === "overview" && (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 13h2v8H3zm4-8h2v16H7zm4-2h2v18h-2zm4-2h2v20h-2zm4 4h2v16h-2z" />
                  </svg>
                  Tổng quan
                </>
              )}
              {tab === "products" && (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
                  </svg>
                  Sản phẩm
                </>
              )}
              {tab === "orders" && (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-0.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l0.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                  Đơn hàng
                </>
              )}
              {tab === "earnings" && (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                  </svg>
                  Doanh thu
                </>
              )}
            </button>
          ))}
        </div>
        

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && dashboard && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card: Total Products */}
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tổng sản phẩm</p>
                  <p className="text-3xl font-bold text-indigo-600">{dashboard.totalProducts}</p>
                </div>
                <svg className="w-12 h-12 text-indigo-100" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                </svg>
              </div>
            </div>

            {/* Card: Active Products */}
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Sản phẩm hoạt động</p>
                  <p className="text-3xl font-bold text-green-600">{dashboard.activeProducts}</p>
                </div>
                <svg className="w-12 h-12 text-green-100" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              </div>
            </div>

            {/* Card: Total Orders */}
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tổng đơn hàng</p>
                  <p className="text-3xl font-bold text-blue-600">{dashboard.totalOrders}</p>
                </div>
                <svg className="w-12 h-12 text-blue-100" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                </svg>
              </div>
            </div>

            {/* Card: Total Revenue */}
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Doanh thu hoàn thành</p>
                  <p className="text-3xl font-bold text-red-600">
                    {(dashboard.totalRevenue || 0).toLocaleString()}₫
                  </p>
                </div>
                <svg className="w-12 h-12 text-red-100" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                </svg>
              </div>
            </div>

            {/* Card: Pending Orders */}
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition col-span-1 md:col-span-2">
              <p className="text-sm text-gray-600">Đơn hàng chờ xử lý</p>
              <p className="text-3xl font-bold text-yellow-600">{dashboard.pendingOrdersCount}</p>
              <p className="text-xs text-gray-500 mt-2">Cần xác nhận hoặc vận chuyển</p>
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === "products" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Quản lý sản phẩm</h2>
              <button
                onClick={() => navigate("/seller/add-product")}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                + Thêm sản phẩm
              </button>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">Bạn chưa có sản phẩm nào</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                  <div key={p.product_id} className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
                    {p.photo && (
                      <img
                        src={p.photo}
                        alt={p.product_name}
                        className="w-full h-40 object-cover rounded-lg mb-4"
                        onError={(e) => (e.target.src = "/logo192.png")}
                      />
                    )}
                    <h3 className="font-semibold text-gray-900 line-clamp-2">{p.product_name}</h3>
                    <p className="text-indigo-600 font-bold mt-2">{p.price.toLocaleString()}₫</p>
                    <p className="text-sm text-gray-600">
                      Kho: <span className="font-semibold">{p.stock}</span>
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className={`text-xs px-2 py-1 rounded inline-block items-center gap-1 ${
                        p.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {p.status === "active" ? (
                          <>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                            Hoạt động
                          </>
                        ) : (
                          "Ẩn"
                        )}
                      </p>
                      <button
                        onClick={() => {
                          const newStatus = p.status === "active" ? "inactive" : "active";
                          api.patch(`/seller/products/${p.product_id}`, { status: newStatus })
                            .then(() => {
                              setProducts(products.map(x => x.product_id === p.product_id ? {...x, status: newStatus} : x));
                              alert(newStatus === "active" ? "✅ Sản phẩm đã hoạt động!" : "✅ Sản phẩm đã ẩn!");
                            })
                            .catch(err => alert("❌ Lỗi: " + err.message));
                        }}
                        className={`text-xs px-2 py-1 rounded font-semibold transition ${
                          p.status === "active"
                            ? "bg-yellow-200 text-yellow-800 hover:bg-yellow-300"
                            : "bg-blue-200 text-blue-800 hover:bg-blue-300"
                        }`}
                        title={p.status === "active" ? "Ẩn sản phẩm" : "Kích hoạt sản phẩm"}
                      >
                        {p.status === "active" ? "Ẩn" : "Kích hoạt"}
                      </button>
                    </div>
                  <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => navigate(`/seller/edit-product/${p.product_id}`)}
                        className="flex-1 bg-green-300 text-white px-3 py-1 rounded text-sm hover:bg-green-400 transition"
                      >
                       Sửa
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm("Xóa sản phẩm này?")) {
                            api.delete(`/seller/products/${p.product_id}`).then(() => {
                              setProducts(products.filter((x) => x.product_id !== p.product_id));
                              alert("Đã xóa");
                       });
                       }
                    }}
                        className="flex-1 bg-red-300 text-white px-3 py-1 rounded text-sm hover:bg-red-400 transition"
                      >
                        Xóa
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Đơn hàng của bạn</h2>
              <button
                onClick={refreshOrders}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M1 4v6h6M23 20v-6h-6M20.3 5.7A9 9 0 005.7 20.3" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
                Cập nhật đơn hàng
              </button>
            </div>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">Chưa có đơn hàng nào</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((o) => (
                  <div key={o.order_id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold">Đơn #{o.order_id}</h3>
                        <p className="text-sm text-gray-600">{new Date(o.created_at).toLocaleString("vi-VN")}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm px-2 py-1 rounded inline-block items-center gap-1 ${
                          o.order_status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {o.order_status === "completed" ? (
                            <>
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                              </svg>
                              Đã thanh toán
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                              </svg>
                              Chờ thanh toán
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Sản phẩm:</p>
                      {o.items
                        .filter((i) => i.seller_id === userInfo.user_id)
                        .map((i, idx) => (
                          <div key={idx} className="text-sm flex justify-between text-gray-700">
                            <span>{i.product_name} (x{i.quantity})</span>
                            <span className="font-semibold">{i.subtotal.toLocaleString()}₫</span>
                          </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center border-t pt-4">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="text-sm text-gray-600">
                            Trạng thái: <span className="font-semibold capitalize">{o.order_status}</span>
                          </p>
                        </div>
                        <select
                          value={o.order_status}
                          onChange={(e) => {
                            const newStatus = e.target.value;
                            if (newStatus !== o.order_status && window.confirm(`Cập nhật trạng thái thành '${newStatus}'?`)) {
                              api.patch(`/seller/orders/${o.order_id}/status`, { order_status: newStatus })
                                .then(() => {
                                  setOrders(orders.map(x => 
                                    x.order_id === o.order_id 
                                      ? {...x, order_status: newStatus}
                                      : x
                                  ));
                                  alert("✅ Cập nhật trạng thái thành công!");
                                })
                                .catch(err => alert("❌ Lỗi: " + err.message));
                            }
                          }}
                          className="px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                        >
                          <option value="confirmed">confirmed</option>
                          <option value="shipping">shipping</option>
                          <option value="completed">completed</option>
                          <option value="canceled">canceled</option>
                        </select>
                      </div>
                      {o.payment_status === "pending" && (
                        <button
                          onClick={() => {
                            if (window.confirm("Duyệt đơn hàng này? Trạng thái thanh toán sẽ cập nhật thành 'Đã thanh toán'")) {
                              api.patch(`/seller/orders/${o.order_id}/approve`)
                                .then(() => {
                                  setOrders(orders.map(x => 
                                    x.order_id === o.order_id 
                                      ? {...x, payment_status: "paid", order_status: "confirmed"}
                                      : x
                                  ));
                                  alert("✅ Đơn hàng đã được duyệt!");
                                })
                                .catch(err => alert("❌ Lỗi: " + err.message));
                            }
                          }}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition font-semibold"
                        >
                          Duyệt đơn
                        </button>
                      )}
                      <p className="text-lg font-bold text-indigo-600">
                        Doanh thu: {o.items
                          .filter((i) => i.seller_id === userInfo.user_id)
                          .reduce((s, i) => s + i.subtotal, 0)
                          .toLocaleString()}₫
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* EARNINGS TAB */}
        {activeTab === "earnings" && earnings && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pending Revenue */}
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <p className="text-sm text-gray-600 mb-2">Doanh thu chờ xác nhận</p>
              <p className="text-3xl font-bold text-yellow-600">{earnings.pendingRevenue.toLocaleString()}₫</p>
              <p className="text-xs text-gray-500 mt-2">Các đơn hàng chưa hoàn thành</p>
            </div>

            {/* Completed Revenue */}
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <p className="text-sm text-gray-600 mb-2">Doanh thu hoàn thành</p>
              <p className="text-3xl font-bold text-green-600">{earnings.completedRevenue.toLocaleString()}₫</p>
              <p className="text-xs text-gray-500 mt-2">Các đơn hàng đã hoàn thành</p>
            </div>

            {/* Total Revenue */}
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <p className="text-sm text-gray-600 mb-2">Tổng doanh thu</p>
              <p className="text-3xl font-bold text-indigo-600">{earnings.totalRevenue.toLocaleString()}₫</p>
              <p className="text-xs text-gray-500 mt-2">Tất cả các đơn hàng</p>
            </div>

            {/* Revenue Breakdown */}
            <div className="bg-white p-6 rounded-lg shadow col-span-1 md:col-span-3">
              <p className="text-lg font-bold mb-4">Chi tiết doanh thu theo trạng thái</p>
              <div className="space-y-2">
                {earnings.revenueByStatus.map((r) => (
                  <div key={r._id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="capitalize font-semibold">{r._id || "N/A"}</span>
                    <div className="text-right">
                      <p className="font-bold">{r.amount.toLocaleString()}₫</p>
                      <p className="text-xs text-gray-600">{r.count} sản phẩm</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboardPage;
