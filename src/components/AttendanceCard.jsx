import React, { useState, useEffect } from 'react';
import { 
  LogIn, 
  LogOut, 
  MapPin, 
  CheckCircle2, 
  AlertOctagon, 
  Compass,
  ArrowRight,
  Loader2,
  Clock,
  Lock
} from 'lucide-react';
import { 
  getAttendanceScheduleStatus, 
  getSystemConfig 
} from '../services/attendanceService';

export default function AttendanceCard({
  attendanceState,
  isInRadius,
  setIsInRadius,
  onCheckIn,
  onCheckOut,
  systemConfig,
  isProcessing = false
}) {
  // Timer evaluasi realtime jadwal (setiap 5 detik)
  const [, setTick] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setTick(Date.now()), 5000);
    return () => clearInterval(timer);
  }, []);

  const config = systemConfig || getSystemConfig();
  const schedule = getAttendanceScheduleStatus(config, attendanceState);

  const isMasuk = attendanceState.status === 'masuk';
  const isPulang = attendanceState.status === 'pulang';
  const isBelum = attendanceState.status === 'belum';

  // Validasi tombol Presensi Masuk
  const canCheckIn = isInRadius && isBelum && schedule.checkInAllowed && !isProcessing;
  
  // Validasi tombol Presensi Pulang (NONAKTIF jika belum jadwalnya)
  const canCheckOut = isInRadius && isMasuk && schedule.checkOutAllowed && !isProcessing;

  return (
    <div className="relative bg-white rounded-3xl p-6 sm:p-7 shadow-lg shadow-sky-900/5 border border-sky-100/90 text-slate-800 transition-all duration-300 hover:shadow-xl hover:shadow-sky-900/10">
      
      {/* Top Section: Title & Interactive Geofencing Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Aksi Presensi Harian
            </h2>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
              {schedule.currentDayName} • {schedule.isWorkDay ? 'Hari Kerja' : 'Hari Libur'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Presensi digital sinkron dengan jadwal shift kerja resmi madrasah.
          </p>
        </div>

        {/* Geofencing Status Badge & Simulator Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isInRadius ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold shadow-2xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span>Di dalam radius sekolah ({config.radius || 50}m)</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold shadow-2xs">
              <AlertOctagon className="w-4 h-4 text-rose-500 animate-bounce" />
              <span>Di luar radius sekolah</span>
            </div>
          )}

          {/* Interactive Simulation Switch */}
          <button
            type="button"
            onClick={() => setIsInRadius(!isInRadius)}
            className="text-[11px] px-2.5 py-1.5 rounded-xl border border-sky-200 hover:bg-sky-50 text-sky-700 transition-colors font-medium cursor-pointer"
            title="Ubah simulasi radius GPS"
          >
            Ubah Radius
          </button>
        </div>
      </div>

      {/* Geofencing Location Detail Bar */}
      <div className="my-4 p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-white rounded-lg border border-sky-200 shadow-2xs text-sky-600">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-slate-900">{config.locationName || 'Kampus Utama MTs Asy-Syafi\'iyyah'}</span>
            <span className="hidden sm:inline text-slate-300 mx-1.5">•</span>
            <span className="font-mono text-sky-800 text-[11px]">Lat: {config.latitude || '-6.2088'} • Long: {config.longitude || '106.8456'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-slate-500 text-[11px] flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            <span>Jam Buka Masuk: <strong className="text-slate-800">{schedule.checkInStart} - {schedule.checkInEnd} WIB</strong></span>
          </div>
          <span className="hidden sm:inline text-slate-300">•</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Jadwal Pulang: <strong className="text-slate-800">{schedule.checkOutTarget} WIB</strong></span>
          </div>
        </div>
      </div>

      {/* Out of radius warning notice */}
      {!isInRadius && (
        <div className="mb-5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
          <AlertOctagon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold">Peringatan Lokasi Geofencing:</span> Anda berada di luar radius area sekolah ({config.radius || 50} meter). Tombol presensi otomatis dikunci demi integritas kehadiran. Silakan mendekat ke area sekolah.
          </div>
        </div>
      )}

      {/* Main Dual Action Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
        
        {/* Tombol Presensi Masuk */}
        <div className="relative group">
          <button
            type="button"
            onClick={onCheckIn}
            disabled={!canCheckIn}
            className={`w-full relative overflow-hidden rounded-2xl p-4 sm:p-5 flex items-center justify-between text-left transition-all duration-200 ${
              canCheckIn
                ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-700/20 hover:shadow-xl hover:shadow-emerald-700/30 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer'
                : isMasuk || isPulang
                ? 'bg-emerald-50/80 border border-emerald-200 text-emerald-800 opacity-90 cursor-not-allowed'
                : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {canCheckIn && (
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            )}

            <div className="flex items-center gap-3.5">
              <div className={`p-3 rounded-xl ${
                canCheckIn 
                  ? 'bg-white/20 text-white shadow-inner' 
                  : isMasuk || isPulang 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-slate-200 text-slate-400'
              }`}>
                {isProcessing && !isMasuk ? (
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                ) : isMasuk || isPulang ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : !schedule.checkInAllowed ? (
                  <Lock className="w-6 h-6 text-slate-400" />
                ) : (
                  <LogIn className="w-6 h-6" />
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold opacity-80">
                  Aksi Pagi (Shift Masuk)
                </p>
                <h3 className="text-base sm:text-lg font-bold tracking-tight">
                  {isProcessing && !isMasuk ? 'Mencatat Kehadiran...' : 'Presensi Masuk'}
                </h3>
                <p className="text-xs mt-0.5 font-medium opacity-90">
                  {isMasuk || isPulang
                    ? `Tercatat: ${attendanceState.checkInTime}`
                    : schedule.checkInStatusMsg}
                </p>
              </div>
            </div>

            <div className="pl-2">
              {canCheckIn && (
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              )}
              {(isMasuk || isPulang) && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-200/60 text-emerald-800">
                  Selesai
                </span>
              )}
              {!canCheckIn && !isMasuk && !isPulang && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-200/80 text-slate-500">
                  Nonaktif
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Tombol Presensi Pulang (SINKRON DENGAN JADWAL ADMIN) */}
        <div className="relative group">
          <button
            type="button"
            onClick={onCheckOut}
            disabled={!canCheckOut}
            className={`w-full relative overflow-hidden rounded-2xl p-4 sm:p-5 flex items-center justify-between text-left transition-all duration-200 ${
              canCheckOut
                ? 'bg-gradient-to-r from-amber-600 to-orange-700 text-white shadow-lg shadow-amber-700/20 hover:shadow-xl hover:shadow-amber-700/30 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer'
                : isPulang
                ? 'bg-amber-50/80 border border-amber-200 text-amber-800 opacity-90 cursor-not-allowed'
                : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {canCheckOut && (
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            )}

            <div className="flex items-center gap-3.5">
              <div className={`p-3 rounded-xl ${
                canCheckOut 
                  ? 'bg-white/20 text-white shadow-inner' 
                  : isPulang 
                  ? 'bg-amber-100 text-amber-700' 
                  : 'bg-slate-200 text-slate-400'
              }`}>
                {isProcessing && isMasuk ? (
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                ) : isPulang ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : isMasuk && !schedule.checkOutAllowed ? (
                  <Clock className="w-6 h-6 text-slate-400" />
                ) : !canCheckOut ? (
                  <Lock className="w-6 h-6 text-slate-400" />
                ) : (
                  <LogOut className="w-6 h-6" />
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold opacity-80">
                  Aksi Sore (Shift Pulang)
                </p>
                <h3 className="text-base sm:text-lg font-bold tracking-tight">
                  {isProcessing && isMasuk ? 'Mencatat Kepulangan...' : 'Presensi Pulang'}
                </h3>
                <p className="text-xs mt-0.5 font-medium opacity-90">
                  {isPulang
                    ? `Tercatat: ${attendanceState.checkOutTime}`
                    : schedule.checkOutStatusMsg}
                </p>
              </div>
            </div>

            <div className="pl-2">
              {canCheckOut && (
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              )}
              {isPulang && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-200/60 text-amber-800">
                  Selesai
                </span>
              )}
              {!canCheckOut && !isPulang && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-200/80 text-slate-500">
                  Nonaktif
                </span>
              )}
            </div>
          </button>
        </div>

      </div>

      {/* Summary Footer Bar with Recorded Stats (Tanpa Tombol Reset Demo) */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <span className="text-slate-400">Jam Masuk: </span>
            <span className="font-digital font-bold text-sky-800">
              {attendanceState.checkInTime || '--:--:--'}
            </span>
          </div>
          <span className="text-slate-300">•</span>
          <div>
            <span className="text-slate-400">Jam Pulang: </span>
            <span className="font-digital font-bold text-amber-700">
              {attendanceState.checkOutTime || '--:--:--'}
            </span>
          </div>
          <span className="text-slate-300">•</span>
          <div>
            <span className="text-slate-400">Durasi Kerja: </span>
            <span className="font-semibold text-sky-700">
              {attendanceState.workDuration || (isMasuk ? 'Sedang Berlangsung' : '0 Jam 0 Menit')}
            </span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400">
          Sinkronisasi Geofencing & Jadwal Aktif
        </div>
      </div>

    </div>
  );
}
