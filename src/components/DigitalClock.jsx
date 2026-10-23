import React, { useState, useEffect } from 'react';
import { Calendar, Timer } from 'lucide-react';

export default function DigitalClock() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format hours, minutes, seconds with zero-padding
  const hours = String(currentTime.getHours()).padStart(2, '0');
  const minutes = String(currentTime.getMinutes()).padStart(2, '0');
  const seconds = String(currentTime.getSeconds()).padStart(2, '0');

  // Format Indonesian date
  const dateOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };
  const formattedDate = currentTime.toLocaleDateString('id-ID', dateOptions);

  return (
    <div 
      className="relative overflow-hidden rounded-3xl text-white p-6 sm:p-7 shadow-2xl shadow-blue-950/25 border border-cyan-500/30"
      style={{
        backgroundImage: "url('/card-bg.png')",
        backgroundPosition: 'right center',
        backgroundSize: 'cover'
      }}
    >
      {/* Dark tint overlay for pristine contrast and glowing circuit aesthetics */}
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[1px] pointer-events-none" />

      {/* Decorative ambient cyan glow matching circuit board */}
      <div className="absolute top-0 right-0 w-56 h-56 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        
        {/* Left: Digital Clock Display & Date */}
        <div>
          {/* Header pill: Timezone & Live indicator */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-black/40 backdrop-blur-md text-cyan-200 border border-cyan-400/30 mb-3.5 shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
            </span>
            <span className="text-white font-medium">Waktu Server Presensi (WIB • GMT+7)</span>
          </div>

          {/* Authentic Digital Clock (Model Jam Digital LED Display) */}
          <div className="flex items-baseline gap-2.5 flex-wrap select-none">
            <div className="inline-flex items-center gap-1 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-black/45 backdrop-blur-md border border-cyan-500/30 shadow-inner">
              <span className="font-digital text-3xl sm:text-5xl lg:text-6xl font-black text-white digital-glow tracking-wider">
                {hours}
              </span>
              <span className="font-digital text-3xl sm:text-5xl lg:text-6xl font-bold text-amber-300 animate-pulse px-0.5">
                :
              </span>
              <span className="font-digital text-3xl sm:text-5xl lg:text-6xl font-black text-white digital-glow tracking-wider">
                {minutes}
              </span>
              <span className="font-digital text-3xl sm:text-5xl lg:text-6xl font-bold text-amber-300 animate-pulse px-0.5">
                :
              </span>
              <span className="font-digital text-3xl sm:text-5xl lg:text-6xl font-black text-white digital-glow tracking-wider">
                {seconds}
              </span>
            </div>
            
            <span className="font-digital text-xs sm:text-sm font-bold uppercase tracking-widest text-cyan-300 drop-shadow-xs self-end mb-2">
              WIB
            </span>
          </div>

          {/* Real-time date display */}
          <div className="flex items-center gap-2 mt-3 text-white/90 text-sm sm:text-base font-medium drop-shadow-xs">
            <Calendar className="w-4 h-4 text-cyan-300" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Right: Shift & Tolerance Schedule Card (Glassmorphic) */}
        <div className="bg-[#0b1038]/70 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-cyan-400/30 shadow-xl flex flex-col justify-center min-w-[260px]">
          <div className="flex items-center justify-between text-xs text-cyan-200 pb-2.5 border-b border-cyan-400/20">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5 text-white">
              <Timer className="w-3.5 h-3.5 text-cyan-300" />
              Jadwal Shift Reguler
            </span>
            <span className="px-2 py-0.5 rounded-md bg-cyan-500/25 text-cyan-200 text-[10px] font-semibold border border-cyan-400/40">
              Senin - Jumat
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3.5 mt-3">
            <div>
              <p className="text-[11px] text-cyan-100/70 uppercase font-medium">Jam Masuk</p>
              <p className="text-sm sm:text-base font-bold text-white font-digital mt-0.5">06:45 WIB</p>
              <p className="text-[10px] text-emerald-300 mt-0.5 font-medium">Toleransi s/d 07:15</p>
            </div>
            <div>
              <p className="text-[11px] text-cyan-100/70 uppercase font-medium">Jam Pulang</p>
              <p className="text-sm sm:text-base font-bold text-white font-digital mt-0.5">15:30 WIB</p>
              <p className="text-[10px] text-cyan-200 mt-0.5">Minimal 8 Jam Kerja</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
