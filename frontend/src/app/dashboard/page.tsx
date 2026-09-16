"use client";

import Link from "next/link";
import { Plus, FileText, ArrowRight, CheckCircle2, Clock, Calendar, AlertTriangle, Pill } from "lucide-react";
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

  const todaySchedules = scheduleData?.schedules.filter(s => s.status === 'pending') || [];
  const nextDoses = todaySchedules.slice(0, 3);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "uploaded": return "bg-surface-container-low text-primary border-primary-fixed-dim";
      case "processing": return "bg-[#FEF7EA] text-[#78350F] border-[#F5D59A]";
      case "completed": return "bg-[#EDF7EE] text-[#14532D] border-[#B8E2BE]";
      case "failed": return "bg-error-container text-on-error-container border-error";
      default: return "bg-surface-container text-on-surface-variant";
    }
  };

  const handleMarkTaken = (id: number) => {
    updateSchedule({ id, updates: { status: 'taken' } });
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-primary tracking-tight">Dashboard</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Welcome back. Here is your overview for today.</p>
        </div>
        <Link href="/dashboard/upload">
          <Button className="gap-2 bg-primary hover:brightness-110 rounded-xl shadow-sm px-5 py-2.5 font-label-md text-label-md">
            <Plus className="h-4 w-4" />
            Upload Prescription
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule Overview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-container-lowest rounded-2xl tier-1-card overflow-hidden">
            <div className="px-6 py-5 flex items-center justify-between border-b border-outline-variant/60">
              <div className="space-y-1">
                <h2 className="font-headline-sm text-headline-sm text-primary font-bold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-secondary" />
                  Upcoming Doses
                </h2>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Your next scheduled medications for today</p>
              </div>
              <Link href="/dashboard/schedule">
                <Button variant="outline" size="sm" className="rounded-xl border-outline-variant/60 text-primary hover:bg-surface-container-low font-label-sm">Full Schedule</Button>
              </Link>
            </div>
            <div className="p-6">
              {loadingSched ? (
                <div className="h-32 flex items-center justify-center">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : nextDoses.length === 0 ? (
                <div className="py-10 text-center bg-surface-container-low/50 rounded-xl border border-dashed border-outline-variant/60">
                  <Calendar className="h-8 w-8 text-outline mx-auto mb-3" />
                  <p className="text-on-surface font-headline-sm text-headline-sm font-bold">No upcoming doses</p>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1">You're all caught up for now!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {nextDoses.map(dose => (
                    <div key={dose.id} className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/60 hover:border-primary-fixed-dim transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="bg-primary-container text-on-primary font-bold px-3 py-2 rounded-xl tabular-nums font-label-md text-label-md shadow-sm">
                          {dose.scheduled_time.substring(0,5)}
                        </div>
                        <div>
                          <p className="font-headline-sm text-headline-sm text-on-surface font-bold">{dose.medicine_name}</p>
                          <p className="font-body-md text-body-md text-on-surface-variant">{dose.dosage} {dose.strength && `(${dose.strength})`}</p>
                        </div>
                      </div>
                      <Button size="sm" className="bg-[#15803d] hover:bg-[#166534] rounded-xl shadow-sm font-label-sm" onClick={() => handleMarkTaken(dose.id)}>
                        <CheckCircle2 className="h-4 w-4 mr-1.5" /> Take
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Prescriptions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface-container-lowest rounded-2xl tier-1-card overflow-hidden">
            <div className="px-6 py-5 flex items-center justify-between border-b border-outline-variant/60">
              <h2 className="font-headline-sm text-headline-sm text-primary font-bold">Recent Prescriptions</h2>
              <Link href="/dashboard/history" className="font-label-sm text-label-sm text-secondary hover:underline font-semibold">
                View All
              </Link>
            </div>
            <div className="p-5">
              {loadingPresc ? (
                <div className="h-32 flex items-center justify-center">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : recentPrescriptions.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="font-body-md text-body-md text-on-surface-variant">No prescriptions yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentPrescriptions.map(p => (
                    <Link key={p.id} href={`/dashboard/${p.id}`} className="block group">
                      <div className="p-4 rounded-xl border border-outline-variant/60 hover:border-primary-fixed-dim hover:bg-surface-container-low transition-all duration-150">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-headline-sm text-[15px] font-bold text-on-surface group-hover:text-primary transition-colors">
                            {p.medicines_summary ? p.medicines_summary : `Prescription #${p.id}`}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="font-label-sm text-label-sm text-outline">{new Date(p.uploaded_at).toLocaleDateString()}</span>
                          <Badge variant="outline" className={getStatusColor(p.status) + " font-label-sm text-[10px] px-2 py-0.5 rounded-full font-semibold"}>
                            {p.status}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
