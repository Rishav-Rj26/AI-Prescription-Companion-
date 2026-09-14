"use client";

import Link from "next/link";
import { Plus, FileText, ArrowRight, CheckCircle2, Clock, Calendar, AlertTriangle } from "lucide-react";
import { usePrescriptions } from "@/lib/queries/prescriptions";
import { useSchedules, useUpdateSchedule } from "@/lib/queries/schedules";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardHomePage() {
  const { data: prescriptions, isLoading: loadingPresc } = usePrescriptions();
  const { data: scheduleData, isLoading: loadingSched } = useSchedules();
  const { mutate: updateSchedule } = useUpdateSchedule();

  const recentPrescriptions = prescriptions?.slice(0, 3) || [];
  
  // Calculate total needs_verification count
  // We can't know for sure unless we fetch every prescription detail, 
  // but let's assume we can fetch schedules or we just show a generic prompt.
  // Wait, we don't have a direct endpoint for unverified count. 
  // Since we don't have a new endpoint, we will just show the 3 most recent prescriptions.

  const todaySchedules = scheduleData?.schedules.filter(s => s.status === 'pending') || [];
  const nextDoses = todaySchedules.slice(0, 3);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "uploaded": return "bg-blue-100 text-blue-800 border-blue-200";
      case "processing": return "bg-amber-100 text-amber-800 border-amber-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "failed": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleMarkTaken = (id: number) => {
    updateSchedule({ id, updates: { status: 'taken' } });
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back. Here is your overview for today.</p>
        </div>
        <Link href="/dashboard/upload">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Upload Prescription
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Schedule Overview */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Clock className="h-5 w-5 text-indigo-600" />
                  Upcoming Doses
                </CardTitle>
                <CardDescription>Your next scheduled medications for today</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/schedule">Full Schedule</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loadingSched ? (
                <div className="h-32 flex items-center justify-center">
                  <div className="animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full" />
                </div>
              ) : nextDoses.length === 0 ? (
                <div className="py-8 text-center bg-gray-50 rounded-lg border border-dashed mt-4">
                  <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 font-medium">No upcoming doses</p>
                  <p className="text-sm text-gray-500">You're all caught up for now!</p>
                </div>
              ) : (
                <div className="space-y-4 mt-4">
                  {nextDoses.map(dose => (
                    <div key={dose.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-start gap-4">
                        <div className="bg-indigo-100 text-indigo-700 font-bold px-3 py-2 rounded-md">
                          {dose.scheduled_time.substring(0,5)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{dose.medicine_name}</p>
                          <p className="text-sm text-gray-500">{dose.dosage} {dose.strength && `(${dose.strength})`}</p>
                        </div>
                      </div>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleMarkTaken(dose.id)}>
                        <CheckCircle2 className="h-4 w-4 mr-2" /> Take
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Prescriptions */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recent Prescriptions</CardTitle>
                <Link href="/dashboard/history" className="text-sm text-indigo-600 hover:underline">
                  View All
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loadingPresc ? (
                <div className="h-32 flex items-center justify-center">
                  <div className="animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full" />
                </div>
              ) : recentPrescriptions.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-sm text-gray-500">No prescriptions yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentPrescriptions.map(p => (
                    <Link key={p.id} href={`/dashboard/${p.id}`} className="block group">
                      <div className="p-3 rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium text-gray-900 group-hover:text-indigo-700">
                            {p.medicines_summary ? p.medicines_summary : `Prescription #${p.id}`}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500">{new Date(p.uploaded_at).toLocaleDateString()}</span>
                          <Badge variant="outline" className={getStatusColor(p.status) + " text-[10px] px-1.5 py-0"}>
                            {p.status}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
