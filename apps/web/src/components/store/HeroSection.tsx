"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroStat } from "@/types/store";
import { HERO_STATS } from "@/data/mockStoreData";

interface HeroSectionProps {
  stats?: HeroStat[];
  onShopNowClick?: () => void;
}

export function HeroSection({
  stats = HERO_STATS,
  onShopNowClick,
}: HeroSectionProps) {
  return (
    <section className="relative w-full min-h-[580px] sm:min-h-[640px] md:min-h-[700px] lg:min-h-[780px] overflow-hidden flex flex-col">
      {/* Full-bleed Editorial Lifestyle Background Photography */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-editorial-v2.jpg"
          alt="Holding a fresh grocery tote bag filled with crisp organic kale, baguette, and ripe bell peppers"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center sm:object-[center_35%]"
        />
        {/* Cinematic contrast gradients: subtle dark vignette on left for typography readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent sm:from-black/70 sm:via-black/35 sm:to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
      </div>

      {/* Main Hero Copy - Large Serif Typography with Italic Accent */}
      <div className="relative z-10 max-w-[1536px] w-full mx-auto px-6 sm:px-10 lg:px-14 pt-28 sm:pt-36 lg:pt-40 pb-12 sm:pb-16 flex-1 flex flex-col justify-center">
        <div className="max-w-xl sm:max-w-2xl space-y-5 sm:space-y-6">
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-normal tracking-tight text-white leading-[1.05] drop-shadow-sm">
            Good food. <br />
            <span className="italic font-normal text-[#E2EDDB]">Better days.</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-white/90 font-light max-w-lg leading-relaxed">
            Fresh produce, everyday essentials and more — all in one place.
          </p>

          {/* High-Contrast Lime-Green CTA Button */}
          <div className="pt-2 sm:pt-4">
            <Link
              href="/products"
              onClick={onShopNowClick}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-sm sm:text-base font-bold tracking-wider uppercase text-[#1B382B] bg-[#D2E878] hover:bg-[#C2DC60] active:scale-95 shadow-[0_4px_24px_rgba(0,0,0,0.25)] hover:shadow-[0_8px_32px_rgba(210,232,120,0.35)] transition-all duration-200 group"
            >
              <span>Shop Now</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Warm Cream Statistics Panel Integrated into the Hero Base */}
      <div className="relative z-10 max-w-[1536px] w-full mx-auto px-4 sm:px-8 lg:px-12 pb-6 sm:pb-8">
        <div className="relative bg-[#FAF5EC]/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-[#EDE4D5]/80 shadow-[0_12px_40px_rgba(0,0,0,0.18)] px-6 sm:px-12 py-5 sm:py-6 overflow-hidden">
          <div className="grid grid-cols-3 divide-x divide-stone-300/60 text-center">
            {stats.map((stat, idx) => (
              <div key={idx} className="px-2 sm:px-6">
                <div className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#1E4D38] tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-medium text-stone-600 mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
