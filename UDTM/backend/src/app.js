const express = require('express');
const cors = require('cors'); // <--- Thêm dòng này
const app = express();

// QUAN TRỌNG: Dòng này phải đặt LÊN TRÊN CÙNG, trước các dòng app.get/app.post
app.use(cors({
    origin: "*", // Cho phép tất cả mọi người truy cập (hoặc điền tên miền frontend của bạn vào đây)
    methods: ["GET", "POST", "PUT", "DELETE"], // Cho phép các thao tác này
    credentials: true
}));

