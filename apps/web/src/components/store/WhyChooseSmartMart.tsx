"use client";

import React from "react";
import { Tag, ShieldCheck, RefreshCcw, Headphones } from "lucide-react";
import { WhyChooseItem } from "@/types/store";
import { WHY_CHOOSE_ITEMS } from "@/data/mockStoreData";
import SplitText from "@/components/ui/SplitText";

interface WhyChooseSmartMartProps {
  items?: WhyChooseItem[];
}

export function WhyChooseSmartMart({
  items = WHY_CHOOSE_ITEMS,
}: WhyChooseSmartMartProps) {
  const renderIcon = (icon: WhyChooseItem["icon"]) => {
    switch (icon) {
      case "prices":
        return <Tag className="w-5 h-5 text-[#C25E2E]" />;
      case "payments":
        return <ShieldCheck className="w-5 h-5 text-[#1E4D38]" />;
      case "returns":
        return <RefreshCcw className="w-5 h-5 text-[#C25E2E]" />;
      case "support":
        return <Headphones className="w-5 h-5 text-[#C25E2E]" />;
      default:
        return <Tag className="w-5 h-5 text-[#C25E2E]" />;
    }
  };

  return (
    <section id="why-choose" className="py-12 sm:py-16">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="relative text-center mb-10 sm:mb-14 max-w-3xl mx-auto px-4">
          <span className="text-xs sm:text-sm font-bold tracking-widest uppercase text-stone-500 block mb-2 sm:mb-3">
            Why Choose SmartMart
          </span>
          <SplitText
            tag="h2"
            text="More Than Just a Supermarket"
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight justify-center"
            effect="rise"
            hoverEffect="lift"
            splitType="chars"
            delay={30}
            duration={0.8}
            textAlign="center"
          />
        </div>

        {/* 4 Feature Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {items.map((item) => {
            const bgClass =
              item.accentColor === "mint"
                ? "bg-[#E3EFE5]"
                : "bg-[#FDEFE5]";

            return (
              <div
                key={item.id}
                className="flex items-start gap-4 p-5 rounded-2xl bg-white/70 border border-stone-200/70 shadow-2xs hover:shadow-card hover:-translate-y-0.5 transition-all duration-200 group"
              >
                {/* Circular Icon */}
                <div
                  className={`w-12 h-12 rounded-full ${bgClass} flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105`}
                >
                  {renderIcon(item.icon)}
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-stone-900 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-500 font-normal leading-snug mt-1">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
