"use client";

import { useState } from "react";
import { format, addDays, subDays, isToday, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle2, XCircle, Bell, AlertTriangle, Loader2 } from "lucide-react";
import { useSchedules, useUpdateSchedule } from "@/lib/queries/schedules";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Schedule } from "@/types/schedule";

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const dateStr = format(currentDate, "yyyy-MM-dd");
  
  const { data: scheduleData, isLoading, isError } = useSchedules(dateStr);
  const { mutate: updateSchedule } = useUpdateSchedule();
  const [editingTimeId, setEditingTimeId] = useState<number | null>(null);
  const [newTime, setNewTime] = useState<string>("");

  const handlePrevDay = () => setCurrentDate(subDays(currentDate, 1));
  const handleNextDay = () => setCurrentDate(addDays(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleStatusUpdate = (id: number, status: "taken" | "skipped" | "snoozed") => {
    updateSchedule({ id, updates: { status } });
  };

  const handleTimeUpdate = (id: number) => {
    if (newTime) {
      updateSchedule({ id, updates: { scheduled_time: `${newTime}:00` } });
      setEditingTimeId(null);
    }
  };

  const getTimeOfDay = (timeStr: string) => {
    const hour = parseInt(timeStr.split(":")[0]);
    if (hour >= 5 && hour < 12) return "Morning";
    if (hour >= 12 && hour < 17) return "Afternoon";
    if (hour >= 17 && hour < 21) return "Evening";
    return "Night";
  };

  const groupedSchedules = scheduleData?.schedules.reduce((acc, curr) => {
    const period = getTimeOfDay(curr.scheduled_time);
    if (!acc[period]) acc[period] = [];
    acc[period].push(curr);
    return acc;
  }, {} as Record<string, Schedule[]>) || {};

  const periods = ["Morning", "Afternoon", "Evening", "Night"];

  return (
    <div className="flex flex-col flex-1 w-full bg-background min-h-[calc(100vh-80px)]">
      {/* Non-diagnostic Clinical Notice Banner */}
      <aside className="bg-surface-container-low border-b border-outline-variant px-6 py-2.5 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-on-surface-variant font-label-md text-label-md">
          <ShieldCheck className="text-secondary text-lg flex-shrink-0 h-5 w-5" />
          <span><strong>Clinical Adherence & Schedule Notice:</strong> Schedule and dose reminders are generated from your verified prescription orders. This schedule is for organization and adherence tracking and does not alter physician-directed protocols.</span>
        </div>
      </aside>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-space-xl py-8 space-y-8">
        {/* Page Header & Day Switcher Section */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 font-label-sm text-label-sm bg-surface-container px-2.5 py-0.5 rounded-full text-secondary font-semibold border border-outline-variant">
                  <Activity className="h-3.5 w-3.5" />
                  Caregiver Sync Active
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Synchronized</span>
              </div>
              <h1 className="font-headline-xl text-headline-xl text-primary font-bold tracking-tight">Medication Schedule & Adherence Companion</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">Prescription schedule and synchronized active therapies</p>
            </div>
            
            {/* Quick View Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
              <Button variant="outline" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-outline-variant bg-surface-container-lowest text-primary hover:bg-surface-container transition-colors font-label-md text-label-md shadow-sm h-auto" onClick={() => window.print()}>
                <FileText className="h-4 w-4" />
                <span>Print Daily Schedule (PDF)</span>
              </Button>
            </div>
          </div>

          {/* Interactive Day View / Date Strip */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm tier-1-card">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4 border-r border-outline-variant pr-6">
                <div className="bg-primary-container p-3 rounded-xl text-on-primary-container">
                  <CalendarIcon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">{format(currentDate, "MMMM d, yyyy")}</h2>
                  <p className="font-label-md text-label-md text-on-surface-variant">{format(currentDate, "EEEE")}</p>
                </div>
              </div>
              
              <div className="flex-1 flex justify-center lg:justify-end items-center gap-3">
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-outline-variant hover:bg-surface-container text-primary" onClick={handlePrevDay}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button 
                  variant={isToday(currentDate) ? "default" : "outline"} 
                  className={`px-5 rounded-full font-label-md text-label-md h-10 ${isToday(currentDate) ? "bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container" : "border-outline-variant hover:bg-surface-container text-primary"}`}
                  onClick={handleToday}
                >
                  Today
                </Button>
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-outline-variant hover:bg-surface-container text-primary" onClick={handleNextDay}>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="font-label-md text-label-md text-on-surface-variant">Loading schedule...</p>
          </div>
        ) : isError ? (
          <div className="p-4 bg-error-container text-on-error-container rounded-xl border border-error text-center font-body-md text-body-md">
            Failed to load schedule.
          </div>
        ) : scheduleData?.schedules.length === 0 ? (
          <div className="text-center py-20 bg-surface-container-lowest rounded-2xl border border-outline-variant border-dashed tier-1-card">
            <CalendarIcon className="h-12 w-12 text-outline mx-auto mb-4" />
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">No medications scheduled</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">You don't have any doses scheduled for this day.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {periods.map(period => {
              const periodSchedules = groupedSchedules[period];
              if (!periodSchedules || periodSchedules.length === 0) return null;

              return (
                <div key={period} className="space-y-4 relative pl-4 md:pl-0">
                  <div className="md:hidden absolute left-0 top-0 bottom-0 w-1 bg-surface-container-highest rounded-full"></div>
                  
                  <h3 className="font-headline-sm text-headline-sm font-bold text-primary flex items-center gap-3">
                    <span className="text-2xl">{period === "Night" ? "🌙" : period === "Morning" ? "🌅" : period === "Afternoon" ? "☀️" : "🌆"}</span>
                    {period}
                  </h3>
                  
                  <div className="grid gap-4">
                    {periodSchedules.map(schedule => (
                      <Card key={schedule.id} className={`overflow-hidden transition-all tier-1-card border-outline-variant rounded-2xl ${
                        schedule.status === 'taken' ? 'opacity-80 bg-surface-container-lowest border-l-4 border-l-secondary' : 
                        schedule.status === 'skipped' ? 'opacity-60 bg-surface-container-lowest grayscale-[0.5]' : 
                        'bg-surface-container-lowest hover:shadow-md'
                      }`}>
                        {schedule.needs_review && (
                          <div className="bg-[#FEF7EA] text-[#78350F] px-5 py-2.5 font-label-md text-label-md flex items-center gap-2 border-b border-[#F5D59A]">
                            <AlertTriangle className="h-4 w-4" />
                            Please review this scheduled time. Reason: {schedule.review_reason}
                          </div>
                        )}
                        
                        <CardContent className="p-0">
                          <div className="flex flex-col md:flex-row items-stretch">
                            {/* Time Column */}
                            <div className={`p-5 md:w-40 flex flex-col items-center md:items-start justify-center border-b md:border-b-0 md:border-r border-outline-variant ${
                              schedule.status === 'taken' ? 'bg-secondary-container/20 text-on-surface' :
                              schedule.status === 'skipped' ? 'bg-surface-container-low text-on-surface-variant' :
                              'bg-primary-container/10 text-primary'
                            }`}>
                              {editingTimeId === schedule.id ? (
                                <div className="flex flex-col gap-2 w-full">
                                  <input 
                                    type="time" 
                                    className="w-full border border-outline rounded-lg p-2 font-body-md text-body-md bg-surface-container-lowest focus:ring-1 focus:ring-primary focus:border-primary outline-none" 
                                    value={newTime}
                                    onChange={(e) => setNewTime(e.target.value)}
                                  />
                                  <div className="flex gap-2">
                                    <Button size="sm" className="flex-1 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container font-label-sm text-[11px]" onClick={() => handleTimeUpdate(schedule.id)}>Save</Button>
                                    <Button size="sm" variant="outline" className="flex-1 border-error text-error hover:bg-error-container font-label-sm text-[11px]" onClick={() => setEditingTimeId(null)}>Cancel</Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center md:items-start gap-1">
                                  <div 
                                    className={`font-headline-md text-headline-md font-bold cursor-pointer hover:text-primary transition-colors ${schedule.needs_review ? 'underline decoration-error decoration-wavy' : ''}`}
                                    onClick={() => {
                                      setEditingTimeId(schedule.id);
                                      setNewTime(schedule.scheduled_time.substring(0,5));
                                    }}
                                    title="Click to edit time"
                                  >
                                    {schedule.scheduled_time.substring(0,5)}
                                  </div>
                                  <Badge variant="outline" className={`mt-1 font-label-sm text-[11px] uppercase tracking-wider px-2 py-0.5 rounded border ${
                                    schedule.status === 'taken' ? 'bg-[#EDF7EE] border-[#B8E2BE] text-[#14532D]' :
                                    schedule.status === 'skipped' ? 'bg-surface-container border-outline text-on-surface-variant' :
                                    schedule.status === 'snoozed' ? 'bg-[#FEF7EA] border-[#F5D59A] text-[#92400E]' :
                                    'bg-primary-container text-on-primary-container border-primary/20'
                                  }`}>
                                    {schedule.status}
                                  </Badge>
                                </div>
                              )}
                            </div>
                            
                            {/* Details Column */}
                            <div className="p-5 flex-1 flex flex-col justify-center">
                              <div>
                                <h4 className={`font-headline-sm text-headline-sm font-bold ${schedule.status === 'skipped' ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
                                  {schedule.medicine_name}
                                </h4>
                                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                                  <strong className="font-semibold text-on-surface">Instructions:</strong> Take {schedule.dosage} {schedule.strength && `(${schedule.strength})`}
                                </p>
                              </div>
                              
                              {/* Progress */}
                              {schedule.day_number && schedule.total_days && (
                                <div className="mt-4 pt-4 border-t border-outline-variant border-dashed">
                                  <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant mb-2">
                                    <span>Course Progress</span>
                                    <span className="font-semibold text-primary">Day {schedule.day_number} of {schedule.total_days}</span>
                                  </div>
                                  <Progress value={(schedule.day_number / schedule.total_days) * 100} className="h-1.5 bg-surface-container-highest" />
                                </div>
                              )}
                            </div>
                            
                            {/* Actions Column */}
                            <div className="p-4 md:p-5 flex flex-row md:flex-col items-center justify-center gap-3 border-t md:border-t-0 md:border-l border-outline-variant bg-surface-container-low/50">
                              <Button 
                                size="sm" 
                                variant={schedule.status === 'taken' ? "default" : "outline"}
                                className={`w-full h-10 md:w-28 rounded-lg font-label-md text-label-md transition-colors ${schedule.status === 'taken' ? 'bg-[#15803d] hover:bg-[#166534] border-transparent text-white' : 'bg-surface-container-lowest border-outline-variant text-on-surface hover:bg-[#EDF7EE] hover:text-[#14532D] hover:border-[#B8E2BE]'}`}
                                onClick={() => handleStatusUpdate(schedule.id, 'taken')}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1.5" /> Taken
                              </Button>
                              
                              <Button 
                                size="sm" 
                                variant={schedule.status === 'snoozed' ? "default" : "outline"}
                                className={`w-full h-10 md:w-28 rounded-lg font-label-md text-label-md transition-colors ${schedule.status === 'snoozed' ? 'bg-[#F59E0B] hover:bg-[#D97706] border-transparent text-white' : 'bg-surface-container-lowest border-outline-variant text-on-surface hover:bg-[#FEF7EA] hover:text-[#92400E] hover:border-[#F5D59A]'}`}
                                onClick={() => handleStatusUpdate(schedule.id, 'snoozed')}
                              >
                                <Bell className="h-4 w-4 mr-1.5" /> Snooze
                              </Button>
                              
                              <Button 
                                size="sm" 
                                variant={schedule.status === 'skipped' ? "default" : "outline"}
                                className={`w-full h-10 md:w-28 rounded-lg font-label-md text-label-md transition-colors ${schedule.status === 'skipped' ? 'bg-surface-container-highest border-transparent text-on-surface-variant' : 'bg-surface-container-lowest border-outline-variant text-on-surface hover:bg-surface-container hover:text-on-surface-variant'}`}
                                onClick={() => handleStatusUpdate(schedule.id, 'skipped')}
                              >
                                <XCircle className="h-4 w-4 mr-1.5" /> Skip
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
