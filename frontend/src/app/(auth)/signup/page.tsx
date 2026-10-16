import { AuthView } from "@/components/auth/auth-view";

export const metadata = {
  title: "Create Account — AI Prescription Companion",
  description: "Create a profile to organize prescription scans and review plain-language medication details.",
};

export default function SignupPage() {
  return <AuthView initialMode="signup" />;
}
