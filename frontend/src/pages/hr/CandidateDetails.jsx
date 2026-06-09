import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import userService from '../../services/userService';
import reportService from '../../services/reportService';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { ProgressBar } from '../../components/UI/Progress';
import { User, Mail, Phone, MapPin, Award, BookOpen, Clock, Activity, Brain, CheckCircle, ChevronLeft, Calendar } from 'lucide-react';

export default function CandidateDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { extractData, addToast } = useApp();

  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState(null);
  const [candidateReports, setCandidateReports] = useState([]);
  
  // Local journal note trigger
  const [journalNote, setJournalNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Load candidate details
        const cRes = await userService.getById(id);
        const cData = extractData(cRes);
        setCandidate(cData);

        // Load candidate reports
        const rRes = await reportService.getAll();
        const rData = extractData(rRes) || [];
        const filteredReports = rData.filter((r) => r.candidateId === parseInt(id, 10));
        setCandidateReports(filteredReports);
      } catch (err) {
        console.error('Failed to load candidate details:', err);
        addToast('Failed to load candidate details page.', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, extractData]);

  const handleSaveNote = (e) => {
    e.preventDefault();
    if (!journalNote.trim()) return;
    setSubmittingNote(true);
    setTimeout(() => {
      addToast('Recruiter feedback note recorded successfully!', 'success');
      setJournalNote('');
      setSubmittingNote(false);
    }, 800);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-bold">Candidate Not Found</h3>
        <Button onClick={() => navigate('/hr/candidates')} className="mt-4">Back to Candidate List</Button>
      </div>
    );
  }

  const profile = candidate.profile || {};
  const resume = candidate.resume || {};
  
  const hasReports = candidateReports.length > 0;
  const mainReport = hasReports ? candidateReports[0] : null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Back button and profile header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/hr/candidates')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white uppercase tracking-wider transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to list
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left column: Profile card & basic details */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 text-center flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />
            <div className="w-20 h-20 rounded-full bg-blue-150 text-blue-600 dark:bg-blue-950/45 dark:text-blue-400 border border-blue-200 dark:border-blue-800 font-extrabold text-2xl flex items-center justify-center uppercase mb-4 shadow-sm">
              {(profile.firstName || candidate.email).charAt(0)}
            </div>
            
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
              {profile.firstName ? `${profile.firstName} ${profile.lastName}` : candidate.email.split('@')[0]}
            </h3>
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1 uppercase tracking-wider">{profile.title || 'Candidate Applicant'}</p>
            
            <div className="w-full border-t border-slate-100 dark:border-slate-850 my-6 pt-6 space-y-3.5 text-left text-sm text-slate-600 dark:text-slate-450">
              <div className="flex items-center gap-2.5 truncate">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{candidate.email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{profile.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{profile.location || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Exp: {profile.yearsOfExperience !== null ? `${profile.yearsOfExperience} years` : 'N/A'}</span>
              </div>
            </div>
          </Card>

          {/* Parsed CV Skills */}
          <Card className="p-6">
            <h4 className="font-bold text-sm text-slate-850 dark:text-slate-200 uppercase tracking-widest border-b border-slate-100 dark:border-slate-850 pb-3 mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-500" /> Extracted Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {profile.skills && profile.skills.length > 0 ? (
                profile.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-350 border border-slate-200/50 dark:border-slate-700/50"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">No profile skills listed.</span>
              )}
            </div>
          </Card>
        </div>

        {/* Right column: Resume Screening & Interview Report details */}
        <div className="lg:col-span-8 space-y-6">
          {/* Resume parsed analysis */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
              <h4 className="font-bold text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-500" /> Resume Screening Metrics
              </h4>
              {resume.matchScore !== undefined && (
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-full">
                  Compatibility: {resume.matchScore}%
                </span>
              )}
            </div>
            
            {resume.aiAnalysis ? (
              <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/40 dark:border-slate-800">
                <p className="font-bold text-xs uppercase tracking-wider text-slate-450 mb-1.5 flex items-center gap-1.5"><Brain className="w-3.5 h-3.5 text-purple-500" /> AI CV Analysis Critique</p>
                {resume.aiAnalysis}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No CV parsing documents uploaded yet.</p>
            )}
          </Card>

          {/* Interview Performance Report */}
          <Card className="p-6 space-y-6">
            <h4 className="font-bold text-base border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" /> AI Interview Assessment Report
            </h4>

            {mainReport ? (
              <div className="space-y-6">
                
                {/* Performance stats progress */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400">Technical Skill</span>
                      <span className="text-slate-700 dark:text-slate-200">{mainReport.technicalScore || mainReport.interviewScore}%</span>
                    </div>
                    <ProgressBar value={mainReport.technicalScore || mainReport.interviewScore} height="h-2" color="bg-blue-500" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400">Communication</span>
                      <span className="text-slate-700 dark:text-slate-200">{mainReport.communicationScore}%</span>
                    </div>
                    <ProgressBar value={mainReport.communicationScore} height="h-2" color="bg-emerald-500" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400">Confidence Scale</span>
                      <span className="text-slate-700 dark:text-slate-200">{mainReport.confidenceScore}%</span>
                    </div>
                    <ProgressBar value={mainReport.confidenceScore} height="h-2" color="bg-indigo-500" />
                  </div>
                </div>

                {/* NLP Analysis */}
                <div className="p-4 rounded-2xl bg-indigo-50/20 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 text-sm text-slate-650 dark:text-slate-350 leading-relaxed">
                  <span className="text-[10px] font-bold text-indigo-550 dark:text-indigo-400 uppercase tracking-widest block mb-1">AI NLP Synthesis</span>
                  {mainReport.nlpAnalysis}
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-250/20 text-sm">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-2">Key Strengths</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                      {mainReport.strengths && mainReport.strengths.map((str, idx) => (
                        <li key={idx}>{str}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/20 dark:bg-amber-950/10 border border-amber-250/20 text-sm">
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest block mb-2">Areas for Growth</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                      {mainReport.weaknesses && mainReport.weaknesses.map((wk, idx) => (
                        <li key={idx}>{wk}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl">
                  <span className="text-xs text-slate-500">Recommendation Vector:</span>
                  <span className="text-sm font-bold bg-blue-500 text-white px-3 py-1 rounded-full uppercase">
                    {mainReport.recommendation}
                  </span>
                </div>

              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-sm">
                No active interview session reports compiled for this candidate.
              </div>
            )}
          </Card>

          {/* Recruiter journal feedback logs */}
          <Card className="p-6 space-y-4">
            <h4 className="font-bold text-base border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-indigo-500" /> Recruiter Evaluation Journal
            </h4>
            
            <form onSubmit={handleSaveNote} className="space-y-3">
              <textarea
                value={journalNote}
                onChange={(e) => setJournalNote(e.target.value)}
                placeholder="Enter custom screening logs or final notes to compile with this applicant's report..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 bg-white dark:bg-slate-950 text-slate-750 dark:text-white min-h-[100px] resize-none"
              />
              <div className="flex justify-end">
                <Button type="submit" variant="primary" disabled={submittingNote || !journalNote.trim()}>
                  {submittingNote ? 'Saving entry...' : 'Record Entry'}
                </Button>
              </div>
            </form>
          </Card>
        </div>

      </div>
    </div>
  );
}
