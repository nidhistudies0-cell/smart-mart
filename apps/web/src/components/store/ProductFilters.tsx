"use client";

import React, { useState } from "react";
import { ChevronUp, ChevronDown, Check, RotateCcw } from "lucide-react";
import { SortOption } from "@/types/store";
import { MOCK_CATEGORIES } from "@/data/mockStoreData";

interface ProductFiltersProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  maxPrice: number;
  onMaxPriceChange: (val: number) => void;
  availability: "all" | "in-stock" | "out-of-stock";
  onAvailabilityChange: (val: "all" | "in-stock" | "out-of-stock") => void;
  sortBy: SortOption;
  onSortByChange: (val: SortOption) => void;
  onResetFilters?: () => void;
  categoriesList?: { categoryId: number; categoryName: string }[];
}

export function ProductFilters({
  selectedCategory,
  onSelectCategory,
  maxPrice,
  onMaxPriceChange,
  availability,
  onAvailabilityChange,
  sortBy,
  onSortByChange,
  onResetFilters,
  categoriesList,
}: ProductFiltersProps) {
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);
  const [availabilityOpen, setAvailabilityOpen] = useState(true);
  const [sortOpen, setSortOpen] = useState(true);

  const sourceCategories = categoriesList && categoriesList.length > 0 ? categoriesList : MOCK_CATEGORIES;
  const categories = [
    { id: "all", name: "All Categories" },
    ...sourceCategories.map((c) => ({ id: c.categoryName, name: c.categoryName })),
  ];

  const sortOptions: { id: SortOption; label: string }[] = [
    { id: "relevance", label: "Relevance" },
    { id: "price-low-high", label: "Price: Low to High" },
    { id: "price-high-low", label: "Price: High to Low" },
    { id: "name-asc", label: "Name (A - Z)" },
    { id: "newest", label: "Newest First" },
  ];

  return (
    <aside className="w-full bg-white rounded-2xl border border-stone-200/80 p-5 shadow-2xs space-y-6">
      
      {/* 1. CATEGORIES */}
      <div className="border-b border-stone-100 pb-5">
        <button
          onClick={() => setCategoriesOpen(!categoriesOpen)}
          className="w-full flex items-center justify-between text-left font-bold text-stone-900 hover:text-[#1E4D38] transition-colors"
        >
          <span className="text-sm font-bold">Categories</span>
          {categoriesOpen ? (
            <ChevronUp className="w-4 h-4 text-stone-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-stone-500" />
          )}
        </button>

        {categoriesOpen && (
          <div className="mt-3.5 space-y-1">
            {categories.map((cat) => {
              const isSelected =
                cat.id === "all"
                  ? selectedCategory === "all"
                  : selectedCategory === cat.name;

              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id === "all" ? "all" : cat.name)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm transition-all cursor-pointer text-left ${
                    isSelected
                      ? "bg-[#E7F2E4] text-[#1E4D38] font-bold"
                      : "text-stone-600 hover:bg-stone-50 hover:text-stone-900 font-medium"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? "bg-[#1E4D38] text-white"
                        : "border border-stone-300 bg-white"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-3" />}
                  </div>
                  <span className="truncate">{cat.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. PRICE RANGE */}
      <div className="border-b border-stone-100 pb-5">
        <button
          onClick={() => setPriceOpen(!priceOpen)}
          className="w-full flex items-center justify-between text-left font-bold text-stone-900 hover:text-[#1E4D38] transition-colors"
        >
          <span className="text-sm font-bold">Price Range</span>
          {priceOpen ? (
            <ChevronUp className="w-4 h-4 text-stone-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-stone-500" />
          )}
        </button>

        {priceOpen && (
          <div className="mt-3.5 space-y-3">
            <input
              type="range"
              min="20"
              max="500"
              step="10"
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(Number(e.target.value))}
              className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#1E4D38]"
            />
            <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
              <span>₹0</span>
              <span className="text-[#1E4D38] font-bold">Up to ₹{maxPrice}</span>
              <span>₹1000+</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. AVAILABILITY */}
      <div className="border-b border-stone-100 pb-5">
        <button
          onClick={() => setAvailabilityOpen(!availabilityOpen)}
          className="w-full flex items-center justify-between text-left font-bold text-stone-900 hover:text-[#1E4D38] transition-colors"
        >
          <span className="text-sm font-bold">Availability</span>
          {availabilityOpen ? (
            <ChevronUp className="w-4 h-4 text-stone-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-stone-500" />
          )}
        </button>

        {availabilityOpen && (
          <div className="mt-3.5 space-y-2">
            {/* In Stock */}
            <button
              onClick={() =>
                onAvailabilityChange(availability === "in-stock" ? "all" : "in-stock")
              }
              className="w-full flex items-center gap-3 px-1 py-1.5 text-xs sm:text-sm text-stone-700 hover:text-stone-900 cursor-pointer"
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                  availability === "in-stock" || availability === "all"
                    ? "bg-[#1E4D38] text-white"
                    : "border border-stone-300 bg-white"
                }`}
              >
                {(availability === "in-stock" || availability === "all") && (
                  <Check className="w-3.5 h-3.5 stroke-3" />
                )}
              </div>
              <span className="font-medium">In Stock</span>
            </button>

            {/* Out of Stock */}
            <button
              onClick={() =>
                onAvailabilityChange(availability === "out-of-stock" ? "all" : "out-of-stock")
              }
              className="w-full flex items-center gap-3 px-1 py-1.5 text-xs sm:text-sm text-stone-700 hover:text-stone-900 cursor-pointer"
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                  availability === "out-of-stock"
                    ? "bg-[#1E4D38] text-white"
                    : "border border-stone-300 bg-white"
                }`}
              >
                {availability === "out-of-stock" && (
                  <Check className="w-3.5 h-3.5 stroke-3" />
                )}
              </div>
              <span className="font-medium">Out of Stock</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. SORT BY */}
      <div>
        <button
          onClick={() => setSortOpen(!sortOpen)}
          className="w-full flex items-center justify-between text-left font-bold text-stone-900 hover:text-[#1E4D38] transition-colors"
        >
          <span className="text-sm font-bold">Sort By</span>
          {sortOpen ? (
            <ChevronUp className="w-4 h-4 text-stone-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-stone-500" />
          )}
        </button>

        {sortOpen && (
          <div className="mt-3.5 space-y-1">
            {sortOptions.map((opt) => {
              const isSelected = sortBy === opt.id;

              return (
                <button
                  key={opt.id}
                  onClick={() => onSortByChange(opt.id)}
                  className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs sm:text-sm transition-all cursor-pointer text-left ${
                    isSelected
                      ? "text-[#1E4D38] font-bold"
                      : "text-stone-600 hover:text-stone-900 font-medium"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? "bg-[#1E4D38] text-white"
                        : "border border-stone-300 bg-white"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-3" />}
                  </div>
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Reset Filters Option */}
      {onResetFilters && (
        <div className="pt-2">
          <button
            onClick={onResetFilters}
            className="w-full py-2 px-3 text-xs font-semibold text-stone-600 hover:text-[#1E4D38] bg-stone-50 hover:bg-[#E7F2E4] rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      )}

    </aside>
  );
}
