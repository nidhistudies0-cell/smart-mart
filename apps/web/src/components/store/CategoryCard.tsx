"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Category } from "@/types/store";
import { ShoppingBasket } from "lucide-react";

interface CategoryCardProps {
  category: Category;
  onSelectCategory?: (category: Category) => void;
}

export function CategoryCard({ category, onSelectCategory }: CategoryCardProps) {
  const [imgError, setImgError] = useState(false);

  const categoryUrl = `/products?category=${encodeURIComponent(category.categoryName)}`;

  const handleClick = (e: React.MouseEvent) => {
    if (onSelectCategory) {
      onSelectCategory(category);
    }
  };

  return (
    <Link
      href={categoryUrl}
      onClick={handleClick}
      className="group relative flex flex-col justify-end shrink-0 w-[180px] sm:w-[200px] md:w-[220px] h-[240px] sm:h-[260px] md:h-[280px] rounded-3xl overflow-hidden bg-stone-900 border border-stone-200/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer"
    >
      {/* Background Image filling the entire card */}
      {!imgError ? (
        <Image
          src={category.imageUrl}
          alt={category.categoryName}
          fill
          sizes="(max-width: 640px) 180px, (max-width: 768px) 200px, 220px"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="absolute inset-0 bg-stone-200 flex items-center justify-center text-stone-400">
          <ShoppingBasket className="w-12 h-12 opacity-60" />
        </div>
      )}

      {/* Subtle overlay gradients for text readability and premium depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/5 group-hover:from-black/90 group-hover:via-black/45 transition-colors duration-300 pointer-events-none" />

      {/* Card Content at the bottom */}
      <div className="relative z-10 p-4 sm:p-5 flex flex-col justify-end w-full">
        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug drop-shadow-sm group-hover:text-[#D2E878] transition-colors">
          {category.categoryName}
        </h3>
      </div>
    </Link>
  );
}
