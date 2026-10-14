"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "@/types/store";
import { Toast } from "@/components/store/Toast";
import { ALL_PRODUCTS } from "@/data/mockStoreData";
import { fetchApi, ApiError } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  phoneNumber: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  addressType?: "hostel" | "home" | "work" | "other";
}

export interface Coupon {
  code: string;
  discountType: "percentage" | "flat" | "free_delivery";
  value: number;
  description: string;
}

export interface OrderDetails {
  orderId: string;
  orderDate: string;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  couponCode?: string;
  shippingAddress: ShippingAddress;
  paymentMethod: "upi" | "card" | "netbanking" | "cod";
  paymentStatus: "paid" | "pending_cod";
}

interface AddToCartResult {
  success: boolean;
  message: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => AddToCartResult;
  removeFromCart: (productId: number) => void;
  removeSelectedItems: (productIds: number[]) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalCount: number;
  lineItemCount: number;
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  finalTotal: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  createOrder: (
    shippingAddress: ShippingAddress,
    paymentMethod: "upi" | "card" | "netbanking" | "cod"
  ) => Promise<OrderDetails>;
  getOrderById: (orderId: string) => OrderDetails | null;
  isLoaded: boolean;
  toastMessage: string | null;
  setToastMessage: (msg: string | null) => void;
  showToast: (msg: string) => void;
}

// Initial 4 items matching the reference cart screenshot (Total subtotal = ₹855, 8 items, delivery ₹40 -> ₹895)
const INITIAL_CART_ITEMS: CartItem[] = [
  {
    product: ALL_PRODUCTS.find((p) => p.productId === 101) || ALL_PRODUCTS[0], // Daawat Basmati Rice 5kg (₹499)
    quantity: 1,
  },
  {
    product: ALL_PRODUCTS.find((p) => p.productId === 102) || ALL_PRODUCTS[1], // Amul Taaza Milk 1L (₹68)
    quantity: 2,
  },
  {
    product: ALL_PRODUCTS.find((p) => p.productId === 103) || ALL_PRODUCTS[2], // Fresh Banana 1kg (₹60)
    quantity: 3,
  },
  {
    product: ALL_PRODUCTS.find((p) => p.productId === 105) || ALL_PRODUCTS[4], // Lays Classic Salted 52g (₹20)
    quantity: 2,
  },
];

