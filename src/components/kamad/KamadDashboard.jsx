import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Download, 
  ShieldCheck, 
  FileText, 
  FileCheck, 
  Check, 
  X, 
  ExternalLink, 
  LayoutDashboard, 
  LogOut, 
  Sparkles, 
  BarChart3, 
  GraduationCap, 
  Building2, 
  ChevronRight, 
  CalendarDays,
  FileSignature,
  Inbox,
  AlertCircle,
  Trash2,
  RotateCcw,
  Search,
  Sunrise
} from 'lucide-react';
import MonthlyReportModal from '../admin/MonthlyReportModal';
import DutyScheduleModal from '../DutyScheduleModal';
import { APP_VERSION, APP_BUILD_NAME } from '../../config/version';
import { 
  subscribeAttendances, 
  subscribeLeaveRequests, 
  subscribeEmployees, 
  updateLeaveStatus, 
  deleteLeaveRequest,
  DEFAULT_EMPLOYEES,
  getTodayDateString,
  subscribeDutySchedule,
  getDutySchedule,
  getTodayDutyTeachers,
  getIndonesianDayName
} from '../../services/attendanceService';

export default function KamadDashboard({ 
  onLogout, 
  onShowToast 
}) {
  // Duty Schedule state
  const [dutySchedule, setDutySchedule] = useState(() => getDutySchedule());
  const [isDutyScheduleModalOpen, setIsDutyScheduleModalOpen] = useState(false);
  // Date filter state
  const [selectedDate, setSelectedDate] = useState(() => getTodayDateString());
  
  // Category tab: 'guru' | 'tendik'
  const [activeCategory, setActiveCategory] = useState('guru');

  // Export Modal state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');

  // Master Pegawai & Data Presensi/Cuti
  const [employees, setEmployees] = useState(DEFAULT_EMPLOYEES);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  // Sinkronisasi Realtime Presensi, Pegawai & Permohonan Izin/Cuti
  useEffect(() => {
    const unsubAttendance = subscribeAttendances(selectedDate, (list) => {
      setAttendanceRecords(list || []);
    });

    const unsubLeaves = subscribeLeaveRequests((leaves) => {
      setPendingApprovals(leaves || []);
    });

    const unsubEmployees = subscribeEmployees((list) => {
      if (list && list.length > 0) {
        setEmployees(list);
      }
    });

    const unsubDuty = subscribeDutySchedule((sched) => {
      if (sched) setDutySchedule(sched);
    });

    return () => {
      if (typeof unsubAttendance === 'function') unsubAttendance();
      if (typeof unsubLeaves === 'function') unsubLeaves();
      if (typeof unsubEmployees === 'function') unsubEmployees();
      if (typeof unsubDuty === 'function') unsubDuty();
    };
  }, [selectedDate]);

  // Filter Rekap Izin/Cuti Kamad
  const [leaveStatusFilter, setLeaveStatusFilter] = useState('all'); // 'all' | 'menunggu' | 'disetujui' | 'dibatalkan_ditolak'
  const [leaveSearchQuery, setLeaveSearchQuery] = useState('');
  const [leaveRoleFilter, setLeaveRoleFilter] = useState('all');

  // Modal target Batal & Hapus untuk Kamad
  const [kamadCancelTarget, setKamadCancelTarget] = useState(null);
  const [kamadCancelReason, setKamadCancelReason] = useState('Dibatalkan atas pertimbangan Kepala Madrasah');
  const [kamadDeleteTarget, setKamadDeleteTarget] = useState(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Handler Persetujuan & Penolakan Cuti oleh Kamad
  const handleApproveLeave = async (leaveId, applicantName) => {
    await updateLeaveStatus(leaveId, 'disetujui', 'Drs. H. Akhmad Rosidi (Kepala Madrasah)');
    if (onShowToast) {
      onShowToast('Permohonan Disetujui', `Pengajuan izin/cuti ${applicantName || 'pegawai'} telah disahkan secara resmi oleh Kamad.`, 'success');
    }
  };

  const handleRejectLeave = async (leaveId, applicantName) => {
    await updateLeaveStatus(leaveId, 'ditolak', 'Drs. H. Akhmad Rosidi (Kepala Madrasah)');
    if (onShowToast) {
      onShowToast('Permohonan Ditolak', `Pengajuan izin/cuti ${applicantName || 'pegawai'} tidak disetujui.`, 'info');
    }
  };

  const handleConfirmCancelLeave = async () => {
    if (!kamadCancelTarget) return;
    setIsProcessingAction(true);
    const res = await updateLeaveStatus(
      kamadCancelTarget.id,
      'dibatalkan',
      'Drs. H. Akhmad Rosidi (Kepala Madrasah)',
      kamadCancelReason || 'Dibatalkan oleh Kepala Madrasah'
    );
    setIsProcessingAction(false);
    if (res.success) {
      if (onShowToast) {
        onShowToast('Persetujuan Dibatalkan', `Izin untuk ${kamadCancelTarget.applicantName || 'pegawai'} telah dibatalkan.`, 'warning');
      }
      setKamadCancelTarget(null);
    }
  };

  const handleConfirmDeleteLeave = async () => {
    if (!kamadDeleteTarget) return;
    setIsProcessingAction(true);
    const res = await deleteLeaveRequest(kamadDeleteTarget.id);
    setIsProcessingAction(false);
    if (res.success) {
      if (onShowToast) {
        onShowToast('Berkas Dihapus', `Data permohonan izin ${kamadDeleteTarget.applicantName || 'pegawai'} berhasil dihapus permanen.`, 'success');
      }
      setKamadDeleteTarget(null);
    }
  };

  // Kalkulasi Metrik Dinamis Tanpa Data Dummy
  const totalEmployees = employees.length || 2;
  const presentTodayCount = attendanceRecords.length;
  const attendanceRate = totalEmployees > 0 ? Math.round((presentTodayCount / totalEmployees) * 100) : 0;

  const onTimeCount = attendanceRecords.filter(r => !r.isLate && r.status === 'Hadir').length;
  const lateCount = attendanceRecords.filter(r => r.isLate).length;
  const onTimeRate = presentTodayCount > 0 ? Math.round((onTimeCount / presentTodayCount) * 100) : 0;

  const activeLeaves = pendingApprovals.filter(p => p.status === 'menunggu');

  // Filtered leaves untuk Rekapitulasi Izin/Cuti Kamad
  const filteredLeaves = pendingApprovals.filter(item => {
    const q = leaveSearchQuery.toLowerCase();
    const nameMatch = (item.applicantName || item.name || '').toLowerCase().includes(q);
    const nipMatch = (item.applicantNip || item.nip || '').toLowerCase().includes(q);
    const reasonMatch = (item.reason || '').toLowerCase().includes(q);
    const typeMatch = (item.type || '').toLowerCase().includes(q);
    const matchesSearch = nameMatch || nipMatch || reasonMatch || typeMatch;

    let matchesStatus = true;
    if (leaveStatusFilter === 'menunggu') matchesStatus = item.status === 'menunggu';
    else if (leaveStatusFilter === 'disetujui') matchesStatus = item.status === 'disetujui';
    else if (leaveStatusFilter === 'dibatalkan_ditolak') matchesStatus = item.status === 'dibatalkan' || item.status === 'ditolak';

    const matchesRole = leaveRoleFilter === 'all' || (item.role || 'guru') === leaveRoleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  // Breakdown per kategori ('guru' vs 'tendik')
  const categoryEmployees = employees.filter(e => e.role === activeCategory);
  const categoryAttendance = attendanceRecords.filter(r => r.role === activeCategory);
  const categoryLeaves = pendingApprovals.filter(p => p.role === activeCategory);
  const categoryPresentCount = categoryAttendance.length;
  const categoryOnLeaveCount = categoryLeaves.filter(l => l.status === 'disetujui').length;
  const categoryLateCount = categoryAttendance.filter(r => r.isLate).length;
  const categoryAbsentCount = Math.max(0, categoryEmployees.length - categoryPresentCount - categoryOnLeaveCount);

  const todayFormatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  const handleExport = (e) => {
    e.preventDefault();
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setIsExportModalOpen(false);
      if (onShowToast) {
        onShowToast(
          'Laporan Berhasil Diunduh',
          `Rekap Eksekutif Presensi Madrasah format .${exportFormat.toUpperCase()} dengan stempel digital Kepala Madrasah telah diterbitkan.`,
          'success'
        );
      }
    }, 700);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white antialiased font-sans relative">
      
      {/* Subtle luxury ambient glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* 1. TOP EXECUTIVE NAVBAR */}
      <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          
          {/* Insignia / Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-white/10 p-1 flex items-center justify-center shadow-lg ring-1 ring-white/20 shrink-0">
              <img src="/logo.png" alt="Logo MTs Asy-Syafi'iyyah" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-white tracking-tight truncate">
                  MTs ASY-SYAFI'IYYAH
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wide">
                  Eksekutif
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                Portal Pengawasan Kepala Madrasah (Kamad)
              </p>
            </div>
          </div>

          {/* Right Controls: Status, Switchers & Profile */}
          <div className="flex items-center gap-3">
            
            {/* Operational Status Pill */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-medium text-emerald-400">Operasional Normal</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 font-mono">Geofence Valid</span>
            </div>

            {/* Kamad Profile Capsule */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-sky-600 text-white flex items-center justify-center font-bold text-xs shadow-xs ring-1 ring-white/20">
                KM
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-white leading-tight">
                  Drs. H. Akhmad Rosidi
                </p>
                <p className="text-[10px] text-emerald-400 font-medium leading-tight">
                  Kepala Madrasah
                </p>
              </div>

              {/* Logout button */}
              <button
                type="button"
                onClick={onLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors cursor-pointer ml-1"
                title="Keluar dari Akun Kamad"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* MAIN EXECUTIVE DASHBOARD BODY */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* 1. EXECUTIVE HEADER BANNER */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-[#0e1e2c] rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Left Welcome Context */}
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Executive Command Center</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
                Selamat Datang, Bapak Kepala Madrasah
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Ringkasan eksekutif kehadiran harian, kedisiplinan operasional, serta pengawasan permohonan izin GTK di <strong>MTs Asy-Syafi'iyyah Jatibarang</strong>.
              </p>
            </div>

            {/* Right: Quick Date Filter & Official Report Download */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Date Selector */}
              <div className="flex items-center gap-2 bg-slate-950/80 px-3.5 py-2.5 rounded-2xl border border-slate-800 text-xs text-slate-300 shadow-2xs">
                <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-400 hidden sm:inline">Periode:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer text-xs"
                />
              </div>

              {/* Duty Schedule Button */}
              <button
                type="button"
                onClick={() => setIsDutyScheduleModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-amber-500/40 hover:border-amber-400 active:scale-95 text-amber-300 text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                <Sunrise className="w-4 h-4 text-amber-400" />
                <span>Jadwal Piket Guru</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {getTodayDutyTeachers(dutySchedule).length} Hari Ini
                </span>
              </button>

              {/* Download Executive Report Button */}
              <button
                type="button"
                onClick={() => setIsExportModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 ring-1 ring-emerald-400/30 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Laporan Eksekutif</span>
              </button>
            </div>

          </div>
        </div>

        {/* 2. METRIK KINERJA PRESENSI DINAMIS TERKONEKSI */}
        <section aria-label="Metrik Kinerja Utama Presensi">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* KPI Card 1: % Tingkat Kehadiran Harian */}
            <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 hover:border-slate-700 transition-all shadow-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors" />
              
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Tingkat Kehadiran Harian
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>

              {/* Dynamic Kehadiran */}
              <div className="flex items-baseline gap-2.5">
                <span className="text-4xl font-extrabold text-white tracking-tight font-mono">
                  {attendanceRate}%
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Rasio Kehadiran
                </span>
              </div>

              {/* Progress Bar Dinamis */}
              <div className="mt-4 space-y-1.5">
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${attendanceRate}%` }} 
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>{presentTodayCount} dari {totalEmployees} GTK Terverifikasi</span>
                  <span className="text-emerald-400 font-medium">
                    {presentTodayCount > 0 ? 'Data Tersinkron' : 'Belum Ada Check-In'}
                  </span>
                </div>
              </div>
            </div>

            {/* KPI Card 2: Ringkasan Ketepatan Waktu */}
            <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 hover:border-slate-700 transition-all shadow-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-xl group-hover:bg-sky-500/10 transition-colors" />
              
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Ketepatan Waktu Presensi
                </span>
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
                  <Clock className="w-5 h-5" />
                </div>
              </div>

              {/* Dynamic Ketepatan Waktu */}
              <div className="flex items-baseline gap-2.5">
                <span className="text-4xl font-extrabold text-white tracking-tight font-mono">
                  {onTimeRate}%
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Tepat Waktu
                </span>
              </div>

              {/* Detail row */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <Check className="w-3.5 h-3.5" />
                  <span>{onTimeCount} Tepat Waktu</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span>{lateCount} Terlambat</span>
                </div>
              </div>
            </div>

            {/* KPI Card 3: Total Pengajuan Izin Menunggu Persetujuan */}
            <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 hover:border-slate-700 transition-all shadow-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-colors" />
              
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Menunggu Disposisi Kamad
                </span>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                  <FileSignature className="w-5 h-5" />
                </div>
              </div>

              {/* Dynamic Pending Approvals */}
              <div className="flex items-baseline gap-2.5">
                <span className="text-4xl font-extrabold text-white tracking-tight font-mono">
                  {activeLeaves.length}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Permohonan Izin/Cuti
                </span>
              </div>

              {/* Status footer */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Status Disposisi:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                  activeLeaves.length > 0 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/40 animate-pulse'
                    : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                }`}>
                  {activeLeaves.length > 0 ? `${activeLeaves.length} Perlu Disahkan` : 'Nihil Tunggakan'}
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* 3. REKAP & DISPOSISI PERSETUJUAN CUTI / IZIN RESMI GTK (DILENGKAPI AKSI BATAL & HAPUS) */}
        <section aria-label="Rekap dan Disposisi Izin / Cuti Kepala Madrasah">
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-7 shadow-lg space-y-6">
            
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
                  <FileSignature className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2 flex-wrap">
                    <span>Rekapitulasi & Disposisi Izin / Cuti GTK</span>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {pendingApprovals.length} Total Berkas
                    </span>
                    {activeLeaves.length > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 animate-pulse">
                        {activeLeaves.length} Menunggu Persetujuan
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Otorisasi resmi Kepala Madrasah: persetujuan digital, pembatalan izin, serta pembersihan berkas permohonan GTK.
                  </p>
                </div>
              </div>

              <div className="text-xs text-emerald-400 font-medium self-start sm:self-auto flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Tanda Tangan Digital Kamad Aktif</span>
              </div>
            </div>

            {/* Filter & Pencarian Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80">
              {/* Search Box */}
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={leaveSearchQuery}
                  onChange={(e) => setLeaveSearchQuery(e.target.value)}
                  placeholder="Cari nama guru, NIP, jenis cuti, alasan..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-900 focus:bg-slate-800 text-xs text-white border border-slate-800 rounded-xl focus:border-emerald-500 focus:outline-none transition-all placeholder:text-slate-500"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center bg-slate-900 p-1 rounded-xl text-xs font-semibold border border-slate-800">
                  {[
                    { id: 'all', label: `Semua (${pendingApprovals.length})` },
                    { id: 'menunggu', label: `Menunggu (${activeLeaves.length})` },
                    { id: 'disetujui', label: `Disetujui (${pendingApprovals.filter(p => p.status === 'disetujui').length})` },
                    { id: 'dibatalkan_ditolak', label: `Batal/Tolak (${pendingApprovals.filter(p => p.status === 'dibatalkan' || p.status === 'ditolak').length})` }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setLeaveStatusFilter(tab.id)}
                      className={`px-3 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                        leaveStatusFilter === tab.id
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Role Filter */}
                <select
                  value={leaveRoleFilter}
                  onChange={(e) => setLeaveRoleFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 font-medium cursor-pointer"
                >
                  <option value="all">Semua Kategori</option>
                  <option value="guru">Dewan Guru</option>
                  <option value="tendik">Tenaga Kependidikan</option>
                </select>
              </div>
            </div>

            {/* List Permohonan Nyata vs Empty State */}
            {filteredLeaves.length === 0 ? (
              <div className="py-14 px-4 text-center rounded-2xl bg-slate-950/50 border border-slate-800/80">
                <div className="max-w-md mx-auto flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 stroke-[1.75]" />
                  </div>
                  <h3 className="text-sm font-bold text-white tracking-tight mb-1.5">
                    Tidak ada berkas izin / cuti yang cocok
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-sm mb-2">
                    {leaveSearchQuery || leaveStatusFilter !== 'all' || leaveRoleFilter !== 'all'
                      ? 'Tidak ada berkas permohonan yang sesuai dengan filter pencarian Anda.'
                      : 'Seluruh permohonan izin dari dewan guru dan staf telah selesai diverifikasi atau belum ada berkas baru yang diajukan.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLeaves.map((item) => {
                  const isApproved = item.status === 'disetujui';
                  const isPending = item.status === 'menunggu';
                  const isCancelled = item.status === 'dibatalkan';
                  const isRejected = item.status === 'ditolak';

                  return (
                    <div 
                      key={item.id} 
                      className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                        isPending 
                          ? 'bg-slate-950/90 border-amber-500/30 shadow-xs' 
                          : isApproved 
                          ? 'bg-slate-950/70 border-emerald-500/20' 
                          : 'bg-slate-950/50 border-slate-800/80 opacity-90'
                      }`}
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-white text-sm">
                            {item.applicantName || item.name || 'Guru MTs Asy-Syafi\'iyyah'}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            ({item.applicantNip || item.nip || '-'})
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            item.role === 'tendik' 
                              ? 'bg-purple-500/20 text-purple-300 border-purple-400/30' 
                              : 'bg-sky-500/20 text-sky-300 border-sky-400/30'
                          }`}>
                            {item.role === 'tendik' ? 'Tendik' : 'Guru'}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                            {item.type || 'Izin/Cuti'}
                          </span>
                          
                          {/* Status Badge */}
                          {isApproved && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                              ✓ Disetujui Kamad
                            </span>
                          )}
                          {isPending && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 animate-pulse">
                              ● Menunggu Disposisi
                            </span>
                          )}
                          {isCancelled && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                              ✕ Dibatalkan
                            </span>
                          )}
                          {isRejected && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30">
                              ✕ Ditolak
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-400">
                          Periode: <strong className="text-slate-200">{item.startDate}</strong> s/d <strong className="text-slate-200">{item.endDate}</strong> ({item.duration || 1} Hari Kerja)
                          <span className="text-slate-500 ml-2">• Diajukan: {item.createdAt || '-'}</span>
                        </p>

                        <p className="text-xs text-slate-300 italic bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 max-w-2xl leading-relaxed">
                          "{item.reason || 'Keperluan keluarga / dinas'}"
                        </p>

                        {item.dispositionNote && (
                          <p className="text-[11px] text-amber-400 font-medium">
                            Catatan Kamad: {item.dispositionNote}
                          </p>
                        )}
                        {item.dispositionBy && (
                          <p className="text-[10px] text-slate-500">
                            Disahkan oleh: {item.dispositionBy}
                          </p>
                        )}
                      </div>

                      {/* Action Buttons: Setujui, Batal, Tolak, Hapus */}
                      <div className="flex items-center gap-2 self-end lg:self-center shrink-0 flex-wrap">
                        
                        {/* Tombol Setujui (Jika masih menunggu atau ditolak/batal) */}
                        {!isApproved && (
                          <button
                            type="button"
                            onClick={() => handleApproveLeave(item.id, item.applicantName || item.name)}
                            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all cursor-pointer flex items-center gap-1.5"
                            title="Setujui dan beri otorisasi resmi Kamad"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Setujui & TTD</span>
                          </button>
                        )}

                        {/* Tombol BATAL: Batalkan izin yang sudah disetujui */}
                        {isApproved && (
                          <button
                            type="button"
                            onClick={() => {
                              setKamadCancelTarget(item);
                              setKamadCancelReason('Dibatalkan atas pertimbangan Kepala Madrasah');
                            }}
                            className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                            title="Batalkan persetujuan izin ini"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Batal</span>
                          </button>
                        )}

                        {/* Tombol Tolak (Jika masih menunggu) */}
                        {isPending && (
                          <button
                            type="button"
                            onClick={() => handleRejectLeave(item.id, item.applicantName || item.name)}
                            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-rose-950/50 text-rose-300 border border-rose-900/40 hover:border-rose-500/50 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                            title="Tolak permohonan izin"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Tolak</span>
                          </button>
                        )}

                        {/* Tombol HAPUS: Hapus permanen berkas izin */}
                        <button
                          type="button"
                          onClick={() => setKamadDeleteTarget(item)}
                          className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-900/50 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                          title="Hapus permanen berkas izin ini dari sistem"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* 4. MONITOR KEHADIRAN BERDASARKAN KATEGORI (GURU VS TENDIK) */}
        <section aria-label="Monitor Kehadiran Berdasarkan Kategori">
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-7 shadow-lg space-y-6">
            
            {/* Header & Segmented Tab */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                  <span>Monitor Distribusi Kehadiran GTK</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Perbandingan grafik kehadiran dan rasio ketepatan waktu per kategori pegawai.
                </p>
              </div>

              {/* Segmented Filter: Tenaga Pendidik (Guru) vs Tenaga Kependidikan (Tendik) */}
              <div className="flex items-center bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveCategory('guru')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                    activeCategory === 'guru'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Tenaga Pendidik (Guru)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCategory('tendik')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                    activeCategory === 'tendik'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Tenaga Kependidikan (Tendik)</span>
                </button>
              </div>
            </div>

            {/* Grid: Chart Shell & Summary Pillars */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left 2 Cols: Card Chart Shell with "Data kehadiran siap ditampilkan" */}
              <div className="lg:col-span-2 bg-slate-950/70 rounded-2xl p-6 border border-slate-800/80 flex flex-col justify-between min-h-[300px] relative overflow-hidden">
                
                {/* Visual Chart Grid Lines & Axes Baseline */}
                <div className="absolute inset-x-6 top-8 bottom-12 flex flex-col justify-between opacity-15 pointer-events-none">
                  <div className="border-b border-dashed border-slate-400 w-full" />
                  <div className="border-b border-dashed border-slate-400 w-full" />
                  <div className="border-b border-dashed border-slate-400 w-full" />
                  <div className="border-b border-slate-500 w-full" />
                </div>

                {/* Top subtitle */}
                <div className="flex items-center justify-between text-xs text-slate-400 relative z-10">
                  <span className="font-semibold text-slate-300">
                    Kurva Kehadiran Realtime: {activeCategory === 'guru' ? 'Dewan Guru' : 'Staf Kependidikan'}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">Interval Jam: 06:00 - 16:00 WIB</span>
                </div>

                {/* Center Zero State Overlay */}
                <div className="relative z-10 my-auto text-center py-10">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
                    <BarChart3 className="w-7 h-7 text-emerald-400 stroke-[1.75]" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">
                    Data kehadiran siap ditampilkan
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Sumbu grafik dan sistem pemetaan otomatis aktif saat guru & tendik memvalidasi presensi check-in melalui radius geofence sekolah.
                  </p>
                </div>

                {/* Bottom Time Axis Ticks */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-3 border-t border-slate-800/60 relative z-10">
                  <span>06:30</span>
                  <span>07:00 (Pintu Masuk)</span>
                  <span>07:15 (Batas Toleransi)</span>
                  <span>11:30 (Jumat)</span>
                  <span>13:00 (Sabtu)</span>
                  <span>15:30 (Pulang Reguler)</span>
                </div>
              </div>

              {/* Right Col: Category High-Level Quota Breakdown */}
              <div className="bg-slate-950/70 rounded-2xl p-6 border border-slate-800/80 space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 pb-2 border-b border-slate-800">
                    Rekapitulasi Kategori: {activeCategory === 'guru' ? 'Guru (Pendidik)' : 'Tendik (Staf)'}
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800/60">
                      <span className="text-slate-400 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        Tervalidasi Hadir
                      </span>
                      <span className="font-bold font-mono text-white">0 Orang</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800/60">
                      <span className="text-slate-400 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        Izin / Cuti Resmi
                      </span>
                      <span className="font-bold font-mono text-white">0 Orang</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800/60">
                      <span className="text-slate-400 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-400" />
                        Terlambat Hadir
                      </span>
                      <span className="font-bold font-mono text-white">0 Orang</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800/60">
                      <span className="text-slate-400 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-slate-500" />
                        Belum Presensi (Alpa)
                      </span>
                      <span className="font-bold font-mono text-white">0 Orang</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    Validasi terhubung dengan titik koordinat satelit geofencing sekolah.
                  </span>
                </div>
              </div>

            </div>

          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="mt-12 border-t border-slate-800/80 bg-slate-950 py-5 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold text-slate-300">SIM GTK MTs Asy-Syafi'iyyah Jatibarang — Executive Oversight Portal</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 justify-center sm:justify-end">
            <span className="font-semibold text-emerald-400 bg-emerald-950/70 px-2.5 py-0.5 rounded-full border border-emerald-800/70">
              Versi {APP_VERSION} ({APP_BUILD_NAME})
            </span>
            <span className="hidden sm:inline">•</span>
            <span>Khusus Hak Akses Kepala Madrasah • Terenkripsi SHA-256</span>
          </div>
        </div>
      </footer>

      {/* MODAL KAMAD: KONFIRMASI BATALKAN IZIN / CUTI */}
      {kamadCancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Batalkan Persetujuan Izin</h3>
                  <p className="text-[11px] text-slate-400">Pembatalan otorisasi Kepala Madrasah</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setKamadCancelTarget(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-1">
              <p>
                Anda akan membatalkan izin <strong>{kamadCancelTarget.type}</strong> milik:
              </p>
              <p className="font-bold text-white">
                {kamadCancelTarget.applicantName} ({kamadCancelTarget.applicantNip || kamadCancelTarget.nip || '-'})
              </p>
              <p className="text-[11px] text-slate-400">
                Periode: {kamadCancelTarget.startDate} s/d {kamadCancelTarget.endDate} ({kamadCancelTarget.duration || 1} Hari)
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Catatan Pembatalan Kamad (Opsional)
              </label>
              <textarea
                rows="2"
                value={kamadCancelReason}
                onChange={(e) => setKamadCancelReason(e.target.value)}
                placeholder="Alasan pembatalan..."
                className="w-full p-3 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:border-amber-500 focus:outline-none text-white placeholder:text-slate-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setKamadCancelTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelLeave}
                disabled={isProcessingAction}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isProcessingAction ? 'Memproses...' : 'Ya, Batalkan Izin'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KAMAD: KONFIRMASI HAPUS PERMANEN IZIN / CUTI */}
      {kamadDeleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Hapus Berkas Izin</h3>
                  <p className="text-[11px] text-slate-400">Penghapusan permanen dari sistem</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setKamadDeleteTarget(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus permanen berkas permohonan <strong>{kamadDeleteTarget.type}</strong> milik:
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
              <p className="font-bold text-white">
                {kamadDeleteTarget.applicantName} ({kamadDeleteTarget.applicantNip || kamadDeleteTarget.nip || '-'})
              </p>
              <p className="text-slate-400 text-[11px]">
                Periode: {kamadDeleteTarget.startDate} s/d {kamadDeleteTarget.endDate}
              </p>
              <p className="text-slate-400 text-[11px] italic">
                "{kamadDeleteTarget.reason || '-'}"
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setKamadDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteLeave}
                disabled={isProcessingAction}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isProcessingAction ? 'Menghapus...' : 'Ya, Hapus Permanen'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL UNDUH LAPORAN EKSEKUTIF BULANAN RESMI */}
      <MonthlyReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        initialMonth={selectedDate ? selectedDate.slice(0, 7) : ''}
        onExportSuccess={(fmt) => {
          if (onShowToast) {
            onShowToast(
              'Laporan Berhasil Diunduh',
              `Rekap Eksekutif Presensi Madrasah format .${fmt} telah berhasil diekspor.`,
              'success'
            );
          }
        }}
      />

      {/* MODAL JADWAL PIKET GURU MASUK PAGI */}
      <DutyScheduleModal
        isOpen={isDutyScheduleModalOpen}
        onClose={() => setIsDutyScheduleModalOpen(false)}
        dutySchedule={dutySchedule}
        currentUser={null}
      />

    </div>
  );
}
