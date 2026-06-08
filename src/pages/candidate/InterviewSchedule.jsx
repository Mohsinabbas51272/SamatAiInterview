import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Calendar as CalendarIcon, Clock, User, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import interviewService from '../../services/interviewService';

export default function InterviewSchedule() {
  const { extractData, addToast } = useApp();
  const navigate = useNavigate();
  
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const res = await interviewService.getAll();
      setInterviews(extractData(res) || []);
    } catch (err) {
      console.error('Failed to load candidate interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const activeInterviews = interviews.filter(i => i.status === 'SCHEDULED' || i.status === 'IN_PROGRESS');
  const pastInterviews = interviews.filter(i => i.status === 'COMPLETED');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  // Get days in the calendar that have interviews
  const interviewDays = activeInterviews.map(i => new Date(i.scheduledAt).getDate());

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-slate-800 dark:text-white">Interview Schedule</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Book or view your upcoming live AI assessment and practice sessions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scheduler Board / Calendar Display */}
        <Card className="p-6 lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Calendar View</h4>
            <span className="text-xs font-bold px-2 text-slate-700 dark:text-slate-300">
              {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Simple calendar picker visualization showing interview days */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Scheduled Interview Days</span>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <span key={i} className="font-bold text-slate-400 py-1">{day}</span>
                ))}
                {/* Visual rendering of calendar */}
                {Array.from({ length: 30 }).map((_, i) => {
                  const day = i + 1;
                  const hasInterview = interviewDays.includes(day);
                  const isToday = day === new Date().getDate();
                  
                  return (
                    <div
                      key={i}
                      className={`py-2 rounded-lg font-semibold flex items-center justify-center relative ${
                        isToday 
                          ? 'bg-blue-600 text-white font-bold' 
                          : hasInterview
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/30'
                            : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {day}
                      {hasInterview && !isToday && (
                        <span className="absolute bottom-1 w-1 h-1 bg-indigo-500 rounded-full animate-pulse" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upcoming Interviews Summary */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Upcoming Sessions</span>
              {activeInterviews.length > 0 ? (
                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                  {activeInterviews.map((interview) => (
                    <div
                      key={interview.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1.5"
                    >
                      <h5 className="font-bold text-xs text-slate-850 dark:text-slate-200 line-clamp-1">{interview.job?.title || 'Mock Interview'}</h5>
                      <div className="flex flex-col gap-0.5 text-[10px] text-slate-400 font-semibold">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(interview.scheduledAt).toLocaleString()}</span>
                        <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> {interview.duration} Mins</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No upcoming sessions this month.</p>
              )}
            </div>
          </div>
        </Card>

        {/* Booking Confirmation Side / Action Center */}
        <Card className="p-6 space-y-4">
          <h4 className="font-bold text-base font-display text-slate-800 dark:text-slate-200">Active Bookings</h4>

          {activeInterviews.length > 0 ? (
            <div className="space-y-4">
              {activeInterviews.map((interview) => (
                <div key={interview.id} className="p-4 bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center text-emerald-600">
                    <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded uppercase tracking-wider">Scheduled</span>
                    <CalendarIcon className="w-4 h-4 text-emerald-500" />
                  </div>
                  <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200">{interview.job?.title || 'Mock Interview'}</h5>
                  
                  <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <p className="flex items-center gap-2"><CalendarIcon className="w-3.5 h-3.5 text-slate-400" /> {new Date(interview.scheduledAt).toLocaleDateString()}</p>
                    <p className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-slate-400" /> {new Date(interview.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="flex items-center gap-2"><User className="w-3.5 h-3.5 text-slate-400" /> AI Interviewer Agent</p>
                  </div>

                  <Button 
                    onClick={() => navigate(`/candidate/interview?id=${interview.id}`)}
                    variant="primary" 
                    size="sm"
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold border-none"
                  >
                    Launch AI Room
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-12 text-slate-400 space-y-2">
              <CalendarIcon className="w-10 h-10 opacity-40" />
              <p className="text-xs font-semibold">No active interview sessions scheduled. Contact HR or apply for jobs to schedule your assessment.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}


