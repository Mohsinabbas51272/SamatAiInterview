import React from 'react';
import { LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

export const Sidebar = ({
  items = [],
  activeItem,
  onItemChange,
  userProfile = null,
  onLogout
}) => {
  return (
    <aside className="w-full md:w-64 border-r border-slate-200/60 bg-white flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Profile Section */}
      {userProfile && (
        <div className="p-6 border-b border-slate-100 flex flex-col items-center text-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-100 to-purple-100 border border-slate-200/50 flex items-center justify-center font-display font-bold text-xl text-blue-600 shadow-inner">
              {userProfile.avatarText || userProfile.name.charAt(0)}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
          </div>
          <h4 className="mt-3 font-semibold text-slate-800 text-sm">{userProfile.name}</h4>
          <p className="text-xs text-slate-500 mt-0.5">{userProfile.sub}</p>
          {userProfile.badge && (
            <span className="mt-2.5 inline-block text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {userProfile.badge}
            </span>
          )}
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-1">
        {items.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onItemChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group relative ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeSidebarIndicator"
                  className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-r-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className={`transition-transform duration-200 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600 group-hover:scale-105'}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout/Action Bar */}
      {onLogout && (
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50/50 hover:text-rose-700 transition-colors"
          >
            <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </aside>
  );
};
