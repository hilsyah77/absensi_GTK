import React from 'react';
import { 
  Users, 
  UserCheck, 
  Clock, 
  CalendarOff, 
  AlertTriangle,
  ArrowUpRight,
  ShieldAlert,
  Info
} from 'lucide-react';

export default function AdminSummaryCards({ stats = null, onSelectTab = null }) {
  const totalEmployees = stats?.totalEmployees ?? 0;
  const guruCount = stats?.guruCount ?? 0;
  const tendikCount = stats?.tendikCount ?? 0;
  const presentToday = stats?.presentToday ?? 0;
  const onTimeCount = stats?.onTimeCount ?? 0;
  const lateCount = stats?.lateCount ?? 0;
  const onLeave = stats?.onLeave ?? 0;
  const pendingLeave = stats?.pendingLeave ?? 0;
  const attendanceRate = stats?.attendanceRate ?? 0;

  const cards = [
    {
      id: 'total',
      title: 'Total Guru & Tendik',
      value: totalEmployees,
      unit: 'Pegawai',
      subtext: `${guruCount} Guru Aktif • ${tendikCount} Tenaga Kependidikan`,
      badge: totalEmployees > 0 ? 'Terdaftar Aktif' : 'Database Kosong',
      badgeColor: totalEmployees > 0 ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-slate-100 text-slate-600 border-slate-200',
      icon: Users,
      iconBg: 'bg-sky-50 text-sky-600 border-sky-100',
      accentColor: 'border-l-sky-500'
    },
    {
      id: 'hadir',
      title: 'Hadir Hari Ini',
      value: presentToday,
      unit: 'Tervalidasi',
      subtext: `${attendanceRate}% Rasio Kehadiran Realtime`,
      badge: `${onTimeCount} Tepat Waktu`,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      icon: UserCheck,
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      accentColor: 'border-l-emerald-500'
    },
    {
      id: 'izin',
      title: 'Izin / Cuti',
      value: onLeave,
      unit: 'Disetujui',
      subtext: `${pendingLeave} Menunggu • ${onLeave} Disetujui Kamad`,
      badge: pendingLeave > 0 ? `${pendingLeave} Perlu Disposisi` : `${onLeave} Disetujui`,
      badgeColor: pendingLeave > 0 ? 'bg-amber-50 text-amber-700 border-amber-200/80' : 'bg-slate-100 text-slate-600 border-slate-200',
      icon: CalendarOff,
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      accentColor: 'border-l-amber-500'
    },
    {
      id: 'terlambat',
      title: 'Terlambat Datang',
      value: lateCount,
      unit: 'Pegawai',
      subtext: lateCount > 0 ? `${lateCount} Pegawai Melebihi Toleransi 07:15` : 'Semua hadir tepat waktu',
      badge: lateCount > 0 ? `${lateCount} Terlambat` : 'Nihil Anomali',
      badgeColor: lateCount > 0 ? 'bg-rose-50 text-rose-700 border-rose-200/80' : 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      icon: AlertTriangle,
      iconBg: lateCount > 0 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100',
      accentColor: lateCount > 0 ? 'border-l-rose-500' : 'border-l-emerald-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            onClick={() => {
              if (onSelectTab) {
                if (card.id === 'total') onSelectTab('pegawai');
                if (card.id === 'hadir') onSelectTab('rekap');
                if (card.id === 'izin') onSelectTab('cuti');
              }
            }}
            className={`relative bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 border-l-4 ${card.accentColor} group ${onSelectTab ? 'cursor-pointer' : ''}`}
          >
            {/* Top row: Icon & Status Badge */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${card.iconBg} transition-transform group-hover:scale-105 duration-200`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${card.badgeColor}`}>
                {card.badge}
              </span>
            </div>

            {/* Title & Big Metric (0 / -) */}
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {card.title}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                  {card.value}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {card.unit}
                </span>
              </div>
            </div>

            {/* Bottom Subtext */}
            <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span className="truncate">{card.subtext}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
