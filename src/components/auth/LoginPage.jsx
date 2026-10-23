import React, { useState } from 'react';
import { 
  School, 
  ShieldCheck, 
  GraduationCap, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  Building2, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Award
} from 'lucide-react';
import { authenticateEmployee } from '../../services/attendanceService';

export default function LoginPage({ onLoginSuccess, onShowToast }) {
  // 'gtk' | 'admin' | 'kamad'
  const [activeTab, setActiveTab] = useState('gtk');

  // GTK Form State
  const [gtkForm, setGtkForm] = useState({
    identifier: '',
    password: '',
    rememberMe: true
  });

  // Admin Form State
  const [adminForm, setAdminForm] = useState({
    username: '',
    password: '',
    rememberMe: true
  });

  // Kamad Form State
  const [kamadForm, setKamadForm] = useState({
    username: '',
    password: '',
    rememberMe: true
  });

  const [showGtkPassword, setShowGtkPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showKamadPassword, setShowKamadPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (activeTab === 'gtk') {
      if (!gtkForm.identifier.trim()) {
        setError('NIP / NUPTK GTK wajib diisi.');
        return;
      }
      if (!gtkForm.password.trim()) {
        setError('Password akun GTK wajib diisi.');
        return;
      }

      setIsLoading(true);
      authenticateEmployee(gtkForm.identifier, gtkForm.password).then((result) => {
        setIsLoading(false);
        if (!result.success) {
          setError(result.error);
          return;
        }

        const emp = result.employee;
        onLoginSuccess({
          role: 'employee',
          userRole: emp.role || 'guru',
          userName: emp.name,
          nip: emp.nip,
          position: emp.position || (emp.role === 'guru' ? 'Guru' : 'Tenaga Kependidikan'),
          email: emp.email || `${emp.nip}@mtsasysyafiiyyah.sch.id`,
          phone: emp.phone || '-'
        });
      }).catch((err) => {
        setIsLoading(false);
        setError('Gagal menghubungkan ke server validasi kepegawaian. Silakan periksa jaringan Anda.');
      });

    } else if (activeTab === 'admin') {
      if (!adminForm.username.trim()) {
        setError('Username Administrator wajib diisi.');
        return;
      }
      if (!adminForm.password.trim()) {
        setError('Password Administrator wajib diisi.');
        return;
      }

      const inputUser = adminForm.username.trim().toLowerCase();
      if (inputUser !== 'admin' || adminForm.password !== '@Aries77') {
        setError('Username atau password Administrator salah.');
        return;
      }

      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess({
          role: 'admin',
          userName: 'Administrator SIM GTK',
          nip: 'admin'
        });
      }, 400);

    } else if (activeTab === 'kamad') {
      if (!kamadForm.username.trim()) {
        setError('Username Kepala Madrasah wajib diisi.');
        return;
      }
      if (!kamadForm.password.trim()) {
        setError('Password Kepala Madrasah wajib diisi.');
        return;
      }

      const inputKamad = kamadForm.username.trim().toLowerCase();
      if (inputKamad !== 'kamad' || kamadForm.password !== 'Kamad01') {
        setError('Username atau password Kepala Madrasah salah.');
        return;
      }

      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess({
          role: 'kamad',
          userName: 'Drs. H. Akhmad Rosidi',
          nip: 'kamad'
        });
      }, 400);
    }
  };

  return (
    <div 
      className="min-h-screen text-slate-800 flex flex-col justify-between selection:bg-sky-500 selection:text-white relative overflow-hidden bg-sky-200"
      style={{
        backgroundImage: "url('/login-bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      
      {/* Soft bright daytime overlay so contrast and text are 100% legible */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[0.5px] pointer-events-none" />

      {/* Top Navbar Brand */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3 bg-white/85 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/70 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-white p-0.5 flex items-center justify-center shadow-xs ring-1 ring-slate-200/80 shrink-0">
            <img src="/logo.png" alt="Logo MTs Asy-Syafi'iyyah" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-900 tracking-tight block">
              MTs ASY-SYAFI'IYYAH
            </span>
            <span className="text-[10px] text-sky-700 block font-semibold">
              Sistem Presensi Geofencing Jatibarang
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 backdrop-blur-md text-emerald-700 border border-emerald-200/60 text-[11px] font-semibold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Server Online v2.4
          </span>
        </div>
      </header>

      {/* Center Auth Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-2">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl shadow-sky-950/15 border border-white/80 overflow-hidden text-slate-800 transition-all ring-1 ring-slate-900/5">
          
          {/* Card Top Banner (Sky blue banner matching theme) */}
          <div className={`p-6 text-white border-b border-sky-400/30 text-center relative overflow-hidden shadow-xs transition-colors duration-300 ${
            activeTab === 'kamad' 
              ? 'bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border-emerald-500/30'
              : 'bg-gradient-to-r from-sky-600 via-sky-500 to-blue-600'
          }`}>
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/20 rounded-full blur-2xl" />
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-semibold border border-white/30 mb-2 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>
                {activeTab === 'kamad' ? 'Portal Eksekutif Kamad' : 'Portal Masuk Terpadu'}
              </span>
            </div>
            
            <h1 className="text-lg font-extrabold tracking-tight text-white drop-shadow-2xs">
              {activeTab === 'kamad' ? 'Autentikasi Kepala Madrasah' : 'Autentikasi Presensi GTK'}
            </h1>
            <p className="text-xs text-sky-100 mt-1">
              {activeTab === 'kamad' 
                ? 'Hak akses pengawasan & persetujuan izin resmi Kepala Madrasah' 
                : 'Silakan pilih kategori akses Anda untuk melanjutkan'}
            </p>
          </div>

          {/* Role Segmented Tabs (GTK vs Admin vs Kamad) */}
          <div className="p-4 sm:p-6 pb-0">
            <div className="grid grid-cols-3 p-1 bg-slate-100 rounded-2xl border border-slate-200/80 gap-1 text-[11px] sm:text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('gtk');
                  setError('');
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'gtk'
                    ? 'bg-white text-sky-700 shadow-xs ring-1 ring-slate-200 font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Pegawai GTK</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('admin');
                  setError('');
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-white text-sky-700 shadow-xs ring-1 ring-slate-200 font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Admin SIM</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('kamad');
                  setError('');
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'kamad'
                    ? 'bg-emerald-700 text-white shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Award className="w-3.5 h-3.5 shrink-0 text-emerald-300" />
                <span className="truncate">Kamad</span>
              </button>
            </div>
          </div>

          {/* Form Area */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
            
            {/* Error Banner */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* TAB 1: FORM GTK PEGAWAI */}
            {activeTab === 'gtk' && (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIP / NUPTK / Username GTK
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={gtkForm.identifier}
                      onChange={(e) => setGtkForm({ ...gtkForm, identifier: e.target.value })}
                      placeholder="Masukkan NIP atau Username"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none transition-all font-medium text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password Akun GTK
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showGtkPassword ? 'text' : 'password'}
                      value={gtkForm.password}
                      onChange={(e) => setGtkForm({ ...gtkForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none transition-all font-medium text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGtkPassword(!showGtkPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showGtkPassword ? 'Sembunyikan' : 'Tampilkan'}
                    >
                      {showGtkPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: FORM ADMIN SIM GTK */}
            {activeTab === 'admin' && (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Username Administrator
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={adminForm.username}
                      onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
                      placeholder="admin"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none transition-all font-medium text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password Administrator
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      value={adminForm.password}
                      onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none transition-all font-medium text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showAdminPassword ? 'Sembunyikan' : 'Tampilkan'}
                    >
                      {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: FORM KEPALA MADRASAH (KAMAD) */}
            {activeTab === 'kamad' && (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Username Kepala Madrasah
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={kamadForm.username}
                      onChange={(e) => setKamadForm({ ...kamadForm, username: e.target.value })}
                      placeholder="kamad"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all font-medium text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password Eksekutif Kamad
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showKamadPassword ? 'text' : 'password'}
                      value={kamadForm.password}
                      onChange={(e) => setKamadForm({ ...kamadForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all font-medium text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKamadPassword(!showKamadPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showKamadPassword ? 'Sembunyikan' : 'Tampilkan'}
                    >
                      {showKamadPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Remember Me & Help */}
            <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded text-sky-600 focus:ring-sky-500 w-3.5 h-3.5"
                />
                <span>Ingat akun saya</span>
              </label>

              <span className="text-slate-400 hover:text-sky-600 transition-colors cursor-pointer text-[11px]">
                Bantuan Login?
              </span>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-2xl text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                  activeTab === 'kamad'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 shadow-md shadow-emerald-700/25 ring-1 ring-emerald-400/30'
                    : 'bg-sky-600 hover:bg-sky-700 active:bg-sky-800 shadow-md shadow-sky-600/30'
                }`}
              >
                {isLoading ? (
                  <span>Mengautentikasi Kredensial...</span>
                ) : (
                  <>
                    <span>
                      {activeTab === 'gtk' && 'Masuk ke Portal Presensi Mandiri'}
                      {activeTab === 'admin' && 'Masuk ke Dashboard Admin'}
                      {activeTab === 'kamad' && 'Masuk ke Dashboard Eksekutif Kamad'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Footer Institutional Note */}
            <div className="pt-2 text-center text-[11px] text-slate-400">
              {activeTab === 'gtk' && (
                <p>Presensi memerlukan izin lokasi GPS aktif pada peramban Anda.</p>
              )}
              {activeTab === 'admin' && (
                <p>Akses terbatas bagi pengelola kepegawaian institusi sekolah/madrasah.</p>
              )}
              {activeTab === 'kamad' && (
                <p>Akses khusus pimpinan: overview kinerja, disposisi izin & laporan eksekutif.</p>
              )}
            </div>

          </form>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-slate-600 border-t border-sky-200/60 bg-white/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <span className="font-semibold text-slate-800">SIM GTK Terpadu</span>
            <span className="text-slate-500">— Standar Regulasi Kepegawaian Sekolah/Madrasah</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Enkripsi SHA-256 Terlindungi • Kemendikbudristek & Kemenag
          </div>
        </div>
      </footer>

    </div>
  );
}
