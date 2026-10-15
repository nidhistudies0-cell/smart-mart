"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  CreditCard,
  MapPin,
  Calendar,
  ShoppingBag,
  RefreshCw,
  Search,
  ReceiptText,
  User,
  ArrowRight
} from "lucide-react";
import { fetchApi, ApiError } from "@/lib/api";
import { formatDate, formatINR } from "@/lib/format";
import { OrderSummary, OrderDetail, OrderStatus } from "@/types/orders";
import { authClient } from "@/lib/auth-client";
import { Navbar } from "@/components/store/Navbar";
import { HomeFooter } from "@/components/store/HomeFooter";

const STATUS_OPTIONS: { label: string; value: OrderStatus | "ALL" }[] = [
  { label: "All Orders", value: "ALL" },
  { label: "Pending", value: "Pending" },
  { label: "Confirmed", value: "Confirmed" },
  { label: "Shipped", value: "Shipped" },
  { label: "Delivered", value: "Delivered" },
  { label: "Cancelled", value: "Cancelled" },
];

export default function OrderHistoryClient() {
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const searchParams = useSearchParams();

  const urlStatus = searchParams.get("status");
  const urlCustomerId = searchParams.get("customerId");

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "ALL">(
    (urlStatus as OrderStatus) || "ALL"
  );
  const [customerIdInput, setCustomerIdInput] = useState<string>(urlCustomerId || "");

  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthRestricted, setIsAuthRestricted] = useState(false);

  // Expanded order details state
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [detailsCache, setDetailsCache] = useState<Record<number, OrderDetail>>({});
  const [loadingDetailsId, setLoadingDetailsId] = useState<number | null>(null);

  const loadOrders = useCallback(async () => {
    // If session is still loading, wait
    if (sessionLoading) return;

    if (!session) {
      setIsAuthRestricted(true);
      setLoading(false);
      setOrders([]);
      return;
    }

    setLoading(true);
    setError(null);
    setIsAuthRestricted(false);

    const params = new URLSearchParams();
    if (selectedStatus !== "ALL") {
      params.append("status", selectedStatus);
    }
    // Only admins are permitted to search/filter by customerId
    if (session.user.role === "admin" && customerIdInput.trim()) {
      params.append("customerId", customerIdInput.trim());
    }

    const queryStr = params.toString() ? `?${params.toString()}` : "";

    try {
      const data = await fetchApi<OrderSummary[]>(`/api/orders${queryStr}`);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        setIsAuthRestricted(true);
      } else if (err instanceof ApiError) {
        setError(err.message || "Failed to load orders from the server.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected network error occurred.");
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, customerIdInput, session, sessionLoading]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const toggleExpand = async (orderId: number) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }

    setExpandedOrderId(orderId);

    // If not cached, fetch detail
    if (!detailsCache[orderId]) {
      setLoadingDetailsId(orderId);
      try {
        const detail = await fetchApi<OrderDetail>(`/api/orders/${orderId}`);
        setDetailsCache((prev) => ({ ...prev, [orderId]: detail }));
      } catch (err) {
        console.error("Failed to load order details for order #" + orderId, err);
      } finally {
        setLoadingDetailsId(null);
      }
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "Pending":
        return {
          icon: Clock,
          color: "bg-amber-50 text-amber-700 border-amber-200/80",
          dot: "bg-amber-500",
        };
      case "Confirmed":
        return {
          icon: CheckCircle2,
          color: "bg-blue-50 text-blue-700 border-blue-200/80",
          dot: "bg-blue-500",
        };
      case "Shipped":
        return {
          icon: Truck,
          color: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
          dot: "bg-indigo-500",
        };
      case "Delivered":
        return {
          icon: Package,
          color: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
          dot: "bg-emerald-500",
        };
      case "Cancelled":
        return {
          icon: XCircle,
          color: "bg-rose-50 text-rose-700 border-rose-200/80",
          dot: "bg-rose-500",
        };
      default:
        return {
          icon: Clock,
          color: "bg-stone-50 text-stone-700 border-stone-200",
          dot: "bg-stone-400",
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between">
      {/* Universal Store Navigation */}
      <Navbar />

      {/* Main Container */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-1">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <Link href="/" className="hover:text-[#1E4D38] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/profile" className="hover:text-[#1E4D38] transition-colors">Profile</Link>
          <span>/</span>
          <span className="font-semibold text-stone-800">Order History</span>
        </div>

        {/* Page Title & Overview */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2.5">
              <ReceiptText className="text-[#1E4D38]" size={28} />
              My Past Orders
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              {session?.user?.name
                ? `Viewing verified purchase receipts and tracking status for ${session.user.name}`
                : "View your order history, delivery tracking, and itemized receipts."}
            </p>
          </div>

          <button
            onClick={() => loadOrders()}
            disabled={loading}
            className="inline-flex items-center gap-2 self-start sm:self-auto px-4 py-2 text-xs sm:text-sm font-semibold text-stone-700 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 shadow-2xs transition-all disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-[#1E4D38]" : "text-stone-500"} />
            Refresh
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-2xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              {STATUS_OPTIONS.map((opt) => {
                const isActive = selectedStatus === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedStatus(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#1E4D38] text-white shadow-xs"
                        : "bg-stone-50 text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Admin-only Customer ID Filter */}
            {session?.user?.role === "admin" && (
              <div className="flex items-center gap-2 max-w-xs w-full">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="number"
                    min="1"
                    placeholder="Admin Filter: Customer ID"
                    value={customerIdInput}
                    onChange={(e) => setCustomerIdInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && loadOrders()}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg outline-none focus:bg-white focus:border-[#1E4D38] focus:ring-1 focus:ring-[#1E4D38] transition-all text-stone-800 placeholder:text-stone-400"
                  />
                </div>
                {customerIdInput && (
                  <button
                    onClick={() => setCustomerIdInput("")}
                    className="text-xs text-stone-400 hover:text-stone-600 px-1.5 py-1 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Auth Required State */}
        {isAuthRestricted && !sessionLoading && (
          <div className="bg-white rounded-3xl border border-stone-200/90 p-8 sm:p-12 text-center shadow-2xs max-w-xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#E8F2E6] text-[#1E4D38] flex items-center justify-center mx-auto">
              <User size={30} />
            </div>
            <h3 className="text-xl font-bold text-stone-900">Sign in to view your past orders</h3>
            <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
              Your order history is securely tied to your personal account. Please log in to see your receipts, order status, and tracking information.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/login?redirect=/orders"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#1E4D38] text-white hover:bg-[#153728] shadow-xs transition-all"
              >
                Log In to Your Account
                <ArrowRight size={15} />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-stone-100 text-stone-700 hover:bg-stone-200 transition-all"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}

        {/* Server Error State */}
        {error && !isAuthRestricted && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 shadow-2xs flex items-start gap-3.5 text-rose-800">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold">Unable to fetch orders</h3>
              <p className="text-xs text-rose-700 mt-0.5">{error}</p>
              <button
                onClick={() => loadOrders()}
                className="mt-3 text-xs font-semibold text-rose-700 hover:text-rose-900 underline underline-offset-2 cursor-pointer"
              >
                Try reloading orders
              </button>
            </div>
          </div>
        )}

        {/* Loading State Skeleton */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs animate-pulse space-y-4"
              >
                <div className="flex justify-between items-center">
                  <div className="h-5 bg-stone-200 rounded w-32" />
                  <div className="h-6 bg-stone-200 rounded-full w-24" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                  <div className="h-4 bg-stone-100 rounded w-20" />
                  <div className="h-4 bg-stone-100 rounded w-24" />
                  <div className="h-4 bg-stone-100 rounded w-28" />
                  <div className="h-4 bg-stone-100 rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && !isAuthRestricted && orders.length === 0 && (
          <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center shadow-2xs max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#E8F2E6] text-[#1E4D38] flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={28} />
            </div>
            <h3 className="text-lg font-bold text-stone-900">No Orders Placed Yet</h3>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-sm mx-auto leading-relaxed">
              {selectedStatus !== "ALL"
                ? `You don't have any orders with status "${selectedStatus}". Try viewing "All Orders".`
                : "You haven't placed any orders yet. Fresh groceries and daily supermarket essentials are just a few clicks away!"}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              {selectedStatus !== "ALL" && (
                <button
                  onClick={() => setSelectedStatus("ALL")}
                  className="px-4 py-2 text-xs font-semibold bg-stone-100 text-stone-700 rounded-xl hover:bg-stone-200 transition-all cursor-pointer"
                >
                  View All Orders
                </button>
              )}
              <Link
                href="/products"
                className="px-5 py-2.5 text-xs font-bold bg-[#1E4D38] text-white rounded-xl hover:bg-[#153728] shadow-xs transition-all"
              >
                Explore Products
              </Link>
            </div>
          </div>
        )}

        {/* Order Cards List */}
        {!loading && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => {
              const badge = getStatusBadge(order.orderStatus);
              const BadgeIcon = badge.icon;
              const isExpanded = expandedOrderId === order.orderId;
              const details = detailsCache[order.orderId];
              const isLoadingDetails = loadingDetailsId === order.orderId;

              return (
                <div
                  key={order.orderId}
                  className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden transition-all hover:border-stone-300"
                >
                  {/* Card Header Summary */}
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-stone-100">
                      <div className="flex items-center gap-3">
                        <span className="text-base font-bold text-stone-900 tracking-tight">
                          Order #{order.orderId}
                        </span>
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.color}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          <BadgeIcon size={13} />
                          {order.orderStatus}
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-xs text-stone-400 font-medium block">Total Amount</span>
                        <span className="text-lg font-bold text-[#1E4D38]">
                          {formatINR(order.totalAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-xs text-stone-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={15} className="text-stone-400 shrink-0" />
                        <div>
                          <span className="text-stone-400 block font-medium">Order Placed</span>
                          <span className="font-semibold text-stone-800">
                            {formatDate(order.orderDate)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <MapPin size={15} className="text-stone-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-stone-400 block font-medium">Delivery Address</span>
                          <span className="font-medium text-stone-700 line-clamp-1">
                            {order.shippingAddress || "Standard delivery address"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expand Details Trigger */}
                    <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-xs text-stone-400">
                        {isExpanded ? "Showing itemized receipt" : "Click to view purchased items & invoice"}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleExpand(order.orderId)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E4D38] hover:text-[#153728] bg-[#E8F2E6] hover:bg-[#d8e8d5] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        {isExpanded ? (
                          <>
                            <span>Hide Details</span>
                            <ChevronUp size={15} />
                          </>
                        ) : (
                          <>
                            <span>View Details</span>
                            <ChevronDown size={15} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Order Details Panel */}
                  {isExpanded && (
                    <div className="bg-[#FAF7F2] border-t border-stone-200/80 p-5 sm:p-6 space-y-6">
                      {isLoadingDetails && (
                        <div className="py-8 text-center text-xs text-stone-500 flex items-center justify-center gap-2">
                          <RefreshCw size={15} className="animate-spin text-[#1E4D38]" />
                          Loading itemized breakdown...
                        </div>
                      )}

                      {!isLoadingDetails && details && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Purchased Items List */}
                          <div className="lg:col-span-2 space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                              Purchased Items ({details.items?.length || 0})
                            </h4>

                            <div className="bg-white rounded-xl border border-stone-200/80 divide-y divide-stone-100 overflow-hidden shadow-2xs">
                              {details.items && details.items.length > 0 ? (
                                details.items.map((item) => (
                                  <div
                                    key={item.orderDetailId}
                                    className="p-3.5 flex items-center justify-between gap-3 text-xs"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-[#E8F2E6] flex items-center justify-center text-[#1E4D38] font-bold shrink-0">
                                        <Package size={16} />
                                      </div>
                                      <div>
                                        <span className="font-semibold text-stone-900 block">
                                          {item.productName || `Product #${item.productId}`}
                                        </span>
                                        <span className="text-stone-400 text-[11px]">
                                          Qty: {item.quantity} × {formatINR(item.unitPrice)}
                                        </span>
                                      </div>
                                    </div>
                                    <span className="font-bold text-stone-900">
                                      {formatINR(Number(item.unitPrice) * item.quantity)}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <div className="p-4 text-center text-xs text-stone-500">
                                  No items registered for this order.
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Payment & Delivery Breakdown */}
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                                Payment Information
                              </h4>
                              <div className="bg-white rounded-xl border border-stone-200/80 p-4 space-y-2.5 text-xs shadow-2xs">
                                {details.payment ? (
                                  <>
                                    <div className="flex justify-between items-center">
                                      <span className="text-stone-500 flex items-center gap-1.5">
                                        <CreditCard size={14} className="text-stone-400" />
                                        Method:
                                      </span>
                                      <span className="font-semibold text-stone-800">
                                        {details.payment.paymentMethod}
                                      </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                      <span className="text-stone-500">Status:</span>
                                      <span
                                        className={`font-semibold px-2 py-0.5 rounded-full text-[11px] ${
                                          details.payment.paymentStatus === "Completed"
                                            ? "bg-emerald-50 text-emerald-700"
                                            : "bg-amber-50 text-amber-700"
                                        }`}
                                      >
                                        {details.payment.paymentStatus}
                                      </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                      <span className="text-stone-500">Amount Paid:</span>
                                      <span className="font-bold text-[#1E4D38]">
                                        {formatINR(details.payment.amount)}
                                      </span>
                                    </div>

                                    {details.payment.paymentDate && (
                                      <div className="flex justify-between items-center pt-1 border-t border-stone-100 text-[11px]">
                                        <span className="text-stone-400">Date:</span>
                                        <span className="text-stone-600">
                                          {formatDate(details.payment.paymentDate)}
                                        </span>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-stone-400 italic">No payment record found.</span>
                                )}
                              </div>
                            </div>

                            {/* Delivery Address Summary */}
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                                Destination
                              </h4>
                              <div className="bg-white rounded-xl border border-stone-200/80 p-3.5 text-xs text-stone-700 shadow-2xs flex items-start gap-2">
                                <MapPin size={15} className="text-[#1E4D38] shrink-0 mt-0.5" />
                                <span>{details.shippingAddress || "Standard shipping address"}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Universal Store Footer */}
      <HomeFooter />
    </div>
  );
}

