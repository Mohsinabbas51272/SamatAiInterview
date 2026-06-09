import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { Button } from '../../components/UI/Button';
import { Mail, ArrowLeft, CheckCircle, ShieldAlert } from 'lucide-react';

export default function ForgotPassword() {
  const { addToast } = useApp();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = (data) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      addToast(`Password recovery link sent to ${data.email}!`, 'success');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold font-display text-slate-800 dark:text-white">Recover Password</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">We will send you instructions to reset your password</p>
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          <Button type="submit" variant="primary" className="w-full py-2.5 font-semibold text-sm" disabled={loading}>
            {loading ? 'Sending Recovery Link...' : 'Send Recovery Link'}
          </Button>
        </form>
      ) : (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-xl text-center space-y-3">
          <div className="flex justify-center text-emerald-500">
            <CheckCircle className="w-8 h-8" />
          </div>
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">Recovery email dispatched!</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-500">
            Check your inbox for instructions to set up your new credentials.
          </p>
        </div>
      )}

      <div className="text-center">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-blue-500 font-semibold hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
        </Link>
      </div>
    </div>
  );
}
