import React, { useState } from 'react';
import { 
  CalendarClock, 
  FileText, 
  CheckCircle2, 
  Trash2,
  Calendar,
  FileCheck,
  FileSpreadsheet
} from 'lucide-react';
import EmptyState from './EmptyState';

export default function ActivitySection({
  attendanceState,
  leaveRequests = [],
  onOpenCheckIn,
  onOpenLeaveModal,
  onResetAttendance,
  onClearLeaves,
  onOpenMonthlyReport
}) {
  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance' | 'leaves'

  const hasAttendance = attendanceState.status !== 'belum';
  const hasLeaves = leaveRequests.length > 0;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-lg shadow-sky-900/5 border border-sky-100/90 text-slate-800">
      
      {/* Section Header with Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Riwayat Aktivitas & Permohonan
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Log pencatatan kehadiran GTK dan status persetujuan administrasi.
          </p>
        </div>

        {/* Actions & Tab Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {onOpenMonthlyReport && (
            <button
              type="button"
              onClick={onOpenMonthlyReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 transition-all cursor-pointer shadow-2xs"
              title="Lihat format laporan absensi bulanan model resmi madrasah"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Format Laporan Bulanan (MTs)</span>
            </button>
          )}

          {/* Tab Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-sky-50 rounded-2xl border border-sky-100">
            <button
              type="button"
              onClick={() => setActiveTab('attendance')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'attendance'
                  ? 'bg-white text-sky-900 shadow-xs border border-sky-200/60'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <CalendarClock className="w-3.5 h-3.5 text-sky-600" />
              <span>Presensi Hari Ini</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                hasAttendance ? 'bg-emerald-100 text-emerald-800 font-bold' : 'bg-slate-200 text-slate-600'
              }`}>
                {hasAttendance ? '1' : '0'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('leaves')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'leaves'
                  ? 'bg-white text-sky-900 shadow-xs border border-sky-200/60'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-sky-600" />
              <span>Pengajuan Cuti</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                hasLeaves ? 'bg-sky-100 text-sky-800 font-bold' : 'bg-slate-200 text-slate-600'
              }`}>
                {leaveRequests.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="mt-5">
        
        {/* Tab 1: Presensi Hari Ini */}
        {activeTab === 'attendance' && (
          <div>
            {!hasAttendance ? (
              // Empty State
              <EmptyState
                iconType="calendar"
                badgeText="Presensi Belum Tercatat"
                title="Belum ada riwayat aktivitas hari ini"
                description="Anda belum melakukan presensi masuk maupun pulang untuk tanggal hari ini. Silakan klik tombol Presensi Masuk di atas saat tiba di sekolah."
                actionLabel="Lakukan Presensi Masuk Sekarang"
                onAction={onOpenCheckIn}
              />
            ) : (
              // Populated Attendance Card
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-sky-50/60 border border-sky-200/80 relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-sky-200/60">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          Presensi Kehadiran Tercatat
                        </h4>
                        <p className="text-xs text-slate-500">
                          Sistem Validasi Geofencing & Koordinat GPS GTK
                        </p>
                      </div>
                    </div>
                    <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Tepat Waktu
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-4 text-xs">
                    <div className="bg-white p-3.5 rounded-xl border border-sky-100 shadow-2xs">
                      <span className="text-slate-400 block mb-1">Jam Presensi Masuk</span>
                      <span className="font-digital text-base font-bold text-sky-900">
                        {attendanceState.checkInTime}
                      </span>
                      <span className="text-[11px] text-emerald-600 block mt-0.5 font-medium">
                        ✓ Terverifikasi Server
                      </span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-sky-100 shadow-2xs">
                      <span className="text-slate-400 block mb-1">Jam Presensi Pulang</span>
                      <span className="font-digital text-base font-bold text-amber-800">
                        {attendanceState.checkOutTime || 'Belum Presensi'}
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        {attendanceState.checkOutTime ? '✓ Jam Kerja Terpenuhi' : 'Menunggu Akhir Jam Kerja'}
                      </span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-sky-100 shadow-2xs">
                      <span className="text-slate-400 block mb-1">Titik Koordinat & Status</span>
                      <span className="font-medium text-slate-800 block truncate">
                        Gerbang Utama (Radius 8m)
                      </span>
                      <span className="text-[11px] text-sky-700 block mt-0.5 font-mono">
                        Lat: -6.2088 • Long: 106.8456
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-sky-200/60 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">
                      ID Referensi: #GTK-{new Date().getFullYear()}-0942
                    </span>
                    <span className="text-[11px] text-emerald-600 font-medium">
                      ✓ Data Tersimpan di Server
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Pengajuan Cuti / Izin */}
        {activeTab === 'leaves' && (
          <div>
            {!hasLeaves ? (
              // Empty state for leave applications
              <EmptyState
                iconType="file"
                badgeText="Belum Ada Pengajuan"
                title="Belum ada riwayat permohonan cuti / izin"
                description="Anda belum memiliki pengajuan izin sakit, dinas luar, atau cuti tahunan yang sedang aktif untuk periode ini."
                actionLabel="Ajukan Izin / Cuti Sekarang"
                onAction={onOpenLeaveModal}
              />
            ) : (
              // List of submitted leaves
              <div className="space-y-3">
                {leaveRequests.map((leave) => (
                  <div 
                    key={leave.id}
                    className="p-4 sm:p-5 rounded-2xl bg-sky-50/50 border border-sky-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-sky-100 border border-sky-200 text-sky-700 rounded-xl shrink-0 mt-0.5">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">
                            {leave.type}
                          </h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            leave.status === 'disetujui'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : leave.status === 'ditolak'
                                ? 'bg-rose-100 text-rose-800 border-rose-300'
                                : 'bg-amber-100 text-amber-800 border-amber-200'
                          }`}>
                            {leave.status === 'disetujui' ? '✓ Disetujui Kamad' : (leave.status === 'ditolak' ? '✕ Ditolak' : '⏳ Menunggu Verifikasi')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-sky-600" />
                          <span>{leave.startDate} s/d {leave.endDate} ({leave.duration} Hari)</span>
                        </p>
                        <p className="text-xs text-slate-700 mt-1 bg-white p-2.5 rounded-lg border border-sky-100">
                          <span className="font-medium text-slate-500">Keterangan:</span> {leave.reason}
                        </p>
                        {leave.fileName && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-sky-700 font-medium mt-1.5">
                            📎 Lampiran: {leave.fileName}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="sm:text-right shrink-0">
                      <span className="text-[11px] text-slate-400 block">
                        Tujuan Verifikator:
                      </span>
                      <span className="text-xs font-semibold text-slate-800 block">
                        Kepala Madrasah (Drs. H. Akhmad Rosidi)
                      </span>
                    </div>
                  </div>
                ))}

                <div className="pt-2 flex justify-between items-center text-xs">
                  <button
                    type="button"
                    onClick={onOpenLeaveModal}
                    className="font-semibold text-sky-700 hover:text-sky-800 cursor-pointer"
                  >
                    + Tambah Pengajuan Baru
                  </button>
                  <button
                    type="button"
                    onClick={onClearLeaves}
                    className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    Kosongkan Data Cuti
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
