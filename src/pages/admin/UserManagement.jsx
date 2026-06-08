import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useApp } from '../../store/AppContext';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Modal } from '../../components/UI/Modal';
import { Users, Trash2, Plus, ShieldCheck, Mail, ShieldAlert, Loader2 } from 'lucide-react';
import userService from '../../services/userService';
import authService from '../../services/authService';

export default function UserManagement() {
  const { user, addToast, extractData } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userService.getAll();
      const fetchedUsers = extractData(res) || [];
      // Optionally filter out the current user, or show all
      setUsersList(fetchedUsers);
    } catch (err) {
      console.error('Failed to load users:', err);
      addToast('Failed to load users.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN' || user?.role === 'HR') {
      fetchUsers();
    }
  }, [user]);

  const handleCreateUser = async (data) => {
    try {
      setSubmitting(true);
      // Determine first and last name from full name
      const nameParts = data.name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || 'User';

      await authService.register({
        email: data.email,
        password: 'Password123!', // Default password for registered accounts
        firstName,
        lastName,
        role: data.role || 'CANDIDATE'
      });
      
      addToast(`User account created for ${data.name}!`, 'success');
      setModalOpen(false);
      reset();
      fetchUsers();
    } catch (err) {
      console.error('Failed to create user:', err);
      addToast(err.response?.data?.message || 'Failed to create user account.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to remove this user account?")) {
      try {
        setLoading(true);
        await userService.deleteUser(id);
        addToast('User account removed.', 'info');
        fetchUsers();
      } catch (err) {
        console.error('Failed to delete user:', err);
        addToast('Failed to delete user.', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && usersList.length === 0) {
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
          <h2 className="text-xl font-bold font-display text-slate-800 dark:text-white">User Account Control</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage platform users, candidate credentials and role access</p>
        </div>
        {user?.role === 'ADMIN' && (
          <Button onClick={() => { reset(); setModalOpen(true); }} variant="primary" size="sm" className="w-fit font-bold">
            <Plus className="w-4 h-4 mr-1.5" /> Register User
          </Button>
        )}
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">User Profile</th>
                <th className="pb-3 font-semibold">Email</th>
                <th className="pb-3 font-semibold">Account Role</th>
                <th className="pb-3 font-semibold">Registration Date</th>
                {user?.role === 'ADMIN' && <th className="pb-3 font-semibold">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {usersList.map((u) => {
                const displayName = u.profile ? `${u.profile.firstName} ${u.profile.lastName}` : u.name || u.email.split('@')[0];
                return (
                  <tr key={u.id} className="border-b border-slate-50 dark:border-slate-800/40 last:border-b-0 text-xs text-slate-650 dark:text-slate-400">
                    <td className="py-3.5 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center font-bold uppercase shrink-0">
                        {displayName.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-850 dark:text-slate-200">{displayName}</span>
                    </td>
                    <td className="py-3.5 font-medium">{u.email}</td>
                    <td className="py-3.5 font-semibold text-slate-500">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        u.role === 'ADMIN' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20' :
                        u.role === 'HR' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' :
                        'bg-blue-50 text-blue-600 dark:bg-blue-900/20'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5">{new Date(u.createdAt).toLocaleDateString()}</td>
                    {user?.role === 'ADMIN' && (
                      <td className="py-3.5">
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-colors"
                          title="Delete User"
                          disabled={u.id === user.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
              {usersList.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Creation Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Register User Account">
        <form onSubmit={handleSubmit(handleCreateUser)} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
            <input
              type="text"
              placeholder="Edward Kenway"
              {...register('name', { required: 'Name is required' })}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 text-sm"
            />
            {errors.name && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> {errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
            <input
              type="email"
              placeholder="edward@skytech.io"
              {...register('email', { 
                required: 'Email is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
              })}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 text-sm"
            />
            {errors.email && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> {errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Platform Role</label>
            <select
              {...register('role')}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 text-sm text-slate-700 dark:text-slate-200"
            >
              <option value="CANDIDATE">Candidate</option>
              <option value="HR">HR Recruiter</option>
              <option value="ADMIN">System Admin</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : null}
              Create Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
