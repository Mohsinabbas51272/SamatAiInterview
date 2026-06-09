import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import { Card } from '../../components/UI/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Loader2 } from 'lucide-react';
import jobService from '../../services/jobService';
import reportService from '../../services/reportService';

export default function HRAnalytics() {
  const { user, extractData } = useApp();
  
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
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
          console.warn('Failed to load reports in analytics:', err);
        }

        // 4. Flatten and compile candidate scores
        const compiledCandidates = [];
        appsResults.forEach((res, index) => {
          const job = combinedJobs[index];
          const jobApps = extractData(res) || [];
          
          jobApps.forEach(app => {
            const matchingReport = reports.find(
              r => r.candidateId === app.candidateId && r.interview?.jobId === job.id
            );

            compiledCandidates.push({
              id: app.id,
              role: job.title,
              resumeScore: app.candidate?.resume?.matchScore || app.matchScore || 0,
              interviewScore: matchingReport ? matchingReport.interviewScore : 0,
              status: app.status
            });
          });
        });

        setCandidates(compiledCandidates);
      } catch (err) {
        console.error('Failed to load HR analytics data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [user]);

  // Status breakdown data
  const statusCounts = candidates.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  const statusData = Object.entries(statusCounts).map(([name, value]) => ({
    name: name.replace(/_/g, ' ').toLowerCase(),
    value
  }));
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#64748b', '#a855f7'];

  // Average scores per role data
  const roleScoreMap = candidates.reduce((acc, c) => {
    if (!acc[c.role]) {
      acc[c.role] = { sumResume: 0, sumInterview: 0, count: 0 };
    }
    acc[c.role].sumResume += c.resumeScore;
    acc[c.role].sumInterview += c.interviewScore || 0;
    acc[c.role].count += 1;
    return acc;
  }, {});

  const roleData = Object.entries(roleScoreMap).map(([role, metrics]) => ({
    name: role.split(' ')[0], // Keep it short
    'CV Rating': Math.round(metrics.sumResume / metrics.count),
    'Interview Score': Math.round(metrics.sumInterview / metrics.count)
  }));

  if (loading && candidates.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-slate-800 dark:text-white">Talent Pipeline Analytics</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review average assessment ratings and screening distribution stats</p>
      </div>

      {candidates.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Average Scores by role */}
          <Card className="p-6 space-y-4">
            <h4 className="font-bold text-base font-display text-slate-800 dark:text-slate-200">Average Scores per Department Role</h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roleData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-800" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="CV Rating" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Interview Score" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Candidate Status Pie chart */}
          <Card className="p-6 space-y-4">
            <h4 className="font-bold text-base font-display text-slate-800 dark:text-slate-200">Pipeline Status Breakdown</h4>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      ) : (
        <Card className="p-12 text-center text-slate-400">
          <p className="text-sm font-semibold">No candidate data available to render charts.</p>
        </Card>
      )}
    </div>
  );
}
