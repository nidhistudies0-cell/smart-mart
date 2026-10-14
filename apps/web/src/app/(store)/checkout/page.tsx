"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronRight,
  ShieldCheck,
  Truck,
  Home,
  Building,
  CreditCard,
  Banknote,
  Smartphone,
  Ticket,
  AlertCircle,
  Edit2,
  Plus,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Navbar } from "@/components/store/Navbar";
import { useCart, ShippingAddress } from "@/context/CartContext";
import { formatINR } from "@/lib/format";

type CheckoutStep = "delivery" | "payment" | "review";
type PaymentMethod = "upi" | "card" | "netbanking" | "cod";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
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
    showToast,
  } = useCart();

  // Current Step
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("delivery");

  // Address Mode: "saved" | "new"
  const [addressMode, setAddressMode] = useState<"saved" | "new">("saved");
  const [isEditingSavedAddress, setIsEditingSavedAddress] = useState(false);

  // Address Data
  const [address, setAddress] = useState<ShippingAddress>({
    fullName: "Juhi Gupta",
    phoneNumber: "9876543210",
    addressLine: "TT Block, Room 307, VIT Vellore, Katpadi",
    city: "Vellore",
    state: "Tamil Nadu",
    pincode: "632014",
    addressType: "hostel",
  });

  const [addressErrors, setAddressErrors] = useState<
    Partial<Record<keyof ShippingAddress, string>>
  >({});

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [upiId, setUpiId] = useState("juhi@okhdfcbank");

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);

  // Validate Address Form
  const validateAddress = (): boolean => {
    const errors: Partial<Record<keyof ShippingAddress, string>> = {};

    if (!address.fullName.trim()) {
      errors.fullName = "Full name is required";
    }
    if (!address.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required";
    } else if (!/^\d{10}$/.test(address.phoneNumber.replace(/\D/g, ""))) {
      errors.phoneNumber = "Enter a valid 10-digit mobile number";
    }
    if (!address.addressLine.trim()) {
      errors.addressLine = "Street address is required";
    }
    if (!address.city.trim()) {
      errors.city = "City is required";
    }
    if (!address.state.trim()) {
      errors.state = "State is required";
    }
    if (!address.pincode.trim()) {
      errors.pincode = "Postal code is required";
    } else if (!/^\d{6}$/.test(address.pincode.replace(/\s/g, ""))) {
      errors.pincode = "Enter a valid 6-digit postal code";
    }

    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContinueFromDelivery = () => {
    if (validateAddress()) {
      setIsEditingSavedAddress(false);
      setCurrentStep("payment");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleContinueFromPayment = () => {
    setCurrentStep("review");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFinalOrderSubmit = async () => {
    if (items.length === 0) {
      showToast("Your cart is empty");
      router.push("/cart");
      return;
    }

    setIsProcessing(true);

    try {
      // Create Order — persists to DB via API
      const order = await createOrder(address, paymentMethod);

      if (paymentMethod === "cod") {
        showToast("Order Placed Successfully! (Cash on Delivery)");
      } else {
        showToast("Payment Successful! Order confirmed.");
      }

      // Navigate to dedicated confirmation route
      router.push(`/order-success/${order.orderId}`);
    } catch (err) {
      console.error("Order placement error:", err);
      showToast("Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
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
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs sm:text-sm text-stone-500 mb-4"
        >
          <Link href="/" className="hover:text-[#1E4D38] transition-colors">
            Home
          </Link>
          <span>&gt;</span>
          <Link href="/cart" className="hover:text-[#1E4D38] transition-colors">
            Cart
          </Link>
          <span>&gt;</span>
          <span className="font-semibold text-stone-800">Checkout</span>
        </nav>

        {/* Page Header & 3-Step Progress Indicator */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              Checkout
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Complete your order with secure and easy payment.
            </p>
          </div>

          {/* 3-Step Progress Indicator matching Screenshot 2 */}
          <div className="flex items-center gap-3 self-start md:self-auto bg-white/70 backdrop-blur-xs px-5 py-2.5 rounded-full border border-stone-200/80 shadow-2xs">
            {/* Step 1: Delivery */}
            <button
              onClick={() => setCurrentStep("delivery")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  currentStep === "delivery"
                    ? "bg-[#1E4D38] text-white"
                    : "bg-[#E5EFE2] text-[#1E4D38]"
                }`}
              >
                1
              </div>
              <span
                className={`text-xs sm:text-sm font-bold ${
                  currentStep === "delivery"
                    ? "text-[#1E4D38]"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                Delivery
              </span>
            </button>

            <div className="w-8 h-px bg-stone-300" />

            {/* Step 2: Payment */}
            <button
              onClick={() => {
                if (validateAddress()) setCurrentStep("payment");
              }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  currentStep === "payment"
                    ? "bg-[#1E4D38] text-white"
                    : currentStep === "review"
                    ? "bg-[#E5EFE2] text-[#1E4D38]"
                    : "bg-stone-100 text-stone-500"
                }`}
              >
                2
              </div>
              <span
                className={`text-xs sm:text-sm font-bold ${
                  currentStep === "payment"
                    ? "text-[#1E4D38]"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                Payment
              </span>
            </button>

            <div className="w-8 h-px bg-stone-300" />

            {/* Step 3: Review */}
            <button
              onClick={() => {
                if (validateAddress()) setCurrentStep("review");
              }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  currentStep === "review"
                    ? "bg-[#1E4D38] text-white"
                    : "bg-stone-100 text-stone-500"
                }`}
              >
                3
              </div>
              <span
                className={`text-xs sm:text-sm font-bold ${
                  currentStep === "review"
                    ? "text-[#1E4D38]"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                Review
              </span>
            </button>
          </div>
        </div>

        {/* Empty Cart Guard */}
        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200/80 p-12 text-center max-w-lg mx-auto shadow-2xs space-y-4">
            <ShoppingBag className="w-12 h-12 text-stone-400 mx-auto stroke-1" />
            <h2 className="text-xl font-bold text-stone-800">
              Your cart is empty
            </h2>
            <p className="text-xs sm:text-sm text-stone-500">
              Please add items to your cart before proceeding to checkout.
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1E4D38] hover:bg-[#163C2B] text-white font-bold text-sm shadow-xs transition-colors"
              >
                <span>Browse Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Main Two-Column Checkout Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Checkout Form Sections (Cols 8 / 12) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* SECTION 1: Delivery Information */}
              <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-7 shadow-2xs space-y-5">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-[#1E4D38] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    1
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-stone-900 leading-tight">
                      Delivery Information
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Enter your address details for delivery.
                    </p>
                  </div>
                </div>

                {/* Radio Option 1: Use Saved Address (Screenshot 2 match) */}
                <div className="space-y-3 pt-2">
                  <label
                    onClick={() => {
                      setAddressMode("saved");
                    }}
                    className="flex items-center gap-3 cursor-pointer select-none"
                  >
                    <input
                      type="radio"
                      name="addressMode"
                      checked={addressMode === "saved"}
                      onChange={() => setAddressMode("saved")}
                      className="w-4 h-4 text-[#1E4D38] focus:ring-[#1E4D38] accent-[#1E4D38] cursor-pointer"
                    />
                    <span className="text-xs sm:text-sm font-bold text-stone-800">
                      Use Saved Address
                    </span>
                  </label>

                  {/* Saved Address Card (Sage Green Card) */}
                  {addressMode === "saved" && !isEditingSavedAddress && (
                    <div className="ml-7 bg-[#EAF3E7] border border-[#D5E5D1] rounded-2xl p-4 sm:p-5 flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center text-[#1E4D38] shrink-0 shadow-2xs">
                          <Home className="w-5 h-5" />
                        </div>
                        <div className="text-xs sm:text-sm space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900">
                              {address.addressType === "hostel"
                                ? "Hostel Address (Default)"
                                : address.addressType === "home"
                                ? "Home Address (Default)"
                                : "Delivery Address (Default)"}
                            </span>
                          </div>
                          <p className="text-stone-700 font-medium">
                            {address.fullName} ({address.phoneNumber})
                          </p>
                          <p className="text-stone-600">
                            {address.addressLine}
                          </p>
                          <p className="text-stone-600">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setIsEditingSavedAddress(true)}
                        className="text-xs font-bold text-[#1E4D38] hover:underline flex items-center gap-1 cursor-pointer shrink-0 pt-0.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    </div>
                  )}

                  {/* Inline Address Form (when editing or entering new) */}
                  {(addressMode === "new" || isEditingSavedAddress) && (
                    <div className="ml-7 p-5 rounded-2xl bg-[#FAF7F2] border border-stone-200/90 space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-stone-200/60">
                        <span className="text-xs font-bold text-stone-800">
                          {isEditingSavedAddress
                            ? "Edit Delivery Address"
                            : "New Delivery Address Details"}
                        </span>
                        {isEditingSavedAddress && (
                          <button
                            onClick={() => setIsEditingSavedAddress(false)}
                            className="text-xs font-semibold text-stone-500 hover:text-stone-800"
                          >
                            Cancel
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {/* Recipient Full Name */}
                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">
                            Recipient Full Name *
                          </label>
                          <input
                            type="text"
                            value={address.fullName}
                            onChange={(e) =>
                              setAddress({ ...address, fullName: e.target.value })
                            }
                            placeholder="e.g. Juhi Gupta"
                            className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#1E4D38]/20 focus:border-[#1E4D38]"
                          />
                          {addressErrors.fullName && (
                            <p className="text-[11px] text-rose-600 mt-1">
                              {addressErrors.fullName}
                            </p>
                          )}
                        </div>

                        {/* Phone Number */}
                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            value={address.phoneNumber}
                            onChange={(e) =>
                              setAddress({
                                ...address,
                                phoneNumber: e.target.value,
                              })
                            }
                            placeholder="10-digit mobile number"
                            className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#1E4D38]/20 focus:border-[#1E4D38]"
                          />
                          {addressErrors.phoneNumber && (
                            <p className="text-[11px] text-rose-600 mt-1">
                              {addressErrors.phoneNumber}
                            </p>
                          )}
                        </div>

                        {/* Street Address */}
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-stone-700 mb-1">
                            Flat / Hostel / Street Address *
                          </label>
                          <input
                            type="text"
                            value={address.addressLine}
                            onChange={(e) =>
                              setAddress({
                                ...address,
                                addressLine: e.target.value,
                              })
                            }
                            placeholder="e.g. TT Block, Room 307, Campus Hostel"
                            className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#1E4D38]/20 focus:border-[#1E4D38]"
                          />
                          {addressErrors.addressLine && (
                            <p className="text-[11px] text-rose-600 mt-1">
                              {addressErrors.addressLine}
                            </p>
                          )}
                        </div>

                        {/* City */}
                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">
                            City *
                          </label>
                          <input
                            type="text"
                            value={address.city}
                            onChange={(e) =>
                              setAddress({ ...address, city: e.target.value })
                            }
                            placeholder="e.g. Vellore"
                            className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#1E4D38]/20 focus:border-[#1E4D38]"
                          />
                          {addressErrors.city && (
                            <p className="text-[11px] text-rose-600 mt-1">
                              {addressErrors.city}
                            </p>
                          )}
                        </div>

                        {/* State & Pincode */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-bold text-stone-700 mb-1">
                              State *
                            </label>
                            <input
                              type="text"
                              value={address.state}
                              onChange={(e) =>
                                setAddress({
                                  ...address,
                                  state: e.target.value,
                                })
                              }
                              placeholder="e.g. Tamil Nadu"
                              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#1E4D38]/20 focus:border-[#1E4D38]"
                            />
                            {addressErrors.state && (
                              <p className="text-[11px] text-rose-600 mt-1">
                                {addressErrors.state}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-stone-700 mb-1">
                              Pincode *
                            </label>
                            <input
                              type="text"
                              value={address.pincode}
                              onChange={(e) =>
                                setAddress({
                                  ...address,
                                  pincode: e.target.value,
                                })
                              }
                              placeholder="632014"
                              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#1E4D38]/20 focus:border-[#1E4D38]"
                            />
                            {addressErrors.pincode && (
                              <p className="text-[11px] text-rose-600 mt-1">
                                {addressErrors.pincode}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Address Type Buttons */}
                      <div className="pt-2 flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-600 mr-2">
                          Address Tag:
                        </span>
                        {(["hostel", "home", "work", "other"] as const).map(
                          (type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() =>
                                setAddress({ ...address, addressType: type })
                              }
                              className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition-colors ${
                                address.addressType === type
                                  ? "bg-[#1E4D38] text-white"
                                  : "bg-white border border-stone-200 text-stone-700 hover:bg-stone-50"
                              }`}
                            >
                              {type}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Radio Option 2: Add New Address */}
                  <label
                    onClick={() => {
                      setAddressMode("new");
                    }}
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-stone-200/80 hover:bg-stone-50 cursor-pointer transition select-none"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="addressMode"
                        checked={addressMode === "new"}
                        onChange={() => setAddressMode("new")}
                        className="w-4 h-4 text-[#1E4D38] focus:ring-[#1E4D38] accent-[#1E4D38] cursor-pointer"
                      />
                      <span className="text-xs sm:text-sm font-bold text-stone-800 flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add New Address</span>
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </label>
                </div>

                {currentStep === "delivery" && (
                  <div className="pt-3 flex justify-end">
                    <button
                      onClick={handleContinueFromDelivery}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1E4D38] hover:bg-[#163C2B] text-white font-bold text-sm shadow-xs transition-colors cursor-pointer"
                    >
                      <span>Continue to Payment</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* SECTION 2: Payment Method */}
              <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-7 shadow-2xs space-y-5">
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                      currentStep === "payment" || currentStep === "review"
                        ? "bg-[#1E4D38] text-white"
                        : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    2
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-stone-900 leading-tight">
                      Payment Method
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Choose a payment method (demo payment).
                    </p>
                  </div>
                </div>

                {/* 2x2 Payment Options Grid matching Screenshot 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  
                  {/* Option 1: UPI */}
                  <label
                    onClick={() => setPaymentMethod("upi")}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                      paymentMethod === "upi"
                        ? "border-[#1E4D38] bg-[#FAFDF9] ring-2 ring-[#1E4D38]/10"
                        : "border-stone-200/80 hover:border-stone-300 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === "upi"}
                      onChange={() => setPaymentMethod("upi")}
                      className="w-4 h-4 text-[#1E4D38] focus:ring-[#1E4D38] accent-[#1E4D38] cursor-pointer mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#FAF5EE] text-[#1E4D38] flex items-center justify-center shrink-0">
                          <Smartphone className="w-4 h-4" />
                        </div>
                        <span className="font-extrabold text-sm text-stone-900">
                          UPI
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                        Pay using any UPI app (e.g., GPay, PhonePe, Paytm)
                      </p>

                      {paymentMethod === "upi" && (
                        <div className="mt-3 pt-2 border-t border-stone-100">
                          <span className="text-[11px] font-bold text-[#1E4D38] block mb-1">
                            Demo UPI ID:
                          </span>
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="w-full px-2.5 py-1 text-xs border border-stone-200 rounded-lg bg-white"
                          />
                        </div>
                      )}
                    </div>
                  </label>

                  {/* Option 2: Card */}
                  <label
                    onClick={() => setPaymentMethod("card")}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                      paymentMethod === "card"
                        ? "border-[#1E4D38] bg-[#FAFDF9] ring-2 ring-[#1E4D38]/10"
                        : "border-stone-200/80 hover:border-stone-300 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      className="w-4 h-4 text-[#1E4D38] focus:ring-[#1E4D38] accent-[#1E4D38] cursor-pointer mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#FAF5EE] text-stone-800 flex items-center justify-center shrink-0">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <span className="font-extrabold text-sm text-stone-900">
                          Card
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                        Use debit/credit card (Demo)
                      </p>

                      {paymentMethod === "card" && (
                        <div className="mt-3 pt-2 border-t border-stone-100 text-[11px] text-stone-600 space-y-1">
                          <div className="font-mono bg-white p-2 rounded border border-stone-200">
                            •••• •••• •••• 4242 (Demo VISA)
                          </div>
                        </div>
                      )}
                    </div>
                  </label>

                  {/* Option 3: Net Banking */}
                  <label
                    onClick={() => setPaymentMethod("netbanking")}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                      paymentMethod === "netbanking"
                        ? "border-[#1E4D38] bg-[#FAFDF9] ring-2 ring-[#1E4D38]/10"
                        : "border-stone-200/80 hover:border-stone-300 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === "netbanking"}
                      onChange={() => setPaymentMethod("netbanking")}
                      className="w-4 h-4 text-[#1E4D38] focus:ring-[#1E4D38] accent-[#1E4D38] cursor-pointer mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#FAF5EE] text-stone-800 flex items-center justify-center shrink-0">
                          <Building className="w-4 h-4" />
                        </div>
                        <span className="font-extrabold text-sm text-stone-900">
                          Net Banking
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                        Use your bank account (Demo)
                      </p>

                      {paymentMethod === "netbanking" && (
                        <div className="mt-3 pt-2 border-t border-stone-100 text-[11px] text-stone-600">
                          Select bank: HDFC, ICICI, SBI, Axis (Simulated)
                        </div>
                      )}
                    </div>
                  </label>

                  {/* Option 4: Cash on Delivery */}
                  <label
                    onClick={() => setPaymentMethod("cod")}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                      paymentMethod === "cod"
                        ? "border-[#1E4D38] bg-[#FAFDF9] ring-2 ring-[#1E4D38]/10"
                        : "border-stone-200/80 hover:border-stone-300 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="w-4 h-4 text-[#1E4D38] focus:ring-[#1E4D38] accent-[#1E4D38] cursor-pointer mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#FAF5EE] text-[#1E4D38] flex items-center justify-center shrink-0">
                          <Banknote className="w-4 h-4" />
                        </div>
                        <span className="font-extrabold text-sm text-stone-900">
                          Cash on Delivery
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                        Pay when you receive the order (Demo)
                      </p>

                      {paymentMethod === "cod" && (
                        <div className="mt-3 pt-2 border-t border-stone-100 text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg">
                          Payment will be collected by the delivery executive at your doorstep.
                        </div>
                      )}
                    </div>
                  </label>

                </div>

                {/* Security Footnote & Continue Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-stone-100">
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <ShieldCheck className="w-4 h-4 text-[#1E4D38] shrink-0" />
                    <span>
                      Your payment information is secure and encrypted (Demo Environment).
                    </span>
                  </div>

                  {currentStep === "payment" && (
                    <button
                      onClick={handleContinueFromPayment}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1E4D38] hover:bg-[#163C2B] text-white font-bold text-sm shadow-xs transition-colors cursor-pointer shrink-0"
                    >
                      <span>Continue to Review</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

              </div>

              {/* SECTION 3: Order Review (When on Review step) */}
              {currentStep === "review" && (
                <div className="bg-white rounded-3xl border border-[#1E4D38]/30 p-6 sm:p-7 shadow-xs space-y-5 animate-in fade-in duration-300">
                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-full bg-[#1E4D38] text-white flex items-center justify-center font-bold text-sm shrink-0">
                      3
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-stone-900 leading-tight">
                        Review Your Order
                      </h2>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Please verify your delivery address and payment choice.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#FAF7F2] border border-stone-200/80 text-xs sm:text-sm">
                    {/* Delivery summary */}
                    <div>
                      <span className="font-bold text-stone-500 uppercase tracking-wider text-[11px] block mb-1">
                        Shipping Address
                      </span>
                      <p className="font-bold text-stone-900">{address.fullName}</p>
                      <p className="text-stone-600">{address.addressLine}</p>
                      <p className="text-stone-600">
                        {address.city}, {address.state} - {address.pincode}
                      </p>
                      <p className="text-stone-500 mt-1">Phone: {address.phoneNumber}</p>
                    </div>

                    {/* Payment choice summary */}
                    <div>
                      <span className="font-bold text-stone-500 uppercase tracking-wider text-[11px] block mb-1">
                        Payment Selection
                      </span>
                      <div className="flex items-center gap-2 font-bold text-stone-900">
                        {paymentMethod === "upi" && <Smartphone className="w-4 h-4 text-[#1E4D38]" />}
                        {paymentMethod === "card" && <CreditCard className="w-4 h-4 text-[#1E4D38]" />}
                        {paymentMethod === "netbanking" && <Building className="w-4 h-4 text-[#1E4D38]" />}
                        {paymentMethod === "cod" && <Banknote className="w-4 h-4 text-[#1E4D38]" />}
                        <span className="uppercase">{paymentMethod}</span>
                      </div>
                      <p className="text-stone-600 mt-1">
                        {paymentMethod === "cod"
                          ? "Payment due at delivery"
                          : "Simulated online transaction"}
                      </p>
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E5EFE2] text-[#1E4D38] text-xs font-bold">
                        <Truck className="w-3.5 h-3.5" />
                        <span>Delivery within 2-3 business days</span>
                      </div>
                    </div>
                  </div>

                  {/* Final Submit Button */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button
                      onClick={() => setCurrentStep("payment")}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-stone-600 hover:text-stone-900 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Payment</span>
                    </button>

                    <button
                      onClick={handleFinalOrderSubmit}
                      disabled={isProcessing}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#1E4D38] hover:bg-[#163C2B] active:bg-[#153A28] text-white font-extrabold text-sm sm:text-base shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Processing Demo Payment...</span>
                        </>
                      ) : paymentMethod === "cod" ? (
                        <>
                          <Check className="w-5 h-5" />
                          <span>Place Order (Cash on Delivery)</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Complete Demo Payment ({formatINR(finalTotal).replace(/\.00$/, "")})</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT COLUMN: Order Summary matching Screenshot 2 (Cols 4 / 12) */}
            <div className="lg:col-span-4 space-y-5 sticky top-28">
              
              {/* Card 1: Order Summary with Mini Product List */}
              <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <h2 className="text-base sm:text-lg font-bold text-stone-900">
                    Order Summary
                  </h2>
                  <span className="text-xs font-semibold text-stone-500">
                    {lineItemCount} {lineItemCount === 1 ? "item" : "items"}
                  </span>
                </div>

                {/* Mini Products Thumbnails List */}
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1 divide-y divide-stone-50">
                  {items.map(({ product, quantity }) => {
                    const lineSubtotal = formatINR(
                      product.price * quantity
                    ).replace(/\.00$/, "");

                    return (
                      <div
                        key={product.productId}
                        className="flex items-center justify-between gap-3 pt-2.5 first:pt-0"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-12 h-12 rounded-xl bg-stone-50 border border-stone-200/60 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                            <Image
                              src={product.imageUrl}
                              alt={product.productName}
                              fill
                              sizes="48px"
                              className="object-contain p-0.5"
                            />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-stone-900 truncate">
                              {product.productName}
                            </h4>
                            <p className="text-[11px] text-stone-500 mt-0.5">
                              {quantity} × {formatINR(product.price).replace(/\.00$/, "")}
                            </p>
                          </div>
                        </div>

                        <div className="text-xs sm:text-sm font-extrabold text-stone-900 shrink-0">
                          {lineSubtotal}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Subtotals & Total Breakdown */}
                <div className="pt-3 border-t border-stone-100 space-y-2 text-xs sm:text-sm text-stone-600">
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
                    <div className="flex justify-between items-center text-emerald-700 font-semibold">
                      <span>Coupon Discount</span>
                      <span>-{formatINR(discountAmount).replace(/\.00$/, "")}</span>
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

                {/* Free Delivery Banner */}
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
                      X
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
                  </form>
                )}
              </div>

            </div>

          </div>
        )}

      </main>
    </div>
  );
}
