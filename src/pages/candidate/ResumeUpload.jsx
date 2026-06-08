import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { ProgressBar } from '../../components/UI/Progress';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import resumeService from '../../services/resumeService';

export default function ResumeUpload() {
  const { extractData, addToast } = useApp();
  
  const [resume, setResume] = useState(null);
  const [parsingResume, setParsingResume] = useState(false);
  const [parsingProgress, setParsingProgress] = useState(0);
  const [parsingStep, setParsingStep] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const pollIntervalRef = useRef(null);

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const pollResumeStatus = () => {
    stopPolling();
    setParsingProgress(10);
    setParsingStep('Initializing Parser...');
    
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await resumeService.get();
        const data = extractData(res);
        
        if (data.status === 'PARSED') {
          stopPolling();
          setResume(data);
          setParsingResume(false);
          setParsingProgress(100);
          addToast('Resume parsed and compatibility calculated!', 'success');
        } else if (data.status === 'FAILED') {
          stopPolling();
          setParsingResume(false);
          addToast('Resume parsing failed. Please upload a structured PDF or Word document.', 'error');
        } else {
          // Still parsing
          setParsingProgress((prev) => Math.min(prev + 15, 90));
          setParsingStep('AI NLP Extraction in progress...');
        }
      } catch (err) {
        stopPolling();
        setParsingResume(false);
        console.error('Error polling resume status:', err);
      }
    }, 3000);
  };

  const fetchResume = async () => {
    try {
      setLoading(true);
      const res = await resumeService.get();
      const data = extractData(res);
      setResume(data);
      if (data.status === 'PARSING') {
        setParsingResume(true);
        pollResumeStatus();
      }
    } catch (err) {
      // 404 is normal when no resume is uploaded yet
      setResume(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResume();
    return () => stopPolling();
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        uploadFile(file);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        uploadFile(file);
      }
    }
  };

  const validateFile = (file) => {
    const validExtensions = ['.pdf', '.doc', '.docx'];
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(extension)) {
      alert('Invalid file format. Please upload a PDF, DOC, or DOCX document.');
      return false;
    }
    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds the 10MB limit.');
      return false;
    }
    return true;
  };

  const uploadFile = async (file) => {
    setParsingResume(true);
    setParsingProgress(5);
    setParsingStep('Uploading to storage server...');
    try {
      const res = await resumeService.upload(file);
      const data = extractData(res);
      setResume(data);
      pollResumeStatus();
    } catch (err) {
      setParsingResume(false);
      const msg = err.response?.data?.message || 'Failed to upload resume.';
      addToast(msg, 'error');
    }
  };

  const handleRemoveResume = async () => {
    if (!window.confirm('Are you sure you want to delete your resume?')) return;
    try {
      setLoading(true);
      await resumeService.remove();
      setResume(null);
      addToast('Resume deleted successfully.', 'info');
    } catch (err) {
      addToast('Failed to delete resume.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !parsingResume) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const matchScore = resume?.matchScore;
  const skills = resume?.extractedSkills || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-slate-800 dark:text-white">Resume Automated Screening</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Upload your professional CV to calculate position compatibility rankings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Box Card */}
        <Card className="p-6 lg:col-span-2 flex flex-col justify-center min-h-[300px]">
          {!parsingResume && !resume && (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-950/20' 
                  : 'border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />
              <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-500 mb-4 animate-bounce">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Drag & Drop Resume Here</h4>
              <p className="text-xs text-slate-400 mt-1">Accepts PDF, DOCX, or DOC formats (Max size: 10MB)</p>
              <Button variant="secondary" size="sm" className="mt-4 pointer-events-none">
                Browse Files
              </Button>
            </div>
          )}

          {/* Parsing State */}
          {parsingResume && (
            <div className="flex flex-col items-center text-center space-y-4 py-8">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              <div className="space-y-1.5 w-full max-w-sm">
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Processing Document</h4>
                <p className="text-xs text-slate-400">{parsingStep}</p>
                <div className="pt-2">
                  <ProgressBar value={parsingProgress} className="h-2" />
                </div>
              </div>
            </div>
          )}

          {/* Success State */}
          {!parsingResume && resume && (
            <div className="flex flex-col items-center text-center space-y-6 py-6">
              <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-500 shadow-md">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-base text-slate-800 dark:text-slate-200">{resume.originalFileName}</h4>
                <p className="text-xs text-slate-400">File size: {formatFileSize(resume.fileSize)}</p>
              </div>
              
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={handleRemoveResume}
                  variant="secondary" 
                  size="sm"
                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 dark:text-rose-400 border-none"
                >
                  Delete and Re-upload
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* NLP Parsing Results sidebar */}
        <Card className="p-6 space-y-5">
          <h4 className="font-bold text-base font-display text-slate-800 dark:text-slate-200">CV Evaluation Result</h4>

          {!parsingResume && resume && resume.status === 'PARSED' ? (
            <div className="space-y-5">
              <div className="flex flex-col items-center text-center p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Keywords Compatibility Rating</span>
                <div className="text-3xl font-extrabold font-display text-blue-600 dark:text-blue-400">
                  {matchScore !== null && matchScore !== undefined ? `${Math.round(matchScore)}%` : 'Calculating...'}
                </div>
                <div className="w-full mt-3">
                  <ProgressBar value={matchScore || 0} className="h-1.5 bg-blue-100 dark:bg-blue-950" />
                </div>
              </div>

              {skills.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Extracted Skillset</span>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((skill, idx) => (
                      <span key={idx} className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/30">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/30 rounded-xl text-xs text-blue-700 dark:text-blue-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Compatibility score is matches ready. AI assessment room is now unlocked!</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-12 text-slate-400 space-y-2">
              <FileText className="w-10 h-10 opacity-40 animate-pulse" />
              <p className="text-xs font-semibold">Upload your CV to render NLP keyword extraction results</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
