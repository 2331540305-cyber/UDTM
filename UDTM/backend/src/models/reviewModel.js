import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    review_id: { type: String, required: true, unique: true },
    product_id: { type: String, required: true },
    user_id: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
    created_at: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

const Review = mongoose.model("Review", reviewSchema, "reviews");
export default Review;
