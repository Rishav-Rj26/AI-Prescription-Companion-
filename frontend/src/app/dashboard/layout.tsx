import Link from 'next/link';
import { Pill, Plus, HelpCircle, FileText, Calendar, Activity, ShieldCheck, Lock } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background text-on-surface antialiased min-h-screen flex flex-col justify-between selection:bg-surface-container selection:text-primary">
      {/* Top Navigation Shell */}
      <header className="bg-surface-container-lowest border-b border-outline-variant shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 md:px-space-xl flex justify-between items-center h-20 w-full">
          {/* Brand Logo & Nav */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="font-headline-sm text-headline-sm text-primary font-bold flex items-center gap-2 tracking-tight">
              <span className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shadow-sm">
                <Pill className="h-6 w-6" />
              </span>
              <span className="hidden md:inline">AI Prescription Companion</span>
            </Link>
            
            {/* Desktop Navigation Items */}
            <nav className="hidden lg:flex items-center gap-6 pt-1">
              <Link href="/dashboard/history" className="text-on-surface-variant hover:text-primary transition-colors font-label-lg text-label-lg">Prescriptions</Link>
              <Link href="/dashboard/schedule" className="text-on-surface-variant hover:text-primary transition-colors font-label-lg text-label-lg">Schedule</Link>
              <Link href="/dashboard/compare" className="text-on-surface-variant hover:text-primary transition-colors font-label-lg text-label-lg">Compare</Link>
              <Link href="/dashboard/settings" className="text-on-surface-variant hover:text-primary transition-colors font-label-lg text-label-lg">Settings</Link>
            </nav>
          </div>
          
          {/* Trailing Action & User Profile */}
          <div className="flex items-center gap-4">
            {/* Upload CTA */}
            <Link href="/dashboard/upload" className="hidden sm:inline-flex bg-primary-container text-on-primary font-label-md text-label-md px-4 py-2 rounded-xl hover:brightness-110 active:scale-95 transition-all items-center gap-2 shadow-sm">
              <Plus className="h-4 w-4" />
              <span>Upload New</span>
            </Link>
            
            {/* Help Action */}
            <button className="p-2 text-on-surface-variant hover:text-primary rounded-lg transition-colors" title="Clinical Help Desk">
              <HelpCircle className="h-5 w-5" />
            </button>
            
            {/* Divider */}
            <div className="h-6 w-px bg-outline-variant hidden sm:block"></div>
            
            {/* User Profile Pill */}
            <div className="flex items-center gap-3 pl-1 cursor-pointer hover:bg-surface-container-low p-1.5 rounded-xl transition-colors">
              <div className="w-9 h-9 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-label-md text-label-md shadow-sm">
                AP
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="font-label-sm text-label-sm text-on-surface leading-tight font-bold">Arthur P.</span>
                <span className="font-label-sm text-[11px] text-secondary leading-tight">Patient Account</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Reassuring HIPAA & Clinical Encryption Banner */}
      <section className="bg-surface-container-low border-b border-outline-variant">
        <div className="max-w-7xl mx-auto px-6 md:px-space-xl py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-on-surface-variant">
            <ShieldCheck className="h-5 w-5 text-secondary" />
            <p className="font-label-sm text-[12px] leading-snug">
              <strong className="text-on-surface font-semibold">Encrypted & HIPAA Compliant Protocol Active</strong> • Your health information is stored with end-to-end AES-256 encryption.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-secondary font-label-sm text-[12px] font-bold tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
            <span>AES-256 Active</span>
          </div>
        </div>
      </section>

      {/* Main Canvas */}
      <main className="w-full flex-grow">
        {children}
      </main>
      
      {/* Simple Footer */}
      <footer className="border-t border-outline-variant bg-surface-container-lowest mt-12 py-8 text-center text-sm text-on-surface-variant font-label-sm">
         <p>© 2025 AI Prescription Companion, Inc. All rights reserved.</p>
         <div className="flex justify-center gap-4 mt-2">
           <a href="#" className="hover:text-primary">Privacy</a>
           <a href="#" className="hover:text-primary">Terms</a>
           <a href="#" className="hover:text-primary">HIPAA Notice</a>
         </div>
      </footer>
    </div>
  );
}
