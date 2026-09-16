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
    <div className="min-h-screen bg-[#f6f8fa]/50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
                <ArrowLeft className="h-5 w-5 text-[#4a5866]" />
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold text-[#192128]">Prescription #{prescription.id}</h1>
                  {getStatusBadge()}
                </div>
                <p className="text-sm text-[#4a5866] flex items-center gap-1 mt-0.5">
                  <Clock className="h-3.5 w-3.5" />
                  Uploaded on {new Date(prescription.uploaded_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {prescription.status === "uploaded" && (
              <Button 
                onClick={() => processPrescription(prescription.id)} 
                disabled={isProcessing}
                className="gap-2 bg-[#1e4263] hover:bg-[#002c4b]"
              >
                {isProcessing ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Processing...
                  </>
                ) : (
                  <>
                    <BrainCircuit className="h-4 w-4" />
                    Process with AI
                  </>
                )}
              </Button>
            )}

            {prescription.status === "completed" && (
              <Button 
                onClick={() => router.push(`/dashboard/${prescription.id}/chat`)} 
                className="gap-2 bg-[#1e4263] hover:bg-[#002c4b]"
              >
                <Bot className="h-4 w-4" />
                Chat with AI
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Disclaimers & Errors */}
        {(prescription.status === "completed" || prescription.status === "failed") && (
          <Alert className="bg-[#ecf4fe] border-[#e6ecf1] text-[#1e4263]">
            <AlertCircle className="h-5 w-5 text-[#1e4263]" />
            <AlertTitle className="font-semibold">Informational Notice</AlertTitle>
            <AlertDescription>
              This is AI-generated informational content and does not constitute medical advice. Always consult with your healthcare provider.
            </AlertDescription>
          </Alert>
        )}

        {prescription.status === "failed" && (
          <Alert variant="destructive">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle>Extraction Failed</AlertTitle>
            <AlertDescription>
              {prescription.failure_reason || "An unknown error occurred while processing the prescription."}
            </AlertDescription>
          </Alert>
        )}
        
        {processError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle>Processing Error</AlertTitle>
            <AlertDescription>
              {(processError as any).response?.data?.detail || "Failed to process prescription. Please try again later."}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Images Section */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#4a5866]" />
              Original Document
            </h2>
            <div className="space-y-4">
              {prescription.pages.map((page, idx) => (
                <Card key={page.id} className="overflow-hidden shadow-sm">
                  <div className="bg-[#f6f8fa] border-b p-2 px-3 flex justify-between items-center text-xs text-[#4a5866] font-medium">
                    <span>Page {page.page_number}</span>
                    {page.file_size_bytes && <span>{Math.round(page.file_size_bytes / 1024)} KB</span>}
                  </div>
                  {page.file_type.startsWith('image/') ? (
                    <img src={page.file_url} alt={`Prescription page ${page.page_number}`} className="w-full object-contain bg-[#f6f8fa]" />
                  ) : (
                    <div className="p-8 text-center text-[#4a5866] flex flex-col items-center">
                      <FileText className="h-12 w-12 mb-2 text-[#73777e]" />
                      <p>PDF Document</p>
                      <a href={page.file_url} target="_blank" rel="noreferrer" className="text-[#1e4263] hover:underline mt-2 text-sm">
                        Open in new tab
                      </a>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2 space-y-6">
            
            {prescription.status === "completed" ? (
              <>
                <Card className="shadow-sm border-0 ring-1 ring-gray-200">
                  <CardHeader className="bg-[#f6f8fa]/50 border-b">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-[#1e4263]" />
                        Prescribed Medicines
                      </span>
                      {prescription.medicines.length > 0 && (
                        <span className="text-sm font-normal text-[#4a5866] bg-white px-2 py-1 rounded-md border shadow-sm">
                          {prescription.medicines.length} item{prescription.medicines.length !== 1 ? 's' : ''} found
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {prescription.medicines.length === 0 ? (
                      <div className="p-8 text-center text-[#4a5866]">No medicines detected in this prescription.</div>
                    ) : (
                      <div className="divide-y">
                        {prescription.medicines.map((med) => (
                          <div key={med.id} className="p-6 transition-colors hover:bg-[#f6f8fa]/50">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                              <h3 className="text-lg font-bold text-[#192128] flex items-center flex-wrap">
                                {med.normalized_name ? (
                                  <div className="flex items-center gap-2">
                                    <span>{med.normalized_name}</span>
                                    {med.extracted_name !== med.normalized_name && (
                                      <span className="text-xs font-normal text-[#4a5866] border rounded px-1.5 py-0.5">Raw: {med.extracted_name}</span>
                                    )}
                                  </div>
                                ) : (
                                  <span>{med.extracted_name}</span>
                                )}
                                
                                {med.needs_verification ? (
                                  <Badge variant="outline" className="bg-[#fef7ea] text-[#78350f] border-[#f5d59a] gap-1 ml-2">
                                    <AlertTriangle className="h-3 w-3" />
                                    Needs Verification
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-[#edf7ee] text-[#14532d] border-[#b8e2be] gap-1 ml-2">
                                    <CheckCircle2 className="h-3 w-3" />
                                    {med.confidence_score && med.confidence_score >= 0.9 ? "High Confidence" : "Verified"}
                                  </Badge>
                                )}
                              </h3>
                              <TextToSpeechButton 
                                text={getMedicineAudioText(med)} 
                                language={user?.preferred_language || "en"} 
                                size="sm"
                                className="h-8 w-8 rounded-full bg-[#ecf4fe] text-[#1e4263] hover:bg-indigo-100" 
                              />
                            </div>

                            {renderMedicineVerification(med)}
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#f6f8fa] p-4 rounded-lg border border-[#e6ecf1] mt-4">
                              <div>
                                <p className="text-xs text-[#4a5866] uppercase tracking-wider mb-1">Strength</p>
                                <p className="font-medium text-[#192128]">{med.strength || "—"}</p>
                              </div>
                              <div>
                                <p className="text-xs text-[#4a5866] uppercase tracking-wider mb-1">Dosage</p>
                                <p className="font-medium text-[#192128]">{med.dosage || "—"}</p>
                              </div>
                              <div>
                                <p className="text-xs text-[#4a5866] uppercase tracking-wider mb-1">Frequency</p>
                                <p className="font-medium text-[#192128]">{med.frequency || "—"}</p>
                              </div>
                              <div>
                                <p className="text-xs text-[#4a5866] uppercase tracking-wider mb-1">Duration</p>
                                <p className="font-medium text-[#192128]">{med.duration || "—"}</p>
                              </div>
                            </div>
                            
                            {med.instructions && (
                              <div className="mt-4 text-sm text-[#4a5866] bg-[#ecf4fe]/50 p-3 rounded border border-[#a8caf1]">
                                <span className="font-semibold mr-2">Instructions:</span> 
                                {med.instructions}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {prescription.tests && prescription.tests.length > 0 && (
                  <Card className="shadow-sm border-0 ring-1 ring-gray-200">
                    <CardHeader className="bg-[#f6f8fa]/50 border-b">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Activity className="h-5 w-5 text-[#1e4263]" />
                        Diagnostic Tests
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y">
                        {prescription.tests.map((test) => (
                          <div key={test.id} className="p-6">
                            <h3 className="text-md font-bold text-[#192128] flex items-center">
                              {test.test_name}
                              {test.needs_verification ? (
                                <Badge variant="outline" className="bg-[#fef7ea] text-[#78350f] border-[#f5d59a] gap-1 ml-2">
                                  <AlertTriangle className="h-3 w-3" />
                                  Needs Verification
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-[#edf7ee] text-[#14532d] border-[#b8e2be] gap-1 ml-2">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Verified
                                </Badge>
                              )}
                            </h3>
                            {test.description && <p className="text-sm text-[#4a5866] mt-2">{test.description}</p>}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : prescription.status === "processing" ? (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center space-y-6 bg-white rounded-xl border border-[#e6ecf1] shadow-sm">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-100 blur-xl rounded-full animate-pulse" />
                  <BrainCircuit className="h-16 w-16 text-[#1e4263] relative animate-bounce" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-[#192128]">AI is analyzing your prescription</h3>
                  <p className="text-[#4a5866] max-w-sm">
                    Reading handwriting, identifying medicines, and structuring the data...
                  </p>
                </div>
                <div className="w-48 h-1.5 bg-[#f6f8fa] rounded-full overflow-hidden">
                  <div className="h-full bg-[#1e4263] w-1/2 rounded-full animate-ping origin-left" style={{ animationDuration: '2s' }} />
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center space-y-6 bg-white rounded-xl border border-[#e6ecf1] border-dashed shadow-sm">
                <div className="p-4 bg-[#f6f8fa] rounded-full">
                  <BrainCircuit className="h-10 w-10 text-[#73777e]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#192128]">Ready for Analysis</h3>
                  <p className="text-[#4a5866] max-w-sm mt-2">
                    Click "Process with AI" to extract medicines, dosages, and tests from this prescription.
                  </p>
                </div>
                <Button 
                  onClick={() => processPrescription(prescription.id)} 
                  disabled={isProcessing}
                  size="lg"
                  className="gap-2 bg-[#1e4263] hover:bg-[#002c4b]"
                >
                  <BrainCircuit className="h-4 w-4" />
                  Process with AI
                </Button>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
