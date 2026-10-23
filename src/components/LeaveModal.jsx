import React, { useState } from 'react';
import { 
  X, 
  FileCheck, 
  Calendar, 
  AlertCircle, 
  Clock, 
  HelpCircle,
  FileText,
  Send,
  Building
} from 'lucide-react';
import { getTodayDateString } from '../services/attendanceService';

export default function LeaveModal({
  isOpen,
  onClose,
  onSubmit,
  userRole,
  currentUser
}) {
  const [leaveType, setLeaveType] = useState('Izin Sakit (Surat Dokter)');
  const [startDate, setStartDate] = useState(() => getTodayDateString());
  const [endDate, setEndDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return getTodayDateString(tomorrow);
  });
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  // Calculate day difference
  const calculateDays = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 1;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMessage('Keterangan atau alasan permohonan wajib diisi.');
      return;
    }
    setErrorMessage('');
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const applicantName = currentUser?.name || (userRole === 'guru' ? 'Guru Madrasah' : 'Tenaga Kependidikan');
      const applicantNip = currentUser?.nip || (currentUser?.id ? String(currentUser.id) : '');
      onSubmit({
        id: Date.now().toString(),
        applicantName,
        applicantNip,
        nip: applicantNip,
        role: userRole || 'guru',
        type: leaveType,
        startDate,
        endDate,
        duration: calculateDays(),
        reason: reason.trim(),
        createdAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
        status: 'menunggu'
      });
      // reset form
      setReason('');
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all my-8 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-xs text-indigo-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                Formulir Pengajuan Cuti / Izin GTK
              </h3>
              <p className="text-xs text-slate-300">
                Pencatatan ketidakhadiran resmi guru & tenaga kependidikan
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 sm:space-y-5">
          
          {/* Error Alert if any */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Jenis Izin */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Jenis Permohonan Izin / Cuti <span className="text-rose-500">*</span>
            </label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            >
              <option value="Izin Sakit (Surat Dokter)">Izin Sakit (Dengan Surat Dokter / SKD)</option>
              <option value="Cuti Tahunan Pegawai">Cuti Tahunan (Hak Cuti GTK)</option>
              <option value="Izin Alasan Penting">Izin Keperluan Mendesak / Keluarga</option>
              <option value="Tugas Dinas Luar / Workshop">Penugasan Dinas Luar / Diklat Pembelajaran</option>
              <option value="Cuti Melahirkan / Bersalin">Cuti Melahirkan / Bersalin</option>
            </select>
          </div>

          {/* Date Range Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Tanggal Mulai <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Tanggal Selesai <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          {/* Duration Badge Info */}
          <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between text-xs">
            <span className="text-indigo-900 font-medium flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Total Durasi Ketidakhadiran:
            </span>
            <span className="font-bold text-indigo-700 bg-white px-2.5 py-0.5 rounded-lg border border-indigo-200/60">
              {calculateDays()} Hari Kerja
            </span>
          </div>

          {/* Keterangan / Alasan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Keterangan Alasan <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Mengikuti kegiatan pelatihan kurikulum merdeka di Balai Diklat Guru..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors resize-none placeholder:text-slate-400"
              required
            />
          </div>


          {/* Verifikator Institutional Note */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 flex items-start gap-2.5">
            <Building className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-700">Verifikator Pengajuan:</span> Berkas ini akan diteruskan secara otomatis ke akun Kepala Madrasah (Drs. H. Akhmad Rosidi) & Kasubbag TU untuk verifikasi kepegawaian.
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Mengirimkan...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim Pengajuan Izin</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
