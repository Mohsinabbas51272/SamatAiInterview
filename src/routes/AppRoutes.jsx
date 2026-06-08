import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Public pages
import Landing from '../pages/Landing';
import FeedbackReport from '../pages/FeedbackReport';

// Auth pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';

// Candidate pages
import CandidateOverview from '../pages/candidate/DashboardOverview';
import ProfileManagement from '../pages/candidate/ProfileManagement';
import ResumeUpload from '../pages/candidate/ResumeUpload';
import ResumeReport from '../pages/candidate/ResumeReport';
import AppliedJobs from '../pages/candidate/AppliedJobs';
import InterviewSchedule from '../pages/candidate/InterviewSchedule';
import MockSetup from '../pages/candidate/MockSetup';
import InterviewRoom from '../pages/candidate/InterviewRoom';
import InterviewHistory from '../pages/candidate/InterviewHistory';
import ResultsFeedback from '../pages/candidate/ResultsFeedback';
import Settings from '../pages/candidate/Settings';

// HR pages
import HROverview from '../pages/hr/DashboardOverview';
import JobManagement from '../pages/hr/JobManagement';
import CandidateManagement from '../pages/hr/CandidateManagement';
import CandidateDetails from '../pages/hr/CandidateDetails';
import HiringPipeline from '../pages/hr/HiringPipeline';
import ResumeScreening from '../pages/hr/ResumeScreening';
import CandidateRanking from '../pages/hr/CandidateRanking';
import CompareCandidates from '../pages/hr/CompareCandidates';
import LiveMonitoring from '../pages/hr/LiveMonitoring';
import FeedbackManagement from '../pages/hr/FeedbackManagement';
import InterviewReplay from '../pages/hr/InterviewReplay';
import HRAnalytics from '../pages/hr/HRAnalytics';

// Admin pages
import UserManagement from '../pages/admin/UserManagement';
import HRManagement from '../pages/admin/HRManagement';
import AIConfiguration from '../pages/admin/AIConfiguration';
import PromptManagement from '../pages/admin/PromptManagement';
import QuestionBankManagement from '../pages/admin/QuestionBankManagement';
import AuditLogs from '../pages/admin/AuditLogs';
import SystemAnalytics from '../pages/admin/SystemAnalytics';

// Tools
import VideoDownloader from '../pages/tools/VideoDownloader';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/admin/report/:candidateId" element={<FeedbackReport />} />
      </Route>

      {/* Auth Pages */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Candidate Dashboard */}
      <Route element={<DashboardLayout />}>
        <Route path="/candidate" element={<CandidateOverview />} />
        <Route path="/candidate/profile" element={<ProfileManagement />} />
        <Route path="/candidate/resume-upload" element={<ResumeUpload />} />
        <Route path="/candidate/resume-report" element={<ResumeReport />} />
        <Route path="/candidate/jobs" element={<AppliedJobs />} />
        <Route path="/candidate/schedule" element={<InterviewSchedule />} />
        <Route path="/candidate/mock-setup" element={<MockSetup />} />
        <Route path="/candidate/interview" element={<InterviewRoom />} />
        <Route path="/candidate/history" element={<InterviewHistory />} />
        <Route path="/candidate/results" element={<ResultsFeedback />} />
        <Route path="/candidate/settings" element={<Settings />} />
      </Route>

      {/* HR Recruiter Dashboard */}
      <Route element={<DashboardLayout />}>
        <Route path="/hr" element={<HROverview />} />
        <Route path="/hr/jobs" element={<JobManagement />} />
        <Route path="/hr/candidates" element={<CandidateManagement />} />
        <Route path="/hr/candidates/:id" element={<CandidateDetails />} />
        <Route path="/hr/pipeline" element={<HiringPipeline />} />
        <Route path="/hr/screening" element={<ResumeScreening />} />
        <Route path="/hr/ranking" element={<CandidateRanking />} />
        <Route path="/hr/compare" element={<CompareCandidates />} />
        <Route path="/hr/live" element={<LiveMonitoring />} />
        <Route path="/hr/feedback" element={<FeedbackManagement />} />
        <Route path="/hr/replay" element={<InterviewReplay />} />
        <Route path="/hr/replay/:id" element={<InterviewReplay />} />
        <Route path="/hr/analytics" element={<HRAnalytics />} />
      </Route>

      {/* Admin Dashboard */}
      <Route element={<DashboardLayout />}>
        <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/hr" element={<HRManagement />} />
        <Route path="/admin/ai-config" element={<AIConfiguration />} />
        <Route path="/admin/prompts" element={<PromptManagement />} />
        <Route path="/admin/questions" element={<QuestionBankManagement />} />
        <Route path="/admin/audit-logs" element={<AuditLogs />} />
        <Route path="/admin/analytics" element={<SystemAnalytics />} />
      </Route>

      {/* Tools (accessible by all authenticated users) */}
      <Route element={<DashboardLayout />}>
        <Route path="/tools/video-downloader" element={<VideoDownloader />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
