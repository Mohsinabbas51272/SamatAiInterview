import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateEvaluationSummary } from '../services/geminiService';

const AppContext = createContext();

// Pre-seeded mock candidates for the HR Admin view
const INITIAL_CANDIDATES = [
  {
    id: 'cand-1',
    name: 'Sarah Connor',
    email: 'sarah.c@skytech.io',
    role: 'Senior React Developer',
    resumeScore: 92,
    interviewScore: 89,
    confidenceScore: 85,
    status: 'Selected',
    date: '2026-05-19',
    matchPercentage: 92,
    nlpAnalysis: 'Demonstrates exceptional depth in React core concepts, hooks optimization, and micro-frontend architectures. Language patterns indicate strong ownership and solution-oriented mindset.',
    communicationScore: 90,
    emotionData: { joy: 75, analytical: 90, calm: 80, confident: 85 },
    strengths: ['Advanced architectural patterns', 'Webpack/Vite build tuning', 'Strong team leadership communication'],
    weaknesses: ['Minimal backend scaling experience', 'High tendency to deep-dive into micro-optimizations'],
    avatarSeed: 'sarah',
    answers: {
      0: "I am a frontend architect with over 6 years of experience building highly interactive SaaS dashboard tools. I specialize in state machines and performance tuning.",
      1: "For state management, I prefer Zustand for lightweight components, and custom hooks to decouple business logic from the rendering tier.",
      2: "I designed a virtualization engine that reduced catalog render times by 80% for 50,000 active records in a single grid viewport.",
      3: "Tailwind CSS is my default stack tool combined with fluid container grids. I enforce responsive breakpoints at both structural and widget levels.",
      4: "AI coding assistants accelerate scaffolding and typing configurations, but high-level structural integrity and security audits remain human developer domains."
    }
  },
  {
    id: 'cand-2',
    name: 'Alex Chen',
    email: 'alex.chen@innovate.dev',
    role: 'Frontend Engineer',
    resumeScore: 84,
    interviewScore: 78,
    confidenceScore: 72,
    status: 'Further Review',
    date: '2026-05-20',
    matchPercentage: 84,
    nlpAnalysis: 'Solid foundational skills in JavaScript and styling. Tends to answer concisely but occasionally lacks detailed project-level context. Performance overall is positive.',
    communicationScore: 75,
    emotionData: { joy: 65, analytical: 80, calm: 85, confident: 70 },
    strengths: ['Excellent styling visual design', 'Responsive implementation', 'Agile process enthusiast'],
    weaknesses: ['Shallow understanding of React fibers/reconcilers', 'Lacks system design scale exposure'],
    avatarSeed: 'alex',
    answers: {}
  },
  {
    id: 'cand-3',
    name: 'Emily Watson',
    email: 'emily.w@designforge.com',
    role: 'UX Developer',
    resumeScore: 78,
    interviewScore: 85,
    confidenceScore: 88,
    status: 'Selected',
    date: '2026-05-20',
    matchPercentage: 79,
    nlpAnalysis: 'Remarkable alignment with UX/UI design integration. High degree of user advocacy. Strongly detailed communication on design-to-development handoffs.',
    communicationScore: 94,
    emotionData: { joy: 85, analytical: 75, calm: 90, confident: 90 },
    strengths: ['Framer Motion specialist', 'Perfect alignment with Figma structures', 'High empathy and user focus'],
    weaknesses: ['Limited complex state/caching experience', 'Prefers CSS visual polish over complex state engineering'],
    avatarSeed: 'emily',
    answers: {}
  },
  {
    id: 'cand-4',
    name: 'Marcus Vance',
    email: 'marcus.v@cloudscale.net',
    role: 'Senior React Developer',
    resumeScore: 68,
    interviewScore: 55,
    confidenceScore: 60,
    status: 'Rejected',
    date: '2026-05-18',
    matchPercentage: 70,
    nlpAnalysis: 'Technical foundation lacks depth regarding core JS principles and modern React rendering optimizations. Visual inspection indicates distracted answers.',
    communicationScore: 58,
    emotionData: { joy: 40, analytical: 60, calm: 50, confident: 55 },
    strengths: ['Willingness to learn', 'Familiarity with basic tooling like NPM/Git'],
    weaknesses: ['Weak performance debugging skills', 'Poor communication structure under stress'],
    avatarSeed: 'marcus',
    answers: {}
  }
];

