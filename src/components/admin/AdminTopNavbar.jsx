import React, { useState } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  ChevronRight, 
  ShieldCheck, 
  Calendar,
  X,
  CheckCircle2,
  SlidersHorizontal,
  Users,
  LayoutDashboard,
  Settings,
  HelpCircle
} from 'lucide-react';

export default function AdminTopNavbar({
  activeMenu,
  onToggleSidebar,
  searchQuery,
  setSearchQuery,
  onOpenNotifications,
  notificationCount = 0
}) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);

  // Mapping activeMenu to breadcrumb titles
  const menuTitles = {
    dashboard: 'Dashboard Utama',
    pegawai: 'Manajemen Pegawai (Guru & Tendik)',
    rekap: 'Rekap Kehadiran Presensi',
    cuti: 'Rekap & Manajemen Izin / Cuti GTK',
    konfigurasi: 'Konfigurasi Jam, Lokasi & Kalender Libur',
    pengaturan: 'Pengaturan Akun & Akses Admin'
  };

  const currentDateFormatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Mobile Toggle & Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
            aria-label="Buka Menu Navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center text-xs text-slate-500 font-medium">
            <span className="hover:text-slate-700 transition-colors hidden sm:inline-block text-slate-600">
              SIM GTK
            </span>
            <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-slate-400 hidden sm:inline-block shrink-0" />
            <span className="text-slate-900 font-semibold truncate bg-sky-50 text-sky-700 px-2.5 py-1 rounded-md border border-sky-100">
              {menuTitles[activeMenu] || 'Dashboard Utama'}
            </span>
          </nav>
        </div>

        {/* Center: Quick Search Bar with Ctrl+K shortcut */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className={`relative w-full transition-all duration-200 ${isSearchFocused ? 'ring-2 ring-sky-500/30' : ''}`}>
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Pencarian cepat NIP, nama guru/tendik, atau menu..."
              className="w-full pl-9 pr-16 py-1.5 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none transition-all"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none hidden lg:inline-flex items-center gap-0.5 text-[10px] font-mono font-medium text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                ⌘K
              </kbd>
            )}
          </div>
        </div>

        {/* Right: Actions, Date, Notifications, Switcher & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Real-time Date Badge */}
          <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60 font-medium">
            <Calendar className="w-3.5 h-3.5 text-sky-600" />
            <span>{currentDateFormatted}</span>
          </div>

          {/* Notification Bell with Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotificationPopup(!showNotificationPopup)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
              aria-label="Notifikasi Sistem"
              title="Notifikasi"
            >
              <Bell className="w-4 h-4" />
              {notificationCount > 0 ? (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
              ) : (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-slate-300 ring-2 ring-white" />
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {showNotificationPopup && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Pemberitahuan Sistem</span>
                  <span className="text-[10px] text-slate-500">0 Belum Dibaca</span>
                </div>
                <div className="p-4 text-center">
                  <div className="w-10 h-10 mx-auto rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-2 border border-slate-100">
                    <Bell className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-xs font-medium text-slate-700">Tidak ada notifikasi baru</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Semua sistem server dan geofence presensi berjalan normal tanpa anomali.
                  </p>
                </div>
                <div className="px-3 pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowNotificationPopup(false)}
                    className="text-[11px] text-sky-600 hover:text-sky-700 font-medium px-2 py-1 rounded-md hover:bg-sky-50 transition-colors cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-slate-200" />

          {/* Admin Profile Pill */}
          <div className="flex items-center gap-2.5 pl-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-700 text-white flex items-center justify-center font-bold text-xs shadow-xs ring-1 ring-sky-500/20">
              AD
            </div>
            <div className="hidden md:block text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800 leading-tight">Admin GTK</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Online" />
              </div>
              <span className="text-[10px] text-slate-500 block leading-tight">Super Admin</span>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
}
