// controllers/orderController.js
import Order from "../models/orderModel.js";
import Payment from "../models/paymentModel.js";
import Product from "../models/productModel.js";

// ------------------------
// CREATE ORDER
// ------------------------
export const createOrder = async (req, res) => {
  try {
    console.log("📦 CREATE ORDER BODY:", req.body);

    const { 
      user_id, 
      items, 
      payment_method = "vnpay",
      customer_name,
      customer_phone,
      customer_email,
      delivery_address
    } = req.body;

    console.log("📋 Shipping Info:", {
      customer_name,
      customer_phone,
      customer_email,
      delivery_address,
    });

    if (!user_id || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Thiếu thông tin đơn hàng" });
    }

    // Validate and enrich items: add seller_id and subtotal if missing
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const qty = item.quantity || 1;
        const price = item.price || 0;
        
        // Nếu chưa có seller_id, lấy từ database
        let sellerId = item.seller_id;
        if (!sellerId) {
          try {
            const product = await Product.findOne({ 
              product_id: item.product_id 
            });
            sellerId = product?.seller_id || "SYSTEM";
          } catch (e) {
            console.warn("Could not fetch seller_id for product:", item.product_id);
            sellerId = "SYSTEM";
          }
        }

        return {
          product_id: item.product_id || item._id,
          product_name: item.product_name || item.name,
          price,
          quantity: qty,
          subtotal: item.subtotal || price * qty,
          seller_id: sellerId,
          product_image: item.product_image || null,
        };
      })
    );

    const total = enrichedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const orderId = "O" + Date.now();

    const order = await Order.create({
      order_id: orderId,
      user_id,
      items: enrichedItems,
      total_amount: total,
      payment_method,
      payment_status: "pending",
      order_status: "pending",
      customer_name: customer_name || "",
      customer_phone: customer_phone || "",
      customer_email: customer_email || "",
      delivery_address: delivery_address || "",
    });

    // Tạo payment record
    const paymentId = "PAY" + Date.now();

    await Payment.create({
      payment_id: paymentId,
      order_id: orderId,
      user_id,
      amount: total,
      method: payment_method,
      status: "pending",
    });

    return res.status(201).json({
      message: "Order created successfully",
      order: {
        order_id: orderId,
        total_amount: total,
        payment_method,
      },
    });
  } catch (err) {
    console.error("❌ createOrder error:", err);
    return res.status(500).json({ message: "Server error when creating order" });
  }
};


// ------------------------
// GET ORDER
// ------------------------
export const getOrder = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("🔍 GET ORDER BY ID:", id);

    const order = await Order.findOne({ order_id: id });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json(order);
  } catch (err) {
    console.error("❌ getOrder error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


// ------------------------
// LIST ORDERS
// ------------------------
export const listOrders = async (req, res) => {
  try {
    const { user_id } = req.query;

    const filter = user_id ? { user_id } : {};

    console.log("📜 LIST ORDERS, filter:", filter);

    const orders = await Order.find(filter).sort({ created_at: -1 });

    return res.json(orders);
  } catch (err) {
    console.error("❌ listOrders error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ------------------------
// UPDATE ORDER / PATCH
// Hỗ trợ cập nhật phương thức thanh toán (vd: cod) và trạng thái
// Khi phương thức thanh toán là 'cod', tạo hoặc cập nhật bản ghi Payment
// ------------------------
export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params; // order_id
    const updates = req.body || {};

    // Tìm và cập nhật order
    const order = await Order.findOneAndUpdate({ order_id: id }, updates, {
      new: true,
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    // Nếu client gửi thay đổi liên quan tới phương thức thanh toán, đảm bảo có Payment record
    if (updates.payment_method) {
      const paymentMethod = updates.payment_method;
      // Nếu là COD -> mark order + payment thành công
      if (paymentMethod === "cod") {
        await Order.findOneAndUpdate(
          { order_id: id },
          { payment_status: "paid", order_status: "completed" },
          { new: true }
        );
      }

      // Tìm bản ghi payment hiện có
      let payment = await Payment.findOne({ order_id: id });

      if (payment) {
        // Cập nhật thông tin payment nếu có
        payment.method = paymentMethod || payment.method;
        // Nếu phương thức COD, mark success
        if (paymentMethod === "cod") payment.status = "success";
        if (updates.payment_status) payment.status = updates.payment_status;
        if (updates.transaction_no) payment.transaction_no = updates.transaction_no;
        if (updates.response_code) payment.response_code = updates.response_code;
        if (updates.bank_code) payment.bank_code = updates.bank_code;
        await payment.save();
      } else {
        // Tạo payment mới (status mặc định pending nếu không có thông tin)
        const paymentId = "PAY" + Date.now();
        payment = await Payment.create({
          payment_id: paymentId,
          order_id: id,
          user_id: order.user_id,
          amount: order.total_amount || 0,
          method: paymentMethod,
          status: paymentMethod === "cod" ? "success" : updates.payment_status || "pending",
          transaction_no: updates.transaction_no || "",
          response_code: updates.response_code || "",
          bank_code: updates.bank_code || "",
        });
      }
    }

    // Lấy lại order mới nhất
    const updatedOrder = await Order.findOne({ order_id: id });

    return res.json({ message: "Order updated", order: updatedOrder });
  } catch (err) {
    console.error("❌ updateOrder error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ------------------------
// GET ORDERS FOR AUTHENTICATED USER
// ------------------------
export const getMyOrders = async (req, res) => {
  try {
    const user = req.user; // set by auth middleware
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const orders = await Order.find({ user_id: user.user_id }).sort({ created_at: -1 });

    return res.json({ orders });
  } catch (err) {
    console.error("❌ getMyOrders error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ------------------------
// DELETE ORDERS FOR AUTHENTICATED USER
// - if query olderThanDays provided, delete only orders older than that
// - otherwise delete all orders for the user
// Also delete related payments for removed orders
// ------------------------
export const deleteMyOrders = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const olderThanDays = parseInt(req.query.olderThanDays || "", 10);
    let filter = { user_id: user.user_id };

    if (!isNaN(olderThanDays) && olderThanDays > 0) {
      const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
      filter.created_at = { $lt: cutoff };
    }

    // Find orders to delete so we can remove payments
    const ordersToDelete = await Order.find(filter).select("order_id");
    const orderIds = ordersToDelete.map((o) => o.order_id);

    // Delete orders
    const result = await Order.deleteMany(filter);

    // Delete related payments
    if (orderIds.length > 0) {
      await Payment.deleteMany({ order_id: { $in: orderIds } });
    }

    return res.json({ message: "Orders deleted", deletedCount: result.deletedCount });
  } catch (err) {
    console.error("❌ deleteMyOrders error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
