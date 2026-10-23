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
  todayAttendanceList = [],
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

  // Hitung jumlah guru piket yang sudah absen masuk pagi ini
  const checkedInTeachersCount = todayTeachers.filter(t => {
    const att = (todayAttendanceList || []).find(a => 
      (t.nip && a.nip && a.nip === t.nip) || 
      (t.name && a.name && a.name.trim().toLowerCase() === t.name.trim().toLowerCase())
    );
    return Boolean(att && att.checkIn);
  }).length;

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

        {/* Duty Hours & Check-in Recap Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto text-xs flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/90 border border-amber-200 text-slate-700 font-semibold shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>{startTime} - {endTime} WIB</span>
          </div>

          {todayTeachers.length > 0 && (
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold border shadow-2xs ${
              checkedInTeachersCount === todayTeachers.length
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : checkedInTeachersCount > 0
                ? 'bg-sky-50 text-sky-700 border-sky-300'
                : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{checkedInTeachersCount}/{todayTeachers.length} Masuk</span>
            </div>
          )}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {todayTeachers.map((teacher, idx) => {
              const isCurrent = (currentUser?.nip && teacher.nip && currentUser.nip === teacher.nip) ||
                (currentUser?.name && teacher.name && currentUser.name.trim().toLowerCase() === teacher.name.trim().toLowerCase());

              // Cocokkan data presensi hari ini
              const attRecord = (todayAttendanceList || []).find(a => 
                (teacher.nip && a.nip && a.nip === teacher.nip) || 
                (teacher.name && a.name && a.name.trim().toLowerCase() === teacher.name.trim().toLowerCase())
              );
              const hasCheckedIn = Boolean(attRecord && attRecord.checkIn);

              return (
                <div 
                  key={teacher.id || idx}
                  className={`flex flex-col justify-between p-3 rounded-2xl border transition-all ${
                    isCurrent 
                      ? 'bg-amber-50/95 border-amber-300 ring-2 ring-amber-400/40 shadow-xs' 
                      : 'bg-white/90 border-slate-200/90 hover:border-amber-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      isCurrent 
                        ? 'bg-amber-600 text-white shadow-xs' 
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {teacher.name ? teacher.name.slice(0, 2).toUpperCase() : 'GT'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate flex items-center gap-1">
                        <span>{teacher.name}</span>
                        {isCurrent && <span className="text-[9px] text-amber-700 font-bold bg-amber-200/80 px-1.5 py-0.2 rounded">(Anda)</span>}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {teacher.role || 'Guru Piket'} {teacher.location ? `• ${teacher.location}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Rekap Absen Masuk Saja (Tanpa Absen Pulang) */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-[11px]">
                    {hasCheckedIn ? (
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Masuk: {attRecord.checkIn}</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>Belum Absen Masuk</span>
                      </div>
                    )}

                    {hasCheckedIn && attRecord.isLate && (
                      <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                        Terlambat
                      </span>
                    )}
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
