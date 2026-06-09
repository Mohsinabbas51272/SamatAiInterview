import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  Printer,
  Share2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Brain,
  MessageSquare,
  ArrowLeft,
  Calendar,
  Sparkles,
  Bot,
  Loader2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card, CardBody } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { ProgressBar } from '../components/UI/Progress';
import reportService from '../services/reportService';

export default function FeedbackReport() {
  const { candidateId } = useParams(); // interviewId is passed as candidateId parameter in the route
  const navigate = useNavigate();
  const { extractData, addToast } = useApp();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await reportService.getByInterview(candidateId);
        setReport(extractData(res));
      } catch (err) {
        console.error('Failed to load candidate feedback report:', err);
        addToast('Failed to load evaluation scorecard.', 'error');
      } finally {
        setLoading(false);
      }
    };
    if (candidateId) {
      fetchReport();
    }
  }, [candidateId]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast('Scorecard URL copied to clipboard!', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50/40">
        <Card className="text-center p-8 border border-slate-200">
          <CardBody className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Candidate Profile Not Found</h3>
            <Button variant="primary" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  const getStatusBadge = () => {
    const rec = report.recommendation || 'BORDERLINE';
    switch (rec) {
      case 'STRONG_HIRE':
      case 'HIRE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900 shadow-sm">
            <CheckCircle className="w-3.5 h-3.5" /> Selected ({rec.replace('_', ' ')})
          </span>
        );
      case 'BORDERLINE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-yellow-50 text-yellow-700 border border-yellow-100 dark:bg-yellow-950/20 dark:text-yellow-450 dark:border-yellow-900 shadow-sm">
            <AlertTriangle className="w-3.5 h-3.5" /> Further Review
          </span>
        );
      case 'REJECT':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-450 dark:border-rose-900 shadow-sm">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
    }
  };

  const candidateName = report.candidate?.profile
    ? `${report.candidate.profile.firstName} ${report.candidate.profile.lastName}`
    : report.candidate?.email || 'Candidate';

  return (
    <div className="min-h-screen bg-slate-50/40 dark:bg-slate-950/20 p-4 sm:p-6 md:p-8 space-y-8 print:bg-white print:p-0">
      
      {/* Navigation Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>

        <div className="flex gap-2.5">
          <Button variant="secondary" size="sm" onClick={handleShare} className="font-bold">
            Share Scorecard
          </Button>
          <Button variant="primary" size="sm" onClick={handlePrint} className="font-bold">
            Print / Download PDF
          </Button>
        </div>
      </div>

      {/* Main Scorecard Page */}
      <div className="max-w-4xl mx-auto space-y-6 print:max-w-none">
        
        {/* Profile Card Header */}
        <Card className="border border-slate-200/80 bg-white/95 dark:bg-slate-900 dark:border-slate-800 shadow-md print:shadow-none print:border-slate-300">
          <CardBody className="flex flex-col sm:flex-row justify-between sm:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white text-2xl shadow-md shrink-0">
                {candidateName.charAt(0)}
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-extrabold text-slate-800 dark:text-white font-display print:text-2xl">{candidateName}</h2>
                <p className="text-sm text-slate-500 font-semibold">{report.interview?.job?.title || 'Engineering Role'}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold pt-1">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Evaluated: {new Date(report.generatedAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>ID: {report.id.substring(0, 8)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Final Status Recommendation</span>
              {getStatusBadge()}
            </div>
          </CardBody>
        </Card>

        {/* Analytics Score Banner Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="border border-slate-100 dark:border-slate-800 text-center">
            <CardBody className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Resume Score</span>
              <span className="text-3xl font-extrabold text-blue-600 block font-display">
                {report.resumeScore !== null ? `${Math.round(report.resumeScore)}%` : 'N/A'}
              </span>
              <ProgressBar value={report.resumeScore || 0} height="h-1.5" color="bg-blue-500" className="pt-2" />
            </CardBody>
          </Card>

          <Card className="border border-slate-100 dark:border-slate-800 text-center">
            <CardBody className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">AI Technical Interview Score</span>
              <span className="text-3xl font-extrabold text-purple-600 block font-display">
                {report.interviewScore !== null ? `${Math.round(report.interviewScore)}%` : 'N/A'}
              </span>
              <ProgressBar value={report.interviewScore || 0} height="h-1.5" color="bg-purple-500" className="pt-2" />
            </CardBody>
          </Card>

          <Card className="border border-slate-100 dark:border-slate-800 text-center">
            <CardBody className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Confidence metric Score</span>
              <span className="text-3xl font-extrabold text-emerald-600 block font-display">
                {report.confidenceScore !== null ? `${Math.round(report.confidenceScore)}%` : 'N/A'}
              </span>
              <ProgressBar value={report.confidenceScore || 0} height="h-1.5" color="bg-emerald-500" className="pt-2" />
            </CardBody>
          </Card>
        </div>

        {/* Details Metrics Sections Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left panel: Skill ratings */}
          <Card className="border border-slate-200/80 bg-white/95 dark:bg-slate-900 dark:border-slate-800 shadow-md">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2 mb-6 pb-2 border-b border-slate-100 dark:border-slate-800">
              <TrendingUp className="w-4.5 h-4.5 text-blue-500" /> Skill evaluations Analysis
            </h4>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-350">
                  <span>Technical & Core Engineering</span>
                  <span>{report.technicalScore !== null ? `${Math.round(report.technicalScore)}%` : '80%'}</span>
                </div>
                <ProgressBar value={report.technicalScore || 80} height="h-2" color="bg-blue-600" />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-350">
                  <span>Linguistic Articulation & Flow</span>
                  <span>{report.communicationScore !== null ? `${Math.round(report.communicationScore)}%` : '85%'}</span>
                </div>
                <ProgressBar value={report.communicationScore || 85} height="h-2" color="bg-indigo-600" />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-350">
                  <span>Confidence & Telemetry Index</span>
                  <span>{report.confidenceScore !== null ? `${Math.round(report.confidenceScore)}%` : '90%'}</span>
                </div>
                <ProgressBar value={report.confidenceScore || 90} height="h-2" color="bg-sky-600" />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-350">
                  <span>Overall Suitability Index</span>
                  <span>{report.overallScore !== null ? `${Math.round(report.overallScore)}%` : '82%'}</span>
                </div>
                <ProgressBar value={report.overallScore || 82} height="h-2" color="bg-purple-600" />
              </div>
            </div>
          </Card>

          {/* Right panel: NLP Linguistics summary and recommendations */}
          <Card className="border border-slate-200/80 bg-white/95 dark:bg-slate-900 dark:border-slate-800 shadow-md">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Brain className="w-4.5 h-4.5 text-purple-500" /> Executive NLP Analysis
            </h4>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-xs text-slate-650 dark:text-slate-400 font-medium leading-relaxed">
                {report.nlpAnalysis}
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">AI Final Recommendation</span>
                <div className="p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/20 flex items-center gap-3 text-xs text-indigo-900 dark:text-indigo-400 font-semibold">
                  <Bot className="w-5 h-5 text-indigo-600 shrink-0" />
                  <span>Recommendation: {report.recommendation || 'HIRE'}. {report.recommendation === 'REJECT' ? 'Dispatch automated callback.' : 'Proceed to final round executive interview.'}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Strengths and Weaknesses section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border border-emerald-105 bg-emerald-50/10 dark:bg-emerald-950/10 dark:border-emerald-900/30">
            <h4 className="font-bold text-emerald-800 dark:text-emerald-450 text-sm mb-4">Core Strengths</h4>
            <ul className="text-xs text-emerald-700 dark:text-emerald-350 space-y-2.5 font-semibold list-disc pl-4">
              {report.strengths && report.strengths.length > 0 ? (
                report.strengths.map((str, idx) => <li key={idx}>{str}</li>)
              ) : (
                <>
                  <li>Good understanding of domain standards</li>
                  <li>Clear and logical technical explanation style</li>
                </>
              )}
            </ul>
          </Card>

          <Card className="border border-rose-105 bg-rose-50/10 dark:bg-rose-950/10 dark:border-rose-900/30">
            <h4 className="font-bold text-rose-800 dark:text-rose-455 text-sm mb-4 font-display">Areas for Growth</h4>
            <ul className="text-xs text-rose-700 dark:text-rose-350 space-y-2.5 font-semibold list-disc pl-4">
              {report.weaknesses && report.weaknesses.length > 0 ? (
                report.weaknesses.map((weak, idx) => <li key={idx}>{weak}</li>)
              ) : (
                <>
                  <li>Could explain edge cases in more detail</li>
                  <li>Time sizing estimations can be improved</li>
                </>
              )}
            </ul>
          </Card>
        </div>

        {/* Interview transcripts/responses list if present */}
        {report.interview?.answers && report.interview.answers.length > 0 && (
          <Card className="border border-slate-200/80 bg-white/95 dark:bg-slate-900 dark:border-slate-800 shadow-md print:border-slate-300">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2 mb-6 pb-2 border-b border-slate-100 dark:border-slate-800">
              <MessageSquare className="w-4.5 h-4.5 text-blue-500" /> Recorded Technical Responses Transcripts
            </h4>
            <div className="space-y-6">
              {report.interview.answers.map((ans, idx) => (
                <div key={ans.id} className="space-y-2 border-b border-slate-50 dark:border-slate-800 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-center text-[10px] text-slate-450 font-bold uppercase tracking-widest">
                    <span>Question {idx + 1} Answer Node</span>
                    {ans.score !== null && (
                      <span className="text-[10px] text-blue-500 font-extrabold bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/30">
                        Score: {Math.round(ans.score)}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-850 dark:text-slate-250 font-semibold">{ans.question?.text}</p>
                  <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-100 dark:border-slate-850">
                    <p className="text-xs text-slate-700 dark:text-slate-400 italic leading-relaxed">
                      "{ans.answerText}"
                    </p>
                  </div>
                  {ans.aiFeedback && (
                    <p className="text-xs text-indigo-650 dark:text-indigo-400 pl-3 border-l-2 border-indigo-200 dark:border-indigo-850 leading-relaxed">
                      <span className="font-bold">AI Feedback:</span> {ans.aiFeedback}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
