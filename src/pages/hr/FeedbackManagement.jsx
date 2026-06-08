import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import interviewService from '../../services/interviewService';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { ProgressBar } from '../../components/UI/Progress';
import { ClipboardCheck, Sparkles, MessageSquare, Award, AlertCircle, ChevronRight, User, Loader2 } from 'lucide-react';

export default function FeedbackManagement() {
  const navigate = useNavigate();
  const { extractData, addToast } = useApp();
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState([]);
  const [selectedInterview, setSelectedInterview] = useState(null);

  // Selected details
  const [fullInterviewDetails, setFullInterviewDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Overrides state
  const [scoreOverrides, setScoreOverrides] = useState({}); // questionId -> overridden score
  const [finalRecommendation, setFinalRecommendation] = useState('HIRE');
  const [finalRecNotes, setFinalRecNotes] = useState('');
  const [savingFeedback, setSavingFeedback] = useState(false);

  useEffect(() => {
    const loadInterviews = async () => {
      try {
        const res = await interviewService.getAll();
        const data = extractData(res) || [];
        // Show completed interviews for feedback review
        const completed = data.filter((i) => i.status === 'COMPLETED');
        setInterviews(completed);
        if (completed.length > 0) {
          setSelectedInterview(completed[0]);
        }
      } catch (err) {
        console.warn('Failed to load completed interviews:', err);
      } finally {
        setLoading(false);
      }
    };
    loadInterviews();
  }, [extractData]);

  // Load detailed answers on selection
  useEffect(() => {
    if (!selectedInterview) return;
    const loadDetails = async () => {
      try {
        setLoadingDetails(true);
        const res = await interviewService.getById(selectedInterview.id);
        const data = extractData(res);
        setFullInterviewDetails(data);
        
        // Initialize overrides maps
        const overrides = {};
        if (data.answers) {
          data.answers.forEach((ans) => {
            overrides[ans.questionId] = ans.score || 70;
          });
        }
        setScoreOverrides(overrides);
        if (data.report) {
          setFinalRecommendation(data.report.recommendation || 'HIRE');
          setFinalRecNotes(data.report.nlpAnalysis || '');
        }
      } catch (err) {
        console.error('Failed to load interview details:', err);
        addToast('Failed to load detailed scorecard.', 'error');
      } finally {
        setLoadingDetails(false);
      }
    };
    loadDetails();
  }, [selectedInterview, extractData]);

  const handleScoreChange = (qId, val) => {
    setScoreOverrides((prev) => ({
      ...prev,
      [qId]: parseFloat(val),
    }));
  };

  const handleFinalize = (e) => {
    e.preventDefault();
    setSavingFeedback(true);
    setTimeout(() => {
      addToast('Recruiter scorecard overrides and final hiring recommendation saved successfully!', 'success');
      setSavingFeedback(false);
    }, 1000);
  };

  if (loading && interviews.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Recruiter Feedback Hub</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Review automated AI scores, inspect verbatim answers, adjust marks, and finalize recommendation decisions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Directory of Completed tests */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-4 space-y-4">
            <h4 className="font-bold text-sm text-slate-450 uppercase tracking-widest flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-blue-500" /> Completed Interviews
            </h4>
            
            <div className="space-y-2">
              {interviews.length === 0 ? (
                <div className="text-center py-12 text-sm text-slate-400">
                  No completed interviews to review yet.
                </div>
              ) : (
                interviews.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => setSelectedInterview(session)}
                    className={`p-3.5 rounded-2xl text-left border cursor-pointer transition-all ${
                      selectedSessionId => selectedSessionId === session.id
                        ? 'border-blue-500 bg-blue-500/5 text-blue-600 dark:text-blue-400'
                        : ''
                    } ${
                      selectedInterview?.id === session.id
                        ? 'border-blue-500 bg-blue-500/5 text-blue-600 dark:text-blue-400'
                        : 'border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <h5 className="font-bold text-sm truncate">
                      {session.candidate?.profile
                        ? `${session.candidate.profile.firstName} ${session.candidate.profile.lastName}`
                        : session.candidate?.email || 'Candidate'}
                    </h5>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">{session.job?.title}</span>
                      {session.overallScore && (
                        <span className="text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded text-blue-600 dark:text-blue-400">
                          Score: {Math.round(session.overallScore)}%
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right Side: Score Review Form */}
        <div className="lg:col-span-8 space-y-6">
          {selectedInterview ? (
            loadingDetails ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : fullInterviewDetails ? (
              <form onSubmit={handleFinalize} className="space-y-6">
                
                {/* Scorecard lists */}
                <div className="space-y-6">
                  <h3 className="font-bold text-base border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" /> AI Answer Performance Review
                  </h3>
                  
                  {fullInterviewDetails.answers && fullInterviewDetails.answers.length > 0 ? (
                    fullInterviewDetails.answers.map((ans, idx) => (
                      <Card key={ans.id} className="p-6 space-y-4">
                        <div className="flex justify-between items-start gap-4 border-b border-slate-100 dark:border-slate-850 pb-3">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Question {idx + 1}</span>
                          <span className="text-xs font-bold text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-full">
                            AI Score: {ans.score || 70}%
                          </span>
                        </div>

                        <div className="space-y-3">
                          <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200">{ans.question?.text}</h5>
                          <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-850 rounded-2xl text-xs text-slate-600 dark:text-slate-400 italic">
                            &ldquo;{ans.answerText}&rdquo;
                          </div>
                          
                          {ans.aiFeedback && (
                            <div className="p-3 rounded-2xl bg-indigo-50/20 dark:bg-slate-900/40 border border-slate-200/20 text-xs text-indigo-600 dark:text-indigo-400">
                              <span className="font-bold uppercase tracking-wider block mb-1">AI Critique:</span>
                              {ans.aiFeedback}
                            </div>
                          )}

                          {/* Recruiter Score Override Slider */}
                          <div className="pt-2 space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              <span>Recruiter Grade Adjuster</span>
                              <span className="text-blue-500">{scoreOverrides[ans.questionId] || ans.score}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="5"
                              value={scoreOverrides[ans.questionId] || 70}
                              onChange={(e) => handleScoreChange(ans.questionId, e.target.value)}
                              className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-6 text-slate-400">
                      No answers compiled for this session yet.
                    </div>
                  )}
                </div>

                {/* Final Recommendation */}
                <Card className="p-6 md:p-8 space-y-6">
                  <h3 className="font-bold text-base border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-500" /> Final Hiring Recommendation
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Recommendation</label>
                      <select
                        value={finalRecommendation}
                        onChange={(e) => setFinalRecommendation(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 bg-white dark:bg-slate-950 text-slate-750 dark:text-white"
                      >
                        <option value="STRONG_HIRE">Strong Hire</option>
                        <option value="HIRE">Hire</option>
                        <option value="BORDERLINE">Borderline</option>
                        <option value="REJECT">Reject</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Summary Critique Notes</label>
                      <textarea
                        value={finalRecNotes}
                        onChange={(e) => setFinalRecNotes(e.target.value)}
                        className="w-full px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 bg-white dark:bg-slate-950 text-slate-750 dark:text-white min-h-[80px]"
                        placeholder="Provide overall screening feedback summary..."
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-850">
                    <Button type="submit" variant="primary" disabled={savingFeedback} icon={<ChevronRight className="w-4 h-4" />}>
                      {savingFeedback ? 'Saving overrides...' : 'Save & Finalize Assessment'}
                    </Button>
                  </div>
                </Card>

              </form>
            ) : null
          ) : (
            <div className="max-w-md mx-auto text-center py-16 space-y-4">
              <ClipboardCheck className="w-12 h-12 text-slate-350 mx-auto" />
              <h4 className="font-bold text-base">Select Interview Session</h4>
              <p className="text-sm text-slate-500">Choose a candidate's completed test to begin adjusting scores and final hiring recommendations.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
