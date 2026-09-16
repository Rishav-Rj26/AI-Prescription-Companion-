"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Clock, PlusCircle, Settings, GitCompareArrows, ShieldAlert, Pill } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/lib/queries/user";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navigation = [
    { name: "Home", href: "/dashboard", icon: Home, exact: true },
    { name: "Schedule", href: "/dashboard/schedule", icon: Calendar, exact: false },
    { name: "History", href: "/dashboard/history", icon: Clock, exact: false },
    { name: "Compare", href: "/dashboard/compare", icon: GitCompareArrows, exact: false },
    { name: "Upload", href: "/dashboard/upload", icon: PlusCircle, exact: false },
    { name: "Settings", href: "/dashboard/settings", icon: Settings, exact: false },
  ];

  const { data: user } = useCurrentUser();

  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f8fa]">
      {/* Sidebar Navigation */}
      <nav className="w-64 flex-shrink-0 border-r border-[#e6ecf1] bg-white flex flex-col">
        <div className="p-5 border-b border-[#e6ecf1]">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1e4263] text-white flex items-center justify-center shadow-sm">
              <Pill className="h-5 w-5" />
            </div>
            <span className="text-[15px] font-bold text-[#1e4263] tracking-tight">
              Prescription AI
            </span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navigation.map((item) => {
              const isActive = item.exact 
                ? pathname === item.href 
                : pathname.startsWith(item.href);
                
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-medium transition-all duration-150",
                      isActive
                        ? "bg-[#ecf4fe] text-[#1e4263] font-semibold shadow-sm"
                        : "text-[#4a5866] hover:bg-[#f6f8fa] hover:text-[#1e4263]"
                    )}
                  >
                    <item.icon className={cn("h-[18px] w-[18px]", isActive ? "text-[#1e4263]" : "text-[#73777e]")} />
                    {item.name}
                  </Link>
                </li>
              );
            })}
            
            {user?.is_admin && (
              <li className="pt-4 mt-4 border-t border-[#e6ecf1]">
                <Link
                  href="/admin/dashboard"
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-medium transition-all duration-150 text-[#ba1a1a] hover:bg-[#ffdad6]/30",
                    pathname.startsWith("/admin") && "bg-[#ffdad6]/40 text-[#93000a] font-semibold"
                  )}
                >
                  <ShieldAlert className="h-[18px] w-[18px]" />
                  Admin Dashboard
                </Link>
              </li>
            )}
          </ul>
        </div>
        {/* User info footer */}
        {user && (
          <div className="p-4 border-t border-[#e6ecf1]">
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-full bg-[#ecf4fe] text-[#1e4263] flex items-center justify-center text-[13px] font-bold">
                {(user.full_name || user.email || "U").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[#192128] truncate">{user.full_name || "User"}</p>
                <p className="text-[12px] text-[#73777e] truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
