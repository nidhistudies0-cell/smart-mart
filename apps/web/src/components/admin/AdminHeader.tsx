"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, LogOut, Shield } from "lucide-react";
import { authClient } from "@/lib/auth-client";

interface AdminHeaderProps {
  admin?: { name: string; email: string; image?: string } | null;
}

export function AdminHeader({ admin }: AdminHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      router.push("/admin/login");
    } catch (err) {
      console.error(err);
    }
  };

  const navLinks = [
    { href: "/admin", label: "Dashboard", exact: true },
    { href: "/admin/orders", label: "Orders", exact: false },
    { href: "/admin/products", label: "Products", exact: false },
    { href: "/admin/management", label: "Admin Management", exact: false },
    { href: "/admin/reports", label: "Admin Reports", exact: false },
  ];

  const isLinkActive = (item: typeof navLinks[0]) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  const initials = admin?.name
    ? admin.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "A";

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2] border-b border-[#EBE4D8]/80 transition-all">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          {/* Left: Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-[#E6F0E4] flex items-center justify-center transition-transform group-hover:scale-105">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 3H5.2L7.3 14.5C7.4 15.1 7.9 15.5 8.5 15.5H18.5C19.1 15.5 19.6 15.1 19.7 14.5L21 7.5H6"
                  stroke="#1B4D36"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="9" cy="19.5" r="1.5" fill="#1B4D36" />
                <circle cx="18" cy="19.5" r="1.5" fill="#1B4D36" />
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
            <span className="text-[22px] font-bold tracking-tight text-[#14231B]">
              Smart<span className="text-[#246A44]">Mart</span>
            </span>
          </Link>

          {/* Center: Pill Navigation */}
          <nav className="flex items-center gap-1.5 sm:gap-2">
            {navLinks.map((item) => {
              const active = isLinkActive(item);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-150 ${
                    active
                      ? "bg-[#DDECDF] text-[#1B4D36] font-semibold shadow-2xs"
                      : "text-[#3D4F44] hover:text-[#14231B] hover:bg-[#EFE8DD]/70"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: User / Admin Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 py-1 px-2 rounded-full hover:bg-[#EFE8DD]/70 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#18231C] text-white flex items-center justify-center font-bold text-xs tracking-wider">
                {initials}
              </div>
              <span className="text-sm font-semibold text-[#18231C] hidden sm:inline">
                {admin?.name || "Admin"}
              </span>
              <ChevronDown className="w-4 h-4 text-[#5A6C60]" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-[#E8DFC9] rounded-2xl shadow-xl py-2 z-50">
                <div className="px-4 py-2 border-b border-[#F0EBE1]">
                  <p className="text-xs text-stone-500">Signed in as</p>
                  <p className="font-semibold text-stone-900 text-sm truncate">
                    {admin?.name || "Admin"}
                  </p>
                  <p className="text-xs text-stone-500 truncate">{admin?.email}</p>
                </div>
                <Link
                  href="/"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-xs text-stone-700 hover:bg-stone-50"
                >
                  View Customer Store
                </Link>
                <Link
                  href="/admin/orders"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-stone-700 hover:bg-stone-50"
                >
                  All Orders List
                </Link>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 border-t border-[#F0EBE1]"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