export const AppProvider = ({ children }) => {
  const [candidates, setCandidates] = useState(INITIAL_CANDIDATES);
  const [toasts, setToasts] = useState([]);
  
  // Candidate Resume Upload Flow
  const [uploadedResume, setUploadedResume] = useState(null);
  const [parsingResume, setParsingResume] = useState(false);
  const [parsingProgress, setParsingProgress] = useState(0);
  const [parsingStep, setParsingStep] = useState('');
  
  // Current user's interview flow state
  const [userInterviewActive, setUserInterviewActive] = useState(false);
  const [userInterviewFinished, setUserInterviewFinished] = useState(false);
  const [userName, setUserName] = useState('Guest Candidate');
  const [userEmail, setUserEmail] = useState('guest@example.com');
  const [userAnswers, setUserAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewTimer, setInterviewTimer] = useState(0);
  
  // Live Interview stats
  const [confidenceLevel, setConfidenceLevel] = useState(80);
  const [emotionSignals, setEmotionSignals] = useState({ joy: 70, analytical: 75, calm: 85, confident: 80 });

  // Add toast helper
  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Simulate resume uploading and parsing steps
  const uploadResume = (file) => {
    setParsingResume(true);
    setParsingProgress(5);
    setParsingStep('Uploading document to secure node...');
    
    const steps = [
      { progress: 25, label: 'Reading PDF/DOCX byte stream...' },
      { progress: 50, label: 'Extracting semantic nodes via NLP parser...' },
      { progress: 75, label: 'Matching skillset keywords with Senior Role demands...' },
      { progress: 95, label: 'Calculating scoring indexes and analytics...' },
      { progress: 100, label: 'Resume Parsed Successfully!' }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setParsingProgress(steps[currentStep].progress);
        setParsingStep(steps[currentStep].label);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          const matchScore = Math.floor(Math.random() * 15) + 80; // random score between 80 and 95
          setUploadedResume({
            name: file.name,
            size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
            matchScore,
            skills: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'State Management', 'REST APIs', 'CI/CD']
          });
          setParsingResume(false);
          addToast('Resume processed and analyzed successfully!', 'success');
        }, 800);
      }
    }, 1000);
  };

  // Interview Questions Setup
  const INTERVIEW_QUESTIONS = [
    "Could you start by introducing yourself and telling us about your experience building complex React web applications?",
    "How do you approach state management and performance optimization in modern React codebases?",
    "Can you describe a challenging technical problem you solved recently and the impact of your solution?",
    "How do you ensure responsiveness and visual consistency across different devices when styling apps?",
    "Where do you see the role of AI tools evolving in a frontend developer's daily workflow?"
  ];

  // Fluctuating confidence/emotion mock logic during the interview
  useEffect(() => {
    let interval;
    if (userInterviewActive) {
      interval = setInterval(() => {
        // Random slight fluctuation
        setConfidenceLevel((prev) => {
          const delta = Math.floor(Math.random() * 11) - 5; // -5 to +5
          return Math.max(50, Math.min(100, prev + delta));
        });
        setEmotionSignals((prev) => {
          const shift = () => Math.floor(Math.random() * 9) - 4; // -4 to +4
          return {
            joy: Math.max(40, Math.min(100, prev.joy + shift())),
            analytical: Math.max(40, Math.min(100, prev.analytical + shift())),
            calm: Math.max(40, Math.min(100, prev.calm + shift())),
            confident: Math.max(40, Math.min(100, prev.confident + shift()))
          };
        });
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [userInterviewActive]);

  // Interview Timer
  useEffect(() => {
    let timerInterval;
    if (userInterviewActive) {
      timerInterval = setInterval(() => {
        setInterviewTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  }, [userInterviewActive]);

  // Complete User Interview
  const finishInterview = async (questions) => {
    setUserInterviewActive(false);
    setUserInterviewFinished(true);

    // Calculate final scores
    const finalResumeScore = uploadedResume ? uploadedResume.matchScore : 82;
    const finalInterviewScore = Math.floor(Math.random() * 12) + 82; // 82 - 94
    const finalConfidence = Math.floor(Math.random() * 10) + 80;

    // Defaults (used if Gemini fails)
    let nlpAnalysis = 'Strong analytical mindset showing fluid syntax expression. Answers structure is highly relevant to advanced design principles, indicating regular handson experience with Tailwind CSS, custom Hooks, and performance audits.';
    let communicationScore = 88;
    let strengths = ['Highly responsive structures', 'Clean separation of design tokens', 'Agile adaptability'];
    let weaknesses = ['Slightly rapid answers structure during high stress index nodes'];

    // Try Gemini AI evaluation
    if (questions && Object.keys(userAnswers).length > 0) {
      try {
        const questionsAndAnswers = Object.entries(userAnswers).map(([idx, answer]) => ({
          q: questions[parseInt(idx)] || `Question ${parseInt(idx) + 1}`,
          a: answer
        }));

        const aiResult = await generateEvaluationSummary(userName, questionsAndAnswers);
        if (aiResult) {
          nlpAnalysis = aiResult.nlpAnalysis || nlpAnalysis;
          communicationScore = aiResult.communicationScore || communicationScore;
          strengths = aiResult.strengths || strengths;
          weaknesses = aiResult.weaknesses || weaknesses;
          addToast('Gemini AI evaluation generated successfully!', 'success');
        }
      } catch (err) {
        console.warn('Gemini evaluation fallback:', err);
      }
    }

    // Create a new candidate record to inject into HR Admin Database
    const newCandidate = {
      id: 'cand-user',
      name: userName,
      email: userEmail,
      role: 'Senior React Developer (Applied)',
      resumeScore: finalResumeScore,
      interviewScore: finalInterviewScore,
      confidenceScore: finalConfidence,
      status: finalInterviewScore >= 87 ? 'Selected' : 'Further Review',
      date: new Date().toISOString().split('T')[0],
      matchPercentage: finalResumeScore,
      nlpAnalysis,
      communicationScore,
      emotionData: { ...emotionSignals },
      strengths,
      weaknesses,
      avatarSeed: 'user',
      answers: { ...userAnswers }
    };

    setCandidates((prev) => {
      // Remove previous entry of user if they retake
      const filtered = prev.filter((c) => c.id !== 'cand-user');
      return [newCandidate, ...filtered];
    });

    addToast('AI evaluation scoring completed! Access your Feedback scorecard.', 'success');
  };

  const resetInterview = () => {
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setUserInterviewActive(false);
    setUserInterviewFinished(false);
    setInterviewTimer(0);
    setConfidenceLevel(80);
  };

  return (
    <AppContext.Provider
      value={{
        candidates,
        setCandidates,
        toasts,
        addToast,
        uploadedResume,
        setUploadedResume,
        parsingResume,
        parsingProgress,
        parsingStep,
        uploadResume,
        userInterviewActive,
        setUserInterviewActive,
        userInterviewFinished,
        setUserInterviewFinished,
        userName,
        setUserName,
        userEmail,
        setUserEmail,
        userAnswers,
        setUserAnswers,
        currentQuestionIndex,
        setCurrentQuestionIndex,
        interviewTimer,
        finishInterview,
        resetInterview,
        INTERVIEW_QUESTIONS,
        confidenceLevel,
        emotionSignals
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
