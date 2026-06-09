import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Cpu } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 overflow-hidden transition-colors duration-300">
      {/* Decorative background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-blue-400/20 to-purple-500/0 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-purple-400/20 to-blue-500/0 blur-[120px] pointer-events-none" />
      
      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-70 pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Brand header */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20 dark:shadow-blue-500/10">
              <Cpu className="w-5 h-5 text-white animate-pulse-slow" />
            </div>
            <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">Smart Interview</span>
          </Link>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Next-Gen AI Hiring Workspace</p>
        </div>

        {/* Content Card */}
        <div className="glass border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl overflow-hidden p-8 sm:p-10 text-slate-800 dark:text-slate-100">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
