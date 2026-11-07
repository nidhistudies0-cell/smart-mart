"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, ShoppingBag, Heart, Menu, X, ChevronDown, LogOut, Shield, ArrowRight } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { ALL_PRODUCTS } from "@/data/mockStoreData";

interface NavbarProps {
  cartCount?: number;
  onCartClick?: () => void;
  searchQuery?: string;
  onSearch?: (query: string) => void;
}

export function Navbar({
  cartCount,
  onCartClick,
  searchQuery: controlledSearchQuery,
  onSearch,
}: NavbarProps) {
  const { data: session } = authClient.useSession();
  const { totalCount } = useCart();
  const { wishlistCount } = useWishlist();
  const effectiveCartCount = cartCount !== undefined ? cartCount : totalCount;
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const isHome = pathname === "/";
  const activeSearchQuery = controlledSearchQuery !== undefined ? controlledSearchQuery : localSearchQuery;

  // Track scroll position: only show cream frosted navbar after user scrolls past the hero section (~550px)
  useEffect(() => {
    const handleScroll = () => {
      // On homepage, only turn solid/frosted once scrolled past hero
      const threshold = isHome ? 500 : 20;
      setScrolled(window.scrollY > threshold);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  // Real-time suggestions from catalog
  const searchSuggestions = activeSearchQuery.trim().length >= 1
    ? ALL_PRODUCTS.filter((p) =>
        p.productName.toLowerCase().includes(activeSearchQuery.toLowerCase()) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(activeSearchQuery.toLowerCase())) ||
        (p.description && p.description.toLowerCase().includes(activeSearchQuery.toLowerCase()))
      ).slice(0, 5)
    : [];

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeSearchQuery.trim()) return;
    setIsSearchOpen(false);
    if (onSearch) {
      onSearch(activeSearchQuery.trim());
    } else {
      router.push(`/products?search=${encodeURIComponent(activeSearchQuery.trim())}`);
    }
  };

  const handleSearchChange = (val: string) => {
    setLocalSearchQuery(val);
    if (onSearch) onSearch(val);
  };

  // On homepage before scroll: transparent navbar with white text / icons
  const isTransparent = isHome && !scrolled;

  return (
    <header
      suppressHydrationWarning
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isTransparent
          ? "bg-transparent text-white"
          : "bg-[#FAF7F2]/95 backdrop-blur-md text-stone-900 border-b border-[#EDE6DC]/70 shadow-xs"
      }`}
    >
      <div className="max-w-[1536px] mx-auto px-6 sm:px-10 lg:px-14">
        <div className="flex items-center justify-between h-20 gap-6">
          
          {/* Brand Logo with Shopping Cart Icon & Carrot Leaf */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all group-hover:scale-105 shadow-xs ${
              isTransparent
                ? "bg-white/20 backdrop-blur-md text-white border border-white/30"
                : "bg-[#E5F2E2] text-[#1E4D38]"
            }`}>
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transition-colors"
              >
                {/* Cart Body */}
                <path
                  d="M3 3H5.2L7.3 14.5C7.4 15.1 7.9 15.5 8.5 15.5H18.5C19.1 15.5 19.6 15.1 19.7 14.5L21 7.5H6"
                  stroke={isTransparent ? "#FFFFFF" : "#1E4D38"}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="9" cy="19.5" r="1.5" fill={isTransparent ? "#FFFFFF" : "#1E4D38"} />
                <circle cx="18" cy="19.5" r="1.5" fill={isTransparent ? "#FFFFFF" : "#1E4D38"} />
                {/* Carrot Leaf / Sprout */}
                <path
                  d="M14 4.5C14 4.5 16 3 18 4C18.5 6 16.5 8 16.5 8"
                  stroke="#2E7D32"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15.5 6L13.5 8"
                  stroke="#F97316"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span
              className={`text-2xl sm:text-[1.65rem] font-bold tracking-tight transition-colors ${
                isTransparent ? "text-white" : "text-[#1A4731]"
              }`}
            >
              SmartMart
            </span>
          </Link>

          {/* Clean Right Navigation & Icons (Shop, Categories, Wishlist, Search, Bag) */}
          <div className="flex items-center gap-6 sm:gap-8">
            <nav className="hidden md:flex items-center gap-6 sm:gap-8 text-sm font-medium">
              <Link
                href="/products"
                className={`transition-colors hover:opacity-80 ${
                  isTransparent ? "text-white/90 hover:text-white" : "text-stone-700 hover:text-stone-900"
                }`}
              >
                Shop
              </Link>
              <Link
                href="/#categories"
                className={`transition-colors hover:opacity-80 ${
                  isTransparent ? "text-white/90 hover:text-white" : "text-stone-700 hover:text-stone-900"
                }`}
              >
                Categories
              </Link>
            </nav>

            {/* Minimal Icons: Search & Cart */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Search Toggle / Trigger */}
              <div ref={searchContainerRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  aria-label="Search store"
                  className={`p-2 rounded-full transition-colors cursor-pointer ${
                    isTransparent
                      ? "text-white hover:bg-white/15"
                      : "text-stone-700 hover:bg-stone-100 hover:text-stone-900"
                  }`}
                >
                  <Search className="w-5 h-5 stroke-[1.8]" />
                </button>

                {/* Search Overlay / Dropdown */}
                {isSearchOpen && (
                  <div className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-white text-stone-900 rounded-2xl shadow-2xl border border-stone-200/90 overflow-hidden z-50 p-3 animate-in fade-in slide-in-from-top-2 duration-150">
                    <form onSubmit={handleSearchSubmit} className="relative mb-2">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                        <Search className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        autoFocus
                        value={activeSearchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Search fresh groceries, drinks..."
                        className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl placeholder:text-stone-400 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#215E3F]/20 focus:border-[#215E3F]"
                      />
                    </form>

                    {activeSearchQuery.trim().length >= 1 && (
                      <div className="max-h-64 overflow-y-auto divide-y divide-stone-100">
                        {searchSuggestions.map((prod) => (
                          <Link
                            key={prod.productId}
                            href={`/products/${prod.productId}`}
                            onClick={() => setIsSearchOpen(false)}
                            className="flex items-center gap-3 py-2 px-2 hover:bg-stone-50 rounded-lg transition-colors group"
                          >
                            <img
                              src={prod.imageUrl}
                              alt={prod.productName}
                              className="w-8 h-8 rounded-md object-cover bg-stone-100 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-stone-800 truncate group-hover:text-[#215E3F]">
                                {prod.productName}
                              </p>
                              <p className="text-[11px] text-stone-500">₹{prod.price}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Wishlist Icon */}
              <Link
                href="/wishlist"
                onClick={(e) => {
                  if (!session?.user) {
                    e.preventDefault();
                    router.push("/login");
                  }
                }}
                aria-label={`Wishlist with ${wishlistCount} items`}
                className={`relative p-2 rounded-full transition-colors cursor-pointer ${
                  isTransparent
                    ? "text-white hover:bg-white/15"
                    : "text-stone-700 hover:bg-stone-100 hover:text-stone-900"
                }`}
              >
                <Heart className={`w-5 h-5 stroke-[1.8] ${wishlistCount > 0 ? "fill-rose-500 text-rose-500" : ""}`} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Minimalist Cart Icon */}
              <Link
                href="/cart"
                onClick={(e) => {
                  if (!session?.user) {
                    e.preventDefault();
                    router.push("/login");
                    return;
                  }
                  if (onCartClick) {
                    onCartClick();
                  }
                }}
                aria-label={`Shopping bag with ${effectiveCartCount} items`}
                className={`relative p-2 rounded-full transition-colors cursor-pointer ${
                  isTransparent
                    ? "text-white hover:bg-white/15"
                    : "text-stone-700 hover:bg-stone-100 hover:text-stone-900"
                }`}
              >
                <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
                {effectiveCartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#D2E878] text-[#1B382B] text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {effectiveCartCount}
                  </span>
                )}
              </Link>

              {/* Auth / Account */}
              {session ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className={`flex items-center gap-1.5 p-1 rounded-full transition-colors cursor-pointer ${
                      isTransparent ? "hover:bg-white/15" : "hover:bg-stone-100"
                    }`}
                  >
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        className="w-7 h-7 rounded-full object-cover border border-white/50"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#D2E878] text-[#1B382B] flex items-center justify-center font-bold text-xs">
                        {session.user.name ? session.user.name.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-stone-200 rounded-xl shadow-xl py-1.5 z-50 text-sm text-stone-800">
                      <div className="px-4 py-2 border-b border-stone-100">
                        <p className="font-semibold text-stone-800 truncate">{session.user.name}</p>
                        <p className="text-xs text-stone-500 truncate">{session.user.email}</p>
                      </div>
                      <Link
                        href="/wishlist"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2 text-stone-700 hover:bg-stone-50"
                      >
                        My Wishlist ({wishlistCount})
                      </Link>
                      <Link
                        href="/account"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2 text-stone-700 hover:bg-stone-50"
                      >
                        My Account
                      </Link>
                      <Link
                        href="/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2 text-stone-700 hover:bg-stone-50"
                      >
                        Order History
                      </Link>
                      {session.user.role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-1.5 px-4 py-2 text-red-600 font-semibold hover:bg-red-50"
                        >
                          <Shield className="w-4 h-4" /> Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={async () => {
                          setUserDropdownOpen(false);
                          await authClient.signOut();
                          router.push("/");
                        }}
                        className="flex items-center gap-1.5 w-full text-left px-4 py-2 text-stone-700 hover:bg-stone-50 border-t border-stone-100 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all ${
                    isTransparent
                      ? "text-white bg-white/15 hover:bg-white/25 backdrop-blur-sm"
                      : "text-stone-800 bg-stone-100 hover:bg-stone-200"
                  }`}
                >
                  Log In
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`md:hidden p-2 rounded-lg transition-colors ${
                  isTransparent ? "text-white hover:bg-white/15" : "text-stone-700 hover:bg-stone-100"
                }`}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20 bg-stone-900/95 backdrop-blur-lg rounded-2xl p-4 my-2 text-white flex flex-col gap-3 shadow-2xl">
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold hover:bg-white/10 rounded-lg"
            >
              Shop
            </Link>
            <Link
              href="/wishlist"
              onClick={(e) => {
                setMobileMenuOpen(false);
                if (!session?.user) {
                  e.preventDefault();
                  router.push("/login");
                }
              }}
              className="px-3 py-2 text-sm font-semibold hover:bg-white/10 rounded-lg flex items-center justify-between"
            >
              <span>Wishlist</span>
              {wishlistCount > 0 && (
                <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link
              href="/#categories"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold hover:bg-white/10 rounded-lg"
            >
              Categories
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
