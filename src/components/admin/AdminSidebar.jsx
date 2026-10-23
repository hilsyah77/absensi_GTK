import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  CalendarOff,
  SlidersHorizontal, 
  Settings, 
  School, 
  UserCircle2, 
  ChevronRight,
  ShieldCheck,
  Building2,
  LogOut,
  X,
  Sunrise
} from 'lucide-react';

export default function AdminSidebar({
  activeMenu,
  setActiveMenu,
  onLogout,
  isMobileOpen,
  setIsMobileOpen,
  pendingLeaveCount = 0
}) {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard Utama',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'piket',
      label: 'Jadwal Piket Guru',
      sublabel: 'Piket Masuk Pagi',
      icon: Sunrise,
      badge: 'Pagi'
    },
    {
      id: 'pegawai',
      label: 'Manajemen Pegawai',
      sublabel: 'Guru & Tendik',
      icon: Users,
      badge: '0'
    },
    {
      id: 'rekap',
      label: 'Rekap Kehadiran',
      icon: CalendarCheck,
      badge: null
    },
    {
      id: 'cuti',
      label: 'Rekap Izin & Cuti',
      sublabel: 'Guru & Tendik',
      icon: CalendarOff,
      badge: pendingLeaveCount > 0 ? `${pendingLeaveCount}` : null
    },
    {
      id: 'konfigurasi',
      label: 'Konfigurasi Jam & Libur',
      icon: SlidersHorizontal,
      badge: 'Jam & Libur'
    },
    {
      id: 'pengaturan',
      label: 'Pengaturan Akun',
      icon: Settings,
      badge: null
    }
  ];

  const handleSelect = (id) => {
    setActiveMenu(id);
    if (setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-950 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header / Branding */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 p-1 flex items-center justify-center shadow-md ring-1 ring-white/20 shrink-0">
              <img src="/logo.png" alt="Logo MTs Asy-Syafi'iyyah" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>SIM GTK</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-400 border border-sky-400/30">
                  ADMIN
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 truncate max-w-[150px]">
                MTs Asy-Syafi'iyyah Jatibarang
              </p>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* System Status Pill */}
        <div className="px-5 py-3 border-b border-slate-800/50 bg-slate-900/40 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium">Server Presensi Aktif</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">v2.4-PRO</span>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Navigasi Utama
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-sky-600 text-white font-semibold shadow-md shadow-sky-600/25 ring-1 ring-sky-400/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-sky-400'
                  }`} />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-medium ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Admin Footer & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/60">

          {/* Admin User Capsule */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-950 border border-sky-500/30 flex items-center justify-center text-sky-300 font-bold text-xs">
                AD
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate max-w-[120px]">
                  Administrator
                </p>
                <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                  Super Admin GTK
                </p>
              </div>
            </div>

            <button 
              type="button"
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer" 
              title="Keluar / Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </aside>
    </>
  );
}
