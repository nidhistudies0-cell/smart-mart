"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/store/Navbar";
import { HeroSection } from "@/components/store/HeroSection";
import { BenefitsStrip } from "@/components/store/BenefitsStrip";
import { CategorySection } from "@/components/store/CategorySection";
import { FeaturedProducts } from "@/components/store/FeaturedProducts";
import { PromoBanner } from "@/components/store/PromoBanner";
import { WhyChooseSmartMart } from "@/components/store/WhyChooseSmartMart";
import { HomeFooter } from "@/components/store/HomeFooter";
import {
  MOCK_CATEGORIES,
  MOCK_FEATURED_PRODUCTS,
  BENEFITS_ITEMS,
  WHY_CHOOSE_ITEMS,
  HERO_STATS,
} from "@/data/mockStoreData";
import { Product, Category } from "@/types/store";
import { useCart } from "@/context/CartContext";

export default function HomePage() {
  const { addToCart, showToast } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
  };

  const handleToggleFavorite = (product: Product, isFav: boolean) => {
    showToast(
      isFav
        ? `Added "${product.productName}" to wishlist`
        : `Removed "${product.productName}" from wishlist`
    );
  };

  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category.categoryName);
    showToast(`Filtered by category: "${category.categoryName}"`);
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      showToast(`Searching for "${query}"`);
    }
  };

  // Filter products if a category is selected (UI demonstration)
  const displayedProducts = selectedCategory
    ? MOCK_FEATURED_PRODUCTS.filter(
        (p) => p.categoryName === selectedCategory || selectedCategory === "All"
      )
    : MOCK_FEATURED_PRODUCTS;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-stone-900 selection:bg-[#D3E2D3] selection:text-[#1A4731]">
      
      {/* A. Top Navigation */}
      <Navbar />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* B. Hero Section */}
        <HeroSection stats={HERO_STATS} />

        {/* C. Benefits Strip */}
        <BenefitsStrip items={BENEFITS_ITEMS} />

        {/* D. Shop by Category */}
        <CategorySection
          categories={MOCK_CATEGORIES}
          onSelectCategory={handleSelectCategory}
        />

        {/* E. Featured Products */}
        <FeaturedProducts
          products={displayedProducts.length > 0 ? displayedProducts : MOCK_FEATURED_PRODUCTS}
          onAddToCart={handleAddToCart}
          onToggleFavorite={handleToggleFavorite}
          onViewAllClick={() => {
            setSelectedCategory(null);
            showToast("Showing all popular picks");
          }}
        />

        {/* F. Promotional Banner */}
        <PromoBanner />

        {/* G. Why Choose SmartMart? */}
        <WhyChooseSmartMart items={WHY_CHOOSE_ITEMS} />
      </main>

      {/* H. Homepage Footer (Only on Homepage) */}
      <HomeFooter />

    </div>
  );
}