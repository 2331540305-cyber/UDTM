/**
 * Import function triggers from their respective submodules:
 */
const {onRequest} = require("firebase-functions/v2/https");
const {setGlobalOptions} = require("firebase-functions/v2/options");
const logger = require("firebase-functions/logger");

// 1. Import Express và Cors
const express = require("express");
const cors = require("cors");

// Cấu hình Global (giữ nguyên để tiết kiệm chi phí, tránh bị spike traffic)
setGlobalOptions({maxInstances: 10});

// 2. Khởi tạo App
const app = express();

// Tự động cho phép Cross-Origin (để frontend gọi được mà không bị chặn)
app.use(cors({origin: true}));
// Body parsers (JSON and URL-encoded)
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// --- ĐỊNH NGHĨA ROUTE ---

// Lưu ý quan trọng: Vì trong firebase.json bạn rewrite "/api/**",
// nên các route ở đây phải bắt đầu bằng "/api" (hoặc bạn dùng router group).

app.get("/api/hello", (req, res) => {
  logger.info("Hello logs!", {structuredData: true});
  res.json({
    message: "Chào bạn, đây là dữ liệu từ Backend Firebase Gen 2!",
    timestamp: new Date().toISOString(),
  });
});

app.post("/api/data", (req, res) => {
  const data = req.body || {};
  res.json({
    status: "success",
    received: data,
  });
});

// Xử lý 404 cho các route không tìm thấy
// 404 handler
app.use((req, res) => {
  res.status(404).json({message: "API Endpoint not found"});
});

// Error middleware – centralize uncaught Express errors
app.use((err, req, res, next) => {
  const errInfo = err && (err.stack || err.message || err);
  logger.error("Unhandled error in functions API", {err: errInfo});
  res.status(500).json({message: "Internal Server Error"});
});

// 3. Xuất function
// Tên "api" này phải khớp với cấu hình trong firebase.json
// Export Cloud Function
exports.api = onRequest(app);
