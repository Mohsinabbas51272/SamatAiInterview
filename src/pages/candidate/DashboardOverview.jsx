import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Cpu, UploadCloud, Briefcase, Calendar, CheckCircle2, ChevronRight, AlertCircle, Award, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import analyticsService from '../../services/analyticsService';
import resumeService from '../../services/resumeService';
import interviewService from '../../services/interviewService';

export default function DashboardOverview() {
  const { profile, extractData } = useApp();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalApplications: 0,
    upcomingInterviews: 0,
    completedInterviews: 0,
    avgScore: null,
  });
  const [resume, setResume] = useState(null);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Get analytics
        const dashboardData = await analyticsService.getDashboard();
        const extractedStats = extractData(dashboardData);
        if (extractedStats && extractedStats.stats) {
          setStats(extractedStats.stats);
        }

        // Get resume (catch 404 if not found)
        try {
          const resumeData = await resumeService.get();
          setResume(extractData(resumeData));
        } catch (e) {
          setResume(null);
        }

        // Get interviews
        const interviewsData = await interviewService.getAll();
        const allInterviews = extractData(interviewsData) || [];
        const upcoming = allInterviews.filter(i => i.status === 'SCHEDULED');
        setUpcomingInterviews(upcoming);
      } catch (err) {
        console.error('Failed to load candidate dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [extractData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  const uploadedResume = resume;
  const userInterviewFinished = stats.completedInterviews > 0;
  const matchScore = resume?.matchScore;

  return (
    <div className="space-y-6">
      {/* Welcome Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg relative overflow-hidden"
      >
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial-gradient from-white/10 to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-2 max-w-xl">
          <h1 className="text-2xl sm:text-3xl font-bold font-display">Welcome Back, {profile?.firstName || 'Candidate'}!</h1>
          <p className="text-sm text-blue-100">
            Secure your dream engineering role using our real-time AI mock interviewer. Upload your CV to check matching compatibility and unlock the interview simulator.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            {!uploadedResume ? (
              <Link to="/candidate/resume-upload">
                <Button className="bg-white text-blue-600 hover:bg-blue-50 font-bold border-none" size="sm">
                  <UploadCloud className="w-4 h-4 mr-1.5" /> Upload Resume
                </Button>
              </Link>
            ) : !userInterviewFinished ? (
              <Link to="/candidate/interview">
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold border-none animate-pulse-slow" size="sm">
                  <Cpu className="w-4 h-4 mr-1.5" /> Launch AI Interview
                </Button>
              </Link>
            ) : (
              <Link to="/candidate/history">
                <Button className="bg-white text-purple-600 hover:bg-purple-50 font-bold border-none" size="sm">
                  View Feedback Scorecard
                </Button>
              </Link>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CV Score Card */}
        <Card className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">CV Score Match</span>
            <h3 className="text-2xl font-bold font-display text-slate-800 dark:text-white">
              {uploadedResume && matchScore !== null && matchScore !== undefined ? `${Math.round(matchScore)}%` : 'N/A'}
            </h3>
            <p className="text-xs text-slate-400">{uploadedResume ? 'Parsed successfully' : 'Pending upload'}</p>
          </div>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${uploadedResume ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
            <UploadCloud className="w-5 h-5" />
          </div>
        </Card>

        {/* Applied Jobs Card */}
        <Card className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Applied Roles</span>
            <h3 className="text-2xl font-bold font-display text-slate-800 dark:text-white">
              {stats.totalApplications}
            </h3>
            <p className="text-xs text-slate-400">{stats.upcomingInterviews} Interview{stats.upcomingInterviews === 1 ? '' : 's'} scheduled</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
        </Card>

        {/* Interview Status Card */}
        <Card className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Interview Room</span>
            <h3 className="text-2xl font-bold font-display text-slate-800 dark:text-white">
              {userInterviewFinished ? 'Completed' : uploadedResume ? 'Ready' : 'Locked'}
            </h3>
            <p className="text-xs text-slate-400">{userInterviewFinished ? 'Scored' : uploadedResume ? 'Join to practice' : 'Upload CV first'}</p>
          </div>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${userInterviewFinished ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600' : uploadedResume ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-500 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
            <Cpu className="w-5 h-5" />
          </div>
        </Card>

        {/* Result Score Card */}
        <Card className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Score</span>
            <h3 className="text-2xl font-bold font-display text-slate-800 dark:text-white">
              {stats.avgScore !== null ? `${stats.avgScore}%` : 'N/A'}
            </h3>
            <p className="text-xs text-slate-400">{stats.avgScore !== null ? 'AI analysis complete' : 'Interview pending'}</p>
          </div>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stats.avgScore !== null ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
            <Award className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Down Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Tracker */}
        <Card className="p-6 lg:col-span-2 space-y-4">
          <h4 className="font-bold text-base font-display text-slate-800 dark:text-slate-200">Application Pipeline Status</h4>
          
          <div className="space-y-6 pt-2">
            {/* Step 1 */}
            <div className="flex gap-4 items-start relative">
              <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-blue-500 dark:bg-blue-600" />
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 font-bold text-sm shadow-md shadow-blue-500/20">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex-grow space-y-1">
                <div className="flex justify-between items-center">
                  <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200">Submit Application</h5>
                  <span className="text-xs text-slate-400 font-semibold">Active</span>
                </div>
                <p className="text-xs text-slate-500">Your profile and contact details are registered in the SmartAIInterviews system.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4 items-start relative">
              <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800" />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${uploadedResume ? 'bg-blue-500 text-white shadow-md' : 'bg-slate-200 dark:bg-slate-850 text-slate-400'}`}>
                {uploadedResume ? <CheckCircle2 className="w-4 h-4" /> : '2'}
              </div>
              <div className="flex-grow space-y-1">
                <div className="flex justify-between items-center">
                  <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200">Resume Automated Parser Screening</h5>
                </div>
                <p className="text-xs text-slate-500">
                  {uploadedResume 
                    ? `CV parsed with compatibility rating of ${resume.matchScore ? Math.round(resume.matchScore) : 0}%.` 
                    : 'Upload your CV in the Resume section to activate structural screening keywords matching.'
                  }
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4 items-start">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${userInterviewFinished ? 'bg-blue-500 text-white shadow-md' : 'bg-slate-200 dark:bg-slate-850 text-slate-400'}`}>
                {userInterviewFinished ? <CheckCircle2 className="w-4 h-4" /> : '3'}
              </div>
              <div className="flex-grow space-y-1">
                <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200">AI Video Technical Assessment</h5>
                <p className="text-xs text-slate-500">
                  {userInterviewFinished 
                    ? 'Technical assessment finalized and scores published to recruiters dashboard panel.' 
                    : 'Unlocks upon successful CV analysis. Practice with our real-time AI interivewer to showcase your skills.'
                  }
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Reminders / calendar Widget */}
        <Card className="p-6 space-y-4">
          <h4 className="font-bold text-base font-display text-slate-800 dark:text-slate-200">Interview Schedule</h4>
          
          {upcomingInterviews.length > 0 ? (
            upcomingInterviews.slice(0, 2).map((interview) => (
              <div key={interview.id} className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/30 rounded-xl space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded uppercase tracking-wider">Upcoming</span>
                  <Calendar className="w-4 h-4 text-blue-500" />
                </div>
                <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200">{interview.job?.title || 'Mock Interview'}</h5>
                <p className="text-xs text-slate-500">{interview.notes || 'AI Panel Practice Run.'}</p>
                <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />
                <div className="flex justify-between text-xs text-slate-500 font-semibold">
                  <span>{new Date(interview.scheduledAt).toLocaleString()}</span>
                  <span>{interview.duration} Mins</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl text-center space-y-2 text-slate-400">
              <Calendar className="w-6 h-6 mx-auto text-slate-350 dark:text-slate-650" />
              <p className="text-xs">No interviews scheduled.</p>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-500 bg-amber-50/40 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-100/50 dark:border-amber-900/30">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Complete your mock interview assessment to receive detailed performance scoring and recommendations.</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
