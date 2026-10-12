import { AuthView } from "@/components/auth/auth-view";

export const metadata = {
  title: "Sign In — AI Prescription Companion",
  description: "Sign in to your AI Prescription Companion account to manage prescriptions, medication schedules, and clinical guidance.",
};

export default function LoginPage() {
  return <AuthView initialMode="login" />;
}
