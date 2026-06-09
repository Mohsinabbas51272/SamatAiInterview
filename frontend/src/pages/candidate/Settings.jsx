import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Settings, Shield, Bell, Calendar, Mail, Check, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
  const { addToast } = useApp();

  // Notification states
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [interviewReminders, setInterviewReminders] = useState(true);
  const [resumeAnalysisUpdates, setResumeAnalysisUpdates] = useState(false);

  // Calendar states
  const [googleSync, setGoogleSync] = useState(false);
  const [outlookSync, setOutlookSync] = useState(false);

  // Password Reset simulation
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handlePasswordReset = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      addToast('Please fill out all fields.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('New passwords do not match.', 'error');
      return;
    }
    setUpdatingPassword(true);
    setTimeout(() => {
      addToast('Password updated successfully! (Simulation)', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setUpdatingPassword(false);
    }, 1200);
  };

  const handleToggleCalendar = (type) => {
    if (type === 'google') {
      const next = !googleSync;
      setGoogleSync(next);
      addToast(next ? 'Simulated synchronization with Google Calendar successful.' : 'Google Calendar unlinked.', 'info');
    } else {
      const next = !outlookSync;
      setOutlookSync(next);
      addToast(next ? 'Simulated synchronization with Outlook Calendar successful.' : 'Outlook Calendar unlinked.', 'info');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Account Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Configure email preferences, schedule calendars, and manage credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Navigation Sidebar of Settings */}
        <div className="md:col-span-1 space-y-3">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-left">
            <Bell className="w-4 h-4" /> Notification Settings
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left">
            <Calendar className="w-4 h-4" /> Integrations & Calendar
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left">
            <Shield className="w-4 h-4" /> Security & Password
          </button>
        </div>

        {/* Configurations Area */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Notifications Panel */}
          <Card className="p-6 md:p-8 space-y-6">
            <h3 className="font-bold text-lg border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-500" /> Notifications & Alerts
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Email Notifications</h4>
                  <p className="text-xs text-slate-500">Receive mock dispatch newsletters and platform alerts.</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={() => setEmailAlerts(!emailAlerts)}
                  className="w-10 h-5 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none checked:bg-blue-500 cursor-pointer transition-colors relative before:absolute before:w-5 before:h-5 before:bg-white before:rounded-full before:transition-transform checked:before:translate-x-5"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Interview Reminders</h4>
                  <p className="text-xs text-slate-500">Alerts when a new interview is scheduled or starting.</p>
                </div>
                <input
                  type="checkbox"
                  checked={interviewReminders}
                  onChange={() => setInterviewReminders(!interviewReminders)}
                  className="w-10 h-5 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none checked:bg-blue-500 cursor-pointer transition-colors relative before:absolute before:w-5 before:h-5 before:bg-white before:rounded-full before:transition-transform checked:before:translate-x-5"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Resume Analysis Completed</h4>
                  <p className="text-xs text-slate-500">Notifications when AI completes parsing your resume.</p>
                </div>
                <input
                  type="checkbox"
                  checked={resumeAnalysisUpdates}
                  onChange={() => setResumeAnalysisUpdates(!resumeAnalysisUpdates)}
                  className="w-10 h-5 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none checked:bg-blue-500 cursor-pointer transition-colors relative before:absolute before:w-5 before:h-5 before:bg-white before:rounded-full before:transition-transform checked:before:translate-x-5"
                />
              </div>
            </div>
          </Card>

          {/* Calendar Syncer */}
          <Card className="p-6 md:p-8 space-y-6">
            <h3 className="font-bold text-lg border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" /> Calendar Integrations
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Google Sync */}
              <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between h-40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center font-bold font-display">G</div>
                  <div>
                    <h5 className="font-bold text-sm">Google Calendar</h5>
                    <p className="text-[10px] text-slate-400">Sync interview room schedules.</p>
                  </div>
                </div>
                <Button
                  variant={googleSync ? "secondary" : "primary"}
                  onClick={() => handleToggleCalendar('google')}
                  size="sm"
                  className="w-full justify-center"
                >
                  {googleSync ? 'Linked' : 'Connect Google'}
                </Button>
              </div>

              {/* Outlook Sync */}
              <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between h-40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 flex items-center justify-center font-bold font-display">O</div>
                  <div>
                    <h5 className="font-bold text-sm">Outlook Office</h5>
                    <p className="text-[10px] text-slate-400">Synchronize corporate round logs.</p>
                  </div>
                </div>
                <Button
                  variant={outlookSync ? "secondary" : "primary"}
                  onClick={() => handleToggleCalendar('outlook')}
                  size="sm"
                  className="w-full justify-center"
                >
                  {outlookSync ? 'Linked' : 'Connect Outlook'}
                </Button>
              </div>
            </div>
          </Card>

          {/* Security & Password */}
          <Card className="p-6 md:p-8 space-y-6">
            <h3 className="font-bold text-lg border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-rose-500" /> Password Credentials
            </h3>
            
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm focus:outline-none bg-white dark:bg-slate-950"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm focus:outline-none bg-white dark:bg-slate-950"
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm focus:outline-none bg-white dark:bg-slate-950"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="primary" disabled={updatingPassword}>
                  {updatingPassword ? 'Saving changes...' : 'Reset Password'}
                </Button>
              </div>
            </form>
          </Card>

        </div>
      </div>
    </div>
  );
}
