import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle2, 
  X, 
  Clock, 
  MapPin, 
  UserCheck, 
  ShieldCheck,
  ArrowRight,
  Check,
  Sparkles
} from 'lucide-react';

export default function AttendanceSuccessModal({
  isOpen,
  onClose,
  data
}) {
  const [isDismissing, setIsDismissing] = useState(false);

  // Reset status animasi saat modal dibuka kembali
  useEffect(() => {
    if (isOpen) {
      setIsDismissing(false);
    }
  }, [isOpen]);

  // Siapkan partikel konfeti dengan posisi dan rotasi acak
  const confettiParticles = useMemo(() => {
    const colors = [
      '#10b981', '#0ea5e9', '#f59e0b', '#8b5cf6', 
      '#ec4899', '#06b6d4', '#eab308', '#3b82f6', '#14b8a6'
    ];

    return Array.from({ length: 42 }).map((_, i) => {
      const angle = (i / 42) * 360;
      const distance = 80 + Math.random() * 160;
      const tx = Math.cos((angle * Math.PI) / 180) * distance;
      const ty = Math.sin((angle * Math.PI) / 180) * distance - 60; // condong ke atas
      const rot = Math.round(Math.random() * 720 - 360) + 'deg';
      const sc = (0.6 + Math.random() * 0.7).toFixed(2);
      const color = colors[i % colors.length];
      const isCircle = i % 3 === 0;
      const isRibbon = i % 4 === 0;
      const delay = (Math.random() * 0.12).toFixed(2) + 's';
      const duration = (0.75 + Math.random() * 0.25).toFixed(2) + 's';

      return {
        id: i,
        tx: `${Math.round(tx)}px`,
        ty: `${Math.round(ty)}px`,
        rot,
        sc,
        color,
        isCircle,
        isRibbon,
        delay,
        duration
      };
    });
  }, []);

  if (!isOpen || !data) return null;

  const isMasuk = data.type === 'masuk';

  // Handler saat tombol 'Selesai & Mengerti' diklik
  const handleDismiss = () => {
    if (isDismissing) return;
    setIsDismissing(true);

    // Beri jeda animasi konfeti & efek transisi sebelum modal tertutup
    setTimeout(() => {
      onClose();
      setIsDismissing(false);
    }, 750);
  };

  return (
    <>
      {/* CSS Animation Keyframes */}
      <style>{`
        @keyframes confettiPop {
          0% {
            opacity: 1;
            transform: translate(0, 0) rotate(0deg) scale(0.3);
          }
          40% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(var(--sc));
          }
        }

        @keyframes cardPopDismiss {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          25% {
            transform: scale(1.03);
            opacity: 1;
          }
          100% {
            transform: scale(0.92) translateY(10px);
            opacity: 0;
            filter: blur(2px);
          }
        }

        @keyframes pulseGlow {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
          }
          50% {
            transform: scale(1.08);
            box-shadow: 0 0 25px 8px rgba(16, 185, 129, 0.3);
          }
        }

        .animate-card-dismiss {
          animation: cardPopDismiss 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-pulse-glow {
          animation: pulseGlow 0.6s ease-in-out infinite;
        }
      `}</style>

      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-700 ${
          isDismissing ? 'opacity-0 pointer-events-none' : 'animate-in fade-in duration-200'
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div 
          className={`relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform text-center ${
            isDismissing ? 'animate-card-dismiss pointer-events-none' : 'animate-in zoom-in-95 duration-200'
          }`}
        >
          {/* Confetti Explosion Layer when dismissing */}
          {isDismissing && (
            <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center overflow-visible">
              {confettiParticles.map((p) => (
                <div
                  key={p.id}
                  className={`absolute pointer-events-none ${
                    p.isCircle ? 'rounded-full w-2.5 h-2.5' : p.isRibbon ? 'w-1.5 h-4 rounded-xs' : 'w-2 h-2 rounded-xs'
                  }`}
                  style={{
                    backgroundColor: p.color,
                    '--tx': p.tx,
                    '--ty': p.ty,
                    '--rot': p.rot,
                    '--sc': p.sc,
                    animation: `confettiPop ${p.duration} cubic-bezier(0.25, 1, 0.5, 1) ${p.delay} forwards`
                  }}
                />
              ))}
            </div>
          )}

          {/* Top ambient banner decoration */}
          <div className={`h-28 w-full relative flex items-center justify-center overflow-hidden transition-all duration-500 ${
            isDismissing
              ? 'bg-gradient-to-br from-emerald-500 via-teal-600 to-sky-600'
              : isMasuk 
                ? 'bg-gradient-to-br from-sky-500 via-sky-600 to-blue-600' 
                : 'bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700'
          }`}>
            {/* Subtle light effects */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl" />

            {/* Close button */}
            <button
              type="button"
              onClick={handleDismiss}
              disabled={isDismissing}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer disabled:opacity-50"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Floating animated success badge */}
            <div className="relative -bottom-6">
              <div className="relative flex items-center justify-center">
                <span className={`animate-ping absolute inline-flex h-16 w-16 rounded-full opacity-40 ${
                  isDismissing ? 'bg-emerald-300' : 'bg-emerald-400'
                }`}></span>
                
                <div className={`relative w-18 h-18 rounded-3xl bg-white shadow-xl flex items-center justify-center ring-4 ring-white/40 transition-transform duration-300 ${
                  isDismissing ? 'scale-110 shadow-emerald-500/30' : ''
                }`}>
                  {isDismissing ? (
                    <Sparkles className="w-11 h-11 text-emerald-600 animate-spin" />
                  ) : (
                    <CheckCircle2 className={`w-11 h-11 ${
                      isMasuk ? 'text-emerald-600' : 'text-amber-600'
                    }`} />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Modal Body Content */}
          <div className="px-6 pt-10 pb-6 space-y-4">
            
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verifikasi Server Sukses</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight transition-colors">
                {isDismissing 
                  ? 'Data Berhasil Disimpan!' 
                  : (data.title || (isMasuk ? 'Presensi Masuk Berhasil!' : 'Presensi Pulang Berhasil!'))}
              </h3>
              
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                {isDismissing
                  ? 'Status kehadiran telah dikunci dan tersinkronisasi ke database.'
                  : (data.subtitle || 'Kehadiran Anda telah sukses divalidasi dan tercatat dalam sistem server GTK.')}
              </p>
            </div>

            {/* Digital Time & Verification Card */}
            <div className={`bg-sky-50/70 rounded-2xl p-4 border text-left space-y-3 transition-all duration-300 ${
              isDismissing ? 'border-emerald-300 bg-emerald-50/50' : 'border-sky-100'
            }`}>
              <div className="flex items-center justify-between pb-2.5 border-b border-sky-200/60">
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-sky-600" /> Waktu Presensi:
                </span>
                <span className="font-digital text-base sm:text-lg font-bold text-sky-900 tracking-wide bg-white px-2.5 py-0.5 rounded-lg border border-sky-200 shadow-2xs">
                  {data.time}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-600" /> Lokasi GPS:
                </span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 text-[11px]">
                  {data.location || 'Radius Valid (12m dari Titik)'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-sky-600" /> Status:
                </span>
                <span className="font-semibold text-slate-800 text-[11px]">
                  {data.statusBadge || (isMasuk ? 'Tepat Waktu' : 'Jam Kerja Terpenuhi')}
                </span>
              </div>

              {data.userName && (
                <div className="pt-2 border-t border-sky-200/60 text-[11px] text-slate-500 flex justify-between items-center">
                  <span>Nama GTK:</span>
                  <span className="font-semibold text-slate-700 truncate max-w-[200px]">
                    {data.userName}
                  </span>
                </div>
              )}

              {data.isDutyTeacher && (
                <div className="pt-2 border-t border-amber-200/70 text-[11px] text-amber-900 flex items-center justify-between bg-amber-100/70 -mx-4 -mb-4 p-3 rounded-b-2xl">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Tugas Piket Pagi Terverifikasi:
                  </span>
                  <span className="font-semibold text-amber-800">
                    {data.dutyInfo?.role || 'Guru Piket Pagi'}
                  </span>
                </div>
              )}
            </div>

            {/* Action Button: Selesai & Mengerti dengan Animasi Interaktif */}
            <div className="pt-2 relative">
              <button
                type="button"
                onClick={handleDismiss}
                disabled={isDismissing}
                className={`w-full py-3 px-5 rounded-2xl text-white font-bold text-sm shadow-md transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer ${
                  isDismissing
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 shadow-emerald-500/40 scale-102 ring-4 ring-emerald-300/40'
                    : isMasuk 
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-sky-600/25 hover:shadow-lg hover:shadow-sky-600/30' 
                      : 'bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600 shadow-amber-700/25 hover:shadow-lg hover:shadow-amber-700/30'
                }`}
              >
                {isDismissing ? (
                  <>
                    <Check className="w-5 h-5 text-white stroke-[3] animate-bounce" />
                    <span className="tracking-wide">Tersimpan Sempurna!</span>
                  </>
                ) : (
                  <>
                    <span>Selesai & Mengerti</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
