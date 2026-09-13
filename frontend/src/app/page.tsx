import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="text-center max-w-2xl space-y-6">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
          AI Prescription Companion
        </h1>
        <p className="text-xl text-gray-600">
          Understand your prescriptions instantly. Upload an image and get clear, structured information about your medicines, dosage, and tests.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Link href="/signup">
            <Button size="lg" className="w-full sm:w-auto text-lg px-8">Get Started</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8">Log In</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
