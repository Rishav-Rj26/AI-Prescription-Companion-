"use client";

import Link from "next/link";
import { Plus, FileText, Loader2, ArrowRight } from "lucide-react";
import { usePrescriptions } from "@/lib/queries/prescriptions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { data: prescriptions, isLoading, isError } = usePrescriptions();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "uploaded": return "bg-blue-100 text-blue-800 border-blue-200";
      case "processing": return "bg-amber-100 text-amber-800 border-amber-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "failed": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Your Prescriptions</h1>
            <p className="text-gray-500 mt-1">Manage and review your uploaded prescriptions.</p>
          </div>
          <Link href="/dashboard/upload">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Upload New
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : isError ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 text-center">
            Failed to load prescriptions. Please try again later.
          </div>
        ) : prescriptions?.length === 0 ? (
          <Card className="border-dashed bg-transparent shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="p-4 bg-indigo-50 rounded-full">
                <FileText className="h-10 w-10 text-indigo-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No prescriptions yet</h3>
                <p className="text-gray-500 max-w-sm mt-1">
                  Upload your first prescription image or PDF to get AI-powered insights.
                </p>
              </div>
              <Link href="/dashboard/upload">
                <Button variant="outline" className="mt-4">Upload Prescription</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prescriptions?.map((p) => (
              <Card key={p.id} className="group hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className={getStatusColor(p.status)}>
                      {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {new Date(p.uploaded_at).toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="text-lg mt-2">Prescription #{p.id}</CardTitle>
                  <CardDescription>{p.page_count} page{p.page_count !== 1 ? 's' : ''}</CardDescription>
                </CardHeader>
                <CardFooter className="pt-0">
                  <Button variant="ghost" className="w-full justify-between group-hover:text-indigo-600" asChild>
                    <Link href={`/dashboard/${p.id}`}>
                      View Details
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
