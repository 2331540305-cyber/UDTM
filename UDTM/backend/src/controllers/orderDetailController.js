import OrderDetail from "../models/orderDetailModel.js";
import Product from "../models/productModel.js";

// Tạo 1 order detail (thường gọi trong createOrder)
export const createOrderDetail = async (req, res) => {
  try {
    const { order_id, product_id, seller_id, quantity, price } = req.body;
    if (!order_id || !product_id || !quantity || !price)
      return res.status(400).json({ message: "Thiếu trường bắt buộc" });

    const subtotal = Number(price) * Number(quantity);

    const od = await OrderDetail.create({
      order_detail_id: "OD" + Date.now(),
      order_id,
      product_id,
      seller_id: seller_id || null,
      quantity,
      price,
      subtotal,
      created_at: new Date(),
    });

    res.status(201).json(od);
  } catch (error) {
    console.error("createOrderDetail:", error);
    res.status(500).json({ message: error.message });
  }
};

// Tạo nhiều order details (receive items array) — tiện khi tạo order chứa nhiều sản phẩm
export const createOrderDetailsBulk = async (req, res) => {
  try {
    const { order_id, items } = req.body; // items = [{product_id, seller_id, quantity, price}, ...]

    if (!order_id || !Array.isArray(items) || items.length === 0)
      return res.status(400).json({ message: "Thiếu order_id hoặc items" });

    const docs = items.map((it) => ({
      order_detail_id: "OD" + Date.now() + Math.floor(Math.random() * 1000),
      order_id,
      product_id: it.product_id,
      seller_id: it.seller_id || null,
      quantity: it.quantity,
      price: it.price,
      subtotal: Number(it.price) * Number(it.quantity),
      created_at: new Date(),
    }));

    const inserted = await OrderDetail.insertMany(docs);
    res.status(201).json(inserted);
  } catch (error) {
    console.error("createOrderDetailsBulk:", error);
    res.status(500).json({ message: error.message });
  }
};

// Lấy chi tiết đơn theo order_id
export const getDetailsByOrder = async (req, res) => {
  try {
    const { order_id } = req.params;
    const details = await OrderDetail.find({ order_id });
    res.json(details);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy tất cả order details (admin)
export const getAllOrderDetails = async (req, res) => {
  try {
    const details = await OrderDetail.find().sort({ created_at: -1 });
    res.json(details);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật 1 order detail (ví dụ sửa quantity)
export const updateOrderDetail = async (req, res) => {
  try {
    const { id } = req.params; // id là order_detail_id
    const { quantity, price } = req.body;

    const od = await OrderDetail.findOne({ order_detail_id: id });
    if (!od) return res.status(404).json({ message: "Không tìm thấy order detail" });

    if (quantity !== undefined) od.quantity = quantity;
    if (price !== undefined) od.price = price;
    od.subtotal = Number(od.price) * Number(od.quantity);

    await od.save();
    res.json(od);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa order detail
export const deleteOrderDetail = async (req, res) => {
  try {
    const { id } = req.params; // id = order_detail_id
    const od = await OrderDetail.findOne({ order_detail_id: id });
    if (!od) return res.status(404).json({ message: "Không tìm thấy order detail" });

    await od.deleteOne();
    res.json({ message: "Đã xóa order detail" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
