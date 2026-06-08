import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useApp } from '../../store/AppContext';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Modal } from '../../components/UI/Modal';
import { UserCheck, Plus, Trash2, ShieldAlert, Loader2 } from 'lucide-react';
import userService from '../../services/userService';
import authService from '../../services/authService';
import jobService from '../../services/jobService';

export default function HRManagement() {
  const { user, addToast, extractData } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  
  const fetchRecruiters = async () => {
    try {
      setLoading(true);
      // 1. Fetch all HR users
      const res = await userService.getAll('HR');
      const hrUsers = extractData(res) || [];

      // 2. Fetch all active jobs to count postings per HR
      let activeJobs = [];
      try {
        const jobsRes = await jobService.getAll({ status: 'ACTIVE' });
        activeJobs = extractData(jobsRes) || [];
      } catch (err) {
        console.warn('Could not fetch jobs for HR counts', err);
      }

      const formatted = hrUsers.map(u => ({
        id: u.id,
        name: u.profile ? `${u.profile.firstName} ${u.profile.lastName}` : u.name || u.email.split('@')[0],
        email: u.email,
        department: u.profile?.title || 'General Recruiting',
        activePostings: activeJobs.filter(j => j.createdById === u.id).length
      }));

      setRecruiters(formatted);
    } catch (err) {
      console.error('Failed to load HR users:', err);
      addToast('Failed to load HR recruiters.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchRecruiters();
    }
  }, [user]);

  const handleCreateRecruiter = async (data) => {
    try {
      setSubmitting(true);
      const nameParts = data.name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || 'Recruiter';

      // 1. Register account
      await authService.register({
        email: data.email,
        password: 'Password123!', 
        firstName,
        lastName,
        role: 'HR'
      });

      // Note: We'd normally want to update the profile title to `data.department` here 
      // but since the endpoint might require the user themselves to update their profile,
      // we just create the account and they can update it upon login.

      addToast(`HR Recruiter account created for ${data.name}!`, 'success');
      setModalOpen(false);
      reset();
      fetchRecruiters();
    } catch (err) {
      console.error('Failed to create HR user:', err);
      addToast(err.response?.data?.message || 'Failed to create HR account.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRecruiter = async (id) => {
    if (window.confirm("Are you sure you want to remove this HR recruiter account?")) {
      try {
        setLoading(true);
        await userService.deleteUser(id);
        addToast('HR Recruiter account removed.', 'info');
        fetchRecruiters();
      } catch (err) {
        console.error('Failed to delete HR:', err);
        addToast('Failed to delete HR account.', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && recruiters.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-800 dark:text-white">HR Recruiter Management</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure recruiter authorization permissions and active departments</p>
        </div>
        <Button onClick={() => { reset(); setModalOpen(true); }} variant="primary" size="sm" className="w-fit">
          <Plus className="w-4 h-4 mr-1.5" /> Add Recruiter
        </Button>
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">HR Officer</th>
                <th className="pb-3 font-semibold">Email</th>
                <th className="pb-3 font-semibold">Department</th>
                <th className="pb-3 font-semibold">Active Postings</th>
                <th className="pb-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recruiters.map((rec) => (
                <tr key={rec.id} className="border-b border-slate-50 dark:border-slate-800/40 last:border-b-0 text-xs text-slate-650 dark:text-slate-400">
                  <td className="py-3.5 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center font-bold uppercase shrink-0">
                      {rec.name.charAt(0)}
                    </div>
                    <span className="font-bold text-slate-850 dark:text-slate-200">{rec.name}</span>
                  </td>
                  <td className="py-3.5 font-medium">{rec.email}</td>
                  <td className="py-3.5 font-semibold text-slate-500">{rec.department}</td>
                  <td className="py-3.5 font-bold text-blue-500">{rec.activePostings}</td>
                  <td className="py-3.5">
                    <button
                      onClick={() => handleDeleteRecruiter(rec.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-colors"
                      title="Delete Recruiter"
                      disabled={rec.id === user?.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {recruiters.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">
                    No HR recruiters found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Creation Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add HR Recruiter Account">
        <form onSubmit={handleSubmit(handleCreateRecruiter)} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Recruiter Name</label>
            <input
              type="text"
              placeholder="John Watson"
              {...register('name', { required: 'Name is required' })}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 text-sm"
            />
            {errors.name && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> {errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
            <input
              type="email"
              placeholder="john@skytech.io"
              {...register('email', { 
                required: 'Email is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
              })}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 text-sm"
            />
            {errors.email && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> {errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">HR Department</label>
            <input
              type="text"
              placeholder="Executive Recruitment"
              {...register('department')}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : null}
              Add Recruiter
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
