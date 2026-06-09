import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { History, Award, Calendar, FileText, ChevronRight, Loader2 } from 'lucide-react';
import interviewService from '../../services/interviewService';

export default function InterviewHistory() {
  const { extractData } = useApp();
  
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await interviewService.getAll();
        setInterviews(extractData(res) || []);
      } catch (err) {
        console.error('Failed to load interview history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const completedInterviews = interviews.filter(i => i.status === 'COMPLETED');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-slate-800 dark:text-white">Interview Assessment History</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review your past mock assessments and performance logs</p>
      </div>

      {completedInterviews.length > 0 ? (
        <div className="space-y-4">
          {completedInterviews.map((interview) => (
            <Card key={interview.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white">{interview.job?.title || 'Mock Interview'}</h4>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30 px-2 py-0.5 rounded-full uppercase">
                      {interview.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Evaluated on {new Date(interview.scheduledAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-100 dark:border-slate-800 pt-3 md:pt-0">
                <div className="flex gap-4">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Resume Match</span>
                    <span className="text-sm font-extrabold text-slate-700 dark:text-slate-350">
                      {interview.candidate?.resume?.matchScore !== null && interview.candidate?.resume?.matchScore !== undefined
                        ? `${Math.round(interview.candidate.resume.matchScore)}%`
                        : '80%'}
                    </span>
                  </div>
                  <div className="text-left md:text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Interview Score</span>
                    <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
                      {interview.overallScore !== null ? `${Math.round(interview.overallScore)}%` : 'N/A'}
                    </span>
                  </div>
                </div>

                <Link to={`/candidate/results?interviewId=${interview.id}`}>
                  <Button variant="primary" size="sm" className="flex items-center gap-1 font-bold">
                    <FileText className="w-4 h-4" /> View Feedback <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
            <History className="w-8 h-8 opacity-60" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h4 className="font-bold text-base text-slate-800 dark:text-slate-200">No Assessment Records</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              You haven't completed any simulated assessments yet. Upload a CV to unlock and enter the AI Interview Room.
            </p>
          </div>
          <Link to="/candidate/resume-upload">
            <Button variant="primary" size="sm" className="font-bold">
              Get Started
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
