import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";

import LogoPage from "./pages/LogoPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePageNew";
import CartPage from "./pages/CartPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentCallbackPage from "./pages/PaymentCallbackPage";
import PaymentPage from "./pages/PaymentPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import OrderListPage from "./pages/OrderListPage";
import ProfilePage from "./pages/ProfilePage";
import PaymentHistoryPage from "./pages/PaymentHistoryPage";
import SellerDashboardPage from "./pages/SellerDashboardPage";
import AddProductPage from "./pages/AddProductPage";
import EditProductPage from "./pages/EditProductPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import AdminLogsPage from "./pages/AdminLogsPage";
import AdminReportsPage from "./pages/AdminReportsPage";
import AdminProductsPage from "./pages/AdminProductsPage";
import AdminUsersPage from "./pages/AdminUsersPage";

import Header from "./components/Header";
import Footer from "./components/Footer";
import api from "./services/api";
import './index.css';

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load user info từ localStorage
  useEffect(() => {
    const stored = localStorage.getItem("userInfo");
    if (stored) {
      try {
        setUserInfo(JSON.parse(stored));
      } catch (e) {
        console.error("Lỗi parse userInfo:", e);
      }
    }
  }, []);

  // Khôi phục orders từ localStorage 
  useEffect(() => {
    const savedOrders = localStorage.getItem("orders");
    if (savedOrders) setOrders(JSON.parse(savedOrders));
  }, []);

  // Khôi phục cart từ localStorage (guest mode)
  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch (e) {
        console.error("Lỗi parse cart:", e);
      }
    }
  }, []);

  // Tự lưu orders 
  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  // Persist cart for guest users
  useEffect(() => {
    // only persist when user not logged in
    const token = localStorage.getItem("token");
    if (!token) localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // When user logs in, fetch server-side cart (only for buyers)
  useEffect(() => {
    const stored = localStorage.getItem("userInfo");
    const token = localStorage.getItem("token");
    if (stored && token) {
      try {
        const parsedUserInfo = JSON.parse(stored);
        // Chỉ fetch cart nếu là buyer
        if (parsedUserInfo.role === "buyer") {
          const fetchMyCart = async () => {
            try {
              const res = await api.get("/carts");
              const { items } = res.data || {};
              if (items && Array.isArray(items)) {
                const mapped = items.map((it) => ({
                  id: it.cart_item_id,
                  product_id: it.product_id,
                  name: it.product?.product_name || it.product?.name || it.product_id,
                  price: it.product?.price || 0,
                  quantity: it.quantity || 1,
                  photo: it.product?.photo || it.product?.image_url || null,
                  seller_id: it.product?.seller_id || "SYSTEM",
                }));
                setCart(mapped);
              }
            } catch (err) {
              console.error("Lỗi fetch cart từ server:", err);
              // Nếu lỗi (vd: seller), giữ giỏ hàng cũ hoặc load từ localStorage
              const savedCart = localStorage.getItem("cart");
              if (savedCart) {
                try {
                  setCart(JSON.parse(savedCart));
                } catch (e) {
                  console.error("Lỗi parse saved cart:", e);
                }
              }
            }
          };
          fetchMyCart();
        } else {
          // Nếu seller, xóa giỏ hàng (seller không có giỏ)
          setCart([]);
        }
      } catch (e) {
        console.error("Lỗi parse userInfo:", e);
      }
    }
  }, [userInfo]);

  // Fetch sản phẩm từ backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/products");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Lỗi fetch products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);


  useEffect(() => {
    if (location.pathname === "/") {
      const timer = setTimeout(() => navigate("/login"), 8000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, navigate]);

  // Giỏ hàng
  const addToCart = async (product) => {
    const token = localStorage.getItem("token");
    const userInfoStr = localStorage.getItem("userInfo");
    const userRole = userInfoStr ? JSON.parse(userInfoStr).role : "guest";
    
    // product can be full object or just id
    const product_id = product._id || product.product_id || product.productId || product.id;
    const quantity = product.quantity || 1;

    // Chỉ buyer mới thêm giỏ (hay guest)
    if (userRole === "seller") {
      alert("Bạn đang đăng nhập dưới tư cách người bán, không thể thêm giỏ hàng");
      return;
    }

    if (token && userRole === "buyer") {
      try {
        await api.post("/carts", { product_id, quantity });
        // refresh server cart
        const res = await api.get("/carts");
        const items = res.data.items || [];
        const mapped = items.map((it) => ({
          id: it.cart_item_id,
          product_id: it.product_id,
          name: it.product?.product_name || it.product?.name || it.product_id,
          price: it.product?.price || 0,
          quantity: it.quantity || 1,
          photo: it.product?.photo || it.product?.image_url || null,
          seller_id: it.product?.seller_id || "SYSTEM",
        }));
        setCart(mapped);
      } catch (err) {
        console.error("Lỗi addToCart API:", err);
        // Fallback: thêm vào localStorage
        const existing = cart.find((c) => c.product_id === product_id);
        if (existing) {
          const updated = cart.map((c) => c.product_id === product_id ? { ...c, quantity: (c.quantity||1) + quantity } : c);
          setCart(updated);
        } else {
          setCart([...cart, { id: Date.now(), product_id, name: product.product_name || product.name || "Sản phẩm", price: product.price || 0, quantity, seller_id: product.seller_id || "SYSTEM" }]);
        }
      }
    } else {
      // guest mode: merge into local cart
      const existing = cart.find((c) => c.product_id === product_id);
      if (existing) {
        const updated = cart.map((c) => c.product_id === product_id ? { ...c, quantity: (c.quantity||1) + quantity } : c);
        setCart(updated);
      } else {
        setCart([...cart, { id: Date.now(), product_id, name: product.product_name || product.name || "Sản phẩm", price: product.price || 0, quantity, photo: product.photo || product.image_url || null, seller_id: product.seller_id || "SYSTEM" }]);
      }
    }
  };

  const removeFromCart = async (id) => {
    const token = localStorage.getItem("token");
    const userInfoStr = localStorage.getItem("userInfo");
    const userRole = userInfoStr ? JSON.parse(userInfoStr).role : "guest";

    if (token && userRole === "buyer") {
      try {
        await api.delete(`/carts/${id}`);
        const res = await api.get("/carts");
        const items = res.data.items || [];
        const mapped = items.map((it) => ({
          id: it.cart_item_id,
          product_id: it.product_id,
          name: it.product?.product_name || it.product?.name || it.product_id,
          price: it.product?.price || 0,
          quantity: it.quantity || 1,
          photo: it.product?.photo || it.product?.image_url || null,
        }));
        setCart(mapped);
      } catch (err) {
        console.error("Lỗi removeFromCart API:", err);
        // Fallback
        setCart(cart.filter((p) => p.id !== id));
      }
    } else {
      // guest or seller: local remove
      setCart(cart.filter((p) => p.id !== id));
    }
  };

  // Cập nhật số lượng item trong giỏ
  const updateCartItem = async (cart_item_id, quantity) => {
    const token = localStorage.getItem("token");
    const userInfoStr = localStorage.getItem("userInfo");
    const userRole = userInfoStr ? JSON.parse(userInfoStr).role : "guest";

    if (token && userRole === "buyer") {
      try {
        await api.put("/carts", { cart_item_id, quantity });
        const res = await api.get("/carts");
        const items = res.data.items || [];
        const mapped = items.map((it) => ({
          id: it.cart_item_id,
          product_id: it.product_id,
          name: it.product?.product_name || it.product?.name || it.product_id,
          price: it.product?.price || 0,
          quantity: it.quantity || 1,
          photo: it.product?.photo || it.product?.image_url || null,
          seller_id: it.product?.seller_id || "SYSTEM",
        }));
        setCart(mapped);
      } catch (err) {
        console.error("Lỗi updateCartItem API:", err);
        // Fallback
        const updated = cart.map((c) => c.id === cart_item_id ? { ...c, quantity } : c);
        setCart(updated);
      }
    } else {
      const updated = cart.map((c) => c.id === cart_item_id ? { ...c, quantity } : c);
      setCart(updated);
    }
  };

  // Xóa toàn bộ giỏ hàng sau khi thanh toán
  const clearCartState = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  // Checkout
  const checkout = async (info) => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = {
          shipping_address: { name: info.name, address: info.address },
          orderCode: info.orderCode,
          payment_method: info.paymentMethod,
          amount: info.amount,
        };
        const res = await api.post("/orders", payload);
        const order = res.data.order || res.data;
        const orderId = order?.order_id || order?._id || order?.id || Date.now();
        
        // Create payment record
        try {
          await api.post("/payments", {
            order_id: orderId,
            method: info.paymentMethod,
            amount: info.amount,
          });
        } catch (paymentErr) {
          console.error("Lỗi tạo thanh toán:", paymentErr);
        }
        
        setOrders((prev) => [...prev, order]);
        setCart([]);
        return orderId;
      } catch (err) {
        console.error("Lỗi tạo đơn hàng API:", err);
        throw err;
      }
    }

    // Guest/local fallback
    const newOrder = {
      id: Date.now(),
      items: cart,
      info,
      date: new Date().toLocaleDateString(),
      orderCode: info.orderCode,
      payment_method: info.paymentMethod,
      amount: info.amount,
    };
    setOrders([...orders, newOrder]);
    setCart([]);
    return newOrder.id;
  };

  if (loading) return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      ⏳ Chờ xíu nhé, chúng mình đang vào nè...
    </div>
  );

  return (
    <>
      {/* Header */}
      {!["/", "/login", "/register"].includes(location.pathname) && (
        <Header userInfo={userInfo} cartCount={cart.length} />
      )}

      {/* Routes */}
      <Routes>
        <Route path="/" element={<LogoPage />} />
        <Route path="/login" element={<LoginPage user={user} setUser={setUser} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/home"
          element={
            <HomePage
              products={products}
              addToCart={addToCart}
              user={user}
              cart={cart}
              setUser={setUser}
            />
          }
        />
        <Route
          path="/cart"
          element={
            <CartPage
              cart={cart}
              removeFromCart={removeFromCart}
              updateCartItem={updateCartItem}
              userInfo={userInfo}
              user={user}
              setUser={setUser}
            />
          }
        />
        <Route
          path="/product/:id"
          element={
            <ProductDetailPage
              products={products}
              addToCart={addToCart}
              user={user}
              cart={cart}
              setUser={setUser}
            />
          }
        />
        <Route
          path="/checkout"
          element={
            <CheckoutPage
              cart={cart}
              userInfo={userInfo}
              checkout={checkout}
              onClearCart={clearCartState}
              user={user}
              setUser={setUser}
            />
          }
        />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/seller" element={<SellerDashboardPage />} />
        <Route path="/seller/add-product" element={<AddProductPage />} />
        <Route path="/seller/edit-product/:productId" element={<EditProductPage />} />
        <Route path="/admin/edit-product/:productId" element={<EditProductPage userInfo={userInfo} />} />
        <Route path="/admin" element={<AdminDashboardPage userInfo={userInfo} />} />
        <Route path="/admin/orders" element={<AdminOrdersPage userInfo={userInfo} />} />
        <Route path="/admin/logs" element={<AdminLogsPage userInfo={userInfo} />} />
        <Route path="/admin/reports" element={<AdminReportsPage userInfo={userInfo} />} />
        <Route path="/admin/products" element={<AdminProductsPage userInfo={userInfo} />} />
        <Route path="/admin/users" element={<AdminUsersPage userInfo={userInfo} />} />
        <Route path="/payment" element={<PaymentPage onClearCart={clearCartState} />} />
        <Route path="/payment-callback" element={<PaymentCallbackPage />} />
        <Route path="/payment-history" element={<PaymentHistoryPage />} />
        {/* Danh sách đơn hàng */}
        <Route
          path="/orders"
          element={<OrderListPage orders={orders} setOrders={setOrders} />}
        />
        {/* Chi tiết đơn hàng */}
        <Route
          path="/order/:id"
          element={<OrderDetailPage orders={orders} user={user} cart={cart} setUser={setUser} />}
        />
        {/* Route fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Footer */}
      {location.pathname !== "/" && <Footer />}
    </>
  );
}

export default App;
