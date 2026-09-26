import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onClose: () => void }> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle className="h-4 w-4 text-emerald-500" />,
    error: <AlertCircle className="h-4 w-4 text-rose-500" />,
    info: <Info className="h-4 w-4 text-blue-500" />
  };

  const bgClasses = {
    success: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/50',
    error: 'bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/50',
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900/50'
  };

  return (
    <div className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg backdrop-blur-md animate-in slide-in-from-top-4 duration-200 ${bgClasses[toast.type]}`}>
      <div className="shrink-0 pt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 text-xs font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
        {toast.text}
      </div>
      <button 
        onClick={onClose}
        className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
export default ToastContainer;
