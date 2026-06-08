import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { Button } from '../../components/UI/Button';
import { Mail, Lock, User, Cpu, UserCheck, ShieldAlert, Loader2 } from 'lucide-react';

export default function Register() {
  const { registerUser, getRoleRedirect } = useApp();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [selectedRole, setSelectedRole] = useState('CANDIDATE');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await registerUser({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      role: selectedRole,
    });
    setLoading(false);

    if (result.success) {
      const redirectPath = getRoleRedirect(result.user.role);
      navigate(redirectPath);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold font-display text-slate-800 dark:text-white">Create Your Account</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Get started with our AI evaluation platform today</p>
      </div>

      {/* Role Selection Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
        <button
          type="button"
          onClick={() => setSelectedRole('CANDIDATE')}
          className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
            selectedRole === 'CANDIDATE'
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          Candidate
        </button>
        <button
          type="button"
          onClick={() => setSelectedRole('HR')}
          className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
            selectedRole === 'HR'
              ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          HR Recruiter
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* First Name and Last Name */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">First Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="John"
                {...register('firstName', { required: 'First name is required' })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors text-sm"
              />
            </div>
            {errors.firstName && (
              <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> {errors.firstName.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Last Name</label>
            <input
              type="text"
              placeholder="Doe"
              {...register('lastName', { required: 'Last name is required' })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors text-sm"
            />
            {errors.lastName && (
              <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Mail className="w-4 h-4" />
            </span>
            <input
              type="email"
              placeholder="name@company.com"
              {...register('email', { 
                required: 'Email address is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
              })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors text-sm"
            />
          </div>
          {errors.email && (
            <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Password</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Lock className="w-4 h-4" />
            </span>
            <input
              type="password"
              placeholder="Minimum 6 characters"
              {...register('password', { 
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' }
              })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors text-sm"
            />
          </div>
          {errors.password && (
            <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> {errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" variant="primary" className="w-full py-2.5 font-semibold text-sm" disabled={loading}>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Creating Account...
            </span>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      <div className="text-center text-xs text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-500 dark:text-blue-400 font-semibold hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
