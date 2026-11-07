"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  RotateCcw,
  Truck,
  Ticket,
  Leaf,
  ShieldCheck,
  Package,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Navbar } from "@/components/store/Navbar";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/format";

export default function CartPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const {
    items,
    updateQuantity,
    removeFromCart,
    removeSelectedItems,
    clearCart,
    totalCount,
    lineItemCount,
    subtotal,
    deliveryFee,
    discountAmount,
    finalTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    showToast,
  } = useCart();

  // Selection state for cart items
  const [selectedIds, setSelectedIds] = useState<number[]>(() =>
    items.map((i) => i.product.productId)
  );

  // Clear cart modal state
  const [showClearModal, setShowClearModal] = useState(false);

  // Coupon input state
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);

  // Synchronize selection if items change
  const currentItemIds = items.map((i) => i.product.productId);
  const activeSelectedIds = selectedIds.filter((id) =>
    currentItemIds.includes(id)
  );
  const allSelected =
    items.length > 0 && activeSelectedIds.length === items.length;

  useEffect(() => {
    if (!sessionLoading && !session?.user) {
      router.push("/login");
    }
  }, [session, sessionLoading, router]);

  if (sessionLoading || !session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
        <div className="w-8 h-8 border-3 border-[#1E4D38] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleToggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((i) => i.product.productId));
    }
  };

  const handleToggleItem = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleRemoveSelected = () => {
    if (activeSelectedIds.length === 0) {
      showToast("Please select items to remove");
      return;
    }
    removeSelectedItems(activeSelectedIds);
    setSelectedIds([]);
  };

  const handleUpdateCart = () => {
    showToast("Cart is up to date!");
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    if (!couponInput.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }
    const res = applyCoupon(couponInput);
    if (res.success) {
      setCouponInput("");
      setCouponError(null);
    } else {
      setCouponError(res.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-stone-900 selection:bg-[#D3E2D3] selection:text-[#1A4731]">
      {/* 1. Navbar */}
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
        {/* 2. Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs sm:text-sm text-stone-500 mb-4"
        >
          <Link href="/" className="hover:text-[#1E4D38] transition-colors">
            Home
          </Link>
          <span>&gt;</span>
          <span className="font-semibold text-stone-800">Cart</span>
        </nav>

        {/* 3. Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            Your <span className="text-[#1E4D38]">Cart</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Review your items, update quantities or remove products before checkout.
          </p>
        </div>

        {/* 4. Empty Cart State */}
        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200/80 p-12 text-center my-8 max-w-lg mx-auto shadow-2xs space-y-4">
            <div className="w-20 h-20 rounded-full bg-[#FAF5EE] text-stone-400 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-10 h-10 stroke-1 text-stone-400" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-stone-800">
                Your cart is empty
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto">
                Looks like you haven't added anything to your cart yet. Explore our wide range of groceries and essentials!
              </p>
            </div>
            <div className="pt-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1E4D38] hover:bg-[#163C2B] text-white font-bold text-sm shadow-xs transition-colors"
              >
                <span>Start Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* 5. Main Cart Content Layout (Two Columns) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Cart Items Panel (Cols 8 / 12) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white rounded-3xl border border-stone-200/80 p-5 sm:p-6 shadow-2xs">
                
                {/* Panel Header: Select All & Remove Selected */}
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 rounded border-stone-300 text-[#1E4D38] focus:ring-[#1E4D38] cursor-pointer accent-[#1E4D38]"
                    />
                    <span className="text-xs sm:text-sm font-bold text-stone-800">
                      Select All ({lineItemCount} {lineItemCount === 1 ? "item" : "items"})
                    </span>
                  </label>

                  <button
                    onClick={handleRemoveSelected}
                    disabled={activeSelectedIds.length === 0}
                    className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                      activeSelectedIds.length > 0
                        ? "text-rose-600 hover:text-rose-700"
                        : "text-stone-300 cursor-not-allowed"
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Selected</span>
                  </button>
                </div>

                {/* Items List */}
                <div className="divide-y divide-stone-100">
                  {items.map(({ product, quantity }) => {
                    const isChecked = activeSelectedIds.includes(
                      product.productId
                    );
                    const isInStock = (product.currentStock ?? 1) > 0;
                    const maxStock = product.currentStock ?? 999;
                    const lineSubtotal = formatINR(
                      product.price * quantity
                    ).replace(/\.00$/, "");

                    return (
                      <div
                        key={product.productId}
                        className="py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                      >
                        {/* Checkbox, Thumbnail & Info */}
                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleItem(product.productId)}
                            className="w-4 h-4 rounded border-stone-300 text-[#1E4D38] focus:ring-[#1E4D38] cursor-pointer accent-[#1E4D38] shrink-0"
                          />

                          <Link
                            href={`/products/${product.productId}`}
                            className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-stone-50 border border-stone-200/60 p-1 shrink-0 flex items-center justify-center hover:opacity-95 transition"
                          >
                            <Image
                              src={product.imageUrl}
                              alt={product.productName}
                              fill
                              sizes="80px"
                              className="object-contain p-1"
                            />
                          </Link>

                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/products/${product.productId}`}
                              className="text-sm sm:text-base font-bold text-stone-900 hover:text-[#1E4D38] transition-colors leading-snug line-clamp-1 block"
                            >
                              {product.productName}
                            </Link>

                            <div className="text-xs text-stone-500 mt-0.5">
                              {product.categoryName || "Grocery"}
                            </div>

                            {/* Stock status indicator */}
                            <div className="flex items-center gap-1.5 mt-1">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isInStock ? "bg-emerald-500" : "bg-rose-500"
                                }`}
                              />
                              <span
                                className={`text-[11px] font-semibold ${
                                  isInStock ? "text-[#1E4D38]" : "text-rose-600"
                                }`}
                              >
                                {isInStock
                                  ? `In Stock (${product.currentStock ?? 1})`
                                  : "Out of Stock"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Price, Quantity, Line Total & Trash */}
                        <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-50">
                          {/* Unit Price */}
                          <div className="text-xs sm:text-sm font-bold text-stone-900 w-16 text-left sm:text-right shrink-0">
                            {formatINR(product.price).replace(/\.00$/, "")}
                          </div>

                          {/* Quantity Selector: [- 1 +] */}
                          <div className="flex items-center border border-stone-200 bg-white rounded-xl px-1.5 py-0.5 shadow-2xs shrink-0">
                            <button
                              onClick={() =>
                                updateQuantity(product.productId, quantity - 1)
                              }
                              aria-label="Decrease quantity"
                              className="w-7 h-7 flex items-center justify-center text-stone-600 hover:text-stone-900 font-bold transition cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-7 text-center text-xs sm:text-sm font-bold text-stone-900">
                              {quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(product.productId, quantity + 1)
                              }
                              disabled={quantity >= maxStock}
                              aria-label="Increase quantity"
                              className="w-7 h-7 flex items-center justify-center text-stone-600 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed font-bold transition cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Line Subtotal */}
                          <div className="text-sm sm:text-base font-extrabold text-stone-900 w-16 text-right shrink-0">
                            {lineSubtotal}
                          </div>

                          {/* Trash Icon Button */}
                          <button
                            onClick={() => removeFromCart(product.productId)}
                            aria-label={`Remove ${product.productName}`}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Panel Footer: Clear Cart & Update Cart */}
                <div className="flex items-center justify-between pt-5 mt-3 border-t border-stone-100">
                  <button
                    onClick={() => setShowClearModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm font-semibold text-stone-700 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear Cart</span>
                  </button>

                  <button
                    onClick={handleUpdateCart}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm font-semibold text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Update Cart</span>
                  </button>
                </div>

              </div>
            </div>

            {/* RIGHT COLUMN: Order Summary, Coupon, Benefits (Cols 4 / 12) */}
            <div className="lg:col-span-4 space-y-5">
              
              {/* Card 1: Order Summary */}
              <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-2xs space-y-4">
                <h2 className="text-base sm:text-lg font-bold text-stone-900">
                  Order Summary
                </h2>

                <div className="space-y-2.5 text-xs sm:text-sm text-stone-600">
                  <div className="flex justify-between items-center">
                    <span>Subtotal ({totalCount} items)</span>
                    <span className="font-semibold text-stone-900">
                      {formatINR(subtotal).replace(/\.00$/, "")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Delivery Charges</span>
                    {deliveryFee === 0 ? (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#E5EFE2] text-[#1E4D38]">
                        FREE
                      </span>
                    ) : (
                      <span className="font-semibold text-stone-900">
                        {formatINR(deliveryFee).replace(/\.00$/, "")}
                      </span>
                    )}
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center text-emerald-700">
                      <span>Coupon Discount</span>
                      <span className="font-bold">
                        -{formatINR(discountAmount).replace(/\.00$/, "")}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-stone-100 flex justify-between items-baseline">
                  <span className="text-sm sm:text-base font-bold text-stone-900">
                    Total Amount
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#1E4D38]">
                    {formatINR(finalTotal).replace(/\.00$/, "")}
                  </span>
                </div>

                {/* Free Delivery Banner (Sage Card) */}
                <div className="bg-[#EAF3E7] border border-[#D5E5D1] rounded-2xl p-3.5 flex items-start gap-3">
                  <Truck className="w-5 h-5 text-[#1E4D38] shrink-0 mt-0.5" />
                  <div className="text-xs text-stone-700">
                    <span className="font-bold text-stone-900 block">
                      {subtotal >= 1000 || deliveryFee === 0
                        ? "You are eligible for free delivery!"
                        : "You are eligible for free delivery!"}
                    </span>
                    <span className="text-stone-600 block mt-0.5">
                      {subtotal >= 1000 || deliveryFee === 0
                        ? "Free delivery has been applied to this order."
                        : `Add items worth ${formatINR(
                            Math.max(0, 1000 - subtotal)
                          ).replace(/\.00$/, "")} more to get free delivery.`}
                    </span>
                  </div>
                </div>

                {/* Proceed to Checkout Button */}
                <Link
                  href="/checkout"
                  className="w-full py-3.5 rounded-xl bg-[#1E4D38] hover:bg-[#163C2B] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xs transition-all duration-200 cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Card 2: Have a Coupon Code? */}
              <div className="bg-white rounded-3xl border border-stone-200/80 p-5 shadow-2xs">
                <div className="flex items-center gap-2 mb-3">
                  <Ticket className="w-4 h-4 text-[#1E4D38]" />
                  <h3 className="text-xs sm:text-sm font-bold text-stone-900">
                    Have a Coupon Code?
                  </h3>
                </div>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#EAF3E7] border border-[#D5E5D1]">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#1E4D38]" />
                      <div className="text-xs">
                        <span className="font-bold text-stone-900 block">
                          {appliedCoupon.code}
                        </span>
                        <span className="text-[11px] text-stone-600 block">
                          {appliedCoupon.description}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      aria-label="Remove coupon"
                      className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-white/80 transition cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value);
                          setCouponError(null);
                        }}
                        placeholder="Enter coupon code"
                        className="flex-1 px-3 py-2 text-xs sm:text-sm bg-[#FCFAF7] border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1E4D38]/20 focus:border-[#1E4D38]"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-[#EAF3E7] hover:bg-[#D8E9D4] text-[#1E4D38] font-bold text-xs sm:text-sm border border-[#D5E5D1] transition-colors cursor-pointer shrink-0"
                      >
                        Apply
                      </button>
                    </div>

                    {couponError && (
                      <p className="text-[11px] text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{couponError}</span>
                      </p>
                    )}

                    <div className="text-[11px] text-stone-400 pt-1">
                      Try demo codes: <span className="font-bold text-stone-600">SAVE50</span>, <span className="font-bold text-stone-600">SMARTMART10</span>, or <span className="font-bold text-stone-600">FREESHIP</span>
                    </div>
                  </form>
                )}
              </div>

              {/* Card 3: Why Shop with SmartMart? (Benefits Section) */}
              <div className="bg-white rounded-3xl border border-stone-200/80 p-5 shadow-2xs">
                <h3 className="text-xs sm:text-sm font-bold text-stone-900 mb-4">
                  Why Shop with SmartMart?
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  {/* Benefit 1 */}
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-xl bg-[#EAF3E7] text-[#1E4D38] flex items-center justify-center mb-1.5">
                      <Leaf className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-stone-800 leading-tight">
                      Fresh & Quality Products
                    </span>
                  </div>

                  {/* Benefit 2 */}
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-xl bg-[#EAF3E7] text-[#1E4D38] flex items-center justify-center mb-1.5">
                      <Truck className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-stone-800 leading-tight">
                      Fast & Reliable Delivery
                    </span>
                  </div>

                  {/* Benefit 3 */}
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-xl bg-[#EAF3E7] text-[#1E4D38] flex items-center justify-center mb-1.5">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-stone-800 leading-tight">
                      Secure Payments
                    </span>
                  </div>

                  {/* Benefit 4 */}
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-xl bg-[#EAF3E7] text-[#1E4D38] flex items-center justify-center mb-1.5">
                      <Package className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-stone-800 leading-tight">
                      Easy Returns
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Clear Cart Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs"
            onClick={() => setShowClearModal(false)}
          />
          <div className="relative bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl z-10 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-stone-900">
                Clear your entire cart?
              </h3>
              <p className="text-xs sm:text-sm text-stone-500">
                This will remove all {lineItemCount} items from your shopping basket.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowClearModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm font-semibold text-stone-700 hover:bg-stone-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearCart();
                  setShowClearModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
