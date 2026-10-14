"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ShoppingCart, 
  Box, 
  Users, 
  Calendar, 
  ChevronDown, 
  TrendingUp, 
  ArrowUpRight,
  ChevronRight,
  PackageCheck,
  RotateCcw,
  BarChart3,
  FileSpreadsheet
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [salesRange, setSalesRange] = useState("Last 7 Days");
  const [todayFormatted, setTodayFormatted] = useState("15 Oct 2026");

  useEffect(() => {
    const now = new Date();
    setTodayFormatted(
      now.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    );
  }, []);

  useEffect(() => {
    fetchApi<any>("/api/reports/dashboard")
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Dashboard data load error:", err);
        setLoading(false);
      });
  }, []);

  // Real DB stats
  const totalProducts = data?.totalProducts ?? 0;
  const totalOrders = data?.totalOrders ?? 0;
  const totalCustomers = data?.totalCustomers ?? 0;
  const totalRevenue = data?.totalRevenue ? Number(data.totalRevenue).toLocaleString("en-IN") : "0";

  // Low stock products from real database
  const lowStockProducts: any[] = data?.lowStockItems && Array.isArray(data.lowStockItems)
    ? data.lowStockItems.slice(0, 5)
    : [];

  // Recent orders (from DB API)
  const recentOrders = data?.recentOrders?.length
    ? data.recentOrders.map((o: any) => ({
        id: `#${o.orderId}`,
        customer: o.customerName || "Customer",
        items: 1,
        amount: `₹${Number(o.totalAmount).toLocaleString("en-IN")}`,
        status: o.orderStatus,
        date: new Date(o.orderDate).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }),
      }))
    : [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Delivered":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#DCF2DE] text-[#1E743A]">Delivered</span>;
      case "Out for Delivery":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#FFF0D4] text-[#B07212]">Out for Delivery</span>;
      case "Processing":
      case "Confirmed":
      case "Pending":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#E1EDFF] text-[#2462BD]">Processing</span>;
      case "Cancelled":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#FFE4E4] text-[#CF2C2C]">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-stone-100 text-stone-700">{status}</span>;
    }
  };

  // Dynamic sales trend calculation for last 7 days
  const salesTrendList = data?.salesTrend ?? [];
  const salesByDate: Record<string, number> = {};
  salesTrendList.forEach((st: any) => {
    salesByDate[st.date] = Number(st.revenue || 0);
  });

  const last7Days: { dateStr: string; label: string; amount: number }[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const key = `${yyyy}-${mm}-${dd}`;
    const label = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    last7Days.push({
      dateStr: key,
      label,
      amount: salesByDate[key] || 0,
    });
  }

  const maxSale = Math.max(...last7Days.map((d) => d.amount), 500);
  const yTicks = [
    { label: `${Math.round(maxSale)}`, y: 30 },
    { label: `${Math.round(maxSale * 0.75)}`, y: 85 },
    { label: `${Math.round(maxSale * 0.5)}`, y: 140 },
    { label: `${Math.round(maxSale * 0.25)}`, y: 195 },
  ];

  const chartPoints = last7Days.map((d, index) => {
    const x = 50 + index * 82;
    const ratio = maxSale > 0 ? d.amount / maxSale : 0;
    const y = 200 - ratio * 165;
    return { x, y, label: d.label, amount: d.amount };
  });

  const svgPathD = chartPoints.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x},${pt.y}`;
    const prev = arr[i - 1];
    const cp1x = prev.x + (pt.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (pt.x - prev.x) / 2;
    const cp2y = pt.y;
    return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${pt.x},${pt.y}`;
  }, "");

  const areaPathD = `${svgPathD} L ${chartPoints[chartPoints.length - 1]?.x || 542},200 L ${chartPoints[0]?.x || 50},200 Z`;

  return (
    <div className="space-y-7">
      {/* Page Title & Date Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#14231B]">
            Admin <span className="text-[#207B4A]">Dashboard</span>
          </h1>
          <p className="text-sm text-[#66766B] mt-1">
            Overview of your store&apos;s inventory, orders and sales.
          </p>
        </div>

        {/* Date Selector Pill */}
        <div className="flex items-center gap-3 bg-white border border-[#E9E2D5] rounded-2xl px-4 py-2.5 shadow-xs self-start sm:self-auto cursor-pointer hover:border-stone-300 transition-colors">
          <Calendar className="w-4 h-4 text-[#4A5D50]" />
          <div className="flex flex-col text-left">
            <span className="text-[10px] uppercase font-bold text-[#7D8F82] tracking-wider leading-none">Today</span>
            <span className="text-xs font-semibold text-[#14231B] leading-tight">
              {todayFormatted}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-[#7D8F82] ml-1" />
        </div>
      </div>

      {/* 4 KPI Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Products */}
        <div className="bg-white rounded-3xl p-6 border border-[#EBE4D6] shadow-xs flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-[#E6F3E6] flex items-center justify-center shrink-0">
            <ShoppingCart className="w-6 h-6 text-[#207B4A]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[#66766B]">Total Products</p>
            <p className="text-2xl font-black text-[#14231B] mt-0.5">{totalProducts}</p>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#66766B]">
              <span className="flex items-center text-[#207B4A] font-semibold">
                ↑ +12%
              </span>
              <span>vs last week</span>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-3xl p-6 border border-[#EBE4D6] shadow-xs flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-[#FEEFEA] flex items-center justify-center shrink-0">
            <Box className="w-6 h-6 text-[#E45E36]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[#66766B]">Total Orders</p>
            <p className="text-2xl font-black text-[#14231B] mt-0.5">{totalOrders}</p>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#66766B]">
              <span className="flex items-center text-[#207B4A] font-semibold">
                ↑ +18%
              </span>
              <span>vs last week</span>
            </div>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white rounded-3xl p-6 border border-[#EBE4D6] shadow-xs flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-[#EBF3FE] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-[#3173DC]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[#66766B]">Total Customers</p>
            <p className="text-2xl font-black text-[#14231B] mt-0.5">{totalCustomers}</p>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#66766B]">
              <span className="flex items-center text-[#207B4A] font-semibold">
                ↑ +10%
              </span>
              <span>vs last week</span>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-3xl p-6 border border-[#EBE4D6] shadow-xs flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-[#FDEDE9] flex items-center justify-center shrink-0">
            <span className="text-2xl font-extrabold text-[#D94F3D]">₹</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[#66766B]">Total Revenue</p>
            <p className="text-2xl font-black text-[#14231B] mt-0.5">₹{totalRevenue}</p>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#66766B]">
              <span className="flex items-center text-[#207B4A] font-semibold">
                ↑ +18%
              </span>
              <span>vs last week</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Sales Overview Chart (left) & Low Stock Products (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Overview Chart */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#EBE4D6] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#14231B]">Sales Overview</h2>
            <div className="flex items-center gap-1.5 bg-[#FAF7F2] border border-[#EAE2D4] px-3 py-1.5 rounded-full text-xs font-medium text-[#4A5D50] cursor-pointer">
              <span>{salesRange}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="w-full h-56 relative pt-2">
            <svg viewBox="0 0 600 230" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#207B4A" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#207B4A" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines & Dynamic Y labels */}
              {yTicks.map((tick, i) => (
                <React.Fragment key={i}>
                  <line x1="30" y1={tick.y} x2="570" y2={tick.y} stroke="#F0EBE1" strokeWidth="1" />
                  <text x="2" y={tick.y + 4} className="text-[10px] fill-[#8B9B90]">
                    {tick.label}
                  </text>
                </React.Fragment>
              ))}

              {/* Area fill */}
              <path d={areaPathD} fill="url(#chartGradient)" />

              {/* Trend Line */}
              <path
                d={svgPathD}
                fill="none"
                stroke="#207B4A"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Points */}
              {chartPoints.map((pt, i) => (
                <g key={i}>
                  <circle cx={pt.x} cy={pt.y} r="4" fill="#207B4A" stroke="#FFFFFF" strokeWidth="2" />
                  <text x={pt.x} y="222" textAnchor="middle" className="text-[11px] fill-[#7D8F82]">
                    {pt.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#EBE4D6] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-[#14231B]">Low Stock Products</h2>
            <Link
              href="/admin/management"
              className="text-xs font-semibold text-[#207B4A] hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[#7D8F82] border-b border-[#F0EBE1] font-medium text-left">
                  <th className="pb-2.5 font-medium">Product</th>
                  <th className="pb-2.5 text-center font-medium">Current Stock</th>
                  <th className="pb-2.5 text-center font-medium">Reorder Level</th>
                  <th className="pb-2.5 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F6F2EC]">
                {lowStockProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-[#7D8F82]">
                      All products are adequately stocked.
                    </td>
                  </tr>
                ) : (
                  lowStockProducts.map((p: any, i: number) => {
                    const name = p.productName || p.name;
                    const currentStock = p.currentStock ?? p.stock;
                    const reorderLevel = p.reorderLevel ?? p.reorder;
                    const img = p.imageUrl || p.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80";

                    return (
                      <tr key={i} className="hover:bg-[#FAF7F2]/60 transition-colors">
                        <td className="py-2.5 flex items-center gap-2.5">
                          <img
                            src={img}
                            alt={name}
                            className="w-7 h-7 rounded-md object-contain bg-stone-50 border border-stone-200"
                          />
                          <span className="font-semibold text-[#14231B] truncate max-w-[140px]">{name}</span>
                        </td>
                        <td className="py-2.5 text-center font-bold text-[#D94F3D]">{currentStock}</td>
                        <td className="py-2.5 text-center text-[#5A6C60]">{reorderLevel}</td>
                        <td className="py-2.5 text-right">
                          <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-[#FCEAEA] text-[#D94F3D]">
                            Low Stock
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row 3: Recent Orders Table (left) & Quick Actions (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#EBE4D6] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#14231B]">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-[#207B4A] hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-[#7D8F82] border-b border-[#F0EBE1] font-medium">
                  <th className="pb-3 font-medium">Order ID</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 text-center font-medium">Items</th>
                  <th className="pb-3 font-medium">Total Amount</th>
                  <th className="pb-3 text-center font-medium">Status</th>
                  <th className="pb-3 text-right font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F6F2EC]">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#7D8F82]">
                      No orders placed yet.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order: any, idx: number) => (
                    <tr key={idx} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="py-3 font-bold text-[#14231B]">{order.id}</td>
                      <td className="py-3 font-medium text-[#14231B]">{order.customer}</td>
                      <td className="py-3 text-center text-[#5A6C60]">{order.items}</td>
                      <td className="py-3 font-bold text-[#14231B]">{order.amount}</td>
                      <td className="py-3 text-center">{getStatusBadge(order.status)}</td>
                      <td className="py-3 text-right text-[#7D8F82]">{order.date}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions Grid (2x2) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#EBE4D6] shadow-xs flex flex-col justify-between">
          <h2 className="text-base font-bold text-[#14231B] mb-4">Quick Actions</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Manage Products */}
            <Link
              href="/admin/management"
              className="flex items-center justify-between p-4 rounded-2xl border border-[#EDE5D6] hover:border-[#207B4A]/40 hover:bg-[#FAF7F2] transition-all group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E6F3E6] flex items-center justify-center shrink-0">
                  <PackageCheck className="w-5 h-5 text-[#207B4A]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#14231B] group-hover:text-[#207B4A]">
                    Manage Products
                  </p>
                  <p className="text-[11px] text-[#7D8F82]">Add, update or remove products</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#207B4A] group-hover:translate-x-0.5 transition-all" />
            </Link>

            {/* Update Inventory */}
            <Link
              href="/admin/management"
              className="flex items-center justify-between p-4 rounded-2xl border border-[#EDE5D6] hover:border-[#E45E36]/40 hover:bg-[#FAF7F2] transition-all group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFF2EA] flex items-center justify-center shrink-0">
                  <RotateCcw className="w-5 h-5 text-[#E45E36]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#14231B] group-hover:text-[#E45E36]">
                    Update Inventory
                  </p>
                  <p className="text-[11px] text-[#7D8F82]">Restock or modify stock levels</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#E45E36] group-hover:translate-x-0.5 transition-all" />
            </Link>

            {/* View Orders */}
            <Link
              href="/admin/orders"
              className="flex items-center justify-between p-4 rounded-2xl border border-[#EDE5D6] hover:border-[#3173DC]/40 hover:bg-[#FAF7F2] transition-all group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EBF3FE] flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-5 h-5 text-[#3173DC]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#14231B] group-hover:text-[#3173DC]">
                    View Orders
                  </p>
                  <p className="text-[11px] text-[#7D8F82]">Track and manage all orders</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#3173DC] group-hover:translate-x-0.5 transition-all" />
            </Link>

            {/* View Reports */}
            <Link
              href="/admin/reports"
              className="flex items-center justify-between p-4 rounded-2xl border border-[#EDE5D6] hover:border-[#8E44AD]/40 hover:bg-[#FAF7F2] transition-all group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F6EEFA] flex items-center justify-center shrink-0">
                  <BarChart3 className="w-5 h-5 text-[#8E44AD]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#14231B] group-hover:text-[#8E44AD]">
                    View Reports
                  </p>
                  <p className="text-[11px] text-[#7D8F82]">Sales, inventory and customer insights</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#8E44AD] group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
