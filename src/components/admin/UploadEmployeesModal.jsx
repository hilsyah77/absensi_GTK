import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { 
  X, 
  UploadCloud, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Check, 
  Database,
  Trash2,
  FileWarning,
  Loader2
} from 'lucide-react';

export default function UploadEmployeesModal({
  isOpen,
  onClose,
  onUploadSuccess
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [parseError, setParseError] = useState('');

  if (!isOpen) return null;

  // Real Parser using XLSX
  const processUploadedFile = async (file) => {
    if (!file) return;

    setSelectedFile(file);
    setIsParsing(true);
    setParseError('');
    setPreviewData([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });

      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error('Berkas tidak memiliki lembar kerja (worksheet) yang valid.');
      }

      // Gunakan sheet pertama
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Ambil seluruh baris mentah dalam bentuk 2D array
      const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

      if (!rawRows || rawRows.length === 0) {
        throw new Error('Berkas yang diunggah kosong (tidak ada baris data).');
      }

      // Deteksi baris header (mencari baris yang mengandung kata kunci seperti 'nama', 'nip', 'nuptk', dll.)
      let headerRowIdx = -1;
      for (let r = 0; r < Math.min(rawRows.length, 12); r++) {
        const rowStr = rawRows[r].map(c => String(c || '').toLowerCase()).join(' ');
        if (
          rowStr.includes('nama') || 
          rowStr.includes('nip') || 
          rowStr.includes('nuptk') || 
          rowStr.includes('name') ||
          rowStr.includes('jabatan')
        ) {
          headerRowIdx = r;
          break;
        }
      }

      if (headerRowIdx === -1) {
        // Jika tidak terdeteksi kata kunci spesifik, asumsikan baris pertama adalah header
        headerRowIdx = 0;
      }

      const headers = rawRows[headerRowIdx].map(h => String(h || '').trim());

      // Helper untuk mencari index kolom berdasarkan kata kunci
      const findColIdx = (keywords) => {
        return headers.findIndex(h => {
          const cleanH = h.toLowerCase().replace(/[^a-z0-9]/g, '');
          return keywords.some(k => cleanH.includes(k.replace(/[^a-z0-9]/g, '')));
        });
      };

      const nipIdx = findColIdx(['nip', 'nuptk', 'nik', 'pegid', 'idpegawai', 'nomorinduk', 'id']);
      const nameIdx = findColIdx(['namalengkap', 'namapegawai', 'namaguru', 'nama', 'fullname', 'name']);
      const roleIdx = findColIdx(['kategori', 'role', 'jenisgtk', 'jenis', 'statusgtk', 'tipe']);
      const posIdx = findColIdx(['jabatan', 'tugastambahan', 'tugas', 'matapelajaran', 'mapel', 'position']);
      const statusIdx = findColIdx(['statuskepegawaian', 'statuspegawai', 'kepegawaian', 'status']);
      const userIdx = findColIdx(['username', 'user', 'akun']);
      const passIdx = findColIdx(['password', 'katasandi', 'sandi', 'pass']);
      const phoneIdx = findColIdx(['nowhatsapp', 'whatsapp', 'nowa', 'wa', 'nohp', 'telepon', 'phone']);
      const emailIdx = findColIdx(['email', 'surel']);

      const parsedEmployees = [];

      for (let r = headerRowIdx + 1; r < rawRows.length; r++) {
        const row = rawRows[r];
        if (!row || row.every(cell => String(cell || '').trim() === '')) {
          continue; // Lewati baris kosong
        }

        const rawNip = nipIdx !== -1 ? String(row[nipIdx] || '').trim() : '';
        const rawName = nameIdx !== -1 ? String(row[nameIdx] || '').trim() : '';

        // Abaikan jika nama dan NIP kosong
        if (!rawName && !rawNip) continue;

        // Abaikan jika baris berisi header berulang atau baris ringkasan
        const lowerName = rawName.toLowerCase();
        const lowerNip = rawNip.toLowerCase();
        if (
          lowerName === 'nama' || 
          lowerNip === 'nip' || 
          lowerName.includes('total') || 
          lowerName.includes('jumlah')
        ) {
          continue;
        }

        const rawRole = roleIdx !== -1 ? String(row[roleIdx] || '').toLowerCase() : '';
        const rawPos = posIdx !== -1 ? String(row[posIdx] || '').trim() : '';
        const rawStatus = statusIdx !== -1 ? String(row[statusIdx] || '').trim() : 'Aktif';

        // Deteksi kategori GTK (Guru vs Tendik)
        const isTendik = 
          rawRole.includes('tendik') || 
          rawRole.includes('tu') || 
          rawRole.includes('tenaga') || 
          rawRole.includes('staf') ||
          rawPos.toLowerCase().includes('operator') ||
          rawPos.toLowerCase().includes('tata usaha') ||
          rawPos.toLowerCase().includes('tu') ||
          rawPos.toLowerCase().includes('satpam') ||
          rawPos.toLowerCase().includes('penjaga') ||
          rawPos.toLowerCase().includes('kebersihan');

        const role = isTendik ? 'tendik' : 'guru';
        const defaultPos = role === 'guru' ? 'Guru Madrasah' : 'Tenaga Kependidikan';
        const position = rawPos || defaultPos;

        // NIP / ID Pegawai
        const nip = rawNip || (rawName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().slice(0, 10) + `_${r}`);

        // Username untuk login GTK
        let username = '';
        if (userIdx !== -1 && String(row[userIdx] || '').trim()) {
          username = String(row[userIdx]).trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
        } else {
          username = rawNip ? rawNip : rawName.toLowerCase().replace(/[^a-z0-9]/g, '.').replace(/\.+/g, '.').slice(0, 20);
        }

        // Password untuk login GTK
        let password = '';
        if (passIdx !== -1 && String(row[passIdx] || '').trim()) {
          password = String(row[passIdx]).trim();
        } else {
          password = rawNip && rawNip.length >= 4 ? `gtk.${rawNip.slice(-4)}` : 'gtk12345';
        }

        const phone = phoneIdx !== -1 ? String(row[phoneIdx] || '').trim() : '-';
        const email = emailIdx !== -1 ? String(row[emailIdx] || '').trim() : `${username}@mtsasysyafiiyyah.sch.id`;

        parsedEmployees.push({
          id: nip,
          nip,
          name: rawName,
          role,
          position,
          employmentStatus: rawStatus || 'Aktif',
          username,
          password,
          phone: phone || '-',
          email: email,
          createdAt: new Date().toISOString()
        });
      }

      if (parsedEmployees.length === 0) {
        throw new Error('Tidak ditemukan data pegawai yang valid di dalam file. Pastikan terdapat kolom Nama atau NIP.');
      }

      setPreviewData(parsedEmployees);
    } catch (err) {
      console.error('[Parser Error]:', err);
      setParseError(err.message || 'Gagal memproses file. Pastikan format tabel memiliki kolom NIP dan Nama.');
      setPreviewData([]);
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processUploadedFile(file);
    }
  };

  // Unduh Template Resmi .xlsx
  const handleDownloadTemplate = () => {
    try {
      const templateRows = [
        ['NIP', 'Nama Lengkap', 'Kategori (guru/tendik)', 'Jabatan', 'Status Kepegawaian', 'Username', 'Password', 'No WhatsApp'],
        ['198503152010012004', 'Silvia Sugiarto Tindiyah, S.Pd, Gr', 'guru', 'Guru Bahasa Inggris', 'PNS', '198503152010012004', 'rahasia123', '081234567890'],
        ['199405102022031001', 'Muhammad Irfan, S.Kom.', 'tendik', 'Operator SIMPATIKA & EMIS', 'PPPK', '199405102022031001', 'rahasia123', '085612345678'],
        ['199201012021012002', 'Fatimah Az-Zahra, S.Pd.I.', 'guru', 'Guru Fikih & Qur\'an Hadis', 'Non-PNS', '199201012021012002', 'rahasia123', '087812345678']
      ];

      const ws = XLSX.utils.aoa_to_sheet(templateRows);
      ws['!cols'] = [
        { wch: 22 }, // NIP
        { wch: 34 }, // Nama
        { wch: 22 }, // Kategori
        { wch: 30 }, // Jabatan
        { wch: 20 }, // Status
        { wch: 22 }, // Username
        { wch: 16 }, // Password
        { wch: 18 }  // No WA
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data_Pegawai');
      XLSX.writeFile(wb, 'Template_Import_Pegawai_SIM_GTK.xlsx');
    } catch (err) {
      console.error('Gagal generate template xlsx, fallback ke csv:', err);
      const csv = 'NIP,Nama_Lengkap,Kategori(guru/tendik),Jabatan,Status_Kepegawaian,Username,Password,No_WhatsApp\n198503152010012004,"Silvia Sugiarto Tindiyah, S.Pd, Gr",guru,"Guru Bahasa Inggris",PNS,198503152010012004,rahasia123,081234567890\n199405102022031001,"Muhammad Irfan, S.Kom.",tendik,"Operator SIMPATIKA & EMIS",PPPK,199405102022031001,rahasia123,085612345678\n';
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Template_Import_Pegawai_SIM_GTK.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleResetFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    setPreviewData([]);
    setParseError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!previewData || previewData.length === 0) return;

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      if (onUploadSuccess) {
        onUploadSuccess(previewData);
      }
      setSelectedFile(null);
      setPreviewData([]);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Upload Data Pegawai Massal</h3>
              <p className="text-xs text-slate-500">Membaca file Excel (.xlsx, .xls) atau CSV resmi madrasah</p>
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

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          
          {/* Download Template Banner */}
          <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs text-slate-700">
              <FileSpreadsheet className="w-5 h-5 text-sky-600 shrink-0" />
              <div>
                <p className="font-bold text-slate-900">Unduh Format Template Resmi (.xlsx)</p>
                <p className="text-[11px] text-slate-500">Gunakan format kolom resmi agar seluruh data pegawai terpetakan otomatis.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-sky-700 border border-sky-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Template (.xlsx)</span>
            </button>
          </div>

          {/* File Upload / Drop Area */}
          <div>
            <label 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={`relative flex flex-col items-center justify-center p-6 sm:p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                selectedFile 
                  ? 'border-emerald-400 bg-emerald-50/20' 
                  : 'border-slate-300 hover:border-sky-400 bg-slate-50/60 hover:bg-sky-50/20'
              }`}
            >
              <input
                type="file"
                className="sr-only"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
              />

              <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center mb-3">
                {isParsing ? (
                  <Loader2 className="w-6 h-6 text-sky-600 animate-spin" />
                ) : selectedFile ? (
                  <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
                ) : (
                  <UploadCloud className="w-6 h-6 text-sky-600" />
                )}
              </div>

              {selectedFile ? (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <Check className="w-3.5 h-3.5" /> Berkas Terpilih
                    </span>
                    <button
                      type="button"
                      onClick={handleResetFile}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Ganti berkas"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs font-bold text-slate-900">{selectedFile.name}</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {(selectedFile.size / 1024).toFixed(1)} KB • {isParsing ? 'Sedang memproses baris data...' : `${previewData.length} Data Pegawai Terdeteksi`}
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-xs font-semibold text-slate-800">
                    <span className="text-sky-600 font-bold">Pilih berkas Excel / CSV</span> atau seret file ke area ini
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Mendukung berkas Excel (.xlsx, .xls) atau teks (.csv)
                  </p>
                </div>
              )}
            </label>
          </div>

          {/* Error Message */}
          {parseError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
              <FileWarning className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Gagal Membaca File:</p>
                <p className="text-[11px] mt-0.5">{parseError}</p>
              </div>
            </div>
          )}

          {/* Preview Parsed Data if Selected */}
          {previewData.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">Pratinjau Data yang Terbaca dari File:</span>
                <span className="text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[11px]">
                  {previewData.length} Pegawai Siap Diimpor
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs max-h-52 overflow-y-auto shadow-2xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100/90 sticky top-0 text-[10px] font-bold text-slate-500 uppercase z-10">
                    <tr>
                      <th className="py-2.5 px-3">No</th>
                      <th className="py-2.5 px-3">NIP / ID</th>
                      <th className="py-2.5 px-3">Nama Lengkap</th>
                      <th className="py-2.5 px-3">Kategori</th>
                      <th className="py-2.5 px-3">Jabatan</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {previewData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 px-3 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-2 px-3 font-mono text-slate-700 font-medium">{row.nip}</td>
                        <td className="py-2 px-3 font-semibold text-slate-900">{row.name}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                            row.role === 'guru' 
                              ? 'bg-sky-50 text-sky-700 border-sky-200' 
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          }`}>
                            {row.role === 'guru' ? 'Guru' : 'Tendik'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-600">{row.position}</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {row.employmentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Institutional note */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px] text-slate-500 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Data akan otomatis disinkronkan ke Cloud Firestore dan mengaktifkan hak akses login presensi bagi seluruh GTK terdaftar.
            </span>
          </div>

        </div>

        {/* Modal Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={previewData.length === 0 || isProcessing || isParsing}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 shadow-sm shadow-sky-600/30 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan ke Database...</span>
              </>
            ) : (
              <>
                <Database className="w-4 h-4" />
                <span>Simpan {previewData.length > 0 ? `${previewData.length} Pegawai` : ''} ke Database</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
