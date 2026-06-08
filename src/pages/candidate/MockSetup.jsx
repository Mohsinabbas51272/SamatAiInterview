import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import jobService from '../../services/jobService';
import interviewService from '../../services/interviewService';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Play, Sliders, Briefcase, Award, Sparkles, Brain } from 'lucide-react';

export default function MockSetup() {
  const navigate = useNavigate();
  const { user, addToast, extractData } = useApp();
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Selections
  const [selectedJobId, setSelectedJobId] = useState('');
  const [category, setCategory] = useState('TECHNICAL');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [duration, setDuration] = useState(30);
  const [launching, setLaunching] = useState(false);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const res = await jobService.getAll({ status: 'ACTIVE' });
        const data = extractData(res) || [];
        setJobs(data);
        if (data.length > 0) {
          setSelectedJobId(data[0].id);
        }
      } catch (err) {
        console.warn('Failed to load active jobs:', err);
      } finally {
        setLoading(false);
      }
    };
    loadJobs();
  }, [extractData]);

  const handleLaunch = async (e) => {
    e.preventDefault();
    if (!selectedJobId) {
      addToast('Please select a job profile to practice against.', 'warning');
      return;
    }

    setLaunching(true);
    try {
      // Create session in backend
      const sessionData = await interviewService.schedule({
        jobId: selectedJobId,
        candidateId: String(user.id),
        type: 'AI_MOCK',
        scheduledAt: new Date().toISOString(),
        duration: parseInt(duration, 10),
        notes: `Mock practice assessment: Category=${category}, Difficulty=${difficulty}`,
      });

      const data = extractData(sessionData);
      addToast('Mock interview session scheduled successfully!', 'success');
      
      // Redirect candidate to the live interview room
      navigate(`/candidate/interview?id=${data.id}`);
    } catch (err) {
      console.error('Failed to launch mock session:', err);
      addToast(err.response?.data?.message || 'Could not launch mock interview session.', 'error');
    } finally {
      setLaunching(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">AI Mock Setup</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Customize your real-time practice assessment and receive interactive AI feedback.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Help Banner */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-3xl shadow-md space-y-4 relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-white/10 rounded-full blur-xl" />
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-lg">Practice Mode</h4>
            <p className="text-xs text-blue-155 leading-relaxed">
              Answer generated questions via voice or keyboard simulation. Aria will evaluate your response speed, technical alignment, and confidence index immediately.
            </p>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase bg-white/20 px-2 py-0.5 rounded">
              <Sparkles className="w-3 h-3" /> Powered by Gemini
            </div>
          </div>
        </div>

        {/* Configuration Setup Form */}
        <Card className="md:col-span-2 p-6 md:p-8">
          <form onSubmit={handleLaunch} className="space-y-6">
            
            {/* Job Role Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Target Job Profile</label>
              {jobs.length === 0 ? (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 text-amber-700 dark:text-amber-400 text-sm">
                  No active job positions found. Create an application, or contact HR to seed vacancy models.
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 bg-white dark:bg-slate-950 text-slate-700 dark:text-white"
                  >
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title} — {job.department} ({job.location})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Config parameters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Interview Category */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Question Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 bg-white dark:bg-slate-950 text-slate-700 dark:text-white"
                >
                  <option value="TECHNICAL">Technical & Coding</option>
                  <option value="BEHAVIORAL">Behavioral & Culture Fit</option>
                  <option value="SITUATIONAL">Situational Scenario</option>
                  <option value="COMMUNICATION">Linguistic & Speech</option>
                  <option value="APTITUDE">Logical Reasoning</option>
                </select>
              </div>

              {/* Difficulty Level */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Difficulty Rating</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 bg-white dark:bg-slate-950 text-slate-700 dark:text-white"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium / Intermediate</option>
                  <option value="HARD">Hard / Senior Staff</option>
                </select>
              </div>

            </div>

            {/* Time limits slider */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                <span>Assessment Duration</span>
                <span className="text-blue-500 dark:text-blue-400">{duration} minutes</span>
              </div>
              <input
                type="range"
                min="15"
                max="60"
                step="5"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Launch trigger */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                disabled={launching || jobs.length === 0}
                icon={<Play className="w-4 h-4" />}
              >
                {launching ? 'Initializing room...' : 'Launch Assessment'}
              </Button>
            </div>
          </form>
        </Card>

      </div>
    </div>
  );
}
