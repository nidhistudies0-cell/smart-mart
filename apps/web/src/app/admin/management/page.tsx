"use client";

import React, { useEffect, useState, useMemo } from "react";
import { 
  Package, 
  AlertTriangle, 
  Layers, 
  Users, 
  Search, 
  ChevronDown, 
  Edit2, 
  Trash2, 
  Upload, 
  Check, 
  X,
  Plus
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function AdminManagementPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  // Selection
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Editing state
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    productName: "",
    categoryId: "",
    supplierId: "",
    price: "",
    currentStock: "",
    reorderLevel: "30",
    expiryDate: "",
    imageUrl: "",
    description: "",
  });

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [prods, cats, sups] = await Promise.all([
        fetchApi<any[]>("/api/products").catch(() => []),
        fetchApi<any[]>("/api/categories").catch(() => []),
        fetchApi<any[]>("/api/suppliers").catch(() => []),
      ]);

      setProducts(prods || []);
      setCategories(cats || []);
      setSuppliers(sups || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Compute KPI stats from real DB values
  const totalProductsCount = products.length;
  const lowStockCount = products.filter(
    (p) => Number(p.currentStock ?? 0) <= Number(p.reorderLevel ?? 10)
  ).length;
  const totalInventoryValue = products.reduce((acc, p) => {
    const pr = parseFloat(p.price || "0") || 0;
    const st = Number(p.currentStock ?? 0);
    return acc + pr * st;
  }, 0);
  const totalSuppliersCount = suppliers.length;

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.productName?.toLowerCase().includes(q) ||
          p.categoryName?.toLowerCase().includes(q) ||
          p.supplierName?.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== "all") {
      result = result.filter((p) => String(p.categoryId) === String(categoryFilter));
    }

    if (supplierFilter !== "all") {
      result = result.filter((p) => String(p.supplierId) === String(supplierFilter));
    }

    if (statusFilter !== "all") {
      if (statusFilter === "low-stock") {
        result = result.filter((p) => (p.currentStock ?? 0) <= (p.reorderLevel ?? 10));
      } else if (statusFilter === "in-stock") {
        result = result.filter((p) => (p.currentStock ?? 0) > (p.reorderLevel ?? 10));
      }
    }

    if (sortBy === "name") {
      result.sort((a, b) => a.productName.localeCompare(b.productName));
    } else if (sortBy === "price-asc") {
      result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else if (sortBy === "stock") {
      result.sort((a, b) => (a.currentStock ?? 0) - (b.currentStock ?? 0));
    }

    return result;
  }, [products, searchQuery, categoryFilter, supplierFilter, statusFilter, sortBy]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.productId));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const resetForm = () => {
    setFormData({
      productName: "",
      categoryId: "",
      supplierId: "",
      price: "",
      currentStock: "",
      reorderLevel: "30",
      expiryDate: "",
      imageUrl: "",
      description: "",
    });
    setEditingId(null);
  };

  const handleEditClick = (p: any) => {
    setEditingId(p.productId);
    setFormData({
      productName: p.productName || "",
      categoryId: String(p.categoryId || ""),
      supplierId: String(p.supplierId || ""),
      price: String(p.price || ""),
      currentStock: String(p.currentStock ?? "0"),
      reorderLevel: String(p.reorderLevel ?? "20"),
      expiryDate: p.expiryDate ? p.expiryDate.split("T")[0] : "",
      imageUrl: p.imageUrl || "",
      description: p.description || "",
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await fetchApi(`/api/products/${id}`, { method: "DELETE" });
      loadAllData();
    } catch (err: any) {
      alert(err.message || "Failed to delete product");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const currentStockNum = Number(formData.currentStock || 0);
      const reorderLevelNum = Number(formData.reorderLevel || 10);

      const payload = {
        productName: formData.productName,
        price: formData.price,
        categoryId: Number(formData.categoryId),
        supplierId: Number(formData.supplierId),
        initialStock: currentStockNum,
        currentStock: currentStockNum,
        reorderLevel: reorderLevelNum,
        expiryDate: formData.expiryDate || null,
        imageUrl: formData.imageUrl || null,
        description: formData.description || null,
        isActive: true,
      };

      if (editingId) {
        await fetchApi(`/api/products/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await fetchApi("/api/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      resetForm();
      loadAllData();
    } catch (err: any) {
      alert(err.message || "Operation failed");
    }
  };

  return (
    <div className="space-y-7">
      {/* Page Title & Subtitle */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#14231B]">
          Admin <span className="text-[#207B4A]">Management</span>
        </h1>
        <p className="text-sm text-[#66766B] mt-1">
          Manage products and inventory in your store. Add, update or remove products and maintain stock levels.
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Products */}
        <div className="bg-white rounded-3xl p-6 border border-[#EBE4D6] shadow-xs flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-[#E6F3E6] flex items-center justify-center shrink-0">
            <Package className="w-6 h-6 text-[#207B4A]" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#66766B]">Total Products</p>
            <p className="text-2xl font-black text-[#14231B] mt-0.5">{totalProductsCount}</p>
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="bg-white rounded-3xl p-6 border border-[#EBE4D6] shadow-xs flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-[#FEEFEA] flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-[#E45E36]" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#66766B]">Low Stock Products</p>
            <p className="text-2xl font-black text-[#14231B] mt-0.5">{lowStockCount}</p>
          </div>
        </div>

        {/* Total Inventory Value */}
        <div className="bg-white rounded-3xl p-6 border border-[#EBE4D6] shadow-xs flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-[#FEF6E9] flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6 text-[#D9822B]" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#66766B]">Total Inventory Value</p>
            <p className="text-2xl font-black text-[#14231B] mt-0.5">
              ₹{totalInventoryValue.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Total Suppliers */}
        <div className="bg-white rounded-3xl p-6 border border-[#EBE4D6] shadow-xs flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-[#EBF3FE] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-[#3173DC]" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#66766B]">Total Suppliers</p>
            <p className="text-2xl font-black text-[#14231B] mt-0.5">{totalSuppliersCount}</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Product Inventory Table (Left 7-8 cols) & Add/Edit Form (Right 4-5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Product Inventory Table */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-[#EBE4D6] shadow-xs space-y-5">
          <div>
            <h2 className="text-base font-bold text-[#14231B]">Product Inventory</h2>
            <p className="text-xs text-[#7D8F82]">View and manage all products in your store.</p>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name, category or supplier..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-[#FCFAF7] border border-[#EAE2D4] rounded-full text-[#14231B] placeholder:text-[#9AA79E] focus:outline-none focus:ring-2 focus:ring-[#207B4A]/20 focus:border-[#207B4A] transition-all"
            />
          </div>

          {/* Filter Pills row */}
          <div className="flex flex-wrap items-center justify-end gap-2 text-xs">
            {/* Category Filter */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label="Filter by category"
                className="appearance-none bg-[#FCFAF7] border border-[#EAE2D4] rounded-full px-3.5 py-1.5 pr-7 font-medium text-[#4A5D50] focus:outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.categoryId} value={c.categoryId}>
                    {c.categoryName}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Supplier Filter */}
            <div className="relative">
              <select
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                aria-label="Filter by supplier"
                className="appearance-none bg-[#FCFAF7] border border-[#EAE2D4] rounded-full px-3.5 py-1.5 pr-7 font-medium text-[#4A5D50] focus:outline-none cursor-pointer"
              >
                <option value="all">All Suppliers</option>
                {suppliers.map((s) => (
                  <option key={s.supplierId} value={s.supplierId}>
                    {s.supplierName}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by stock status"
                className="appearance-none bg-[#FCFAF7] border border-[#EAE2D4] rounded-full px-3.5 py-1.5 pr-7 font-medium text-[#4A5D50] focus:outline-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sort Filter */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort products"
                className="appearance-none bg-[#FCFAF7] border border-[#EAE2D4] rounded-full px-3.5 py-1.5 pr-7 font-medium text-[#4A5D50] focus:outline-none cursor-pointer"
              >
                <option value="name">Sort by: Name</option>
                <option value="price-asc">Sort by: Price (Low)</option>
                <option value="price-desc">Sort by: Price (High)</option>
                <option value="stock">Sort by: Stock</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-[#7D8F82] border-b border-[#F0EBE1] font-medium">
                  <th className="pb-3 w-8">
                    <input
                      type="checkbox"
                      checked={
                        filteredProducts.length > 0 &&
                        selectedIds.length === filteredProducts.length
                      }
                      onChange={toggleSelectAll}
                      aria-label="Select all products"
                      className="rounded border-[#D0C8B8] text-[#207B4A] focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="pb-3 font-medium">Product</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Supplier</th>
                  <th className="pb-3 font-medium">Price (₹)</th>
                  <th className="pb-3 text-center font-medium">Current Stock</th>
                  <th className="pb-3 text-center font-medium">Reorder Level</th>
                  <th className="pb-3 text-center font-medium">Status</th>
                  <th className="pb-3 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F6F2EC]">
                {filteredProducts.map((p) => {
                  const isLow = Number(p.currentStock ?? 0) <= Number(p.reorderLevel ?? 10);
                  const isSelected = selectedIds.includes(p.productId);

                  return (
                    <tr
                      key={p.productId}
                      className={`hover:bg-[#FAF7F2]/70 transition-colors ${
                        isSelected ? "bg-[#F3F8F3]" : ""
                      }`}
                    >
                      <td className="py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(p.productId)}
                          aria-label={`Select product ${p.productName}`}
                          className="rounded border-[#D0C8B8] text-[#207B4A] focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={
                              p.imageUrl ||
                              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80"
                            }
                            alt={p.productName}
                            className="w-8 h-8 rounded-md object-contain bg-stone-50 border border-stone-200"
                          />
                          <div>
                            <p className="font-semibold text-[#14231B] max-w-[140px] truncate">
                              {p.productName}
                            </p>
                            {p.packageSize && (
                              <p className="text-[10px] text-[#7D8F82]">{p.packageSize}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 font-medium text-[#4A5D50]">
                        {p.categoryName || "Grains"}
                      </td>
                      <td className="py-3 font-medium text-[#4A5D50]">
                        {p.supplierName || "Default Supplier"}
                      </td>
                      <td className="py-3 font-bold text-[#14231B]">
                        {parseFloat(p.price || "0")}
                      </td>
                      <td
                        className={`py-3 text-center font-bold ${
                          isLow ? "text-[#D94F3D]" : "text-[#14231B]"
                        }`}
                      >
                        {p.currentStock ?? 0}
                      </td>
                      <td className="py-3 text-center text-[#5A6C60]">
                        {p.reorderLevel ?? 10}
                      </td>
                      <td className="py-3 text-center">
                        {isLow ? (
                          <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-[#FCEAEA] text-[#D94F3D]">
                            Low Stock
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-[#DCF2DE] text-[#1E743A]">
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(p)}
                            title="Edit Product"
                            className="p-1 rounded-md text-[#5A6C60] hover:text-[#207B4A] hover:bg-[#EAE2D4]/50 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.productId)}
                            title="Delete Product"
                            className="p-1 rounded-md text-[#D94F3D] hover:bg-[#FCEAEA] transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-[#7D8F82]">
                      No products match your search or filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Add / Edit Product Form Panel */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#EBE4D6] shadow-xs">
          <div className="mb-4">
            <h2 className="text-base font-bold text-[#14231B]">
              {editingId ? "Edit Product" : "Add New Product"}
            </h2>
            <p className="text-xs text-[#7D8F82]">
              {editingId
                ? "Update product details and stock level."
                : "Enter product details to add to inventory."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {/* Product Name */}
            <div>
              <label className="block font-semibold text-[#14231B] mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                placeholder="Enter product name"
                className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#EAE2D4] rounded-xl text-[#14231B] placeholder:text-[#9AA79E] focus:outline-none focus:ring-2 focus:ring-[#207B4A]/20 focus:border-[#207B4A]"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block font-semibold text-[#14231B] mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full appearance-none px-3 py-2 bg-[#FCFAF7] border border-[#EAE2D4] rounded-xl text-[#14231B] focus:outline-none focus:ring-2 focus:ring-[#207B4A]/20 focus:border-[#207B4A] cursor-pointer"
                >
                  <option value="" disabled>Select category</option>
                  {categories.map((c) => (
                    <option key={c.categoryId} value={c.categoryId}>
                      {c.categoryName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Supplier */}
            <div>
              <label className="block font-semibold text-[#14231B] mb-1">
                Supplier <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  required
                  value={formData.supplierId}
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                  className="w-full appearance-none px-3 py-2 bg-[#FCFAF7] border border-[#EAE2D4] rounded-xl text-[#14231B] focus:outline-none focus:ring-2 focus:ring-[#207B4A]/20 focus:border-[#207B4A] cursor-pointer"
                >
                  <option value="" disabled>Select supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.supplierId} value={s.supplierId}>
                      {s.supplierName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block font-semibold text-[#14231B] mb-1">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="Enter price"
                className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#EAE2D4] rounded-xl text-[#14231B] placeholder:text-[#9AA79E] focus:outline-none focus:ring-2 focus:ring-[#207B4A]/20 focus:border-[#207B4A]"
              />
            </div>

            {/* Current Stock */}
            <div>
              <label className="block font-semibold text-[#14231B] mb-1">
                Current Stock <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                placeholder="Enter current stock"
                className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#EAE2D4] rounded-xl text-[#14231B] placeholder:text-[#9AA79E] focus:outline-none focus:ring-2 focus:ring-[#207B4A]/20 focus:border-[#207B4A]"
              />
            </div>

            {/* Reorder Level */}
            <div>
              <label className="block font-semibold text-[#14231B] mb-1">
                Reorder Level <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                value={formData.reorderLevel}
                onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                placeholder="Enter reorder level"
                className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#EAE2D4] rounded-xl text-[#14231B] placeholder:text-[#9AA79E] focus:outline-none focus:ring-2 focus:ring-[#207B4A]/20 focus:border-[#207B4A]"
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block font-semibold text-[#14231B] mb-1">Expiry Date</label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#EAE2D4] rounded-xl text-[#14231B] focus:outline-none focus:ring-2 focus:ring-[#207B4A]/20 focus:border-[#207B4A]"
              />
            </div>

            {/* Product Image Upload Box */}
            <div>
              <label className="block font-semibold text-[#14231B] mb-1">Product Image</label>
              <div className="border border-dashed border-[#D2C8B8] rounded-2xl p-4 bg-[#FCFAF7] flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-[#F8F4EE] transition-colors">
                <Upload className="w-5 h-5 text-stone-400" />
                <span className="font-semibold text-stone-800 text-[11px]">Upload image</span>
                <span className="text-[10px] text-stone-400">PNG, JPG up to 5MB</span>
              </div>
              <input
                type="text"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="Or paste image URL"
                className="w-full mt-2 px-3 py-1.5 bg-[#FCFAF7] border border-[#EAE2D4] rounded-xl text-[#14231B] text-[11px] placeholder:text-[#9AA79E] focus:outline-none focus:ring-2 focus:ring-[#207B4A]/20 focus:border-[#207B4A]"
              />
            </div>

            {/* Buttons */}
            <div className="pt-2 flex items-center gap-2">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-2.5 rounded-xl border border-[#D2C8B8] font-bold text-[#5A6C60] hover:bg-stone-100 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#207B4A] hover:bg-[#18643B] text-white font-bold transition-colors shadow-xs"
              >
                {editingId ? "Update Product" : "Add Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
