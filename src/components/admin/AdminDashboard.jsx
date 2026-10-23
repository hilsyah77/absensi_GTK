import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminTopNavbar from './AdminTopNavbar';
import AdminSummaryCards from './AdminSummaryCards';
import AdminQuickActionBar from './AdminQuickActionBar';
import AdminAttendanceTable from './AdminAttendanceTable';
import AdminConfigSection from './AdminConfigSection';
import AdminEmployeesView from './AdminEmployeesView';
import AdminAccountSettings from './AdminAccountSettings';
import AdminLeaveManagement from './AdminLeaveManagement';
import AddEmployeeModal from './AddEmployeeModal';
import UploadEmployeesModal from './UploadEmployeesModal';
import ExportModal from './ExportModal';
import Toast from '../Toast';
import { 
  subscribeAttendances, 
  subscribeEmployees, 
  subscribeLeaveRequests,
  saveEmployee,
  saveEmployeesBulk,
  deleteEmployee,
  deleteAttendanceRecord,
  getTodayDateString
} from '../../services/attendanceService';
import { 
  ShieldCheck, 
  Sparkles, 
  Building2,
  Calendar,
  Layers
} from 'lucide-react';

export default function AdminDashboard({ 
  onLogout 
}) {
  // Navigation active tab
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => getTodayDateString());
  const [roleFilter, setRoleFilter] = useState('all');

  // STRICT ZERO DUMMY DATA: Synced from Firestore / LocalStorage
  const [employees, setEmployees] = useState([]);
  const [attendanceList, setAttendanceList] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);

  // Modals state
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isUploadEmployeesOpen, setIsUploadEmployeesOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedEmployeeForReport, setSelectedEmployeeForReport] = useState(null);

  // Toast feedback state
  const [toast, setToast] = useState(null);

  const showToast = (title, message, type = 'success') => {
    setToast({ title, message, type });
  };

  // Sinkronisasi Realtime Presensi Sesuai Tanggal, Master Pegawai, dan Izin Cuti
  useEffect(() => {
    const unsubAttendance = subscribeAttendances(selectedDate, (list) => {
      setAttendanceList(list || []);
    });

    const unsubEmployees = subscribeEmployees((list) => {
      if (list && list.length > 0) {
        setEmployees(list);
      }
    });

    const unsubLeaves = subscribeLeaveRequests((list) => {
      setLeaveRequests(list || []);
    });

    return () => {
      if (typeof unsubAttendance === 'function') unsubAttendance();
      if (typeof unsubEmployees === 'function') unsubEmployees();
      if (typeof unsubLeaves === 'function') unsubLeaves();
    };
  }, [selectedDate]);

  // Handle adding employee from modal
  const handleAddEmployee = (newEmp) => {
    const created = {
      id: Date.now().toString(),
      ...newEmp,
      createdAt: new Date().toISOString()
    };
    saveEmployee(created);
    setEmployees(prev => [created, ...prev]);
    showToast('Pegawai Ditambahkan', `${created.name} (${created.role === 'guru' ? 'Guru' : 'Tendik'}) berhasil didaftarkan.`, 'success');
  };

  // Handle bulk employee upload (real data from Excel/CSV)
  const handleUploadEmployees = async (importedList) => {
    if (!importedList || importedList.length === 0) return;

    await saveEmployeesBulk(importedList);
    setEmployees(prev => {
      const map = new Map();
      prev.forEach(e => map.set(e.id || e.nip, e));
      importedList.forEach(e => map.set(e.id || e.nip, e));
      return Array.from(map.values());
    });

    showToast('Upload Berhasil', `${importedList.length} data pegawai riil berhasil disimpan ke sistem SIM GTK.`, 'success');
  };

  // Handle delete employee permanently
  const handleDeleteEmployee = async (emp) => {
    if (window.confirm(`Hapus pegawai "${emp.name}" (${emp.nip}) secara permanen dari sistem?`)) {
      const empId = emp.id || emp.nip;
      const res = await deleteEmployee(empId);
      if (res.success) {
        setEmployees(prev => prev.filter(e => e.id !== empId && e.nip !== emp.nip));
        showToast('Pegawai Dihapus', `Data pegawai ${emp.name} berhasil dihapus permanen.`, 'success');
      } else {
        showToast('Gagal Menghapus', res.error || 'Terjadi kesalahan sistem.', 'error');
      }
    }
  };

  // Handle export success
  const handleExportSuccess = (fileType) => {
    showToast('Ekspor Berhasil', `Laporan presensi periode ${selectedDate} telah diunduh dalam format .${fileType.toLowerCase()}`, 'success');
  };

  // Handle delete attendance record permanently
  const handleDeleteAttendance = async (item) => {
    if (window.confirm(`Hapus permanen rekaman presensi "${item.name}" (${item.nip})?`)) {
      const docId = item.id || `${item.nip}_${item.date}`;
      const res = await deleteAttendanceRecord(docId);
      if (res.success) {
        setAttendanceList(prev => prev.filter(a => a.id !== docId && `${a.nip}_${a.date}` !== docId));
        showToast('Presensi Terhapus', `Data presensi ${item.name} berhasil dibersihkan permanen.`, 'success');
      } else {
        showToast('Gagal Menghapus', res.error || 'Terjadi kesalahan sistem.', 'error');
      }
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setRoleFilter('all');
    setSearchQuery('');
    setSelectedDate(getTodayDateString());
    showToast('Filter Direset', 'Semua parameter filter telah dikembalikan.', 'info');
  };

  // Compute dynamic stats strictly synced with realtime database
  const totalEmployees = employees.length;
  const guruCount = employees.filter(e => e.role === 'guru').length;
  const tendikCount = employees.filter(e => e.role === 'tendik').length;
  const presentToday = attendanceList.length;
  const onTimeCount = attendanceList.filter(a => !a.isLate && a.status !== 'Terlambat').length;
  const lateCount = attendanceList.filter(a => a.isLate || a.status === 'Terlambat').length;
  const onLeave = leaveRequests.filter(l => l.status === 'disetujui').length;
  const pendingLeave = leaveRequests.filter(l => l.status === 'menunggu').length;
  const attendanceRate = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0;

  const stats = {
    totalEmployees,
    guruCount,
    tendikCount,
    presentToday,
    onTimeCount,
    lateCount,
    onLeave,
    pendingLeave,
    attendanceRate
  };

  // Filter list presensi sesuai roleFilter ('all' | 'guru' | 'tendik') dan searchQuery
  const filteredAttendance = attendanceList.filter(item => {
    if (roleFilter !== 'all' && item.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (item.name || '').toLowerCase().includes(q);
      const matchNip = (item.nip || '').toLowerCase().includes(q);
      if (!matchName && !matchNip) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased selection:bg-sky-500 selection:text-white">
      
      {/* 1. Sidebar Navigasi Desktop & Mobile Drawer */}
      <AdminSidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        onLogout={onLogout}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        pendingLeaveCount={pendingLeave}
      />

      {/* Main Content Area (Offset by Sidebar on Desktop lg:pl-72) */}
      <div className="lg:pl-72 flex flex-col flex-1 min-w-0 transition-all">
        
        {/* 2. Top Navbar */}
        <AdminTopNavbar
          activeMenu={activeMenu}
          onToggleSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          notificationCount={pendingLeave}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 sm:space-y-7">
          
          {/* Institution Welcome Banner */}
          <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-sky-950 to-blue-950 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative z-10 space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[11px] font-semibold border border-sky-400/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Panel Admin Kepegawaian GTK</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                Dashboard Presensi & Manajemen GTK
              </h1>
              <p className="text-xs text-slate-300 max-w-xl">
                MTs Asy-Syafi'iyyah Jatibarang — Monitoring kehadiran, geofencing lokasi, dan rekapitulasi data presensi realtime.
              </p>
            </div>
          </div>

          {/* TAB 1: DASHBOARD UTAMA */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-6">
              {/* 3. Summary Cards (Statistik UI Shell) */}
              <section aria-label="Statistik Presensi">
                <AdminSummaryCards stats={stats} onSelectTab={setActiveMenu} />
              </section>

              {/* 4. Quick Action Bar */}
              <section aria-label="Aksi Cepat Presensi">
                <AdminQuickActionBar
                  onAddEmployee={() => setIsAddEmployeeOpen(true)}
                  onExportReport={() => setIsExportOpen(true)}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  roleFilter={roleFilter}
                  setRoleFilter={setRoleFilter}
                  onResetFilters={handleResetFilters}
                />
              </section>

              {/* 5. Tabel Rekap Presensi Harian (With Clean Empty State) */}
              <section aria-label="Tabel Rekap Presensi Harian">
                <AdminAttendanceTable
                  attendanceList={filteredAttendance}
                  selectedDate={selectedDate}
                  onAddEmployee={() => setIsAddEmployeeOpen(true)}
                  onDeleteRecord={handleDeleteAttendance}
                  onOpenMonthlyReport={(emp) => {
                    setSelectedEmployeeForReport(emp || null);
                    setIsExportOpen(true);
                  }}
                />
              </section>

              {/* 6. Preview Tab Konfigurasi Singkat (Geofencing & Shift) */}
              <section aria-label="Konfigurasi Singkat Geofencing dan Shift">
                <AdminConfigSection onShowToast={showToast} />
              </section>
            </div>
          )}

          {/* TAB 2: MANAJEMEN PEGAWAI */}
          {activeMenu === 'pegawai' && (
            <AdminEmployeesView
              employees={employees}
              onAddEmployee={() => setIsAddEmployeeOpen(true)}
              onOpenUpload={() => setIsUploadEmployeesOpen(true)}
              onDeleteEmployee={handleDeleteEmployee}
              onOpenMonthlyReport={(emp) => {
                setSelectedEmployeeForReport(emp || null);
                setIsExportOpen(true);
              }}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              roleFilter={roleFilter}
              setRoleFilter={setRoleFilter}
            />
          )}

          {/* TAB 3: REKAP KEHADIRAN */}
          {activeMenu === 'rekap' && (
            <div className="space-y-6">
              <AdminQuickActionBar
                onAddEmployee={() => setIsAddEmployeeOpen(true)}
                onExportReport={() => {
                  setSelectedEmployeeForReport(null);
                  setIsExportOpen(true);
                }}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                roleFilter={roleFilter}
                setRoleFilter={setRoleFilter}
                onResetFilters={handleResetFilters}
              />
              <AdminAttendanceTable
                attendanceList={filteredAttendance}
                selectedDate={selectedDate}
                onAddEmployee={() => setIsAddEmployeeOpen(true)}
                onDeleteRecord={handleDeleteAttendance}
                onOpenMonthlyReport={(emp) => {
                  setSelectedEmployeeForReport(emp || null);
                  setIsExportOpen(true);
                }}
              />
            </div>
          )}

          {/* TAB 4: REKAP IZIN & CUTI GURU / TENDIK */}
          {activeMenu === 'cuti' && (
            <AdminLeaveManagement
              leaveRequests={leaveRequests}
              employees={employees}
              onShowToast={showToast}
            />
          )}

          {/* TAB 5: KONFIGURASI JAM & LOKASI */}
          {activeMenu === 'konfigurasi' && (
            <AdminConfigSection onShowToast={showToast} />
          )}

          {/* TAB 5: PENGATURAN AKUN */}
          {activeMenu === 'pengaturan' && (
            <AdminAccountSettings onShowToast={showToast} />
          )}

        </main>

        {/* Institutional Admin Footer */}
        <footer className="mt-auto border-t border-slate-200/80 bg-white py-5 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <span className="font-semibold text-slate-700">SIM GTK Admin Portal</span>
              <span>— Panel Pengawasan Kepegawaian Terpusat</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Sistem Presensi Geofencing Terverifikasi • Standar BKN & Kemendikbudristek
            </div>
          </div>
        </footer>

      </div>

      {/* Modals */}
      <AddEmployeeModal
        isOpen={isAddEmployeeOpen}
        onClose={() => setIsAddEmployeeOpen(false)}
        onAddSuccess={handleAddEmployee}
      />

      <UploadEmployeesModal
        isOpen={isUploadEmployeesOpen}
        onClose={() => setIsUploadEmployeesOpen(false)}
        onUploadSuccess={handleUploadEmployees}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => {
          setIsExportOpen(false);
          setSelectedEmployeeForReport(null);
        }}
        onExportSuccess={handleExportSuccess}
        selectedDate={selectedDate}
        initialEmployee={selectedEmployeeForReport}
        employees={employees}
      />

      {/* Toast Feedback */}
      <Toast toast={toast} onClose={() => setToast(null)} />

    </div>
  );
}
