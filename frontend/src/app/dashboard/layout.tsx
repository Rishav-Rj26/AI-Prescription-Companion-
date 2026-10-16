"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CircleHelp, Clock3, FileText, LayoutDashboard, LogOut, Menu, Pill, Plus, Scale, Settings, ShieldCheck, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/lib/queries/user";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

const navigation = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/history", label: "Prescriptions", icon: FileText },
  { href: "/dashboard/schedule", label: "Schedule", icon: Clock3 },
  { href: "/dashboard/compare", label: "Compare", icon: Scale },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function initials(name?: string | null, email?: string) {
  const source = name?.trim() || email?.split("@")[0] || "Account";
  return source.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [sessionState, setSessionState] = useState<"checking" | "authenticated" | "anonymous">("checking");
  const { data: user, isLoading } = useCurrentUser(sessionState === "authenticated");

  useEffect(() => {
    let active = true;
    api.get("/auth/me")
      .then(() => active && setSessionState("authenticated"))
      .catch(() => active && setSessionState("anonymous"));
    const sessionExpired = () => setSessionState("anonymous");
    window.addEventListener("authentication-expired", sessionExpired);
    return () => {
      active = false;
      window.removeEventListener("authentication-expired", sessionExpired);
    };
  }, []);

  useEffect(() => {
    if (sessionState === "anonymous") router.replace("/login");
  }, [router, sessionState]);

  const signOut = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setSessionState("anonymous");
    }
    queryClient.clear();
  };

  const navLinkClass = (active: boolean) =>
    `inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${active ? "bg-primary-container text-white" : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary"}`;

  if (sessionState !== "authenticated") {
    return <div className="grid min-h-screen place-items-center bg-background text-sm text-on-surface-variant" role="status">Checking your session…</div>;
  }

  return (
    <div className="min-h-screen bg-background text-on-surface antialiased selection:bg-primary-fixed selection:text-primary">
      <header className="sticky top-0 z-40 border-b border-outline-variant bg-surface-container-lowest/95 backdrop-blur">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 md:px-space-xl">
          <div className="flex min-w-0 items-center gap-3 lg:gap-7">
            <Link href="/dashboard" className="flex shrink-0 items-center gap-2 rounded-xl text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary-container text-white shadow-sm"><Pill className="size-5" aria-hidden="true" /></span>
              <span className="hidden font-headline-sm text-headline-sm font-bold tracking-tight sm:inline">Prescription Companion</span>
            </Link>
            <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
              {navigation.map((item) => {
                const active = isActive(pathname, item.href, item.exact);
                return <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} aria-current={active ? "page" : undefined} className={navLinkClass(active)}>{item.label}</Link>;
              })}
            </nav>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3">
            <Link href="/dashboard/upload" className="hidden sm:inline-flex"><Button className="h-10 gap-2 rounded-xl bg-primary text-on-primary hover:bg-primary-container"><Plus className="size-4" aria-hidden="true" />Upload</Button></Link>
            <button type="button" onClick={() => setHelpOpen((open) => !open)} aria-expanded={helpOpen} aria-controls="care-guidance" className="rounded-xl p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" title="Medication safety guidance"><CircleHelp className="size-5" aria-hidden="true" /><span className="sr-only">Medication safety guidance</span></button>
            <Link href="/dashboard/settings" aria-label="Open account settings" className="hidden items-center gap-2 rounded-xl p-1.5 transition-colors hover:bg-surface-container-low sm:flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-on-secondary text-sm font-bold">{isLoading ? "…" : initials(user?.full_name, user?.email)}</span>
              <span className="hidden max-w-36 text-left md:flex md:flex-col"><span className="truncate text-sm font-bold text-on-surface">{isLoading ? "Loading account" : user?.full_name || "Your account"}</span><span className="text-xs text-on-surface-variant">Settings</span></span>
            </Link>
            <button type="button" onClick={signOut} className="hidden rounded-xl p-2 text-on-surface-variant transition-colors hover:bg-error-container hover:text-on-error-container md:inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error" title="Sign out"><LogOut className="size-5" aria-hidden="true" /><span className="sr-only">Sign out</span></button>
            <button type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="mobile-navigation" className="rounded-xl p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">{menuOpen ? <X className="size-6" aria-hidden="true" /> : <Menu className="size-6" aria-hidden="true" />}<span className="sr-only">{menuOpen ? "Close navigation" : "Open navigation"}</span></button>
          </div>
        </div>
        {menuOpen && <nav id="mobile-navigation" className="border-t border-outline-variant bg-surface-container-lowest px-4 py-3 lg:hidden" aria-label="Mobile navigation"><div className="mx-auto grid max-w-7xl gap-1">{navigation.map((item) => { const active = isActive(pathname, item.href, item.exact); const Icon = item.icon; return <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} aria-current={active ? "page" : undefined} className={navLinkClass(active)}><Icon className="size-4" aria-hidden="true" />{item.label}</Link>; })}<Link href="/dashboard/upload" onClick={() => setMenuOpen(false)} className={navLinkClass(false)}><Plus className="size-4" aria-hidden="true" />Upload prescription</Link><button type="button" onClick={signOut} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-error transition-colors hover:bg-error-container"><LogOut className="size-4" aria-hidden="true" />Sign out</button></div></nav>}
      </header>
      {helpOpen && <aside id="care-guidance" className="border-b border-[#F5D59A] bg-[#FEF7EA] px-4 py-3" aria-label="Medication safety guidance"><div className="mx-auto flex max-w-7xl items-start gap-3 text-sm text-[#78350F]"><ShieldCheck className="mt-0.5 size-5 shrink-0" aria-hidden="true" /><p><strong>Medication safety:</strong> This tool organizes prescription information; it does not diagnose or replace a clinician. For a suspected overdose, severe reaction, or emergency, contact local emergency services. For medication questions, confirm with your pharmacist or prescriber.</p></div></aside>}
      <main className="w-full">{children}</main>
      <footer className="mt-12 border-t border-outline-variant bg-surface-container-lowest px-6 py-7 text-center text-sm text-on-surface-variant"><p>AI Prescription Companion helps you review prescription details — always confirm treatment decisions with your care team.</p></footer>
    </div>
  );
}
