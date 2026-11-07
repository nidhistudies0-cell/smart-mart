"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Product } from "@/types/store";
import { MOCK_FEATURED_PRODUCTS } from "@/data/mockStoreData";
import { ProductCard } from "./ProductCard";
import SplitText from "@/components/ui/SplitText";

interface FeaturedProductsProps {
  products?: Product[];
  onAddToCart?: (product: Product) => void;
  onToggleFavorite?: (product: Product, isFav: boolean) => void;
  onViewAllClick?: () => void;
}

export function FeaturedProducts({
  products = MOCK_FEATURED_PRODUCTS,
  onAddToCart,
  onToggleFavorite,
  onViewAllClick,
}: FeaturedProductsProps) {
  return (
    <section id="products" className="py-12 sm:py-16">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="relative text-center mb-8 sm:mb-12 max-w-3xl mx-auto px-4">
          <span className="text-xs sm:text-sm font-bold tracking-widest uppercase text-stone-500 block mb-2 sm:mb-3">
            Featured Products
          </span>
          <div>
            <SplitText
              tag="h2"
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight justify-center"
              effect="rise"
              hoverEffect="lift"
              splitType="chars"
              delay={30}
              duration={0.8}
            >
              <span>Popular Picks</span>
              <span className="text-[#215E3F] inline-block ml-3 sm:ml-4">for You</span>
            </SplitText>
          </div>

          {/* View All Link redirecting to /products */}
          <div className="mt-4 sm:mt-5">
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-stone-700 hover:text-[#1E4D38] group transition-colors"
            >
              <span>View All Products</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* 5 Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.productId}
              product={product}
              onAddToCart={onAddToCart}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
