import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Briefcase, MapPin, Calendar, Clock, ChevronRight, CheckCircle, Search, AlertCircle, Loader2, Bookmark, Coins } from 'lucide-react';
import jobService from '../../services/jobService';
import resumeService from '../../services/resumeService';
import savedJobService from '../../services/savedJobService';

export default function AppliedJobs() {
  const { extractData, addToast } = useApp();
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [jobs, setJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const [savingJobId, setSavingJobId] = useState(null);

  // Job details modal
  const [selectedJobDetails, setSelectedJobDetails] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Load active jobs
      const jobsData = await jobService.getAll({ status: 'ACTIVE' });
      setJobs(extractData(jobsData) || []);

      // Load applications
      const appsData = await jobService.getMyApplications();
      setMyApplications(extractData(appsData) || []);

      // Load saved jobs
      try {
        const savedData = await savedJobService.getAll();
        setSavedJobs(extractData(savedData) || []);
      } catch (e) {
        setSavedJobs([]);
      }

      // Check resume
      try {
        const resumeData = await resumeService.get();
        setResume(extractData(resumeData));
      } catch {
        setResume(null);
      }
    } catch (err) {
      console.error('Failed to load jobs/applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApply = async (jobId) => {
    if (!resume) {
      addToast('Please upload your CV in the Resume section before applying.', 'warning');
      return;
    }
    
    setSubmittingId(jobId);
    try {
      await jobService.apply(jobId);
      addToast('Application submitted successfully!', 'success');
      // Reload applications
      const appsData = await jobService.getMyApplications();
      setMyApplications(extractData(appsData) || []);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit application.';
      addToast(msg, 'error');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleToggleSave = async (jobId) => {
    setSavingJobId(jobId);
    const isSaved = savedJobs.some(sj => sj.jobId === jobId);
    try {
      if (isSaved) {
        await savedJobService.unsave(jobId);
        addToast('Job removed from saved bookmarks.', 'success');
      } else {
        await savedJobService.save(jobId);
        addToast('Job bookmarked to saved list!', 'success');
      }
      const savedData = await savedJobService.getAll();
      setSavedJobs(extractData(savedData) || []);
    } catch (err) {
      addToast('Failed to bookmark job.', 'error');
    } finally {
      setSavingJobId(null);
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    job.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'SELECTED':
      case 'SHORTLISTED':
      case 'INTERVIEW_SCHEDULED':
      case 'INTERVIEW_COMPLETED':
        return 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400';
      case 'PENDING':
      case 'SCREENING':
      default:
        return 'bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400';
      case 'REJECTED':
        return 'bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400';
      case 'WITHDRAWN':
        return 'bg-slate-50 border-slate-100 text-slate-500 dark:bg-slate-900/20 dark:border-slate-800/30 dark:text-slate-400';
    }
  };

  const formatStatusText = (status) => {
    return status.replace(/_/g, ' ').toLowerCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-800 dark:text-white">Job Listings & Applications</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Discover vacancies and monitor your screening status</p>
        </div>

        {/* Tab Controls */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'search'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Search Open Roles
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'saved'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Saved Bookmarks ({savedJobs.length})
          </button>
          <button
            onClick={() => setActiveTab('my-apps')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'my-apps'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            My Applications ({myApplications.length})
          </button>
        </div>
      </div>

      {activeTab === 'search' || activeTab === 'saved' ? (
        <div className="space-y-4">
          {activeTab === 'search' && (
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search positions or departments (e.g. React, Engineering)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors text-sm text-slate-800 dark:text-white"
              />
            </div>
          )}

          {/* Jobs Board grid */}
          {(activeTab === 'search' ? filteredJobs : jobs.filter(j => savedJobs.some(sj => sj.jobId === j.id))).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(activeTab === 'search' ? filteredJobs : jobs.filter(j => savedJobs.some(sj => sj.jobId === j.id))).map((job) => {
                const isApplied = myApplications.some(app => app.jobId === job.id);
                const isApplying = submittingId === job.id;
                const isSaved = savedJobs.some(sj => sj.jobId === job.id);
                return (
                  <Card key={job.id} className="p-5 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded uppercase tracking-wider">
                          {job.department}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {job.type}
                          </span>
                          <button
                            onClick={() => handleToggleSave(job.id)}
                            disabled={savingJobId === job.id}
                            className={`p-1 rounded-lg border transition-colors ${
                              isSaved
                                ? 'border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 text-blue-500'
                                : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-655'
                            }`}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </div>
                      <h4 className="font-bold text-base text-slate-800 dark:text-white">{job.title}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 pt-1">
                        {job.description}
                      </p>
                      
                      {/* Requirements tags */}
                      {job.requirements && job.requirements.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1.5">
                          {job.requirements.slice(0, 3).map((req, i) => (
                            <span key={i} className="text-[9px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                              {req}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                      <Button
                        onClick={() => setSelectedJobDetails(job)}
                        variant="secondary"
                        size="sm"
                      >
                        View Details
                      </Button>
                      <Button 
                        onClick={() => handleApply(job.id)}
                        variant={isApplied ? 'secondary' : 'primary'} 
                        size="sm"
                        disabled={isApplied || isApplying}
                        className={isApplied ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}
                      >
                        {isApplying ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isApplied ? (
                          <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Applied</span>
                        ) : (
                          'Quick Apply'
                        )}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-2xl">
              <Briefcase className="w-10 h-10 mx-auto text-slate-350 dark:text-slate-650 mb-2" />
              <p className="text-sm font-semibold">
                {activeTab === 'search' ? 'No open roles match your search.' : 'You have no saved jobs bookmarks.'}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Applications list */}
          {myApplications.length > 0 ? (
            myApplications.map((app) => (
              <Card key={app.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-base text-slate-800 dark:text-white">{app.job?.title || 'Unknown Position'}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-full capitalize ${getStatusBadgeClass(app.status)}`}>
                      {formatStatusText(app.status)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-semibold">
                    <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {app.job?.department || 'Engineering'}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Applied on {new Date(app.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-100 dark:border-slate-800 pt-3 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Compatibility Rating</span>
                    <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                      {app.matchScore !== null && app.matchScore !== undefined ? `${Math.round(app.matchScore)}%` : 'Processing...'}
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 hidden sm:block" />
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 text-slate-400 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-2xl">
              <Briefcase className="w-10 h-10 mx-auto text-slate-350 dark:text-slate-650 mb-2" />
              <p className="text-sm font-semibold">You haven't applied to any roles yet.</p>
            </div>
          )}

          <div className="flex gap-2.5 p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/30 rounded-xl text-xs text-blue-700 dark:text-blue-400">
            <AlertCircle className="w-4.5 h-4.5 shrink-0" />
            <span>To progress scheduled applications, launch the **AI Interview Room** simulation directly from the sidebar. Detailed scorecards are published here under results once analyzed.</span>
          </div>
        </div>
      )}

      {/* Job Details Modal Overlay */}
      {selectedJobDetails && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl relative animate-scale-in">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-blue-750 dark:text-blue-450 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                  {selectedJobDetails.department}
                </span>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-2">{selectedJobDetails.title}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-4 h-4 text-slate-450" /> {selectedJobDetails.location}
                </p>
              </div>
              <button
                onClick={() => setSelectedJobDetails(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-655 transition-colors font-bold text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 text-sm leading-relaxed text-slate-655 dark:text-slate-350 text-left">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Role Description</span>
                <p>{selectedJobDetails.description}</p>
              </div>

              {selectedJobDetails.requirements && selectedJobDetails.requirements.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Core Requirements</span>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedJobDetails.requirements.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Salary details and deadline */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-850 pt-4 text-xs font-bold text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-slate-450" />
                  <span>Salary: {selectedJobDetails.salaryMin ? `${selectedJobDetails.currency || 'USD'} ${selectedJobDetails.salaryMin} - ${selectedJobDetails.salaryMax}` : 'Undisclosed'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-450" />
                  <span>Closing Date: {selectedJobDetails.closingDate ? new Date(selectedJobDetails.closingDate).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex justify-end gap-3">
              <Button onClick={() => setSelectedJobDetails(null)} variant="secondary">Close</Button>
              <Button
                onClick={() => {
                  handleApply(selectedJobDetails.id);
                  setSelectedJobDetails(null);
                }}
                disabled={myApplications.some(app => app.jobId === selectedJobDetails.id)}
                variant="primary"
              >
                {myApplications.some(app => app.jobId === selectedJobDetails.id) ? 'Applied' : 'Apply Now'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
