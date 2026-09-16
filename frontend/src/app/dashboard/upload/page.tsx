"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, ArrowUp, ArrowDown, Camera, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useUploadPrescription } from "@/lib/queries/prescriptions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export default function UploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const { mutate: upload, isPending, isSuccess } = useUploadPrescription();

  const handleFiles = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    setError(null);

    const newFiles = Array.from(selectedFiles);
    
    // Validate
    const invalidType = newFiles.find(f => !ALLOWED_TYPES.includes(f.type));
    if (invalidType) {
      setError("Invalid file type. Please upload JPG, PNG, or PDF files only.");
      return;
    }
    
    const tooLarge = newFiles.find(f => f.size > MAX_SIZE);
    if (tooLarge) {
      setError("A file exceeds the 10MB limit. Please compress it and try again.");
      return;
    }

    setFiles(prev => [...prev, ...newFiles]);
    
    // Generate previews (safe for images, PDF shows generic)
    const newPreviews = newFiles.map(f => {
      if (f.type.startsWith("image/")) {
        return URL.createObjectURL(f);
      }
      return "/file.svg"; // Fallback for PDF
    });
    setPreviews(prev => [...prev, ...newPreviews]);
  }, []);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index]); // Cleanup
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setFiles(prev => {
      const copy = [...prev];
      [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
      return copy;
    });
    setPreviews(prev => {
      const copy = [...prev];
      [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
      return copy;
    });
  };

  const moveDown = (index: number) => {
    if (index === files.length - 1) return;
    setFiles(prev => {
      const copy = [...prev];
      [copy[index], copy[index + 1]] = [copy[index + 1], copy[index]];
      return copy;
    });
    setPreviews(prev => {
      const copy = [...prev];
      [copy[index], copy[index + 1]] = [copy[index + 1], copy[index]];
      return copy;
    });
  };

  const handleUpload = () => {
    if (files.length === 0) return;
    upload(files, {
      onSuccess: () => {
        setTimeout(() => router.push("/dashboard"), 1500);
      },
      onError: (err: any) => {
        setError(err.response?.data?.detail || "Upload failed. Please try again.");
      }
    });
  };

  return (
    <div className="flex flex-col flex-1 w-full">
      {/* Non-Diagnostic Clinical Safety Reminder Banner */}
      <aside aria-label="Clinical safety warning" className="bg-surface-container-high border-b border-outline-variant px-6 py-3" role="alert">
        <div className="max-w-7xl mx-auto flex items-start sm:items-center gap-3">
          <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5 sm:mt-0" />
          <p className="font-body-md text-body-md text-on-surface flex-1">
            <strong className="font-headline-sm text-headline-sm text-primary font-bold mr-1">Clinical Safety Reminder:</strong> 
            AI Prescription Companion extracts and organizes medication label details for review. It does not replace your doctor or pharmacist's medical judgment.
          </p>
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-surface-container-lowest border border-outline-variant rounded-md text-on-surface-variant font-label-sm text-label-sm flex-shrink-0">
            <CheckCircle2 className="h-4 w-4" />
            <span>Verified System</span>
          </div>
        </div>
      </aside>

      <div className="max-w-7xl mx-auto px-6 md:px-space-xl py-8 md:py-10 w-full">
        {/* Title Area */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-outline-variant gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-primary font-label-md text-label-md mb-2 font-bold">
              <FileText className="h-4 w-4" />
              <span>STEP 1: INGESTION & VERIFICATION</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-primary tracking-tight font-bold">Upload Prescription or Medication Label</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-1 max-w-3xl">
              Securely submit your prescription sheet, medication box, or pharmacy paperwork. Our clinical AI checks label fidelity and flags critical safety parameters.
            </p>
          </div>
        </div>

        {/* Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <section aria-label="Upload and Document Zone" className="lg:col-span-7 flex flex-col gap-6">
            
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 sm:p-8 tier-1-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-headline-md text-headline-md text-primary font-bold flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary-container-dark" />
                  <span>Upload Document</span>
                </h2>
                <span className="font-label-sm text-label-sm px-2.5 py-1 bg-surface-container-low text-primary rounded-full border border-outline-variant font-semibold">
                  Formats: JPG, PNG, PDF (Max 10MB)
                </span>
              </div>

              {error && (
                <div className="mb-4 p-4 rounded-xl bg-error-container text-on-error-container border border-error flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <p className="font-body-md text-body-md font-medium">{error}</p>
                </div>
              )}

              {/* Status Indicator */}
              {(isPending || isSuccess) && (
                <div className="mb-6 p-4 rounded-xl bg-surface-container-low border border-outline-variant flex items-center justify-center gap-3">
                  {isSuccess ? <CheckCircle2 className="h-5 w-5 text-[#14532D]" /> : <Loader2 className="h-5 w-5 animate-spin text-primary" />}
                  <span className={`font-label-md text-label-md font-bold ${isSuccess ? 'text-[#14532D]' : 'text-primary'}`}>
                    {isSuccess ? "Uploaded successfully! Redirecting..." : "Processing clinical document..."}
                  </span>
                </div>
              )}

              {/* Upload Dropzone */}
              {!isPending && !isSuccess && (
                <>
                  <div 
                    className="border-2 border-dashed border-primary-container hover:border-primary bg-surface-container-low/50 hover:bg-surface-container-low rounded-2xl p-8 text-center transition-all cursor-pointer group flex flex-col items-center justify-center"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleFiles(e.dataTransfer.files);
                    }}
                  >
                    <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-150 text-primary-container-dark">
                      <Camera className="h-8 w-8" />
                    </div>
                    <p className="font-headline-sm text-headline-sm text-on-surface mb-1 font-bold">
                      Drag & drop prescription sheets or labels here
                    </p>
                    <p className="font-body-md text-body-md text-on-surface-variant max-w-md mb-6">
                      For fastest processing: ensure the document is on a flat surface, well-illuminated, with all text clearly visible.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-md">
                      <Button variant="outline" className="flex-1 bg-surface-container-lowest border-outline-variant text-primary font-label-lg font-semibold h-12 rounded-xl" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                        Select Files
                      </Button>
                      <Button className="flex-1 bg-primary text-on-primary font-label-lg font-semibold h-12 rounded-xl" onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}>
                        <Camera className="h-4 w-4 mr-2" />
                        Take Photo
                      </Button>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      multiple 
                      accept={ALLOWED_TYPES.join(",")} 
                      onChange={(e) => handleFiles(e.target.files)} 
                    />
                    <input 
                      type="file" 
                      ref={cameraInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      capture="environment"
                      onChange={(e) => handleFiles(e.target.files)} 
                    />
                  </div>

                  {files.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-outline-variant">
                      <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-4">Selected Pages ({files.length})</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                        {files.map((file, idx) => (
                          <div key={`${file.name}-${idx}`} className="relative group rounded-xl border border-outline-variant overflow-hidden bg-surface-container-lowest aspect-[3/4] shadow-sm">
                            <img src={previews[idx]} alt={`Page ${idx + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                              <div className="flex justify-between">
                                <span className="text-white text-[11px] font-bold bg-black/50 px-2 py-1 rounded">Page {idx + 1}</span>
                                <button onClick={() => removeFile(idx)} className="text-white hover:text-red-400 bg-black/50 rounded p-1 transition-colors">
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                              <div className="flex justify-center gap-2">
                                <button onClick={() => moveUp(idx)} disabled={idx === 0} className="text-white disabled:opacity-30 bg-black/50 rounded p-1 hover:bg-black/70">
                                  <ArrowUp className="h-4 w-4" />
                                </button>
                                <button onClick={() => moveDown(idx)} disabled={idx === files.length - 1} className="text-white disabled:opacity-30 bg-black/50 rounded p-1 hover:bg-black/70">
                                  <ArrowDown className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end">
                        <Button onClick={handleUpload} className="bg-primary hover:brightness-110 text-on-primary font-label-lg font-bold h-12 px-8 rounded-xl tier-1-card">
                          Confirm & Process {files.length} {files.length === 1 ? 'Page' : 'Pages'}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

          {/* Secondary Column - Guidance */}
          <aside className="lg:col-span-5 space-y-4">
            <div className="bg-[#FEF7EA] border border-[#F5D59A] rounded-2xl p-5 shadow-sm">
              <h3 className="font-headline-sm text-headline-sm text-[#78350F] font-bold mb-2 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Guidelines for Accuracy
              </h3>
              <ul className="space-y-3 font-body-md text-body-md text-[#78350F]">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#78350F] mt-2 shrink-0"></span>
                  <span><strong>Include the entire label:</strong> Ensure doctor's name, medication name, dosage instructions, and patient name are visible.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#78350F] mt-2 shrink-0"></span>
                  <span><strong>Flatten folded papers:</strong> Creases can distort critical text like decimal points in dosages.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#78350F] mt-2 shrink-0"></span>
                  <span><strong>Multiple pages:</strong> For hospital discharge summaries, upload all relevant pages in order using the controls on the left.</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 flex items-start gap-3 shadow-sm">
              <Lock className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-label-md text-label-md text-on-surface font-bold">Privacy First Processing</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  Images are processed in memory and immediately discarded if not saved to your history. All data in transit is TLS 1.3 encrypted.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
