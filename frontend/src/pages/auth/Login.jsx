import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { Button } from '../../components/UI/Button';
import { Mail, Lock, ShieldAlert, Loader2 } from 'lucide-react';

export default function Login() {
  const { loginUser, getRoleRedirect } = useApp();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await loginUser(data.email, data.password);
    setLoading(false);

    if (result.success) {
      const redirectPath = getRoleRedirect(result.user.role);
      navigate(redirectPath);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold font-display text-slate-800 dark:text-white">Sign In to Your Portal</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Enter your credentials to access the platform</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Password</label>
            <Link to="/forgot-password" className="text-xs text-blue-500 dark:text-blue-400 hover:underline">Forgot password?</Link>
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Lock className="w-4 h-4" />
            </span>
            <input
              type="password"
              placeholder="••••••••"
              {...register('password', { required: 'Password is required' })}
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
              <Loader2 className="w-4 h-4 animate-spin" /> Signing In...
            </span>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      <div className="text-center text-xs text-slate-500 dark:text-slate-400">
        Don't have an account?{' '}
        <Link to="/register" className="text-blue-500 dark:text-blue-400 font-semibold hover:underline">
          Create Account
        </Link>
      </div>
    </div>
  );
}
