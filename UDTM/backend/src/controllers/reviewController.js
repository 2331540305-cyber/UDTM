import Review from "../models/reviewModel.js";
import Product from "../models/productModel.js";

// ➕ Tạo đánh giá mới
export const createReview = async (req, res) => {
  try {
    const { product_id, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: "Điểm đánh giá không hợp lệ" });

    const review = await Review.create({
      review_id: "RV" + Date.now(),
      product_id,
      user_id: req.user.user_id,
      rating,
      comment,
      created_at: new Date(),
    });

    res.status(201).json(review);
  } catch (error) {
    console.error("Lỗi tạo đánh giá:", error);
    res.status(500).json({ message: error.message });
  }
};

// 📋 Lấy tất cả đánh giá của 1 sản phẩm
export const getReviewsByProduct = async (req, res) => {
  try {
    const reviews = await Review.find({ product_id: req.params.product_id });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🗑️ Xóa đánh giá (admin hoặc chủ đánh giá)
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findOne({ review_id: req.params.id });
    if (!review) return res.status(404).json({ message: "Không tìm thấy đánh giá" });

    // chỉ cho phép admin hoặc người viết xóa
    if (req.user.role !== "admin" && req.user.user_id !== review.user_id) {
      return res.status(403).json({ message: "Không có quyền xóa" });
    }

    await review.deleteOne();
    res.json({ message: "Đã xóa đánh giá" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
