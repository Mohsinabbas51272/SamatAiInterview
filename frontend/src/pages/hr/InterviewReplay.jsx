import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import interviewService from '../../services/interviewService';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { ProgressBar } from '../../components/UI/Progress';
import { Play, Pause, RotateCcw, Volume2, SkipForward, Cpu, Brain, Activity, MessageSquare, ChevronLeft, Loader2, Disc } from 'lucide-react';

export default function InterviewReplay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { extractData, addToast } = useApp();

  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState([]);
  const [selectedInterviewId, setSelectedInterviewId] = useState(id || '');
  const [interview, setInterview] = useState(null);

  // Player state simulation
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  
  // Loaded timeline details
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const loadList = async () => {
      try {
        const res = await interviewService.getAll();
        const data = extractData(res) || [];
        const completed = data.filter((i) => i.status === 'COMPLETED');
        setInterviews(completed);
        
        if (!id && completed.length > 0) {
          setSelectedInterviewId(completed[0].id);
        }
      } catch (err) {
        console.warn('Failed to load completed interviews list for replay:', err);
      } finally {
        setLoading(false);
      }
    };
    loadList();
  }, [id, extractData]);

  useEffect(() => {
    if (!selectedInterviewId) return;
    const loadInterviewDetails = async () => {
      try {
        setLoadingDetails(true);
        const res = await interviewService.getById(selectedInterviewId);
        const data = extractData(res);
        setInterview(data);
        setSelectedQuestionIndex(0);
        setCurrentTime(0);
        setIsPlaying(false);
      } catch (err) {
        console.error('Failed to load replay details:', err);
        addToast('Failed to load interview replay data.', 'error');
      } finally {
        setLoadingDetails(false);
      }
    };
    loadInterviewDetails();
  }, [selectedInterviewId, extractData]);

  // Simulated player playback progress
  useEffect(() => {
    if (!isPlaying || !interview?.answers || interview.answers.length === 0) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const maxTime = interview.answers.length * 30; // 30s per answer simulation
        if (prev >= maxTime) {
          setIsPlaying(false);
          return 0;
        }
        
        // Sync question index depending on time
        const newIdx = Math.floor((prev + 1) / 30);
        if (newIdx !== selectedQuestionIndex && newIdx < interview.answers.length) {
          setSelectedQuestionIndex(newIdx);
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, interview, selectedQuestionIndex]);

  const handleSeek = (index) => {
    setSelectedQuestionIndex(index);
    setCurrentTime(index * 30);
    setIsPlaying(true);
    addToast(`Seeking to Question ${index + 1}...`, 'info');
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setSelectedQuestionIndex(0);
  };

  if (loading && interviews.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  const answers = interview?.answers || [];
  const currentAnswer = answers[selectedQuestionIndex];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Interview Replay Booth</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Review detailed question timelines, replay candidate speech segments, and audit facial stress diagnostics.
          </p>
        </div>

        {/* Directory selector dropdown if not locked to single ID */}
        {!id && interviews.length > 0 && (
          <select
            value={selectedInterviewId}
            onChange={(e) => setSelectedInterviewId(e.target.value)}
            className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/10 text-slate-750 dark:text-white"
          >
            {interviews.map((session) => (
              <option key={session.id} value={session.id}>
                {session.candidate?.profile
                  ? `${session.candidate.profile.firstName} ${session.candidate.profile.lastName}`
                  : session.candidate?.email || 'Candidate'}{' '}
                — {session.job?.title}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Side: Mock media player and play settings */}
        <div className="lg:col-span-7 space-y-6">
          {loadingDetails ? (
            <div className="flex items-center justify-center min-h-[350px]">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : interview ? (
            <Card className="p-6 space-y-6 flex flex-col justify-between h-full">
              
              {/* Media viewport mock */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-850 flex items-center justify-center">
                {isPlaying ? (
                  <div className="absolute inset-0 bg-radial-scanner opacity-25 pointer-events-none" />
                ) : null}
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-blue-500/10 border-2 border-blue-500/40 flex items-center justify-center text-blue-500 relative">
                    <Disc className={`w-8 h-8 ${isPlaying ? 'animate-spin' : ''}`} />
                  </div>
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                    {isPlaying ? 'Replaying Audio / Video simulation' : 'Playback paused'}
                  </span>
                </div>

                <div className="absolute top-4 left-4 z-10 px-2 py-0.5 rounded bg-slate-950/70 border border-slate-800 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  Assessment Replay Booth
                </div>

                {/* Progress timestamps */}
                <div className="absolute bottom-4 right-4 text-[10px] font-mono text-slate-450 bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800">
                  {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')} / {Math.floor((answers.length * 30) / 60)}:{((answers.length * 30) % 60).toString().padStart(2, '0')}
                </div>
              </div>

              {/* Player Controls */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-850">
                <div className="flex justify-between items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Button onClick={togglePlayback} variant={isPlaying ? 'secondary' : 'primary'} size="sm">
                      {isPlaying ? <Pause className="w-4 h-4 mr-1.5" /> : <Play className="w-4 h-4 mr-1.5" />}
                      {isPlaying ? 'Pause' : 'Play'}
                    </Button>
                    <Button onClick={handleReset} variant="secondary" size="sm">
                      <RotateCcw className="w-4 h-4 mr-1.5" /> Reset
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs">
                    <Volume2 className="w-4 h-4" /> <span>Normal Output</span>
                  </div>
                </div>

                {/* Simulated Timeline clicks bar */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Question Sync Timeline</span>
                  <div className="grid grid-cols-5 gap-2">
                    {answers.map((ans, idx) => (
                      <button
                        key={ans.id}
                        onClick={() => handleSeek(idx)}
                        className={`py-2 px-1 rounded-xl border text-center text-xs font-bold transition-all truncate ${
                          selectedQuestionIndex === idx
                            ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        Q{idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </Card>
          ) : (
            <div className="max-w-md mx-auto text-center py-20">
              <Play className="w-12 h-12 text-slate-350 mx-auto" />
              <h4 className="font-bold text-base mt-4">No Session Loaded</h4>
            </div>
          )}
        </div>

        {/* Right Side: Speech Logs & Emotion Stress parameters */}
        <div className="lg:col-span-5 space-y-6">
          {interview && currentAnswer ? (
            <>
              {/* Question & Answer Transcript */}
              <Card className="p-6 space-y-4">
                <h4 className="font-bold text-sm text-slate-450 uppercase tracking-widest border-b border-slate-100 dark:border-slate-850 pb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-500" /> Response Transcript
                </h4>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider block">Question Asked:</span>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed">{currentAnswer.question?.text}</p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-850">
                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider block">Candidate Answer:</span>
                    <p className="text-xs text-slate-600 dark:text-slate-400 italic leading-relaxed">&ldquo;{currentAnswer.answerText}&rdquo;</p>
                  </div>

                  {currentAnswer.aiFeedback && (
                    <div className="p-3.5 rounded-2xl bg-indigo-50/20 dark:bg-slate-900/40 border border-slate-200/20 text-xs text-indigo-650 dark:text-indigo-400 leading-relaxed">
                      <span className="font-extrabold uppercase tracking-wider block mb-1">AI Critique:</span>
                      {currentAnswer.aiFeedback}
                    </div>
                  )}
                </div>
              </Card>

              {/* Stress telemetry graphs during speech */}
              <Card className="p-6">
                <h4 className="font-bold text-sm text-slate-450 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-500" /> Emotional Telemetry Graph
                </h4>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-450 uppercase tracking-wider">Confidence scale</span>
                      <span>{currentAnswer.score || 75}%</span>
                    </div>
                    <ProgressBar value={currentAnswer.score || 75} height="h-2" color="bg-emerald-500" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-450 uppercase tracking-wider">Linguistic pace</span>
                      <span>Steady (115 WPM)</span>
                    </div>
                    <ProgressBar value={65} height="h-2" color="bg-blue-500" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-450 uppercase tracking-wider">Linguistic pitch variance</span>
                      <span>Calm (88%)</span>
                    </div>
                    <ProgressBar value={88} height="h-2" color="bg-indigo-500" />
                  </div>
                </div>
              </Card>
            </>
          ) : null}
        </div>

      </div>
    </div>
  );
}
