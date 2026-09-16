"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { usePrescription, useProcessPrescription, useVerifyPrescription } from "@/lib/queries/prescriptions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { ArrowLeft, BrainCircuit, AlertTriangle, FileText, Activity, AlertCircle, Clock, CheckCircle2, Bot } from "lucide-react";
import { PrescriptionMedicine } from "@/types/prescription";
import { TextToSpeechButton } from "@/components/ui/text-to-speech-button";
import { useCurrentUser } from "@/lib/queries/user";

export default function PrescriptionViewer({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const prescriptionId = parseInt(resolvedParams.id, 10);
  const router = useRouter();

  const { data: prescription, isLoading, isError } = usePrescription(prescriptionId);
  const { mutate: processPrescription, isPending: isProcessing, error: processError } = useProcessPrescription();
  const { mutate: verifyPrescription, isPending: isVerifying } = useVerifyPrescription();
  const { data: user } = useCurrentUser();

  // Local state for tracking verifications before submitting
  const [verifications, setVerifications] = useState<{ [medId: number]: string }>({});

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f8fa]/50">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1e4263] border-t-transparent" />
          <p className="text-[#4a5866] font-medium">Loading prescription details...</p>
        </div>
      </div>
    );
  }

  if (isError || !prescription) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f8fa]/50 p-4">
        <Card className="max-w-md w-full border-[#ffa4a4] bg-[#ffdad6]/50/50 shadow-sm">
          <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-[#ffdad6] flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-[#ba1a1a]" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-[#93000a]">Prescription not found</h3>
              <p className="text-sm text-[#93000a]">The prescription you're looking for doesn't exist or you don't have access.</p>
            </div>
            <Button variant="outline" onClick={() => router.push("/dashboard")} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = () => {
    switch (prescription.status) {
      case "uploaded":
        return <Badge variant="outline" className="bg-[#ecf4fe] text-[#1e4263] border-[#a8caf1]">Uploaded</Badge>;
      case "processing":
        return <Badge variant="outline" className="bg-[#fef7ea] text-[#78350f] border-[#f5d59a]">Processing</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-[#edf7ee] text-[#14532d] border-[#b8e2be]">Completed</Badge>;
      case "failed":
        return <Badge variant="outline" className="bg-[#ffdad6]/50 text-[#93000a] border-[#ffa4a4]">Failed</Badge>;
      default:
        return null;
    }
  };

  const handleVerifySubmit = (medId: number, fieldName: string, value: string) => {
    verifyPrescription({
      id: prescription.id,
      confirmations: [
        {
          medicine_id: medId,
          field_name: fieldName,
          confirmed_value: value,
        },
      ],
    });
  };

  const renderMedicineVerification = (med: PrescriptionMedicine) => {
    if (!med.needs_verification) {
      if (med.verified_by) {
        return (
          <div className="mt-3 flex items-center text-xs text-[#14532d] bg-[#edf7ee] px-3 py-1.5 rounded border border-[#b8e2be] w-fit">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
            Verified manually on {med.verified_at ? new Date(med.verified_at).toLocaleDateString() : "unknown date"}
          </div>
        );
      }
      return null;
    }

    const suggested = med.suggested_matches ? JSON.parse(med.suggested_matches) : [];
    const currentValue = verifications[med.id] !== undefined ? verifications[med.id] : med.extracted_name;

    return (
      <div className="mt-4 p-4 bg-[#fef7ea] rounded-lg border border-[#f5d59a]">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-[#b45309] mt-0.5 flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <div>
              <h4 className="text-sm font-semibold text-[#78350f]">Verification Required</h4>
              <p className="text-xs text-[#78350f] mt-0.5">
                The AI was unsure about this medicine name. Please confirm or correct it.
              </p>
            </div>

            {suggested.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-[#78350f]">Suggested Matches:</p>
                <div className="flex flex-wrap gap-2">
                  {suggested.map((suggestion: string) => (
                    <Button
                      key={suggestion}
                      variant={currentValue === suggestion ? "default" : "outline"}
                      size="sm"
                      onClick={() => setVerifications({ ...verifications, [med.id]: suggestion })}
                      className={currentValue === suggestion ? "bg-[#b45309] hover:bg-[#92400e] text-white" : "bg-white text-[#78350f] border-[#f5d59a] hover:bg-[#fef7ea]"}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Input
                value={currentValue}
                onChange={(e) => setVerifications({ ...verifications, [med.id]: e.target.value })}
                className="bg-white border-[#f5d59a] h-9"
                placeholder="Type correct name..."
              />
              <Button
                size="sm"
                className="bg-[#1e4263] hover:bg-[#002c4b] text-white"
                onClick={() => handleVerifySubmit(med.id, "extracted_name", currentValue)}
                disabled={isVerifying || !currentValue.trim()}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getMedicineAudioText = (med: PrescriptionMedicine) => {
    const parts = [];
    parts.push(med.normalized_name || med.extracted_name);
    if (med.strength) parts.push(`Strength: ${med.strength}`);
    if (med.dosage) parts.push(`Dosage: ${med.dosage}`);
    if (med.frequency) parts.push(`Frequency: ${med.frequency}`);
    if (med.duration) parts.push(`Duration: ${med.duration}`);
    if (med.instructions) parts.push(`Instructions: ${med.instructions}`);
    return parts.join(". ");
  };

  return (
    <div className="flex flex-col flex-1 w-full bg-background min-h-[calc(100vh-80px)]">
      {/* Header Context Bar */}
      <div className="bg-surface-container-low border-b border-outline-variant/60 py-3.5 px-6 md:px-space-xl">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")} className="hover:bg-surface-container-highest">
              <ArrowLeft className="h-5 w-5 text-on-surface-variant" />
            </Button>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary"></span>
              </span>
              <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-secondary">Status</span>
              <span className="font-label-md text-label-md font-bold text-primary">Prescription Review</span>
            </div>
            <span className="text-outline-variant hidden sm:inline">•</span>
            <div className="inline-flex items-center gap-2 bg-surface-container-lowest px-3 py-1.5 rounded-lg border border-outline-variant shadow-xs">
              <FileText className="text-primary h-5 w-5" />
              <span className="font-label-md text-label-md font-semibold text-on-surface">Prescription #{prescription.id}</span>
              {getStatusBadge()}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {prescription.status === "uploaded" && (
              <Button 
                onClick={() => processPrescription(prescription.id)} 
                disabled={isProcessing}
                className="font-label-md text-label-md px-4 py-2 rounded-lg bg-primary-container text-on-primary hover:brightness-110 active:scale-95 transition-all shadow-sm font-semibold flex items-center gap-1.5"
              >
                {isProcessing ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary border-t-transparent" />
                ) : (
                  <BrainCircuit className="h-5 w-5" />
                )}
                <span>{isProcessing ? "Processing..." : "Process with AI"}</span>
              </Button>
            )}

            {prescription.status === "completed" && (
              <Button 
                onClick={() => router.push(`/dashboard/${prescription.id}/chat`)} 
                className="font-label-md text-label-md px-4 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-all active:scale-95 shadow-sm font-semibold flex items-center gap-1.5"
              >
                <Bot className="h-5 w-5" />
                <span>Chat with AI</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Clinical Safety Reminder Banner */}
      <aside aria-label="Clinical Notice" className="bg-[#FEF7EA] border-b border-[#F5D59A] px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-[#78350F] flex-shrink-0">
              <AlertCircle className="h-5 w-5" />
            </span>
            <p className="font-body-md text-body-md text-[#78350F]">
              <strong className="font-semibold">Clinical Safety Reminder:</strong> AI Prescription Companion extracts and organizes medication label details for review. Please verify extracted fields against the original document before adding to your schedule.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-[#EDF7EE] border border-[#B8E2BE] px-3 py-1 rounded-full shrink-0">
            <CheckCircle2 className="text-[#14532D] h-4 w-4" />
            <span className="font-label-sm text-label-sm font-semibold text-[#14532D]">Verified Safe System</span>
          </div>
        </div>
      </aside>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-space-xl py-6 flex-1 flex flex-col">
        {prescription.status === "failed" && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle>Extraction Failed</AlertTitle>
            <AlertDescription>
              {prescription.failure_reason || "An unknown error occurred while processing the prescription."}
            </AlertDescription>
          </Alert>
        )}
        
        {processError && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle>Processing Error</AlertTitle>
            <AlertDescription>
              {(processError as any).response?.data?.detail || "Failed to process prescription. Please try again later."}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1">
          
          {/* Images Section */}
          <section className="lg:col-span-5 bg-surface-container-lowest rounded-xl border border-outline-variant tier-1-card overflow-hidden flex flex-col min-h-[600px]">
            <div className="p-4 bg-surface-container-lowest border-b border-outline-variant flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-surface-container-low rounded-lg text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Original Document</h2>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Uploaded on {new Date(prescription.uploaded_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            <div className="relative flex-1 bg-surface-container-highest/60 overflow-y-auto p-4 space-y-4">
              {prescription.pages.map((page, idx) => (
                <div key={page.id} className="bg-white rounded-lg shadow-sm border border-outline-variant/60 overflow-hidden">
                  <div className="bg-surface-container border-b border-outline-variant p-2 px-3 flex justify-between items-center text-xs text-on-surface-variant font-medium">
                    <span>Page {page.page_number}</span>
                    {page.file_size_bytes && <span>{Math.round(page.file_size_bytes / 1024)} KB</span>}
                  </div>
                  {page.file_type.startsWith('image/') ? (
                    <img src={page.file_url} alt={`Prescription page ${page.page_number}`} className="w-full object-contain" />
                  ) : (
                    <div className="p-8 text-center text-on-surface-variant flex flex-col items-center">
                      <FileText className="h-12 w-12 mb-2 text-outline" />
                      <p className="font-body-md text-body-md">PDF Document</p>
                      <a href={page.file_url} target="_blank" rel="noreferrer" className="text-primary hover:underline mt-2 font-label-md text-label-md font-semibold">
                        Open in new tab
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Results Section */}
          <section className="lg:col-span-7 bg-surface-container-lowest rounded-xl border border-outline-variant tier-1-card flex flex-col min-h-[600px]">
            {prescription.status === "completed" ? (
              <>
                <div className="p-4 border-b border-outline-variant bg-surface-container-lowest">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-primary-fixed text-primary rounded-md flex items-center justify-center">
                        <Activity className="h-5 w-5" />
                      </span>
                      <h2 className="font-headline-sm text-headline-sm text-primary font-bold">Structured Extraction</h2>
                    </div>
                    {prescription.medicines.length > 0 && (
                      <span className="font-code-pill text-code-pill px-2.5 py-1 rounded-full bg-[#EDF7EE] text-[#14532D] border border-[#B8E2BE] font-bold">
                        {prescription.medicines.length} Item{prescription.medicines.length !== 1 ? 's' : ''} Detected
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {prescription.medicines.length === 0 ? (
                    <div className="p-8 text-center font-body-md text-body-md text-on-surface-variant">No medicines detected in this prescription.</div>
                  ) : (
                    <div className="divide-y divide-outline-variant/60">
                      {prescription.medicines.map((med) => (
                        <div key={med.id} className="p-6 transition-colors hover:bg-surface-container-low/50">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                            <div>
                              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center flex-wrap gap-2">
                                {med.normalized_name ? (
                                  <>
                                    <span>{med.normalized_name}</span>
                                    {med.extracted_name !== med.normalized_name && (
                                      <span className="font-label-sm text-[11px] font-normal text-on-surface-variant border border-outline-variant rounded px-1.5 py-0.5">Raw: {med.extracted_name}</span>
                                    )}
                                  </>
                                ) : (
                                  <span>{med.extracted_name}</span>
                                )}
                              </h3>
                              <div className="mt-1 flex items-center gap-2">
                                {med.needs_verification ? (
                                  <Badge variant="outline" className="bg-[#FEF7EA] text-[#78350F] border-[#F5D59A] gap-1 px-1.5 py-0 font-semibold rounded-md">
                                    <AlertTriangle className="h-3 w-3" />
                                    Needs Verification
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-[#EDF7EE] text-[#14532D] border-[#B8E2BE] gap-1 px-1.5 py-0 font-semibold rounded-md">
                                    <CheckCircle2 className="h-3 w-3" />
                                    {med.confidence_score && med.confidence_score >= 0.9 ? "High Confidence" : "Verified"}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <TextToSpeechButton 
                              text={getMedicineAudioText(med)} 
                              language={user?.preferred_language || "en"} 
                              size="sm"
                              className="h-9 w-9 rounded-full bg-secondary-container text-on-secondary-container hover:brightness-110 shrink-0" 
                            />
                          </div>

                          {renderMedicineVerification(med)}
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/60 mt-4 shadow-sm">
                            <div>
                              <p className="font-label-sm text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">Strength</p>
                              <p className="font-body-md text-body-md font-semibold text-on-surface">{med.strength || "—"}</p>
                            </div>
                            <div>
                              <p className="font-label-sm text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">Dosage</p>
                              <p className="font-body-md text-body-md font-semibold text-on-surface">{med.dosage || "—"}</p>
                            </div>
                            <div>
                              <p className="font-label-sm text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">Frequency</p>
                              <p className="font-body-md text-body-md font-semibold text-on-surface">{med.frequency || "—"}</p>
                            </div>
                            <div>
                              <p className="font-label-sm text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">Duration</p>
                              <p className="font-body-md text-body-md font-semibold text-on-surface">{med.duration || "—"}</p>
                            </div>
                          </div>
                          
                          {med.instructions && (
                            <div className="mt-4 font-body-md text-body-md text-on-surface bg-surface-container-low/70 p-3 rounded-xl border border-outline-variant/40">
                              <span className="font-label-md text-label-md font-bold text-secondary mr-2">Instructions:</span> 
                              {med.instructions}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Diagnostic Tests */}
                  {prescription.tests && prescription.tests.length > 0 && (
                    <div className="border-t border-outline-variant/60">
                      <div className="p-4 border-b border-outline-variant/60 bg-surface-container-lowest">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 bg-secondary-container text-on-secondary-container rounded-md flex items-center justify-center">
                            <Activity className="h-5 w-5" />
                          </span>
                          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Diagnostic Tests</h2>
                        </div>
                      </div>
                      <div className="divide-y divide-outline-variant/60">
                        {prescription.tests.map((test) => (
                          <div key={test.id} className="p-6">
                            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center">
                              {test.test_name}
                              {test.needs_verification ? (
                                <Badge variant="outline" className="bg-[#FEF7EA] text-[#78350F] border-[#F5D59A] gap-1 ml-3 px-1.5 py-0 font-semibold rounded-md">
                                  <AlertTriangle className="h-3 w-3" />
                                  Needs Verification
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-[#EDF7EE] text-[#14532D] border-[#B8E2BE] gap-1 ml-3 px-1.5 py-0 font-semibold rounded-md">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Verified
                                </Badge>
                              )}
                            </h3>
                            {test.description && <p className="font-body-md text-body-md text-on-surface-variant mt-2">{test.description}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : prescription.status === "processing" ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 p-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary-container rounded-full animate-pulse blur-xl" />
                  <BrainCircuit className="h-16 w-16 text-primary relative animate-bounce" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-headline-md text-headline-md font-bold text-on-surface">AI is analyzing your prescription</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
                    Reading handwriting, identifying medicines, and structuring the data...
                  </p>
                </div>
                <div className="w-48 h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-1/2 rounded-full animate-ping origin-left" style={{ animationDuration: '2s' }} />
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 p-8">
                <div className="p-4 bg-surface-container-low rounded-full">
                  <BrainCircuit className="h-10 w-10 text-outline" />
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Ready for Analysis</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mt-2">
                    Click "Process with AI" to extract medicines, dosages, and tests from this prescription.
                  </p>
                </div>
              </div>
            )}
            
          </section>
        </div>
      </div>
    </div>
  );
}
