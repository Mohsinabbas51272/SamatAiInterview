import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Video as VideoIcon,
  Cpu,
  Brain,
  TrendingUp,
  Smile,
  AlertTriangle,
  ChevronRight,
  LogOut,
  Sparkles,
  Bot
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card, CardBody } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { ProgressBar } from '../components/UI/Progress';
import { evaluateAnswer } from '../services/groqService';

export default function InterviewInterface() {
  const navigate = useNavigate();
  const {
    INTERVIEW_QUESTIONS,
    userAnswers,
    setUserAnswers,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    interviewTimer,
    finishInterview,
    confidenceLevel,
    emotionSignals,
    setUserInterviewActive,
    addToast
  } = useApp();

  const [localAnswer, setLocalAnswer] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [webcamActive, setWebcamActive] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [aiFollowUp, setAiFollowUp] = useState(null);
  
  const videoRef = useRef(null);

  // Set interview active on load
  useEffect(() => {
    setUserInterviewActive(true);
    return () => {
      setUserInterviewActive(false);
    };
  }, [setUserInterviewActive]);

  // Handle Webcam Permission and Stream
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then((stream) => {
        setCameraStream(stream);
        setWebcamActive(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.warn("Camera request denied or unavailable, using fallback interface.", err);
        setWebcamActive(false);
      });

    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Format Elapsed Time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNext = async () => {
    if (!localAnswer.trim() && !voiceActive) {
      addToast('Please input an answer before continuing.', 'error');
      return;
    }

    // Save response
    const finalAnswer = localAnswer.trim() || "(Answered via voice input simulation)";
    const currentQuestion = INTERVIEW_QUESTIONS[currentQuestionIndex];
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: finalAnswer
    }));

    setLocalAnswer('');
    setVoiceActive(false);
    
    // Check if last question
    if (currentQuestionIndex < INTERVIEW_QUESTIONS.length - 1) {
      setIsTyping(true);
      setAiFollowUp(null);

      // Call Gemini for a live AI follow-up
      const followUp = await evaluateAnswer(currentQuestion, finalAnswer);
      
      if (followUp) {
        setIsTyping(false);
        setAiFollowUp(followUp);
        // Show follow-up for 3 seconds, then move to next question
        setTimeout(() => {
          setAiFollowUp(null);
          setIsTyping(true);
          setTimeout(() => {
            setCurrentQuestionIndex((prev) => prev + 1);
            setIsTyping(false);
          }, 800);
        }, 3000);
      } else {
        // Fallback if Gemini call fails
        setTimeout(() => {
          setCurrentQuestionIndex((prev) => prev + 1);
          setIsTyping(false);
        }, 1500);
      }
    } else {
      setIsTyping(true);
      addToast('Compiling AI evaluation with Gemini...', 'info');
      await finishInterview(INTERVIEW_QUESTIONS);
      navigate('/admin/report/cand-user');
    }
  };

  const toggleVoice = () => {
    if (!voiceActive) {
      setVoiceActive(true);
      addToast('Simulating live speech-to-text. Try typing or speaking...', 'info');
      
      // Seed a sample answer if candidate stays quiet
      setTimeout(() => {
        setLocalAnswer("I believe that building robust visual consistency requires structuring global CSS custom properties, coupled with local Tailwind configuration themes. This ensures that typography and responsive grids scale harmoniously across mobile, desktop, and tablet layouts.");
      }, 2500);
    } else {
      setVoiceActive(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/40 p-4 sm:p-6 md:p-8 flex flex-col justify-between">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200/50 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Cpu className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 font-display">Aria Interview Session</h3>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Role: Senior Frontend Architect</p>
          </div>
        </div>

        {/* Status Widgets */}
        <div className="flex items-center gap-4">
          <div className="px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100/50 text-blue-700 text-xs font-bold font-display flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            Live Time: {formatTime(interviewTimer)}
          </div>
          <Button
            variant="danger"
            size="sm"
            icon={<LogOut className="w-4 h-4" />}
            onClick={() => {
              if (window.confirm("Are you sure you want to end this interview prematurely? Session results won't be saved.")) {
                navigate('/candidate/dashboard');
              }
            }}
          >
            End Interview
          </Button>
        </div>
      </div>

      {/* Main Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-stretch">
        
        {/* Left Side: AI Interviewer */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <Card className="flex-1 flex flex-col justify-between border border-slate-200/80 bg-white/95 shadow-md">
            <div className="space-y-6">
              {/* Question Progress bar */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  <span>Questions Progress</span>
                  <span>{currentQuestionIndex + 1} of {INTERVIEW_QUESTIONS.length}</span>
                </div>
                <ProgressBar
                  value={((currentQuestionIndex + 1) / INTERVIEW_QUESTIONS.length) * 100}
                  height="h-1.5"
                  color="bg-gradient-to-r from-blue-500 to-indigo-600"
                />
              </div>

              {/* Coach Avatar bubble */}
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/10 border-2 border-white animate-pulse-glow">
                    <Bot className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full border-2 border-white flex items-center justify-center">
                    <Sparkles className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>

                <div className="space-y-1.5 flex-1">
                  <h4 className="text-sm font-bold text-slate-800">Aria (Technical Recruiter)</h4>
                  <div className="p-4 rounded-2xl rounded-tl-none bg-slate-50 border border-slate-100 text-slate-700 text-sm font-medium leading-relaxed shadow-sm">
                    {isTyping ? (
                      <div className="flex items-center gap-1 py-1">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce animation-delay-200" />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce animation-delay-500" />
                      </div>
                    ) : aiFollowUp ? (
                      <div className="space-y-1">
                        <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">AI Follow-up</span>
                        <p className="text-indigo-700">{aiFollowUp}</p>
                      </div>
                    ) : (
                      INTERVIEW_QUESTIONS[currentQuestionIndex]
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Answer Feed / Speech waveform visualizer */}
            {voiceActive && (
              <div className="mt-8 p-4 rounded-xl bg-indigo-50/50 border border-indigo-100/50 flex flex-col items-center justify-center space-y-3">
                <div className="flex items-center gap-1.5 h-8">
                  <span className="w-1 bg-indigo-500 h-3 rounded-full animate-wave" />
                  <span className="w-1 bg-indigo-500 h-6 rounded-full animate-wave animation-delay-200" />
                  <span className="w-1 bg-indigo-500 h-4 rounded-full animate-wave animation-delay-500" />
                  <span className="w-1 bg-indigo-500 h-7 rounded-full animate-wave animation-delay-200" />
                  <span className="w-1 bg-indigo-500 h-2 rounded-full animate-wave" />
                </div>
                <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">Listening... speak clearly</span>
              </div>
            )}
          </Card>
        </div>

        {/* Right Side: Webcam and telemetry metadata */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          {/* Webcam Container */}
          <div className="relative aspect-video lg:aspect-auto lg:h-64 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-lg flex items-center justify-center group">
            {webcamActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
            ) : (
              <div className="text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 mx-auto animate-pulse">
                  <VideoOff className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-300">Webcam Inactive</span>
                  <p className="text-[10px] text-slate-500 font-semibold max-w-[200px] mx-auto">Using generic face telemetry mapping algorithms.</p>
                </div>
              </div>
            )}

            {/* Glowing Scan Overlay lines */}
            <div className="absolute inset-0 pointer-events-none border border-blue-500/20 rounded-2xl" />
            <div className="absolute top-4 left-4 z-10 px-2 py-0.5 rounded bg-slate-950/70 backdrop-blur-sm border border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> Face Matrix Map
            </div>
          </div>

          {/* Telemetry Metrics */}
          <Card className="flex-1 border border-slate-200/80 bg-white/95 shadow-md">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-4">
              <Brain className="w-4 h-4 text-purple-500" /> Bio-Metric Analytics
            </h4>
            <div className="space-y-4">
              {/* Confidence Telemetry */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-500 uppercase tracking-wider flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Confidence Metric</span>
                  <span className="text-slate-800">{confidenceLevel}%</span>
                </div>
                <ProgressBar value={confidenceLevel} height="h-2" color="bg-emerald-500" />
              </div>

              {/* Emotion telemetry breakdown */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Micro-Emotion Index</span>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500">
                      <span>CONFIDENT</span>
                      <span>{emotionSignals.confident}%</span>
                    </div>
                    <ProgressBar value={emotionSignals.confident} height="h-1.5" color="bg-indigo-500" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500">
                      <span>ANALYTICAL</span>
                      <span>{emotionSignals.analytical}%</span>
                    </div>
                    <ProgressBar value={emotionSignals.analytical} height="h-1.5" color="bg-purple-500" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500">
                      <span>CALM</span>
                      <span>{emotionSignals.calm}%</span>
                    </div>
                    <ProgressBar value={emotionSignals.calm} height="h-1.5" color="bg-blue-500" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500">
                      <span>JOY</span>
                      <span>{emotionSignals.joy}%</span>
                    </div>
                    <ProgressBar value={emotionSignals.joy} height="h-1.5" color="bg-emerald-500" />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="mt-6 border-t border-slate-200/50 pt-6 space-y-4">
        <div className="relative">
          <textarea
            value={localAnswer}
            onChange={(e) => setLocalAnswer(e.target.value)}
            disabled={isTyping}
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-slate-700 bg-white min-h-[100px] resize-none pr-12 shadow-sm font-medium"
            placeholder="Type your response here or click the mic button to speak..."
          />
          <button
            onClick={toggleVoice}
            disabled={isTyping}
            className={`absolute right-4 bottom-4 p-2.5 rounded-xl border transition-all shadow-sm ${
              voiceActive
                ? 'bg-rose-500 border-rose-500 text-white animate-pulse'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500'
            }`}
          >
            {voiceActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex justify-end items-center gap-4">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider hidden sm:block">Press Next to commit and transition</span>
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={isTyping}
            icon={<ChevronRight className="w-4 h-4" />}
          >
            {currentQuestionIndex === INTERVIEW_QUESTIONS.length - 1 ? 'Submit Interview' : 'Next Question'}
          </Button>
        </div>
      </div>
    </div>
  );
}
