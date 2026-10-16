import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Prescription Companion — Clear, Safe Prescription Comprehension",
  description: "AI-powered prescription reading, transcription, and plain-language translation for patients and caregivers. HIPAA-compliant, clinical-grade OCR.",
};

import { Providers } from "@/components/providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
