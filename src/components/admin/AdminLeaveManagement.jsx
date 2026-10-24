import React, { useState } from 'react';
import { 
  FileCheck, 
  Calendar, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Trash2, 
  RotateCcw, 
  Plus, 
  User, 
  Check, 
  X, 
  AlertCircle,
  FileText,
  CalendarDays,
  ShieldCheck,
  Building2,
  GraduationCap
} from 'lucide-react';
import { 
  updateLeaveStatus, 
  deleteLeaveRequest, 
  saveLeaveRequest,
  getTodayDateString
} from '../../services/attendanceService';

export default function AdminLeaveManagement({
  leaveRequests = [],
  employees = [],
  onShowToast
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'menunggu' | 'disetujui' | 'dibatalkan' | 'ditolak'
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'guru' | 'tendik'

  // Modal Tambah Izin Manual oleh Admin
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLeave, setNewLeave] = useState({
    employeeNip: '',
    type: 'Izin Sakit (Surat Dokter)',
    startDate: getTodayDateString(),
    endDate: getTodayDateString(),
    reason: '',
    status: 'disetujui' // Admin input usually pre-approved or verified
  });

  // Modal Konfirmasi Hapus
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal Konfirmasi Batal
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState('Dibatalkan oleh Administrator SIM GTK');
  const [isCancelling, setIsCancelling] = useState(false);

  // Hitung jumlah hari
  const calculateDays = (start, end) => {
    if (!start || !end) return 1;
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.ceil(Math.abs(e - s) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 1;
  };

  // Filter Data
  const filteredList = leaveRequests.filter((item) => {
    const q = searchQuery.toLowerCase();
    const nameMatch = (item.applicantName || item.name || '').toLowerCase().includes(q);
    const nipMatch = (item.applicantNip || item.nip || '').toLowerCase().includes(q);
    const reasonMatch = (item.reason || '').toLowerCase().includes(q);
    const typeMatch = (item.type || '').toLowerCase().includes(q);
    const matchesSearch = nameMatch || nipMatch || reasonMatch || typeMatch;

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesRole = roleFilter === 'all' || (item.role || 'guru') === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  // Handler: Setujui Izin
  const handleApprove = async (item) => {
    const res = await updateLeaveStatus(item.id, 'disetujui', 'Administrator SIM GTK');
    if (res.success) {
      if (onShowToast) {
        onShowToast('Izin Disetujui', `Pengajuan ${item.type} untuk ${item.applicantName || 'pegawai'} telah disetujui.`, 'success');
      }
    } else {
      if (onShowToast) onShowToast('Gagal', res.error || 'Terjadi kesalahan sistem.', 'error');
    }
  };

  // Handler: Tolak Izin
  const handleReject = async (item) => {
    const res = await updateLeaveStatus(item.id, 'ditolak', 'Administrator SIM GTK');
    if (res.success) {
      if (onShowToast) {
        onShowToast('Izin Ditolak', `Pengajuan ${item.type} untuk ${item.applicantName || 'pegawai'} telah ditolak.`, 'info');
      }
    } else {
      if (onShowToast) onShowToast('Gagal', res.error || 'Terjadi kesalahan sistem.', 'error');
    }
  };

  // Handler: Batal Izin (Batalkan Persetujuan Cuti)
  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setIsCancelling(true);
    const res = await updateLeaveStatus(
      cancelTarget.id, 
      'dibatalkan', 
      'Administrator SIM GTK',
      cancelReason || 'Dibatalkan oleh Administrator SIM GTK'
    );
    setIsCancelling(false);
    if (res.success) {
      if (onShowToast) {
        onShowToast(
          'Izin Dibatalkan', 
          `Status izin/cuti ${cancelTarget.applicantName || 'pegawai'} berhasil dibatalkan.`, 
          'warning'
        );
      }
      setCancelTarget(null);
    } else {
      if (onShowToast) onShowToast('Gagal', res.error || 'Terjadi kesalahan sistem.', 'error');
    }
  };

  // Handler: Hapus Permanen Izin
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const res = await deleteLeaveRequest(deleteTarget.id);
    setIsDeleting(false);
    if (res.success) {
      if (onShowToast) {
        onShowToast(
          'Data Terhapus Permanen', 
          `Rekaman izin/cuti ${deleteTarget.applicantName || 'pegawai'} berhasil dihapus dari sistem.`, 
          'success'
        );
      }
      setDeleteTarget(null);
    } else {
      if (onShowToast) onShowToast('Gagal Hapus', res.error || 'Terjadi kesalahan sistem.', 'error');
    }
  };

  // Handler: Tambah Izin Manual oleh Admin
  const handleSaveManualLeave = async (e) => {
    e.preventDefault();
    if (!newLeave.employeeNip) {
      if (onShowToast) onShowToast('Validasi Gagal', 'Silakan pilih guru / tendik yang mengajukan izin.', 'error');
      return;
    }
    if (!newLeave.reason.trim()) {
      if (onShowToast) onShowToast('Validasi Gagal', 'Alasan / keterangan izin wajib diisi.', 'error');
      return;
    }

    const emp = employees.find(e => e.nip === newLeave.employeeNip || e.id === newLeave.employeeNip);
    const applicantName = emp?.name || 'Pegawai Madrasah';
    const applicantNip = emp?.nip || newLeave.employeeNip;
    const role = emp?.role || 'guru';

    const duration = calculateDays(newLeave.startDate, newLeave.endDate);

    const payload = {
      applicantName,
      applicantNip,
      nip: applicantNip,
      role,
      type: newLeave.type,
      startDate: newLeave.startDate,
      endDate: newLeave.endDate,
      duration,
      reason: newLeave.reason.trim(),
      status: newLeave.status || 'disetujui',
      dispositionBy: 'Administrator SIM GTK (Dicatat Manual)',
      createdAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
    };

    const res = await saveLeaveRequest(payload);
    if (res.success) {
      if (onShowToast) {
        onShowToast('Izin Dicatat', `Permohonan izin untuk ${applicantName} berhasil disimpan ke sistem.`, 'success');
      }
      setIsAddModalOpen(false);
      setNewLeave({
        employeeNip: '',
        type: 'Izin Sakit (Surat Dokter)',
        startDate: getTodayDateString(),
        endDate: getTodayDateString(),
        reason: '',
        status: 'disetujui'
      });
    } else {
      if (onShowToast) onShowToast('Gagal Simpan', res.error || 'Terjadi kesalahan sistem.', 'error');
    }
  };

  // Helper Badge Status
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'disetujui':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Disetujui</span>
          </span>
        );
      case 'menunggu':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Menunggu</span>
          </span>
        );
      case 'dibatalkan':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Dibatalkan</span>
          </span>
        );
      case 'ditolak':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Ditolak</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
            {status || 'Menunggu'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner & Action Button */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
              <CalendarDays className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Rekap Izin & Cuti Guru / Tendik
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-xl">
            Pusat verifikasi, pembatalan izin, serta pembersihan berkas permohonan ketidakhadiran resmi madrasah.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Izin Manual</span>
        </button>
      </div>

      {/* 2. Filter & Pencarian Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama guru, NIP, jenis izin, alasan..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 focus:bg-white text-xs border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none transition-all text-slate-800"
            />
          </div>

          {/* Filters: Status & Role */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium">
              {[
                { id: 'all', label: 'Semua Status' },
                { id: 'menunggu', label: 'Menunggu' },
                { id: 'disetujui', label: 'Disetujui' },
                { id: 'dibatalkan', label: 'Dibatalkan' },
                { id: 'ditolak', label: 'Ditolak' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                    statusFilter === tab.id
                      ? 'bg-white text-slate-900 font-bold shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none focus:border-sky-500 font-medium text-slate-700 cursor-pointer"
            >
              <option value="all">Semua Kategori</option>
              <option value="guru">Dewan Guru</option>
              <option value="tendik">Tenaga Kependidikan</option>
            </select>
          </div>

        </div>

        {/* Counter Results */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Menampilkan <strong>{filteredList.length}</strong> permohonan izin/cuti</span>
          {(searchQuery || statusFilter !== 'all' || roleFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setRoleFilter('all');
              }}
              className="text-sky-600 hover:underline font-medium text-xs cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* 3. Tabel Rekap Izin / Cuti */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-4">
              <FileCheck className="w-8 h-8 stroke-[1.75]" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Tidak ada data izin / cuti yang ditemukan
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              {searchQuery || statusFilter !== 'all' || roleFilter !== 'all'
                ? 'Tidak ada berkas yang sesuai dengan kriteria filter saat ini.'
                : 'Belum ada pengajuan izin atau cuti resmi dari dewan guru dan tendik.'}
            </p>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Izin Baru</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-12 text-center">No</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Pegawai (GTK)</th>
                  <th className="py-3.5 px-4 min-w-[160px]">Jenis Izin</th>
                  <th className="py-3.5 px-4 min-w-[180px]">Rentang Waktu</th>
                  <th className="py-3.5 px-4 min-w-[220px]">Alasan / Keterangan</th>
                  <th className="py-3.5 px-4 min-w-[140px]">Status</th>
                  <th className="py-3.5 px-4 text-center min-w-[160px]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredList.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* 1. No */}
                    <td className="py-4 px-4 text-center font-mono text-slate-400">
                      {idx + 1}
                    </td>

                    {/* 2. Pegawai */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200">
                          {(item.applicantName || item.name || 'G')[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">
                            {item.applicantName || item.name || 'Guru MTs Asy-Syafi\'iyyah'}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-[11px] text-slate-500">
                              {item.applicantNip || item.nip || '-'}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                              item.role === 'tendik' ? 'bg-purple-50 text-purple-700' : 'bg-sky-50 text-sky-700'
                            }`}>
                              {item.role === 'tendik' ? 'Tendik' : 'Guru'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 3. Jenis Izin */}
                    <td className="py-4 px-4">
                      <span className="font-semibold text-slate-800 block">
                        {item.type || 'Izin Resmi'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Diajukan: {item.createdAt || '-'}
                      </span>
                    </td>

                    {/* 4. Rentang Waktu */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                        <span>{item.startDate}</span>
                        <span className="text-slate-400">s/d</span>
                        <span>{item.endDate}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-sky-700 font-mono bg-sky-50 px-2 py-0.5 rounded inline-block mt-1">
                        {item.duration || calculateDays(item.startDate, item.endDate)} Hari Kerja
                      </span>
                    </td>

                    {/* 5. Alasan */}
                    <td className="py-4 px-4">
                      <p className="text-slate-600 italic bg-slate-50 p-2 rounded-xl border border-slate-100 text-[11px] leading-relaxed max-w-xs">
                        "{item.reason || '-'}"
                      </p>
                      {item.dispositionNote && (
                        <p className="text-[10px] text-amber-700 mt-1 font-medium">
                          Catatan: {item.dispositionNote}
                        </p>
                      )}
                    </td>

                    {/* 6. Status & Disposisi */}
                    <td className="py-4 px-4">
                      <div>
                        {renderStatusBadge(item.status)}
                        {item.dispositionBy && (
                          <p className="text-[10px] text-slate-400 mt-1 truncate max-w-[150px]">
                            Oleh: {item.dispositionBy}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* 7. Aksi (Setujui / Batal / Hapus) */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        
                        {/* Tombol Setujui (Jika masih menunggu atau ditolak/dibatalkan) */}
                        {item.status !== 'disetujui' && (
                          <button
                            type="button"
                            onClick={() => handleApprove(item)}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold transition-colors cursor-pointer"
                            title="Setujui Izin"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Tombol BATAL: Batalkan izin/persetujuan cuti */}
                        {item.status === 'disetujui' && (
                          <button
                            type="button"
                            onClick={() => {
                              setCancelTarget(item);
                              setCancelReason('Dibatalkan oleh Administrator SIM GTK');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-semibold transition-colors cursor-pointer"
                            title="Batalkan Izin Pegawai"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Batal</span>
                          </button>
                        )}

                        {/* Tombol Tolak (Khusus yang masih menunggu) */}
                        {item.status === 'menunggu' && (
                          <button
                            type="button"
                            onClick={() => handleReject(item)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors cursor-pointer"
                            title="Tolak Pengajuan"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Tombol HAPUS: Hapus permanen dari sistem */}
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 text-xs font-semibold transition-colors cursor-pointer"
                          title="Hapus Rekaman Izin"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. MODAL BATALKAN IZIN / CUTI */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Batalkan Izin / Cuti</h3>
                  <p className="text-[11px] text-slate-500">Membatalkan status persetujuan resmi</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setCancelTarget(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
              <p>
                Anda akan membatalkan izin <strong>{cancelTarget.type}</strong> atas nama:
              </p>
              <p className="font-bold text-amber-950">
                {cancelTarget.applicantName} ({cancelTarget.applicantNip || cancelTarget.nip || '-'})
              </p>
              <p className="text-[11px] text-amber-800">
                Periode: {cancelTarget.startDate} s/d {cancelTarget.endDate} ({cancelTarget.duration || 1} Hari)
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alasan Pembatalan (Opsional)
              </label>
              <textarea
                rows="2"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Contoh: Guru membatalkan izin karena tetap hadir mengajar..."
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-amber-500 focus:outline-none text-slate-800"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isCancelling ? 'Membatalkan...' : 'Ya, Batalkan Izin'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL HAPUS PERMANEN IZIN / CUTI */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Hapus Rekaman Izin</h3>
                  <p className="text-[11px] text-slate-500">Tindakan ini tidak dapat dibatalkan</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setDeleteTarget(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus permanen rekaman pengajuan <strong>{deleteTarget.type}</strong> milik:
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 space-y-1">
              <p className="font-bold text-slate-900">
                {deleteTarget.applicantName} ({deleteTarget.applicantNip || deleteTarget.nip || '-'})
              </p>
              <p className="text-slate-500 text-[11px]">
                Periode: {deleteTarget.startDate} s/d {deleteTarget.endDate}
              </p>
              <p className="text-slate-500 text-[11px] italic">
                "{deleteTarget.reason || '-'}"
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus Permanen'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL TAMBAH IZIN MANUAL OLEH ADMIN */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Catat Izin / Cuti Manual</h3>
                  <p className="text-[11px] text-slate-500">Pencatatan ketidakhadiran resmi GTK oleh Admin</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveManualLeave} className="space-y-4">
              {/* Pilih Guru / Tendik */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Pegawai (Guru / Tendik) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newLeave.employeeNip}
                  onChange={(e) => setNewLeave({ ...newLeave, employeeNip: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none text-slate-800"
                  required
                >
                  <option value="">-- Pilih Guru atau Tendik --</option>
                  {[...employees]
                    .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'id', { sensitivity: 'base' }))
                    .map(emp => (
                      <option key={emp.id || emp.nip} value={emp.nip || emp.id}>
                        {emp.name} ({emp.nip}) - {emp.role === 'tendik' ? 'Tendik' : 'Guru'}
                      </option>
                    ))}
                </select>
              </div>

              {/* Jenis Izin */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jenis Permohonan Izin / Cuti
                </label>
                <select
                  value={newLeave.type}
                  onChange={(e) => setNewLeave({ ...newLeave, type: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none text-slate-800"
                >
                  <option value="Izin Sakit (Surat Dokter)">Izin Sakit (Surat Dokter)</option>
                  <option value="Izin Kepentingan Pribadi/Keluarga">Izin Kepentingan Pribadi/Keluarga</option>
                  <option value="Tugas Dinas Luar / Workshop">Tugas Dinas Luar / Workshop</option>
                  <option value="Cuti Tahunan Resmi">Cuti Tahunan Resmi</option>
                  <option value="Cuti Melahirkan / Bersalin">Cuti Melahirkan / Bersalin</option>
                  <option value="Izin Ibadah Umroh / Haji">Izin Ibadah Umroh / Haji</option>
                </select>
              </div>

              {/* Rentang Tanggal Mulai & Selesai */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={newLeave.startDate}
                    onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    value={newLeave.endDate}
                    onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none text-slate-800"
                    required
                  />
                </div>
              </div>

              {/* Status Persetujuan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Pengajuan Awal
                </label>
                <select
                  value={newLeave.status}
                  onChange={(e) => setNewLeave({ ...newLeave, status: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none text-slate-800"
                >
                  <option value="disetujui">Langsung Disetujui (Rekomendasi Admin)</option>
                  <option value="menunggu">Menunggu Persetujuan Kepala Madrasah</option>
                </select>
              </div>

              {/* Alasan / Keterangan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alasan / Keterangan Izin <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows="3"
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                  placeholder="Tuliskan keterangan lengkap izin..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none text-slate-800"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Permohonan Izin</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
