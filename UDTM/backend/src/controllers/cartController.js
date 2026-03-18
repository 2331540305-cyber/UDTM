import Cart from "../models/cartModel.js";
import CartItem from "../models/cartItemModel.js";
import Product from "../models/productModel.js";

// 🛍 Lấy giỏ hàng của user (chỉ dành cho buyer)
export const getMyCart = async (req, res) => {
  try {
    // Chỉ buyer mới có giỏ hàng
    if (req.user.role !== "buyer") {
      return res.status(403).json({ message: "Chỉ người mua mới có giỏ hàng. Bạn là " + req.user.role });
    }

    let cart = await Cart.findOne({ user_id: req.user.user_id });
    if (!cart) {
      cart = await Cart.create({
        cart_id: "C" + Date.now(),
        user_id: req.user.user_id,
      });
    }

    const items = await CartItem.find({ cart_id: cart.cart_id });

    // Enrich items with product details when possible
    const enriched = await Promise.all(
      items.map(async (it) => {
        let product = null;
        try {
          // try by ObjectId
          product = await Product.findById(it.product_id);
        } catch (e) {
          // ignore
        }
        if (!product) product = await Product.findOne({ product_id: it.product_id });

        return {
          cart_item_id: it.cart_item_id,
          cart_id: it.cart_id,
          product_id: it.product_id,
          quantity: it.quantity,
          product: product || null,
        };
      })
    );

    res.json({ cart, items: enriched });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ➕ Thêm sản phẩm vào giỏ (chỉ dành cho buyer)
export const addToCart = async (req, res) => {
  try {
    // Chỉ buyer mới có thể thêm vào giỏ
    if (req.user.role !== "buyer") {
      return res.status(403).json({ message: "Chỉ người mua mới có thể thêm sản phẩm vào giỏ" });
    }

    const { product_id, quantity } = req.body;

    let cart = await Cart.findOne({ user_id: req.user.user_id });
    if (!cart) {
      cart = await Cart.create({
        cart_id: "C" + Date.now(),
        user_id: req.user.user_id,
      });
    }

    const existing = await CartItem.findOne({
      cart_id: cart.cart_id,
      product_id,
    });

    if (existing) {
      existing.quantity += quantity;
      await existing.save();
    } else {
      await CartItem.create({
        cart_item_id: "CI" + Date.now(),
        cart_id: cart.cart_id,
        product_id,
        quantity,
      });
    }

    res.json({ message: "Đã thêm sản phẩm vào giỏ" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✏️ Cập nhật số lượng (chỉ dành cho buyer)
export const updateCartItem = async (req, res) => {
  try {
    if (req.user.role !== "buyer") {
      return res.status(403).json({ message: "Chỉ người mua mới có thể cập nhật giỏ hàng" });
    }

    const { cart_item_id, quantity } = req.body;
    const item = await CartItem.findOne({ cart_item_id });

    if (!item) return res.status(404).json({ message: "Không tìm thấy sản phẩm trong giỏ" });

    item.quantity = quantity;
    await item.save();
    res.json({ message: "Đã cập nhật số lượng" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ❌ Xóa 1 sản phẩm khỏi giỏ (chỉ dành cho buyer)
export const removeFromCart = async (req, res) => {
  try {
    if (req.user.role !== "buyer") {
      return res.status(403).json({ message: "Chỉ người mua mới có thể xóa giỏ hàng" });
    }

    const { cart_item_id } = req.params;
    await CartItem.deleteOne({ cart_item_id });
    res.json({ message: "Đã xóa sản phẩm khỏi giỏ" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🗑️ Xóa toàn bộ giỏ (chỉ dành cho buyer)
export const clearCart = async (req, res) => {
  try {
    if (req.user.role !== "buyer") {
      return res.status(403).json({ message: "Chỉ người mua mới có thể xóa giỏ hàng" });
    }

    const cart = await Cart.findOne({ user_id: req.user.user_id });
    if (!cart) return res.status(404).json({ message: "Không có giỏ hàng" });

    await CartItem.deleteMany({ cart_id: cart.cart_id });
    res.json({ message: "Đã làm trống giỏ hàng" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
