"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/api";
import { registerSchema, RegisterFormData } from "@/lib/validations/auth";

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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

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
      router.push("/dashboard"); // We'll create this later
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "An error occurred during signup."
      );
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md tier-1-card border-outline-variant/60 rounded-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-headline-md text-primary text-center">Create an account</CardTitle>
          <CardDescription className="text-center font-body-md text-on-surface-variant">
            Enter your information to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="p-3 text-sm font-medium text-error bg-error-container/20 border border-error-container rounded-lg">
                  {error}
                </div>
              )}
              
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-on-surface font-label-md">Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" className="bg-surface-container-lowest border-outline-variant focus-visible:ring-primary h-12 rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage className="text-error" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-on-surface font-label-md">Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="m@example.com" className="bg-surface-container-lowest border-outline-variant focus-visible:ring-primary h-12 rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage className="text-error" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-on-surface font-label-md">Password</FormLabel>
                    <FormControl>
                      <Input type="password" className="bg-surface-container-lowest border-outline-variant focus-visible:ring-primary h-12 rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage className="text-error" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirm_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-on-surface font-label-md">Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" className="bg-surface-container-lowest border-outline-variant focus-visible:ring-primary h-12 rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage className="text-error" />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-label-lg" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating account..." : "Sign Up"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-surface-container pt-6">
          <p className="text-sm font-body-md text-on-surface-variant">
            Already have an account?{" "}
            <Link href="/login" className="text-secondary hover:underline font-semibold">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
