import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import resumeService from '../../services/resumeService';
import { FileSearch, CheckCircle2, AlertTriangle, Lightbulb, Briefcase, Award, GraduationCap } from 'lucide-react';

export default function ResumeReport() {
  const { addToast, extractData } = useApp();
  const [loading, setLoading] = useState(true);
  const [resume, setResume] = useState(null);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await resumeService.get();
        const data = extractData(res);
        setResume(data);
      } catch (err) {
        console.warn('Could not load resume data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, [extractData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  // Fallback sample data if no resume uploaded or parsed yet
  const hasResume = resume && resume.status === 'PARSED';
  
  const reportData = hasResume ? {
    fileName: resume.originalFileName,
    matchScore: resume.matchScore || 78,
    skills: resume.extractedSkills || [],
    experience: resume.extractedExp || [],
    aiAnalysis: resume.aiAnalysis || 'A strong technical match for mid-level backend developer. Demonstrates solid competency in API design and database integrations.'
  } : {
    fileName: "Sample_Resume.pdf",
    matchScore: 85,
    skills: ["React", "Node.js", "Express", "TypeScript", "Prisma", "PostgreSQL", "Tailwind CSS", "REST APIs", "AWS"],
    experience: [
      { role: "Software Engineer", company: "DevStream Inc.", period: "2024 - Present", desc: "Built modern interactive dashboards using React and Express APIs, boosting performance by 30%." },
      { role: "Junior Full Stack Dev", company: "InnovateTech", period: "2022 - 2024", desc: "Designed backend microservices and implemented automated unit testing coverage." }
    ],
    aiAnalysis: "Aria AI suggests: You have exceptional JavaScript/TypeScript credentials with strong database backend integration records. Consider acquiring more familiarity with containerization (Docker, Kubernetes) and cloud service monitoring to lock down senior engineering roles."
  };

  const scoreColor = (score) => {
    if (score >= 85) return 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 70) return 'text-blue-500 border-blue-500/30 bg-blue-500/10';
    return 'text-amber-500 border-amber-500/30 bg-amber-500/10';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">AI Resume Analysis</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {hasResume ? `Detailed evaluation for ${reportData.fileName}` : "Review a sample parsing analysis. Upload your resume to inspect your score."}
          </p>
        </div>
        {hasResume ? (
          <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-2xl font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" /> Live parsed
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-400 px-4 py-2 rounded-2xl font-bold text-sm">
            <AlertTriangle className="w-4 h-4" /> Sample Data Mode
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Score & Profile Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm text-center flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />
            <h3 className="font-bold text-lg text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">AI Match Rating</h3>
            
            {/* Compatibility ring */}
            <div className={`w-36 h-36 rounded-full border-8 flex flex-col items-center justify-center ${scoreColor(reportData.matchScore)} transition-colors duration-500`}>
              <span className="text-4xl font-extrabold tracking-tight">{reportData.matchScore}%</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider mt-0.5">Compatible</span>
            </div>

            <p className="text-slate-500 dark:text-slate-400 mt-6 text-sm">
              Your resume exhibits strong correspondence with technical job listings across our system config vectors.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm">
            <h4 className="font-bold text-base mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-500" /> Extracted Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {reportData.skills.length > 0 ? (
                reportData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/40 dark:border-slate-700/40"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-400">No skills parsed yet</span>
              )}
            </div>
          </div>
        </div>

        {/* Timeline & Feedback */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm space-y-4">
            <h4 className="font-bold text-base flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500 animate-pulse" /> AI Screening Summary & Critique
            </h4>
            <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-slate-950/60 border border-amber-200/30 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {reportData.aiAnalysis}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm">
            <h4 className="font-bold text-base mb-6 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-500" /> Parsed Professional Timeline
            </h4>
            <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-800">
              {reportData.experience.length > 0 ? (
                reportData.experience.map((exp, idx) => (
                  <div key={idx} className="relative pl-8 flex flex-col md:flex-row md:items-start justify-between gap-2">
                    <div className="absolute left-[5px] top-[6px] w-[14px] h-[14px] rounded-full bg-blue-500 border-4 border-white dark:border-slate-900 shadow-sm" />
                    <div>
                      <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200">{exp.role}</h5>
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">{exp.company}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{exp.desc || exp.description}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded-md h-fit whitespace-nowrap self-start">
                      {exp.period || exp.duration}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-slate-400 dark:text-slate-500 text-sm text-center py-6">
                  No professional history parsed yet. Upload your CV to extract work history details.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
