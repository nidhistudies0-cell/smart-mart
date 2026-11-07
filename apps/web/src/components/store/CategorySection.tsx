"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Category } from "@/types/store";
import { MOCK_CATEGORIES } from "@/data/mockStoreData";
import { CategoryCard } from "./CategoryCard";
import SplitText from "@/components/ui/SplitText";

interface CategorySectionProps {
  categories?: Category[];
  onSelectCategory?: (category: Category) => void;
}

export function CategorySection({
  categories = MOCK_CATEGORIES,
  onSelectCategory,
}: CategorySectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isHoveredRef = useRef(false);
  const isInteractingRef = useRef(false);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Triple the list to create a seamless infinite scrolling loop
  const displayCategories = [...categories, ...categories, ...categories];

  const handleManualScroll = useCallback((direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;

    // Pause auto-rotation while user is interacting manually
    isInteractingRef.current = true;
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      isInteractingRef.current = false;
    }, 2500);

    const scrollAmount = 320;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }, []);

  // Continuous smooth auto-rotation animation loop (moving to the right / clockwise)
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    let animationFrameId: number;
    const speed = 0.65; // Slow, pleasant continuous motion (pixels per frame)

    const step = () => {
      if (el && !isHoveredRef.current && !isInteractingRef.current) {
        el.scrollLeft += speed;

        // Reset scroll position seamlessly when reaching 2/3 of the infinite rail
        const oneThird = el.scrollWidth / 3;
        if (el.scrollLeft >= oneThird * 2) {
          el.scrollLeft -= oneThird;
        } else if (el.scrollLeft <= 0) {
          el.scrollLeft += oneThird;
        }
      }
      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, [displayCategories.length]);

  return (
    <section id="categories" className="py-12 sm:py-16 overflow-hidden">
      {/* Header stays aligned with page max width */}
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12 max-w-3xl mx-auto px-4">
          <span className="text-xs sm:text-sm font-bold tracking-widest uppercase text-stone-500 block mb-2 sm:mb-3">
            Shop by Category
          </span>
          <SplitText
            tag="h2"
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight justify-center"
            effect="rise"
            hoverEffect="lift"
            splitType="chars"
            delay={30}
            duration={0.8}
          >
            <span>Explore Our</span>
            <span className="text-[#215E3F] inline-block ml-3 sm:ml-4">Categories</span>
          </SplitText>
        </div>
      </div>

      {/* Full-bleed Carousel Container (Spans 100% of the screen from edge to edge) */}
      <div 
        className="relative group w-full"
        onMouseEnter={() => { isHoveredRef.current = true; }}
        onMouseLeave={() => { isHoveredRef.current = false; }}
      >
        {/* Scrollable Categories List */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto no-scrollbar scroll-smooth pb-4 px-4 sm:px-6 lg:px-8 w-full"
        >
          {displayCategories.map((category, idx) => (
            <CategoryCard
              key={`${category.categoryId}-${idx}`}
              category={category}
              onSelectCategory={onSelectCategory}
            />
          ))}
        </div>

        {/* Category Carousel Arrow:
            Circular 32px white button with 0 4px 24px rgba(0,0,0,0.12) shadow.
            Contains a 16px ink-black right-chevron. Sits at the right edge of any horizontal product rail, vertically centered. */}
        <button
          onClick={() => handleManualScroll("right")}
          aria-label="Fast advance categories"
          className="flex absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white items-center justify-center cursor-pointer shadow-[0_4px_24px_rgba(0,0,0,0.12)] hover:scale-110 active:scale-95 transition-all border border-black/5"
        >
          <ChevronRight className="w-4 h-4 text-[#111111]" />
        </button>

        {/* Left Arrow on rail */}
        <button
          onClick={() => handleManualScroll("left")}
          aria-label="Previous categories"
          className="hidden sm:flex absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white items-center justify-center cursor-pointer shadow-[0_4px_24px_rgba(0,0,0,0.12)] hover:scale-110 active:scale-95 transition-all border border-black/5"
        >
          <ChevronLeft className="w-4 h-4 text-[#111111]" />
        </button>
      </div>
    </section>
  );
}
