import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import {
  Menu, X, LogOut, Sun, Moon, Cpu, User,
  LayoutDashboard, UploadCloud, Briefcase, Calendar,
  History, Award, Users, UserCheck, Settings,
  Activity, FileText, BarChart2, Bell, CheckCheck,
  Scale, Columns, Terminal, BookOpen, ScrollText, FileSearch, Play, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardLayout() {
  const {
    user, role, logoutUser, isDark, toggleTheme, profile, addToast,
    notifications, markNotificationRead, markAllNotificationsRead
  } = useApp();
  
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Auth Protection: If user is not logged in, redirect to login
  useEffect(() => {
    if (!user || role === 'guest') {
      addToast('Please login to access the dashboard.', 'warning');
      navigate('/login');
    }
  }, [user, role, navigate]);

  if (!user || role === 'guest') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 font-semibold">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Sidebar Links config based on role
  const getSidebarLinks = () => {
    if (role === 'candidate') {
      return [
        { name: 'Overview', path: '/candidate', icon: <LayoutDashboard className="w-4 h-4" /> },
        { name: 'Profile Management', path: '/candidate/profile', icon: <User className="w-4 h-4" /> },
        { name: 'Resume Upload', path: '/candidate/resume-upload', icon: <UploadCloud className="w-4 h-4" /> },
        { name: 'Resume Report', path: '/candidate/resume-report', icon: <FileSearch className="w-4 h-4" /> },
        { name: 'Applied Jobs', path: '/candidate/jobs', icon: <Briefcase className="w-4 h-4" /> },
        { name: 'Interview Schedule', path: '/candidate/schedule', icon: <Calendar className="w-4 h-4" /> },
        { name: 'Mock Setup', path: '/candidate/mock-setup', icon: <Play className="w-4 h-4" /> },
        { name: 'AI Interview Room', path: '/candidate/interview', icon: <Cpu className="w-4 h-4" /> },
        { name: 'Interview History', path: '/candidate/history', icon: <History className="w-4 h-4" /> },
        { name: 'Settings', path: '/candidate/settings', icon: <Settings className="w-4 h-4" /> },
        { name: 'Video Downloader', path: '/tools/video-downloader', icon: <Download className="w-4 h-4" /> }
      ];
    } else if (role === 'hr') {
      return [
        { name: 'Dashboard Overview', path: '/hr', icon: <LayoutDashboard className="w-4 h-4" /> },
        { name: 'Job Management', path: '/hr/jobs', icon: <Briefcase className="w-4 h-4" /> },
        { name: 'Candidate Management', path: '/hr/candidates', icon: <Users className="w-4 h-4" /> },
        { name: 'Hiring Pipeline', path: '/hr/pipeline', icon: <Columns className="w-4 h-4" /> },
        { name: 'Resume Screening', path: '/hr/screening', icon: <FileText className="w-4 h-4" /> },
        { name: 'Candidate Ranking', path: '/hr/ranking', icon: <BarChart2 className="w-4 h-4" /> },
        { name: 'Compare Candidates', path: '/hr/compare', icon: <Scale className="w-4 h-4" /> },
        { name: 'Live Monitoring', path: '/hr/live', icon: <Activity className="w-4 h-4" /> },
        { name: 'Feedback Hub', path: '/hr/feedback', icon: <ScrollText className="w-4 h-4" /> },
        { name: 'Analytics', path: '/hr/analytics', icon: <Activity className="w-4 h-4" /> },
        { name: 'Video Downloader', path: '/tools/video-downloader', icon: <Download className="w-4 h-4" /> }
      ];
    } else if (role === 'admin') {
      return [
        { name: 'User Management', path: '/admin/users', icon: <Users className="w-4 h-4" /> },
        { name: 'HR Management', path: '/admin/hr', icon: <UserCheck className="w-4 h-4" /> },
        { name: 'AI Configuration', path: '/admin/ai-config', icon: <Settings className="w-4 h-4" /> },
        { name: 'System Prompts', path: '/admin/prompts', icon: <Terminal className="w-4 h-4" /> },
        { name: 'Question Bank', path: '/admin/questions', icon: <BookOpen className="w-4 h-4" /> },
        { name: 'Audit Logs', path: '/admin/audit-logs', icon: <ScrollText className="w-4 h-4" /> },
        { name: 'System Analytics', path: '/admin/analytics', icon: <Activity className="w-4 h-4" /> },
        { name: 'Video Downloader', path: '/tools/video-downloader', icon: <Download className="w-4 h-4" /> }
      ];
    }
    return [];
  };

  const menuLinks = getSidebarLinks();
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex transition-colors duration-300">
      
      {/* 1. Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 shrink-0">
        
        {/* Logo Section */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800">
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg text-slate-800 dark:text-white">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <span>Smart Interview</span>
          </Link>
        </div>

        {/* User Info profile */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold border border-blue-100 dark:border-blue-900 uppercase">
            {(user.name || user.email || 'U').charAt(0)}
          </div>
          <div className="overflow-hidden">
            <h4 className="font-semibold text-sm truncate text-slate-800 dark:text-slate-200">{user.name || user.email?.split('@')[0] || 'User'}</h4>
            <p className="text-xs text-slate-400 truncate capitalize">{role} Account</p>
          </div>
        </div>

        {/* Links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all relative ${
                isActive(link.path)
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {isActive(link.path) && (
                <motion.div
                  layoutId="sidebarActiveIndicator"
                  className="absolute left-0 top-2 bottom-2 w-1 bg-blue-500 dark:bg-blue-400 rounded-r"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <span className={isActive(link.path) ? 'text-blue-500 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}>
                {link.icon}
              </span>
              <span>{link.name}</span>
            </Link>
          ))}
        </nav>

        {/* Sign Out */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-700 dark:hover:text-rose-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. Main content flow container */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Dashboard Top Header */}
        <header className="h-16 border-b border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full uppercase tracking-wider">
              {role} portal
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-800"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-800"
              >
                <Bell className="w-4 h-4" />
                {notifications.filter((n) => !n.isRead).length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-40 overflow-hidden backdrop-blur-md bg-white/95 dark:bg-slate-900/95"
                    >
                      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="font-bold text-sm">Notifications</span>
                        {notifications.filter((n) => !n.isRead).length > 0 && (
                          <button
                            onClick={() => {
                              markAllNotificationsRead();
                              setNotifOpen(false);
                            }}
                            className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 font-semibold"
                          >
                            <CheckCheck className="w-3 h-3" /> Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-sm text-slate-400 dark:text-slate-500">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => {
                                if (!notif.isRead) markNotificationRead(notif.id);
                              }}
                              className={`p-3 text-left transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                                !notif.isRead ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <h5 className={`text-xs font-semibold ${!notif.isRead ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                  {notif.title}
                                </h5>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                {notif.message}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Dynamic page contents */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* 3. Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Overlay background */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden"
            />
            
            {/* Sidebar content drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 bottom-0 left-0 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 p-6 flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg text-slate-800 dark:text-white">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                    <Cpu className="w-4 h-4 text-white" />
                  </div>
                  <span>Smart Interview</span>
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile User details */}
              <div className="mb-6 flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold uppercase">
                  {(user.name || user.email || 'U').charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{user.name || user.email?.split('@')[0] || 'User'}</h4>
                  <p className="text-xs text-slate-400 uppercase">{role} Account</p>
                </div>
              </div>

              {/* Links */}
              <nav className="flex-grow space-y-1.5 overflow-y-auto">
                {menuLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all relative ${
                      isActive(link.path)
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <span className={isActive(link.path) ? 'text-blue-500 dark:text-blue-400' : 'text-slate-400'}>
                      {link.icon}
                    </span>
                    <span>{link.name}</span>
                  </Link>
                ))}
              </nav>

              {/* Sign out bottom */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
