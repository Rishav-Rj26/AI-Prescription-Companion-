"use client";

import Link from "next/link";
import { Plus, FileText, Loader2, ArrowRight, Activity, Trash2 } from "lucide-react";
import { usePrescriptions, useDeletePrescription } from "@/lib/queries/prescriptions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HistoryPage() {
  const { data: prescriptions, isLoading, isError } = usePrescriptions();
  const { mutate: deletePrescription, isPending: isDeleting } = useDeletePrescription();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "uploaded": return "bg-blue-100 text-[#1e4263] border-[#a8caf1]";
      case "processing": return "bg-[#fef7ea] text-[#78350f] border-[#f5d59a]";
      case "completed": return "bg-[#edf7ee] text-[#14532d] border-[#b8e2be]";
      case "failed": return "bg-[#ffdad6] text-[#93000a] border-[#ffa4a4]";
      default: return "bg-[#f6f8fa] text-gray-800";
    }
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    if (window.confirm("Are you sure you want to delete this prescription?")) {
      deletePrescription(id);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#192128]">History</h1>
            <p className="text-[#4a5866] mt-1">Review your past uploaded prescriptions.</p>
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
            <Loader2 className="h-8 w-8 animate-spin text-[#1e4263]" />
          </div>
        ) : isError ? (
          <div className="p-4 bg-[#ffdad6]/50 text-[#93000a] rounded-lg border border-[#ffa4a4] text-center">
            Failed to load prescriptions. Please try again later.
          </div>
        ) : prescriptions?.length === 0 ? (
          <Card className="border-dashed bg-transparent shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="p-4 bg-[#ecf4fe] rounded-full">
                <FileText className="h-10 w-10 text-[#1e4263]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No history yet</h3>
                <p className="text-[#4a5866] max-w-sm mt-1">
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
                <CardHeader className="pb-3 relative">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-4 right-4 text-[#73777e] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/30"
                    onClick={(e) => handleDelete(e, p.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="flex flex-col items-start space-y-2">
                    <Badge variant="outline" className={getStatusColor(p.status)}>
                      {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                    </Badge>
                    <span className="text-xs text-[#73777e]">
                      {new Date(p.uploaded_at).toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="text-lg mt-4">
                    {p.medicines_summary ? p.medicines_summary : `Prescription #${p.id}`}
                  </CardTitle>
                  <CardDescription>
                    {p.page_count} page{p.page_count !== 1 ? 's' : ''}
                    {(p.test_count ?? 0) > 0 && ` • ${p.test_count} tests`}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-0">
                  <Link href={`/dashboard/${p.id}`} className="w-full">
                    <Button variant="ghost" className="w-full justify-between group-hover:text-[#1e4263]">
                      View Details
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
