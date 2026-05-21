import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { ToastContainer } from './components/UI/Toast';
import Landing from './pages/Landing';
import CandidateDashboard from './pages/CandidateDashboard';
import InterviewInterface from './pages/InterviewInterface';
import HRDashboard from './pages/HRDashboard';
import FeedbackReport from './pages/FeedbackReport';

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.3, ease: 'easeInOut' }}
  >
    {children}
  </motion.div>
);

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#fafbfc]">
      <Navbar />
      <ToastContainer />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
          <Route path="/candidate/dashboard" element={<PageTransition><CandidateDashboard /></PageTransition>} />
          <Route path="/candidate/interview" element={<PageTransition><InterviewInterface /></PageTransition>} />
          <Route path="/admin/dashboard" element={<PageTransition><HRDashboard /></PageTransition>} />
          <Route path="/admin/report/:candidateId" element={<PageTransition><FeedbackReport /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;
