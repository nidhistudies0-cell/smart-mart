"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { MOCK_CATEGORIES } from "@/data/mockStoreData";

export function HomeFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <footer className="border-t border-[#EAE3D7] bg-[#FAF7F2] text-stone-700 pt-16 pb-12">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-stone-200/80">
          
          {/* Brand Column (Col span 4) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#E7F2E4] flex items-center justify-center text-[#1E4D38] shadow-xs">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 3H5.2L7.3 14.5C7.4 15.1 7.9 15.5 8.5 15.5H18.5C19.1 15.5 19.6 15.1 19.7 14.5L21 7.5H6"
                    stroke="#1E4D38"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="9" cy="19.5" r="1.5" fill="#1E4D38" />
                  <circle cx="18" cy="19.5" r="1.5" fill="#1E4D38" />
                  <path
                    d="M14 4.5C14 4.5 16 3 18 4C18.5 6 16.5 8 16.5 8"
                    stroke="#2E7D32"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M15.5 6L13.5 8"
                    stroke="#F97316"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span className="text-2xl font-bold tracking-tight text-[#1A4731]">
                Smart<span className="text-[#2B6E48]">Mart</span>
              </span>
            </Link>

            <p className="text-sm text-stone-600 max-w-sm leading-relaxed">
              Your trusted online supermarket for fresh groceries, household essentials and more.
              Quality products, better choices, brighter days.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {/* Instagram */}
              <a
                href="#instagram"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-[#E5EFE2] text-stone-600 hover:text-[#1E4D38] flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              {/* Facebook */}
              <a
                href="#facebook"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-[#E5EFE2] text-stone-600 hover:text-[#1E4D38] flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              {/* Twitter / X */}
              <a
                href="#twitter"
                aria-label="Twitter / X"
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-[#E5EFE2] text-stone-600 hover:text-[#1E4D38] flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* YouTube */}
              <a
                href="#youtube"
                aria-label="YouTube"
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-[#E5EFE2] text-stone-600 hover:text-[#1E4D38] flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor"></polygon>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-stone-900 tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-stone-600 hover:text-[#1E4D38] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-stone-600 hover:text-[#1E4D38] transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/#categories" className="text-stone-600 hover:text-[#1E4D38] transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="text-stone-600 hover:text-[#1E4D38] transition-colors">
                  My Wishlist
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-stone-600 hover:text-[#1E4D38] transition-colors">
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories Column */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-stone-900 tracking-wider">
              Categories
            </h4>
            <ul className="space-y-2 text-sm">
              {MOCK_CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat.categoryId}>
                  <Link
                    href={`/products?category=${encodeURIComponent(cat.categoryName)}`}
                    className="text-stone-600 hover:text-[#1E4D38] transition-colors"
                  >
                    {cat.categoryName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-bold text-stone-900 tracking-wider">
              Stay Updated
            </h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              Get the latest deals and fresh arrivals directly in your inbox.
            </p>

            <form onSubmit={handleSubscribe} className="relative mt-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-white border border-stone-200 rounded-xl placeholder:text-stone-400 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#286345]/20 focus:border-[#286345]"
              />
              <button
                type="submit"
                aria-label="Subscribe to newsletter"
                className="absolute right-1.5 top-1.5 w-7 h-7 rounded-lg bg-[#2E6A4C] hover:bg-[#1E4D38] text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {subscribed && (
              <div className="flex items-center gap-1.5 text-xs text-[#205A3A] font-medium mt-1">
                <Check className="w-3.5 h-3.5" />
                <span>Thank you for subscribing! (Demo)</span>
              </div>
            )}
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© 2026 SmartMart. All rights reserved.</p>
          <p className="text-stone-400">
            SmartMart DBMS Project • Online Supermarket & Inventory Management
          </p>
        </div>

      </div>
    </footer>
  );
}
