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
    <div className="min-h-screen bg-[#f6f8fa]/50 p-4 md:p-8 flex items-center justify-center">
      <Card className="w-full max-w-3xl shadow-lg border-0 ring-1 ring-black/5">
        <CardHeader className="text-center pb-8 border-b bg-white/50 rounded-t-xl">
          <CardTitle className="text-2xl font-bold">Upload Prescription</CardTitle>
          <CardDescription>
            Upload one or more pages of your prescription (JPG, PNG, PDF up to 10MB)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          
          {/* Status Stepper */}
          <div className="flex items-center justify-center gap-4 text-sm font-medium">
            <div className={`flex items-center gap-2 ${isSuccess ? "text-[#14532d]" : isPending ? "text-[#1e4263]" : "text-[#192128]"}`}>
              {isSuccess ? <CheckCircle2 className="h-5 w-5" /> : isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <div className="h-6 w-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs">1</div>}
              {isSuccess ? "Uploaded — Ready to Process" : isPending ? "Uploading..." : "Select Files"}
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isPending && !isSuccess && (
            <>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:bg-[#f6f8fa]/50 transition-colors cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFiles(e.dataTransfer.files);
                }}
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-[#ecf4fe] text-[#1e4263] rounded-full group-hover:scale-110 transition-transform">
                    <Upload className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-[#192128]">Click or drag files here</p>
                    <p className="text-sm text-[#4a5866] mt-1">Supports JPG, PNG, PDF</p>
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  multiple 
                  accept={ALLOWED_TYPES.join(",")} 
                  onChange={(e) => handleFiles(e.target.files)} 
                />
              </div>

              <div className="flex justify-center">
                <Button variant="outline" className="gap-2" onClick={() => cameraInputRef.current?.click()}>
                  <Camera className="h-4 w-4" />
                  Capture Photo
                </Button>
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
                <div className="space-y-4">
                  <h3 className="font-semibold text-[#192128]">Selected Pages ({files.length})</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {files.map((file, idx) => (
                      <div key={`${file.name}-${idx}`} className="relative group border rounded-lg overflow-hidden bg-white aspect-[3/4]">
                        <img src={previews[idx]} alt={`Page ${idx + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                          <div className="flex justify-between">
                            <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded">Page {idx + 1}</span>
                            <button onClick={() => removeFile(idx)} className="text-white hover:text-red-400 bg-black/50 rounded p-1">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="flex justify-center gap-2">
                            <button onClick={() => moveUp(idx)} disabled={idx === 0} className="text-white disabled:opacity-30 bg-black/50 rounded p-1">
                              <ArrowUp className="h-4 w-4" />
                            </button>
                            <button onClick={() => moveDown(idx)} disabled={idx === files.length - 1} className="text-white disabled:opacity-30 bg-black/50 rounded p-1">
                              <ArrowDown className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-end pt-4 border-t">
                    <Button onClick={handleUpload} size="lg" className="px-8">
                      Upload {files.length} {files.length === 1 ? 'page' : 'pages'}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
