import CartItem from "../models/cartItemModel.js";
import Product from "../models/productModel.js";
import Cart from "../models/cartModel.js";

// 📋 Lấy tất cả cart items theo cart_id
export const getCartItems = async (req, res) => {
  try {
    const { cart_id } = req.params;
    const items = await CartItem.find({ cart_id });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Thêm 1 item vào giỏ
export const addCartItem = async (req, res) => {
  try {
    const { cart_id, product_id, quantity } = req.body;

    const product = await Product.findOne({ product_id });
    if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    const existing = await CartItem.findOne({ cart_id, product_id });
    if (existing) {
      existing.quantity += quantity;
      await existing.save();
      return res.json({ message: "Đã cập nhật số lượng sản phẩm" });
    }

    const newItem = await CartItem.create({
      cart_item_id: "CI" + Date.now(),
      cart_id,
      product_id,
      quantity,
    });

    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Cập nhật số lượng
export const updateCartItem = async (req, res) => {
  try {
    const { cart_item_id, quantity } = req.body;
    const item = await CartItem.findOne({ cart_item_id });

    if (!item) return res.status(404).json({ message: "Không tìm thấy cart item" });

    item.quantity = quantity;
    await item.save();

    res.json({ message: "Đã cập nhật số lượng", item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Xóa cart item
export const deleteCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await CartItem.findOne({ cart_item_id: id });
    if (!item) return res.status(404).json({ message: "Không tìm thấy cart item" });

    await item.deleteOne();
    res.json({ message: "Đã xóa sản phẩm khỏi giỏ" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
