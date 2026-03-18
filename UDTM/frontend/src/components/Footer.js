import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-blue-900 text-gray-300 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 4a2 2 0 012-2h6a2 2 0 012 2v16a2 2 0 01-2 2H9a2 2 0 01-2-2V4z" />
                <path d="M11 18h2v1h-2z" opacity="0.5" />
              </svg>
              <h3 className="text-white font-bold text-lg">TEO</h3>
            </div>
            <p className="text-sm leading-relaxed">
              Nền tảng thương mại điện tử hàng đầu Việt Nam. Mua bán các sản phẩm
              chất lượng với giá tốt nhất.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="hover:text-red-500 p-2 hover:bg-gray-800 rounded transition-colors" title="Facebook">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="#" className="hover:text-red-500 p-2 hover:bg-gray-800 rounded transition-colors" title="Twitter">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7a10.6 10.6 0 01-10.5 2.5" />
                </svg>
              </a>
              <a href="#" className="hover:text-red-500 p-2 hover:bg-gray-800 rounded transition-colors" title="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" fill="currentColor" />
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
                </svg>
              </a>
            </div>
          </div>

          {/* For Buyers */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12a3 3 0 100-6 3 3 0 000 6z" />
                <path fillRule="evenodd" d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1zm0 3a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              <h4 className="text-white font-semibold">Dành cho Người Mua</h4>
            </div>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/home" className="hover:text-white hover:underline">
                  Trang chủ
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white hover:underline">
                  Danh mục sản phẩm
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white hover:underline">
                  Đơn hàng của tôi
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white hover:underline">
                  Theo dõi giao hàng
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
              </svg>
              <h4 className="text-white font-semibold">Hỗ Trợ</h4>
            </div>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white hover:underline">
                  Trung tâm trợ giúp
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white hover:underline">
                  Liên hệ chúng tôi
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white hover:underline">
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white hover:underline">
                  Điều khoản & Điều kiện
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
              <h4 className="text-white font-semibold">Liên Hệ</h4>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email: support@Teo.com
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2a1 1 0 011.27-.12 11.36 11.36 0 008 2.98 1 1 0 011 1v3a1 1 0 01-1 1 19 19 0 01-18.36-18.36 1 1 0 011-1h3a1 1 0 011 1 11.36 11.36 0 002.98 8l-.12 1.27z" />
                </svg>
                Hotline: 0938730115
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                </svg>
                Địa chỉ: Cần Thơ, Việt Nam
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="19" r="1" />
                  <path d="M12 1v2m0 18v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M4.22 4.22l1.41 1.41m11.14 11.14l1.41 1.41M1 12h2m18 0h2M4.22 19.78l1.41-1.41M16.63 7.63l1.41-1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Thời gian: 08:00 - 22:00 (Hàng ngày)
              </li>
            </ul>
          </div>
        </div>
        
        {/* Divider */}
        <div className="border-t border-gray-700 pt-8">
          {/* Payment Methods */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 8H4V6h16m0 12H4v-2h16m0-6H4v2h16z" />
              </svg>
              Phương thức thanh toán:
            </p>
            <div className="flex gap-4 flex-wrap">
              <span className="text-sm flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="2" y="4" width="20" height="16" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M2 10h20" stroke="currentColor" strokeWidth="2" />
                </svg>
                Thẻ tín dụng
              </span>
              <span className="text-sm flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                </svg>
                Chuyển khoản
              </span>
              <span className="text-sm flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 4a2 2 0 012-2h6a2 2 0 012 2v16a2 2 0 01-2 2H9a2 2 0 01-2-2V4z" />
                </svg>
                Ví điện tử
              </span>
              <span className="text-sm flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 6.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM9 6.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM20 13H4a2 2 0 00-2 2v5a2 2 0 002 2h16a2 2 0 002-2v-5a2 2 0 00-2-2z" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
                Thanh toán khi nhận
              </span>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center pt-4 border-t border-gray-700">
            <p className="text-sm text-gray-400">
              © {currentYear} TEO. Bảo lưu mọi quyền.
            </p>
            <p className="text-sm text-gray-400 mt-4 md:mt-0 flex items-center gap-1">
              Made with 
              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              for better shopping experience
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}