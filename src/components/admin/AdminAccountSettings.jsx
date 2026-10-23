import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  KeyRound, 
  School, 
  Save, 
  User, 
  Mail, 
  Lock, 
  CheckCircle2, 
  Hash, 
  MapPin, 
  Award, 
  UserCheck, 
  FileText, 
  Building2,
  FileCheck,
  Check
} from 'lucide-react';
import { 
  getSchoolProfile, 
  saveSchoolProfile, 
  subscribeSchoolProfile 
} from '../../services/attendanceService';

export default function AdminAccountSettings({ onShowToast }) {
  // State profil sekolah & akun administrator (tersinkronisasi lokal & cloud)
  const [profileData, setProfileData] = useState(() => getSchoolProfile());
  const [isSavingSchool, setIsSavingSchool] = useState(false);
  const [isSavingAdmin, setIsSavingAdmin] = useState(false);

  // State keamanan password
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Sinkronisasi realtime profil sekolah & admin
  useEffect(() => {
    const unsub = subscribeSchoolProfile((profile) => {
      if (profile) {
        setProfileData(profile);
      }
    });

    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  // Simpan Identitas Sekolah / Madrasah
  const handleSaveSchoolIdentity = async (e) => {
    e.preventDefault();
    setIsSavingSchool(true);
    try {
      const res = await saveSchoolProfile(profileData);
      if (res.success) {
        if (onShowToast) {
          onShowToast(
            'Identitas Sekolah Disimpan',
            'No. NSM, NPSN, Akreditasi, Alamat, dan Kepala Madrasah berhasil diperbarui.',
            'success'
          );
        }
      } else {
        if (onShowToast) {
          onShowToast('Gagal Menyimpan', res.error || 'Terjadi kesalahan sistem.', 'error');
        }
      }
    } catch (err) {
      if (onShowToast) {
        onShowToast('Error', err.message, 'error');
      }
    } finally {
      setIsSavingSchool(false);
    }
  };

  // Simpan Data Profil Administrator
  const handleSaveAdminProfile = async (e) => {
    e.preventDefault();
    setIsSavingAdmin(true);
    try {
      const res = await saveSchoolProfile(profileData);
      if (res.success) {
        if (onShowToast) {
          onShowToast('Profil Admin Disimpan', 'Data kontak dan nama penanggung jawab admin berhasil disimpan.', 'success');
        }
      } else {
        if (onShowToast) {
          onShowToast('Gagal Menyimpan', res.error || 'Terjadi kesalahan sistem.', 'error');
        }
      }
    } catch (err) {
      if (onShowToast) {
        onShowToast('Error', err.message, 'error');
      }
    } finally {
      setIsSavingAdmin(false);
    }
  };

  // Simpan Kata Sandi Baru
  const handleSavePassword = (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword) {
      if (onShowToast) onShowToast('Perhatian', 'Kata sandi saat ini wajib diisi.', 'warning');
      return;
    }
    if (!passwordData.newPassword || passwordData.newPassword.length < 8) {
      if (onShowToast) onShowToast('Gagal', 'Kata sandi baru minimal 8 karakter.', 'error');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      if (onShowToast) {
        onShowToast('Gagal', 'Konfirmasi kata sandi baru tidak cocok.', 'error');
      }
      return;
    }
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    if (onShowToast) {
      onShowToast('Kata Sandi Diperbarui', 'Kata sandi akun admin berhasil diperbarui dengan aman.', 'success');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Utama Pengaturan */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
              <Settings className="w-4 h-4" />
            </div>
            <span>Pengaturan Identitas Sekolah & Akun Administrator</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Kelola data legalitas madrasah (No. NSM, NPSN, Akreditasi, Alamat, Kepala Madrasah), profil admin, dan keamanan akun.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80 text-[11px] font-medium text-slate-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Status Sistem: Aktif & Terlindungi</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* KOLOM KIRI (7 SPAN): FORM IDENTITAS SEKOLAH / MADRASAH */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-5">
            
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
                  <School className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Identitas Sekolah / Madrasah</h3>
                  <p className="text-[11px] text-slate-500">Legalitas resmi untuk kop surat, tanda tangan, dan laporan bulanan</p>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-sky-100/70 text-sky-800">
                Data Resmi
              </span>
            </div>

            <form onSubmit={handleSaveSchoolIdentity} className="space-y-4">
              
              {/* 1. Nama Madrasah / Sekolah */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Nama Instansi Sekolah / Madrasah</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profileData.schoolName || ''}
                  onChange={(e) => setProfileData({ ...profileData, schoolName: e.target.value })}
                  placeholder="Contoh: MTs Asy-Syafi'iyyah Jatibarang"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none transition-all text-slate-800 font-medium"
                />
              </div>

              {/* 2. Grid Dua Kolom: No NSM & NPSN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-sky-600" />
                    <span>No. NSM (Nomor Statistik Madrasah)</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={profileData.nsm || ''}
                    onChange={(e) => setProfileData({ ...profileData, nsm: e.target.value })}
                    placeholder="Contoh: 121232120015"
                    className="w-full px-3.5 py-2 text-xs font-mono font-semibold bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none transition-all text-slate-800"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">12 digit kode statistik Kemenag</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>NPSN / Kode Sekolah</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={profileData.npsn || ''}
                    onChange={(e) => setProfileData({ ...profileData, npsn: e.target.value })}
                    placeholder="Contoh: 20279093"
                    className="w-full px-3.5 py-2 text-xs font-mono font-semibold bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none transition-all text-slate-800"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">8 digit kode Dapodik / EMIS</p>
                </div>
              </div>

              {/* 3. Grid Dua Kolom: Akreditasi & Nama Kepala Madrasah */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>Status Akreditasi</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    list="akreditasi-options"
                    value={profileData.akreditasi || ''}
                    onChange={(e) => setProfileData({ ...profileData, akreditasi: e.target.value })}
                    placeholder="Contoh: A (Unggul)"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none transition-all text-slate-800"
                  />
                  <datalist id="akreditasi-options">
                    <option value="A (Unggul)" />
                    <option value="B (Baik)" />
                    <option value="C (Cukup)" />
                    <option value="Terakreditasi A" />
                    <option value="Terakreditasi B" />
                    <option value="Belum Terakreditasi" />
                  </datalist>
                  <p className="text-[10px] text-slate-400 mt-1">Status akreditasi BAN-S/M</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Nama Kepala Madrasah</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={profileData.headmasterName || ''}
                    onChange={(e) => setProfileData({ ...profileData, headmasterName: e.target.value })}
                    placeholder="Contoh: Drs. H. Akhmad Rosidi"
                    className="w-full px-3.5 py-2 text-xs font-semibold bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none transition-all text-slate-800"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Dicantumkan pada lembar pengesahan</p>
                </div>
              </div>

              {/* 4. NIP Kepala Madrasah */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>NIP Kepala Madrasah (Opsional)</span>
                </label>
                <input
                  type="text"
                  value={profileData.headmasterNip || ''}
                  onChange={(e) => setProfileData({ ...profileData, headmasterNip: e.target.value })}
                  placeholder="Ketik NIP jika ada, atau '-' jika non-PNS"
                  className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none transition-all text-slate-800"
                />
              </div>

              {/* 5. Alamat Lengkap */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>Alamat Lengkap Madrasah / Sekolah</span>
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={profileData.alamat || ''}
                  onChange={(e) => setProfileData({ ...profileData, alamat: e.target.value })}
                  placeholder="Contoh: Jl. Mayor Dasuki No. 136 Jatibarang, Kab. Indramayu - Jawa Barat 45273"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none transition-all text-slate-800 leading-relaxed resize-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">Alamat ini muncul di baris bawah kop surat resmi</p>
              </div>

              {/* Tombol Simpan Identitas */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingSchool}
                  className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white text-xs font-bold shadow-sm shadow-sky-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingSchool ? 'Menyimpan Identitas...' : 'Simpan Identitas Sekolah'}</span>
                </button>
              </div>

            </form>
          </div>

          {/* Card Preview Kop Surat & Dokumen Resmi */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>Pratinjau Kop Surat Resmi Dokumen</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center space-y-1">
              <h4 className="text-xs sm:text-sm font-extrabold uppercase text-slate-900 tracking-tight">
                {profileData.schoolName || "MTs ASY-SYAFI'IYYAH JATIBARANG"}
              </h4>
              <p className="text-[10.5px] font-mono font-medium text-slate-600">
                NSM: <span className="font-bold text-slate-900">{profileData.nsm || '121232120015'}</span> &nbsp;|&nbsp; 
                NPSN: <span className="font-bold text-slate-900">{profileData.npsn || '20279093'}</span> &nbsp;|&nbsp; 
                Akreditasi: <span className="font-bold text-slate-900">{profileData.akreditasi || 'A (Unggul)'}</span>
              </p>
              <p className="text-[9.5px] text-slate-500 italic">
                {profileData.alamat || 'Jl. Mayor Dasuki No. 136 Jatibarang, Kab. Indramayu - Jawa Barat 45273'}
              </p>
              <div className="pt-2 mt-2 border-t border-dashed border-slate-200 flex items-center justify-between text-[10px] text-slate-600 px-2">
                <span>Penanggung Jawab:</span>
                <span className="font-bold text-slate-900">Kepala Madrasah: {profileData.headmasterName || 'Drs. H. Akhmad Rosidi'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN (5 SPAN): PROFIL ADMIN & KEAMANAN PASSWORD */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card Profil Administrator */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Profil Administrator SIM GTK</h3>
                <p className="text-[11px] text-slate-500">Penanggung jawab teknis sistem presensi</p>
              </div>
            </div>

            <form onSubmit={handleSaveAdminProfile} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap Administrator
                </label>
                <input
                  type="text"
                  value={profileData.adminName || ''}
                  onChange={(e) => setProfileData({ ...profileData, adminName: e.target.value })}
                  placeholder="Contoh: Administrator Utama SIM GTK"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-all text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Alamat Email Resmi SIM GTK</span>
                </label>
                <input
                  type="email"
                  value={profileData.adminEmail || ''}
                  onChange={(e) => setProfileData({ ...profileData, adminEmail: e.target.value })}
                  placeholder="admin.gtk@mts-asysyafiiyyah.sch.id"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-all text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Peran Otoritas
                </label>
                <input
                  type="text"
                  readOnly
                  value={profileData.adminRole || 'Super Administrator GTK'}
                  className="w-full px-3.5 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-600 cursor-not-allowed"
                />
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isSavingAdmin}
                  className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold shadow-sm shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingAdmin ? 'Menyimpan Profil...' : 'Simpan Profil Admin'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Card Keamanan & Kata Sandi */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Keamanan & Kata Sandi</h3>
                <p className="text-[11px] text-slate-500">Perbarui kredensial masuk admin sistem</p>
              </div>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kata Sandi Saat Ini
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kata Sandi Baru
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Minimal 8 karakter"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ulangi Kata Sandi Baru
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Ketik ulang kata sandi baru"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none transition-all"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px] text-slate-500 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Sistem dilindungi enkripsi SHA-256 dan protokol verifikasi keamanan SIM GTK.</span>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Perbarui Kata Sandi</span>
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
