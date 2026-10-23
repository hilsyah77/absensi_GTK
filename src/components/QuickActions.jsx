import React from 'react';
import { 
  FileText, 
  CalendarClock, 
  UserCheck, 
  ChevronRight,
  Sunrise
} from 'lucide-react';

export default function QuickActions({
  onOpenLeaveModal,
  onOpenHistory,
  onOpenProfile,
  onOpenDutySchedule,
  leaveCount = 0,
  isOnDutyToday = false
}) {
  const actions = [
    {
      id: 'piket',
      title: 'Jadwal Piket Pagi',
      subtitle: 'Petugas piket gerbang & SOP',
      icon: Sunrise,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50 border-amber-200/60',
      badge: isOnDutyToday ? 'Piket Hari Ini' : 'Senin-Sabtu',
      badgeColor: isOnDutyToday ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700',
      onClick: onOpenDutySchedule
    },
    {
      id: 'cuti',
      title: 'Pengajuan Cuti/Izin',
      subtitle: 'Form izin sakit, dinas, cuti tahunan',
      icon: FileText,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50 border-indigo-200/60',
      badge: leaveCount > 0 ? `${leaveCount} Diajukan` : null,
      badgeColor: 'bg-indigo-100 text-indigo-700',
      onClick: onOpenLeaveModal
    },
    {
      id: 'riwayat',
      title: 'Riwayat Presensi',
      subtitle: 'Rekapitulasi hadir & jam kerja harian',
      icon: CalendarClock,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50 border-emerald-200/60',
      badge: null,
      onClick: onOpenHistory
    },
    {
      id: 'profil',
      title: 'Profil & Berkas GTK',
      subtitle: 'SK, NUPTK, data kepegawaian & tugas',
      icon: UserCheck,
      iconColor: 'text-sky-600',
      iconBg: 'bg-sky-50 border-sky-200/60',
      badge: 'Aktif',
      badgeColor: 'bg-sky-100 text-sky-700',
      onClick: onOpenProfile
    }
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <span>Menu Aksi Cepat</span>
          <span className="text-[10px] uppercase font-semibold tracking-wider text-sky-700 bg-sky-100/80 px-2 py-0.5 rounded-md border border-sky-200/60">
            Layanan GTK
          </span>
        </h3>
        <span className="text-xs text-slate-500 hidden sm:inline">
          Pintasan administrasi mandiri
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {actions.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-white border border-sky-100/90 shadow-sm hover:shadow-md hover:border-sky-300 transition-all duration-200 text-left active:scale-[0.98] cursor-pointer"
            >
              {/* Top Row: Icon & Optional Badge */}
              <div className="flex items-start justify-between w-full mb-3">
                <div className={`p-2.5 rounded-xl border ${item.iconBg} ${item.iconColor} transition-transform group-hover:scale-110 duration-200 shadow-2xs`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor} border border-black/5`}>
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Bottom Row: Text content */}
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                  {item.subtitle}
                </p>
              </div>

              {/* Micro hover indicator */}
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-400 group-hover:text-sky-600 transition-colors">
                <span>Buka</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
