import React from 'react';
import { 
  X, 
  User, 
  GraduationCap, 
  Briefcase, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Calendar,
  Building
} from 'lucide-react';

export default function ProfileModal({ isOpen, onClose, userRole, currentUser }) {
  if (!isOpen) return null;

  const isGuru = userRole === 'guru';

  const profile = {
    name: currentUser?.name || (isGuru ? "Guru Madrasah" : "Tenaga Kependidikan"),
    role: currentUser?.position || (isGuru ? "Pendidik / Guru" : "Staf Tata Usaha"),
    nip: currentUser?.nip || "-",
    nuptk: currentUser?.nip || "-",
    unit: "MTs Asy-Syafi'iyyah Jatibarang",
    department: isGuru ? "Tenaga Pendidik" : "Sub Bagian Tata Usaha",
    email: currentUser?.email || "gtk@mtsasysyafiiyyah.sch.id",
    phone: currentUser?.phone || "-",
    joinDate: "Aktif",
    statusKepegawaian: isGuru ? "Guru Madrasah" : "Pegawai Madrasah"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all my-8 animate-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Header */}
        <div className="px-6 py-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-bold text-2xl flex items-center justify-center shadow-lg ring-2 ring-white/20">
              {isGuru ? 'ST' : 'BS'}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-indigo-200 border border-white/10 mb-1">
                {isGuru ? <GraduationCap className="w-3.5 h-3.5" /> : <Briefcase className="w-3.5 h-3.5" />}
                <span>{isGuru ? 'Guru Mata Pelajaran' : 'Tenaga Administrasi Sekolah'}</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {profile.name}
              </h3>
              <p className="text-xs text-slate-300 font-mono">
                NIP: {profile.nip}
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
              <span className="text-slate-400 block text-[11px]">NUPTK</span>
              <span className="font-mono font-semibold text-slate-800 text-xs">
                {profile.nuptk}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
              <span className="text-slate-400 block text-[11px]">Status Kepegawaian</span>
              <span className="font-semibold text-emerald-700">
                {profile.statusKepegawaian} (Aktif)
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
              <span className="text-slate-400 block text-[11px]">Unit Kerja</span>
              <span className="font-semibold text-slate-800">
                {profile.unit}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
              <span className="text-slate-400 block text-[11px]">Jabatan / Sub Unit</span>
              <span className="font-semibold text-slate-800 truncate block">
                {profile.department}
              </span>
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2.5 text-slate-600">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{profile.email}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{profile.phone}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Terdaftar Sejak: {profile.joinDate}</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
