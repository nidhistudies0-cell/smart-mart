"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, ShoppingBag, Menu, X, ChevronDown, LogOut, Shield, ArrowRight } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useCart } from "@/context/CartContext";
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
  const { totalCount, clearCart } = useCart();
  const effectiveCartCount = cartCount !== undefined ? cartCount : totalCount;
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const activeSearchQuery = controlledSearchQuery !== undefined ? controlledSearchQuery : localSearchQuery;

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
    setIsSearchOpen(false);

    if (activeSearchQuery.trim()) {
      if (pathname.startsWith("/products") && onSearch) {
        onSearch(activeSearchQuery.trim());
      } else {
        router.push(`/products?search=${encodeURIComponent(activeSearchQuery.trim())}`);
      }
    }
  };

  const handleSearchChange = (val: string) => {
    setLocalSearchQuery(val);
    setIsSearchOpen(true);
    if (pathname.startsWith("/products") && onSearch) {
      onSearch(val);
    }
  };

  const isHome = pathname === "/";
  const isProducts = pathname.startsWith("/products");

  return (
    <header className="sticky top-0 z-50 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#EDE6DC]/70 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-[#E7F2E4] flex items-center justify-center text-[#1E4D38] transition-transform group-hover:scale-105 shadow-xs">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-[#1E4D38]"
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

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1.5">
            <Link
              href="/"
              className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                isHome
                  ? "bg-[#E5EFE2] text-[#1E4D38]"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100/70"
              }`}
            >
              Home
            </Link>
            <Link
              href="/products"
              className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                isProducts
                  ? "bg-[#E5EFE2] text-[#1E4D38]"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100/70"
              }`}
            >
              Products
            </Link>
            <Link
              href="/#about"
              className="px-4 py-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 rounded-full hover:bg-stone-100/70 transition-colors"
            >
              About
            </Link>
            <Link
              href="/#contact"
              className="px-4 py-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 rounded-full hover:bg-stone-100/70 transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Search Bar with Autocomplete Suggestions */}
          <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-md relative mx-2">
            <form
              onSubmit={handleSearchSubmit}
              className="w-full relative"
            >
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={activeSearchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search for groceries, beverages, household items..."
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-[#FCFAF7] border border-stone-200/90 rounded-full placeholder:text-stone-400 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#286345]/20 focus:border-[#286345] transition-all shadow-2xs"
              />
            </form>

            {/* Live Suggestions Dropdown */}
            {isSearchOpen && activeSearchQuery.trim().length >= 1 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-stone-200/80 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                {searchSuggestions.length > 0 ? (
                  <div className="py-2">
                    <div className="px-3.5 py-1.5 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                      Matching Products
                    </div>
                    {searchSuggestions.map((prod) => (
                      <Link
                        key={prod.productId}
                        href={`/products/${prod.productId}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-[#FAF7F2] transition-colors group"
                      >
                        <img
                          src={prod.imageUrl}
                          alt={prod.productName}
                          className="w-9 h-9 rounded-lg object-cover bg-stone-100 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-stone-800 truncate group-hover:text-[#1E4D38]">
                            {prod.productName}
                          </p>
                          <p className="text-[11px] text-stone-500">
                            ₹{prod.price} {prod.packageSize ? `• ${prod.packageSize}` : ""}
                          </p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ))}
                    <div className="border-t border-stone-100 mt-1 pt-1.5 px-3.5 pb-1">
                      <button
                        type="button"
                        onClick={() => handleSearchSubmit()}
                        className="w-full text-left text-xs font-semibold text-[#1E4D38] hover:underline flex items-center justify-between"
                      >
                        <span>See all results for &ldquo;{activeSearchQuery}&rdquo;</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 px-4 text-center">
                    <p className="text-xs text-stone-500 font-medium">
                      No products found matching &ldquo;{activeSearchQuery}&rdquo;
                    </p>
                    <button
                      type="button"
                      onClick={() => handleSearchSubmit()}
                      className="mt-2 text-xs font-semibold text-[#1E4D38] hover:underline"
                    >
                      Search in catalog anyway
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Actions: Cart, User Profile / Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cart Button */}
            <Link
              href="/cart"
              onClick={onCartClick}
              aria-label={`Shopping Cart with ${effectiveCartCount} items`}
              className="relative p-2.5 rounded-full hover:bg-stone-100 text-stone-700 hover:text-stone-900 transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5 text-stone-700" />
              {effectiveCartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#1E4D38] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {effectiveCartCount}
                </span>
              )}
            </Link>

            {/* Auth Dropdown or Login Button */}
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-stone-200/90 shadow-2xs cursor-pointer hover:border-stone-300 transition-colors"
                >
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="w-7 h-7 rounded-full object-cover border border-stone-200"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#E5EFE2] text-[#1E4D38] flex items-center justify-center font-bold text-xs">
                      {session.user.name ? session.user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                  <span className="text-xs sm:text-sm font-semibold text-stone-800">
                    Hi, {session.user.name?.split(" ")[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-stone-200 rounded-xl shadow-lg py-1.5 z-50 text-sm">
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="font-semibold text-stone-800 truncate">{session.user.name}</p>
                      <p className="text-xs text-stone-500 truncate">{session.user.email}</p>
                    </div>
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
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-stone-700 bg-[#F1ECE3] hover:bg-[#E8E1D5] rounded-full transition-colors"
                >
                  Log In
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-stone-700 hover:bg-stone-100 transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Row */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={activeSearchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search groceries..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-[#FCFAF7] border border-stone-200/90 rounded-full text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#286345]/20 focus:border-[#286345]"
            />
          </form>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-stone-200/60 flex flex-col gap-2 bg-[#FAF7F2]">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                isHome ? "bg-[#E5EFE2] text-[#1E4D38]" : "text-stone-700 hover:bg-stone-100"
              }`}
            >
              Home
            </Link>
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                isProducts ? "bg-[#E5EFE2] text-[#1E4D38]" : "text-stone-700 hover:bg-stone-100"
              }`}
            >
              Products
            </Link>
            <Link
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-100"
            >
              About
            </Link>
            <Link
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-100"
            >
              Contact
            </Link>
            <div className="pt-2 flex flex-col gap-2 sm:hidden border-t border-stone-200/50 mt-2">
              {session ? (
                <>
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 text-sm font-semibold text-stone-800"
                  >
                    My Account ({session.user.name})
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 text-sm font-semibold text-stone-800"
                  >
                    Order History
                  </Link>
                  {session.user.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-2 text-sm font-semibold text-red-600"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      await authClient.signOut();
                      router.push("/");
                    }}
                    className="text-left px-4 py-2 text-sm font-medium text-stone-600 cursor-pointer"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-semibold text-white bg-[#1E4D38] rounded-full shadow-xs"
                >
                  Log In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
