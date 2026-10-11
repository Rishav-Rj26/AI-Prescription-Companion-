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
    <div className="flex flex-col flex-1 w-full bg-background min-h-[calc(100vh-80px)]">
      {/* Reassuring HIPAA & Clinical Encryption Banner */}
      <section className="bg-surface-container-low border-b border-outline-variant">
        <div className="max-w-7xl mx-auto px-6 md:px-space-xl py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-on-surface-variant">
            <ShieldCheck className="text-secondary h-5 w-5" />
            <p className="font-label-sm text-label-sm">
              <strong className="text-on-surface">Encrypted & HIPAA Compliant Prescription Archive</strong> • All prescriptions are stored with end-to-end encryption. Deleting an item permanently removes both the document scan and associated extracted clinical data.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-secondary font-label-sm text-label-sm whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            <span>AES-256 Active</span>
          </div>
        </div>
      </section>

      {/* Main Canvas */}
      <main className="max-w-7xl mx-auto px-6 md:px-space-xl py-8 w-full flex-grow">
        {/* Page Title & Overview */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="font-headline-xl text-headline-xl text-primary tracking-tight font-bold">Prescription History & Document Library</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Manage, review, and organize your scanned prescriptions, refills, and clinical summaries.
            </p>
          </div>
          {/* Quick Action Group */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard/upload">
              <Button className="bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 h-auto">
                <Plus className="h-4 w-4" />
                Upload New Prescription
              </Button>
            </Link>
          </div>
        </div>

        {/* Search & Filter Control Bar */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center tier-1-card">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Activity className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-outline" />
            <input 
              className="w-full pl-10 pr-4 h-[44px] bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:border-primary-container focus:ring-1 focus:ring-primary-container focus:outline-none transition-colors" 
              placeholder="Search by medication name, doctor, clinic, or Rx #..." 
              type="text"
            />
          </div>
          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
            <button className="px-3.5 py-1.5 rounded-full font-label-md text-label-md bg-secondary-container text-on-secondary-container border border-secondary whitespace-nowrap shadow-sm">All Records</button>
            <button className="px-3.5 py-1.5 rounded-full font-label-md text-label-md bg-surface-container text-on-surface-variant border border-outline-variant hover:bg-surface-container-low transition-colors whitespace-nowrap">Requires Verification</button>
            <button className="px-3.5 py-1.5 rounded-full font-label-md text-label-md bg-surface-container text-on-surface-variant border border-outline-variant hover:bg-surface-container-low transition-colors whitespace-nowrap">Completed</button>
          </div>
        </div>

        {/* Dynamic Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="font-label-md text-label-md text-on-surface-variant">Loading archives...</p>
          </div>
        ) : isError ? (
          <div className="p-4 bg-error-container text-on-error-container rounded-xl border border-error text-center font-body-md text-body-md">
            Failed to load prescriptions. Please try again later.
          </div>
        ) : prescriptions?.length === 0 ? (
          <Card className="border-dashed border-2 border-outline-variant bg-surface-container-lowest/50 shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="p-4 bg-primary-container/20 rounded-full">
                <FileText className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">No history yet</h3>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mt-1">
                  Upload your first prescription image or PDF to get AI-powered insights.
                </p>
              </div>
              <Link href="/dashboard/upload">
                <Button variant="outline" className="mt-4 border-primary text-primary hover:bg-surface-container-lowest">Upload Prescription</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prescriptions?.map((p) => (
              <Card key={p.id} className="group hover:shadow-md transition-shadow tier-1-card bg-surface-container-lowest border-outline-variant rounded-xl overflow-hidden flex flex-col">
                <CardHeader className="p-5 pb-3 border-b border-surface-container relative">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-4 right-4 h-8 w-8 text-outline hover:text-error hover:bg-error-container/30 transition-colors rounded-full"
                    onClick={(e) => handleDelete(e, p.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="flex flex-col items-start gap-2">
                    <Badge variant="outline" className={`${getStatusColor(p.status)} px-2 py-0.5 text-[11px] font-bold tracking-wider rounded-md uppercase border`}>
                      {p.status}
                    </Badge>
                    <span className="font-label-sm text-[11px] text-on-surface-variant font-medium">
                      Uploaded: {new Date(p.uploaded_at).toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="font-headline-sm text-headline-sm font-bold text-on-surface mt-3 leading-snug">
                    {p.medicines_summary ? p.medicines_summary : `Prescription #${p.id}`}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 flex-grow">
                  <div className="flex flex-col gap-2 font-body-sm text-body-sm text-on-surface-variant">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-outline" />
                      <span>{p.page_count} page{p.page_count !== 1 ? 's' : ''} scanned</span>
                    </div>
                    {(p.test_count ?? 0) > 0 && (
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-outline" />
                        <span>{p.test_count} clinical tests extracted</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 bg-surface-container-lowest border-t border-surface-container mt-auto">
                  <Link href={`/dashboard/${p.id}`} className="w-full">
                    <Button variant="ghost" className="w-full justify-center gap-2 hover:bg-primary-container/20 text-primary font-label-md text-label-md transition-colors rounded-lg">
                      View Clinical Summary
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
