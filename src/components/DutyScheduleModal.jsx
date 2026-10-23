import React, { useState } from 'react';
import { 
  X, 
  Sunrise, 
  Clock, 
  MapPin, 
  Calendar, 
  Search, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  Phone, 
  FileText,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { 
  DUTY_DAYS, 
  getIndonesianDayName, 
  DEFAULT_DUTY_SCHEDULE 
} from '../services/attendanceService';

export default function DutyScheduleModal({
  isOpen,
  onClose,
  dutySchedule,
  currentUser,
  todayAttendanceList = []
}) {
  const todayDayName = getIndonesianDayName();
  const [selectedDay, setSelectedDay] = useState(
    DUTY_DAYS.includes(todayDayName) ? todayDayName : 'Senin'
  );
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      const today = getIndonesianDayName();
      if (DUTY_DAYS.includes(today)) {
        setSelectedDay(today);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentSchedule = dutySchedule || DEFAULT_DUTY_SCHEDULE;
  const scheduleData = currentSchedule.schedule || {};
  const startTime = currentSchedule.dutyStartTime || '06:15';
  const endTime = currentSchedule.dutyEndTime || '07:15';
  const defaultLocation = currentSchedule.defaultLocation || 'Pintu Gerbang & Lobi Utama';
  const sopNotes = currentSchedule.sopNotes || 'Menyambut siswa & GTK dengan Senyum, Salam, Sapa (5S), menertibkan kerapian seragam, dan memantau siswa masuk pagi.';

  // Teachers on selected day
  const activeDayTeachers = scheduleData[selectedDay] || [];

  // Search across all days if query exists
  const isSearching = searchQuery.trim().length > 0;
  const searchResults = isSearching 
    ? DUTY_DAYS.flatMap(day => {
        const list = scheduleData[day] || [];
        return list
          .filter(t => (t.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (t.nip || '').includes(searchQuery))
          .map(t => ({ ...t, day }));
      })
    : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div 
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/15 p-2.5 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/20">
              <Sunrise className="w-7 h-7 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-extrabold tracking-tight">
                  Jadwal Piket Guru Masuk Pagi
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full border border-white/20">
                  Senin - Sabtu
                </span>
              </div>
              <p className="text-xs text-amber-100 mt-0.5">
                Penyambutan siswa 5S, pengawasan gerbang & ketertiban pagi madrasah
              </p>
            </div>
          </div>

          {/* Quick info bar */}
          <div className="mt-4 pt-3 border-t border-white/20 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-300" />
              <span>Jam Tugas: <strong>{startTime} - {endTime} WIB</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-300" />
              <span>Lokasi Utama: <strong>{defaultLocation}</strong></span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/70">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau NIP guru untuk cek hari piket..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-slate-800"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* If Searching */}
          {isSearching ? (
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-700">
                Hasil Pencarian: "{searchQuery}" ({searchResults.length} Ditemukan)
              </p>
              {searchResults.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {searchResults.map((t, idx) => (
                    <div 
                      key={idx}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:border-amber-300 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 font-bold flex items-center justify-center text-xs shrink-0 border border-amber-200">
                          {t.name?.slice(0, 2).toUpperCase() || 'GT'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{t.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {t.role || 'Guru Piket'} • {t.location || defaultLocation}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                        Hari {t.day}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-500">
                  Tidak ditemukan jadwal piket untuk kata kunci tersebut.
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Day Tabs */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 p-1 rounded-2xl bg-slate-100">
                {DUTY_DAYS.map((day) => {
                  const isSelected = selectedDay === day;
                  const isToday = todayDayName === day;
                  const count = (scheduleData[day] || []).length;

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      className={`relative flex flex-col items-center py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-white text-amber-700 shadow-sm border border-amber-200' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        <span>{day}</span>
                        {isToday && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Hari Ini" />
                        )}
                      </span>
                      <span className={`text-[10px] mt-0.5 font-normal ${
                        isSelected ? 'text-amber-600 font-semibold' : 'text-slate-400'
                      }`}>
                        {count} Guru
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Day Header */}
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>Petugas Piket Hari {selectedDay}</span>
                    {todayDayName === selectedDay && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                        Hari Ini
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Waktu jaga: {startTime} - {endTime} WIB • Lokasi: {defaultLocation}
                  </p>
                </div>
              </div>

              {/* Teachers List on Selected Day */}
              {activeDayTeachers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeDayTeachers.map((teacher, index) => {
                    const isCurrent = (currentUser?.nip && teacher.nip && currentUser.nip === teacher.nip) ||
                      (currentUser?.name && teacher.name && currentUser.name.trim().toLowerCase() === teacher.name.trim().toLowerCase());

                    const isTodayView = selectedDay === todayDayName;
                    const attRecord = isTodayView ? (todayAttendanceList || []).find(a => 
                      (teacher.nip && a.nip && a.nip === teacher.nip) || 
                      (teacher.name && a.name && a.name.trim().toLowerCase() === teacher.name.trim().toLowerCase())
                    ) : null;
                    const hasCheckedIn = Boolean(attRecord && attRecord.checkIn);

                    return (
                      <div
                        key={teacher.id || index}
                        className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                          isCurrent 
                            ? 'bg-amber-50/90 border-amber-300 ring-1 ring-amber-400/50 shadow-xs' 
                            : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                                isCurrent 
                                  ? 'bg-amber-600 text-white' 
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}>
                                {teacher.name ? teacher.name.slice(0, 2).toUpperCase() : 'GT'}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-bold text-slate-800 truncate flex items-center gap-1.5">
                                  <span>{teacher.name}</span>
                                  {isCurrent && (
                                    <span className="text-[9px] text-amber-700 font-bold bg-amber-200/80 px-1.5 py-0.2 rounded">
                                      Anda
                                    </span>
                                  )}
                                </p>
                                {teacher.nip && (
                                  <p className="text-[10px] text-slate-400 font-mono">
                                    NIP: {teacher.nip}
                                  </p>
                                )}
                              </div>
                            </div>

                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 border ${
                              teacher.role?.toLowerCase().includes('koordinator')
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}>
                              {teacher.role || 'Guru Piket'}
                            </span>
                          </div>

                          {/* Status Absen Masuk Hari Ini (Tanpa Absen Pulang) */}
                          {isTodayView && (
                            <div className="mt-2.5 flex items-center gap-2">
                              {hasCheckedIn ? (
                                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span>Masuk: {attRecord.checkIn}</span>
                                  {attRecord.isLate && (
                                    <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1 rounded ml-1">
                                      Terlambat
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg">
                                  <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span>Belum Absen Masuk</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Location and details */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-amber-600" />
                            <span>Titik: <strong>{teacher.location || defaultLocation}</strong></span>
                          </span>
                          {teacher.phone && (
                            <a
                              href={`https://wa.me/${teacher.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 hover:underline"
                            >
                              <Phone className="w-3 h-3" />
                              <span>Hubungi</span>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center text-xs text-slate-500">
                  <Sunrise className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">Belum Ada Guru Piket untuk Hari {selectedDay}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Administrator SIM GTK dapat menambahkan daftar guru melalui menu Manajemen Jadwal Piket.
                  </p>
                </div>
              )}

              {/* SOP Info Box */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-slate-700 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <FileText className="w-4 h-4 text-amber-700" />
                  <span>SOP & Petunjuk Tugas Guru Piket Pagi</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {sopNotes}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px] text-amber-950 font-medium">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Hadir 15 menit sebelum gerbang buka</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Budaya 5S pada setiap siswa</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Catat buku piket ketertiban</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            SIM GTK • Modul Jadwal Piket Terpadu
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
