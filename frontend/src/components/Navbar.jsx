import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Cpu, Sun, Moon, LayoutDashboard, UserCheck, ShieldAlert, LogOut } from 'lucide-react';
import { Button } from './UI/Button';
import { useApp } from '../store/AppContext';

export const Navbar = () => {
  const { user, role, logoutUser, isDark, toggleTheme } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const getDashboardPath = () => {
    if (role === 'admin') return '/admin/users';
    if (role === 'hr') return '/hr';
    return '/candidate';
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/#features' }
  ];

  const isActive = (path) => {
    if (path.startsWith('/#')) return false;
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200/60 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight text-slate-800 dark:text-white">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-md shadow-blue-500/10">
                <Cpu className="w-5 h-5 text-white animate-pulse-slow" />
              </div>
              <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-350 bg-clip-text text-transparent">Smart Interview</span>
              <span className="text-blue-600 dark:text-blue-400 font-semibold px-1.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-xs border border-blue-100 dark:border-blue-900/30">Agent</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              if (link.path.startsWith('/#')) {
                return (
                  <a
                    key={link.name}
                    href={link.path}
                    className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-650 transition-colors"
                  >
                    {link.name}
                  </a>
                );
              }
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-semibold transition-colors ${
                    isActive(link.path)
                      ? 'text-blue-600 dark:text-blue-450'
                      : 'text-slate-600 dark:text-slate-400 hover:text-blue-500'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {user && (
              <Link
                to={getDashboardPath()}
                className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-colors flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-4 h-4" />
                Go to Workspace
              </Link>
            )}

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

            {/* Dark Mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all border border-slate-100 dark:border-slate-800"
              title="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-500">Hi, {user.name ? user.name.split(' ')[0] : (user.email?.split('@')[0] || 'User')}</span>
                <Button variant="secondary" size="sm" onClick={logoutUser}>
                  <LogOut className="w-4 h-4 mr-1.5" /> Sign Out
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button variant="primary" size="sm">
                  Portal Demo
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-100 dark:border-slate-800"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-100 dark:border-slate-800"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
            >
              {link.name}
            </Link>
          ))}
          {user && (
            <Link
              to={getDashboardPath()}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard Workspace
            </Link>
          )}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            {user ? (
              <Button className="w-full" variant="secondary" onClick={() => { setIsOpen(false); logoutUser(); }}>
                <LogOut className="w-4 h-4 mr-1.5" /> Sign Out
              </Button>
            ) : (
              <Link to="/login" onClick={() => setIsOpen(false)}>
                <Button className="w-full" variant="primary">
                  Portal Demo
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