const VALID_COUPONS: Record<string, Coupon> = {
  SAVE50: {
    code: "SAVE50",
    discountType: "flat",
    value: 50,
    description: "Flat ₹50 OFF applied",
  },
  SMARTMART10: {
    code: "SMARTMART10",
    discountType: "percentage",
    value: 10,
    description: "10% OFF on items subtotal",
  },
  FREESHIP: {
    code: "FREESHIP",
    discountType: "free_delivery",
    value: 40,
    description: "Free Delivery applied",
  },
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "smartmart_cart_v2";
const COUPON_STORAGE_KEY = "smartmart_coupon_v2";
const FREE_DELIVERY_THRESHOLD = 1000;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const userId = session?.user?.id;
  const storageKey = userId ? `smartmart_cart_${userId}` : "smartmart_guest_cart";
  const couponStorageKey = userId ? `smartmart_coupon_${userId}` : "smartmart_guest_coupon";

  // Handle session changes and load cart
  useEffect(() => {
    let active = true;

    async function loadCart() {
      // Do nothing while the Better-Auth session is still initializing
      if (sessionLoading) {
        return;
      }

      // If user is truly logged out
      if (!session?.user) {
        let guestItems: CartItem[] = [];
        try {
          const stored = localStorage.getItem("smartmart_guest_cart");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) guestItems = parsed;
          }
        } catch {
          // Fallback
        }
        if (active) {
          setItems(guestItems);
          setAppliedCoupon(null);
          setIsLoaded(true);
        }
        return;
      }

      // User is logged in: first load local cache immediately for instantaneous UI
      try {
        const stored = localStorage.getItem(`smartmart_cart_${session.user.id}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && active && parsed.length > 0) {
            setItems(parsed);
          }
        }
      } catch {}

      // Then fetch authoritative cart items from backend PostgreSQL database
      try {
        const res = await fetchApi<{ items: { cartId: number; quantity: number; product: Product }[] }>("/api/cart");
        if (active && res && Array.isArray(res.items)) {
          if (res.items.length > 0) {
            const dbItems = res.items.map((it) => ({ product: it.product, quantity: it.quantity }));
            setItems(dbItems);
            try {
              localStorage.setItem(`smartmart_cart_${session.user.id}`, JSON.stringify(dbItems));
            } catch {}
          }
        }
      } catch {
        // Fall back to stored cache
      } finally {
        if (active) setIsLoaded(true);
      }
    }

    loadCart();

    return () => {
      active = false;
    };
  }, [session?.user?.id, sessionLoading]);

  // Persist to user-scoped localStorage on change once loaded
  useEffect(() => {
    if (!isLoaded || sessionLoading) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      // Persistence error fallback
    }
  }, [items, isLoaded, sessionLoading, storageKey]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      if (appliedCoupon) {
        localStorage.setItem(couponStorageKey, JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem(couponStorageKey);
      }
    } catch {
      // Persistence fallback
    }
  }, [appliedCoupon, isLoaded, couponStorageKey]);

  // Clean up old shared cart storage key so it doesn't leak
  useEffect(() => {
    try {
      localStorage.removeItem("smartmart_cart_v2");
      localStorage.removeItem("smartmart_coupon_v2");
    } catch {}
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const addToCart = (product: Product, quantityToAdd = 1): AddToCartResult => {
    const stock = product.currentStock ?? 999;

    if (stock <= 0) {
      const message = `Sorry, "${product.productName}" is currently out of stock.`;
      showToast(message);
      return { success: false, message };
    }

    const qty = Math.max(1, quantityToAdd);
    let resultMessage = "";

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.product.productId === product.productId
      );

      if (existingIndex > -1) {
        const currentQty = prevItems[existingIndex].quantity;
        const newQty = Math.min(currentQty + qty, stock);

        if (currentQty >= stock) {
          resultMessage = `Maximum available stock (${stock}) of "${product.productName}" is already in your cart.`;
          return prevItems;
        }

        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
        };
        resultMessage = `Added ${qty} more of "${product.productName}" to your cart!`;
        return updated;
      } else {
        const initialQty = Math.min(qty, stock);
        resultMessage = `Added "${product.productName}" (${initialQty}) to your cart!`;
        return [...prevItems, { product, quantity: initialQty }];
      }
    });

    if (resultMessage) {
      showToast(resultMessage);
    }

    // Sync with DB if user is logged in
    if (session?.user) {
      fetchApi("/api/cart", {
        method: "POST",
        body: JSON.stringify({ productId: product.productId, quantity: qty }),
      }).catch(() => null);
    }

    return { success: true, message: resultMessage };
  };

  const removeFromCart = (productId: number) => {
    setItems((prev) => {
      const target = prev.find((i) => i.product.productId === productId);
      if (target) {
        showToast(`Removed "${target.product.productName}" from cart`);
      }
      return prev.filter((i) => i.product.productId !== productId);
    });

    if (session?.user) {
      fetchApi(`/api/cart/${productId}`, {
        method: "DELETE",
      }).catch(() => null);
    }
  };

  const removeSelectedItems = (productIds: number[]) => {
    if (productIds.length === 0) return;
    setItems((prev) => prev.filter((i) => !productIds.includes(i.product.productId)));
    showToast(`Removed ${productIds.length} item(s) from your cart`);

    if (session?.user) {
      productIds.forEach((id) => {
        fetchApi(`/api/cart/${id}`, { method: "DELETE" }).catch(() => null);
      });
    }
  };

  const updateQuantity = (productId: number, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.product.productId === productId) {
          const maxStock = item.product.currentStock ?? 999;
          return {
            ...item,
            quantity: Math.min(newQty, maxStock),
          };
        }
        return item;
      })
    );

    if (session?.user) {
      fetchApi(`/api/cart/${productId}`, {
        method: "PUT",
        body: JSON.stringify({ quantity: newQty }),
      }).catch(() => null);
    }
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    showToast("Your cart has been cleared");

    if (session?.user) {
      fetchApi("/api/cart", {
        method: "DELETE",
      }).catch(() => null);
    }
  };

  const applyCoupon = (rawCode: string) => {
    const cleanCode = rawCode.trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, message: "Please enter a coupon code" };
    }

    const matchedCoupon = VALID_COUPONS[cleanCode];
    if (matchedCoupon) {
      setAppliedCoupon(matchedCoupon);
      showToast(`Coupon "${cleanCode}" applied successfully!`);
      return { success: true, message: `Coupon applied: ${matchedCoupon.description}` };
    }

    return {
      success: false,
      message: "Invalid coupon code. Try SAVE50, SMARTMART10, or FREESHIP",
    };
  };

  const removeCoupon = () => {
    if (appliedCoupon) {
      showToast(`Coupon "${appliedCoupon.code}" removed`);
    }
    setAppliedCoupon(null);
  };

  // Calculations
  const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const lineItemCount = items.length;
  const subtotal = items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  // Delivery fee logic
  let deliveryFee = 0;
  if (items.length > 0) {
    if (appliedCoupon?.discountType === "free_delivery" || subtotal >= FREE_DELIVERY_THRESHOLD) {
      deliveryFee = 0;
    } else {
      deliveryFee = 40;
    }
  }

  // Discount calculation
  let discountAmount = 0;
  if (appliedCoupon && items.length > 0) {
    if (appliedCoupon.discountType === "flat") {
      discountAmount = Math.min(subtotal, appliedCoupon.value);
    } else if (appliedCoupon.discountType === "percentage") {
      discountAmount = Math.round((subtotal * appliedCoupon.value) / 100);
    }
  }

  const finalTotal = Math.max(0, subtotal + deliveryFee - discountAmount);

  // Create order - persists to DB via API, falls back to localStorage only
  const createOrder = async (
    shippingAddress: ShippingAddress,
    paymentMethod: "upi" | "card" | "netbanking" | "cod"
  ): Promise<OrderDetails> => {
    const orderId = `SM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const orderDate = now.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Build order details object for local reference / success page
    const newOrder: OrderDetails = {
      orderId,
      orderDate,
      items: [...items],
      itemCount: totalCount,
      subtotal,
      deliveryFee,
      discount: discountAmount,
      total: finalTotal,
      couponCode: appliedCoupon?.code,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending_cod" : "paid",
    };

    // Build shipping address string for API
    const shippingAddressStr = [
      shippingAddress.addressLine,
      shippingAddress.city,
      shippingAddress.state,
      shippingAddress.pincode,
    ]
      .filter(Boolean)
      .join(", ");

    // Attempt to persist to the real database
    try {
      const apiResponse = await fetchApi<{ orderId: number; orderStatus: string; totalAmount: string }>(
        "/api/checkout",
        {
          method: "POST",
          body: JSON.stringify({
            items: items.map((item) => ({
              productId: item.product.productId,
              productName: item.product.productName,
              quantity: item.quantity,
              unitPrice: item.product.price,
            })),
            shippingAddress: shippingAddressStr,
            paymentMethod,
          }),
        }
      );
      // Use the real orderId returned by the server
      newOrder.orderId = String(apiResponse.orderId);
    } catch (err) {
      // If API fails (e.g. user not logged in), we still let the UI succeed
      // but log the error so dev can see it
      console.warn("[CartContext] Failed to persist order to DB:", err);
    }

    try {
      localStorage.setItem(`smartmart_order_${newOrder.orderId}`, JSON.stringify(newOrder));
      localStorage.setItem("smartmart_last_order", JSON.stringify(newOrder));
    } catch (e) {
      console.error("Storage error:", e);
    }

    // Clear cart after order creation
    setItems([]);
    setAppliedCoupon(null);

    return newOrder;
  };

  const getOrderById = (orderId: string): OrderDetails | null => {
    if (typeof window === "undefined") return null;
    try {
      const stored =
        localStorage.getItem(`smartmart_order_${orderId}`) ||
        localStorage.getItem("smartmart_last_order");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      return null;
    }
    return null;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        removeSelectedItems,
        updateQuantity,
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
        createOrder,
        getOrderById,
        isLoaded,
        toastMessage,
        setToastMessage,
        showToast,
      }}
    >
      {children}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
