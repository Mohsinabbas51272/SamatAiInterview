import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import userService from '../../services/userService';
import reportService from '../../services/reportService';
import { Card } from '../../components/UI/Card';
import { ProgressBar } from '../../components/UI/Progress';
import { Scale, Users, Sparkles, Brain, Award, ShieldAlert, CheckCircle, Loader2 } from 'lucide-react';

export default function CompareCandidates() {
  const { extractData, addToast } = useApp();
  
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Load candidates
        const cRes = await userService.getAll('CANDIDATE');
        const cData = extractData(cRes) || [];

        // Load reports
        const rRes = await reportService.getAll();
        const rData = extractData(rRes) || [];

        // Merge reports details into candidate models
        const merged = cData.map((cand) => {
          const report = rData.find((r) => r.candidateId === cand.id);
          return {
            id: cand.id,
            name: cand.profile ? `${cand.profile.firstName} ${cand.profile.lastName}` : cand.email.split('@')[0],
            email: cand.email,
            skills: cand.profile?.skills || [],
            yearsOfExperience: cand.profile?.yearsOfExperience || 0,
            resumeScore: cand.resume?.matchScore || 0,
            technicalScore: report ? report.technicalScore || report.interviewScore : null,
            communicationScore: report ? report.communicationScore : null,
            confidenceScore: report ? report.confidenceScore : null,
            recommendation: report ? report.recommendation : 'PENDING',
          };
        });

        setCandidates(merged);
        // Autoselect first two if available
        if (merged.length > 1) {
          setSelectedIds([merged[0].id, merged[1].id]);
        } else if (merged.length > 0) {
          setSelectedIds([merged[0].id]);
        }
      } catch (err) {
        console.error('Failed to load comparison data:', err);
        addToast('Failed to retrieve candidates comparative index.', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [extractData]);

  const handleSelectToggle = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= 3) {
        addToast('You can select a maximum of 3 candidates for side-by-side comparison.', 'warning');
        return prev;
      }
      return [...prev, id];
    });
  };

  const selectedCandidates = candidates.filter((c) => selectedIds.includes(c.id));

  if (loading && candidates.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Compare Candidates</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Perform multi-candidate screening audits, mapping technical, communication, and resume vectors side-by-side.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column: Selection checklist */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="p-4 space-y-4">
            <h4 className="font-bold text-sm text-slate-450 uppercase tracking-widest flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" /> Candidates Selection
            </h4>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {candidates.length === 0 ? (
                <p className="text-slate-400 text-xs text-center py-4">No candidates registered.</p>
              ) : (
                candidates.map((c) => (
                  <label
                    key={c.id}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                      selectedIds.includes(c.id)
                        ? 'border-blue-500 bg-blue-500/5 text-blue-600 dark:text-blue-400'
                        : 'border-slate-200 dark:border-slate-850'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(c.id)}
                      onChange={() => handleSelectToggle(c.id)}
                      className="rounded text-blue-500 focus:ring-0 cursor-pointer"
                    />
                    <div className="overflow-hidden">
                      <h5 className="font-bold text-xs truncate">{c.name}</h5>
                      <span className="text-[9px] text-slate-400 block truncate">{c.email}</span>
                    </div>
                  </label>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right column: Comparison grid layout */}
        <div className="lg:col-span-9 space-y-6">
          {selectedCandidates.length === 0 ? (
            <div className="max-w-md mx-auto text-center py-20 space-y-4">
              <Scale className="w-12 h-12 text-slate-350 mx-auto" />
              <h4 className="font-bold text-base">Select Candidates</h4>
              <p className="text-sm text-slate-500">Choose at least one candidate from the ledger to begin visual audit analysis.</p>
            </div>
          ) : (
            <div className={`grid grid-cols-1 md:grid-cols-${selectedCandidates.length} gap-6 items-stretch`}>
              
              {selectedCandidates.map((c) => (
                <Card key={c.id} className="p-6 space-y-6 relative overflow-hidden flex flex-col justify-between">
                  <div className="space-y-6">
                    {/* Header profile */}
                    <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-850">
                      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950/45 text-blue-600 dark:text-blue-400 font-extrabold text-sm flex items-center justify-center uppercase mx-auto mb-2 border border-blue-200 dark:border-blue-800">
                        {c.name.charAt(0)}
                      </div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate">{c.name}</h4>
                      <span className="text-[10px] text-slate-450 block truncate">{c.email}</span>
                    </div>

                    {/* Resume Match */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-400 uppercase tracking-wide">Resume Score</span>
                        <span>{c.resumeScore}%</span>
                      </div>
                      <ProgressBar value={c.resumeScore} height="h-2" color="bg-blue-500" />
                    </div>

                    {/* Technical Skill score */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-400 uppercase tracking-wide">Technical skill</span>
                        <span>{c.technicalScore !== null ? `${c.technicalScore}%` : 'N/A'}</span>
                      </div>
                      <ProgressBar value={c.technicalScore || 0} height="h-2" color="bg-emerald-500" />
                    </div>

                    {/* Communication skills */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-400 uppercase tracking-wide">Communication</span>
                        <span>{c.communicationScore !== null ? `${c.communicationScore}%` : 'N/A'}</span>
                      </div>
                      <ProgressBar value={c.communicationScore || 0} height="h-2" color="bg-indigo-500" />
                    </div>

                    {/* Confidence score */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-400 uppercase tracking-wide">Confidence Scale</span>
                        <span>{c.confidenceScore !== null ? `${c.confidenceScore}%` : 'N/A'}</span>
                      </div>
                      <ProgressBar value={c.confidenceScore || 0} height="h-2" color="bg-purple-500" />
                    </div>

                    {/* Primary Technical skills list */}
                    <div className="space-y-2 border-t border-slate-100 dark:border-slate-850 pt-4">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block"><Award className="w-3.5 h-3.5 inline mr-1 text-blue-500" /> Key Skills</span>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                        {c.skills.length > 0 ? (
                          c.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/40 dark:border-slate-700/40"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-400">None parsed</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Recommendation status footer */}
                  <div className="mt-6 border-t border-slate-100 dark:border-slate-850 pt-4 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Hiring recommendation</span>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-full uppercase">
                      {c.recommendation}
                    </span>
                  </div>

                </Card>
              ))}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
