import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer = () => {
  const { toasts } = useApp();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastItem = ({ toast }) => {
  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-emerald-50 border-emerald-100',
          text: 'text-emerald-800',
          icon: <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
        };
      case 'error':
        return {
          bg: 'bg-rose-50 border-rose-100',
          text: 'text-rose-800',
          icon: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50 border-blue-100',
          text: 'text-blue-800',
          icon: <Info className="w-5 h-5 text-blue-500 shrink-0" />
        };
    }
  };

  const styles = getStyles();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className={`glass-panel-heavy p-4 rounded-xl border flex items-start gap-3 shadow-lg pointer-events-auto ${styles.bg}`}
    >
      {styles.icon}
      <div className={`text-sm font-medium ${styles.text} flex-1`}>
        {toast.message}
      </div>
    </motion.div>
  );
};
