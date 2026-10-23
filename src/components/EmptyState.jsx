import React from 'react';
import { 
  Inbox, 
  CalendarX2, 
  FileText, 
  Clock, 
  Sparkles,
  Info
} from 'lucide-react';

/**
 * Reusable Minimalist Empty State Component with Sky Blue Styling
 */
export default function EmptyState({
  title = "Belum Ada Riwayat Aktivitas",
  description = "Aktivitas presensi atau permohonan izin Anda hari ini belum tercatat pada sistem.",
  iconType = "calendar",
  actionLabel,
  onAction,
  badgeText = "Data Kosong"
}) {
  const renderIcon = () => {
    switch (iconType) {
      case 'file':
        return <FileText className="w-8 h-8 text-sky-500 stroke-[1.5]" />;
      case 'clock':
        return <Clock className="w-8 h-8 text-sky-500 stroke-[1.5]" />;
      case 'inbox':
        return <Inbox className="w-8 h-8 text-sky-500 stroke-[1.5]" />;
      case 'calendar':
      default:
        return <CalendarX2 className="w-8 h-8 text-sky-500 stroke-[1.5]" />;
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-sky-200 bg-gradient-to-b from-sky-50/70 via-sky-50/40 to-white p-8 sm:p-10 text-center transition-all duration-300">
      
      {/* Minimalist Icon Capsule */}
      <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-sky-900/10 border border-sky-100">
        <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-sky-100 ring-2 ring-white">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
        </div>
        {renderIcon()}
      </div>

      {/* Informative Text */}
      <div className="max-w-md mx-auto">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mb-2.5 rounded-full text-[11px] font-medium bg-sky-100 text-sky-700 border border-sky-200/60">
          <Info className="w-3 h-3 text-sky-500" />
          <span>{badgeText}</span>
        </div>
        
        <h4 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
          {title}
        </h4>
        
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Optional Helper Action */}
      {actionLabel && onAction && (
        <div className="mt-5">
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-all duration-200 active:scale-95 shadow-sm shadow-sky-600/20 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-200" />
            <span>{actionLabel}</span>
          </button>
        </div>
      )}
    </div>
  );
}
