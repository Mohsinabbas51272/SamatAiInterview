import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Award,
  UserCheck,
  ClipboardList,
  Search,
  Filter,
  Eye,
  FileCheck,
  TrendingUp,
  Brain,
  MessageSquare,
  PlayCircle,
  Sparkles
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useApp } from '../context/AppContext';
import { Card, CardHeader, CardBody } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Modal } from '../components/UI/Modal';
import { ProgressBar } from '../components/UI/Progress';

export default function HRDashboard() {
  const navigate = useNavigate();
  const { candidates } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // KPI Calculations
  const totalCandidates = candidates.length;
  const completedInterviews = candidates.filter((c) => c.interviewScore > 0).length;
  const selectedCount = candidates.filter((c) => c.status === 'Selected').length;
  const pendingReviews = candidates.filter((c) => c.status === 'Further Review' || !c.status).length;

  // Filtering Candidate Data
  const filteredCandidates = candidates.filter((cand) => {
    const matchesSearch = cand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cand.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || cand.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCandidates = filteredCandidates.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);

  // Recharts Chart 1: Performance comparison
  const performanceData = candidates
    .filter((c) => c.interviewScore > 0)
    .map((c) => ({
      name: c.name.split(' ')[0],
      Resume: c.resumeScore,
      Interview: c.interviewScore
    }));

  // Recharts Chart 2: Status Breakdown
  const statusData = [
    { name: 'Selected', value: selectedCount },
    { name: 'Further Review', value: pendingReviews },
    { name: 'Rejected', value: candidates.filter((c) => c.status === 'Rejected').length }
  ].filter(d => d.value > 0);

  const COLORS = ['#3b82f6', '#8b5cf6', '#ef4444'];

  // Recharts Chart 3: Skills breakdown
  const skillsData = [
    { name: 'React', count: 4 },
    { name: 'TypeScript', count: 3 },
    { name: 'Tailwind CSS', count: 4 },
    { name: 'Vite', count: 2 },
    { name: 'State Mgmt', count: 3 }
  ];

  const handleViewDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50/40 p-4 sm:p-6 md:p-8 space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-800">Recruitment Analytics Control</h2>
          <p className="text-sm text-slate-500 font-medium">Enterprise dashboard for pipeline screening monitoring.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => navigate('/candidate/dashboard')}>
            Candidate Portal
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/')}>
            Exit Dashboard
          </Button>
        </div>
      </div>

      {/* Analytics KPI Widgets Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="border border-slate-100/90" hoverEffect>
          <CardBody className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-600 shadow-sm shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Candidates</span>
              <h3 className="text-2xl font-bold text-slate-800 mt-1 font-display">{totalCandidates}</h3>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-slate-100/90" hoverEffect>
          <CardBody className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl text-purple-600 shadow-sm shrink-0">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Completed Screening</span>
              <h3 className="text-2xl font-bold text-slate-800 mt-1 font-display">{completedInterviews}</h3>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-slate-100/90" hoverEffect>
          <CardBody className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 shadow-sm shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Selected Profiles</span>
              <h3 className="text-2xl font-bold text-slate-800 mt-1 font-display">{selectedCount}</h3>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-slate-100/90" hoverEffect>
          <CardBody className="flex items-center gap-4">
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 shadow-sm shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pending Review</span>
              <h3 className="text-2xl font-bold text-slate-800 mt-1 font-display">{pendingReviews}</h3>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Performance compares */}
        <Card className="lg:col-span-2 border border-slate-100/90">
          <CardHeader>
            <h4 className="font-bold text-slate-800 text-sm">Resume vs. Technical Interview Performance</h4>
          </CardHeader>
          <CardBody className="w-full">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} fontWeight={600} />
                  <YAxis stroke="#94a3b8" fontSize={11} fontWeight={600} />
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '12px' }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar dataKey="Resume" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="Interview" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Chart 2: Status distribution */}
        <Card className="border border-slate-100/90">
          <CardHeader>
            <h4 className="font-bold text-slate-800 text-sm">Status Metrics Distribution</h4>
          </CardHeader>
          <CardBody>
            <div className="h-64 flex flex-col justify-between items-center">
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex gap-4 text-xs font-semibold text-slate-500">
                {statusData.map((entry, index) => (
                  <span key={entry.name} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    {entry.name}
                  </span>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Candidate Management Panel */}
      <Card className="border border-slate-200/80 bg-white/90 shadow-md">
        <CardHeader className="flex-col sm:flex-row gap-4">
          <h4 className="font-bold text-slate-800 text-sm">Candidate Management Index</h4>
          
          {/* Controls Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search candidate..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 text-slate-700 bg-slate-50/50"
              />
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 text-slate-600 bg-white"
              >
                <option value="All">All Statuses</option>
                <option value="Selected">Selected</option>
                <option value="Further Review">Further Review</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </CardHeader>
        
        <CardBody className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Candidate Name</th>
                <th className="px-6 py-4 font-semibold">Resume Score</th>
                <th className="px-6 py-4 font-semibold">Interview Score</th>
                <th className="px-6 py-4 font-semibold">Confidence Score</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentCandidates.map((cand) => (
                <tr key={cand.id} className="hover:bg-slate-50/50 transition-colors font-medium">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-100 to-indigo-100 flex items-center justify-center font-bold text-blue-600 uppercase text-xs shadow-inner">
                        {cand.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 block text-sm">{cand.name}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">{cand.role}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-100">
                      {cand.resumeScore}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {cand.interviewScore > 0 ? (
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold border border-purple-100">
                        {cand.interviewScore}%
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Not Screening</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {cand.confidenceScore > 0 ? (
                      <span className="text-slate-700 font-semibold">{cand.confidenceScore}%</span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full font-bold uppercase text-[9px] tracking-wider border ${
                        cand.status === 'Selected'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-150'
                          : cand.status === 'Further Review'
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-150'
                          : 'bg-rose-50 text-rose-700 border-rose-150'
                      }`}
                    >
                      {cand.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => handleViewDetails(cand)}
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<FileCheck className="w-3.5 h-3.5" />}
                        onClick={() => navigate(`/admin/report/${cand.id}`)}
                      >
                        Report
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentCandidates.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-400 font-semibold">
                    No candidates match the filter parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardBody>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-slate-100 text-xs font-semibold">
            <span className="text-slate-500">
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredCandidates.length)} of {filteredCandidates.length} Candidates
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Candidate details modal */}
      {selectedCandidate && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Profile Card Summary: ${selectedCandidate.name}`}
          size="lg"
        >
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Primary JD Match</span>
                <span className="text-base font-bold text-slate-800">{selectedCandidate.role}</span>
                <p className="text-xs text-slate-400 mt-0.5">{selectedCandidate.email} • Checked: {selectedCandidate.date}</p>
              </div>
              <span
                className={`inline-block px-3 py-1 rounded-full font-bold uppercase text-[10px] tracking-wider border ${
                  selectedCandidate.status === 'Selected'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-150'
                    : selectedCandidate.status === 'Further Review'
                    ? 'bg-yellow-50 text-yellow-700 border-yellow-150'
                    : 'bg-rose-50 text-rose-700 border-rose-150'
                }`}
              >
                {selectedCandidate.status}
              </span>
            </div>

            {/* Main Details grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">Resume Score</span>
                <span className="text-2xl font-bold text-blue-600 mt-1 block font-display">{selectedCandidate.resumeScore}%</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">Interview Performance</span>
                <span className="text-2xl font-bold text-purple-600 mt-1 block font-display">{selectedCandidate.interviewScore}%</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">Communication Tone</span>
                <span className="text-2xl font-bold text-emerald-600 mt-1 block font-display">{selectedCandidate.communicationScore}%</span>
              </div>
            </div>

            {/* NLP Sentiment summary */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-purple-500" /> NLP Linguistics Feedback
              </h5>
              <p className="text-sm text-slate-600 leading-relaxed font-medium bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                {selectedCandidate.nlpAnalysis || "Evaluation details not uploaded. Initial screening logs compile technical vocabulary expressions."}
              </p>
            </div>

            {/* Strength tags */}
            {selectedCandidate.strengths && selectedCandidate.strengths.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Core Strengths</span>
                  <ul className="text-xs text-slate-600 space-y-1.5 font-semibold">
                    {selectedCandidate.strengths.map((str) => (
                      <li key={str} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {str}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Improvement Areas</span>
                  <ul className="text-xs text-slate-600 space-y-1.5 font-semibold">
                    {selectedCandidate.weaknesses.map((weak) => (
                      <li key={weak} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> {weak}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Mock Interview Video Preview */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block flex items-center gap-1.5">
                <PlayCircle className="w-4 h-4 text-blue-500" /> Technical Session Recording
              </span>
              <div className="relative aspect-video rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                <div className="text-center p-4">
                  <PlayCircle className="w-10 h-10 text-white/40 mx-auto cursor-pointer hover:text-white/60 transition-colors" />
                  <span className="text-[10px] text-slate-400 font-semibold block mt-1.5">Stream recorded Technical interview blocks</span>
                </div>
              </div>
            </div>

            {/* Footer Buttons inside modal */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Dismiss
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setIsModalOpen(false);
                  navigate(`/admin/report/${selectedCandidate.id}`);
                }}
              >
                Full Scorecard Report
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
