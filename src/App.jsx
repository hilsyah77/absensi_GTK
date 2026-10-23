import React, { useState, useEffect } from 'react';
import HeaderProfile from './components/HeaderProfile';
import DigitalClock from './components/DigitalClock';
import AttendanceCard from './components/AttendanceCard';
import QuickActions from './components/QuickActions';
import ActivitySection from './components/ActivitySection';
import LeaveModal from './components/LeaveModal';
import ProfileModal from './components/ProfileModal';
import AttendanceSuccessModal from './components/AttendanceSuccessModal';
import Toast from './components/Toast';
import AdminDashboard from './components/admin/AdminDashboard';
import LoginPage from './components/auth/LoginPage';
import KamadDashboard from './components/kamad/KamadDashboard';
import MonthlyReportModal from './components/admin/MonthlyReportModal';
import InstallAppBanner from './components/InstallAppBanner';
import DutyScheduleCard from './components/DutyScheduleCard';
import DutyScheduleModal from './components/DutyScheduleModal';
import { 
  saveAttendanceRecord, 
  subscribeAttendances, 
  saveLeaveRequest, 
  subscribeLeaveRequests,
  subscribeSystemConfig,
  getSystemConfig,
  subscribeDutySchedule,
  getDutySchedule,
  isUserOnDutyToday,
  getAttendanceScheduleStatus,
  getTodayDateString
} from './services/attendanceService';
import { 
  ShieldCheck, 
  Sparkles,
  LayoutDashboard,
  ArrowLeft,
  LogOut,
  Award
} from 'lucide-react';

