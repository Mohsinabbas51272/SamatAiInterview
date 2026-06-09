import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import { Card } from '../../components/UI/Card';
import { Award, Medal, Trophy, Loader2 } from 'lucide-react';
import jobService from '../../services/jobService';
import reportService from '../../services/reportService';

export default function CandidateRanking() {
  const { user, aiConfig, extractData } = useApp();
  const { screeningWeight = 40, interviewWeight = 60 } = aiConfig || {};

  const [loading, setLoading] = useState(true);
  const [rankedCandidates, setRankedCandidates] = useState([]);

  useEffect(() => {
    const fetchAndRankCandidates = async () => {
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

        // 2. Fetch applications for each job
        const appsPromises = combinedJobs.map(job => jobService.getApplications(job.id));
        const appsResults = await Promise.all(appsPromises);

        // 3. Get all reports for HR matching
        let reports = [];
        try {
          const reportsRes = await reportService.getAll();
          reports = extractData(reportsRes) || [];
        } catch (err) {
          console.warn('Failed to load reports in candidate ranking:', err);
        }

        // 4. Flatten and calculate cumulative scores
        const candidates = [];
        appsResults.forEach((res, index) => {
          const job = combinedJobs[index];
          const jobApps = extractData(res) || [];
          
          jobApps.forEach(app => {
            const matchingReport = reports.find(
              r => r.candidateId === app.candidateId && r.interview?.jobId === job.id
            );

            const resumeScore = app.candidate?.resume?.matchScore || app.matchScore || 0;
            const interviewScore = matchingReport ? matchingReport.interviewScore : 0;

            const cumulativeScore = Math.round(
              (resumeScore * screeningWeight + interviewScore * interviewWeight) / 100
            );

            candidates.push({
              id: app.id,
              name: app.candidate?.profile
                ? `${app.candidate.profile.firstName} ${app.candidate.profile.lastName}`
                : app.candidate?.email || 'Candidate',
              role: job.title,
              status: app.status,
              resumeScore,
              interviewScore,
              cumulativeScore
            });
          });
        });

        // 5. Sort by cumulative score descending
        candidates.sort((a, b) => b.cumulativeScore - a.cumulativeScore);
        setRankedCandidates(candidates);
      } catch (err) {
        console.error('Failed to rank candidates:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAndRankCandidates();
  }, [user, screeningWeight, interviewWeight]);

  const getTrophyIcon = (idx) => {
    switch (idx) {
      case 0:
        return <Trophy className="w-5 h-5 text-amber-500 animate-bounce" />;
      case 1:
        return <Medal className="w-5 h-5 text-slate-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-xs font-bold text-slate-400 w-5 h-5 flex items-center justify-center rounded bg-slate-100 dark:bg-slate-800">{idx + 1}</span>;
    }
  };

  if (loading && rankedCandidates.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-800 dark:text-white">Talent Leaderboard Rankings</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Candidates ordered by cumulative index matching the active system evaluation weights
          </p>
        </div>

        <div className="px-4 py-2 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl text-xs text-slate-655 dark:text-slate-400">
          Screening Weight: <span className="font-bold text-blue-600 dark:text-blue-400">{screeningWeight}%</span> | Interview Weight: <span className="font-bold text-purple-600 dark:text-purple-400">{interviewWeight}%</span>
        </div>
      </div>

      <Card className="p-6">
        {rankedCandidates.length > 0 ? (
          <div className="space-y-4">
            {rankedCandidates.map((cand, idx) => (
              <div 
                key={cand.id}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 rounded-2xl hover:border-blue-500/30 dark:hover:border-blue-400/30 hover:bg-slate-50/80 dark:hover:bg-slate-900 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="shrink-0 w-8 h-8 flex items-center justify-center">
                    {getTrophyIcon(idx)}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold font-display uppercase shrink-0">
                      {cand.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-850 dark:text-slate-200">{cand.name}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{cand.role}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Scores (CV/QA)</span>
                    <span className="text-xs font-semibold text-slate-500">
                      {Math.round(cand.resumeScore)}% / {cand.interviewScore ? `${Math.round(cand.interviewScore)}%` : 'Pending'}
                    </span>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Weighted index</span>
                    <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">{cand.cumulativeScore}%</span>
                  </div>
                  
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                    cand.status === 'SELECTED' 
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' 
                      : cand.status === 'REJECTED'
                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-455'
                        : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-450'
                  }`}>
                    {cand.status.replace(/_/g, ' ').toLowerCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center text-slate-400 max-w-md mx-auto">
            <Award className="w-12 h-12 mx-auto text-slate-350 dark:text-slate-650 mb-3" />
            <h4 className="font-bold text-base text-slate-850 dark:text-slate-200">No Candidates Ranked</h4>
            <p className="text-xs">Once candidates apply and complete assessments, the leaderboard rankings will generate here.</p>
          </Card>
        )}
      </Card>
    </div>
  );
}
