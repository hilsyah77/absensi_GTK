import React from 'react';
import { 
  Sunrise, 
  Clock, 
  MapPin, 
  Sparkles, 
  ChevronRight, 
  Users, 
  CheckCircle2, 
  ShieldAlert,
  Calendar
} from 'lucide-react';
import { 
  getIndonesianDayName, 
  getTodayDutyTeachers, 
  isUserOnDutyToday,
  formatDateIndonesian,
  getTodayDateString 
} from '../services/attendanceService';

export default function DutyScheduleCard({
  dutySchedule,
  currentUser,
  onOpenFullSchedule
}) {
  const todayDateStr = getTodayDateString();
  const dayName = getIndonesianDayName();
  const formattedToday = formatDateIndonesian(todayDateStr);
  const todayTeachers = getTodayDutyTeachers(dutySchedule);
  const { isOnDuty, dutyInfo } = isUserOnDutyToday(currentUser, dutySchedule);

  const startTime = dutySchedule?.dutyStartTime || '06:15';
  const endTime = dutySchedule?.dutyEndTime || '07:15';
  const location = dutySchedule?.defaultLocation || 'Pintu Gerbang & Lobi Utama';

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-500/10 via-sky-500/5 to-white border border-amber-200/80 shadow-xs hover:shadow-md transition-all duration-300 p-4 sm:p-5">
      {/* Decorative background glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-sky-400/15 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-amber-200/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-500/25 ring-2 ring-white">
            <Sunrise className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-800 tracking-tight">
                Piket Guru Masuk Pagi
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100/90 border border-amber-300/80 px-2 py-0.5 rounded-full">
                {dayName}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {formattedToday}
            </p>
          </div>
        </div>

        {/* Duty Hours & Location badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/90 border border-amber-200 text-slate-700 font-semibold shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>{startTime} - {endTime} WIB</span>
          </div>
        </div>
      </div>

      {/* User On Duty Special Alert (Highlighted if current teacher is on duty) */}
      {isOnDuty && (
        <div className="relative z-10 mt-3 p-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-md shadow-amber-500/20 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-white/20 shrink-0">
              <Sparkles className="w-4 h-4 text-amber-200" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">
                ⭐ Hari Ini Anda Bertugas Piket Pagi!
              </p>
              <p className="text-[11px] text-amber-100 truncate">
                {dutyInfo?.role || 'Petugas Piket'} • Titik: {dutyInfo?.location || location}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-white text-amber-700 px-2 py-1 rounded-md shrink-0 shadow-2xs">
            Siap di Lokasi
          </span>
        </div>
      )}

      {/* Today's Duty Teachers List */}
      <div className="relative z-10 mt-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-amber-600" />
            Petugas Piket Hari Ini ({todayTeachers.length} Guru)
          </span>
          <span className="text-[11px] text-slate-400 font-normal">
            Lokasi: {location}
          </span>
        </div>

        {todayTeachers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {todayTeachers.map((teacher, idx) => {
              const isCurrent = currentUser?.nip && teacher.nip && currentUser.nip === teacher.nip;
              return (
                <div 
                  key={teacher.id || idx}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all ${
                    isCurrent 
                      ? 'bg-amber-50/90 border-amber-300 ring-1 ring-amber-400/50 shadow-2xs' 
                      : 'bg-white/85 border-slate-200/80 hover:border-amber-200'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    isCurrent 
                      ? 'bg-amber-600 text-white' 
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {teacher.name ? teacher.name.slice(0, 2).toUpperCase() : 'GT'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 truncate flex items-center gap-1">
                      <span>{teacher.name}</span>
                      {isCurrent && <span className="text-[9px] text-amber-700 font-semibold bg-amber-200/80 px-1 rounded">(Anda)</span>}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {teacher.role || 'Guru Piket'} {teacher.location ? `• ${teacher.location}` : ''}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-white/70 border border-dashed border-amber-300/80 text-center text-xs text-slate-500">
            <p className="font-semibold text-slate-700">Belum Ada Guru Piket Terjadwal Hari {dayName}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Jadwal dapat diatur melalui Portal Admin SIM GTK.</p>
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="relative z-10 mt-3 pt-2.5 border-t border-amber-200/60 flex items-center justify-between">
        <p className="text-[11px] text-slate-500 italic hidden sm:block truncate max-w-sm">
          💡 Tugas: Salam 5S, ketertiban seragam, & pantau keterlambatan
        </p>
        <button
          type="button"
          onClick={onOpenFullSchedule}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-amber-700 hover:text-amber-800 border border-amber-200 font-semibold text-xs transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
        >
          <Calendar className="w-3.5 h-3.5 text-amber-600" />
          <span>Lihat Jadwal Lengkap (Senin - Sabtu)</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
