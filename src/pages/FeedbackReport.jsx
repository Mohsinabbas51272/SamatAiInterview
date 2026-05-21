import React from 'react';
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
  Bot
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card, CardHeader, CardBody } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { ProgressBar } from '../components/UI/Progress';

export default function FeedbackReport() {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const { candidates, addToast } = useApp();

  // Find candidate by ID
  const candidate = candidates.find((c) => c.id === candidateId) || candidates[0];

  if (!candidate) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50/40">
        <Card className="text-center p-8 border border-slate-200">
          <CardBody className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Candidate Profile Not Found</h3>
            <Button variant="primary" onClick={() => navigate('/admin/dashboard')}>
              Return to HR Admin
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast('Scorecard URL copied to clipboard!', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = () => {
    switch (candidate.status) {
      case 'Selected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm">
            <CheckCircle className="w-3.5 h-3.5" /> Selected
          </span>
        );
      case 'Further Review':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-yellow-50 text-yellow-700 border border-yellow-100 shadow-sm">
            <AlertTriangle className="w-3.5 h-3.5" /> Further Review
          </span>
        );
      case 'Rejected':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-100 shadow-sm">
            <XCircle className="w-3.5 h-3.5" /> Further Review
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/40 p-4 sm:p-6 md:p-8 space-y-8 print:bg-white print:p-0">
      
      {/* Navigation Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>

        <div className="flex gap-2.5">
          <Button variant="secondary" size="sm" icon={<Share2 className="w-4 h-4" />} onClick={handleShare}>
            Share Scorecard
          </Button>
          <Button variant="primary" size="sm" icon={<Printer className="w-4 h-4" />} onClick={handlePrint}>
            Print / Download PDF
          </Button>
        </div>
      </div>

      {/* Main Scorecard Page */}
      <div className="max-w-4xl mx-auto space-y-6 print:max-w-none">
        
        {/* Profile Card Header */}
        <Card className="border border-slate-200/80 bg-white/95 shadow-md print:shadow-none print:border-slate-300">
          <CardBody className="flex flex-col sm:flex-row justify-between sm:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white text-2xl shadow-md shrink-0">
                {candidate.name.charAt(0)}
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-extrabold text-slate-800 font-display print:text-2xl">{candidate.name}</h2>
                <p className="text-sm text-slate-500 font-semibold">{candidate.role}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold pt-1">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Evaluated: {candidate.date}</span>
                  <span>•</span>
                  <span>ID: {candidate.id}</span>
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
          <Card className="border border-slate-100 text-center" hoverEffect>
            <CardBody className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Resume Score</span>
              <span className="text-3xl font-extrabold text-blue-600 block font-display">{candidate.resumeScore}%</span>
              <ProgressBar value={candidate.resumeScore} height="h-1.5" color="bg-blue-500" className="pt-2" />
            </CardBody>
          </Card>

          <Card className="border border-slate-100 text-center" hoverEffect>
            <CardBody className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">AI Technical Interview Score</span>
              <span className="text-3xl font-extrabold text-purple-600 block font-display">{candidate.interviewScore}%</span>
              <ProgressBar value={candidate.interviewScore} height="h-1.5" color="bg-purple-500" className="pt-2" />
            </CardBody>
          </Card>

          <Card className="border border-slate-100 text-center" hoverEffect>
            <CardBody className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Confidence metric Score</span>
              <span className="text-3xl font-extrabold text-emerald-600 block font-display">{candidate.confidenceScore}%</span>
              <ProgressBar value={candidate.confidenceScore} height="h-1.5" color="bg-emerald-500" className="pt-2" />
            </CardBody>
          </Card>
        </div>

        {/* Details Metrics Sections Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left panel: Skill ratings */}
          <Card className="border border-slate-200/80 bg-white/95 shadow-md">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-6 pb-2 border-b border-slate-100">
              <TrendingUp className="w-4.5 h-4.5 text-blue-500" /> Skill evaluations Analysis
            </h4>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>React core & Hook architectures</span>
                  <span>90%</span>
                </div>
                <ProgressBar value={90} height="h-2" color="bg-blue-600" />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>State Management optimization</span>
                  <span>85%</span>
                </div>
                <ProgressBar value={85} height="h-2" color="bg-indigo-600" />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Responsive styling (Tailwind CSS)</span>
                  <span>95%</span>
                </div>
                <ProgressBar value={95} height="h-2" color="bg-sky-600" />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Communication articulation rating</span>
                  <span>{candidate.communicationScore}%</span>
                </div>
                <ProgressBar value={candidate.communicationScore} height="h-2" color="bg-purple-600" />
              </div>
            </div>
          </Card>

          {/* Right panel: NLP Linguistics summary and recommendations */}
          <Card className="border border-slate-200/80 bg-white/95 shadow-md">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <Brain className="w-4.5 h-4.5 text-purple-500" /> Executive NLP Analysis
            </h4>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 font-medium leading-relaxed">
                {candidate.nlpAnalysis || "The candidate shows outstanding conceptual understanding of state isolation and responsive rendering flows. Speech signals denote an analytical demeanor with minor structural delays during high stress index nodes."}
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">AI Final Recommendation</span>
                <div className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/50 flex items-center gap-3 text-xs text-indigo-900 font-semibold">
                  <Bot className="w-5 h-5 text-indigo-600 shrink-0" />
                  <span>Recommend proceeding to final round HR panel call. Validate system integration scaling capabilities.</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Strengths and Weaknesses section */}
        {candidate.strengths && candidate.strengths.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border border-emerald-100 bg-emerald-50/20">
              <h4 className="font-bold text-emerald-800 text-sm mb-4">Core Strengths</h4>
              <ul className="text-xs text-emerald-700 space-y-2.5 font-semibold">
                {candidate.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="border border-rose-100 bg-rose-50/20">
              <h4 className="font-bold text-rose-800 text-sm mb-4 font-display">Areas for Growth</h4>
              <ul className="text-xs text-rose-700 space-y-2.5 font-semibold">
                {candidate.weaknesses.map((weak, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                    <span>{weak}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        )}

        {/* Interview transcripts/responses list if present */}
        {candidate.answers && Object.keys(candidate.answers).length > 0 && (
          <Card className="border border-slate-200/80 bg-white/95 shadow-md print:border-slate-300">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-6 pb-2 border-b border-slate-100">
              <MessageSquare className="w-4.5 h-4.5 text-blue-500" /> Recorded Technical Responses Transcripts
            </h4>
            <div className="space-y-6">
              {Object.entries(candidate.answers).map(([key, value]) => (
                <div key={key} className="space-y-2 border-b border-slate-50 pb-4 last:border-b-0 last:pb-0">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Question {parseInt(key) + 1} Answer Node</span>
                  <p className="text-xs text-slate-700 italic font-semibold leading-relaxed">
                    "{value}"
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
