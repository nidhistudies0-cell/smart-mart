"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/types/store";
import { useCart } from "./CartContext";
import { authClient } from "@/lib/auth-client";

interface WishlistContextType {
  wishlistItems: Product[];
  wishlistCount: number;
  isInWishlist: (productId: number) => boolean;
  toggleWishlist: (product: Product) => void;
  removeFromWishlist: (productId: number) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { showToast } = useCart();
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const userId = session?.user?.id;
  const storageKey = userId ? `smartmart_wishlist_${userId}` : null;

  // Handle session and load user's wishlist
  useEffect(() => {
    if (sessionLoading) return;

    // If user is logged out, clear wishlist items and any legacy guest key
    if (!session?.user) {
      try {
        localStorage.removeItem("smartmart_wishlist");
      } catch {}
      setWishlistItems([]);
      setIsLoaded(true);
      return;
    }

    // User is logged in: load their personal wishlist
    try {
      const stored = localStorage.getItem(`smartmart_wishlist_${session.user.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setWishlistItems(parsed);
        } else {
          setWishlistItems([]);
        }
      } else {
        setWishlistItems([]);
      }
    } catch (e) {
      console.error("Failed to load wishlist from localStorage", e);
      setWishlistItems([]);
    } finally {
      setIsLoaded(true);
    }
  }, [session?.user?.id, sessionLoading]);

  // Save to user-scoped localStorage when wishlistItems change
  useEffect(() => {
    if (!isLoaded || !storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(wishlistItems));
    } catch (e) {
      console.error("Failed to save wishlist to localStorage", e);
    }
  }, [wishlistItems, isLoaded, storageKey]);

  const isInWishlist = (productId: number): boolean => {
    if (!session?.user) return false;
    return wishlistItems.some((item) => item.productId === productId);
  };

  const toggleWishlist = (product: Product) => {
    if (!session?.user) {
      showToast?.("Please log in to add items to your wishlist");
      router.push("/login");
      return;
    }

    setWishlistItems((prev) => {
      const exists = prev.some((item) => item.productId === product.productId);
      if (exists) {
        showToast?.(`Removed "${product.productName}" from wishlist`);
        return prev.filter((item) => item.productId !== product.productId);
      } else {
        showToast?.(`Added "${product.productName}" to wishlist`);
        return [...prev, product];
      }
    });
  };

  const removeFromWishlist = (productId: number) => {
    if (!session?.user) {
      router.push("/login");
      return;
    }

    setWishlistItems((prev) => {
      const target = prev.find((item) => item.productId === productId);
      if (target) {
        showToast?.(`Removed "${target.productName}" from wishlist`);
      }
      return prev.filter((item) => item.productId !== productId);
    });
  };

  const clearWishlist = () => {
    if (!session?.user) {
      router.push("/login");
      return;
    }

    setWishlistItems([]);
    showToast?.("Wishlist cleared");
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount: session?.user ? wishlistItems.length : 0,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
