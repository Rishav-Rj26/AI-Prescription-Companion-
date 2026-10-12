import { AuthView } from "@/components/auth/auth-view";

export const metadata = {
  title: "Create Account — AI Prescription Companion",
  description: "Create an encrypted profile in under two minutes with AI Prescription Companion. HIPAA-compliant and 256-bit AES encrypted.",
};

export default function SignupPage() {
  return <AuthView initialMode="signup" />;
}
