"use client";

import React from "react";
import { ShoppingCart, Leaf, Package, Truck } from "lucide-react";
import { BenefitItem } from "@/types/store";
import { BENEFITS_ITEMS } from "@/data/mockStoreData";

interface BenefitsStripProps {
  items?: BenefitItem[];
}

export function BenefitsStrip({ items = BENEFITS_ITEMS }: BenefitsStripProps) {
  const renderIcon = (type: BenefitItem["icon"]) => {
    switch (type) {
      case "range":
        return <ShoppingCart className="w-5 h-5 text-[#1E4D38]" />;
      case "fresh":
        return <Leaf className="w-5 h-5 text-[#C25E2E]" />;
      case "inventory":
        return <Package className="w-5 h-5 text-[#205A3A]" />;
      case "delivery":
        return <Truck className="w-5 h-5 text-[#C25E2E]" />;
      default:
        return <ShoppingCart className="w-5 h-5 text-[#1E4D38]" />;
    }
  };

  return (
    <section className="py-6 sm:py-8">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/80 backdrop-blur-xs rounded-2xl sm:rounded-3xl border border-[#ECE5DB] p-5 sm:p-7 shadow-2xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {items.map((item) => {
              const bgClass =
                item.accentColor === "mint"
                  ? "bg-[#E3EFE5]"
                  : "bg-[#FDEFE5]";

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-4 group transition-transform hover:-translate-y-0.5 duration-200"
                >
                  {/* Circular Icon */}
                  <div
                    className={`w-12 h-12 rounded-full ${bgClass} flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105`}
                  >
                    {renderIcon(item.icon)}
                  </div>

                  {/* Text Content */}
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-stone-900 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-500 font-normal leading-snug mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
