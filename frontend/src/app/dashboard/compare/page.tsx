"use client";

import { useState } from "react";
import { Loader2, GitCompareArrows, AlertCircle, Plus, Minus, FileText } from "lucide-react";
import { usePrescriptions } from "@/lib/queries/prescriptions";
import { useComparePrescriptions } from "@/lib/queries/comparison";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto pb-24">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Compare Prescriptions</h1>
        <p className="text-gray-500 mt-1">Select two prescriptions to see what has changed between them.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-end gap-4">
            <div className="flex-1 w-full space-y-2">
              <label className="text-sm font-medium">Prescription A (Older)</label>
              <Select value={prescA} onValueChange={(v) => setPrescA(v || "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select first prescription" />
                </SelectTrigger>
                <SelectContent>
                  {completedPrescriptions.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      #{p.id} - {new Date(p.uploaded_at).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="pb-2 hidden md:block">
              <GitCompareArrows className="h-6 w-6 text-gray-400" />
            </div>

            <div className="flex-1 w-full space-y-2">
              <label className="text-sm font-medium">Prescription B (Newer)</label>
              <Select value={prescB} onValueChange={(v) => setPrescB(v || "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select second prescription" />
                </SelectTrigger>
                <SelectContent>
                  {completedPrescriptions.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()} disabled={p.id.toString() === prescA}>
                      #{p.id} - {new Date(p.uploaded_at).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="w-full md:w-auto" 
              onClick={handleCompare} 
              disabled={!prescA || !prescB || prescA === prescB || isComparing}
            >
              {isComparing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : "Compare"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {diff && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              This comparison shows the differences between two prescriptions. It does not indicate whether any change is an improvement, a concern, or medically significant. Always consult your doctor regarding changes in your medication.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ADDED */}
            <Card className="border-green-200 overflow-hidden">
              <div className="bg-green-50 px-4 py-3 border-b border-green-100 flex items-center justify-between">
                <h3 className="font-semibold text-green-900 flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Added in B
                </h3>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">{diff.added.length}</Badge>
              </div>
              <CardContent className="p-0">
                {diff.added.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">No new medications added.</div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {diff.added.map(med => (
                      <li key={med.id} className="p-4 bg-white hover:bg-green-50/30 transition-colors">
                        <div className="font-medium text-gray-900">{med.name}</div>
                        <div className="text-sm text-gray-500 mt-1 space-x-2">
                          {med.dosage && <span>{med.dosage}</span>}
                          {med.frequency && <span>• {med.frequency}</span>}
                          {med.duration && <span>• {med.duration}</span>}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* REMOVED */}
            <Card className="border-red-200 overflow-hidden">
              <div className="bg-red-50 px-4 py-3 border-b border-red-100 flex items-center justify-between">
                <h3 className="font-semibold text-red-900 flex items-center gap-2">
                  <Minus className="h-4 w-4" /> Removed in B
                </h3>
                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">{diff.removed.length}</Badge>
              </div>
              <CardContent className="p-0">
                {diff.removed.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">No medications removed.</div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {diff.removed.map(med => (
                      <li key={med.id} className="p-4 bg-white hover:bg-red-50/30 transition-colors">
                        <div className="font-medium text-gray-900 line-through decoration-red-300">{med.name}</div>
                        <div className="text-sm text-gray-500 mt-1 space-x-2">
                          {med.dosage && <span>{med.dosage}</span>}
                          {med.frequency && <span>• {med.frequency}</span>}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* CHANGED */}
            <Card className="md:col-span-2 border-amber-200 overflow-hidden">
              <div className="bg-amber-50 px-4 py-3 border-b border-amber-100 flex items-center justify-between">
                <h3 className="font-semibold text-amber-900 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> Changed
                </h3>
                <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">{diff.changed.length}</Badge>
              </div>
              <CardContent className="p-0">
                {diff.changed.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">No modifications to existing medications.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 text-gray-600 border-b">
                        <tr>
                          <th className="px-4 py-3 font-medium">Medicine</th>
                          <th className="px-4 py-3 font-medium">Field</th>
                          <th className="px-4 py-3 font-medium text-gray-500">From (Older)</th>
                          <th className="px-4 py-3 font-medium text-amber-700">To (Newer)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {diff.changed.map((change, idx) => {
                          const changes = [];
                          if (change.dosage_a !== change.dosage_b) changes.push({ field: 'Dosage', a: change.dosage_a, b: change.dosage_b });
                          if (change.frequency_a !== change.frequency_b) changes.push({ field: 'Frequency', a: change.frequency_a, b: change.frequency_b });
                          if (change.duration_a !== change.duration_b) changes.push({ field: 'Duration', a: change.duration_a, b: change.duration_b });
                          if (change.strength_a !== change.strength_b) changes.push({ field: 'Strength', a: change.strength_a, b: change.strength_b });
                          
                          return changes.map((c, i) => (
                            <tr key={`${idx}-${i}`} className="hover:bg-amber-50/20">
                              {i === 0 ? (
                                <td className="px-4 py-3 font-medium text-gray-900" rowSpan={changes.length}>
                                  {change.medicine_name}
                                </td>
                              ) : null}
                              <td className="px-4 py-3 text-gray-600">{c.field}</td>
                              <td className="px-4 py-3 text-gray-500 line-through decoration-gray-300">{c.a || '-'}</td>
                              <td className="px-4 py-3 font-medium text-amber-700">{c.b || '-'}</td>
                            </tr>
                          ));
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* UNCHANGED */}
            <Card className="md:col-span-2 border-gray-200 overflow-hidden opacity-70">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-600 flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Unchanged
                </h3>
                <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">{diff.unchanged.length}</Badge>
              </div>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2">
                  {diff.unchanged.length === 0 ? (
                    <span className="text-sm text-gray-500">None</span>
                  ) : (
                    diff.unchanged.map(med => (
                      <Badge key={med.id} variant="secondary" className="font-normal">{med.name}</Badge>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
