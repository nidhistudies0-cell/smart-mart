"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Calendar, 
  ChevronDown, 
  Box, 
  Users, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag 
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function AdminReportsPage() {
  const [data, setData] = useState<any>(null);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("Last 30 Days");

  useEffect(() => {
    Promise.all([
      fetchApi<any>("/api/reports/dashboard").catch(() => null),
      fetchApi<any[]>("/api/reports/sales").catch(() => []),
    ])
      .then(([dash, sales]) => {
        setData(dash);
        setSalesData(sales || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const rawRevenue = Number(data?.totalRevenue ?? 0);
  const totalRevenue = rawRevenue.toLocaleString("en-IN");
  const totalOrders = data?.totalOrders ?? 0;
  const totalCustomers = data?.totalCustomers ?? 0;
  const averageOrderValue = totalOrders > 0 ? Math.round(rawRevenue / totalOrders) : 0;

  // Real Category distribution data from DB
  const categoryPalette = ["#207B4A", "#3173DC", "#E59E28", "#E45E36", "#C0392B", "#8E44AD", "#16A085"];
  const dbCategorySales: any[] = data?.categorySales ?? [];
  const totalCatRevenue = dbCategorySales.reduce((acc, c) => acc + Number(c.totalRevenue || 0), 0);
  
  const categorySales = dbCategorySales.length > 0
    ? dbCategorySales.map((c, i) => {
        const amt = Number(c.totalRevenue || 0);
        const pct = totalCatRevenue > 0 ? Math.round((amt / totalCatRevenue) * 100) : 0;
        return {
          name: c.categoryName || "Other",
          amount: amt.toLocaleString("en-IN"),
          rawAmount: amt,
          pct,
          color: categoryPalette[i % categoryPalette.length],
        };
      })
    : [];

  // Real Order status distribution from DB
  const statusColorMap: Record<string, string> = {
    Delivered: "#207B4A",
    Shipped: "#3173DC",
    Confirmed: "#E59E28",
    Pending: "#8E44AD",
    Cancelled: "#CF2C2C",
  };
  const dbStatuses: any[] = data?.ordersByStatus ?? [];
  const totalDbStatusOrders = dbStatuses.reduce((acc, s) => acc + Number(s.count || 0), 0);
  const orderStatuses = dbStatuses.length > 0
    ? dbStatuses.map((st) => {
        const count = Number(st.count || 0);
        const pct = totalDbStatusOrders > 0 ? Math.round((count / totalDbStatusOrders) * 100) : 0;
        return {
          name: st.status,
          count,
          pct,
          color: statusColorMap[st.status] || "#7D8F82",
        };
      })
    : [];

  // Real Top selling products from DB
  const topProducts: any[] = (data?.topProducts ?? []).map((p: any, idx: number) => ({
    rank: idx + 1,
    name: p.productName,
    category: p.categoryName,
    units: Number(p.unitsSold || 0),
    revenue: `₹${Number(p.revenue || 0).toLocaleString("en-IN")}`,
    image: p.imageUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80",
  }));

  // Sales Trend line generation (Last 7 days dynamically)
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

  // Calculate coordinates for 7 days
  const maxSale = Math.max(...last7Days.map((d) => d.amount), 500);
  const yTicks = [
    { label: `${Math.round(maxSale)}`, y: 30 },
    { label: `${Math.round(maxSale * 0.75)}`, y: 85 },
    { label: `${Math.round(maxSale * 0.5)}`, y: 140 },
    { label: `${Math.round(maxSale * 0.25)}`, y: 195 },
  ];

  const trendPoints = last7Days.map((d, index) => {
    const x = 50 + index * 82; // spread across 50 to 542
    // Map amount 0 -> y=200, maxSale -> y=35
    const ratio = maxSale > 0 ? d.amount / maxSale : 0;
    const y = 200 - ratio * 165;
    return { x, y, label: d.label, amount: d.amount };
  });

  const trendSvgPathD = trendPoints.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x},${pt.y}`;
    const prev = arr[i - 1];
    const cp1x = prev.x + (pt.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (pt.x - prev.x) / 2;
    const cp2y = pt.y;
    return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${pt.x},${pt.y}`;
  }, "");

  const trendAreaPathD = `${trendSvgPathD} L ${trendPoints[trendPoints.length - 1]?.x || 542},200 L ${trendPoints[0]?.x || 50},200 Z`;

  // Recent Orders table from real database query
  const recentOrders = data?.recentOrders && data.recentOrders.length > 0
    ? data.recentOrders.map((o: any) => ({
        id: `#${o.orderId}`,
        customer: o.customerName || "Customer",
        amount: Number(o.totalAmount).toLocaleString("en-IN"),
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
      case "Shipped":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#FFF0D4] text-[#B07212]">{status}</span>;
      case "Processing":
      case "Confirmed":
      case "Pending":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#E1EDFF] text-[#2462BD]">{status}</span>;
      case "Cancelled":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#FFE4E4] text-[#CF2C2C]">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-stone-100 text-stone-700">{status}</span>;
    }
  };

  // Helper for donut chart SVG path arcs
  const createDonutSegments = (items: { pct: number; color: string }[], radius: number, strokeWidth: number) => {
    if (!items || items.length === 0) {
      return (
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="transparent"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />
      );
    }
    const circumference = 2 * Math.PI * radius;
    let accumulatedOffset = 0;

    return items.map((item, idx) => {
      const strokeDasharray = `${(item.pct / 100) * circumference} ${circumference}`;
      const strokeDashoffset = -accumulatedOffset;
      accumulatedOffset += (item.pct / 100) * circumference;

      return (
        <circle
          key={idx}
          cx="80"
          cy="80"
          r={radius}
          fill="transparent"
          stroke={item.color}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 80 80)"
        />
      );
    });
  };

  return (
    <div className="space-y-7">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#14231B]">
            Reports &amp; <span className="text-[#207B4A]">Analytics</span>
          </h1>
          <p className="text-sm text-[#66766B] mt-1">
            Get insights into your store&apos;s sales, inventory and customer activity.
          </p>
        </div>

        {/* Date Selector Pill */}
        <div className="flex items-center gap-3 bg-white border border-[#E9E2D5] rounded-2xl px-4 py-2.5 shadow-xs self-start sm:self-auto cursor-pointer hover:border-stone-300 transition-colors">
          <Calendar className="w-4 h-4 text-[#4A5D50]" />
          <span className="text-xs font-semibold text-[#14231B]">{timeRange}</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#7D8F82] ml-1" />
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-white rounded-3xl p-6 border border-[#EBE4D6] shadow-xs flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-[#E6F3E6] flex items-center justify-center shrink-0">
            <span className="text-2xl font-black text-[#207B4A]">₹</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[#66766B]">Total Revenue</p>
            <p className="text-2xl font-black text-[#14231B] mt-0.5">₹{totalRevenue}</p>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#66766B]">
              <span className="flex items-center text-[#207B4A] font-semibold">
                ↑ 18%
              </span>
              <span>vs previous month</span>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-3xl p-6 border border-[#EBE4D6] shadow-xs flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-[#EBF3FE] flex items-center justify-center shrink-0">
            <Box className="w-6 h-6 text-[#3173DC]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[#66766B]">Total Orders</p>
            <p className="text-2xl font-black text-[#14231B] mt-0.5">{totalOrders}</p>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#66766B]">
              <span className="flex items-center text-[#207B4A] font-semibold">
                ↑ 12%
              </span>
              <span>vs previous month</span>
            </div>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white rounded-3xl p-6 border border-[#EBE4D6] shadow-xs flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-[#FEEFEA] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-[#E45E36]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[#66766B]">Total Customers</p>
            <p className="text-2xl font-black text-[#14231B] mt-0.5">{totalCustomers}</p>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#66766B]">
              <span className="flex items-center text-[#207B4A] font-semibold">
                ↑ 10%
              </span>
              <span>vs previous month</span>
            </div>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white rounded-3xl p-6 border border-[#EBE4D6] shadow-xs flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-[#FEF6E9] flex items-center justify-center shrink-0">
            <Box className="w-6 h-6 text-[#D9822B]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[#66766B]">Average Order Value</p>
            <p className="text-2xl font-black text-[#14231B] mt-0.5">₹{averageOrderValue}</p>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#66766B]">
              <span className="flex items-center text-[#207B4A] font-semibold">
                ↑ 8%
              </span>
              <span>vs previous month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Sales Trend (Left 7 cols) & Category-wise Sales Donut (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Trend Line Chart */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#EBE4D6] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[#14231B]">Sales Trend</h2>
              <p className="text-xs text-[#7D8F82]">Total revenue for the last 7 days.</p>
            </div>
            <div className="flex items-center gap-1.5 bg-[#FAF7F2] border border-[#EAE2D4] px-3 py-1.5 rounded-full text-xs font-medium text-[#4A5D50] cursor-pointer">
              <span>Last 7 Days</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="w-full h-56 relative pt-2">
            <svg viewBox="0 0 600 230" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#207B4A" stopOpacity="0.22" />
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

              <path
                d={trendAreaPathD}
                fill="url(#trendGradient)"
              />
              <path
                d={trendSvgPathD}
                fill="none"
                stroke="#207B4A"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {trendPoints.map((pt, i) => (
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

        {/* Category-wise Sales (Donut + Legend) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#EBE4D6] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-base font-bold text-[#14231B]">Category-wise Sales</h2>
              <p className="text-xs text-[#7D8F82]">Sales distribution across product categories.</p>
            </div>
            <div className="flex items-center gap-1.5 bg-[#FAF7F2] border border-[#EAE2D4] px-3 py-1.5 rounded-full text-xs font-medium text-[#4A5D50] cursor-pointer">
              <span>Last 30 Days</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
            {/* Donut SVG */}
            <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 160 160" className="w-full h-full">
                {createDonutSegments(categorySales, 55, 22)}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-bold text-[#14231B]">₹{totalCatRevenue.toLocaleString("en-IN")}</span>
                <span className="text-[10px] text-[#7D8F82]">Total Sales</span>
              </div>
            </div>

            {/* Legend list */}
            <div className="flex-1 w-full space-y-2 text-xs">
              {categorySales.length === 0 ? (
                <p className="text-[#7D8F82] text-xs">No category sales recorded yet.</p>
              ) : (
                categorySales.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-medium text-[#4A5D50]">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold text-[#14231B]">
                      <span>₹{cat.amount}</span>
                      <span className="text-[#7D8F82] font-normal text-[11px]">({cat.pct}%)</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Top Selling Products (Left 7 cols) & Order Status Overview + Recent Orders (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Selling Products Table */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#EBE4D6] shadow-xs">
          <div className="mb-4">
            <h2 className="text-base font-bold text-[#14231B]">Top Selling Products</h2>
            <p className="text-xs text-[#7D8F82]">Products with highest units sold.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-[#7D8F82] border-b border-[#F0EBE1] font-medium">
                  <th className="pb-3 w-8">#</th>
                  <th className="pb-3 font-medium">Product</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 text-center font-medium">Units Sold</th>
                  <th className="pb-3 text-right font-medium">Revenue (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F6F2EC]">
                {topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-[#7D8F82]">
                      No product sales recorded yet.
                    </td>
                  </tr>
                ) : (
                  topProducts.map((p) => (
                    <tr key={p.rank} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="py-3 font-bold text-[#7D8F82]">{p.rank}.</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-8 h-8 rounded-md object-contain bg-stone-50 border border-stone-200"
                          />
                          <span className="font-semibold text-[#14231B]">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-3 font-medium text-[#4A5D50]">{p.category}</td>
                      <td className="py-3 text-center font-bold text-[#14231B]">{p.units}</td>
                      <td className="py-3 text-right font-bold text-[#14231B]">{p.revenue}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right side: Order Status Overview + Recent Orders */}
        <div className="lg:col-span-5 space-y-6">
          {/* Order Status Donut Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#EBE4D6] shadow-xs">
            <div className="mb-3">
              <h2 className="text-base font-bold text-[#14231B]">Order Status Overview</h2>
              <p className="text-xs text-[#7D8F82]">Distribution of order statuses.</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
              <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 160 160" className="w-full h-full">
                  {createDonutSegments(orderStatuses, 52, 20)}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-base font-extrabold text-[#14231B]">{totalDbStatusOrders}</span>
                  <span className="text-[10px] text-[#7D8F82]">Total Orders</span>
                </div>
              </div>

              <div className="flex-1 w-full space-y-2 text-xs">
                {orderStatuses.length === 0 ? (
                  <p className="text-[#7D8F82] text-xs">No orders recorded yet.</p>
                ) : (
                  orderStatuses.map((st) => (
                    <div key={st.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: st.color }}
                        />
                        <span className="font-medium text-[#4A5D50]">{st.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-bold text-[#14231B]">
                        <span>{st.count}</span>
                        <span className="text-[#7D8F82] font-normal text-[11px]">({st.pct}%)</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recent Orders small table */}
          <div className="bg-white rounded-3xl p-6 border border-[#EBE4D6] shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-[#14231B]">Recent Orders</h2>
              <Link href="/admin/orders" className="text-xs font-semibold text-[#207B4A] hover:underline">
                View All
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-[#7D8F82] border-b border-[#F0EBE1] font-medium">
                    <th className="pb-2 font-medium">Order ID</th>
                    <th className="pb-2 font-medium">Customer</th>
                    <th className="pb-2 font-medium">Amount (₹)</th>
                    <th className="pb-2 text-center font-medium">Status</th>
                    <th className="pb-2 text-right font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F6F2EC]">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-[#7D8F82]">
                        No orders recorded yet.
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((ord: any, idx: number) => (
                      <tr key={idx} className="hover:bg-[#FAF7F2]/60 transition-colors">
                        <td className="py-2.5 font-bold text-[#14231B]">{ord.id}</td>
                        <td className="py-2.5 font-medium text-[#14231B]">{ord.customer}</td>
                        <td className="py-2.5 font-bold text-[#14231B]">{ord.amount}</td>
                        <td className="py-2.5 text-center">{getStatusBadge(ord.status)}</td>
                        <td className="py-2.5 text-right text-[#7D8F82]">{ord.date}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
