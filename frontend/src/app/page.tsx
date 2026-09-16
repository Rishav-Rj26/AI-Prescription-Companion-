import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Pill, 
  ArrowRight, 
  HelpCircle, 
  AlertTriangle, 
  FileText, 
  PlayCircle, 
  ShieldCheck, 
  CreditCard, 
  Lock,
  CheckCircle2
} from "lucide-react";

export default function Home() {
  return (
    <div className="bg-[#f6f9ff] text-[#192128] font-sans min-h-screen flex flex-col">
      {/* TOP APP BAR */}
      <header className="bg-white border-b border-[#e6ecf1] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 md:px-9 flex justify-between items-center h-20 w-full">
          {/* Brand Logo Anchor */}
          <Link href="/" className="text-[19px] text-[#1e4263] font-bold flex items-center gap-2 tracking-tight">
            <span className="w-10 h-10 rounded-xl bg-[#1e4263] text-white flex items-center justify-center shadow-sm">
              <Pill className="h-6 w-6" />
            </span>
            <span>AI Prescription Companion</span>
          </Link>
          
          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 font-semibold text-[15px]">
            <Link href="#how-it-works" className="text-[#4a5866] hover:text-[#1e4263] transition-colors duration-150">How It Works</Link>
            <Link href="#clinical-safety" className="text-[#4a5866] hover:text-[#1e4263] transition-colors duration-150">Clinical Safety</Link>
            <Link href="#security-hipaa" className="text-[#4a5866] hover:text-[#1e4263] transition-colors duration-150">Security & HIPAA</Link>
          </nav>

          {/* Trailing Action Buttons */}
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:inline-flex items-center justify-center font-semibold text-[13px] text-[#1e4263] px-4 py-2 rounded-lg hover:bg-[#e7eff9] transition-colors duration-150">
              Sign In
            </Link>
            <Link href="/signup" className="inline-flex items-center justify-center font-semibold text-[13px] bg-[#1e4263] text-white px-5 py-2.5 rounded-xl hover:bg-[#002c4b] shadow-sm transition-all duration-150 gap-2">
              <span>Try Free Preview</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button aria-label="Help & Guidance" className="text-[#4a5866] hover:text-[#1e4263] transition-colors p-2 rounded-lg">
              <HelpCircle className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CANVAS */}
      <main className="flex-grow">
        {/* HERO SECTION */}
        <section className="pt-10 pb-16 md:pt-14 md:pb-24 max-w-7xl mx-auto px-6 md:px-9">
          
          {/* MANDATORY CLINICAL SAFETY BANNER */}
          <div className="mb-10 rounded-xl bg-[#FEF7EA] border border-[#F5D59A] p-5 md:p-6 shadow-sm transition-all" role="alert">
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-full bg-[#FDE68A] text-[#78350F] flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[15px] text-[#78350F] font-bold tracking-wide">Important Medical Safety Notice</span>
                  <span className="bg-[#FEE2E2] text-[#991B1B] text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Non-Diagnostic</span>
                </div>
                <p className="text-[15px] text-[#5B3111] leading-relaxed">
                  AI Prescription Companion reads and explains prescription documentation to support comprehension. It does not diagnose medical conditions, formulate treatment plans, or replace the clinical judgment of your licensed physician or pharmacist. In emergencies, call 911 immediately.
                </p>
              </div>
            </div>
          </div>

          {/* Hero Header & Value Proposition */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
            
            {/* Left Column: Copy & CTAs */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e7eff9] border border-[#c3c7ce]/60 text-[13px] text-[#1e4263] font-medium">
                <span className="w-2 h-2 rounded-full bg-[#2e7977] animate-pulse"></span>
                <span>Clinical-Grade OCR & Plain Language Translation</span>
              </div>
              <h1 className="text-[36px] md:text-[44px] font-bold text-[#1e4263] tracking-tight leading-tight">
                Understand your prescriptions with clarity, precision, and confidence.
              </h1>
              <p className="text-[19px] text-[#4a5866] leading-relaxed">
                Dense pharmacy labels, tiny warning print, and complex schedules can be overwhelming. Our clinical AI reads, transcribes, and translates prescription paperwork into compassionate, plain-language schedules built for you and your loved ones.
              </p>
              
              {/* Primary CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link href="/signup" className="inline-flex items-center justify-center text-[15px] bg-[#1e4263] text-white px-7 py-3.5 rounded-xl shadow-md hover:brightness-110 transition-all text-center gap-2 font-semibold">
                  <FileText className="h-5 w-5" />
                  <span>Upload Prescription to Test</span>
                </Link>
                <button className="inline-flex items-center justify-center text-[15px] border-[1.5px] border-[#1e4263] text-[#1e4263] bg-transparent px-6 py-3.5 rounded-xl hover:bg-[#ecf4fe] transition-all text-center gap-2 font-semibold">
                  <PlayCircle className="h-5 w-5" />
                  <span>Watch 60s Demo</span>
                </button>
              </div>
              
              {/* Micro-Reassurances & Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-[#4a5866] text-[13px] font-semibold border-t border-[#e1e9f3]">
                <div className="flex items-center gap-1.5 pt-4">
                  <ShieldCheck className="h-5 w-5 text-[#2e7977]" />
                  <span>HIPAA BAA Compliant</span>
                </div>
                <div className="flex items-center gap-1.5 pt-4">
                  <CreditCard className="h-5 w-5 text-[#2e7977]" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-1.5 pt-4">
                  <Lock className="h-5 w-5 text-[#2e7977]" />
                  <span>256-Bit Encrypted</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Sample Preview Mockup */}
            <div className="lg:col-span-6">
              <div className="bg-white rounded-2xl tier-2-floating p-6 sm:p-7 relative overflow-hidden">
                {/* Live Analysis Header Status Bar */}
                <div className="flex items-center justify-between pb-5 border-b border-[#e1e9f3] mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#ecf4fe] flex items-center justify-center text-[#1e4263]">
                      <Pill className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-[19px] text-[#1e4263] font-bold leading-tight">Rx Comprehension Card</h3>
                      <p className="text-[13px] text-[#4a5866] font-semibold">Live AI Extraction Demo</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-[#EDF7EE] text-[#14532D] border border-[#B8E2BE] rounded-full text-[12px] font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">High Confidence</span>
                  </div>
                </div>

                {/* Sample Medication Display */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-[24px] font-bold text-[#192128]">Atorvastatin Calcium</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[15px] font-semibold text-[#4a5866] bg-[#f6f8fa] px-2.5 py-0.5 rounded-md border border-[#e6ecf1]">20 mg Tablet</span>
                      <span className="text-[15px] font-semibold text-[#4a5866] bg-[#f6f8fa] px-2.5 py-0.5 rounded-md border border-[#e6ecf1]">Oral</span>
                    </div>
                  </div>

                  <div className="bg-[#f6f9ff] border border-[#a8caf1] rounded-xl p-4">
                    <p className="text-[13px] text-[#1e4263] font-bold uppercase tracking-wider mb-1">Plain Language Schedule</p>
                    <p className="text-[17px] text-[#192128] font-medium leading-relaxed">Take one (1) tablet by mouth every day in the evening.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 border border-[#e6ecf1] rounded-lg">
                      <p className="text-[12px] text-[#73777e] font-semibold mb-1">Quantity</p>
                      <p className="text-[15px] text-[#192128] font-semibold">90 Tablets</p>
                    </div>
                    <div className="p-3 border border-[#e6ecf1] rounded-lg">
                      <p className="text-[12px] text-[#73777e] font-semibold mb-1">Refills</p>
                      <p className="text-[15px] text-[#192128] font-semibold">3 Remaining</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
}
