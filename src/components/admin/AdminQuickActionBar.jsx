import React from 'react';
import { 
  UserPlus, 
  FileSpreadsheet, 
  Calendar as CalendarIcon, 
  Filter, 
  RotateCcw,
  Download,
  ChevronDown
} from 'lucide-react';
import { getTodayDateString } from '../../services/attendanceService';

export default function AdminQuickActionBar({
  onAddEmployee,
  onExportReport,
  selectedDate,
  setSelectedDate,
  roleFilter,
  setRoleFilter,
  onResetFilters
}) {
  const todayStr = getTodayDateString();
  const yesterdayStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return getTodayDateString(d);
  })();

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left Side: Filter Periode Tanggal & Role Filter */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Date Picker Input */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 transition-colors">
            <CalendarIcon className="w-4 h-4 text-sky-600 shrink-0" />
            <span className="font-medium text-slate-500 hidden sm:inline">Periode:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer text-xs"
              title="Pilih tanggal rekap presensi"
            />
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center bg-slate-100/80 p-1 rounded-xl text-xs font-medium text-slate-600 border border-slate-200/50">
            <button
              type="button"
              onClick={() => setSelectedDate(todayStr)}
              className={`px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                selectedDate === todayStr 
                  ? 'bg-white text-sky-700 font-bold shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={() => setSelectedDate(yesterdayStr)}
              className={`px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                selectedDate === yesterdayStr 
                  ? 'bg-white text-sky-700 font-bold shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              Kemarin
            </button>
          </div>

          {/* Role Filter Segmented Pill */}
          <div className="flex items-center bg-slate-100/80 p-1 rounded-xl text-xs font-medium text-slate-600 border border-slate-200/50">
            {[
              { id: 'all', label: 'Semua GTK' },
              { id: 'guru', label: 'Guru' },
              { id: 'tendik', label: 'Tendik' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRoleFilter(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                  roleFilter === tab.id
                    ? 'bg-white text-sky-700 font-semibold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Reset filter button if customized */}
          {(roleFilter !== 'all') && (
            <button
              type="button"
              onClick={onResetFilters}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Reset Filter"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Side: Primary Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Ekspor Laporan (.xlsx/.pdf) Button */}
          <button
            type="button"
            onClick={onExportReport}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer group"
          >
            <Download className="w-4 h-4 text-slate-500 group-hover:text-sky-600 transition-colors" />
            <span>Ekspor Laporan</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono font-normal">
              .xlsx / .pdf
            </span>
          </button>

          {/* Tambah Pegawai Button */}
          <button
            type="button"
            onClick={onAddEmployee}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-xs font-bold shadow-sm shadow-sky-600/30 ring-1 ring-sky-500/50 hover:shadow-md transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Pegawai</span>
          </button>

        </div>

      </div>
    </div>
  );
}
