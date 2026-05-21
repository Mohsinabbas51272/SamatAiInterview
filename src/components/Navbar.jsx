import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Cpu, Sun, Moon, LayoutDashboard, UserCheck } from 'lucide-react';
import { Button } from './UI/Button';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false); // visual only
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/#features' },
    { name: 'Candidate Room', path: '/candidate/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'HR Admin Portal', path: '/admin/dashboard', icon: <UserCheck className="w-4 h-4" /> }
  ];

  const isActive = (path) => {
    if (path.startsWith('/#')) return false;
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200/60 bg-white/70 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight text-slate-800">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-md shadow-blue-500/10">
                <Cpu className="w-5 h-5 text-white animate-pulse-slow" />
              </div>
              <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Smart Interview</span>
              <span className="text-blue-600 font-semibold px-1.5 py-0.5 rounded-lg bg-blue-50 text-xs border border-blue-100">Agent</span>
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
                    className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1.5"
                  >
                    {link.icon}
                    {link.name}
                  </a>
                );
              }
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    isActive(link.path)
                      ? 'text-blue-600'
                      : 'text-slate-600 hover:text-blue-600'
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              );
            })}

            <div className="h-4 w-px bg-slate-200" />

            {/* Dark Mode toggle (Visual only) */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-50 transition-all border border-slate-100"
              title="Toggle Theme (Demo UI)"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link to="/candidate/dashboard">
              <Button variant="primary" size="sm">
                Portal Demo
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden gap-3">
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-50 border border-slate-100"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-slate-100"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                isActive(link.path)
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'
              }`}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-100">
            <Link to="/candidate/dashboard" onClick={() => setIsOpen(false)}>
              <Button className="w-full" variant="primary">
                Portal Demo
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
