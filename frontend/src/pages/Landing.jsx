import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Cpu,
  Brain,
  Calendar,
  Sparkles,
  BarChart3,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Card, CardBody } from '../components/UI/Card';
import { Footer } from '../components/Footer';

export default function Landing() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  const features = [
    {
      icon: <FileText className="w-6 h-6 text-blue-600" />,
      title: 'Smart Resume Matching',
      desc: 'NLP parsers instantly extract candidate skill nodes, comparing experience profiles against target JDs in real time.'
    },
    {
      icon: <Cpu className="w-6 h-6 text-purple-600" />,
      title: 'Adaptive AI Interviews',
      desc: 'Our AI engine reformulates follow-up queries based on the depth of the candidate’s technical verbal replies.'
    },
    {
      icon: <Brain className="w-6 h-6 text-indigo-600" />,
      title: 'Emotion & Tone Analysis',
      desc: 'Sophisticated voice tone analysis registers poise, confidence, and articulation metrics under pressure.'
    },
    {
      icon: <Calendar className="w-6 h-6 text-sky-600" />,
      title: 'Automated Calendar Flow',
      desc: 'Eliminate email threads. Candidates auto-schedule interview room checkpoints mapped against HR calendar slots.'
    },
    {
      icon: <Sparkles className="w-6 h-6 text-violet-600" />,
      title: 'Standardized Scoring',
      desc: 'Calculates objective performance scores, reducing implicit biases to deliver raw potential insights.'
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-emerald-600" />,
      title: 'HR Pipeline Analytics',
      desc: 'Aggregates comprehensive candidate metrics, skill distributions, and team gaps in one central portal.'
    }
  ];

  const steps = [
    { title: 'Upload Resume', desc: 'Candidate uploads their PDF/DOCX resume file into our parser.' },
    { title: 'Resume Matching', desc: 'Semantic filters scan key concepts, matching applicant skills to target roles.' },
    { title: 'AI Interview Room', desc: 'Aria, the AI Interviewer, conducts a live adaptive video/audio interview.' },
    { title: 'Behavior Analysis', desc: 'Real-time tone & confidence monitors calculate behavioral stats.' },
    { title: 'Evaluation Engine', desc: 'System grades technical replies and parses key strengths.' },
    { title: 'Final HR Report', desc: 'HR receives a secure scorecard containing deep recommendations.' }
  ];

  const testimonials = [
    {
      quote: "SIA cut our screening time down by 75%. We can evaluate hundreds of applicants objectively before ever jumping on a live Zoom call.",
      name: "Marcus Aurelius",
      title: "VP of Recruiting, SkyNet Solutions",
      avatar: "M"
    },
    {
      quote: "The interface was incredibly smooth. I loved speaking with Aria, and the instant report feedback card showed me exactly where I stood.",
      name: "Elena Rostova",
      title: "Senior React Engineer",
      avatar: "E"
    },
    {
      quote: "Using SIA, we discovered a highly skilled engineer who didn't fit traditional resume searches but excelled in the adaptive technical interview.",
      name: "Arthur Dent",
      title: "Director of HR, DeepThought Ltd",
      avatar: "A"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/40 flex flex-col">
      {/* Decorative gradient blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-purple-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-20 lg:py-28 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 flex-1">
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen Enterprise Recruitment
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display leading-[1.1] tracking-tight text-slate-800"
          >
            AI-Powered <span className="gradient-text">Smart Interview</span> Agent
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-slate-500 max-w-xl mx-auto lg:mx-0 font-medium"
          >
            Automate and scale candidate pre-screening with adaptive NLP technical interviews, real-time emotion/confidence monitors, and standardized bias-free evaluations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
          >
            <Button
              variant="primary"
              size="lg"
              icon={<ArrowRight className="w-5 h-5" />}
              onClick={() => navigate('/candidate/dashboard')}
            >
              Get Started Demo
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/admin/dashboard')}
            >
              HR Admin Portal
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="pt-6 flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-3 text-xs text-slate-400 font-semibold"
          >
            <div className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> GDPR & EEOC Compliant</div>
            <div className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-blue-500" /> No Backend - Local Demo</div>
            <div className="flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-purple-500" /> Multi-Persona Flow</div>
          </motion.div>
        </div>

        {/* Hero Visual Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="flex-1 w-full max-w-lg lg:max-w-none relative animate-float"
        >
          <div className="relative rounded-2xl glass-panel-heavy p-5 shadow-2xl border border-slate-200/80 overflow-hidden">
            {/* Visual Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-400 rounded-full" />
                <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                <div className="w-3 h-3 bg-green-400 rounded-full" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aria Assessment Node</span>
            </div>

            {/* Virtual Interview Preview */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500 shrink-0 flex items-center justify-center font-bold text-white text-sm shadow-md">A</div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-800">Aria (AI Recruiter)</span>
                  <p className="text-xs text-slate-600 font-medium">"How do you resolve memory leaks in standard React useEffect listeners?"</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100/50 flex items-start gap-3 justify-end">
                <div className="space-y-1 text-right">
                  <span className="text-xs font-bold text-slate-800">Candidate reply</span>
                  <p className="text-xs text-blue-900 font-medium">"I return clean-up callback handlers inside the effect closures..."</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-500 shrink-0 flex items-center justify-center font-bold text-white text-sm shadow-md">C</div>
              </div>

              {/* Status bar */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-white border border-slate-100 rounded-xl flex flex-col items-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Confidence</span>
                  <span className="text-sm font-bold text-slate-800 mt-1 text-emerald-500">89%</span>
                </div>
                <div className="p-3 bg-white border border-slate-100 rounded-xl flex flex-col items-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tone Tone</span>
                  <span className="text-sm font-bold text-slate-800 mt-1 text-blue-500">Analytical</span>
                </div>
                <div className="p-3 bg-white border border-slate-100 rounded-xl flex flex-col items-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Match Index</span>
                  <span className="text-sm font-bold text-slate-800 mt-1 text-purple-500">88%</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="bg-white py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200/60 scroll-mt-10">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold font-display tracking-tight text-slate-800">
              Enterprise Grade AI Hiring Infrastructure
            </h2>
            <p className="text-base text-slate-500 font-medium leading-relaxed">
              Equip your recruiting pipeline with robust assessments, automated checklists, and emotional intelligence metrics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <Card className="h-full border border-slate-100" hoverEffect>
                  <CardBody className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm">
                      {feat.icon}
                    </div>
                    <h4 className="text-lg font-bold font-display text-slate-800">{feat.title}</h4>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">{feat.desc}</p>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Step-by-Step */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50/50 border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold font-display tracking-tight text-slate-800">
              How the System Automates Evaluation
            </h2>
            <p className="text-base text-slate-500 font-medium">
              Click through the horizontal pipeline timeline to follow the candidate's hiring progress journey.
            </p>
          </div>

          {/* Timeline Nodes */}
          <div className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 hidden lg:block" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 relative z-10">
              {steps.map((step, idx) => {
                const isActive = activeStep === idx;
                return (
                  <button
                    key={step.title}
                    onClick={() => setActiveStep(idx)}
                    className="flex flex-col items-center text-center focus:outline-none group"
                  >
                    <div
                      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        isActive
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20 scale-110'
                          : 'bg-white border-slate-200 text-slate-500 group-hover:border-slate-400 group-hover:text-slate-700'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span
                      className={`mt-3 text-sm font-bold ${
                        isActive ? 'text-blue-600' : 'text-slate-600 group-hover:text-slate-800'
                      }`}
                    >
                      {step.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Display active step detail card */}
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto"
          >
            <Card className="border border-slate-200/80 bg-white/90 text-center shadow-lg shadow-blue-500/5">
              <CardBody className="space-y-2">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                  Step {activeStep + 1} Detail node
                </span>
                <h4 className="text-lg font-bold font-display text-slate-800">
                  {steps[activeStep].title}
                </h4>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  {steps[activeStep].desc}
                </p>
              </CardBody>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold font-display tracking-tight text-slate-800">
              Trusted by Recruiting & Engineering Leaders
            </h2>
            <p className="text-base text-slate-500 font-medium">
              See how modern teams build objective, high-velocity screening pipelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((test) => (
              <Card key={test.name} className="flex flex-col justify-between border border-slate-100/90" hoverEffect>
                <CardBody className="space-y-4">
                  <p className="text-sm text-slate-500 italic font-medium leading-relaxed">
                    "{test.quote}"
                  </p>
                </CardBody>
                <div className="mt-6 flex items-center gap-3 pt-4 border-t border-slate-50">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
                    {test.avatar}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-800">{test.name}</h5>
                    <p className="text-xs text-slate-400 font-semibold">{test.title}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
