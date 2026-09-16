"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/api";
import { loginSchema, LoginFormData } from "@/lib/validations/auth";

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

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormData) {
    setError(null);
    try {
      const response = await api.post("/auth/login", {
        email: data.email,
        password: data.password,
      });
      
      localStorage.setItem("token", response.data.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Invalid email or password."
      );
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md tier-1-card border-outline-variant/60 rounded-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-headline-md text-primary text-center">Welcome back</CardTitle>
          <CardDescription className="text-center font-body-md text-on-surface-variant">
            Enter your credentials to access your account
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
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-on-surface font-label-md">Password</FormLabel>
                      <Link href="#" className="text-xs text-secondary hover:underline font-label-sm">
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input type="password" className="bg-surface-container-lowest border-outline-variant focus-visible:ring-primary h-12 rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage className="text-error" />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-label-lg" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Logging in..." : "Log In"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-surface-container pt-6">
          <p className="text-sm font-body-md text-on-surface-variant">
            Don't have an account?{" "}
            <Link href="/signup" className="text-secondary hover:underline font-semibold">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
