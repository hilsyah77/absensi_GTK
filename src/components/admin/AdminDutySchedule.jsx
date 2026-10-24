import React, { useState, useEffect } from 'react';
import { 
  Sunrise, 
  Clock, 
  MapPin, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Calendar,
  X,
  Copy,
  FileText,
  Sparkles
} from 'lucide-react';
import { 
  DUTY_DAYS, 
  getDutySchedule, 
  saveDutySchedule, 
  subscribeDutySchedule,
  getIndonesianDayName,
  DEFAULT_DUTY_SCHEDULE 
} from '../../services/attendanceService';

export default function AdminDutySchedule({
  employees = [],
  onShowToast
}) {
  const [dutySchedule, setDutySchedule] = useState(() => getDutySchedule());
  
  // Day persistence: Remember last active day or default to today's day (e.g. Jumat)
  const todayName = getIndonesianDayName();
  const [activeDay, setActiveDay] = useState(() => {
    try {
      const saved = localStorage.getItem('presensi_admin_duty_active_day');
      if (saved && DUTY_DAYS.includes(saved)) return saved;
    } catch {}
    return DUTY_DAYS.includes(todayName) ? todayName : 'Senin';
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state for adding/editing a duty assignment
  const [formTeacher, setFormTeacher] = useState({
    selectedEmpId: '',
    name: '',
    nip: '',
    role: 'Anggota Piket',
    location: 'Pintu Gerbang Utama',
    phone: ''
  });

  // Filter only teachers / GTK (or all employees) and sort A-Z
  const teacherList = employees.filter(e => (e.role || '').toLowerCase() === 'guru' || !e.role);
  const basePool = teacherList.length > 0 ? teacherList : employees;
  const employeePool = [...basePool].sort((a, b) => 
    (a.name || '').localeCompare(b.name || '', 'id', { sensitivity: 'base' })
  );

  // Handle switching active day with localStorage remember
  const handleSelectDay = (day) => {
    setActiveDay(day);
    try {
      localStorage.setItem('presensi_admin_duty_active_day', day);
    } catch {}
  };

  // Subscribe to realtime duty schedule from Firebase & LocalStorage
  useEffect(() => {
    const unsub = subscribeDutySchedule((data) => {
      if (data) {
        setDutySchedule(data);
      }
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  // Update schedule field
  const handleConfigChange = (field, value) => {
    setDutySchedule(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Open modal to add teacher for activeDay
  const handleOpenAddModal = () => {
    setFormTeacher({
      selectedEmpId: '',
      name: '',
      nip: '',
      role: 'Anggota Piket',
      location: dutySchedule.defaultLocation || 'Pintu Gerbang Utama',
      phone: ''
    });
    setIsAddModalOpen(true);
  };

  // When teacher is picked from dropdown
  const handleSelectEmployee = (empId) => {
    const emp = employeePool.find(e => (e.id || e.nip) === empId);
    if (emp) {
      setFormTeacher(prev => ({
        ...prev,
        selectedEmpId: empId,
        name: emp.name || '',
        nip: emp.nip || '',
        phone: emp.phone || prev.phone
      }));
    } else {
      setFormTeacher(prev => ({
        ...prev,
        selectedEmpId: '',
        name: '',
        nip: ''
      }));
    }
  };

  // Submit adding teacher to activeDay -> IMMEDIATELY AUTO-SAVES TO DB & LOCALSTORAGE
  const handleAddTeacherSubmit = async (e) => {
    e.preventDefault();
    if (!formTeacher.name.trim()) {
      if (onShowToast) onShowToast('Perhatian', 'Nama guru petugas piket wajib diisi.', 'warning');
      return;
    }

    const newAssignment = {
      id: `duty_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: formTeacher.name.trim(),
      nip: formTeacher.nip.trim(),
      role: formTeacher.role,
      location: formTeacher.location.trim() || dutySchedule.defaultLocation || 'Pintu Gerbang Utama',
      phone: formTeacher.phone.trim()
    };

    const currentList = dutySchedule.schedule?.[activeDay] || [];
    const updatedSchedule = {
      ...dutySchedule,
      schedule: {
        ...dutySchedule.schedule,
        [activeDay]: [...currentList, newAssignment].sort((a, b) => 
          (a.name || '').localeCompare(b.name || '', 'id', { sensitivity: 'base' })
        )
      }
    };

    // 1. Update state segera
    setDutySchedule(updatedSchedule);
    setIsAddModalOpen(false);

    // 2. Simpan otomatis permanen ke Cloud Firestore & LocalStorage
    setIsSaving(true);
    const res = await saveDutySchedule(updatedSchedule);
    setIsSaving(false);

    if (res.success) {
      if (onShowToast) {
        onShowToast('Tersimpan Otomatis', `${newAssignment.name} berhasil ditambahkan dan disimpan ke jadwal piket hari ${activeDay}.`, 'success');
      }
    } else {
      if (onShowToast) {
        onShowToast('Gagal Menyimpan', res.error || 'Terjadi kesalahan saat menyimpan.', 'error');
      }
    }
  };

  // Remove teacher from activeDay -> IMMEDIATELY AUTO-SAVES TO DB & LOCALSTORAGE
  const handleRemoveTeacher = async (dutyId, teacherName) => {
    if (window.confirm(`Hapus ${teacherName} dari jadwal piket hari ${activeDay}?`)) {
      const currentList = dutySchedule.schedule?.[activeDay] || [];
      const updatedSchedule = {
        ...dutySchedule,
        schedule: {
          ...dutySchedule.schedule,
          [activeDay]: currentList.filter(t => t.id !== dutyId)
        }
      };

      // 1. Update state segera
      setDutySchedule(updatedSchedule);

      // 2. Simpan otomatis permanen ke Cloud Firestore & LocalStorage
      setIsSaving(true);
      const res = await saveDutySchedule(updatedSchedule);
      setIsSaving(false);

      if (res.success) {
        if (onShowToast) {
          onShowToast('Berhasil Dihapus', `${teacherName} telah dihapus dari jadwal piket hari ${activeDay}.`, 'info');
        }
      }
    }
  };

  // Save all changes (Manual trigger button)
  const handleSaveAll = async () => {
    setIsSaving(true);
    const res = await saveDutySchedule(dutySchedule);
    setIsSaving(false);
    if (res.success) {
      if (onShowToast) {
        onShowToast('Berhasil Disimpan', 'Jadwal piket guru masuk pagi berhasil disinkronkan ke cloud & perangkat!', 'success');
      }
    } else {
      if (onShowToast) {
        onShowToast('Gagal Menyimpan', res.error || 'Terjadi kesalahan sistem.', 'error');
      }
    }
  };

  const activeDayTeachers = [...(dutySchedule.schedule?.[activeDay] || [])].sort((a, b) =>
    (a.name || '').localeCompare(b.name || '', 'id', { sensitivity: 'base' })
  );

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-500/25 ring-2 ring-amber-100">
            <Sunrise className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Jadwal Piket Guru Masuk Pagi
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                Senin - Sabtu
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Atur petugas piket penyambutan siswa 5S dan pengawasan gerbang pagi madrasah (Auto-Save Aktif)
            </p>
          </div>
        </div>

        {/* Action Button & Status */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200/70 px-3 py-2 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Tersimpan Otomatis ke Cloud</span>
          </div>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-98 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
          </button>
        </div>
      </div>

      {/* Global Configuration Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Pengaturan Waktu & Lokasi Piket Pagi</span>
          </h3>
          <span className="text-[11px] text-slate-400">
            Klik tombol simpan setelah mengubah jam atau SOP
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Jam Mulai Piket Pagi
            </label>
            <input
              type="time"
              value={dutySchedule.dutyStartTime || '06:15'}
              onChange={(e) => handleConfigChange('dutyStartTime', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">Standar: 06:15 WIB (sebelum siswa datang)</p>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Jam Selesai Piket Pagi
            </label>
            <input
              type="time"
              value={dutySchedule.dutyEndTime || '07:15'}
              onChange={(e) => handleConfigChange('dutyEndTime', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">Standar: 07:15 WIB (bel masuk berbunyi)</p>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Lokasi Standar Penugasan
            </label>
            <input
              type="text"
              value={dutySchedule.defaultLocation || 'Pintu Gerbang & Lobi Utama'}
              onChange={(e) => handleConfigChange('defaultLocation', e.target.value)}
              placeholder="Contoh: Pintu Gerbang & Lobi Utama"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">Titik sambut siswa di pagi hari</p>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">
            Petunjuk & Catatan SOP Tugas Guru Piket
          </label>
          <textarea
            rows="2"
            value={dutySchedule.sopNotes || ''}
            onChange={(e) => handleConfigChange('sopNotes', e.target.value)}
            placeholder="Instruksi tugas guru piket pagi..."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 leading-relaxed"
          />
        </div>
      </div>

      {/* Main Schedule Workspace by Day */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-5">
        {/* Day Selector Tabs */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-700">
              Pilih Hari Kerja (Senin - Sabtu):
            </label>
            <span className="text-[11px] text-slate-400">
              Hari ini: <strong className="text-amber-700">{todayName}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
            {DUTY_DAYS.map((day) => {
              const count = (dutySchedule.schedule?.[day] || []).length;
              const isActive = activeDay === day;
              const isToday = todayName === day;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer relative ${
                    isActive
                      ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/25 font-bold scale-[1.02]'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {isToday && (
                    <span className={`absolute top-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                      isActive 
                        ? 'bg-white/25 text-white border border-white/30' 
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}>
                      Hari Ini
                    </span>
                  )}
                  <div className="text-xs sm:text-sm">{day}</div>
                  <div className={`text-[10px] mt-0.5 font-bold ${
                    isActive 
                      ? 'text-amber-100' 
                      : count > 0 
                        ? 'text-amber-700 bg-amber-100/80 px-1.5 py-0.2 rounded-md inline-block' 
                        : 'text-slate-400'
                  }`}>
                    {count} Guru Piket
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action bar for selected day */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div>
            <h4 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span>Daftar Guru Piket Hari {activeDay}</span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                activeDayTeachers.length > 0 
                  ? 'bg-amber-100 text-amber-800 border-amber-300' 
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                {activeDayTeachers.length} Guru Terdaftar
              </span>
              {todayName === activeDay && (
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full">
                  Piket Hari Ini
                </span>
              )}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Setiap nama yang ditambahkan akan otomatis tersimpan langsung ke database cloud & perangkat.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>+ Tambah Guru Piket Hari {activeDay}</span>
          </button>
        </div>

        {/* Teachers List / Table */}
        {activeDayTeachers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeDayTeachers.map((teacher, index) => (
              <div
                key={teacher.id || index}
                className="group relative p-4 rounded-2xl border border-slate-200 bg-white hover:border-amber-300 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                      {teacher.role || 'Anggota Piket'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTeacher(teacher.id, teacher.name)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Hapus dari jadwal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h5 className="text-sm font-bold text-slate-900 truncate">
                    {teacher.name}
                  </h5>
                  {teacher.nip && (
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      NIP: {teacher.nip}
                    </p>
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 truncate max-w-[180px]">
                    <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                    <span className="truncate">{teacher.location || dutySchedule.defaultLocation}</span>
                  </span>
                  {teacher.phone && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {teacher.phone}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
            <Sunrise className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">Belum ada guru yang ditugaskan piket untuk hari {activeDay}</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Klik tombol "+ Tambah Guru Piket Hari {activeDay}" di atas untuk menugaskan guru.
            </p>
          </div>
        )}
      </div>

      {/* Add Teacher Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div 
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 bg-gradient-to-r from-amber-600 to-orange-600 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold">
                  Tambah Guru Piket Hari {activeDay}
                </h3>
                <p className="text-[11px] text-amber-100 mt-0.5">
                  Tugaskan guru untuk masuk piket pagi (Tersimpan Otomatis)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTeacherSubmit} className="p-5 space-y-4">
              {/* Select Employee Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Guru Terdaftar (SIM GTK):
                </label>
                <select
                  value={formTeacher.selectedEmpId}
                  onChange={(e) => handleSelectEmployee(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 bg-white"
                >
                  <option value="">-- Pilih Guru dari Database atau Ketik Manual --</option>
                  {employeePool.map(emp => (
                    <option key={emp.id || emp.nip} value={emp.id || emp.nip}>
                      {emp.name} {emp.nip ? `(NIP: ${emp.nip})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Name (Can be edited or typed manually) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap & Gelar Guru <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={formTeacher.name}
                  onChange={(e) => setFormTeacher(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Contoh: Dra. Hj. Siti Aminah, M.Pd.I"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>

              {/* NIP */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  NIP / PegID / NUPTK:
                </label>
                <input
                  type="text"
                  value={formTeacher.nip}
                  onChange={(e) => setFormTeacher(prev => ({ ...prev, nip: e.target.value }))}
                  placeholder="Contoh: 197805122008011005"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>

              {/* Role in Duty */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Peran / Posisi:
                  </label>
                  <select
                    value={formTeacher.role}
                    onChange={(e) => setFormTeacher(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 bg-white"
                  >
                    <option value="Koordinator Piket">Koordinator Piket</option>
                    <option value="Anggota Piket">Anggota Piket</option>
                    <option value="Petugas Gerbang Depan">Petugas Gerbang Depan</option>
                    <option value="Petugas Lobi Utama">Petugas Lobi Utama</option>
                    <option value="Pengawas Ketertiban">Pengawas Ketertiban</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Titik Lokasi Jaga:
                  </label>
                  <input
                    type="text"
                    value={formTeacher.location}
                    onChange={(e) => setFormTeacher(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Pintu Gerbang Utama"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Menyimpan...' : `Tambahkan & Simpan ke Hari ${activeDay}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
