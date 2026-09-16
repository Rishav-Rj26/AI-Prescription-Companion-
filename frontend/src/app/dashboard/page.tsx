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
      case "uploaded": return "bg-[#ecf4fe] text-[#1e4263] border-[#a8caf1]";
      case "processing": return "bg-[#fef7ea] text-[#78350f] border-[#f5d59a]";
      case "completed": return "bg-[#edf7ee] text-[#14532d] border-[#b8e2be]";
      case "failed": return "bg-[#ffdad6] text-[#93000a] border-[#ffa4a4]";
      default: return "bg-[#e7eff9] text-[#4a5866]";
    }
  };

  const handleMarkTaken = (id: number) => {
    updateSchedule({ id, updates: { status: 'taken' } });
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[30px] font-bold tracking-tight text-[#1e4263]">Dashboard</h1>
          <p className="text-[15px] text-[#4a5866] mt-1">Welcome back. Here is your overview for today.</p>
        </div>
        <Link href="/dashboard/upload">
          <Button className="gap-2 bg-[#1e4263] hover:bg-[#002c4b] rounded-xl shadow-sm px-5 py-2.5 text-[15px] font-semibold">
            <Plus className="h-4 w-4" />
            Upload Prescription
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule Overview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl tier-1-card overflow-hidden">
            <div className="px-6 py-5 flex items-center justify-between border-b border-[#e6ecf1]">
              <div className="space-y-1">
                <h2 className="text-[19px] font-bold text-[#1e4263] flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#2e7977]" />
                  Upcoming Doses
                </h2>
                <p className="text-[13px] text-[#4a5866]">Your next scheduled medications for today</p>
              </div>
              <Link href="/dashboard/schedule">
                <Button variant="outline" size="sm" className="rounded-xl border-[#e6ecf1] text-[#1e4263] hover:bg-[#ecf4fe]">Full Schedule</Button>
              </Link>
            </div>
            <div className="p-6">
              {loadingSched ? (
                <div className="h-32 flex items-center justify-center">
                  <div className="animate-spin h-6 w-6 border-2 border-[#1e4263] border-t-transparent rounded-full" />
                </div>
              ) : nextDoses.length === 0 ? (
                <div className="py-10 text-center bg-[#f6f8fa] rounded-xl border border-dashed border-[#e6ecf1]">
                  <Calendar className="h-8 w-8 text-[#73777e] mx-auto mb-3" />
                  <p className="text-[#192128] font-semibold text-[15px]">No upcoming doses</p>
                  <p className="text-[13px] text-[#4a5866] mt-1">You're all caught up for now!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {nextDoses.map(dose => (
                    <div key={dose.id} className="flex items-center justify-between p-4 bg-[#f6f8fa] rounded-xl border border-[#e6ecf1] hover:border-[#a8caf1] transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="bg-[#1e4263] text-white font-bold px-3 py-2 rounded-xl tabular-nums text-[15px] shadow-sm">
                          {dose.scheduled_time.substring(0,5)}
                        </div>
                        <div>
                          <p className="font-semibold text-[#192128] text-[15px]">{dose.medicine_name}</p>
                          <p className="text-[13px] text-[#4a5866]">{dose.dosage} {dose.strength && `(${dose.strength})`}</p>
                        </div>
                      </div>
                      <Button size="sm" className="bg-[#15803d] hover:bg-[#166534] rounded-xl shadow-sm" onClick={() => handleMarkTaken(dose.id)}>
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
          <div className="bg-white rounded-2xl tier-1-card overflow-hidden">
            <div className="px-6 py-5 flex items-center justify-between border-b border-[#e6ecf1]">
              <h2 className="text-[17px] font-bold text-[#1e4263]">Recent Prescriptions</h2>
              <Link href="/dashboard/history" className="text-[13px] text-[#2e7977] hover:underline font-semibold">
                View All
              </Link>
            </div>
            <div className="p-5">
              {loadingPresc ? (
                <div className="h-32 flex items-center justify-center">
                  <div className="animate-spin h-6 w-6 border-2 border-[#1e4263] border-t-transparent rounded-full" />
                </div>
              ) : recentPrescriptions.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-[13px] text-[#4a5866]">No prescriptions yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentPrescriptions.map(p => (
                    <Link key={p.id} href={`/dashboard/${p.id}`} className="block group">
                      <div className="p-4 rounded-xl border border-[#e6ecf1] hover:border-[#a8caf1] hover:bg-[#ecf4fe]/30 transition-all duration-150">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[15px] font-semibold text-[#192128] group-hover:text-[#1e4263] transition-colors">
                            {p.medicines_summary ? p.medicines_summary : `Prescription #${p.id}`}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-[12px] text-[#73777e]">{new Date(p.uploaded_at).toLocaleDateString()}</span>
                          <Badge variant="outline" className={getStatusColor(p.status) + " text-[10px] px-2 py-0.5 rounded-full font-semibold"}>
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
