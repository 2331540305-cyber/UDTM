// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const userInfo = localStorage.getItem("userInfo");
  
  console.log("🔐 API Request:", {
    url: config.url,
    hasToken: !!token,
    userInfo: userInfo ? JSON.parse(userInfo) : null,
    headerAuth: token ? `Bearer ${token.substring(0, 20)}...` : "NONE"
  });
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
