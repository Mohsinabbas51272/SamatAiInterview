import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import { Card } from '../../components/UI/Card';
import { ProgressBar } from '../../components/UI/Progress';
import { FileText, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import jobService from '../../services/jobService';

export default function ResumeScreening() {
  const { user, extractData } = useApp();
  
  const [loading, setLoading] = useState(true);
  const [screenings, setScreenings] = useState([]);

  const fetchScreenings = async () => {
    if (!user) return;
    try {
      setLoading(true);
      // 1. Get recruiter's jobs
      const [activeRes, draftRes, inactiveRes] = await Promise.all([
        jobService.getAll({ status: 'ACTIVE' }),
        jobService.getAll({ status: 'DRAFT' }),
        jobService.getAll({ status: 'INACTIVE' })
      ]);
      const combinedJobs = [
        ...(extractData(activeRes) || []),
        ...(extractData(draftRes) || []),
        ...(extractData(inactiveRes) || [])
      ].filter(j => j.createdById === user.id);

      // 2. Fetch applications for each job in parallel
      const appsPromises = combinedJobs.map(job => jobService.getApplications(job.id));
      const appsResults = await Promise.all(appsPromises);

      // 3. Compile screening data
      const compiledScreenings = [];
      appsResults.forEach((res, index) => {
        const job = combinedJobs[index];
        const jobApps = extractData(res) || [];
        
        jobApps.forEach(app => {
          const candidateResume = app.candidate?.resume;
          const candidateSkills = candidateResume?.extractedSkills || [];
          const jobSkills = job.skills || [];

          // Calculate matched and missing skills
          const matched = jobSkills.filter(js => 
            candidateSkills.some(cs => cs.toLowerCase().includes(js.toLowerCase()))
          );
          const missing = jobSkills.filter(js => 
            !candidateSkills.some(cs => cs.toLowerCase().includes(js.toLowerCase()))
          );

          compiledScreenings.push({
            id: app.id,
            candidateName: app.candidate?.profile
              ? `${app.candidate.profile.firstName} ${app.candidate.profile.lastName}`
              : app.candidate?.email || 'Candidate',
            role: job.title,
            matchScore: candidateResume?.matchScore || app.matchScore || 0,
            hasResume: !!candidateResume,
            matched,
            missing
          });
        });
      });

      setScreenings(compiledScreenings);
    } catch (err) {
      console.error('Failed to load CV screenings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScreenings();
  }, [user]);

  if (loading && screenings.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-slate-800 dark:text-white">CV Screening & Parse Auditing</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Audit NLP keywords extraction and requirement match metrics</p>
      </div>

      <div className="space-y-4">
        {screenings.length > 0 ? (
          screenings.map((screen) => (
            <Card key={screen.id} className="p-6 space-y-4">
              {/* Header details */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white">{screen.candidateName}</h4>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{screen.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Match Score</span>
                    <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                      {screen.hasResume ? `${Math.round(screen.matchScore)}%` : 'No Resume'}
                    </span>
                  </div>
                  <div className="w-32">
                    <ProgressBar value={screen.hasResume ? screen.matchScore : 0} height="h-1.5" color="bg-blue-500" />
                  </div>
                </div>
              </div>

              {/* Skills analysis tags */}
              {screen.hasResume ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {/* Matched */}
                  <div className="space-y-3 p-4 bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-100/30 dark:border-emerald-900/20 rounded-2xl">
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Matched Job Skills ({screen.matched.length})
                    </span>
                    {screen.matched.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {screen.matched.map((skill, i) => (
                          <span key={i} className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-100/50 dark:border-emerald-900/30">
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No job skills matched.</p>
                    )}
                  </div>

                  {/* Missing */}
                  <div className="space-y-3 p-4 bg-rose-50/20 dark:bg-rose-950/10 border border-rose-100/30 dark:border-rose-900/20 rounded-2xl">
                    <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" /> Missing / Unidentified ({screen.missing.length})
                    </span>
                    {screen.missing.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {screen.missing.map((skill, i) => (
                          <span key={i} className="text-[9px] font-bold text-rose-600 dark:text-rose-455 bg-rose-50/50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-100/50 dark:border-rose-900/30">
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 italic">All job skills matched!</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl text-center text-xs text-slate-450 italic">
                  Candidate has not uploaded a CV for screening yet.
                </div>
              )}
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center text-slate-400 max-w-md mx-auto">
            <FileText className="w-12 h-12 mx-auto text-slate-350 dark:text-slate-650 mb-3" />
            <h4 className="font-bold text-base text-slate-850 dark:text-slate-200">No Screened Candidates</h4>
            <p className="text-xs">Once candidates apply and upload their resumes, screening analysis stats will compile here.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