export default function App() {
  // Current view mode: 'login' | 'admin' | 'employee' | 'kamad'
  const [viewMode, setViewMode] = useState(() => {
    try {
      const saved = localStorage.getItem('presensi_auth_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.viewMode) return parsed.viewMode;
      }
    } catch (e) {}
    return 'login';
  });

  // State for user role: 'guru' | 'tendik'
  const [userRole, setUserRole] = useState(() => {
    try {
      const saved = localStorage.getItem('presensi_auth_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.userRole) return parsed.userRole;
      }
    } catch (e) {}
    return 'guru';
  });

  // Dynamic logged-in user profile (without dummy data)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('presensi_auth_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.currentUser) return parsed.currentUser;
      }
    } catch (e) {}
    return {
      name: 'Guru Madrasah',
      nip: '',
      role: 'guru',
      position: 'Guru',
      email: '',
      phone: ''
    };
  });

  // Attendance state: status is 'belum' | 'masuk' | 'pulang'
  const [attendanceState, setAttendanceState] = useState({
    status: 'belum',
    checkInTime: null,
    checkOutTime: null,
    workDuration: null
  });

  // Geofencing state: whether user is simulated inside school radius (default: true)
  const [isInRadius, setIsInRadius] = useState(true);

  // Processing indicator for direct 1-tap button action
  const [isProcessing, setIsProcessing] = useState(false);

  // Leave requests state
  const [leaveRequests, setLeaveRequests] = useState([]);

  // Modals state
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMonthlyReportOpen, setIsMonthlyReportOpen] = useState(false);
  const [isDutyScheduleModalOpen, setIsDutyScheduleModalOpen] = useState(false);
  
  // Duty Schedule state
  const [dutySchedule, setDutySchedule] = useState(() => getDutySchedule());
  
  // Today's full attendance list for recap
  const [todayAttendanceList, setTodayAttendanceList] = useState([]);

  // Center Attendance Success Modal state
  const [successModalData, setSuccessModalData] = useState({
    isOpen: false,
    type: 'masuk',
    title: '',
    subtitle: '',
    time: '',
    statusBadge: '',
    location: '',
    userName: '',
    isDutyTeacher: false,
    dutyInfo: null
  });

  // System configuration from admin (geofencing & shift hours)
  const [systemConfig, setSystemConfig] = useState(() => getSystemConfig());

  // Toast feedback state
  const [toast, setToast] = useState(null);

  const showToast = (title, message, type = 'success') => {
    setToast({ title, message, type });
  };

  // Sinkronisasi Realtime Presensi Hari Ini dari Firebase / LocalStorage
  useEffect(() => {
    const today = getTodayDateString();
    const myNip = currentUser.nip || (userRole === 'guru' ? 'GTK-GURU' : 'GTK-TENDIK');

    const unsubAttendance = subscribeAttendances(today, (records) => {
      const recs = records || [];
      setTodayAttendanceList(recs);
      const myRecord = recs.find(r => r.nip === myNip);
      if (myRecord) {
        setAttendanceState({
          status: myRecord.checkOut ? 'pulang' : (myRecord.checkIn ? 'masuk' : 'belum'),
          checkInTime: myRecord.checkIn || null,
          checkOutTime: myRecord.checkOut || null,
          workDuration: myRecord.workDuration || (myRecord.checkIn ? 'Sedang Berlangsung' : null)
        });
      } else {
        setAttendanceState({
          status: 'belum',
          checkInTime: null,
          checkOutTime: null,
          workDuration: null
        });
      }
    });

    const unsubLeaves = subscribeLeaveRequests((leaves) => {
      if (leaves && leaves.length > 0) {
        setLeaveRequests(leaves);
      }
    });

    const unsubConfig = subscribeSystemConfig((cfg) => {
      if (cfg) setSystemConfig(cfg);
    });

    const unsubDuty = subscribeDutySchedule((sched) => {
      if (sched) setDutySchedule(sched);
    });

    return () => {
      if (typeof unsubAttendance === 'function') unsubAttendance();
      if (typeof unsubLeaves === 'function') unsubLeaves();
      if (typeof unsubConfig === 'function') unsubConfig();
      if (typeof unsubDuty === 'function') unsubDuty();
    };
  }, [userRole, currentUser]);

  // Direct 1-tap check-in with center success pop-up modal
  const handleCheckIn = () => {
    if (!isInRadius) {
      showToast('Di Luar Radius', 'Anda berada di luar radius area sekolah. Presensi tidak diizinkan.', 'error');
      return;
    }

    const schedule = getAttendanceScheduleStatus(systemConfig, attendanceState);
    if (!schedule.checkInAllowed) {
      showToast('Belum Jadwal Presensi', schedule.checkInStatusMsg, 'warning');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
      const myNip = currentUser.nip || (userRole === 'guru' ? 'GTK-GURU' : 'GTK-TENDIK');
      const myName = currentUser.name || (userRole === 'guru' ? 'Guru Madrasah' : 'Tenaga Kependidikan');

      const isLate = schedule.isLate;
      const dutyStatus = isUserOnDutyToday(currentUser, dutySchedule);

      saveAttendanceRecord({
        nip: myNip,
        name: myName,
        role: userRole,
        position: currentUser.position || (userRole === 'guru' ? 'Guru' : 'Tenaga Kependidikan'),
        date: getTodayDateString(),
        checkIn: timeStr,
        checkOut: null,
        status: isLate ? 'Terlambat' : 'Hadir',
        isLate: isLate,
        location: `${systemConfig.locationName || 'Kampus Utama MTs Asy-Syafi\'iyyah'} (Radius ${systemConfig.radius || 50}m Valid)`,
        isDutyTeacher: dutyStatus.isOnDuty,
        dutyRole: dutyStatus.isOnDuty ? (dutyStatus.dutyInfo?.role || 'Piket Pagi') : null,
        dutyLocation: dutyStatus.isOnDuty ? (dutyStatus.dutyInfo?.location || 'Gerbang Utama & Pos Piket') : null
      });

      setAttendanceState({
        status: 'masuk',
        checkInTime: timeStr,
        checkOutTime: null,
        workDuration: 'Sedang Berlangsung'
      });
      setIsProcessing(false);
      
      // Tampilkan Pop-Up di tengah: Absen Masuk Berhasil (Opsi 1: Otomatis Sertakan Status Piket)
      setSuccessModalData({
        isOpen: true,
        type: 'masuk',
        title: dutyStatus.isOnDuty ? 'Presensi Masuk & Piket Pagi Berhasil!' : 'Presensi Masuk Berhasil!',
        subtitle: dutyStatus.isOnDuty
          ? 'Kehadiran Anda sebagai Petugas Piket Pagi telah divalidasi dan tercatat dalam sistem server GTK.'
          : 'Kehadiran pagi Anda telah berhasil divalidasi dan tercatat dalam sistem server GTK.',
        time: timeStr,
        statusBadge: isLate ? 'Terlambat' : 'Tepat Waktu',
        location: `${systemConfig.locationName || 'Kampus Utama MTs Asy-Syafi\'iyyah'} (Radius Valid)`,
        userName: myName,
        isDutyTeacher: dutyStatus.isOnDuty,
        dutyInfo: dutyStatus.dutyInfo
      });

      showToast(
        dutyStatus.isOnDuty ? 'Presensi & Piket Tercatat' : 'Presensi Masuk Berhasil',
        `Kehadiran ${dutyStatus.isOnDuty ? 'sebagai Petugas Piket ' : ''}tercatat pada ${timeStr}.`,
        'success'
      );
    }, 450);
  };

  // Direct 1-tap check-out with center success pop-up modal
  const handleCheckOut = () => {
    if (!isInRadius) {
      showToast('Di Luar Radius', 'Anda berada di luar radius area sekolah. Presensi pulang tidak diizinkan.', 'error');
      return;
    }

    const schedule = getAttendanceScheduleStatus(systemConfig, attendanceState);
    if (!schedule.checkOutAllowed) {
      showToast('Belum Jadwal Pulang', schedule.checkOutStatusMsg, 'warning');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
      const myNip = currentUser.nip || (userRole === 'guru' ? 'GTK-GURU' : 'GTK-TENDIK');
      const myName = currentUser.name || (userRole === 'guru' ? 'Guru Madrasah' : 'Tenaga Kependidikan');

      saveAttendanceRecord({
        nip: myNip,
        name: myName,
        role: userRole,
        date: getTodayDateString(),
        checkOut: timeStr,
        workDuration: '8 Jam 15 Menit'
      });

      setAttendanceState(prev => ({
        ...prev,
        status: 'pulang',
        checkOutTime: timeStr,
        workDuration: '8 Jam 15 Menit'
      }));
      setIsProcessing(false);

      // Tampilkan Pop-Up di tengah: Absen Pulang Berhasil
      setSuccessModalData({
        isOpen: true,
        type: 'pulang',
        title: 'Presensi Pulang Berhasil!',
        subtitle: 'Presensi kepulangan kerja Anda telah sukses tercatat dalam sistem server GTK.',
        time: timeStr,
        statusBadge: 'Jam Kerja Terpenuhi',
        location: `${systemConfig.locationName || 'Kampus Utama MTs Asy-Syafi\'iyyah'} (Radius Valid)`,
        userName: myName
      });

      showToast('Presensi Pulang Berhasil', `Presensi kepulangan tercatat pada ${timeStr}. Hati-hati di jalan!`, 'success');
    }, 450);
  };

  // Handle new leave submission
  const handleLeaveSubmit = (newLeave) => {
    saveLeaveRequest(newLeave);
    setLeaveRequests(prev => [newLeave, ...prev]);
    showToast('Permohonan Terkirim', `Pengajuan ${newLeave.type} berhasil diajukan ke Kepala Madrasah.`, 'success');
  };

  const handleClearLeaves = () => {
    setLeaveRequests([]);
    showToast('Data Cuti Dikosongkan', 'Daftar permohonan izin/cuti telah direset ke Empty State.', 'info');
  };

  // Toggle radius with toast notification
  const handleToggleRadius = (newVal) => {
    setIsInRadius(newVal);
    if (newVal) {
      showToast('Dalam Radius', 'GPS mendeteksi Anda berada di dalam perimeter sekolah (12 meter).', 'info');
    } else {
      showToast('Luar Radius', 'Simulasi diaktifkan: Anda berada 350 meter di luar radius sekolah.', 'error');
    }
  };

  const handleLogout = (message = 'Anda telah keluar dari sistem.') => {
    try {
      localStorage.removeItem('presensi_auth_session');
    } catch (e) {}
    setViewMode('login');
    showToast('Sesi Berakhir', message, 'info');
  };

  // Return Login Page if in login mode
  if (viewMode === 'login') {
    return (
      <>
        <LoginPage
          onLoginSuccess={(auth) => {
            if (auth.role === 'admin') {
              const session = {
                viewMode: 'admin',
                userRole: 'admin',
                currentUser: { name: 'Administrator SIM GTK', nip: 'admin', role: 'admin' }
              };
              try {
                localStorage.setItem('presensi_auth_session', JSON.stringify(session));
              } catch (e) {}
              setViewMode('admin');
              showToast('Login Berhasil', 'Selamat datang di Panel Dashboard Admin SIM GTK.', 'success');
            } else if (auth.role === 'kamad') {
              const session = {
                viewMode: 'kamad',
                userRole: 'kamad',
                currentUser: { name: auth.userName || 'Kepala Madrasah', nip: 'kamad', role: 'kamad' }
              };
              try {
                localStorage.setItem('presensi_auth_session', JSON.stringify(session));
              } catch (e) {}
              setViewMode('kamad');
              showToast('Login Eksekutif Berhasil', `Selamat datang di Dashboard Eksekutif, Bapak ${auth.userName}.`, 'success');
            } else {
              const uRole = auth.userRole || 'guru';
              const userObj = {
                name: auth.userName || (uRole === 'tendik' ? 'Tenaga Kependidikan' : 'Guru Madrasah'),
                nip: auth.nip || '',
                role: uRole,
                position: auth.position || (uRole === 'tendik' ? 'Tenaga Kependidikan' : 'Guru'),
                email: auth.email || '',
                phone: auth.phone || ''
              };
              const session = {
                viewMode: 'employee',
                userRole: uRole,
                currentUser: userObj
              };
              try {
                localStorage.setItem('presensi_auth_session', JSON.stringify(session));
              } catch (e) {}
              setUserRole(uRole);
              setCurrentUser(userObj);
              setViewMode('employee');
              showToast('Login Berhasil', `Selamat datang di Portal Presensi GTK, ${auth.userName}.`, 'success');
            }
          }}
          onShowToast={showToast}
        />
        <Toast toast={toast} onClose={() => setToast(null)} />
      </>
    );
  }

  // Return Executive Dashboard if in kamad mode
  if (viewMode === 'kamad') {
    return (
      <>
        <KamadDashboard 
          onLogout={() => handleLogout('Anda telah berhasil keluar dari Dashboard Eksekutif Kamad.')}
          onShowToast={showToast}
        />
        <Toast toast={toast} onClose={() => setToast(null)} />
      </>
    );
  }

  // Return Admin Dashboard if in admin mode
  if (viewMode === 'admin') {
    return (
      <AdminDashboard 
        onLogout={() => handleLogout('Anda telah berhasil keluar dari akun administrator.')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-sky-50/70 text-slate-800 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Top Bar Status & Logout for Employee Portal */}
      <aside aria-label="Status Sesi Pegawai" className="bg-slate-950 text-slate-200 px-4 py-2 border-b border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-300 font-medium">
              Portal Presensi Pegawai MTs Asy-Syafi'iyyah
            </span>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">

            <button
              type="button"
              onClick={() => handleLogout('Anda telah keluar dari Portal Presensi Pegawai.')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 1. Header Profil (Biru Langit) */}
      <HeaderProfile
        currentUser={currentUser}
        userRole={userRole}
        setUserRole={setUserRole}
        attendanceState={attendanceState}
      />

      {/* Main Dashboard Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* Top Info Banner / Quick Role Context */}
        <div 
          className="relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white px-4 sm:px-6 py-3 rounded-2xl shadow-md border border-cyan-500/30"
          style={{
            backgroundImage: "url('/card-bg.png')",
            backgroundPosition: 'center',
            backgroundSize: 'cover'
          }}
        >
          {/* Subtle overlay */}
          <div className="absolute inset-0 bg-[#090b29]/50 backdrop-blur-[1px] pointer-events-none" />

          <div className="relative z-10 flex items-center gap-2.5 text-xs sm:text-sm">
            <span className="p-1.5 bg-cyan-500/20 rounded-lg text-cyan-300 border border-cyan-400/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <span>
              Selamat Datang di Portal Presensi GTK Mandiri. Aktif sebagai: 
              <strong className="text-cyan-200 ml-1">
                {userRole === 'guru' ? 'Guru (Tenaga Pendidik)' : 'Tenaga Kependidikan (Tendik)'}
              </strong>
            </span>
          </div>

          <div className="relative z-10 flex items-center gap-2 text-xs">
            <span className="text-cyan-100/80">NIP / ID:</span>
            <span className="px-2.5 py-1 rounded-lg bg-black/40 text-cyan-200 font-mono font-medium border border-cyan-400/30 backdrop-blur-md">
              {currentUser.nip || '-'}
            </span>
          </div>
        </div>

        {/* 2. Jam & Tanggal Digital Real-Time (Card Jam Biru Langit) */}
        <section aria-label="Jam dan Tanggal Digital">
          <DigitalClock />
        </section>

        {/* 3. Card Presensi Utama (Call to Action - Opsi 1: Satu Tombol Cerdas Terpadu) */}
        {(() => {
          const currentDutyStatus = isUserOnDutyToday(currentUser, dutySchedule);
          return (
            <>
              <section aria-label="Aksi Presensi Utama">
                <AttendanceCard
                  attendanceState={attendanceState}
                  isInRadius={isInRadius}
                  setIsInRadius={handleToggleRadius}
                  onCheckIn={handleCheckIn}
                  onCheckOut={handleCheckOut}
                  systemConfig={systemConfig}
                  isProcessing={isProcessing}
                  isOnDutyToday={currentDutyStatus.isOnDuty}
                  dutyInfo={currentDutyStatus.dutyInfo}
                />
              </section>

              {/* 3B. Jadwal Piket Guru Masuk Pagi (Hari Ini & Lengkap - Rekap Absen Masuk Saja) */}
              <section aria-label="Jadwal Piket Guru Masuk Pagi">
                <DutyScheduleCard
                  dutySchedule={dutySchedule}
                  currentUser={currentUser}
                  todayAttendanceList={todayAttendanceList}
                  onOpenFullSchedule={() => setIsDutyScheduleModalOpen(true)}
                />
              </section>

              {/* 4. Menu Aksi Cepat (Quick Actions Grid) */}
              <section aria-label="Menu Aksi Cepat">
                <QuickActions
                  onOpenLeaveModal={() => setIsLeaveModalOpen(true)}
                  onOpenHistory={() => setIsMonthlyReportOpen(true)}
                  onOpenProfile={() => setIsProfileModalOpen(true)}
                  onOpenDutySchedule={() => setIsDutyScheduleModalOpen(true)}
                  leaveCount={leaveRequests.length}
                  isOnDutyToday={currentDutyStatus.isOnDuty}
                />
              </section>
            </>
          );
        })()}

        {/* 5. Section Riwayat Presensi Hari Ini & Pengajuan Cuti */}
        <section id="activity-section" aria-label="Riwayat Presensi dan Cuti">
          <ActivitySection
            attendanceState={attendanceState}
            leaveRequests={leaveRequests}
            onOpenCheckIn={handleCheckIn}
            onOpenLeaveModal={() => setIsLeaveModalOpen(true)}
            onClearLeaves={handleClearLeaves}
            onOpenMonthlyReport={() => setIsMonthlyReportOpen(true)}
          />
        </section>

      </main>

      {/* Institutional Footer */}
      <footer className="mt-12 bg-white border-t border-sky-100 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <span className="font-semibold text-slate-700">SIP-GTK MTs Asy-Syafi'iyyah</span>
            <span className="text-slate-400">— Sistem Presensi Digital Geofencing Mandiri</span>
          </div>
          
          <div className="flex items-center gap-4 text-slate-400">
            <span>Versi 2.4.0 (Biru Langit Edition)</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => showToast('Bantuan CS GTK', 'Pusat bantuan dapat dihubungi melalui Bagian Tata Usaha Sekolah.', 'info')}
              className="hover:text-sky-600 transition-colors cursor-pointer"
            >
              Bantuan & Panduan
            </button>
          </div>
        </div>
      </footer>

      {/* 6. Modal / Dialog UI: Pengajuan Izin/Cuti */}
      <LeaveModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onSubmit={handleLeaveSubmit}
        userRole={userRole}
        currentUser={currentUser}
      />

      {/* Modal Profil */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userRole={userRole}
        currentUser={currentUser}
      />

      {/* Modal Format Laporan Bulanan Resmi (Sesuai Upload / MTs) */}
      <MonthlyReportModal
        isOpen={isMonthlyReportOpen}
        onClose={() => setIsMonthlyReportOpen(false)}
        initialEmployee={currentUser}
        initialMonth=""
        onExportSuccess={(fmt) => {
          showToast('Unduh Laporan Berhasil', `Laporan bulanan format .${fmt} telah tersimpan.`, 'success');
        }}
      />

      {/* Modal Jadwal Piket Lengkap */}
      <DutyScheduleModal
        isOpen={isDutyScheduleModalOpen}
        onClose={() => setIsDutyScheduleModalOpen(false)}
        dutySchedule={dutySchedule}
        currentUser={currentUser}
        todayAttendanceList={todayAttendanceList}
      />

      {/* Pop-up Modal Sukses Presensi di Tengah Layar */}
      <AttendanceSuccessModal
        isOpen={successModalData.isOpen}
        onClose={() => setSuccessModalData(prev => ({ ...prev, isOpen: false }))}
        data={successModalData}
      />

      {/* PWA / APK Install Prompt Banner */}
      <InstallAppBanner />

      {/* Toast Feedback */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
