"use client";

import { useState } from "react";
import { Loader2, GitCompareArrows, AlertCircle, Plus, Minus, FileText } from "lucide-react";
import { usePrescriptions } from "@/lib/queries/prescriptions";
import { useComparePrescriptions } from "@/lib/queries/comparison";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function ComparePage() {
  const { data: prescriptions, isLoading: loadingPrescriptions } = usePrescriptions();
  const { mutate: compare, data: diff, isPending: isComparing } = useComparePrescriptions();
  
  const [prescA, setPrescA] = useState<string>("");
  const [prescB, setPrescB] = useState<string>("");

  const completedPrescriptions = prescriptions?.filter(p => p.status === "completed") || [];

  const handleCompare = () => {
    if (prescA && prescB && prescA !== prescB) {
      compare({ id_a: parseInt(prescA), id_b: parseInt(prescB) });
    }
  };

  if (loadingPrescriptions) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#1e4263]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 w-full bg-background min-h-[calc(100vh-80px)]">
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-space-xl py-6 space-y-6">
        {/* BREADCRUMB NAVIGATION */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant">
          <span className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer">
            <span className="material-symbols-outlined text-base">home</span>
            Dashboard
          </span>
          <span className="text-outline-variant text-sm">&gt;</span>
          <span className="hover:text-primary transition-colors cursor-pointer">Prescriptions</span>
          <span className="text-outline-variant text-sm">&gt;</span>
          <span className="text-primary font-semibold">Prescription Regimen Comparison</span>
        </nav>

        {/* HEADER / RECORD TITLE & ACTION BAR */}
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/60 shadow-sm tier-1-card flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20 font-label-sm text-label-sm font-semibold flex items-center gap-1.5">
                <GitCompareArrows className="h-3.5 w-3.5" />
                Automated Regimen Diff Engine
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">Compare Prescriptions</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Select two prescriptions to synthesize a differential comparison.
            </p>
            
            <div className="flex flex-col md:flex-row items-end gap-4 mt-4 pt-4 border-t border-outline-variant/40">
              <div className="flex-1 w-full space-y-2">
                <label className="text-sm font-medium text-primary">Baseline Record (Older)</label>
                <Select value={prescA} onValueChange={(v) => setPrescA(v || "")}>
                  <SelectTrigger className="bg-surface-container-low border-outline-variant">
                    <SelectValue placeholder="Select baseline prescription" />
                  </SelectTrigger>
                  <SelectContent>
                    {completedPrescriptions.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        Order #{p.id} - {new Date(p.uploaded_at).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="pb-2 hidden md:flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center">
                  <GitCompareArrows className="h-4 w-4 text-primary" />
                </div>
              </div>

              <div className="flex-1 w-full space-y-2">
                <label className="text-sm font-medium text-primary">Current Encounter (Newer)</label>
                <Select value={prescB} onValueChange={(v) => setPrescB(v || "")}>
                  <SelectTrigger className="bg-surface-container-low border-outline-variant">
                    <SelectValue placeholder="Select current prescription" />
                  </SelectTrigger>
                  <SelectContent>
                    {completedPrescriptions.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()} disabled={p.id.toString() === prescA}>
                        Order #{p.id} - {new Date(p.uploaded_at).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                className="w-full md:w-auto h-10 px-6 rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm"
                onClick={handleCompare} 
                disabled={!prescA || !prescB || prescA === prescB || isComparing}
              >
                {isComparing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : "Compare"}
              </Button>
            </div>
          </div>
        </div>

        {diff && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Inline Clinical Note Banner */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant text-on-surface flex items-start gap-3">
              <AlertCircle className="text-secondary mt-0.5 h-5 w-5" />
              <div className="font-body-md text-body-md">
                <strong className="text-secondary font-semibold">Clinical Note:</strong> This differential comparison is algorithmically generated. It does not indicate whether a change is an improvement, concern, or medically significant. Always consult your prescribing physician.
              </div>
            </div>

            {/* Metric Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-[#EDF7EE]/60 border border-[#B8E2BE] p-3.5 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-headline-lg text-headline-lg font-bold text-[#14532D]">{diff.added.length}</span>
                  <span className="font-label-sm text-label-sm text-[#14532D] font-semibold block">New Added</span>
                </div>
                <Plus className="h-6 w-6 text-[#14532D]/40" />
              </div>
              <div className="bg-[#FEF2F2]/60 border border-[#FECACA] p-3.5 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-headline-lg text-headline-lg font-bold text-[#991B1B]">{diff.removed.length}</span>
                  <span className="font-label-sm text-label-sm text-[#991B1B] font-semibold block">Discontinued</span>
                </div>
                <Minus className="h-6 w-6 text-[#991B1B]/40" />
              </div>
              <div className="bg-[#FEF7EA]/70 border border-[#F5D59A] p-3.5 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-headline-lg text-headline-lg font-bold text-[#78350F]">{diff.changed.length}</span>
                  <span className="font-label-sm text-label-sm text-[#78350F] font-semibold block">Modified</span>
                </div>
                <AlertCircle className="h-6 w-6 text-[#78350F]/40" />
              </div>
              <div className="bg-surface-container-low border border-outline-variant/60 p-3.5 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-headline-lg text-headline-lg font-bold text-primary">{diff.unchanged.length}</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold block">Unchanged</span>
                </div>
                <FileText className="h-6 w-6 text-outline-variant" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ADDED */}
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/80 custom-tier1-shadow overflow-hidden">
                <div className="bg-[#EDF7EE] px-5 py-2.5 border-b border-[#B8E2BE] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#B8E2BE]/50 text-[#14532D] font-code-pill text-code-pill font-bold flex items-center gap-1">
                      <Plus className="h-3 w-3" /> ADDED
                    </span>
                    <span className="font-label-md text-label-md font-bold text-[#14532D]">New Therapy</span>
                  </div>
                  <Badge variant="outline" className="bg-[#EDF7EE] text-[#14532D] border-[#B8E2BE]">{diff.added.length}</Badge>
                </div>
                <div className="p-0">
                  {diff.added.length === 0 ? (
                    <div className="p-5 text-center text-sm text-on-surface-variant">No new medications added.</div>
                  ) : (
                    <ul className="divide-y divide-outline-variant/30">
                      {diff.added.map(med => (
                        <li key={med.id} className="p-4 bg-surface-container-lowest hover:bg-[#EDF7EE]/30 transition-colors">
                          <div className="font-headline-sm text-headline-sm font-bold text-on-surface">{med.name}</div>
                          <div className="font-body-md text-body-md text-on-surface-variant mt-1 space-x-2">
                            {med.dosage && <span>{med.dosage}</span>}
                            {med.frequency && <span>• {med.frequency}</span>}
                            {med.duration && <span>• {med.duration}</span>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* REMOVED */}
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/80 custom-tier1-shadow overflow-hidden">
                <div className="bg-[#FEF2F2] px-5 py-2.5 border-b border-[#FECACA] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#FECACA]/50 text-[#991B1B] font-code-pill text-code-pill font-bold flex items-center gap-1">
                      <Minus className="h-3 w-3" /> DISCONTINUED
                    </span>
                    <span className="font-label-md text-label-md font-bold text-[#991B1B]">Removed from Regimen</span>
                  </div>
                  <Badge variant="outline" className="bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]">{diff.removed.length}</Badge>
                </div>
                <div className="p-0">
                  {diff.removed.length === 0 ? (
                    <div className="p-5 text-center text-sm text-on-surface-variant">No medications removed.</div>
                  ) : (
                    <ul className="divide-y divide-outline-variant/30">
                      {diff.removed.map(med => (
                        <li key={med.id} className="p-4 bg-surface-container-lowest hover:bg-[#FEF2F2]/30 transition-colors">
                          <div className="font-headline-sm text-headline-sm font-bold text-on-surface line-through decoration-red-300">{med.name}</div>
                          <div className="font-body-md text-body-md text-on-surface-variant mt-1 space-x-2">
                            {med.dosage && <span>{med.dosage}</span>}
                            {med.frequency && <span>• {med.frequency}</span>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* CHANGED */}
              <div className="md:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant/80 custom-tier1-shadow overflow-hidden">
                <div className="bg-[#FEF7EA] px-5 py-2.5 border-b border-[#F5D59A] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#FDE68A] text-[#78350F] font-code-pill text-code-pill font-bold">
                      Δ MODIFIED
                    </span>
                    <span className="font-label-md text-label-md font-bold text-[#78350F]">Dose / Timing Shifts</span>
                  </div>
                  <Badge variant="outline" className="bg-[#FEF7EA] text-[#78350F] border-[#F5D59A]">{diff.changed.length}</Badge>
                </div>
                <div className="p-0">
                  {diff.changed.length === 0 ? (
                    <div className="p-5 text-center text-sm text-on-surface-variant">No modifications to existing medications.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant font-label-md text-label-md">
                          <tr>
                            <th className="px-5 py-3 font-semibold">Medicine</th>
                            <th className="px-5 py-3 font-semibold">Attribute</th>
                            <th className="px-5 py-3 font-semibold">Previous State (Older)</th>
                            <th className="px-5 py-3 font-semibold text-[#78350F]">Current State (Newer)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/30 font-body-md text-body-md">
                          {diff.changed.map((change, idx) => {
                            const changes = [];
                            if (change.dosage_a !== change.dosage_b) changes.push({ field: 'Dosage', a: change.dosage_a, b: change.dosage_b });
                            if (change.frequency_a !== change.frequency_b) changes.push({ field: 'Frequency', a: change.frequency_a, b: change.frequency_b });
                            if (change.duration_a !== change.duration_b) changes.push({ field: 'Duration', a: change.duration_a, b: change.duration_b });
                            if (change.strength_a !== change.strength_b) changes.push({ field: 'Strength', a: change.strength_a, b: change.strength_b });
                            
                            return changes.map((c, i) => (
                              <tr key={`${idx}-${i}`} className="hover:bg-[#FEF7EA]/20 transition-colors">
                                {i === 0 ? (
                                  <td className="px-5 py-4 font-bold text-on-surface" rowSpan={changes.length}>
                                    {change.medicine_name}
                                  </td>
                                ) : null}
                                <td className="px-5 py-4 text-on-surface-variant font-medium">{c.field}</td>
                                <td className="px-5 py-4 text-on-surface-variant/80 line-through decoration-outline">{c.a || '-'}</td>
                                <td className="px-5 py-4 font-bold text-[#78350F] bg-[#FEF7EA]/10">{c.b || '-'}</td>
                              </tr>
                            ));
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
              
              {/* UNCHANGED */}
              <div className="md:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant/80 custom-tier1-shadow overflow-hidden opacity-80">
                <div className="bg-surface-container-low px-5 py-2.5 border-b border-outline-variant flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface font-code-pill text-code-pill font-bold">
                      = UNCHANGED
                    </span>
                    <span className="font-label-md text-label-md font-bold text-on-surface-variant">Maintained Therapy</span>
                  </div>
                  <Badge variant="outline" className="bg-surface-container text-on-surface-variant border-outline-variant">{diff.unchanged.length}</Badge>
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap gap-2">
                    {diff.unchanged.length === 0 ? (
                      <span className="text-sm text-on-surface-variant">None</span>
                    ) : (
                      diff.unchanged.map(med => (
                        <Badge key={med.id} variant="secondary" className="font-body-sm bg-surface-container-low text-on-surface border border-outline-variant px-3 py-1">{med.name}</Badge>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
