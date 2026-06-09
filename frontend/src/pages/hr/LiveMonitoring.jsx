import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import interviewService from '../../services/interviewService';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { ProgressBar } from '../../components/UI/Progress';
import { Activity, Tv, User, Brain, TrendingUp, AlertCircle, Bot, Volume2, ShieldAlert } from 'lucide-react';

export default function LiveMonitoring() {
  const { extractData, addToast } = useApp();
  const [loading, setLoading] = useState(true);
  const [activeSessions, setActiveSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);

  // Live simulation states
  const [liveTranscript, setLiveTranscript] = useState([]);
  const [confidence, setConfidence] = useState(85);
  const [pace, setPace] = useState(120); // words per min
  const [sentiment, setSentiment] = useState('Neutral');
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    const fetchActive = async () => {
      try {
        const res = await interviewService.getAll();
        const data = extractData(res) || [];
        // Show in-progress or scheduled ones as active monitoring targets
        const active = data.filter((i) => i.status === 'IN_PROGRESS' || i.status === 'SCHEDULED');
        setActiveSessions(active);
        if (active.length > 0) {
          setSelectedSession(active[0]);
        }
      } catch (err) {
        console.warn('Failed to load active interviews:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchActive();
  }, [extractData]);

  // Telemetry fluctuation simulator
  useEffect(() => {
    if (!selectedSession || !isSimulating) return;

    const interval = setInterval(() => {
      setConfidence((prev) => {
        const diff = Math.floor(Math.random() * 7) - 3;
        return Math.max(70, Math.min(98, prev + diff));
      });
      setPace((prev) => {
        const diff = Math.floor(Math.random() * 15) - 7;
        return Math.max(105, Math.min(140, prev + diff));
      });
      const sentiments = ['Positive', 'Analytical', 'Confident', 'Thoughtful'];
      setSentiment(sentiments[Math.floor(Math.random() * sentiments.length)]);
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedSession, isSimulating]);

  const handleStartSimulation = () => {
    if (!selectedSession) return;
    setIsSimulating(true);
    setLiveTranscript(["[System]: Stream connected successfully.", "[Interviewer Aria]: Welcome. Let's start with basic routing. How does React Router structure URL patterns?"]);
    
    // Seed candidate speech dynamically
    setTimeout(() => {
      setLiveTranscript((prev) => [...prev, "[Candidate]: React Router parses patterns declaratively using matching tokens like path parameters, routing them down to corresponding page components."]);
    }, 3000);

    setTimeout(() => {
      setLiveTranscript((prev) => [...prev, "[Interviewer Aria]: Correct. How do you handle deep nested routes?"]);
    }, 7000);

    setTimeout(() => {
      setLiveTranscript((prev) => [...prev, "[Candidate]: We implement nested elements using the Outlet token. This mounts children layouts seamlessly."]);
    }, 10000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Live Interview Monitoring</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Monitor technical tests in real-time, reviewing stress telemetry, speech pace, and AI transcription vectors.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Side: Sessions Directory list */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-4 space-y-4">
            <h4 className="font-bold text-sm text-slate-450 uppercase tracking-widest flex items-center gap-2">
              <Tv className="w-4 h-4 text-blue-500" /> Active Assessments
            </h4>
            
            <div className="space-y-2">
              {activeSessions.length === 0 ? (
                <div className="text-center py-12 text-sm text-slate-400">
                  No interviews currently running.
                </div>
              ) : (
                activeSessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => {
                      setSelectedSession(session);
                      setIsSimulating(false);
                      setLiveTranscript([]);
                    }}
                    className={`p-3.5 rounded-2xl text-left border cursor-pointer transition-all ${
                      selectedSession?.id === session.id
                        ? 'border-blue-500 bg-blue-500/5 text-blue-600 dark:text-blue-400'
                        : 'border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-sm truncate">{session.candidate?.profile?.firstName || 'Candidate'}</h5>
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{session.job?.title}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right Side: Telemetry dashboard */}
        <div className="lg:col-span-8 space-y-6">
          {selectedSession ? (
            <div className="space-y-6">
              
              {/* Webcam / Waveform area */}
              <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-950 border border-slate-900 shadow-md flex items-center justify-center">
                <div className="absolute inset-0 bg-radial-scanner opacity-40 pointer-events-none" />
                
                {isSimulating ? (
                  <div className="flex flex-col items-center justify-center text-center space-y-4 p-6">
                    <div className="w-20 h-20 rounded-full bg-blue-500/10 border-2 border-blue-500/40 flex items-center justify-center animate-pulse">
                      <Tv className="w-8 h-8 text-blue-500 animate-pulse-glow" />
                    </div>
                    <span className="text-xs font-bold text-slate-350 tracking-wide uppercase flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" /> Live Video feed streaming
                    </span>
                  </div>
                ) : (
                  <div className="text-center space-y-4 p-6">
                    <Tv className="w-12 h-12 text-slate-650 mx-auto" />
                    <div>
                      <h5 className="font-bold text-sm text-slate-200">Terminal Ready</h5>
                      <p className="text-xs text-slate-500 mt-1">Press connect to link to candidate's device feed.</p>
                    </div>
                    <Button onClick={handleStartSimulation} variant="primary">Connect Live Feed</Button>
                  </div>
                )}

                <div className="absolute top-4 left-4 z-10 px-2 py-0.5 rounded bg-slate-950/70 border border-slate-800 text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Activity className="w-3 h-3 text-blue-500" /> SECURE STREAM
                </div>
              </div>

              {/* Speech transcript scroll */}
              <Card className="p-6 space-y-4">
                <h4 className="font-bold text-sm text-slate-450 uppercase tracking-widest border-b border-slate-100 dark:border-slate-850 pb-2">
                  Live speech-to-text transcript
                </h4>
                <div className="h-44 overflow-y-auto space-y-3 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/45 dark:border-slate-850 rounded-2xl font-mono text-xs text-slate-700 dark:text-slate-300">
                  {liveTranscript.length === 0 ? (
                    <span className="text-slate-400">Stream idle. Transcript populated on connect.</span>
                  ) : (
                    liveTranscript.map((t, idx) => (
                      <div key={idx} className="leading-relaxed">
                        {t}
                      </div>
                    ))
                  )}
                </div>
              </Card>

              {/* Fluctuating metrics */}
              <Card className="p-6">
                <h4 className="font-bold text-sm text-slate-450 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-500 animate-pulse" /> Live Telemetry Analytics
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Confidence */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-500 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Stress score</span>
                      <span>{100 - confidence}%</span>
                    </div>
                    <ProgressBar value={100 - confidence} height="h-2" color="bg-rose-500" />
                  </div>

                  {/* Speech pace */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-500 flex items-center gap-1"><Volume2 className="w-3.5 h-3.5 text-blue-500" /> Pace (WPM)</span>
                      <span>{pace} words/m</span>
                    </div>
                    <ProgressBar value={(pace / 180) * 100} height="h-2" color="bg-blue-500" />
                  </div>

                  {/* Sentiment */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-850 rounded-2xl flex flex-col justify-center items-center text-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Dynamic Sentiment</span>
                    <span className="text-sm font-extrabold text-indigo-500 mt-1 uppercase">{isSimulating ? sentiment : 'N/A'}</span>
                  </div>
                </div>
              </Card>

            </div>
          ) : (
            <div className="max-w-md mx-auto text-center py-16 space-y-4">
              <Tv className="w-12 h-12 text-slate-350 mx-auto" />
              <h4 className="font-bold text-base">Select active session</h4>
              <p className="text-sm text-slate-500">Pick a running practice assessment from the side ledger to start live telemetry simulation.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
