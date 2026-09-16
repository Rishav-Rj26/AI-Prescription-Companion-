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
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto pb-24">
      {/* Date Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-[#e6ecf1]">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-100 p-3 rounded-lg">
            <CalendarIcon className="h-6 w-6 text-[#1e4263]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#192128]">{format(currentDate, "MMMM d, yyyy")}</h1>
            <p className="text-[#4a5866]">{format(currentDate, "EEEE")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant={isToday(currentDate) ? "default" : "outline"} 
            className={isToday(currentDate) ? "bg-[#1e4263] hover:bg-[#002c4b]" : ""}
            onClick={handleToday}
          >
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextDay}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#1e4263]" />
        </div>
      ) : isError ? (
        <div className="p-4 bg-[#ffdad6]/50 text-[#93000a] rounded-lg text-center">Failed to load schedule.</div>
      ) : scheduleData?.schedules.length === 0 ? (
        <div className="text-center py-20">
          <CalendarIcon className="h-12 w-12 text-[#73777e] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#4a5866]">No medications scheduled</h2>
          <p className="text-[#4a5866] mt-2">You don't have any doses scheduled for this day.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {periods.map(period => {
            const periodSchedules = groupedSchedules[period];
            if (!periodSchedules || periodSchedules.length === 0) return null;

            return (
              <div key={period} className="space-y-4">
                <h3 className="text-lg font-semibold text-[#192128] border-b pb-2 flex items-center gap-2">
                  {period === "Night" ? "🌙" : period === "Morning" ? "🌅" : period === "Afternoon" ? "☀️" : "🌆"}
                  {period}
                </h3>
                
                <div className="grid gap-4">
                  {periodSchedules.map(schedule => (
                    <Card key={schedule.id} className={`overflow-hidden transition-all ${
                      schedule.status === 'taken' ? 'opacity-70 bg-[#edf7ee]/30' : 
                      schedule.status === 'skipped' ? 'opacity-70 bg-[#f6f8fa]' : 
                      'bg-white shadow-sm hover:shadow-md'
                    }`}>
                      {schedule.needs_review && (
                        <div className="bg-[#fef7ea] text-[#78350f] px-4 py-2 text-sm font-medium flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Please review this scheduled time. Reason: {schedule.review_reason}
                        </div>
                      )}
                      
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row items-stretch">
                          {/* Time Column */}
                          <div className={`p-4 flex flex-col items-center justify-center min-w-[100px] border-r border-[#e6ecf1] ${
                            schedule.status === 'taken' ? 'bg-[#edf7ee] text-[#14532d]' :
                            schedule.status === 'skipped' ? 'bg-[#f6f8fa] text-[#4a5866]' :
                            'bg-[#ecf4fe] text-[#1e4263]'
                          }`}>
                            {editingTimeId === schedule.id ? (
                              <div className="flex flex-col gap-2">
                                <input 
                                  type="time" 
                                  className="border rounded p-1 text-sm bg-white" 
                                  value={newTime}
                                  onChange={(e) => setNewTime(e.target.value)}
                                />
                                <div className="flex gap-1">
                                  <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => handleTimeUpdate(schedule.id)}>Save</Button>
                                  <Button size="sm" variant="ghost" className="h-6 px-2 text-xs text-[#ba1a1a]" onClick={() => setEditingTimeId(null)}>Cancel</Button>
                                </div>
                              </div>
                            ) : (
                              <div 
                                className={`text-xl font-bold cursor-pointer ${schedule.needs_review ? 'underline decoration-amber-400 decoration-wavy' : ''}`}
                                onClick={() => {
                                  setEditingTimeId(schedule.id);
                                  setNewTime(schedule.scheduled_time.substring(0,5));
                                }}
                                title="Click to edit time"
                              >
                                {schedule.scheduled_time.substring(0,5)}
                              </div>
                            )}
                            <Badge variant="outline" className={`mt-2 ${
                              schedule.status === 'taken' ? 'bg-green-200 border-green-300 text-[#14532d]' :
                              schedule.status === 'skipped' ? 'bg-[#ecf4fe] border-gray-300 text-[#4a5866]' :
                              schedule.status === 'snoozed' ? 'bg-amber-200 border-amber-300 text-[#78350f]' :
                              'bg-indigo-200 border-indigo-300 text-indigo-800'
                            }`}>
                              {schedule.status.toUpperCase()}
                            </Badge>
                          </div>
                          
                          {/* Details Column */}
                          <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className={`text-lg font-bold ${schedule.status === 'skipped' ? 'line-through text-[#4a5866]' : 'text-[#192128]'}`}>
                                {schedule.medicine_name}
                              </h4>
                              <p className="text-sm text-[#4a5866] mb-2">
                                Take {schedule.dosage} {schedule.strength && `(${schedule.strength})`}
                              </p>
                            </div>
                            
                            {/* Progress */}
                            {schedule.day_number && schedule.total_days && (
                              <div className="mt-3">
                                <div className="flex justify-between text-xs text-[#4a5866] mb-1 font-medium">
                                  <span>Course Progress</span>
                                  <span>Day {schedule.day_number} of {schedule.total_days}</span>
                                </div>
                                <Progress value={(schedule.day_number / schedule.total_days) * 100} className="h-1.5" />
                              </div>
                            )}
                          </div>
                          
                          {/* Actions Column */}
                          <div className="p-4 flex flex-row sm:flex-col items-center justify-center gap-2 border-t sm:border-t-0 sm:border-l border-[#e6ecf1] bg-[#f6f8fa]">
                            <Button 
                              size="sm" 
                              variant={schedule.status === 'taken' ? "default" : "outline"}
                              className={`w-full sm:w-24 ${schedule.status === 'taken' ? 'bg-[#15803d] hover:bg-[#166534] border-green-600 text-white' : 'hover:bg-[#edf7ee] hover:text-[#14532d] hover:border-green-300'}`}
                              onClick={() => handleStatusUpdate(schedule.id, 'taken')}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1.5" /> Taken
                            </Button>
                            
                            <Button 
                              size="sm" 
                              variant={schedule.status === 'snoozed' ? "default" : "outline"}
                              className={`w-full sm:w-24 ${schedule.status === 'snoozed' ? 'bg-[#fef7ea]0 hover:bg-amber-600 border-amber-500 text-white' : 'hover:bg-[#fef7ea] hover:text-amber-600 hover:border-amber-300'}`}
                              onClick={() => handleStatusUpdate(schedule.id, 'snoozed')}
                            >
                              <Bell className="h-4 w-4 mr-1.5" /> Snooze
                            </Button>
                            
                            <Button 
                              size="sm" 
                              variant={schedule.status === 'skipped' ? "default" : "outline"}
                              className={`w-full sm:w-24 ${schedule.status === 'skipped' ? 'bg-gray-600 hover:bg-gray-700 border-gray-600 text-white' : 'hover:bg-[#f6f8fa] hover:text-[#4a5866] hover:border-gray-300'}`}
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
    </div>
  );
}
