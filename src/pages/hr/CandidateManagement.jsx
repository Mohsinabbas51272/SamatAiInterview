import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Modal } from '../../components/UI/Modal';
import { ProgressBar } from '../../components/UI/Progress';
import { Search, FileText, ChevronRight, CheckCircle, AlertTriangle, XCircle, Brain, Sparkles, Loader2, Download } from 'lucide-react';
import jobService from '../../services/jobService';
import reportService from '../../services/reportService';

export default function CandidateManagement() {
  const { user, extractData, addToast } = useApp();
  
  const [loading, setLoading] = useState(true);
  const [candidatesList, setCandidatesList] = useState([]);
  const [reportsList, setReportsList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchPipelines = async () => {
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

      // 2. Get applications for each job
      const appsPromises = combinedJobs.map(job => jobService.getApplications(job.id));
      const appsResults = await Promise.all(appsPromises);

      // 3. Get all reports for HR matching
      let reports = [];
      try {
        const reportsRes = await reportService.getAll();
        reports = extractData(reportsRes) || [];
        setReportsList(reports);
      } catch (err) {
        console.warn('Failed to load evaluation reports list:', err);
      }

      // 4. Flatten applications and match reports
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
            department: job.department,
            candidateId: app.candidateId,
            name: app.candidate?.profile
              ? `${app.candidate.profile.firstName} ${app.candidate.profile.lastName}`
              : app.candidate?.email || 'Candidate',
            email: app.candidate?.email,
            resumeScore: app.candidate?.resume?.matchScore || app.matchScore || 0,
            interviewScore: matchingReport ? matchingReport.interviewScore : null,
            confidenceScore: matchingReport ? matchingReport.confidenceScore : null,
            nlpAnalysis: matchingReport ? matchingReport.nlpAnalysis : 'Interview evaluation pending.',
            recommendation: matchingReport ? matchingReport.recommendation : 'PENDING',
            status: app.status,
            createdAt: app.createdAt,
            reportId: matchingReport ? matchingReport.id : null,
            interviewId: matchingReport ? matchingReport.interviewId : null,
          });
        });
      });

      setCandidatesList(flattened);
    } catch (err) {
      console.error('Failed to load candidate pipelines:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelines();
  }, [user]);

  const handleUpdateStatus = async (applicationId, newStatus) => {
    setUpdatingStatus(true);
    try {
      await jobService.updateApplicationStatus(applicationId, newStatus);
      addToast('Applicant status updated successfully!', 'success');
      
      setCandidatesList(prev => prev.map(c => c.id === applicationId ? { ...c, status: newStatus } : c));
      if (selectedCandidate && selectedCandidate.id === applicationId) {
        setSelectedCandidate(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      addToast('Failed to update status.', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Role', 'Resume Score', 'Interview Score', 'Status', 'Recommendation'];
    const rows = filteredCandidates.map(c => [
      c.name,
      c.email,
      c.role,
      c.resumeScore ? `${Math.round(c.resumeScore)}%` : 'N/A',
      c.interviewScore !== null ? `${Math.round(c.interviewScore)}%` : 'Pending',
      c.status,
      c.recommendation
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.map(val => `"${val}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `candidate_hiring_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Candidate list exported as CSV successfully!', 'success');
  };

  const handleExportPDF = () => {
    window.print();
    addToast('Prepared document for printing / PDF saving.', 'info');
  };

  const filteredCandidates = candidatesList.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SELECTED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 border border-emerald-100 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-450"><CheckCircle className="w-3 h-3" /> Selected</span>;
      case 'SHORTLISTED':
      case 'INTERVIEW_SCHEDULED':
      case 'INTERVIEW_COMPLETED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 border border-blue-100 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-450"><CheckCircle className="w-3 h-3" /> {status.replace(/_/g, ' ').toLowerCase()}</span>;
      case 'PENDING':
      case 'SCREENING':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 border border-amber-100 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-450"><AlertTriangle className="w-3 h-3" /> {status.toLowerCase()}</span>;
      case 'REJECTED':
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 border border-rose-100 bg-rose-50 text-rose-600 rounded-full text-[10px] font-bold dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-455"><XCircle className="w-3 h-3" /> Rejected</span>;
    }
  };

  if (loading && candidatesList.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-slate-800 dark:text-white">Candidate Pipeline Management</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review applicant profiles, screen resumes, and analyze interview transcripts</p>
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative flex-grow w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search candidates or roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors text-sm text-slate-855 dark:text-white"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-350 text-sm focus:outline-none flex-grow sm:flex-grow-0"
          >
            <option value="All">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="SCREENING">Screening</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
            <option value="INTERVIEW_COMPLETED">Interview Completed</option>
            <option value="SELECTED">Selected</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <Button
            onClick={handleExportCSV}
            variant="secondary"
            size="sm"
            className="flex items-center gap-1 text-xs shrink-0"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </Button>

          <Button
            onClick={handleExportPDF}
            variant="secondary"
            size="sm"
            className="flex items-center gap-1 text-xs shrink-0"
          >
            <FileText className="w-3.5 h-3.5" /> Print/PDF
          </Button>
        </div>
      </div>

      {/* Candidates List table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">Candidate</th>
                <th className="pb-3 font-semibold">Applied Position</th>
                <th className="pb-3 font-semibold">CV Match</th>
                <th className="pb-3 font-semibold">Assessment</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map((cand) => (
                <tr key={cand.id} className="border-b border-slate-50 dark:border-slate-800/40 last:border-b-0 text-xs text-slate-650 dark:text-slate-400 group">
                  <td className="py-3.5 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center font-bold font-display uppercase shrink-0">
                      {cand.name.charAt(0)}
                    </div>
                    <span className="font-bold text-slate-850 dark:text-slate-200 group-hover:text-blue-500 transition-colors">{cand.name}</span>
                  </td>
                  <td className="py-3.5 font-medium">{cand.role}</td>
                  <td className="py-3.5 font-bold text-slate-500">{cand.resumeScore ? `${Math.round(cand.resumeScore)}%` : 'N/A'}</td>
                  <td className="py-3.5 font-bold text-blue-600 dark:text-blue-400">
                    {cand.interviewScore !== null ? `${Math.round(cand.interviewScore)}%` : 'Pending'}
                  </td>
                  <td className="py-3.5">{getStatusBadge(cand.status)}</td>
                  <td className="py-3.5">
                    <button
                      onClick={() => setSelectedCandidate(cand)}
                      className="text-blue-500 hover:text-blue-600 font-bold inline-flex items-center gap-0.5"
                    >
                      Analyze Profile <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredCandidates.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No candidates found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Candidate Profile Details Drawer Modal */}
      {selectedCandidate && (
        <Modal 
          isOpen={!!selectedCandidate} 
          onClose={() => setSelectedCandidate(null)} 
          title="Talent Evaluation Profile"
        >
          <div className="space-y-5 pt-3 max-h-[80vh] overflow-y-auto pr-2">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white text-lg shadow-sm shrink-0">
                  {selectedCandidate.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-800 dark:text-white">{selectedCandidate.name}</h4>
                  <p className="text-xs text-slate-500 font-semibold">{selectedCandidate.role}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{selectedCandidate.email}</p>
                </div>
              </div>

              {/* Status Update select */}
              <div className="space-y-1">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block text-right">Update Status</span>
                <select
                  disabled={updatingStatus}
                  value={selectedCandidate.status}
                  onChange={(e) => handleUpdateStatus(selectedCandidate.id, e.target.value)}
                  className="text-xs font-semibold px-2 py-1 border rounded bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                >
                  <option value="PENDING">Pending</option>
                  <option value="SCREENING">Screening</option>
                  <option value="SHORTLISTED">Shortlisted</option>
                  <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                  <option value="INTERVIEW_COMPLETED">Interview Completed</option>
                  <option value="SELECTED">Selected</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>

            {/* Performance Cards Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-center space-y-1">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Resume Match</span>
                <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">{selectedCandidate.resumeScore ? `${Math.round(selectedCandidate.resumeScore)}%` : 'N/A'}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-center space-y-1">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">AI Interview</span>
                <span className="text-sm font-extrabold text-purple-600 dark:text-purple-400">
                  {selectedCandidate.interviewScore !== null ? `${Math.round(selectedCandidate.interviewScore)}%` : 'Pending'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-center space-y-1">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Confidence</span>
                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                  {selectedCandidate.confidenceScore !== null ? `${Math.round(selectedCandidate.confidenceScore)}%` : 'N/A'}
                </span>
              </div>
            </div>

            {/* NLP summary */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Brain className="w-3.5 h-3.5 text-purple-500" /> NLP Linguistics Summary
              </span>
              <p className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 text-xs text-slate-650 dark:text-slate-400 leading-relaxed font-semibold">
                {selectedCandidate.nlpAnalysis}
              </p>
            </div>

            {/* Recommendation block */}
            {selectedCandidate.interviewId && (
              <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 flex items-center gap-3 text-xs text-indigo-900 dark:text-indigo-400 font-bold">
                <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
                <span>Recommended Action: {selectedCandidate.recommendation === 'STRONG_HIRE' || selectedCandidate.recommendation === 'HIRE' ? 'Schedule final executive manager round call.' : selectedCandidate.recommendation === 'BORDERLINE' ? 'Hold and benchmark with subsequent pipelines.' : 'Reject and dispatch standard automated callback.'}</span>
              </div>
            )}

            {/* Link to Full Report */}
            {selectedCandidate.interviewId ? (
              <Link to={`/admin/report/${selectedCandidate.interviewId}`} onClick={() => setSelectedCandidate(null)}>
                <Button variant="primary" className="w-full flex justify-center py-2.5 mt-2 font-bold">
                  <FileText className="w-4 h-4 mr-1.5" /> Open Full Scorecard Report
                </Button>
              </Link>
            ) : (
              <div className="text-center p-3 text-xs text-slate-400 italic">
                AI evaluation report is unavailable because the interview session is not finalized yet.
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
