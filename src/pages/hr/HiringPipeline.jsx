import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import jobService from '../../services/jobService';
import { Card } from '../../components/UI/Card';
import { Brain, Search, Users, Activity, Sparkles, MoveRight, Loader2, GitPullRequest } from 'lucide-react';

const COLUMNS = [
  { id: 'PENDING', title: 'Pending Review', color: 'bg-slate-500/10 border-slate-500/20' },
  { id: 'SCREENING', title: 'Screening', color: 'bg-amber-500/10 border-amber-500/20' },
  { id: 'SHORTLISTED', title: 'Shortlisted', color: 'bg-blue-500/10 border-blue-500/20' },
  { id: 'SELECTED', title: 'Selected / Hired', color: 'bg-emerald-500/10 border-emerald-500/20' },
  { id: 'REJECTED', title: 'Rejected', color: 'bg-rose-500/10 border-rose-500/20' },
];

export default function HiringPipeline() {
  const { user, extractData, addToast } = useApp();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [draggedAppId, setDraggedAppId] = useState(null);

  const loadPipeline = async () => {
    if (!user) return;
    try {
      setLoading(true);
      // Fetch HR's jobs
      const resActive = await jobService.getAll({ status: 'ACTIVE' });
      const activeJobs = (extractData(resActive) || []).filter(j => j.createdById === user.id);

      // Fetch applications for all active jobs
      const allAppsPromises = activeJobs.map(job => jobService.getApplications(job.id));
      const appsResults = await Promise.all(allAppsPromises);

      const flattenedApps = [];
      appsResults.forEach((res, idx) => {
        const job = activeJobs[idx];
        const apps = extractData(res) || [];
        apps.forEach(app => {
          flattenedApps.push({
            id: app.id,
            jobTitle: job.title,
            jobDepartment: job.department,
            candidateName: app.candidate?.profile
              ? `${app.candidate.profile.firstName} ${app.candidate.profile.lastName}`
              : app.candidate?.email || 'Candidate',
            candidateEmail: app.candidate?.email,
            matchScore: app.candidate?.resume?.matchScore || app.matchScore || 0,
            status: app.status, // e.g. PENDING, SCREENING, SHORTLISTED, etc.
          });
        });
      });

      setApplications(flattenedApps);
    } catch (err) {
      console.error('Failed to load hiring pipeline:', err);
      addToast('Failed to load application pipeline.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPipeline();
  }, [user]);

  // Drag and Drop Handlers
  const handleDragStart = (e, appId) => {
    setDraggedAppId(appId);
    e.dataTransfer.setData('text/plain', appId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData('text/plain') || draggedAppId;
    if (!appId) return;

    // Local optimistic update
    const previousApps = [...applications];
    const targetApp = applications.find(a => a.id === appId);
    if (!targetApp || targetApp.status === targetStatus) return;

    setApplications(prev =>
      prev.map(a => (a.id === appId ? { ...a, status: targetStatus } : a))
    );

    try {
      await jobService.updateApplicationStatus(appId, targetStatus);
      addToast(`Status updated to ${targetStatus.replace(/_/g, ' ').toLowerCase()}`, 'success');
    } catch (err) {
      console.error('Failed to update status on drop:', err);
      addToast('Failed to update status.', 'error');
      // rollback
      setApplications(previousApps);
    } finally {
      setDraggedAppId(null);
    }
  };

  if (loading && applications.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Hiring Pipeline</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Drag and drop candidates across stages to transition application phases.
        </p>
      </div>

      {/* Kanban Board Container */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colApps = applications.filter((app) => {
            // Map similar db status into visual groups if necessary, or check matches
            if (col.id === 'PENDING') return app.status === 'PENDING' || app.status === 'WITHDRAWN';
            if (col.id === 'SHORTLISTED') return app.status === 'SHORTLISTED' || app.status === 'INTERVIEW_SCHEDULED' || app.status === 'INTERVIEW_COMPLETED';
            return app.status === col.id;
          });

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`rounded-3xl border p-4 min-h-[500px] flex flex-col space-y-4 ${col.color} transition-all duration-300`}
            >
              {/* Header */}
              <div className="flex justify-between items-center px-1">
                <span className="font-bold text-sm tracking-tight">{col.title}</span>
                <span className="text-xs font-bold text-slate-400 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 px-2 py-0.5 rounded-lg">
                  {colApps.length}
                </span>
              </div>

              {/* Cards list */}
              <div className="flex-1 space-y-3 overflow-y-auto">
                {colApps.map((app) => (
                  <div
                    key={app.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, app.id)}
                    className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow duration-200 relative group"
                  >
                    <div className="space-y-2">
                      <h5 className="font-bold text-sm text-slate-850 dark:text-slate-100 group-hover:text-blue-500 transition-colors duration-150">
                        {app.candidateName}
                      </h5>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">{app.jobTitle}</span>
                        <span className="text-[9px] text-slate-400 block">{app.jobDepartment}</span>
                      </div>

                      {/* Compatibility rating */}
                      <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-lg text-[9px] font-bold w-fit mt-2">
                        <Sparkles className="w-2.5 h-2.5" /> Match Score: {app.matchScore}%
                      </div>
                    </div>
                  </div>
                ))}

                {colApps.length === 0 && (
                  <div className="text-center py-12 text-xs text-slate-400 dark:text-slate-500 border border-dashed border-slate-350 dark:border-slate-850 rounded-2xl flex flex-col justify-center items-center gap-2">
                    <GitPullRequest className="w-6 h-6 opacity-30" />
                    <span>Drop here</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
