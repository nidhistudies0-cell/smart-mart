"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  ShoppingCart,
  Check,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Tag,
  Building2,
  Calendar,
  Hash,
  CheckCircle2,
  Package,
  ArrowRight,
  Info,
  ShoppingBag,
} from "lucide-react";
import { Product } from "@/types/store";
import { Navbar } from "./Navbar";
import { ProductCard } from "./ProductCard";
import { useCart } from "@/context/CartContext";
import { ALL_PRODUCTS } from "@/data/mockStoreData";
import { formatINR } from "@/lib/format";
import { fetchApi } from "@/lib/api";

interface ProductDetailsClientProps {
  product: Product;
}

export function ProductDetailsClient({ product: initialProduct }: ProductDetailsClientProps) {
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product>(initialProduct);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "nutrition" | "shipping">("description");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Fetch live currentStock from DB
  useEffect(() => {
    let active = true;

    fetchApi<any>(`/api/products/${initialProduct.productId}`)
      .then((data) => {
        if (!active || !data) return;
        setProduct((prev) => ({
          ...prev,
          productName: data.productName || prev.productName,
          description: data.description || prev.description,
          price: data.price ? Number(data.price) : prev.price,
          categoryName: data.categoryName || prev.categoryName,
          imageUrl: data.imageUrl || prev.imageUrl,
          currentStock: data.currentStock !== undefined && data.currentStock !== null ? Number(data.currentStock) : prev.currentStock,
          isActive: data.isActive !== undefined ? Boolean(data.isActive) : prev.isActive,
        }));
      })
      .catch(() => null);

    return () => {
      active = false;
    };
  }, [initialProduct.productId]);

  // Gallery images array
  const galleryImages =
    product.images && product.images.length > 0
      ? product.images
      : [product.imageUrl];

  const currentMainImage = galleryImages[selectedImageIndex] || product.imageUrl;

  const isInStock = (product.currentStock ?? 1) > 0;
  const maxStock = product.currentStock ?? 999;

  // Quantity controls
  const handleDecrement = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrement = () => {
    setQuantity((prev) => Math.min(maxStock, prev + 1));
  };

  const handleAddToCart = () => {
    if (!isInStock) return;
    const res = addToCart(product, quantity);
    if (res.success) {
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  // Related products ("You May Also Like")
  const relatedProducts = ALL_PRODUCTS.filter(
    (p) => p.productId !== product.productId
  ).slice(0, 6);

  // Format currency cleanly like ₹499
  const formattedPrice = formatINR(product.price).replace(/\.00$/, "");

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-stone-900 selection:bg-[#D3E2D3] selection:text-[#1A4731]">
      {/* 1. Navbar */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
        {/* 2. Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs sm:text-sm text-stone-500 mb-6 flex-wrap"
        >
          <Link
            href="/"
            className="hover:text-[#1E4D38] transition-colors"
          >
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <Link
            href="/products"
            className="hover:text-[#1E4D38] transition-colors"
          >
            Products
          </Link>
          {product.categoryName && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <Link
                href={`/products?category=${encodeURIComponent(product.categoryName)}`}
                className="hover:text-[#1E4D38] transition-colors"
              >
                {product.categoryName}
              </Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span className="font-semibold text-stone-800 truncate max-w-[200px] sm:max-w-none">
            {product.productName}
          </span>
        </nav>

        {/* 3. Main Product Details Section (Two-Column Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* LEFT SIDE — Product Image Gallery (lg:cols-6) */}
          <div className="lg:col-span-6 flex flex-col-reverse sm:flex-row gap-4 items-start">
            
            {/* Vertical thumbnails on desktop / tablet */}
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible w-full sm:w-20 shrink-0 pb-2 sm:pb-0">
              {galleryImages.map((img, idx) => {
                const isSelected = selectedImageIndex === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedImageIndex(idx);
                      setImgError(false);
                    }}
                    aria-label={`View product image ${idx + 1}`}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-white p-1 cursor-pointer transition-all duration-200 shrink-0 ${
                      isSelected
                        ? "border-2 border-[#1E4D38] ring-2 ring-[#1E4D38]/15 shadow-xs scale-102"
                        : "border border-stone-200/90 hover:border-stone-400 opacity-80 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.productName} thumbnail ${idx + 1}`}
                      fill
                      sizes="80px"
                      className="object-contain p-1"
                    />
                  </button>
                );
              })}
            </div>

            {/* Large Main Product Image */}
            <div className="relative flex-1 w-full rounded-3xl overflow-hidden bg-white border border-stone-200/80 aspect-square flex items-center justify-center p-6 sm:p-8 shadow-2xs">
              {/* Wishlist Heart Button Top-Right */}
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
                className={`absolute top-4 right-4 z-10 w-11 h-11 rounded-full bg-white/95 backdrop-blur-xs border border-stone-200/90 flex items-center justify-center shadow-xs transition-all duration-200 cursor-pointer ${
                  isFavorite
                    ? "text-rose-500 bg-rose-50 border-rose-200"
                    : "text-stone-400 hover:text-stone-700 hover:bg-stone-50"
                }`}
              >
                <Heart
                  className={`w-5 h-5 transition-transform active:scale-125 ${
                    isFavorite ? "fill-rose-500" : ""
                  }`}
                />
              </button>

              {/* Main Image */}
              {!imgError ? (
                <Image
                  src={currentMainImage}
                  alt={product.productName}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 550px"
                  className="object-contain p-4 transition-transform duration-500 hover:scale-104"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 bg-stone-50 rounded-2xl">
                  <ShoppingBag className="w-16 h-16 stroke-1 text-stone-300" />
                  <span className="text-xs mt-2 text-stone-400">Grocery Item</span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE — Product Information (lg:cols-6) */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            
            <div className="flex flex-col xl:flex-row gap-6 items-start justify-between">
              
              {/* Left Part of Right Side: Main Info */}
              <div className="flex-1 space-y-3">
                {/* Category Badge */}
                {product.categoryName && (
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#E5EFE2] text-[#1E4D38] tracking-wide">
                    {product.categoryName}
                  </span>
                )}

                {/* Product Name */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
                  {product.productName}
                </h1>

                {/* Short Description */}
                {product.description && (
                  <p className="text-sm sm:text-base text-stone-600 leading-relaxed pt-0.5">
                    {product.description}
                  </p>
                )}

                {/* Price & Unit Price */}
                <div className="flex items-baseline gap-2.5 pt-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
                    {formattedPrice}
                  </span>
                  {product.unitPrice && (
                    <span className="text-xs sm:text-sm font-semibold text-stone-500">
                      ({product.unitPrice})
                    </span>
                  )}
                </div>

                {/* Stock Indicator */}
                <div className="flex items-center gap-2 pt-1">
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      isInStock ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                  />
                  <span
                    className={`text-xs sm:text-sm font-bold ${
                      isInStock ? "text-[#1E4D38]" : "text-rose-600"
                    }`}
                  >
                    {isInStock
                      ? `In Stock (${product.currentStock ?? 1} units available)`
                      : "Out of Stock"}
                  </span>
                </div>

                {/* Quantity Controls & Add to Cart Button */}
                <div className="flex flex-wrap items-center gap-3.5 pt-4">
                  {/* Quantity Selector */}
                  <div className="flex items-center border border-stone-200 bg-white rounded-xl px-2 py-1 shadow-2xs">
                    <button
                      onClick={handleDecrement}
                      disabled={quantity <= 1 || !isInStock}
                      aria-label="Decrease quantity"
                      className="w-8 h-9 flex items-center justify-center text-stone-600 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-base transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-stone-900">
                      {quantity}
                    </span>
                    <button
                      onClick={handleIncrement}
                      disabled={quantity >= maxStock || !isInStock}
                      aria-label="Increase quantity"
                      className="w-8 h-9 flex items-center justify-center text-stone-600 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-base transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={!isInStock}
                    className={`px-8 py-3 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xs transition-all duration-200 cursor-pointer ${
                      isAdded
                        ? "bg-[#163C2B] text-white shadow-xs"
                        : "bg-[#256141] hover:bg-[#1E4D38] active:bg-[#153A28] text-white shadow-2xs hover:shadow-xs"
                    } disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-5 h-5 text-emerald-300" />
                        <span>Added to Cart</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* D. Trust Information Card (Sage Green Card) */}
              <div className="w-full xl:w-64 bg-[#EAF3E7] border border-[#D5E5D1] rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-2xs shrink-0">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/70 flex items-center justify-center text-[#1E4D38] shrink-0 shadow-2xs">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">
                      Quality Assured
                    </h4>
                    <p className="text-[11px] text-stone-600 mt-0.5">
                      100% original products
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/70 flex items-center justify-center text-[#1E4D38] shrink-0 shadow-2xs">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">
                      Fast Delivery
                    </h4>
                    <p className="text-[11px] text-stone-600 mt-0.5">
                      Get it within 2-3 days
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/70 flex items-center justify-center text-[#1E4D38] shrink-0 shadow-2xs">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">
                      Easy Returns
                    </h4>
                    <p className="text-[11px] text-stone-600 mt-0.5">
                      Hassle-free returns
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* E. Product Metadata Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 sm:p-5 bg-white rounded-2xl border border-stone-200/80 mt-8 shadow-2xs">
              {product.categoryName && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FAF5EE] flex items-center justify-center text-stone-600 shrink-0">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[11px] text-stone-400 font-medium">
                      Category
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-stone-800 truncate block">
                      {product.categoryName}
                    </span>
                  </div>
                </div>
              )}

              {product.supplier && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FAF5EE] flex items-center justify-center text-stone-600 shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[11px] text-stone-400 font-medium">
                      Supplier
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-stone-800 truncate block">
                      {product.supplier}
                    </span>
                  </div>
                </div>
              )}

              {product.expiryDate && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FAF5EE] flex items-center justify-center text-stone-600 shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[11px] text-stone-400 font-medium">
                      Expiry Date
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-stone-800 truncate block">
                      {product.expiryDate}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FAF5EE] flex items-center justify-center text-stone-600 shrink-0">
                  <Hash className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[11px] text-stone-400 font-medium">
                    Product ID
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-stone-800 truncate block">
                    P{product.productId}
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* F. Product Information Tabs */}
        <section className="mt-12 sm:mt-14">
          {/* Tab Navigation Header */}
          <div className="flex items-center gap-8 border-b border-stone-200">
            <button
              onClick={() => setActiveTab("description")}
              className={`pb-3 text-sm sm:text-base transition-colors relative cursor-pointer ${
                activeTab === "description"
                  ? "font-bold text-stone-900 border-b-2 border-[#1E4D38] -mb-px"
                  : "font-medium text-stone-500 hover:text-stone-800"
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab("nutrition")}
              className={`pb-3 text-sm sm:text-base transition-colors relative cursor-pointer ${
                activeTab === "nutrition"
                  ? "font-bold text-stone-900 border-b-2 border-[#1E4D38] -mb-px"
                  : "font-medium text-stone-500 hover:text-stone-800"
              }`}
            >
              Nutritional Information
            </button>
            <button
              onClick={() => setActiveTab("shipping")}
              className={`pb-3 text-sm sm:text-base transition-colors relative cursor-pointer ${
                activeTab === "shipping"
                  ? "font-bold text-stone-900 border-b-2 border-[#1E4D38] -mb-px"
                  : "font-medium text-stone-500 hover:text-stone-800"
              }`}
            >
              Shipping & Returns
            </button>
          </div>

          {/* Tab Body Card */}
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 mt-5 shadow-2xs">
            {activeTab === "description" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Description Text & Highlights (Cols 8 / 12) */}
                <div className="lg:col-span-8 space-y-6">
                  <p className="text-sm sm:text-base text-stone-700 leading-relaxed">
                    {product.fullDescription ||
                      product.description ||
                      `${product.productName} is carefully sourced and processed to ensure premium supermarket quality, authentic taste, and peak freshness.`}
                  </p>

                  {/* Highlights Bullet List */}
                  {product.highlights && product.highlights.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                      {product.highlights.map((highlight, idx) => (
                        <div key={idx} className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-[#2B6E48] shrink-0" />
                          <span className="text-xs sm:text-sm font-medium text-stone-800">
                            {highlight}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Storage Instructions Card (Cols 4 / 12) */}
                <div className="lg:col-span-4 bg-[#EAF3E7] border border-[#D5E5D1] rounded-2xl p-5 flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-white/80 flex items-center justify-center text-[#1E4D38] shrink-0 shadow-2xs">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">
                      Storage Instructions
                    </h4>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      {product.storageInstructions ||
                        "Store in a cool, dry place away from direct sunlight. Keep the pack tightly sealed after use."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "nutrition" && (
              <div>
                {product.nutritionalInfo ? (
                  <div className="space-y-4 max-w-2xl">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                      <span className="text-xs font-bold tracking-wider uppercase text-stone-500">
                        Nutrient Values
                      </span>
                      {product.nutritionalInfo.servingSize && (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E5EFE2] text-[#1E4D38]">
                          Per {product.nutritionalInfo.servingSize}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {product.nutritionalInfo.calories && (
                        <div className="p-3.5 rounded-xl bg-[#FAF5EE] border border-stone-200/60">
                          <span className="text-xs text-stone-500 block">Energy / Calories</span>
                          <span className="text-base font-bold text-stone-900 mt-0.5 block">
                            {product.nutritionalInfo.calories}
                          </span>
                        </div>
                      )}
                      {product.nutritionalInfo.protein && (
                        <div className="p-3.5 rounded-xl bg-[#FAF5EE] border border-stone-200/60">
                          <span className="text-xs text-stone-500 block">Protein</span>
                          <span className="text-base font-bold text-stone-900 mt-0.5 block">
                            {product.nutritionalInfo.protein}
                          </span>
                        </div>
                      )}
                      {product.nutritionalInfo.carbs && (
                        <div className="p-3.5 rounded-xl bg-[#FAF5EE] border border-stone-200/60">
                          <span className="text-xs text-stone-500 block">Carbohydrates</span>
                          <span className="text-base font-bold text-stone-900 mt-0.5 block">
                            {product.nutritionalInfo.carbs}
                          </span>
                        </div>
                      )}
                      {product.nutritionalInfo.fat && (
                        <div className="p-3.5 rounded-xl bg-[#FAF5EE] border border-stone-200/60">
                          <span className="text-xs text-stone-500 block">Total Fat</span>
                          <span className="text-base font-bold text-stone-900 mt-0.5 block">
                            {product.nutritionalInfo.fat}
                          </span>
                        </div>
                      )}
                      {product.nutritionalInfo.fiber && (
                        <div className="p-3.5 rounded-xl bg-[#FAF5EE] border border-stone-200/60">
                          <span className="text-xs text-stone-500 block">Dietary Fiber</span>
                          <span className="text-base font-bold text-stone-900 mt-0.5 block">
                            {product.nutritionalInfo.fiber}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 py-6 px-4 bg-stone-50 rounded-2xl text-stone-600">
                    <Info className="w-5 h-5 text-stone-400 shrink-0" />
                    <span className="text-sm font-medium">
                      Nutritional information is currently unavailable for this item.
                    </span>
                  </div>
                )}
              </div>
            )}

            {activeTab === "shipping" && (
              <div className="space-y-4 max-w-2xl text-sm text-stone-700 leading-relaxed">
                <div className="space-y-1">
                  <h4 className="font-bold text-stone-900 text-base">Standard Delivery</h4>
                  <p className="text-stone-600">
                    All grocery orders are picked and packaged in temperature-controlled packaging and delivered within 2-3 business days. Free delivery applies automatically on orders over ₹499.
                  </p>
                </div>
                <div className="space-y-1 pt-3 border-t border-stone-100">
                  <h4 className="font-bold text-stone-900 text-base">Hassle-Free Returns</h4>
                  <p className="text-stone-600">
                    If you receive a damaged, expired, or incorrect item, return requests are accepted within 7 days of delivery. Refunds are processed immediately upon pickup.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* G. You May Also Like Section */}
        <section className="mt-14 sm:mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
              You May Also Like
            </h2>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-stone-300 text-xs sm:text-sm font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-50 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 6 Related Cards in Responsive Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {relatedProducts.map((relProduct) => (
              <ProductCard
                key={relProduct.productId}
                product={relProduct}
                compact={true}
              />
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
