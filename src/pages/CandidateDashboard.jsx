import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  FileUp,
  MessageSquare,
  Settings,
  PlusCircle,
  FileCheck2,
  Bell,
  Clock,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Lock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Sidebar } from '../components/Sidebar';
import { Card, CardHeader, CardBody, CardFooter } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { CircularProgress, ProgressBar } from '../components/UI/Progress';
import { Skeleton } from '../components/UI/Skeleton';

export default function CandidateDashboard() {
  const navigate = useNavigate();
  const {
    uploadedResume,
    parsingResume,
    parsingProgress,
    parsingStep,
    uploadResume,
    userName,
    setUserName,
    userEmail,
    setUserEmail,
    userInterviewFinished,
    addToast,
    resetInterview
  } = useApp();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [dragActive, setDragActive] = useState(false);

  // Sidebar Configuration
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'interviews', label: 'My Interviews', icon: <Calendar className="w-4 h-4" /> },
    { id: 'upload', label: 'Resume Upload', icon: <FileUp className="w-4 h-4" /> },
    { id: 'feedback', label: 'AI Feedback', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  // Drag and Drop handlers
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
      if (file.type === "application/pdf" || file.name.endsWith('.docx') || file.name.endsWith('.pdf')) {
        uploadResume(file);
      } else {
        addToast('Invalid file format. Please upload PDF or DOCX.', 'error');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      uploadResume(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-50/40">
      {/* Sidebar Navigation */}
      <Sidebar
        items={sidebarItems}
        activeItem={activeTab}
        onItemChange={setActiveTab}
        userProfile={{
          name: userName,
          sub: 'Software Engineer applicant',
          avatarText: userName.charAt(0),
          badge: userInterviewFinished ? 'Scored' : 'Ready'
        }}
        onLogout={() => {
          resetInterview();
          navigate('/');
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full">
        {/* Tab 1: Widgets Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold font-display text-slate-800">Welcome Back, {userName}</h2>
                <p className="text-sm text-slate-500 font-medium">Here is your current interview preparation status.</p>
              </div>
              <Button
                variant="primary"
                onClick={() => {
                  if (!uploadedResume) {
                    addToast('Please upload your resume to unlock the Interview Room!', 'info');
                    setActiveTab('upload');
                  } else {
                    setActiveTab('interviews');
                  }
                }}
              >
                Go to Interview Room
              </Button>
            </div>

            {/* Widgets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Widget 1: Upcoming Interview / Room Access */}
              <Card className="md:col-span-2 border border-slate-100" hoverEffect>
                <CardHeader>
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" /> Upcoming Checkpoints
                  </h4>
                  <span className="text-xs font-semibold text-slate-400">Next 24 Hours</span>
                </CardHeader>
                <CardBody className="space-y-4">
                  {userInterviewFinished ? (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-3">
                      <div className="p-2 bg-emerald-500 text-white rounded-lg"><FileCheck2 className="w-5 h-5" /></div>
                      <div>
                        <h5 className="text-sm font-bold text-emerald-900">AI Assessment Completed</h5>
                        <p className="text-xs text-emerald-700 mt-0.5">Your scores and evaluations have been compiled. Visit the AI Feedback tab to view your full scorecard report.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h5 className="text-sm font-bold text-slate-800">Adaptive AI Technical Screening</h5>
                        <p className="text-xs text-slate-500 mt-1">Role: Senior React Developer (5 Rounds, 15 Minutes)</p>
                      </div>
                      {uploadedResume ? (
                        <Button variant="primary" size="sm" onClick={() => navigate('/candidate/interview')}>
                          Start Interview
                        </Button>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-white px-3 py-2 rounded-lg border border-slate-200">
                          <Lock className="w-3.5 h-3.5" /> Upload Resume first
                        </div>
                      )}
                    </div>
                  )}

                  {/* Interview Status Timeline */}
                  <div className="pt-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-4">Milestone Progress</span>
                    <div className="flex items-center justify-between max-w-md relative">
                      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2" />
                      
                      <div className="flex flex-col items-center gap-1 relative z-10 bg-white px-2">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${uploadedResume ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300 text-slate-400'}`}>1</div>
                        <span className="text-[10px] font-semibold text-slate-500">Resume</span>
                      </div>

                      <div className="flex flex-col items-center gap-1 relative z-10 bg-white px-2">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${userInterviewFinished ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300 text-slate-400'}`}>2</div>
                        <span className="text-[10px] font-semibold text-slate-500">Interview</span>
                      </div>

                      <div className="flex flex-col items-center gap-1 relative z-10 bg-white px-2">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${userInterviewFinished ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300 text-slate-400'}`}>3</div>
                        <span className="text-[10px] font-semibold text-slate-500">Evaluation</span>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Widget 2: Resume Match Circle */}
              <Card className="border border-slate-100 flex flex-col items-center justify-center" hoverEffect>
                <h4 className="font-bold text-slate-800 text-sm mb-4 text-center">Resume Match Percentage</h4>
                {uploadedResume ? (
                  <CircularProgress value={uploadedResume.matchScore} size={120} circleColor="stroke-blue-500" />
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2 py-6">
                    <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200/50 flex items-center justify-center text-slate-400 shadow-inner">
                      <FileUp className="w-6 h-6" />
                    </div>
                    <span className="text-xs text-slate-400 font-semibold text-center max-w-[150px]">No resume uploaded yet</span>
                  </div>
                )}
              </Card>
            </div>

            {/* Second row of widgets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Widget 3: Stats cards */}
              <div className="space-y-4">
                <Card className="border border-slate-100" hoverEffect>
                  <CardBody className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600"><TrendingUp className="w-5 h-5" /></div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Target Role Match</span>
                      <h4 className="text-base font-bold text-slate-800 mt-0.5">{uploadedResume ? 'Senior React Architect' : 'Not Loaded'}</h4>
                    </div>
                  </CardBody>
                </Card>

                <Card className="border border-slate-100" hoverEffect>
                  <CardBody className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-center text-purple-600"><BrainCircuit className="w-5 h-5" /></div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">AI Personality Index</span>
                      <h4 className="text-base font-bold text-slate-800 mt-0.5">{userInterviewFinished ? 'Highly Analytical' : 'Awaiting Room'}</h4>
                    </div>
                  </CardBody>
                </Card>
              </div>

              {/* Widget 4: Feedback Preview / Lock state */}
              <Card className="border border-slate-100" hoverEffect>
                <CardHeader>
                  <h4 className="font-bold text-slate-800 text-sm">Feedback Preview</h4>
                </CardHeader>
                <CardBody className="flex flex-col justify-center h-32">
                  {userInterviewFinished ? (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-500 italic">"Strong analytical syntax layout during structural challenges..."</p>
                      <button onClick={() => setActiveTab('feedback')} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                        View complete feedback scorecard <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center space-y-2">
                      <Lock className="w-5 h-5 text-slate-400" />
                      <span className="text-xs text-slate-400 font-semibold">Complete AI Interview to unlock report details</span>
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Widget 5: Notifications list */}
              <Card className="border border-slate-100" hoverEffect>
                <CardHeader>
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <Bell className="w-4 h-4 text-purple-500" /> Updates & Alerts
                  </h4>
                </CardHeader>
                <CardBody className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  <div className="text-xs border-b border-slate-50 pb-2">
                    <span className="text-slate-400 font-semibold">Today:</span>
                    <p className="text-slate-600 mt-0.5">Vite template matches added. Interview portal configured.</p>
                  </div>
                  <div className="text-xs border-b border-slate-50 pb-2">
                    <span className="text-slate-400 font-semibold">System:</span>
                    <p className="text-slate-600 mt-0.5">Please ensure camera permissions are active before entering.</p>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 2: Resume Upload Panel */}
        {activeTab === 'upload' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div>
              <h2 className="text-2xl font-bold font-display text-slate-800">Resume Matching Node</h2>
              <p className="text-sm text-slate-500 font-medium">Upload your profile to parse technical experience clusters.</p>
            </div>

            {parsingResume ? (
              <Card className="border border-slate-200 p-8 text-center bg-white shadow-md">
                <CardBody className="space-y-4">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-bold text-slate-800 mt-2">Running NLP Parser</span>
                    <span className="text-xs text-slate-400 font-semibold">{parsingProgress}% - {parsingStep}</span>
                  </div>
                  <ProgressBar value={parsingProgress} color="bg-gradient-to-r from-blue-500 to-purple-500" />
                </CardBody>
              </Card>
            ) : uploadedResume ? (
              <Card className="border border-slate-200 bg-white shadow-md p-6">
                <CardBody className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600">
                      <FileCheck2 className="w-8 h-8" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="text-base font-bold text-slate-800">{uploadedResume.name}</h4>
                      <p className="text-xs text-slate-400 font-semibold">{uploadedResume.size}</p>
                      <div className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-bold mt-1">
                        Parsed Match Score: {uploadedResume.matchScore}%
                      </div>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => uploadResume(null)}>
                      Replace File
                    </Button>
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <h5 className="text-sm font-bold text-slate-700 mb-2">Extracted Tech Skills</h5>
                    <div className="flex flex-wrap gap-2">
                      {uploadedResume.skills.map((skill) => (
                        <span key={skill} className="px-2.5 py-1 bg-slate-50 border border-slate-100 text-slate-600 text-xs font-semibold rounded-lg">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-50/50 border border-blue-100/50 p-4 rounded-xl flex items-center justify-between">
                    <span className="text-xs text-blue-900 font-semibold">Your resume is parsed. You are now unlocked to join the AI interview room.</span>
                    <Button variant="primary" size="sm" onClick={() => navigate('/candidate/interview')}>
                      Start Interview Room
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ) : (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50/20'
                    : 'border-slate-300 hover:border-blue-500 bg-white/70 backdrop-blur-md'
                }`}
              >
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 bg-blue-50 border border-blue-100/50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm animate-float">
                    <FileUp className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-800">Drag & Drop Resume</h4>
                    <p className="text-xs text-slate-400 mt-1 font-semibold">Support PDF or DOCX formats up to 5MB</p>
                  </div>
                  <label className="cursor-pointer">
                    <Button variant="secondary" size="sm" className="pointer-events-none">
                      Browse Files
                    </Button>
                    <input type="file" onChange={handleFileChange} className="hidden" accept=".pdf,.docx" />
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Interviews Control */}
        {activeTab === 'interviews' && (
          <div className="space-y-6 max-w-xl mx-auto">
            <div>
              <h2 className="text-2xl font-bold font-display text-slate-800">AI Technical Interview Lobby</h2>
              <p className="text-sm text-slate-500 font-medium">Verify your details and hardware state before entering.</p>
            </div>

            <Card className="border border-slate-200 bg-white shadow-md p-6 space-y-6">
              <CardBody className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Your Full Name</label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 text-slate-700 bg-slate-50/50"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 text-slate-700 bg-slate-50/50"
                      placeholder="e.g. email@example.com"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
                  <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Device Checklist</h5>
                  <ul className="text-xs text-slate-500 space-y-1.5 font-semibold">
                    <li className="flex items-center gap-2">✓ Webcam Preview (Standard input verified)</li>
                    <li className="flex items-center gap-2">✓ Microphone (Simulated web volume verified)</li>
                    <li className="flex items-center gap-2">✓ Stable Network connection</li>
                  </ul>
                </div>

                {uploadedResume ? (
                  <Button variant="primary" className="w-full" size="lg" onClick={() => navigate('/candidate/interview')}>
                    Join Interview Room
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Button variant="primary" className="w-full" size="lg" disabled>
                      Join Interview Room (Locked)
                    </Button>
                    <p className="text-center text-xs text-rose-500 font-semibold">
                      You must upload a resume before starting the interview room.
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        )}

        {/* Tab 4: AI Feedback Scorecard */}
        {activeTab === 'feedback' && (
          <div className="space-y-6 max-w-xl mx-auto">
            <div>
              <h2 className="text-2xl font-bold font-display text-slate-800">Candidate Evaluation Report</h2>
              <p className="text-sm text-slate-500 font-medium">Review your performance, confidence ratings, and NLP analyses.</p>
            </div>

            {userInterviewFinished ? (
              <Card className="border border-slate-200 bg-white shadow-md p-6 text-center space-y-4">
                <CardBody className="space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                    <FileCheck2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">Your AI scorecard is active</h4>
                    <p className="text-xs text-slate-400 mt-1 font-semibold">Candidate ID: cand-user</p>
                  </div>
                  <Button variant="primary" className="w-full" onClick={() => navigate('/admin/report/cand-user')}>
                    View Full Scorecard Report
                  </Button>
                </CardBody>
              </Card>
            ) : (
              <Card className="border border-slate-100 text-center p-8 bg-white/70 backdrop-blur-md">
                <CardBody className="space-y-4 flex flex-col items-center">
                  <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 shadow-inner">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-800">Evaluation Locked</h4>
                    <p className="text-xs text-slate-400 mt-1 font-semibold max-w-[280px] mx-auto">
                      Complete the AI interview room dashboard loop to compile your scoring card.
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      if (!uploadedResume) {
                        setActiveTab('upload');
                      } else {
                        setActiveTab('interviews');
                      }
                    }}
                  >
                    Go to Interview Lobby
                  </Button>
                </CardBody>
              </Card>
            )}
          </div>
        )}

        {/* Tab 5: Settings Edit */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-xl mx-auto">
            <div>
              <h2 className="text-2xl font-bold font-display text-slate-800">Profile Settings</h2>
              <p className="text-sm text-slate-500 font-medium">Update candidate information for scorecard generation.</p>
            </div>

            <Card className="border border-slate-200 bg-white p-6 shadow-md">
              <CardBody className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 text-slate-700 bg-slate-50/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 text-slate-700 bg-slate-50/50"
                    />
                  </div>
                </div>
                <Button variant="primary" className="w-full" onClick={() => addToast('Settings updated!', 'success')}>
                  Save Settings
                </Button>
              </CardBody>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
