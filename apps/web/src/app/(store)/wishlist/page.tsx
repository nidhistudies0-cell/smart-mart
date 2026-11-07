"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Navbar } from "@/components/store/Navbar";
import { HomeFooter } from "@/components/store/HomeFooter";
import { ProductCard } from "@/components/store/ProductCard";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { Heart, ShoppingBag, ArrowLeft, Trash2 } from "lucide-react";

export default function WishlistPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const { wishlistItems, wishlistCount, clearWishlist } = useWishlist();
  const { addToCart, showToast } = useCart();

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

  const handleAddAllToCart = () => {
    let addedCount = 0;
    wishlistItems.forEach((product) => {
      if ((product.currentStock ?? 0) > 0) {
        addToCart(product, 1);
        addedCount++;
      }
    });
    if (addedCount > 0) {
      showToast(`Added ${addedCount} items to your cart!`);
    } else {
      showToast("Items in wishlist are currently out of stock.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-stone-900">
      <Navbar />

      <main className="flex-1 max-w-[1536px] w-full mx-auto px-4 sm:px-8 lg:px-14 pt-28 pb-16">
        {/* Breadcrumb / Back Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-stone-600 hover:text-[#1E4D38] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>

          {wishlistCount > 0 && (
            <button
              onClick={clearWishlist}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-stone-500 hover:text-rose-600 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Wishlist</span>
            </button>
          )}
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-stone-200/80 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/60 text-rose-600 text-xs font-bold mb-3">
              <Heart className="w-3.5 h-3.5 fill-rose-500" />
              <span>Saved Items</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-stone-900">
              My Wishlist
            </h1>
            <p className="text-sm sm:text-base text-stone-600 mt-2">
              {wishlistCount === 0
                ? "Your wishlist is currently empty."
                : `You have ${wishlistCount} item${wishlistCount === 1 ? "" : "s"} saved for later.`}
            </p>
          </div>

          {wishlistCount > 0 && (
            <button
              onClick={handleAddAllToCart}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-[#1B382B] bg-[#D2E878] hover:bg-[#C2DC60] active:scale-95 shadow-sm hover:shadow-md transition-all cursor-pointer shrink-0"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add All to Cart</span>
            </button>
          )}
        </div>

        {/* Wishlist Items Grid or Empty State */}
        {wishlistCount === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm rounded-3xl border border-stone-200/80 p-8 sm:p-12 shadow-2xs">
            <div className="w-20 h-20 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-400 mb-5">
              <Heart className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-stone-800 mb-2">No items in your wishlist yet</h2>
            <p className="text-sm text-stone-500 max-w-md mb-8 leading-relaxed">
              Explore our fresh organic groceries, daily essentials, and popular picks, then click the heart icon on any product to save it here!
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold text-white bg-[#1E4D38] hover:bg-[#163C2B] shadow-md hover:shadow-lg transition-all"
            >
              <span>Explore Products</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {wishlistItems.map((product) => (
              <ProductCard
                key={product.productId}
                product={product}
                viewMode="grid"
              />
            ))}
          </div>
        )}
      </main>

      <HomeFooter />
    </div>
  );
}
