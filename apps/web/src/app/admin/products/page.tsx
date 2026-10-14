"use client";

import React, { useState, useMemo } from "react";
import { ProductToolbar } from "@/components/store/ProductToolbar";
import { ProductFilters } from "@/components/store/ProductFilters";
import { ProductGrid } from "@/components/store/ProductGrid";
import { Pagination } from "@/components/store/Pagination";
import { ALL_PRODUCTS } from "@/data/mockStoreData";
import { Product, SortOption, ViewMode } from "@/types/store";
import { X, Filter, Package } from "lucide-react";

const ITEMS_PER_PAGE = 10;

export default function AdminProductsPage() {
  // State
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [availability, setAvailability] = useState<"all" | "in-stock" | "out-of-stock">("all");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Handle Category selection
  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  // Handle Search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...ALL_PRODUCTS];

    // Category Filter
    if (selectedCategory && selectedCategory !== "all") {
      result = result.filter(
        (p) =>
          p.categoryName?.toLowerCase() === selectedCategory.toLowerCase() ||
          String(p.categoryId) === selectedCategory
      );
    }

    // Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.productName.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.categoryName?.toLowerCase().includes(q)
      );
    }

    // Price Filter
    result = result.filter((p) => p.price <= maxPrice);

    // Availability Filter
    if (availability === "in-stock") {
      result = result.filter((p) => (p.currentStock ?? 0) > 0);
    } else if (availability === "out-of-stock") {
      result = result.filter((p) => (p.currentStock ?? 0) === 0);
    }

    // Sort Logic
    switch (sortBy) {
      case "price-low-high":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high-low":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        result.sort((a, b) => a.productName.localeCompare(b.productName));
        break;
      case "newest":
        result.sort((a, b) => b.productId - a.productId);
        break;
      case "relevance":
      default:
        break;
    }

    return result;
  }, [selectedCategory, searchQuery, maxPrice, availability, sortBy]);

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setMaxPrice(500);
    setAvailability("all");
    setSortBy("relevance");
    setCurrentPage(1);
  };

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "all") count++;
    if (maxPrice < 500) count++;
    if (availability !== "all") count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [selectedCategory, maxPrice, availability, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#14231B]">
            Products <span className="text-[#207B4A]">Catalog</span>
          </h1>
          <p className="text-sm text-[#66766B] mt-1">
            Browse and preview store products within the admin panel.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Sidebar Filters - Desktop */}
        <div className="hidden lg:block w-72 shrink-0 sticky top-24">
          <ProductFilters
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            maxPrice={maxPrice}
            onMaxPriceChange={(val) => {
              setMaxPrice(val);
              setCurrentPage(1);
            }}
            availability={availability}
            onAvailabilityChange={(val) => {
              setAvailability(val);
              setCurrentPage(1);
            }}
            sortBy={sortBy}
            onSortByChange={(val) => {
              setSortBy(val);
              setCurrentPage(1);
            }}
            onResetFilters={handleResetFilters}
          />
        </div>

        {/* Right Main Content */}
        <div className="flex-1 w-full space-y-6">
          {/* Search bar inside admin catalog */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search products in catalog..."
              className="w-full px-4 py-2.5 bg-white border border-[#EAE2D4] rounded-2xl text-xs sm:text-sm text-[#14231B] placeholder:text-[#9AA79E] focus:outline-none focus:ring-2 focus:ring-[#207B4A]/20 focus:border-[#207B4A] shadow-2xs"
            />
          </div>

          {/* Toolbar */}
          <ProductToolbar
            totalCount={filteredProducts.length}
            sortBy={sortBy}
            onSortByChange={(val: SortOption) => {
              setSortBy(val);
              setCurrentPage(1);
            }}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onOpenMobileFilters={() => setMobileFiltersOpen(true)}
            activeFilterCount={activeFiltersCount}
          />

          {/* Product Grid / List */}
          <ProductGrid
            products={paginatedProducts}
            viewMode={viewMode}
            onResetFilters={handleResetFilters}
          />

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileFiltersOpen(false)}
          />

          <div className="relative ml-auto w-full max-w-xs h-full bg-[#FAF7F2] shadow-xl flex flex-col p-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                <Filter className="w-5 h-5 text-[#1E4D38]" />
                Filters
              </h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1 rounded-full text-stone-500 hover:text-stone-800 hover:bg-stone-200/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4">
              <ProductFilters
                selectedCategory={selectedCategory}
                onSelectCategory={(cat) => {
                  handleSelectCategory(cat);
                  setMobileFiltersOpen(false);
                }}
                maxPrice={maxPrice}
                onMaxPriceChange={(val) => {
                  setMaxPrice(val);
                  setCurrentPage(1);
                }}
                availability={availability}
                onAvailabilityChange={(val) => {
                  setAvailability(val);
                  setCurrentPage(1);
                }}
                sortBy={sortBy}
                onSortByChange={(val) => {
                  setSortBy(val);
                  setCurrentPage(1);
                }}
                onResetFilters={() => {
                  handleResetFilters();
                  setMobileFiltersOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
