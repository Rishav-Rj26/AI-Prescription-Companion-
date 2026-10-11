"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/api";
import { registerSchema, RegisterFormData } from "@/lib/validations/auth";
import { Pill, ShieldCheck, Lock, Eye, EyeOff, ArrowRight, AlertTriangle, CheckCircle2, CreditCard } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirm_password: "",
    },
  });

  async function onSubmit(data: RegisterFormData) {
    setError(null);
    try {
      const response = await api.post("/auth/register", {
        full_name: data.full_name,
        email: data.email,
        password: data.password,
      });
      
      localStorage.setItem("token", response.data.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "An error occurred during signup."
      );
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Brand Bar */}
      <header className="bg-surface-container-lowest border-b border-outline-variant shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 md:px-space-xl flex justify-between items-center h-16 w-full">
          <Link href="/" className="font-headline-sm text-headline-sm text-primary font-bold flex items-center gap-2 tracking-tight">
            <span className="w-9 h-9 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shadow-sm">
              <Pill className="h-5 w-5" />
            </span>
            <span>AI Prescription Companion</span>
          </Link>
          <Link href="/login" className="font-label-md text-label-md text-primary hover:text-primary-container transition-colors font-semibold">
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Content — Split Panel */}
      <main className="flex-grow flex items-center justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-0 bg-surface-container-lowest rounded-2xl tier-2-floating overflow-hidden">

          {/* Left Panel — Brand & Trust */}
          <div className="hidden lg:flex flex-col justify-between bg-primary-container text-on-primary p-10 relative overflow-hidden">
            {/* Decorative blurred circles */}
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-on-primary-container/10 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-secondary/20 blur-2xl" />
            
            <div className="relative z-10 space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-on-primary-container/20 flex items-center justify-center">
                <Pill className="h-8 w-8 text-on-primary" />
              </div>
              <h2 className="font-headline-lg text-headline-lg text-white font-bold leading-tight">
                Join thousands of patients and caregivers who understand their prescriptions.
              </h2>
              <p className="font-body-lg text-body-lg text-inverse-on-surface/85 leading-relaxed">
                Upload prescription photos, get plain-language medication summaries, track schedules, and ask your AI companion clinical questions — all HIPAA compliant.
              </p>
            </div>

            <div className="relative z-10 space-y-4 mt-8">
              <div className="flex items-center gap-3 text-inverse-on-surface/90 font-label-md text-label-md">
                <ShieldCheck className="h-5 w-5 text-secondary-fixed" />
                <span>HIPAA BAA Compliant</span>
              </div>
              <div className="flex items-center gap-3 text-inverse-on-surface/90 font-label-md text-label-md">
                <CreditCard className="h-5 w-5 text-secondary-fixed" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-3 text-inverse-on-surface/90 font-label-md text-label-md">
                <Lock className="h-5 w-5 text-secondary-fixed" />
                <span>End-to-End AES-256 Encryption</span>
              </div>
              <div className="flex items-center gap-3 text-inverse-on-surface/90 font-label-md text-label-md">
                <CheckCircle2 className="h-5 w-5 text-secondary-fixed" />
                <span>Clinical-grade OCR & plain-language translation</span>
              </div>
            </div>
          </div>

          {/* Right Panel — Signup Form */}
          <div className="p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
            {/* Mobile brand header */}
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <span className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shadow-sm">
                <Pill className="h-5 w-5" />
              </span>
              <span className="font-headline-sm text-headline-sm text-primary font-bold tracking-tight">Create Account</span>
            </div>

            <div className="space-y-2 mb-6">
              <h1 className="font-headline-lg text-headline-lg text-primary font-bold tracking-tight hidden lg:block">Create your account</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Start understanding your prescriptions with clinical-grade AI in under 60 seconds.
              </p>
            </div>

            {/* Important Medical Safety Notice */}
            <div className="mb-6 rounded-xl bg-[#FEF7EA] border border-[#F5D59A] p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-[#78350F] shrink-0 mt-0.5" />
              <p className="font-label-sm text-label-sm text-[#78350F] leading-relaxed">
                <strong className="font-bold">Non-Diagnostic Tool:</strong> AI Prescription Companion reads and explains prescription documentation. It does not diagnose or replace your physician.
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <div className="p-4 rounded-xl bg-error-container/30 border border-error/30 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-error shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-error">{error}</p>
                  </div>
                )}
                
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-on-surface font-label-md font-bold">Full Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. Margaret Roberts" 
                          className="bg-surface-container-lowest border-outline-variant focus-visible:ring-primary h-[52px] rounded-xl text-body-md font-body-md" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-error font-label-sm" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-on-surface font-label-md font-bold">Email Address</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="you@example.com" 
                          className="bg-surface-container-lowest border-outline-variant focus-visible:ring-primary h-[52px] rounded-xl text-body-md font-body-md" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-error font-label-sm" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-on-surface font-label-md font-bold">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showPassword ? "text" : "password"} 
                              className="bg-surface-container-lowest border-outline-variant focus-visible:ring-primary h-[52px] rounded-xl pr-12 text-body-md font-body-md" 
                              {...field} 
                            />
                            <button 
                              type="button" 
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-error font-label-sm" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirm_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-on-surface font-label-md font-bold">Confirm Password</FormLabel>
                        <FormControl>
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            className="bg-surface-container-lowest border-outline-variant focus-visible:ring-primary h-[52px] rounded-xl text-body-md font-body-md" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-error font-label-sm" />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-[52px] rounded-xl bg-primary hover:brightness-110 text-on-primary font-label-lg text-label-lg font-bold shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2" 
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-on-primary border-t-transparent" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account & Start Free
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <p className="mt-4 text-xs text-on-surface-variant font-label-sm text-center leading-relaxed">
              By creating an account, you acknowledge our{" "}
              <Link href="#" className="text-secondary hover:underline font-semibold">Clinical Safety Notice</Link> and{" "}
              <Link href="#" className="text-secondary hover:underline font-semibold">HIPAA Privacy Terms</Link>.
            </p>

            {/* Footer */}
            <div className="mt-6 pt-5 border-t border-surface-container-high">
              <p className="text-center font-body-md text-body-md text-on-surface-variant">
                Already have an account?{" "}
                <Link href="/login" className="text-secondary hover:underline font-semibold">
                  Sign in
                </Link>
              </p>
            </div>

            {/* Mobile trust badges */}
            <div className="lg:hidden mt-5 pt-4 border-t border-surface-container-high flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-on-surface-variant font-label-sm text-label-sm">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-secondary" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-secondary" />
                <span>No credit card</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-secondary" />
                <span>256-Bit Encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
