import React from 'react';
import { 
  GraduationCap, 
  Briefcase, 
  ChevronDown, 
  Building2, 
  CheckCircle2
} from 'lucide-react';

/**
 * Header Profil Component with Uploaded Cyber Electric Blue Theme
 */
export default function HeaderProfile({
  currentUser,
  userRole,
  setUserRole,
  attendanceState
}) {
  const isGuru = userRole === 'guru';

  const displayName = currentUser?.name || (isGuru ? "Guru Madrasah" : "Tenaga Kependidikan");
  const displayNip = currentUser?.nip || "-";
  const displayPosition = currentUser?.position || (isGuru ? "Tenaga Pendidik (Guru)" : "Tata Usaha & IT");

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'GT';

  const roleData = {
    name: displayName,
    roleLabel: isGuru ? "Guru / Tenaga Pendidik" : "Tenaga Kependidikan (Tendik)",
    nip: displayNip,
    unit: "MTs Asy-Syafi'iyyah Jatibarang",
    subUnit: displayPosition,
    avatarBg: isGuru ? "from-cyan-500 via-blue-600 to-indigo-700" : "from-blue-600 via-cyan-600 to-sky-700",
    initials
  };

  const getStatusBadge = () => {
    switch (attendanceState.status) {
      case 'masuk':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/25 text-emerald-100 border border-emerald-300/40 backdrop-blur-md shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
            Sudah Masuk ({attendanceState.checkInTime})
          </span>
        );
      case 'pulang':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-900/40 text-blue-100 border border-blue-300/40 backdrop-blur-md shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-300" />
            Selesai Presensi ({attendanceState.checkOutTime})
          </span>
        );
      case 'belum':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-black/40 text-white border border-white/25 backdrop-blur-md shadow-xs">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
            Belum Presensi
          </span>
        );
    }
  };

  return (
    <header 
      className="relative text-white sticky top-0 z-30 shadow-xl border-b border-cyan-800/40 overflow-hidden"
      style={{
        backgroundImage: "url('/card-bg.png')",
        backgroundPosition: 'center',
        backgroundSize: 'cover'
      }}
    >
      {/* Dark tint overlay for pristine contrast and glowing circuit aesthetics */}
      <div className="absolute inset-0 bg-[#090b29]/55 backdrop-blur-[1px] pointer-events-none" />

      {/* Top micro institutional bar */}
      <div className="relative z-10 bg-black/45 backdrop-blur-sm text-cyan-100 text-[11px] px-4 sm:px-6 py-1.5 flex items-center justify-between border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo MTs" className="w-4 h-4 object-contain brightness-110" />
          <span className="font-semibold tracking-wide text-white">
            Presensi GTK Mandiri • MTs Asy-Syafi'iyyah
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-cyan-100/90">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block shadow-xs shadow-emerald-400"></span>
            Server Presensi Online
          </span>
          <span>•</span>
          <span>Tahun Ajaran 2026/2027</span>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* User Info Group */}
          <div className="flex items-center gap-3.5 sm:gap-4">
            {/* Avatar Placeholder with Status Ring */}
            <div className="relative group shrink-0">
              <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr ${roleData.avatarBg} text-white flex items-center justify-center font-bold text-lg sm:text-xl shadow-lg ring-2 ring-cyan-400/40 transition-transform group-hover:scale-105 duration-200`}>
                {roleData.initials}
              </div>
              <div 
                className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-slate-900 ${
                  attendanceState.status === 'belum' ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
                title={attendanceState.status === 'belum' ? 'Status: Belum Hadir' : 'Status: Hadir'}
              />
            </div>

            {/* Identity Texts */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight truncate max-w-[240px] sm:max-w-md drop-shadow-xs">
                  {roleData.name}
                </h1>
                
                {/* Role Toggle Switch Pill */}
                <button
                  type="button"
                  onClick={() => setUserRole(isGuru ? 'tendik' : 'guru')}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-cyan-400/30 bg-black/35 hover:bg-black/50 text-white backdrop-blur-md transition-all duration-200 active:scale-95 shadow-xs cursor-pointer"
                  title="Klik untuk simulasi peran Guru / Tendik"
                >
                  {isGuru ? (
                    <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
                  ) : (
                    <Briefcase className="w-3.5 h-3.5 text-cyan-300" />
                  )}
                  <span>{isGuru ? 'Guru (Pendidik)' : 'Tendik (Staff)'}</span>
                  <ChevronDown className="w-3 h-3 text-white/80" />
                </button>
              </div>

              {/* NIP & Unit info */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5 text-xs text-cyan-100/90">
                <span className="font-mono text-[11px] text-cyan-200 font-medium">NIP: {roleData.nip}</span>
                <span className="hidden sm:inline text-white/40">•</span>
                <span className="truncate max-w-[200px] sm:max-w-none text-white font-medium">
                  {roleData.subUnit}
                </span>
              </div>
            </div>
          </div>

          {/* Status Right Bar */}
          <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-cyan-200/80 hidden lg:inline">Status Hari Ini:</span>
              {getStatusBadge()}
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
