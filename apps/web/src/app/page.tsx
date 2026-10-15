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
  ALL_PRODUCTS,
  BENEFITS_ITEMS,
  WHY_CHOOSE_ITEMS,
  HERO_STATS,
} from "@/data/mockStoreData";
import { Product, Category } from "@/types/store";
import { useCart } from "@/context/CartContext";
import { fetchApi } from "@/lib/api";

export default function HomePage() {
  const { addToCart, showToast } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>(MOCK_FEATURED_PRODUCTS);
  const [categoriesList, setCategoriesList] = useState<Category[]>(MOCK_CATEGORIES);

  // Fetch live products with currentStock from database
  React.useEffect(() => {
    let active = true;

    Promise.all([
      fetchApi<any[]>("/api/products").catch(() => null),
      fetchApi<any[]>("/api/categories").catch(() => null),
    ]).then(([prods, cats]) => {
      if (!active) return;

      if (prods && Array.isArray(prods) && prods.length > 0) {
        const mapped: Product[] = prods.map((p) => {
          const mockMatch = ALL_PRODUCTS.find(
            (m) => m.productId === p.productId || m.productName.toLowerCase() === p.productName.toLowerCase()
          );

          return {
            productId: p.productId,
            productName: p.productName,
            description: p.description || mockMatch?.description || "",
            fullDescription: mockMatch?.fullDescription,
            price: Number(p.price),
            packageSize: mockMatch?.packageSize,
            imageUrl: p.imageUrl || mockMatch?.imageUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
            images: mockMatch?.images || [p.imageUrl],
            categoryId: p.categoryId,
            categoryName: p.categoryName || mockMatch?.categoryName || "Grocery",
            currentStock: p.currentStock !== undefined && p.currentStock !== null ? Number(p.currentStock) : (mockMatch?.currentStock ?? 0),
            isActive: p.isActive !== false,
            isPopular: mockMatch?.isPopular ?? false,
            unitPrice: mockMatch?.unitPrice,
            supplier: p.supplierName || mockMatch?.supplier,
            expiryDate: p.expiryDate ? String(p.expiryDate) : mockMatch?.expiryDate,
            highlights: mockMatch?.highlights,
            storageInstructions: mockMatch?.storageInstructions,
            nutritionalInfo: mockMatch?.nutritionalInfo,
          };
        });

        // Filter for active popular products, or top 5 products
        const popular = mapped.filter((p) => p.isPopular);
        setFeaturedProducts(popular.length >= 4 ? popular.slice(0, 5) : mapped.slice(0, 5));
      }

      if (cats && Array.isArray(cats) && cats.length > 0) {
        setCategoriesList(
          cats.map((c) => {
            const mockC = MOCK_CATEGORIES.find((m) => m.categoryName.toLowerCase() === c.categoryName.toLowerCase());
            return {
              categoryId: c.categoryId,
              categoryName: c.categoryName,
              slug: c.categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
              imageUrl: mockC?.imageUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
              itemCount: mockC?.itemCount,
            };
          })
        );
      }
    });

    return () => {
      active = false;
    };
  }, []);

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

  // Filter products if a category is selected
  const displayedProducts = selectedCategory
    ? featuredProducts.filter(
        (p) => p.categoryName === selectedCategory || selectedCategory === "All"
      )
    : featuredProducts;

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
          categories={categoriesList}
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