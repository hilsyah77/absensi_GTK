import { 
  FileQuestion, 
  ArrowUpDown, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MoreVertical,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  Trash2
} from 'lucide-react';
import { formatDateIndonesian, getTodayDateString } from '../../services/attendanceService';

export default function AdminAttendanceTable({
  attendanceList = [],
  selectedDate,
  onAddEmployee,
  onOpenMonthlyReport,
  onDeleteRecord
}) {
  const hasData = attendanceList && attendanceList.length > 0;

  // Format tanggal Indonesia resmi tanpa pergeseran zona waktu
  const targetDate = selectedDate || getTodayDateString();
  const formattedDateTitle = formatDateIndonesian(targetDate);
  const isToday = targetDate === getTodayDateString();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      
      {/* Table Header Section */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Tabel Rekap Presensi Harian</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {hasData ? `${attendanceList.length} Catatan` : '0 Data'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-sky-600" />
            <span>
              Tanggal Pengamatan: <strong className="text-slate-800">{formattedDateTitle}</strong>
              {isToday && (
                <span className="ml-2 text-[10.5px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200/80">
                  Hari Ini
                </span>
              )}
            </span>
          </p>
        </div>

        {/* Right side controls */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {onOpenMonthlyReport && (
            <button
              type="button"
              onClick={() => onOpenMonthlyReport()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200 hover:border-sky-200 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
              title="Lihat format laporan absensi bulanan resmi seperti di upload"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-sky-600" />
              <span>Format Laporan Bulanan (MTs)</span>
            </button>
          )}

          {/* Live sync indicator */}
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-slate-600">Sinkronisasi Realtime</span>
          </div>
        </div>
      </div>

      {/* Responsive Table Wrapper */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th scope="col" className="py-3.5 px-4 sm:px-6">NIP / ID</th>
              <th scope="col" className="py-3.5 px-4">Nama Lengkap</th>
              <th scope="col" className="py-3.5 px-4">Jabatan</th>
              <th scope="col" className="py-3.5 px-4 text-center">Jam Masuk</th>
              <th scope="col" className="py-3.5 px-4 text-center">Jam Pulang</th>
              <th scope="col" className="py-3.5 px-4 text-center">Status</th>
              <th scope="col" className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs">
            {!hasData ? (
              /* REQUIRED EMPTY STATE */
              <tr>
                <td colSpan={7} className="py-16 px-4 text-center">
                  <div className="max-w-md mx-auto flex flex-col items-center justify-center">
                    
                    {/* Neutral Empty State Icon */}
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-400 mb-4 shadow-2xs">
                      <FileQuestion className="w-8 h-8 text-slate-400 stroke-[1.5]" />
                    </div>

                    {/* Exact text as required */}
                    <h3 className="text-sm font-bold text-slate-800 tracking-tight mb-1">
                      Belum ada data presensi untuk tanggal yang dipilih
                    </h3>

                    {/* Helpful neutral description */}
                    <p className="text-xs text-slate-500 text-center leading-relaxed max-w-sm mb-6">
                      Data kehadiran guru dan tenaga kependidikan akan otomatis terhimpun secara instan saat pegawai melakukan check-in melalui aplikasi presensi.
                    </p>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center justify-center gap-2.5">
                      {onOpenMonthlyReport && (
                        <button
                          type="button"
                          onClick={() => onOpenMonthlyReport()}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 transition-colors cursor-pointer"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Lihat Format Laporan Bulanan (Upload)</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={onAddEmployee}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <span>Kelola Master Pegawai</span>
                      </button>
                    </div>

                  </div>
                </td>
              </tr>
            ) : (
              /* If records are populated */
              attendanceList.map((item, index) => (
                <tr key={item.id || index} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 sm:px-6 font-mono font-medium text-slate-700">
                    {item.nip || '-'}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span>{item.name}</span>
                      {item.isDutyTeacher && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          ⭐ Piket Pagi
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {item.role || item.position || '-'}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-700">
                    {item.checkIn || '-'}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-700">
                    {item.checkOut || '-'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {item.status || 'Hadir'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {onOpenMonthlyReport && (
                        <button
                          type="button"
                          onClick={() => onOpenMonthlyReport(item)}
                          className="p-1.5 rounded-lg hover:bg-sky-50 text-slate-400 hover:text-sky-600 transition-colors cursor-pointer"
                          title="Lihat Laporan Bulanan Pegawai Ini"
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                        </button>
                      )}
                      {onDeleteRecord && (
                        <button
                          type="button"
                          onClick={() => onDeleteRecord(item)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Hapus Rekaman Presensi Permanen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                        title="Opsi"
                      >
                        <MoreVertical className="w-4 h-4 ml-auto" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Pagination & Metrics Shell */}
      <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
        <div className="font-medium">
          Menampilkan <span className="font-semibold text-slate-700">{attendanceList.length}</span> dari <span className="font-semibold text-slate-700">{attendanceList.length}</span> data presensi
        </div>

        {/* Disabled Pagination Shell */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            type="button"
            disabled
            className="p-1.5 rounded-lg border border-slate-200 text-slate-300 bg-white cursor-not-allowed"
            title="Halaman Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="px-3 py-1 rounded-lg bg-sky-600 text-white font-semibold text-xs shadow-2xs">
            1
          </span>

          <button
            type="button"
            disabled
            className="p-1.5 rounded-lg border border-slate-200 text-slate-300 bg-white cursor-not-allowed"
            title="Halaman Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
