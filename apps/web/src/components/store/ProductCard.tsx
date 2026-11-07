"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, Check, Plus, ShoppingBag } from "lucide-react";
import { Product } from "@/types/store";
import { formatINR } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { authClient } from "@/lib/auth-client";

interface ProductCardProps {
  product: Product;
  viewMode?: "grid" | "list";
  compact?: boolean;
  onAddToCart?: (product: Product) => void;
  onToggleFavorite?: (product: Product, isFav: boolean) => void;
}

export function ProductCard({
  product,
  viewMode = "grid",
  compact = false,
  onAddToCart,
  onToggleFavorite,
}: ProductCardProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isFavorite = isInWishlist(product.productId);
  const [isAdded, setIsAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session?.user) {
      router.push("/login");
      return;
    }
    toggleWishlist(product);
    if (onToggleFavorite) {
      onToggleFavorite(product, !isFavorite);
    }
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session?.user) {
      router.push("/login");
      return;
    }
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);

    if (onAddToCart) {
      onAddToCart(product);
    } else {
      addToCart(product, 1);
    }
  };

  const handleCardClick = () => {
    router.push(`/products/${product.productId}`);
  };

  // Format currency cleanly like ₹499 (without .00 if whole)
  const formattedPrice = formatINR(product.price).replace(/\.00$/, "");
  const isInStock = (product.currentStock ?? 1) > 0;

  // --- LIST VIEW PRESENTATION ---
  if (viewMode === "list") {
    return (
      <div
        onClick={handleCardClick}
        className="group relative flex flex-col sm:flex-row items-center justify-between bg-white rounded-3xl border border-stone-200/80 p-4 sm:p-5 shadow-sm hover:shadow-xl transition-all duration-300 gap-4 cursor-pointer"
      >
        {/* Left: Product Image */}
        <div className="relative w-32 h-32 sm:w-36 sm:h-36 shrink-0 rounded-2xl overflow-hidden bg-stone-900 flex items-center justify-center">
          {!imgError ? (
            <Image
              src={product.imageUrl}
              alt={product.productName}
              fill
              sizes="150px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 bg-stone-100">
              <ShoppingBag className="w-8 h-8 stroke-1" />
            </div>
          )}
        </div>

        {/* Center: Details */}
        <div className="flex-1 w-full sm:w-auto text-left space-y-1">
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <h3 className="text-base sm:text-lg font-bold text-stone-900 group-hover:text-[#1E4D38] transition-colors leading-snug">
              {product.productName}
            </h3>
            <button
              onClick={handleFavoriteClick}
              aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
              className={`p-1.5 rounded-full transition-colors sm:hidden ${isFavorite
                  ? "text-rose-500 bg-rose-50"
                  : "text-stone-400 hover:text-stone-700 hover:bg-stone-50"
                }`}
            >
              <Heart
                className={`w-4 h-4 transition-transform active:scale-125 ${isFavorite ? "fill-rose-500" : ""
                  }`}
              />
            </button>
          </div>

          <div className="text-xs text-stone-500 font-medium">
            {product.categoryName || "Grocery"}
          </div>

          {product.packageSize && (
            <div className="text-xs text-stone-500 font-medium">
              {product.packageSize}
            </div>
          )}

          {/* Stock Indicator */}
          <div className="flex items-center gap-1.5 pt-1">
            <span
              className={`w-2 h-2 rounded-full ${isInStock ? "bg-emerald-500" : "bg-rose-500"
                }`}
            />
            <span
              className={`text-xs font-semibold ${isInStock ? "text-[#1E4D38]" : "text-rose-600"
                }`}
            >
              {isInStock ? `In Stock (${product.currentStock})` : "Out of Stock"}
            </span>
          </div>
        </div>

        {/* Right: Price & Add to Cart */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-44 gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
          <div className="flex items-center gap-3">
            <div className="text-xl font-extrabold text-stone-900">
              {formattedPrice}
            </div>
            <button
              onClick={handleFavoriteClick}
              aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
              className={`hidden sm:block p-1.5 rounded-full transition-colors ${isFavorite
                  ? "text-rose-500 bg-rose-50"
                  : "text-stone-400 hover:text-stone-700 hover:bg-stone-50"
                }`}
            >
              <Heart
                className={`w-4 h-4 transition-transform active:scale-125 ${isFavorite ? "fill-rose-500" : ""
                  }`}
              />
            </button>
          </div>

          <button
            onClick={handleAddToCartClick}
            disabled={!product.isActive || !isInStock}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${isAdded
                ? "bg-[#163C2B] text-white shadow-xs"
                : "bg-[#256141] hover:bg-[#1E4D38] active:bg-[#153A28] text-white shadow-2xs hover:shadow-xs"
              } disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // --- GRID / CAROUSEL PRODUCT CARD (MATCHING CATEGORY CARDS STYLE) ---
  return (
    <div
      onClick={handleCardClick}
      className={`group relative flex flex-col justify-end ${compact ? "h-[240px] sm:h-[260px]" : "h-[280px] sm:h-[320px] md:h-[340px]"
        } rounded-3xl overflow-hidden bg-stone-900 border border-stone-200/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer`}
    >
      {/* Full-bleed Product Image */}
      {!imgError ? (
        <Image
          src={product.imageUrl}
          alt={product.productName}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="absolute inset-0 bg-stone-800 flex flex-col items-center justify-center text-stone-400">
          <ShoppingBag className="w-10 h-10 opacity-60" />
          <span className="text-xs mt-1 text-stone-400">SmartMart</span>
        </div>
      )}

      {/* Minimal Bottom-Only Gradient Overlay (keeps products bright & clear) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent group-hover:from-black/80 transition-colors duration-300 pointer-events-none" />

      {/* Floating Wishlist Button (Top-Right) */}
      <button
        onClick={handleFavoriteClick}
        aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
        className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center transition-all active:scale-95 text-white/90"
      >
        <Heart
          className={`w-4 h-4 transition-transform ${isFavorite ? "fill-rose-500 text-rose-500" : "text-white"
            }`}
        />
      </button>

      {/* In Stock Badge (Top-Left) */}
      <div className="absolute top-3 left-3 z-20">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md ${isInStock
              ? "bg-black/40 text-emerald-300 border border-emerald-500/30"
              : "bg-black/50 text-rose-300 border border-rose-500/30"
            }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${isInStock ? "bg-emerald-400" : "bg-rose-400"
              }`}
          />
          {isInStock ? "In Stock" : "Out of Stock"}
        </span>
      </div>

      {/* Bottom Content / Info Overlay */}
      <div className="relative z-10 p-4 sm:p-5 flex flex-col justify-end w-full">
        {/* Category & Package Tag */}
        <div className="flex items-center gap-2 mb-1 text-[11px] font-medium tracking-wide text-white/70">
          <span>{product.categoryName || "Grocery"}</span>
          {product.packageSize && (
            <>
              <span>•</span>
              <span>{product.packageSize}</span>
            </>
          )}
        </div>

        {/* Product Title */}
        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug line-clamp-1 group-hover:text-[#D2E878] transition-colors">
          {product.productName}
        </h3>

        {/* Price & Add to Cart Action */}
        <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-white/15">
          <div className="text-lg sm:text-xl font-extrabold text-white">
            {formattedPrice}
          </div>

          <button
            onClick={handleAddToCartClick}
            disabled={!product.isActive || !isInStock}
            className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${isAdded
                ? "bg-[#D2E878] text-[#1B382B] shadow-sm font-bold"
                : "bg-white hover:bg-[#D2E878] text-stone-900 hover:text-[#1B382B] shadow-md active:scale-95"
              } disabled:bg-white/20 disabled:text-white/40 disabled:cursor-not-allowed`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
