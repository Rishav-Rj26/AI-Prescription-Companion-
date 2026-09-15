"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Clock, PlusCircle, Settings, GitCompareArrows } from "lucide-react";
import { cn } from "@/lib/utils";

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

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50/50">
      {/* Sidebar Navigation */}
      <nav className="w-64 flex-shrink-0 border-r bg-white flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-indigo-600">Prescription AI</h1>
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
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", isActive ? "text-indigo-600" : "text-gray-400")} />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
