import React from "react";

export default function CategoryList({ categories = [], selectedCategory, onSelectCategory }) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {/* All Categories Button */}
      <button
        onClick={() => onSelectCategory(null)}
        className={`px-4 py-2 rounded-full font-semibold transition-colors ${
          selectedCategory === null
            ? "bg-[#5FB4E8] text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        📁 Tất cả
      </button>

      {/* Category Buttons */}
      {categories.map((category) => (
        <button
          key={category.category_id || category}
          onClick={() =>
            onSelectCategory(
              category.category_name || category
            )
          }
          className={`px-4 py-2 rounded-full font-semibold transition-colors ${
            selectedCategory === (category.category_name || category)
              ? "bg-[#5FB4E8] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {category.category_name || category}
        </button>
      ))}
    </div>
  );
}
