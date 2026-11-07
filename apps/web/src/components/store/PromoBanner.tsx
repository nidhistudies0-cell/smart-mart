"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

interface PromoBannerProps {
  onShopNowClick?: () => void;
}

export function PromoBanner({ onShopNowClick }: PromoBannerProps) {
  return (
    <section className="py-8 sm:py-12">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl sm:rounded-[2.5rem] bg-[#DBE7D5] overflow-hidden border border-[#CBDCC4]/80 shadow-card">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10 lg:p-12 relative z-10">
            
            {/* Left Copy Column */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight leading-[1.2]">
                Fresh Essentials <br className="hidden sm:inline" />
                for a Better Tomorrow
              </h2>
              <p className="text-sm sm:text-base text-stone-700 max-w-md font-medium leading-relaxed">
                Get fresh groceries, household items and more at the best prices. Shop now and enjoy
                a healthier, happier everyday routine.
              </p>
              <div className="pt-2">
                <Link
                  href="/products"
                  onClick={onShopNowClick}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full text-sm sm:text-base font-semibold text-white bg-[#1E4D38] hover:bg-[#163C2B] shadow-sm hover:shadow-md transition-all duration-200 group"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Center Playful Handwritten Annotation (visible on md/lg screens) */}
            <div className="hidden md:flex lg:col-span-2 flex-col items-center justify-center text-center select-none pointer-events-none -my-4">
              <div className="rotate-[-6deg] text-stone-800">
                <span className="font-handwriting text-2xl font-bold tracking-wide flex items-center justify-center gap-1">
                  ‹Fresh›
                </span>
                <span className="font-handwriting text-xl font-bold text-stone-700 block -mt-1">
                  Choices
                </span>
                <span className="font-handwriting text-lg font-bold text-stone-600 block -mt-1">
                  Everyday
                </span>
                {/* Hand-drawn style playful arrow */}
                <svg
                  className="w-10 h-6 text-[#215E3F] mx-auto mt-1"
                  viewBox="0 0 50 30"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 10 Q 25 28 45 15"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M38 12 L45 15 L42 22"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Right Fresh Produce Image Column */}
            <div className="lg:col-span-4 relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[380px] h-52 sm:h-64 lg:h-72 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xs">
                <Image
                  src="/images/promo-vegetables.jpg"
                  alt="Fresh farm carrots, tomatoes, broccoli, and citrus spread"
                  fill
                  sizes="(max-width: 768px) 100vw, 380px"
                  className="object-cover object-center transform hover:scale-104 transition-transform duration-700"
                />
              </div>
            </div>

          </div>

          {/* Background decorative leaf curve */}
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/20 rounded-full blur-xl pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
