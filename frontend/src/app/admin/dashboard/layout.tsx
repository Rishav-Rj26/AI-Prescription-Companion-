import { ReactNode } from "react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-red-600 text-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Admin Panel - Reliability Dashboard</h1>
        <Link href="/dashboard" className="text-sm underline hover:text-red-100">Back to App</Link>
      </header>
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
