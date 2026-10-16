"use client";

import { useState } from "react";
import { Loader2, Save, Globe } from "lucide-react";
import { useCurrentUser, useUpdateSettings } from "@/lib/queries/user";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const { data: user, isLoading } = useCurrentUser();
  const { mutate: updateSettings, isPending } = useUpdateSettings();
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [showSaved, setShowSaved] = useState(false);
  const language = selectedLanguage ?? user?.preferred_language ?? "en";

  const handleSave = () => {
    updateSettings({ preferred_language: language }, {
      onSuccess: () => {
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 3000);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#1e4263]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 w-full bg-background min-h-[calc(100vh-80px)]">
      {/* ================= BREADCRUMB & HEADER AREA ================= */}
      <section className="bg-surface-container-lowest border-b border-outline-variant">
        <div className="max-w-7xl mx-auto px-6 md:px-space-xl py-6">
          <nav className="flex items-center space-x-2 text-outline font-label-sm text-label-sm mb-3">
            <span className="hover:text-primary transition-colors cursor-pointer">Dashboard</span>
            <span className="text-outline text-xs">&gt;</span>
            <span className="hover:text-primary transition-colors cursor-pointer">Account & Preferences</span>
            <span className="text-outline text-xs">&gt;</span>
            <span className="text-primary font-bold">Settings & Privacy</span>
          </nav>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div>
              <h1 className="font-headline-xl text-headline-xl text-primary tracking-tight font-bold">Account Settings & Data Privacy</h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1 max-w-3xl">
                Choose your preferred language and review the information saved to your account.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" className="h-12 px-4 rounded-xl border-primary-container text-primary font-label-lg text-label-lg hover:bg-surface-container flex items-center gap-2 transition duration-150 shadow-sm" onClick={() => window.print()}>
                <span className="material-symbols-outlined text-primary">download</span>
                <span>Print Account Summary</span>
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isPending || language === user?.preferred_language}
                className="h-12 px-6 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary-container hover:text-on-primary-container shadow-sm flex items-center gap-2 transition duration-150"
              >
                {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                <span>Save Changes</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MAIN SETTINGS CANVAS ================= */}
      <main className="flex-grow max-w-7xl mx-auto px-6 md:px-space-xl py-8 w-full">
        {showSaved && (
          <div className="mb-6 p-4 bg-[#EDF7EE] text-[#14532D] border border-[#B8E2BE] rounded-xl flex items-center gap-2">
            <Save className="h-5 w-5" />
            <span className="font-label-md text-label-md font-bold">Settings saved successfully!</span>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT ASYMMETRIC NAVIGATION SIDEBAR */}
          <aside className="lg:col-span-3 sticky top-28 space-y-6">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-3 shadow-sm tier-1-card">
              <p className="font-label-sm text-label-sm text-outline px-3 py-2 uppercase tracking-wider font-bold">Privacy Navigation</p>
              <nav className="space-y-1">
                <a className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg bg-surface-container text-primary font-label-lg text-label-lg font-bold border-l-4 border-primary" href="#section-language">
                  <Globe className="h-5 w-5" />
                  <span>General & Language</span>
                </a>
                <a className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-primary font-label-lg text-label-lg transition-colors" href="#section-account">
                  <span className="material-symbols-outlined">person</span>
                  <span>Account Info</span>
                </a>
              </nav>
            </div>
            {/* Privacy guidance */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant text-primary flex items-start gap-3">
              <span className="material-symbols-outlined text-secondary mt-0.5">privacy_tip</span>
              <div>
                <p className="font-label-md text-label-md font-bold">Keep your account private</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">Sign out on shared devices and confirm medication details with the original prescription and your care team.</p>
              </div>
            </div>
          </aside>

          {/* RIGHT CENTRAL SETTINGS PANELS (9 COLUMNS) */}
          <div className="lg:col-span-9 space-y-8">
            {/* ================= SECTION 1: LANGUAGE & LOCALIZATION ================= */}
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 lg:p-space-lg shadow-sm space-y-6 tier-1-card" id="section-language">
              <div className="border-b border-outline-variant pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-surface-container-low text-primary flex items-center justify-center">
                    <Globe className="h-5 w-5" />
                  </span>
                  <h2 className="font-headline-md text-headline-md font-bold text-primary">Language & Localization</h2>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                  Select the language used for supported translated guidance. Medical terms may remain in English to preserve label accuracy.
                </p>
              </div>
              
              {/* Language Selector Cards */}
              <div>
                <label className="block font-label-md text-label-md text-primary font-bold mb-3">Primary Interface & Clinical Instruction Language</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* English Card */}
                  <label 
                    className={`relative flex flex-col p-4 rounded-xl cursor-pointer shadow-sm transition ${language === 'en' ? 'border-2 border-primary bg-surface-container-low' : 'border border-outline-variant hover:border-primary-container bg-surface-container-lowest'}`}
                    onClick={() => setSelectedLanguage('en')}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-headline-sm text-headline-sm font-bold text-primary">English (US)</span>
                        {language === 'en' && <span className="px-2 py-0.5 bg-primary text-on-primary rounded text-[11px] font-label-sm font-bold">Active</span>}
                      </div>
                      <span className={`material-symbols-outlined ${language === 'en' ? 'text-primary' : 'text-outline'}`}>
                        {language === 'en' ? 'radio_button_checked' : 'radio_button_unchecked'}
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      English is used for the interface and supported prescription guidance.
                    </p>
                  </label>
                  
                  {/* Hindi Card */}
                  <label 
                    className={`relative flex flex-col p-4 rounded-xl cursor-pointer shadow-sm transition ${language === 'hi' ? 'border-2 border-primary bg-surface-container-low' : 'border border-outline-variant hover:border-primary-container bg-surface-container-lowest'}`}
                    onClick={() => setSelectedLanguage('hi')}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-headline-sm text-headline-sm font-bold text-primary">हिन्दी (Hindi)</span>
                        {language === 'hi' && <span className="px-2 py-0.5 bg-primary text-on-primary rounded text-[11px] font-label-sm font-bold">Active</span>}
                      </div>
                      <span className={`material-symbols-outlined ${language === 'hi' ? 'text-primary' : 'text-outline'}`}>
                        {language === 'hi' ? 'radio_button_checked' : 'radio_button_unchecked'}
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Supported prescription guidance is translated to Hindi. Medical terms may remain in English.
                    </p>
                  </label>
                </div>
              </div>
            </section>
            
            {/* ================= SECTION 2: ACCOUNT INFO ================= */}
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 lg:p-space-lg shadow-sm space-y-6 tier-1-card" id="section-account">
              <div className="border-b border-outline-variant pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-surface-container-low text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined">person</span>
                  </span>
                  <h2 className="font-headline-md text-headline-md font-bold text-primary">Account Information</h2>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 border-b border-outline-variant pb-3 gap-2 md:gap-0">
                  <span className="font-label-md text-label-md text-on-surface-variant font-bold">Email Address</span>
                  <span className="md:col-span-2 font-body-md text-body-md text-on-surface">{user?.email}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 border-b border-outline-variant pb-3 gap-2 md:gap-0">
                  <span className="font-label-md text-label-md text-on-surface-variant font-bold">Full Name</span>
                  <span className="md:col-span-2 font-body-md text-body-md text-on-surface">{user?.full_name || 'Not provided'}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 pb-3 gap-2 md:gap-0">
                  <span className="font-label-md text-label-md text-on-surface-variant font-bold">Member Since</span>
                  <span className="md:col-span-2 font-body-md text-body-md text-on-surface">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown'}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
