import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  CheckCircle2, 
  AlertCircle, 
  GraduationCap, 
  Building2,
  Phone,
  CreditCard,
  User,
  Lock,
  Eye,
  EyeOff,
  KeyRound
} from 'lucide-react';

export default function AddEmployeeModal({
  isOpen,
  onClose,
  onAddSuccess
}) {
  const [formData, setFormData] = useState({
    nip: '',
    name: '',
    role: 'guru', // 'guru' | 'tendik'
    position: '',
    employmentStatus: 'PNS',
    username: '',
    password: '',
    phone: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Nama lengkap wajib diisi';
    if (!formData.nip.trim()) newErrors.nip = 'NIP / NUPTK wajib diisi';
    if (!formData.position.trim()) newErrors.position = 'Jabatan / Mata pelajaran wajib diisi';
    if (!formData.username.trim()) newErrors.username = 'Username akun GTK wajib diisi';
    if (!formData.password.trim()) newErrors.password = 'Password akun GTK wajib diisi';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Call onAddSuccess
    if (onAddSuccess) {
      onAddSuccess(formData);
    }

    // Reset form
    setFormData({
      nip: '',
      name: '',
      role: 'guru',
      position: '',
      employmentStatus: 'PNS',
      username: '',
      password: '',
      phone: ''
    });
    setErrors({});
    setShowPassword(false);
    onClose();
  };

  const handleUseNipAsCredentials = () => {
    if (formData.nip) {
      setFormData(prev => ({
        ...prev,
        username: prev.nip,
        password: prev.nip.slice(-6) || '123456'
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Tambah Pegawai Baru</h3>
              <p className="text-xs text-slate-500">Daftarkan profil dan kredensial akun login GTK</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Jenis Pegawai Segmented */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Kategori Pegawai
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'guru' })}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  formData.role === 'guru'
                    ? 'bg-sky-50 border-sky-400 text-sky-700 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Guru (Pendidik)</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'tendik' })}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  formData.role === 'tendik'
                    ? 'bg-sky-50 border-sky-400 text-sky-700 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Tenaga Kependidikan</span>
              </button>
            </div>
          </div>

          {/* NIP & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NIP / NUPTK / PegID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nip}
                onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                placeholder="198503152010012004"
                className={`w-full px-3.5 py-2 text-xs font-mono bg-slate-50 focus:bg-white border rounded-xl focus:border-sky-500 focus:outline-none transition-all ${
                  errors.nip ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                }`}
              />
              {errors.nip && <span className="text-[10px] text-rose-500 mt-0.5 block">{errors.nip}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status Kepegawaian
              </label>
              <select
                value={formData.employmentStatus}
                onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none transition-all text-slate-800 cursor-pointer"
              >
                <option value="PNS">PNS / ASN</option>
                <option value="PPPK">PPPK</option>
                <option value="GTT">Guru Tidak Tetap (GTT)</option>
                <option value="PTT">Pegawai Tidak Tetap (PTT)</option>
                <option value="Yayasan">Tetap Yayasan</option>
              </select>
            </div>
          </div>

          {/* Nama Lengkap */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Lengkap & Gelar <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Dra. Nurul Hidayati, M.Pd."
              className={`w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border rounded-xl focus:border-sky-500 focus:outline-none transition-all ${
                errors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
            />
            {errors.name && <span className="text-[10px] text-rose-500 mt-0.5 block">{errors.name}</span>}
          </div>

          {/* Jabatan / Bidang Tugas */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Jabatan / Mata Pelajaran / Unit Kerja <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              placeholder={formData.role === 'guru' ? 'Contoh: Guru Matematika Wajib' : 'Contoh: Staf Administrasi & Tata Usaha'}
              className={`w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border rounded-xl focus:border-sky-500 focus:outline-none transition-all ${
                errors.position ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              }`}
            />
            {errors.position && <span className="text-[10px] text-rose-500 mt-0.5 block">{errors.position}</span>}
          </div>

          {/* KREDENSIAL AKUN GTK: USERNAME & PASSWORD (MENGGANTIKAN EMAIL) */}
          <div className="p-4 bg-sky-50/50 rounded-2xl border border-sky-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-sky-600" />
                <span>Akun & Password GTK</span>
              </span>
              <button
                type="button"
                onClick={handleUseNipAsCredentials}
                className="text-[10px] text-sky-600 hover:text-sky-700 font-semibold cursor-pointer hover:underline"
              >
                Gunakan NIP sebagai Akun
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Username GTK */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Username GTK <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Contoh: silvia.gtk / NIP"
                    className={`w-full pl-9 pr-3 py-2 text-xs bg-white border rounded-xl focus:border-sky-500 focus:outline-none transition-all ${
                      errors.username ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                    }`}
                  />
                </div>
                {errors.username && <span className="text-[10px] text-rose-500 mt-0.5 block">{errors.username}</span>}
              </div>

              {/* Password GTK */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password GTK <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimal 6 karakter"
                    className={`w-full pl-9 pr-9 py-2 text-xs bg-white border rounded-xl focus:border-sky-500 focus:outline-none transition-all ${
                      errors.password ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showPassword ? 'Sembunyikan Password' : 'Lihat Password'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {errors.password && <span className="text-[10px] text-rose-500 mt-0.5 block">{errors.password}</span>}
              </div>
            </div>
          </div>

          {/* Nomor WhatsApp */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nomor WhatsApp Pegawai (Opsional)
            </label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="081234567890"
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 shadow-sm shadow-sky-600/30 transition-all cursor-pointer"
            >
              Simpan Data Pegawai
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
