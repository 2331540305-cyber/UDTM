import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import Payment from "../models/paymentModel.js";
import User from "../models/userModel.js";

// ===== SELLER DASHBOARD: STATS & OVERVIEW =====
export const getSellerDashboard = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== "seller") {
      return res.status(403).json({ message: "Only sellers can access this" });
    }

    const seller_id = user.user_id;

    // Total products
    const totalProducts = await Product.countDocuments({ seller_id });

    // Active products
    const activeProducts = await Product.countDocuments({ seller_id, status: "active" });

    // Total orders (seller's products in orders)
    const sellerOrders = await Order.aggregate([
      { $unwind: "$items" },
      { $match: { "items.seller_id": seller_id } },
      { $group: { _id: "$order_id" } },
    ]);
    const totalOrders = sellerOrders.length;

    // Total revenue (sum of seller's items)
    const revenueData = await Order.aggregate([
      { $unwind: "$items" },
      { $match: { "items.seller_id": seller_id, order_status: "completed" } },
      { $group: { _id: null, total: { $sum: "$items.subtotal" } } },
    ]);
    const totalRevenue = revenueData[0]?.total || 0;

    // Pending orders (orders containing seller's items + payment_status = pending)
    const pendingOrders = await Order.aggregate([
      { $unwind: "$items" },
      { $match: { "items.seller_id": seller_id, payment_status: "pending" } },
      { $group: { _id: "$order_id" } },
    ]);
    const pendingOrdersCount = pendingOrders.length;

    return res.json({
      dashboard: {
        totalProducts,
        activeProducts,
        totalOrders,
        totalRevenue,
        pendingOrdersCount,
      },
    });
  } catch (err) {
    console.error("❌ getSellerDashboard error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ===== GET SELLER'S PRODUCTS =====
export const getSellerProducts = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== "seller") {
      return res.status(403).json({ message: "Only sellers can access this" });
    }

    const seller_id = user.user_id;
    const products = await Product.find({ seller_id }).sort({ created_at: -1 });

    return res.json({ products });
  } catch (err) {
    console.error("❌ getSellerProducts error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ===== GET SELLER'S ORDERS =====
export const getSellerOrders = async (req, res) => {
  try {
    const user = req.user;
    console.log(`📦 getSellerOrders called - user exists: ${!!user}, user.role: ${user?.role}, expected: seller`);
    
    if (!user || user.role !== "seller") {
      console.log(`❌ Access denied: user=${!!user}, role=${user?.role}`);
      return res.status(403).json({ message: "Only sellers can access this" });
    }

    const seller_id = user.user_id;
    console.log(`✅ Seller authorized, fetching orders for seller_id: ${seller_id}`);

    // Get all orders that contain at least one item from this seller
    const orders = await Order.aggregate([
      // First, match orders that have items with this seller_id
      { $match: { "items.seller_id": seller_id } },
      // Sort by created_at
      { $sort: { created_at: -1 } },
    ]);

    console.log(`Found ${orders.length} orders for seller ${seller_id}`);

    return res.json({ 
      orders,
      count: orders.length 
    });
  } catch (err) {
    console.error("❌ getSellerOrders error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ===== CREATE/UPDATE PRODUCT =====
export const createProduct = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== "seller") {
      return res.status(403).json({ message: "Only sellers can create products" });
    }

    const {
      product_name,
      short_description,
      description,
      price,
      stock,
      category,
      photo,
      status = "active",
    } = req.body;

    if (!product_name || !price || stock === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const product_id = "P" + Date.now();
    const product = await Product.create({
      product_id,
      seller_id: user.user_id,
      product_name,
      short_description,
      description,
      price,
      stock,
      category,
      photo,
      status,
    });

    return res.status(201).json({ message: "Product created", product });
  } catch (err) {
    console.error("❌ createProduct error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ===== UPDATE PRODUCT =====
export const updateProduct = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== "seller") {
      return res.status(403).json({ message: "Only sellers can update products" });
    }

    const { id } = req.params; // product_id
    const updates = req.body;

    // Check ownership
    const product = await Product.findOne({ product_id: id });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.seller_id !== user.user_id) {
      return res.status(403).json({ message: "You can only update your own products" });
    }

    // Update
    const updatedProduct = await Product.findOneAndUpdate({ product_id: id }, updates, {
      new: true,
    });

    return res.json({ message: "Product updated", product: updatedProduct });
  } catch (err) {
    console.error("❌ updateProduct error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ===== DELETE PRODUCT =====
export const deleteProduct = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== "seller") {
      return res.status(403).json({ message: "Only sellers can delete products" });
    }

    const { id } = req.params;

    // Check ownership
    const product = await Product.findOne({ product_id: id });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.seller_id !== user.user_id) {
      return res.status(403).json({ message: "You can only delete your own products" });
    }

    await Product.deleteOne({ product_id: id });

    return res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("❌ deleteProduct error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ===== APPROVE/CONFIRM ORDER (Update payment status to paid) =====
export const approveOrder = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== "seller") {
      return res.status(403).json({ message: "Only sellers can approve orders" });
    }

    const { orderId } = req.params;
    const seller_id = user.user_id;

    // Find the order and verify seller has items in it
    const order = await Order.findOne({ order_id: orderId });
    if (!order) return res.status(404).json({ message: "Order not found" });

    const hasSellerItems = order.items.some(item => item.seller_id === seller_id);
    if (!hasSellerItems) {
      return res.status(403).json({ message: "You don't have items in this order" });
    }

    // Update payment_status to "paid" and order_status to "confirmed"
    const updatedOrder = await Order.findOneAndUpdate(
      { order_id: orderId },
      { 
        payment_status: "paid",
        order_status: "confirmed"
      },
      { new: true }
    );

    // Also update payment record if exists
    const payment = await Payment.findOne({ order_id: orderId });
    if (payment) {
      payment.status = "success";
      await payment.save();
    }

    return res.json({ 
      message: "Order approved successfully", 
      order: updatedOrder 
    });
  } catch (err) {
    console.error("❌ approveOrder error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ===== UPDATE ORDER STATUS (For seller to update order_status) =====
export const updateOrderStatus = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== "seller") {
      return res.status(403).json({ message: "Only sellers can update order status" });
    }

    const { orderId } = req.params;
    const { order_status } = req.body;
    const seller_id = user.user_id;

    if (!order_status) {
      return res.status(400).json({ message: "order_status is required" });
    }

    // Valid statuses for seller to update to
    const validStatuses = ["confirmed", "shipping", "completed", "canceled"];
    if (!validStatuses.includes(order_status)) {
      return res.status(400).json({ message: `Invalid status. Allowed: ${validStatuses.join(", ")}` });
    }

    // Find the order and verify seller has items in it
    const order = await Order.findOne({ order_id: orderId });
    if (!order) return res.status(404).json({ message: "Order not found" });

    const hasSellerItems = order.items.some(item => item.seller_id === seller_id);
    if (!hasSellerItems) {
      return res.status(403).json({ message: "You don't have items in this order" });
    }

    // Update order status
    const updatedOrder = await Order.findOneAndUpdate(
      { order_id: orderId },
      { order_status },
      { new: true }
    );

    return res.json({ 
      message: "Order status updated successfully", 
      order: updatedOrder 
    });
  } catch (err) {
    console.error("❌ updateOrderStatus error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ===== GET SELLER EARNINGS/REVENUE =====
export const getSellerEarnings = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== "seller") {
      return res.status(403).json({ message: "Only sellers can access this" });
    }

    const seller_id = user.user_id;

    // Revenue by status (pending, completed, etc.)
    const revenueByStatus = await Order.aggregate([
      { $unwind: "$items" },
      { $match: { "items.seller_id": seller_id } },
      { $group: {
          _id: "$order_status",
          amount: { $sum: "$items.subtotal" },
          count: { $sum: 1 },
        }
      },
    ]);

    // Total pending revenue (orders not yet completed)
    const pendingRevenue = revenueByStatus
      .filter((r) => r._id !== "completed")
      .reduce((sum, r) => sum + r.amount, 0);

    // Total completed revenue
    const completedRevenue = revenueByStatus
      .find((r) => r._id === "completed")?.amount || 0;

    return res.json({
      earnings: {
        pendingRevenue,
        completedRevenue,
        totalRevenue: pendingRevenue + completedRevenue,
        revenueByStatus,
      },
    });
  } catch (err) {
    console.error("❌ getSellerEarnings error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
