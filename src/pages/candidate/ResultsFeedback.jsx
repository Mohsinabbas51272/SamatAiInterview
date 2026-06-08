import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { ProgressBar } from '../../components/UI/Progress';
import { Award, Brain, TrendingUp, MessageSquare, AlertCircle, Play, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import reportService from '../../services/reportService';

export default function ResultsFeedback() {
  const { extractData } = useApp();
  const [searchParams] = useSearchParams();
  const interviewIdParam = searchParams.get('interviewId');

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [reportsList, setReportsList] = useState([]);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        // Load all reports first
        const allReportsRes = await reportService.getAll();
        const reports = extractData(allReportsRes) || [];
        setReportsList(reports);

        if (reports.length > 0) {
          // Determine which report to show: either from query param or the latest one
          let targetInterviewId = interviewIdParam;
          if (!targetInterviewId) {
            targetInterviewId = reports[0].interviewId;
          }

          if (targetInterviewId) {
            const reportDetailsRes = await reportService.getByInterview(targetInterviewId);
            setReport(extractData(reportDetailsRes));
          }
        }
      } catch (err) {
        console.error('Failed to load report:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [interviewIdParam]);

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
          <h2 className="text-xl font-bold font-display text-slate-800 dark:text-white">AI Evaluation Scorecard</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review candidate compatibility metrics and competency logs</p>
        </div>

        {/* Report Selector dropdown if they have multiple reports */}
        {reportsList.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Select Session:</span>
            <select
              value={report?.interviewId || ''}
              onChange={(e) => {
                const id = e.target.value;
                window.location.search = `?interviewId=${id}`;
              }}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
            >
              {reportsList.map((r) => (
                <option key={r.id} value={r.interviewId}>
                  {r.interview?.job?.title || 'Mock'} - {new Date(r.generatedAt).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {report ? (
        <div className="max-w-4xl space-y-6">
          {/* Main KPI Ratings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card className="p-5 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-2">Resume Parse Match</span>
              <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 block font-display mb-2">
                {report.resumeScore !== null ? `${Math.round(report.resumeScore)}%` : 'N/A'}
              </span>
              <ProgressBar value={report.resumeScore || 0} height="h-1.5" color="bg-blue-500" />
            </Card>

            <Card className="p-5 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-2">Technical Interview Score</span>
              <span className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 block font-display mb-2">
                {report.interviewScore !== null ? `${Math.round(report.interviewScore)}%` : 'N/A'}
              </span>
              <ProgressBar value={report.interviewScore || 0} height="h-1.5" color="bg-purple-500" />
            </Card>

            <Card className="p-5 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-2">Linguistic Confidence</span>
              <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 block font-display mb-2">
                {report.confidenceScore !== null ? `${Math.round(report.confidenceScore)}%` : 'N/A'}
              </span>
              <ProgressBar value={report.confidenceScore || 0} height="h-1.5" color="bg-emerald-500" />
            </Card>
          </div>

          {/* Details split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Skills Progress */}
            <Card className="p-6">
              <h4 className="font-bold text-slate-850 dark:text-slate-200 text-sm flex items-center gap-2 mb-6 pb-2 border-b border-slate-100 dark:border-slate-800">
                <TrendingUp className="w-4 h-4 text-blue-500" /> Competency Breakdown
              </h4>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Technical & System Architecture</span>
                    <span>{report.technicalScore !== null ? `${Math.round(report.technicalScore)}%` : '80%'}</span>
                  </div>
                  <ProgressBar value={report.technicalScore || 80} height="h-2" color="bg-blue-600" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Communication & Clarity</span>
                    <span>{report.communicationScore !== null ? `${Math.round(report.communicationScore)}%` : '85%'}</span>
                  </div>
                  <ProgressBar value={report.communicationScore || 85} height="h-2" color="bg-indigo-600" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Self-Confidence & Demeanor</span>
                    <span>{report.confidenceScore !== null ? `${Math.round(report.confidenceScore)}%` : '90%'}</span>
                  </div>
                  <ProgressBar value={report.confidenceScore || 90} height="h-2" color="bg-sky-600" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Overall Suitability Index</span>
                    <span>{report.overallScore !== null ? `${Math.round(report.overallScore)}%` : '82%'}</span>
                  </div>
                  <ProgressBar value={report.overallScore || 82} height="h-2" color="bg-purple-600" />
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-emerald-500 font-bold uppercase block mb-2">Key Strengths</span>
                  <ul className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 list-disc pl-3">
                    {report.strengths && report.strengths.length > 0 ? (
                      report.strengths.map((s, idx) => <li key={idx}>{s}</li>)
                    ) : (
                      <>
                        <li>Excellent communication</li>
                        <li>Strong structural knowledge</li>
                      </>
                    )}
                  </ul>
                </div>
                <div>
                  <span className="text-[10px] text-rose-500 font-bold uppercase block mb-2">Refinement Areas</span>
                  <ul className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 list-disc pl-3">
                    {report.weaknesses && report.weaknesses.length > 0 ? (
                      report.weaknesses.map((w, idx) => <li key={idx}>{w}</li>)
                    ) : (
                      <>
                        <li>Needs slight edge-case tuning</li>
                        <li>Time allocation sizing</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </Card>

            {/* AI Review Summary */}
            <Card className="p-6 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-850 dark:text-slate-200 text-sm flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <Brain className="w-4 h-4 text-purple-500" /> AI Executive Analysis
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 px-3 py-1.5 rounded-lg border border-indigo-100/50 dark:border-indigo-900/30 w-fit">
                    <Sparkles className="w-4.5 h-4.5 text-indigo-500" /> Recommendation: {report.recommendation || 'HIRE'}
                  </div>
                  <p className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 text-xs text-slate-650 dark:text-slate-400 leading-relaxed">
                    {report.nlpAnalysis}
                  </p>
                </div>
              </div>

              <div className="flex gap-2.5 p-3.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/30 rounded-xl text-xs text-blue-700 dark:text-blue-400 mt-4">
                <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                <span>Your results are officially published. Recruiters can now access this report in the HR administration pipeline.</span>
              </div>
            </Card>
          </div>

          {/* Answer Transcripts */}
          {report.interview?.answers && report.interview.answers.length > 0 && (
            <Card className="p-6">
              <h4 className="font-bold text-slate-850 dark:text-slate-200 text-sm flex items-center gap-2 mb-6 pb-2 border-b border-slate-100 dark:border-slate-800">
                <MessageSquare className="w-4 h-4 text-blue-500" /> Recorded Transcripts & AI Feedback
              </h4>
              <div className="space-y-6">
                {report.interview.answers.map((ans, idx) => (
                  <div key={ans.id} className="space-y-1.5 pb-4 border-b border-slate-100 dark:border-slate-800 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-slate-450 uppercase">Question {idx + 1}</span>
                      {ans.score !== null && (
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-900/30">
                          Score: {Math.round(ans.score)}%
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{ans.question?.text}</p>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <p className="text-xs text-slate-650 dark:text-slate-400 italic">"{ans.answerText}"</p>
                    </div>
                    {ans.aiFeedback && (
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 pl-3 border-l-2 border-indigo-200 dark:border-indigo-900">
                        <span className="font-bold">AI Feedback:</span> {ans.aiFeedback}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      ) : (
        <Card className="p-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
            <Award className="w-8 h-8 opacity-60" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h4 className="font-bold text-base text-slate-800 dark:text-slate-200">No Assessment Result Available</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Complete your AI simulated assessment first. Once analyzed by the Gemini parser, your full scorecard will render here.
            </p>
          </div>
          <Link to="/candidate/schedule">
            <Button variant="primary" size="sm" className="flex items-center gap-1 font-bold">
              Go to Interview Room <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
