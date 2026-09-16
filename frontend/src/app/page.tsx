import Link from "next/link";
import { 
  Pill, ArrowRight, HelpCircle, AlertTriangle, FileText, PlayCircle, 
  ShieldCheck, CreditCard, Lock, CheckCircle2, Camera, Wifi, MessageSquare,
  Shield, UserX, ClipboardCheck, Accessibility, Star, ArrowUpFromLine,
  BookOpen, FlaskConical, HeartPulse, BadgeCheck
} from "lucide-react";

export default function Home() {
  return (
    <div className="bg-background text-on-surface font-body-md text-body-md antialiased min-h-screen flex flex-col selection:bg-surface-container selection:text-primary">
      {/* TOP APP BAR */}
      <header className="bg-surface-container-lowest border-b border-outline-variant shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 md:px-space-xl flex justify-between items-center h-20 w-full">
          {/* Brand Logo */}
          <Link href="/" className="font-headline-sm text-headline-sm text-primary font-bold flex items-center gap-2 tracking-tight">
            <span className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shadow-sm">
              <Pill className="h-6 w-6" />
            </span>
            <span>AI Prescription Companion</span>
          </Link>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 font-label-lg text-label-lg">
            <Link href="#how-it-works" className="text-on-surface-variant hover:text-primary transition-colors duration-150">How It Works</Link>
            <Link href="#clinical-safety" className="text-on-surface-variant hover:text-primary transition-colors duration-150">Clinical Safety</Link>
            <Link href="#security-hipaa" className="text-on-surface-variant hover:text-primary transition-colors duration-150">Security & HIPAA</Link>
            <Link href="#advisory-board" className="text-on-surface-variant hover:text-primary transition-colors duration-150">Advisory Board</Link>
          </nav>
          {/* Trailing Buttons */}
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:inline-flex items-center justify-center font-label-md text-label-md text-primary font-semibold px-4 py-2 rounded-lg hover:bg-surface-container transition-colors duration-150 active:scale-95">Sign In</Link>
            <Link href="/signup" className="inline-flex items-center justify-center font-label-md text-label-md bg-primary-container text-on-primary font-semibold px-5 py-2.5 rounded-xl hover:opacity-95 shadow-sm transition-all duration-150 active:scale-95 gap-2">
              <span>Try Free Preview</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button aria-label="Help & Guidance" className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-lg">
              <HelpCircle className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CANVAS */}
      <main className="flex-grow">
        {/* HERO SECTION */}
        <section className="pt-10 pb-16 md:pt-14 md:pb-24 max-w-7xl mx-auto px-6 md:px-space-xl">
          {/* MANDATORY CLINICAL SAFETY BANNER */}
          <div className="mb-10 rounded-xl bg-[#FEF7EA] border border-[#F5D59A] p-5 md:p-6 shadow-sm" role="alert">
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-full bg-[#FDE68A] text-[#78350F] flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-label-lg text-label-lg text-[#78350F] font-bold tracking-wide">Important Medical Safety Notice</span>
                  <span className="bg-[#FEE2E2] text-[#991B1B] text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Non-Diagnostic</span>
                </div>
                <p className="font-body-md text-body-md text-[#5B3111] leading-relaxed">
                  AI Prescription Companion reads and explains prescription documentation to support comprehension. It does not diagnose medical conditions, formulate treatment plans, or replace the clinical judgment of your licensed physician or pharmacist. In emergencies, call 911 immediately.
                </p>
              </div>
            </div>
          </div>

          {/* Hero Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
            {/* Left Column: Copy & CTAs */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container border border-outline-variant/60 font-label-md text-label-md text-primary font-medium">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                <span>Clinical-Grade OCR & Plain Language Translation</span>
              </div>
              <h1 className="font-headline-xl text-headline-xl text-primary tracking-tight leading-tight">
                Understand your prescriptions with clarity, precision, and confidence.
              </h1>
              <p className="font-body-xl text-body-xl text-on-surface-variant leading-relaxed">
                Dense pharmacy labels, tiny warning print, and complex schedules can be overwhelming. Our clinical AI reads, transcribes, and translates prescription paperwork into compassionate, plain-language schedules built for you and your loved ones.
              </p>
              {/* Primary CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link href="/signup" className="inline-flex items-center justify-center font-label-lg text-label-lg bg-primary-container text-on-primary px-7 py-3.5 rounded-xl shadow-md hover:brightness-110 active:scale-95 transition-all text-center gap-2 font-semibold">
                  <FileText className="h-5 w-5" />
                  <span>Upload Prescription to Test</span>
                </Link>
                <button className="inline-flex items-center justify-center font-label-lg text-label-lg border-[1.5px] border-primary-container text-primary-container bg-transparent px-6 py-3.5 rounded-xl hover:bg-surface-container-low active:scale-95 transition-all text-center gap-2 font-semibold">
                  <PlayCircle className="h-5 w-5" />
                  <span>Watch 60s Demo</span>
                </button>
              </div>
              {/* Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-on-surface-variant font-label-md text-label-md border-t border-surface-container-high">
                <div className="flex items-center gap-1.5 pt-4">
                  <ShieldCheck className="h-5 w-5 text-secondary" />
                  <span>HIPAA BAA Compliant</span>
                </div>
                <div className="flex items-center gap-1.5 pt-4">
                  <CreditCard className="h-5 w-5 text-secondary" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-1.5 pt-4">
                  <Lock className="h-5 w-5 text-secondary" />
                  <span>256-Bit Encrypted</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Sample Preview */}
            <div className="lg:col-span-6">
              <div className="bg-surface-container-lowest rounded-2xl tier-2-floating p-6 sm:p-7 relative overflow-hidden">
                {/* Header Status Bar */}
                <div className="flex items-center justify-between pb-5 border-b border-surface-container-high mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                      <Pill className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-primary font-bold leading-tight">Rx Comprehension Card</h3>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">Validated via Clinical Monograph Engine</p>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1.5 bg-[#EDF7EE] border border-[#B8E2BE] text-[#14532D] px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>High Confidence (99.4%)</span>
                  </div>
                </div>
                {/* Medication Info */}
                <div className="space-y-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-headline-md text-headline-md text-primary font-bold">Atorvastatin Calcium</span>
                        <span className="bg-surface-container text-primary font-label-sm text-label-sm px-2.5 py-0.5 rounded-md font-semibold">20 mg Oral Tablet</span>
                      </div>
                      <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">Generic for <strong className="text-on-surface font-semibold">Lipitor®</strong> • Prescribed for Lipid Management</p>
                    </div>
                  </div>
                  {/* Patient Friendly Translation */}
                  <div className="bg-surface-container-low/70 rounded-xl p-4 border border-outline-variant/40 space-y-2">
                    <div className="flex items-center gap-2 text-primary font-label-md text-label-md font-bold">
                      <span className="text-secondary">🌐</span>
                      <span>Patient-Friendly Instructions</span>
                    </div>
                    <p className="font-body-lg text-body-lg text-primary leading-relaxed font-medium">
                      &quot;Take 1 tablet every evening around 8:00 PM. You can take it with or without dinner. Avoid drinking grapefruit juice or eating grapefruit while on this medication, as it alters drug absorption.&quot;
                    </p>
                  </div>
                  {/* Precaution cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="bg-surface-container-lowest rounded-lg p-3 border border-outline-variant/60 flex items-start gap-2.5">
                      <span className="text-amber-600 mt-0.5 text-lg">🍊</span>
                      <div>
                        <span className="font-label-sm text-label-sm text-on-surface font-bold block">Dietary Advisory</span>
                        <span className="font-body-md text-body-md text-on-surface-variant text-sm">No Grapefruit / Seville Oranges.</span>
                      </div>
                    </div>
                    <div className="bg-surface-container-lowest rounded-lg p-3 border border-outline-variant/60 flex items-start gap-2.5">
                      <span className="text-secondary mt-0.5 text-lg">🔁</span>
                      <div>
                        <span className="font-label-sm text-label-sm text-on-surface font-bold block">Refill Tracker</span>
                        <span className="font-body-md text-body-md text-on-surface-variant text-sm">2 of 3 refills remaining (Rx #49281).</span>
                      </div>
                    </div>
                  </div>
                  {/* Source Citations */}
                  <div className="pt-2">
                    <div className="text-xs font-label-sm text-on-surface-variant uppercase tracking-wider mb-2 font-bold">Verified Clinical Provenance:</div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#F0F4F8] border border-[#CBD5E1] text-[#1E4263] font-code-pill text-code-pill uppercase tracking-wider hover:bg-[#E2EAF1] transition-colors cursor-pointer">
                        <FileText className="h-3 w-3" />
                        <span>FDA Drug Label 2024</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#F0F4F8] border border-[#CBD5E1] text-[#1E4263] font-code-pill text-code-pill uppercase tracking-wider hover:bg-[#E2EAF1] transition-colors cursor-pointer">
                        <BadgeCheck className="h-3 w-3" />
                        <span>NIH DailyMed #48291</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#F0F4F8] border border-[#CBD5E1] text-[#1E4263] font-code-pill text-code-pill uppercase tracking-wider hover:bg-[#E2EAF1] transition-colors cursor-pointer">
                        <HeartPulse className="h-3 w-3" />
                        <span>USP Monograph Rev 12</span>
                      </span>
                    </div>
                  </div>
                  {/* Log Action */}
                  <div className="pt-3 border-t border-surface-container flex items-center justify-between">
                    <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm">
                      <span className="text-secondary">⏰</span>
                      <span>Next scheduled dose in <strong>5h 22m</strong></span>
                    </div>
                    <button className="inline-flex items-center gap-1.5 bg-primary font-label-md text-label-md text-on-primary px-4 py-2 rounded-lg hover:brightness-110 active:scale-95 transition-all">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Log Taken</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: HOW IT WORKS */}
        <section className="py-16 bg-surface-container-lowest border-y border-outline-variant/40" id="how-it-works">
          <div className="max-w-7xl mx-auto px-6 md:px-space-xl">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
              <span className="inline-block px-3 py-1 rounded-full bg-surface-container text-primary font-label-md text-label-md font-bold">Simplicity Built for Everyone</span>
              <h2 className="font-headline-lg text-headline-lg text-primary font-bold">How AI Prescription Companion Works</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">From paper confusion to structured peace of mind in three compassionate steps. Designed specifically for patients, family caregivers, and low-vision accessibility.</p>
            </div>
            {/* 3 Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { num: "1", title: "Upload or Snap", desc: "Photograph any medication bottle label, printed pharmacy receipt, discharge summary, or digital PDF prescription. No fancy camera or perfect lighting required.", badge: "Supports bottles, boxes, & papers", icon: <Camera className="h-8 w-8 text-secondary" /> },
                { num: "2", title: "Clinical OCR & Extraction", desc: "Multi-layer clinical AI cross-checks recognized text against verified National Drug Code (NDC) registries, parsing physician shorthand, dosage units, and potential contraindications.", badge: "Multi-layer clinical cross-referencing", icon: <Wifi className="h-8 w-8 text-secondary" /> },
                { num: "3", title: "Clear, Actionable Guidance", desc: "Receive structured, plain-language summaries, daily reminder schedules, food interaction alerts, and automated suggested questions to ask your doctor at your next appointment.", badge: "Audio playback & large print format", icon: <MessageSquare className="h-8 w-8 text-secondary" /> },
              ].map((step) => (
                <div key={step.num} className="bg-surface-container-low/50 rounded-2xl p-7 border border-outline-variant/60 flex flex-col justify-between hover:border-primary transition-all">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="w-12 h-12 rounded-xl bg-primary-container text-on-primary flex items-center justify-center font-headline-sm text-headline-sm font-bold shadow-xs">{step.num}</span>
                      {step.icon}
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-primary font-bold">{step.title}</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{step.desc}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-outline-variant/30 flex items-center gap-2 text-on-surface font-label-sm text-label-sm font-medium">
                    <CheckCircle2 className="h-4 w-4 text-secondary" />
                    <span>{step.badge}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION: CLINICAL SAFETY & PROVENANCE */}
        <section className="py-16 md:py-20 max-w-7xl mx-auto px-6 md:px-space-xl" id="clinical-safety">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-6">
              <span className="inline-block px-3.5 py-1.5 rounded-full bg-surface-container text-primary font-label-md text-label-md font-bold">Advisory Board & Evidence</span>
              <h2 className="font-headline-lg text-headline-lg text-primary font-bold">Engineered with Clinical Scaffolding, Not Unchecked Hallucinations</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">Healthcare communication demands absolute reliability. Every output produced by our models is anchored to published drug monographs, FDA package inserts, and standard geriatric pharmacology protocols.</p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <BadgeCheck className="h-5 w-5 text-secondary mt-0.5" />
                  <div>
                    <strong className="font-headline-sm text-headline-sm text-primary text-base font-bold block">Strict Grounding in DailyMed & FDA Labels</strong>
                    <span className="font-body-md text-body-md text-on-surface-variant">We restrict generative models to verified authoritative medical indices. Unverifiable statements are flagged immediately.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <HeartPulse className="h-5 w-5 text-secondary mt-0.5" />
                  <div>
                    <strong className="font-headline-sm text-headline-sm text-primary text-base font-bold block">Elderly & Low-Vision Optimization</strong>
                    <span className="font-body-md text-body-md text-on-surface-variant">Built to exceed WCAG 2.1 AAA high-contrast criteria with high-legibility typographic scale and 52px minimum tap targets.</span>
                  </div>
                </li>
              </ul>
            </div>
            {/* Conversational RAG Demo */}
            <div className="lg:col-span-7 bg-surface-container-lowest rounded-2xl tier-1-card p-6 md:p-8 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-surface-container">
                <div className="flex items-center gap-2 font-headline-sm text-headline-sm text-primary font-bold">
                  <MessageSquare className="h-5 w-5 text-secondary" />
                  <span>Conversational Safety Verification Demo</span>
                </div>
                <span className="font-label-sm text-label-sm bg-surface-container px-2.5 py-1 rounded text-on-surface-variant">Real-time Inquiry</span>
              </div>
              {/* User Query */}
              <div className="flex justify-end">
                <div className="bg-primary-container text-on-primary rounded-2xl rounded-br-sm px-5 py-3 max-w-lg shadow-xs">
                  <p className="font-body-md text-body-md text-white font-medium">&quot;My mom takes Lisinopril for high blood pressure and wants to take an over-the-counter pain reliever for a headache. Is Ibuprofen safe?&quot;</p>
                </div>
              </div>
              {/* AI Response */}
              <div className="bg-surface-container-low/70 rounded-2xl rounded-tl-sm p-5 border border-outline-variant/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                    <span className="font-label-md text-label-md text-primary font-bold">AI Clinical Safety Engine</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 bg-[#FEF7EA] border border-[#F5D59A] text-[#78350F] px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Important Drug Interaction Alert</span>
                  </div>
                </div>
                <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                  <strong>Caution advised:</strong> Lisinopril (an ACE inhibitor) may interact with NSAIDs like Ibuprofen (Advil®, Motrin®). Concomitant use can decrease blood pressure control and increase the risk of acute renal dysfunction, particularly in older adults.
                </p>
                <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-outline-variant/50 text-sm">
                  <span className="font-label-sm text-label-sm text-primary font-bold block mb-1">Recommended Action to Discuss with Doctor:</span>
                  <p className="text-on-surface-variant font-body-md text-body-md text-sm">Ask your physician or pharmacist if <strong>Acetaminophen (Tylenol®)</strong> is an appropriate alternative pain reliever for her situation.</p>
                </div>
                {/* Sources */}
                <div className="pt-1 flex flex-wrap items-center gap-2">
                  <span className="font-code-pill text-code-pill text-on-surface-variant font-bold uppercase">Sources:</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container text-primary font-code-pill text-code-pill uppercase border border-outline-variant/60 hover:bg-surface-container-high transition-colors cursor-pointer">
                    <BookOpen className="h-3 w-3" /> AHA Guidelines on Antihypertensive Interaction
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container text-primary font-code-pill text-code-pill uppercase border border-outline-variant/60 hover:bg-surface-container-high transition-colors cursor-pointer">
                    <FlaskConical className="h-3 w-3" /> Lisinopril Official Prescribing Info §7.1
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: PRIVACY & HIPAA */}
        <section className="py-16 bg-surface-container-low/50 border-t border-outline-variant/40" id="security-hipaa">
          <div className="max-w-7xl mx-auto px-6 md:px-space-xl">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
              <span className="inline-block px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md font-bold">Sanctuary of Privacy</span>
              <h2 className="font-headline-lg text-headline-lg text-primary font-bold">Bank-Grade Privacy & HIPAA Compliant Security</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">Medical information is sacred. We treat every prescription scan with hospital-level defense protocols, explicit BAA agreements, and automated redaction.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: <Lock className="h-6 w-6" />, title: "Zero Data Selling", desc: "Your medical documentation is never sold to insurers, advertisers, or third-party brokers. Ever." },
                { icon: <Shield className="h-6 w-6" />, title: "End-to-End AES-256", desc: "Encrypted in transit via TLS 1.3 and at rest with military-grade AES-256 keys managed via dedicated HSMs." },
                { icon: <UserX className="h-6 w-6" />, title: "Automated PII Stripping", desc: "Personal identifying details like Social Security Numbers and addresses are stripped locally before processing." },
                { icon: <ClipboardCheck className="h-6 w-6" />, title: "Certified BAA Signed", desc: "All infrastructure partners hold executed Business Associate Agreements and annual third-party SOC2 Type II audits." },
              ].map((card) => (
                <div key={card.title} className="bg-surface-container-lowest p-6 rounded-2xl tier-1-card space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary">{card.icon}</div>
                  <h3 className="font-headline-sm text-headline-sm text-primary font-bold">{card.title}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">{card.desc}</p>
                </div>
              ))}
            </div>
            {/* Compliance Badges */}
            <div className="mt-12 pt-8 border-t border-outline-variant/30 flex flex-wrap items-center justify-center gap-8 md:gap-14 text-on-surface-variant">
              {[
                { icon: <Shield className="h-5 w-5 text-secondary" />, label: "HIPAA Compliant Entity" },
                { icon: <ShieldCheck className="h-5 w-5 text-secondary" />, label: "SOC2 Type II Certified" },
                { icon: <HeartPulse className="h-5 w-5 text-secondary" />, label: "FDA SaMD Guidance Aligned" },
                { icon: <Accessibility className="h-5 w-5 text-secondary" />, label: "WCAG 2.1 AAA Accessibility" },
              ].map((badge) => (
                <div key={badge.label} className="flex items-center gap-2 font-label-md text-label-md font-bold">
                  {badge.icon}
                  <span>{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION: TESTIMONIALS */}
        <section className="py-16 md:py-20 max-w-7xl mx-auto px-6 md:px-space-xl" id="advisory-board">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-surface-container text-primary font-label-md text-label-md font-bold">Voices of Care</span>
            <h2 className="font-headline-lg text-headline-lg text-primary font-bold">Trusted by Caregivers & Clinical Pharmacists</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Real experiences from families managing multi-drug schedules and medical professionals reviewing our safe translation framework.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Caregiver Testimonial */}
            <div className="bg-surface-container-lowest p-8 rounded-2xl tier-1-card flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex text-amber-500 gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-amber-500" />)}
                </div>
                <p className="font-body-lg text-body-lg text-primary leading-relaxed italic">
                  &quot;Managing my 83-year-old mother&apos;s seven daily prescriptions used to keep me up at night. The paper leaflets were microscopic and terrifying. AI Prescription Companion laid out her exact evening routine in clear, plain words and reminded us what not to mix with food. It has replaced our panic with clarity.&quot;
                </p>
              </div>
              <div className="flex items-center gap-4 pt-4 border-t border-surface-container">
                <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-lg">MR</div>
                <div>
                  <div className="font-headline-sm text-headline-sm text-primary font-bold text-base">Margaret Roberts</div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant">Primary Family Caregiver • Chicago, IL</div>
                </div>
              </div>
            </div>
            {/* Pharmacist Testimonial */}
            <div className="bg-surface-container-lowest p-8 rounded-2xl tier-1-card flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex text-amber-500 gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-amber-500" />)}
                </div>
                <p className="font-body-lg text-body-lg text-primary leading-relaxed italic">
                  &quot;What sets this system apart is its clinical restraint. Instead of attempting to act like an autonomous doctor, it translates pharmacy documentation faithfully and provides explicit citations to DailyMed monographs. Patients arrive at my pharmacy counter far better informed.&quot;
                </p>
              </div>
              <div className="flex items-center gap-4 pt-4 border-t border-surface-container">
                <div className="w-12 h-12 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold text-lg">DK</div>
                <div>
                  <div className="font-headline-sm text-headline-sm text-primary font-bold text-base">Dr. David Koenig, PharmD, BCGP</div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant">Board Certified Geriatric Pharmacist • Member, Clinical Advisory Council</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: CTA / SIGN-UP */}
        <section className="py-16 bg-surface-container-low/80" id="preview-cta">
          <div className="max-w-5xl mx-auto px-6">
            <div className="bg-primary-container text-on-primary rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden border border-outline-variant/30">
              <div className="max-w-2xl mx-auto text-center space-y-4">
                <div className="inline-flex items-center gap-2 bg-on-primary-container/20 text-inverse-on-surface px-4 py-1.5 rounded-full font-label-md text-label-md">
                  <Lock className="h-5 w-5 text-secondary-fixed" />
                  <span>Encrypted Instant Assessment</span>
                </div>
                <h2 className="font-headline-xl text-headline-xl text-white font-bold leading-tight">Start Your Free Prescription Preview</h2>
                <p className="font-body-lg text-body-lg text-inverse-on-surface/90 leading-relaxed">Enter your email to test our clinical OCR engine with any prescription photo or medication label. No credit card required. Private, secure, and compliant.</p>
                <div className="pt-6">
                  <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
                    <input className="flex-1 h-[52px] px-4 rounded-xl bg-surface-container-lowest text-on-surface border-[1.5px] border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary-fixed outline-none text-body-lg placeholder:text-on-surface-variant/70 shadow-xs" placeholder="Enter your email address..." type="email" required />
                    <button className="h-[52px] px-6 rounded-xl bg-secondary-fixed text-on-secondary-fixed font-label-lg text-label-lg font-bold hover:brightness-105 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 shrink-0" type="submit">
                      <span>Start Free Preview</span>
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </form>
                </div>
                <div className="pt-6 border-t border-on-primary-container/20 mt-8">
                  <div className="border-2 border-dashed border-on-primary-container/40 rounded-xl p-5 hover:border-secondary-fixed transition-colors cursor-pointer text-center">
                    <div className="flex items-center justify-center gap-3 text-inverse-on-surface">
                      <ArrowUpFromLine className="h-6 w-6 text-secondary-fixed" />
                      <span className="font-label-md text-label-md">Or drag & drop prescription image / PDF here for instant sample analysis</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-inverse-on-surface/70 pt-2 font-label-sm">By using this free preview, you acknowledge our Clinical Safety Notice and HIPAA Privacy Terms.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-surface-container border-t border-outline-variant">
        <div className="max-w-7xl mx-auto px-6 md:px-space-xl py-12 flex flex-col md:flex-row justify-between items-center gap-6 w-full">
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link href="/" className="font-headline-md text-headline-md font-bold text-primary flex items-center gap-2">
              <Pill className="h-6 w-6 text-primary" />
              <span>AI Prescription Companion</span>
            </Link>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xl text-center md:text-left text-sm leading-relaxed">
              © 2025 AI Prescription Companion, Inc. All rights reserved. Not intended to replace professional medical advice, diagnosis, or treatment.
            </p>
          </div>
          <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 font-label-md text-label-md">
            {["Privacy Policy", "HIPAA Compliance", "Terms of Service", "Clinical Disclaimer", "Accessibility Statement", "Contact Care Support"].map((link) => (
              <Link key={link} href="#" className="text-on-surface-variant hover:text-primary hover:underline transition-colors">{link}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
