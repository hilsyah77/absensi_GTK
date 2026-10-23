import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const typeConfig = {
    success: {
      bg: 'bg-emerald-950/90 text-emerald-100 border-emerald-800/80',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
      accent: 'bg-emerald-500'
    },
    error: {
      bg: 'bg-rose-950/90 text-rose-100 border-rose-800/80',
      icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
      accent: 'bg-rose-500'
    },
    info: {
      bg: 'bg-slate-900/90 text-slate-100 border-slate-700/80',
      icon: <Info className="w-5 h-5 text-indigo-400 shrink-0" />,
      accent: 'bg-indigo-500'
    }
  };

  const config = typeConfig[toast.type || 'info'];

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm sm:max-w-md w-[calc(100%-3rem)] animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className={`relative flex items-start gap-3.5 p-4 rounded-2xl shadow-xl backdrop-blur-md border ${config.bg}`}>
        <div className="pt-0.5">{config.icon}</div>
        <div className="flex-1 min-w-0 pr-2">
          {toast.title && (
            <h5 className="text-xs sm:text-sm font-semibold tracking-wide text-white">
              {toast.title}
            </h5>
          )}
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
            {toast.message}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
