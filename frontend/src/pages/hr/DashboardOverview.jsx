import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Users, Briefcase, Calendar, Award, FileText, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import analyticsService from '../../services/analyticsService';
import jobService from '../../services/jobService';
import reportService from '../../services/reportService';

export default function DashboardOverview() {
  const { user, extractData } = useApp();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalApplicants: 0,
    activeJobs: 0,
    selectedCandidates: 0,
    totalJobs: 0
  });
  const [recentCandidates, setRecentCandidates] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      try {
        setLoading(true);

        // 1. Fetch dashboard stats
        let dashboardData = { stats: {}, pipeline: [], departmentStats: [] };
        try {
          const res = await analyticsService.getDashboard();
          dashboardData = extractData(res) || dashboardData;
        } catch (err) {
          console.warn('Failed to load HR analytics dashboard data:', err);
        }

        const selectedCount = dashboardData.pipeline?.find(p => p.status === 'SELECTED')?.count || 0;

        setStats({
          totalApplicants: dashboardData.stats?.totalApplications || 0,
          activeJobs: dashboardData.stats?.activeJobs || 0,
          totalJobs: dashboardData.stats?.totalJobs || 0,
          selectedCandidates: selectedCount
        });

        // 2. Fetch recent candidates (limit to 5)
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

        const appsPromises = combinedJobs.map(job => jobService.getApplications(job.id));
        const appsResults = await Promise.all(appsPromises);

        let reports = [];
        try {
          const reportsRes = await reportService.getAll();
          reports = extractData(reportsRes) || [];
        } catch (err) {}

        const flattened = [];
        appsResults.forEach((res, index) => {
          const job = combinedJobs[index];
          const jobApps = extractData(res) || [];
          
          jobApps.forEach(app => {
            const matchingReport = reports.find(
              r => r.candidateId === app.candidateId && r.interview?.jobId === job.id
            );

            flattened.push({
              id: app.id,
              jobId: job.id,
              role: job.title,
              name: app.candidate?.profile
                ? `${app.candidate.profile.firstName} ${app.candidate.profile.lastName}`
                : app.candidate?.email || 'Candidate',
              resumeScore: app.candidate?.resume?.matchScore || app.matchScore || 0,
              interviewScore: matchingReport ? matchingReport.interviewScore : null,
              status: app.status,
              createdAt: new Date(app.createdAt).getTime(),
              reportId: matchingReport ? matchingReport.id : null,
            });
          });
        });

        // Sort by newest first
        flattened.sort((a, b) => b.createdAt - a.createdAt);
        setRecentCandidates(flattened.slice(0, 5));

      } catch (err) {
        console.error('Failed to load HR dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const mockChartData = [
    { day: 'Mon', applicants: 3 },
    { day: 'Tue', applicants: 7 },
    { day: 'Wed', applicants: 5 },
    { day: 'Thu', applicants: Math.max(9, stats.totalApplicants / 2) },
    { day: 'Fri', applicants: stats.totalApplicants },
    { day: 'Sat', applicants: 4 },
    { day: 'Sun', applicants: 6 }
  ];

  if (loading && recentCandidates.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-slate-800 dark:text-white">HR Dashboard Overview</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review active talent pipelines, vacancy posts, and AI screening results</p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Applicants</span>
            <h3 className="text-2xl font-bold font-display text-slate-800 dark:text-white">{stats.totalApplicants}</h3>
            <p className="text-xs text-slate-400">Profiles screened</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Openings</span>
            <h3 className="text-2xl font-bold font-display text-slate-800 dark:text-white">{stats.activeJobs}</h3>
            <p className="text-xs text-slate-400">Total vacancies</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Postings</span>
            <h3 className="text-2xl font-bold font-display text-slate-800 dark:text-white">{stats.totalJobs}</h3>
            <p className="text-xs text-slate-400">Jobs created</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hires Selected</span>
            <h3 className="text-2xl font-bold font-display text-slate-800 dark:text-white">{stats.selectedCandidates}</h3>
            <p className="text-xs text-slate-400">Passed evaluations</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recruiter chart */}
        <Card className="p-6 lg:col-span-2 space-y-4">
          <h4 className="font-bold text-base font-display text-slate-800 dark:text-slate-200">Applicant Submissions Trend</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-800" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Line type="monotone" dataKey="applicants" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Quick Actions Panel */}
        <Card className="p-6 space-y-4">
          <h4 className="font-bold text-base font-display text-slate-800 dark:text-slate-200">Recruiter Actions</h4>
          <div className="space-y-2">
            <Link to="/hr/jobs" className="block">
              <Button className="w-full justify-start text-xs font-semibold" variant="secondary">
                <Briefcase className="w-4 h-4 mr-2 text-purple-500" /> Create Job Posting
              </Button>
            </Link>
            <Link to="/hr/screening" className="block">
              <Button className="w-full justify-start text-xs font-semibold" variant="secondary">
                <FileText className="w-4 h-4 mr-2 text-blue-500" /> Review Resume Screening
              </Button>
            </Link>
            <Link to="/hr/ranking" className="block">
              <Button className="w-full justify-start text-xs font-semibold" variant="secondary">
                <Award className="w-4 h-4 mr-2 text-emerald-500" /> View Candidate Rankings
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Recent Candidates List table */}
      <Card className="p-6">
        <h4 className="font-bold text-base font-display text-slate-800 dark:text-slate-200 mb-4">Recent Applicant Pipelines</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">Candidate</th>
                <th className="pb-3 font-semibold">Role Applied</th>
                <th className="pb-3 font-semibold">CV Score</th>
                <th className="pb-3 font-semibold">Interview score</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentCandidates.length > 0 ? recentCandidates.map((cand) => (
                <tr key={cand.id} className="border-b border-slate-50 dark:border-slate-800/40 last:border-b-0 text-xs text-slate-650 dark:text-slate-400 group">
                  <td className="py-3.5 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center font-bold font-display uppercase">
                      {cand.name.charAt(0)}
                    </div>
                    <span className="font-bold text-slate-850 dark:text-slate-200 group-hover:text-blue-500 transition-colors">{cand.name}</span>
                  </td>
                  <td className="py-3.5 font-medium">{cand.role}</td>
                  <td className="py-3.5 font-semibold text-slate-500">{cand.resumeScore}%</td>
                  <td className="py-3.5 font-bold text-blue-600 dark:text-blue-400">{cand.interviewScore !== null ? `${cand.interviewScore}%` : 'Pending'}</td>
                  <td className="py-3.5">
                    <span className={`px-2 py-0.5 border rounded-full text-[9px] font-bold ${
                      cand.status === 'SELECTED' 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                        : (cand.status === 'SCREENING' || cand.status === 'PENDING')
                          ? 'bg-amber-50 border-amber-100 text-amber-600' 
                          : cand.status === 'REJECTED'
                            ? 'bg-rose-50 border-rose-100 text-rose-600'
                            : 'bg-blue-50 border-blue-100 text-blue-600'
                    }`}>
                      {cand.status.replace(/_/g, ' ').toLowerCase()}
                    </span>
                  </td>
                  <td className="py-3.5">
                    {cand.reportId ? (
                      <Link to={`/admin/report/${cand.reportId}`}>
                        <button className="text-blue-500 hover:text-blue-600 font-bold inline-flex items-center gap-0.5">
                          Details <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </Link>
                    ) : (
                      <span className="text-slate-400 italic">No Report</span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-slate-400 italic">
                    No recent applications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

