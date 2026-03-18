import axios from "axios";
import api from "./api";

const API = "http://localhost:5000/api"; // Backend port 5000

// Tạo đơn hàng
export const createOrder = async (orderData) => {
  return axios.post(`${API}/orders`, orderData);
};

// Tạo URL thanh toán VNPAY đúng route backend
export const createPaymentUrl = async (data) => {
  return axios.post(`${API}/orders/create_payment_url`, data);
};

// Xử lý trang callback
export const getVnpayReturn = async (queryString) => {
  return axios.get(`${API}/orders/vnpay_return${queryString}`);
};

// Lấy lịch sử payments của user hiện tại
export const getMyPayments = async () => {
  return api.get(`/payments/my`);
};

// Xóa lịch sử payments của user hiện tại (không truyền -> xóa tất cả)
// Có thể truyền olderThanDays như query param, ví dụ: ?olderThanDays=30
export const deleteMyPayments = async (olderThanDays) => {
  const qs = olderThanDays ? `?olderThanDays=${encodeURIComponent(olderThanDays)}` : "";
  return api.delete(`/payments/my${qs}`);
};
