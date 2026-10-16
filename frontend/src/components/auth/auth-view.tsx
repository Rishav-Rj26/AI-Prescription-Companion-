"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isAxiosError } from "axios";
import api from "@/lib/api";

/* ---------- Material Symbol Helper ---------- */
function MIcon({
  icon,
  className = "",
  fill = false,
}: {
  icon: string;
  className?: string;
  fill?: boolean;
}) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={fill ? { fontVariationSettings: "'FILL' 1" } : undefined}
    >
      {icon}
    </span>
  );
}

interface AuthViewProps {
  initialMode: "login" | "signup";
}

export function AuthView({ initialMode }: AuthViewProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">(initialMode);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Password strength evaluation
  const calculateStrength = (pass: string) => {
    if (!pass) return { score: 0, text: "Enter a password to assess strength" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8 && /[0-9]/.test(pass) && /[a-zA-Z]/.test(pass)) score += 1;
    if (pass.length >= 10 && /[A-Z]/.test(pass) && /[a-z]/.test(pass) && /[0-9]/.test(pass)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pass) || pass.length >= 12) score += 1;

    const descriptions = [
      "Enter a password to assess strength",
      "Weak — add numbers or symbols",
      "Fair — needs more complexity",
      "Good — strong passphrase",
      "Excellent hospital-grade strength",
    ];

    return { score, text: descriptions[score] };
  };

  const strength = calculateStrength(password);

  const handleTabSwitch = (newMode: "login" | "signup") => {
    setMode(newMode);
    setError(null);
    setInfoMessage(null);
    // Smoothly synchronize the browser URL
    window.history.replaceState(null, "", newMode === "signup" ? "/signup" : "/login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    if (mode === "signup") {
      if (!fullName.trim()) {
        setError("Please enter your legal or caregiver name.");
        return;
      }
      if (!email.trim() || !email.includes("@")) {
        setError("Please enter a valid email address.");
        return;
      }
      if (password.length < 12) {
        setError("Password must be at least 12 characters long.");
        return;
      }
      if (!termsAccepted) {
        setError("Please agree to the Terms of Service and HIPAA Privacy Policy.");
        return;
      }

      setLoading(true);
      try {
        const response = await api.post("/auth/register", {
          full_name: fullName.trim(),
          email: email.trim(),
          password,
        });

        localStorage.setItem("token", response.data.access_token);
        router.push("/dashboard");
      } catch (err: unknown) {
        const detail = isAxiosError<{ detail?: string }>(err) ? err.response?.data?.detail : undefined;
        setError(
          detail || "An error occurred during account creation. Please try again."
        );
      } finally {
        setLoading(false);
      }
    } else {
      if (!email.trim() || !email.includes("@")) {
        setError("Please enter a valid email address.");
        return;
      }
      if (!password) {
        setError("Please enter your password.");
        return;
      }

      setLoading(true);
      try {
        const response = await api.post("/auth/login", {
          email: email.trim(),
          password,
        });

        localStorage.setItem("token", response.data.access_token);
        router.push("/dashboard");
      } catch (err: unknown) {
        const detail = isAxiosError<{ detail?: string }>(err) ? err.response?.data?.detail : undefined;
        setError(
          detail || "Invalid email or password. Please verify your credentials."
        );
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafd] flex flex-col font-sans text-slate-800 antialiased selection:bg-sky-100 selection:text-sky-900">
      {/* ================= HEADER ================= */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="w-8 h-8 rounded-lg bg-[#003366] text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
              <MIcon icon="prescriptions" className="text-xl" fill />
            </span>
            <span className="font-bold text-slate-900 text-lg tracking-tight">
              AI Prescription Companion
            </span>
          </Link>

          {/* Right Header Navigation */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <MIcon icon="arrow_back" className="text-sm" />
              <span>Back to How It Works</span>
            </Link>

            {/* HIPAA Badge */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e6f4ea] text-[#137333] border border-[#ceead6] text-xs font-semibold">
              <MIcon icon="verified_user" className="text-sm text-[#137333]" />
              <span>HIPAA Compliant &amp; 256-Bit Encrypted</span>
            </div>

            {/* Help Button */}
            <button
              type="button"
              onClick={() =>
                setInfoMessage(
                  "Need assistance? Contact our care support desk at support@aiprescriptioncompanion.org."
                )
              }
              aria-label="Help"
              className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:border-slate-400 transition-colors"
            >
              <MIcon icon="help_outline" className="text-base" />
            </button>
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 lg:py-16 w-full flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center w-full">
          {/* ----- LEFT COLUMN: VALUE PROPOSITION & CLINICAL PROMISES ----- */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200/70 text-xs font-semibold w-fit">
              <MIcon icon="verified_user" className="text-sm text-[#0066cc]" />
              <span>Patient-First Privacy Guarantee</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#0f172a] tracking-tight leading-[1.18]">
              Understand your medications with peace of mind.
            </h1>

            {/* Subtitle */}
            <p className="text-slate-600 text-base leading-relaxed max-w-xl">
              Secure access to your prescriptions, translated into clear language with zero data
              selling and hospital-grade encryption.
            </p>

            {/* Security Micro-Cards (3 Columns) */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-xs text-center flex flex-col items-center justify-center">
                <MIcon icon="lock" className="text-[#0d9488] text-xl" />
                <div className="font-bold text-xs text-slate-800 mt-1.5">256-Bit AES</div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                  Encrypted at rest
                </div>
              </div>

              <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-xs text-center flex flex-col items-center justify-center">
                <MIcon icon="verified_user" className="text-[#0d9488] text-xl" />
                <div className="font-bold text-xs text-slate-800 mt-1.5">HIPAA BAA</div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                  Care protocol signed
                </div>
              </div>

              <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-xs text-center flex flex-col items-center justify-center">
                <MIcon icon="security" className="text-[#0d9488] text-xl" />
                <div className="font-bold text-xs text-slate-800 mt-1.5">Zero Ad Tracking</div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                  Never monetized
                </div>
              </div>
            </div>

            {/* Designed for Families & Caregivers Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <MIcon icon="diversity_1" className="text-slate-900 text-xl" />
                <h2 className="font-bold text-slate-900 text-sm sm:text-base">
                  Designed for Families &amp; Caregivers
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Managing complex multidose regimens for aging parents or yourself shouldn&apos;t be
                confusing. Every answer includes verifiable source citations and simple schedule
                instructions.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#f1f5f9] text-[#334155] text-[11px] font-bold tracking-wider uppercase border border-slate-200/70">
                  <MIcon icon="description" className="text-[13px] text-slate-500" />
                  FDA DAILYMED CITATIONS
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#f1f5f9] text-[#334155] text-[11px] font-bold tracking-wider uppercase border border-slate-200/70">
                  <MIcon icon="contrast" className="text-[13px] text-slate-500" />
                  HIGH CONTRAST DISPLAY
                </span>
              </div>
            </div>

            {/* Clinical Safety Notice Banner */}
            <div className="bg-[#fff9f2] border border-[#fed7aa] rounded-xl p-4 flex items-start gap-3">
              <MIcon icon="info" className="text-[#b45309] text-lg shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed text-[#9a3412]">
                <strong className="font-semibold text-[#7c2d12]">Clinical Safety Notice:</strong> AI
                Prescription Companion is not a diagnostic tool. It is intended to help you interpret
                labels, identify contraindications, and review regimens with confidence.
              </p>
            </div>
          </div>

          {/* ----- RIGHT COLUMN: AUTH FORM CARD ----- */}
          <div className="lg:col-span-6 xl:col-span-6 flex justify-center">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-200/40 p-7 sm:p-9 w-full max-w-lg transition-all">
              {/* Tab Switcher */}
              <div className="flex border-b border-slate-200 mb-6">
                <button
                  type="button"
                  onClick={() => handleTabSwitch("signup")}
                  className={`flex-1 pb-3 text-center text-sm flex items-center justify-center gap-2 font-semibold transition-colors border-b-2 ${
                    mode === "signup"
                      ? "border-slate-900 text-slate-900"
                      : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  <MIcon icon="person_add" className="text-base" />
                  <span>Create Account</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabSwitch("login")}
                  className={`flex-1 pb-3 text-center text-sm flex items-center justify-center gap-2 font-semibold transition-colors border-b-2 ${
                    mode === "login"
                      ? "border-slate-900 text-slate-900"
                      : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  <MIcon icon="login" className="text-base" />
                  <span>Sign In</span>
                </button>
              </div>

              {/* Title & Subtitle */}
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {mode === "signup"
                    ? "Start your safe medication journal"
                    : "Sign in to your medication journal"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {mode === "signup"
                    ? "Create an encrypted profile in under two minutes."
                    : "Access your encrypted prescriptions and clinical insights."}
                </p>
              </div>

              {/* Notifications */}
              {error && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800">
                  <MIcon icon="error" className="text-base shrink-0 text-red-600 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {infoMessage && (
                <div className="mb-5 p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-2.5 text-xs text-blue-800">
                  <MIcon icon="info" className="text-base shrink-0 text-blue-600 mt-0.5" />
                  <span>{infoMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name (Sign Up only) */}
                {mode === "signup" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                      Full Legal or Caregiver Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <MIcon icon="person_outline" className="text-lg" />
                      </span>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g., Eleanor Vance or Arthur Pendelton"
                        required
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                )}

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <MIcon icon="mail_outline" className="text-lg" />
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                  {mode === "signup" && (
                    <p className="text-[11px] text-slate-500 mt-1">
                      We send dosage reminders and verification notices only.
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-800">
                      {mode === "signup" ? "Create Password" : "Password"}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    {mode === "signup" ? (
                      <span className="text-[11px] text-slate-500">Min. 12 characters</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setInfoMessage(
                            "To reset your password, please contact care support at support@aiprescriptioncompanion.org."
                          )
                        }
                        className="text-[11px] text-[#0066cc] font-semibold hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <MIcon icon="key" className="text-lg" />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={
                        mode === "signup"
                          ? "Choose a strong, secure passphrase"
                          : "Enter your password"
                      }
                      required
                      className="w-full pl-10 pr-11 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900 placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <MIcon
                        icon={showPassword ? "visibility_off" : "visibility"}
                        className="text-lg"
                      />
                    </button>
                  </div>

                  {/* Password Strength Meter (Signup Only) */}
                  {mode === "signup" && (
                    <div className="mt-2 space-y-1.5">
                      <div className="grid grid-cols-4 gap-1.5">
                        <div
                          className={`h-1 rounded-full transition-colors ${
                            strength.score >= 1
                              ? strength.score === 1
                                ? "bg-red-500"
                                : strength.score === 2
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                              : "bg-slate-200"
                          }`}
                        />
                        <div
                          className={`h-1 rounded-full transition-colors ${
                            strength.score >= 2
                              ? strength.score === 2
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                              : "bg-slate-200"
                          }`}
                        />
                        <div
                          className={`h-1 rounded-full transition-colors ${
                            strength.score >= 3 ? "bg-emerald-500" : "bg-slate-200"
                          }`}
                        />
                        <div
                          className={`h-1 rounded-full transition-colors ${
                            strength.score >= 4 ? "bg-emerald-500" : "bg-slate-200"
                          }`}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>{strength.text}</span>
                        <span className="flex items-center gap-1 font-medium text-slate-600">
                          <MIcon icon="verified_user" className="text-xs text-slate-400" />
                          Letters &amp; Numbers
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* AES Callout Box */}
                <div className="bg-[#f0f7ff] border border-[#d0e5ff] rounded-lg p-3 flex items-center gap-2.5 text-xs text-[#004085]">
                  <MIcon icon="lock" className="text-base shrink-0 text-[#0052cc]" />
                  <span>
                    {mode === "signup"
                      ? "Encrypted with 256-bit AES at rest. We never share or monetize health data."
                      : "Encrypted with 256-bit AES at rest. Healthcare privacy guaranteed."}
                  </span>
                </div>

                {/* Checkbox (Signup Only) */}
                {mode === "signup" && (
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 pt-1">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    <span>
                      I agree to the{" "}
                      <Link href="#" className="underline font-semibold text-slate-800 hover:text-slate-950">
                        Terms of Service
                      </Link>{" "}
                      and acknowledge the{" "}
                      <Link href="#" className="underline font-semibold text-slate-800 hover:text-slate-950">
                        HIPAA Privacy Policy &amp; Clinical Safety Notice
                      </Link>
                    </span>
                  </label>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1b365d] hover:bg-[#122644] text-white py-3.5 px-5 rounded-xl font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-70 mt-2"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{mode === "signup" ? "Creating account..." : "Signing in..."}</span>
                    </>
                  ) : (
                    <>
                      <MIcon
                        icon={mode === "signup" ? "verified_user" : "login"}
                        className="text-lg"
                      />
                      <span>
                        {mode === "signup" ? "Create Secure Account" : "Sign In to Dashboard"}
                      </span>
                    </>
                  )}
                </button>
              </form>

              {/* Bottom Toggle Link */}
              <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500">
                  {mode === "signup" ? (
                    <>
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => handleTabSwitch("login")}
                        className="font-semibold text-slate-900 underline hover:text-[#003366] transition-colors"
                      >
                        Sign In here
                      </button>
                    </>
                  ) : (
                    <>
                      Don&apos;t have an account?{" "}
                      <button
                        type="button"
                        onClick={() => handleTabSwitch("signup")}
                        className="font-semibold text-slate-900 underline hover:text-[#003366] transition-colors"
                      >
                        Create an account here
                      </button>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-slate-200/80 bg-white/70 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          {/* Left disclaimer */}
          <div>
            <div className="font-bold text-slate-900 text-sm">AI Prescription Companion</div>
            <p className="text-[11px] text-slate-500 max-w-xl mt-1 leading-relaxed">
              &copy; 2025 AI Prescription Companion, Inc. All rights reserved. Not intended to
              replace professional medical advice, diagnosis, or treatment. In medical emergencies,
              call 911 immediately.
            </p>
          </div>

          {/* Right Links */}
          <div className="flex flex-col md:items-end gap-2 text-xs text-slate-500 font-medium">
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <Link href="#" className="hover:text-slate-900 transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-slate-900 transition-colors">
                HIPAA Compliance
              </Link>
              <Link href="#" className="hover:text-slate-900 transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="hover:text-slate-900 transition-colors">
                Clinical Disclaimer
              </Link>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <Link href="#" className="hover:text-slate-900 transition-colors">
                Accessibility Statement
              </Link>
              <Link href="#" className="hover:text-slate-900 transition-colors">
                Contact Care Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
