"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ShieldAlert, ArrowLeft, LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [admin, setAdmin] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    // If on the login page, don't check /api/admin/me
    if (pathname === "/admin/login") {
      setLoading(false);
      return;
    }

    fetchApi<any>("/api/admin/me")
      .then((data) => {
        setAdmin(data);
        setAccessDenied(false);
        setLoading(false);
      })
      .catch((err: any) => {
        setLoading(false);
        // If logged in as customer or forbidden (status 403)
        if (err.status === 403 || (session && session.user.role !== "admin")) {
          setAccessDenied(true);
        } else {
          // Not logged in at all -> redirect to login with admin role selected
          router.push(`/admin/login?next=${encodeURIComponent(pathname)}&role=admin`);
        }
      });
  }, [router, pathname, session]);

  // If on the login page, render plain without admin header
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Access Denied Screen for non-admin users
  if (accessDenied) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-[32px] border border-[#EBE4D6] shadow-sm p-8 sm:p-10 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#FEEFEA] text-[#E45E36] flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-[#14231B] tracking-tight">
              Access Restricted
            </h1>
            <p className="text-xs sm:text-sm text-[#66766B] leading-relaxed">
              You are currently logged in as{" "}
              <span className="font-semibold text-[#14231B]">
                {session?.user.email || "a standard customer"}
              </span>
              . Only authorized store administrators can access this section.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <Link
              href="/"
              className="w-full py-3 bg-[#207B4A] hover:bg-[#18643B] text-white text-xs sm:text-sm font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Customer Store
            </Link>

            <button
              onClick={async () => {
                await authClient.signOut();
                router.push("/admin/login?role=admin");
              }}
              className="w-full py-2.5 bg-white border border-[#EAE2D4] hover:bg-[#FAF7F2] text-xs font-semibold text-[#C52B2B] rounded-2xl flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Switch Account / Sign In as Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading && !admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] text-[#4A5D52]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#207B4A] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading SmartMart Admin...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#14231B] flex flex-col font-sans">
      <AdminHeader admin={admin} />
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
