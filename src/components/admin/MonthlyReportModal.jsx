import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  FileSpreadsheet, 
  Calendar, 
  User, 
  Building2, 
  Check, 
  Copy,
  ChevronDown,
  Sparkles,
  Maximize2,
  Minimize2,
  ShieldCheck,
  QrCode,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { 
  subscribeMonthAttendances, 
  subscribeLeaveRequests, 
  subscribeEmployees,
  getSystemConfig,
  getSchoolProfile,
  subscribeSchoolProfile,
  getTodayDateString
} from '../../services/attendanceService';

export default function MonthlyReportModal({
  isOpen,
  onClose,
  initialEmployee = null,
  initialMonth = '',
  employees: propEmployees = null,
  onExportSuccess
}) {
  // Tentukan bulan awal (default bulan saat ini atau initialMonth)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    if (initialMonth) return initialMonth;
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    return `${now.getFullYear()}-${mm}`;
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Master Pegawai Realtime
  const [employeesList, setEmployeesList] = useState(propEmployees || []);
  const [selectedEmployeeNip, setSelectedEmployeeNip] = useState(
    initialEmployee?.nip || initialEmployee?.id || ''
  );

  // Rekaman Presensi & Izin Cuti Bulan Terpilih
  const [monthAttendances, setMonthAttendances] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [systemConfig, setSystemConfig] = useState(() => getSystemConfig());
  const [schoolProfile, setSchoolProfile] = useState(() => getSchoolProfile());

  const printRef = useRef(null);

  // Sinkronisasi Pegawai jika belum dipassing dari prop
  useEffect(() => {
    if (propEmployees && propEmployees.length > 0) {
      setEmployeesList(propEmployees);
      if (!selectedEmployeeNip && propEmployees[0]) {
        setSelectedEmployeeNip(propEmployees[0].nip || propEmployees[0].id);
      }
    } else {
      const unsub = subscribeEmployees((list) => {
        if (list && list.length > 0) {
          setEmployeesList(list);
          if (!selectedEmployeeNip && list[0]) {
            setSelectedEmployeeNip(list[0].nip || list[0].id);
          }
        }
      });
      return () => {
        if (typeof unsub === 'function') unsub();
      };
    }
  }, [propEmployees]);

  // Jika initialEmployee berubah dari luar
  useEffect(() => {
    if (initialEmployee) {
      setSelectedEmployeeNip(initialEmployee.nip || initialEmployee.id || '');
    }
  }, [initialEmployee]);

  // Sinkronisasi Data Presensi Bulan Terpilih, Cuti, & Identitas Sekolah
  useEffect(() => {
    if (!isOpen) return;

    const unsubAttendances = subscribeMonthAttendances(selectedMonth, (list) => {
      setMonthAttendances(list || []);
    });

    const unsubLeaves = subscribeLeaveRequests((leaves) => {
      setLeaveRequests(leaves || []);
    });

    const unsubProfile = subscribeSchoolProfile((profile) => {
      if (profile) setSchoolProfile(profile);
    });

    setSystemConfig(getSystemConfig());

    return () => {
      if (typeof unsubAttendances === 'function') unsubAttendances();
      if (typeof unsubLeaves === 'function') unsubLeaves();
      if (typeof unsubProfile === 'function') unsubProfile();
    };
  }, [selectedMonth, isOpen]);

  // Sinkronisasi pemindahan elemen cetak langsung ke body agar halaman web TIDAK PERNAH ikut tercetak
  useEffect(() => {
    if (!isOpen) return;

    const onBefore = () => {
      const printable = printRef.current;
      const root = document.getElementById('root');
      if (!printable || !root || document.getElementById('print-placeholder-marker')) return;

      const placeholder = document.createElement('div');
      placeholder.id = 'print-placeholder-marker';
      printable.parentNode.insertBefore(placeholder, printable);

      document.body.appendChild(printable);
      printable.classList.add('direct-body-print');
      root.style.display = 'none';
    };

    const onAfter = () => {
      const printable = printRef.current;
      const root = document.getElementById('root');
      const placeholder = document.getElementById('print-placeholder-marker');

      if (placeholder && printable && placeholder.parentNode) {
        placeholder.parentNode.insertBefore(printable, placeholder);
        placeholder.parentNode.removeChild(placeholder);
      }
      if (printable) {
        printable.classList.remove('direct-body-print');
      }
      if (root) {
        root.style.display = '';
      }
    };

    window.addEventListener('beforeprint', onBefore);
    window.addEventListener('afterprint', onAfter);

    return () => {
      window.removeEventListener('beforeprint', onBefore);
      window.removeEventListener('afterprint', onAfter);
      onAfter();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Pegawai terpilih saat ini
  const activeEmployee = employeesList.find(
    e => (e.nip && e.nip === selectedEmployeeNip) || (e.id && e.id === selectedEmployeeNip)
  ) || initialEmployee || employeesList[0] || {
    name: 'MUKHAMAD ARIS, S.Pd',
    nip: '91000077133655',
    role: 'guru',
    position: 'Guru Mata Pelajaran'
  };

  // Parsing Tahun & Bulan
  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = parseInt(yearStr, 10) || new Date().getFullYear();
  const month = parseInt(monthStr, 10) || (new Date().getMonth() + 1);

  const monthNames = [
    'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
    'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
  ];
  const monthName = monthNames[month - 1] || 'JANUARI';

  // Jumlah hari dalam bulan
  const daysInMonth = new Date(year, month, 0).getDate();
  const dayNamesIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  // Jadwal resmi dari konfigurasi
  const defaultCheckIn = systemConfig.checkInTime || '07:00';
  const defaultCheckOutRegular = systemConfig.checkOutTime || '14:30';
  const defaultCheckOutFriday = systemConfig.fridayCheckOutTime || '11:30';
  const defaultCheckOutSaturday = systemConfig.saturdayCheckOutTime || '15:00';

  // Hari ini untuk kalkulasi status tanggal yang sudah lewat
  const todayStr = getTodayDateString();

  // Susun data presensi harian guru terpilih sepanjang bulan
  const rows = [];
  let totalHariEfektif = 0;
  let hadirCount = 0;
  let tepatWaktuCount = 0;
  let terlambatCount = 0;
  let izinCount = 0;
  let alpaCount = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay(); // 0 = Minggu
    const dayName = dayNamesIndo[dayOfWeek];

    const dd = String(day).padStart(2, '0');
    const mm = String(month).padStart(2, '0');
    const yyyy = year;
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const tanggalFormatted = `${dayName}, ${dd}/${mm}/${yyyy}`;

    const isSunday = (dayOfWeek === 0);
    const isPastOrToday = dateStr <= todayStr;

    // Cek apakah tanggal ini terdaftar di hari libur kalender sekolah / nasional
    const holidayMatch = (systemConfig.holidays || []).find(h => {
      return h.disableAttendance && dateStr >= h.startDate && dateStr <= h.endDate;
    });

    // Tentukan jam kerja terjadwal
    let jadwalMasuk = defaultCheckIn;
    let jadwalPulang = defaultCheckOutRegular;
    if (dayOfWeek === 5) jadwalPulang = defaultCheckOutFriday;
    else if (dayOfWeek === 6) jadwalPulang = defaultCheckOutSaturday;

    if (isSunday || holidayMatch) {
      jadwalMasuk = '-';
      jadwalPulang = '-';
    } else {
      totalHariEfektif++;
    }

    // Cari rekaman presensi riil guru untuk tanggal ini
    const attRecord = monthAttendances.find(
      a => a.date === dateStr && (
        (a.nip && a.nip === activeEmployee.nip) || 
        (a.name && activeEmployee.name && a.name.toLowerCase() === activeEmployee.name.toLowerCase())
      )
    );

    // Cari pengajuan izin/cuti yang disetujui untuk guru ini
    const leaveMatch = leaveRequests.find(l => {
      const nipMatch = (l.applicantNip && l.applicantNip === activeEmployee.nip) || (l.nip && l.nip === activeEmployee.nip);
      const nameMatch = l.applicantName && activeEmployee.name && l.applicantName.toLowerCase() === activeEmployee.name.toLowerCase();
      const isApproved = l.status === 'disetujui';
      const inDateRange = dateStr >= l.startDate && dateStr <= l.endDate;
      return (nipMatch || nameMatch) && isApproved && inDateRange;
    });

    let scanMasuk = '-';
    let scanPulang = '-';
    let statusText = '';
    let statusType = 'normal'; // 'hadir' | 'terlambat' | 'izin' | 'libur' | 'alpa' | 'future'
    let keterangan = '';

    if (isSunday) {
      statusText = 'Libur Rutin';
      statusType = 'libur';
      keterangan = 'Hari Ahad / Libur Mingguan';
    } else if (holidayMatch) {
      statusText = holidayMatch.name || 'Libur Umum';
      statusType = 'libur';
      keterangan = holidayMatch.description || 'Hari Libur Resmi Madrasah';
    } else if (attRecord && attRecord.checkIn) {
      scanMasuk = attRecord.checkIn.replace(' WIB', '');
      scanPulang = attRecord.checkOut ? attRecord.checkOut.replace(' WIB', '') : '--:--';
      
      hadirCount++;
      if (attRecord.isLate || attRecord.status === 'Terlambat') {
        terlambatCount++;
        statusText = 'Terlambat';
        statusType = 'terlambat';
        keterangan = 'Hadir (Lewat Batas Tepat Waktu)';
      } else {
        tepatWaktuCount++;
        statusText = 'Tepat Waktu';
        statusType = 'hadir';
        keterangan = 'Hadir Tepat Waktu';
      }
    } else if (leaveMatch) {
      izinCount++;
      statusText = leaveMatch.type || 'Izin Resmi';
      statusType = 'izin';
      keterangan = leaveMatch.reason ? `Izin Disahkan: "${leaveMatch.reason}"` : 'Disetujui Kamad';
    } else if (isPastOrToday) {
      alpaCount++;
      statusText = 'Tanpa Keterangan';
      statusType = 'alpa';
      keterangan = 'Tidak Tercatat Presensi';
    } else {
      statusText = 'Belum Berlangsung';
      statusType = 'future';
      keterangan = '-';
    }

    rows.push({
      day,
      dateStr,
      tanggalFormatted,
      dayName,
      jadwalMasuk,
      jadwalPulang,
      scanMasuk,
      scanPulang,
      statusText,
      statusType,
      keterangan,
      isSunday,
      isHoliday: !!holidayMatch
    });
  }

  // Persentase Kehadiran Resmi
  const persentaseKehadiran = totalHariEfektif > 0 
    ? Math.min(100, Math.round(((hadirCount + izinCount) / totalHariEfektif) * 100)) 
    : 100;

  let kategoriDisiplin = 'SANGAT BAIK';
  if (persentaseKehadiran < 75) kategoriDisiplin = 'PERLU PEMBINAAN';
  else if (persentaseKehadiran < 85) kategoriDisiplin = 'CUKUP';
  else if (persentaseKehadiran < 95) kategoriDisiplin = 'BAIK';

  const periodeStr = `01-${String(month).padStart(2, '0')}-${year} s/d ${String(daysInMonth).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`;
  const titimangsaDate = `${daysInMonth} ${monthName.charAt(0) + monthName.slice(1).toLowerCase()} ${year}`;


  // Cetak Dokumen via Dialog Browser Langsung (Save as PDF)
  const handlePrint = () => {
    const printable = printRef.current;
    const root = document.getElementById('root');
    if (!printable || !root) {
      window.print();
      return;
    }

    if (!document.getElementById('print-placeholder-marker')) {
      const placeholder = document.createElement('div');
      placeholder.id = 'print-placeholder-marker';
      printable.parentNode.insertBefore(placeholder, printable);

      document.body.appendChild(printable);
      printable.classList.add('direct-body-print');
      root.style.display = 'none';
    }

    window.print();

    setTimeout(() => {
      const placeholder = document.getElementById('print-placeholder-marker');
      if (placeholder && printable && placeholder.parentNode) {
        placeholder.parentNode.insertBefore(printable, placeholder);
        placeholder.parentNode.removeChild(placeholder);
      }
      if (printable) {
        printable.classList.remove('direct-body-print');
      }
      if (root) {
        root.style.display = '';
      }
    }, 600);
  };

  // Buka Dokumen Bersih di Tab Baru Khusus Cetak (100% Bebas Efek Modal & Lengkap Halaman 1 & 2)
  const handleOpenInNewTab = () => {
    const printableElement = printRef.current;
    if (!printableElement) {
      window.print();
      return;
    }

    const newTab = window.open('', '_blank');
    if (!newTab) {
      window.print();
      return;
    }

    const headStyles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(el => el.outerHTML)
      .join('\n');

    newTab.document.open();
    newTab.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Laporan Presensi - ${activeEmployee?.name || 'GTK'} - ${monthName} ${year}</title>
          ${headStyles}
          <style>
            @page {
              size: A4 landscape;
              margin: 7mm 10mm 7mm 10mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              background: #f1f5f9;
              margin: 0;
              padding: 24px;
              display: flex;
              flex-direction: column;
              align-items: center;
              font-family: inherit;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            #official-report-printable {
              background: #ffffff;
              width: 100%;
              max-width: 1100px;
              padding: 32px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              border: 1px solid #cbd5e1;
            }
            .page-break-next {
              page-break-before: always;
              break-before: page;
              margin-top: 36px;
              padding-top: 24px;
              border-top: 2px dashed #cbd5e1;
            }
            .floating-print-bar {
              position: fixed;
              top: 16px;
              right: 24px;
              z-index: 9999;
              display: flex;
              gap: 10px;
              background: rgba(15, 23, 42, 0.9);
              padding: 8px 12px;
              border-radius: 12px;
              backdrop-filter: blur(8px);
              box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
            }
            .print-btn-action {
              background: #0284c7;
              color: white;
              padding: 8px 18px;
              border-radius: 8px;
              font-weight: 700;
              font-size: 13px;
              border: none;
              cursor: pointer;
              transition: all 0.2s;
            }
            .print-btn-action:hover {
              background: #0369a1;
            }
            .close-btn-action {
              background: #475569;
              color: white;
              padding: 8px 14px;
              border-radius: 8px;
              font-weight: 600;
              font-size: 13px;
              border: none;
              cursor: pointer;
            }
            .close-btn-action:hover {
              background: #334155;
            }
            @media print {
              body {
                background: #ffffff !important;
                padding: 0 !important;
              }
              #official-report-printable {
                border: none !important;
                box-shadow: none !important;
                padding: 0 !important;
                max-width: 100% !important;
              }
              .page-break-next {
                border-top: none !important;
                margin-top: 0 !important;
                padding-top: 5mm !important;
              }
              .floating-print-bar, .no-print {
                display: none !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="floating-print-bar">
            <button class="print-btn-action" onclick="window.print()">🖨️ Cetak / Simpan PDF</button>
            <button class="close-btn-action" onclick="window.close()">✕ Tutup Tab</button>
          </div>
          <div id="official-report-printable">
            ${printableElement.innerHTML}
          </div>
        </body>
      </html>
    `);
    newTab.document.close();
  };

  // Unduh Berkas Excel (.XLS Terformat)
  const handleDownloadExcel = () => {
    const tableHtml = printRef.current ? printRef.current.innerHTML : '';
    const fullHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
        <style>
          table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; font-size: 10px; }
          th, td { border: 1px solid black; padding: 4px 6px; }
          .header-title { font-size: 13px; font-weight: bold; text-align: center; }
          .text-center { text-align: center; }
          .font-bold { font-weight: bold; }
        </style>
      </head>
      <body>
        ${tableHtml}
      </body>
      </html>
    `;

    const blob = new Blob([fullHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanName = (activeEmployee.name || 'Guru').replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `Laporan_Presensi_${cleanName}_${monthName}_${year}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (onExportSuccess) {
      onExportSuccess('XLS');
    }
  };

  // Salin ringkasan ke clipboard
  const handleCopySummary = () => {
    let tsv = `LAPORAN ABSENSI BULAN ${monthName} ${year}\n`;
    tsv += `Madrasah: MTs Asy-Syafi'iyyah Jatibarang\n`;
    tsv += `Nama: ${activeEmployee.name} | NIP: ${activeEmployee.nip || '-'}\n`;
    tsv += `Fungsi: ${activeEmployee.role === 'tendik' ? 'Tenaga Kependidikan' : 'Pendidik'} | Periode: ${periodeStr}\n\n`;
    tsv += `Total Hadir: ${hadirCount} Hari | Tepat Waktu: ${tepatWaktuCount} | Terlambat: ${terlambatCount}\n`;
    tsv += `Izin/Cuti: ${izinCount} Hari | Persentase: ${persentaseKehadiran}%\n`;

    navigator.clipboard.writeText(tsv).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      {/* CSS Khusus Cetak A4 Landscape & Pemisahan Halaman Presisi */}
      <style>{`
        @page {
          size: A4 landscape;
          margin: 6mm 10mm 6mm 10mm;
        }
        @media print {
          html, body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Sembunyikan seluruh aplikasi web di dalam #root secara mutlak saat cetak */
          #root {
            display: none !important;
          }
          /* Hanya izinkan #official-report-printable yang dipindah ke body untuk dicetak */
          body > *:not(#official-report-printable) {
            display: none !important;
          }
          .no-print {
            display: none !important;
          }
          #official-report-printable {
            display: block !important;
            position: static !important;
            width: 100% !important;
            min-width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .attendance-table-printable {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          .attendance-table-printable tr {
            height: 3.5mm !important;
            line-height: 1.05 !important;
          }
          .attendance-table-printable td, .attendance-table-printable th {
            padding-top: 1px !important;
            padding-bottom: 1px !important;
            font-size: 7.5pt !important;
          }
          .page-break-next {
            page-break-before: always !important;
            break-before: page !important;
            clear: both !important;
            display: block !important;
            margin-top: 0 !important;
            padding-top: 5mm !important;
          }
        }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
        <div 
          className={`bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-200 ${
            isFullscreen ? 'w-full h-full rounded-none m-0' : 'max-w-7xl w-full max-h-[95vh]'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          
          {/* TOP TOOLBAR PENGENDALI (No-print) */}
          <div className="no-print p-4 sm:p-5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-400/30 text-sky-400 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Hasil Laporan PDF Presensi Bulanan GTK</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 uppercase">
                    Format Landscape A4
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Dokumen rekapitulasi kehadiran resmi individual guru standar Kemenag & SIMPATIKA
                </p>
              </div>
            </div>

            {/* Filter Controls: Pilih Guru & Bulan */}
            <div className="flex flex-wrap items-center gap-2.5">
              
              {/* Dropdown Guru / Tendik Riil */}
              <div className="flex items-center gap-1.5 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
                <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-slate-400 hidden sm:inline">Pegawai:</span>
                <select
                  value={selectedEmployeeNip}
                  onChange={(e) => setSelectedEmployeeNip(e.target.value)}
                  className="bg-transparent text-white font-semibold text-xs focus:outline-none cursor-pointer max-w-[160px] sm:max-w-xs truncate"
                >
                  {employeesList.map(emp => (
                    <option key={emp.id || emp.nip} value={emp.nip || emp.id} className="bg-slate-800 text-white">
                      {emp.name} ({emp.role === 'tendik' ? 'Tendik' : 'Guru'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Month Selector */}
              <div className="flex items-center gap-1.5 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
                <Calendar className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="text-slate-400 hidden sm:inline">Bulan:</span>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent text-white font-semibold text-xs focus:outline-none cursor-pointer"
                />
              </div>

              {/* Salin Clipboard */}
              <button
                type="button"
                onClick={handleCopySummary}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                title="Salin ringkasan ke clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? 'Tersalin' : 'Salin'}</span>
              </button>

              {/* Unduh Excel */}
              <button
                type="button"
                onClick={handleDownloadExcel}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                title="Unduh format Microsoft Excel"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Excel</span>
              </button>

              {/* Cetak / Simpan PDF (A4) */}
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-sky-600/30 transition-all cursor-pointer"
                title="Cetak langsung atau simpan sebagai PDF A4"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak / Simpan PDF</span>
              </button>

              {/* Buka di Tab Baru */}
              <button
                type="button"
                onClick={handleOpenInNewTab}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 text-xs font-bold flex items-center gap-1.5 border border-sky-400/30 transition-all cursor-pointer"
                title="Buka dokumen di tab baru bersih khusus cetak & simpan PDF"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tab Baru</span>
              </button>

              {/* Fullscreen */}
              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title={isFullscreen ? 'Kecilkan' : 'Layar Penuh'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Close */}
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-rose-600 transition-colors cursor-pointer ml-1"
                title="Tutup Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* CANVAS DOKUMEN LAPORAN RESMI (PRINTABLE A4) */}
          <div className="flex-1 overflow-auto p-4 sm:p-8 bg-slate-200/60 flex justify-center selection:bg-slate-300">
            
            <div 
              id="official-report-printable"
              ref={printRef}
              className="bg-white text-black p-6 sm:p-8 shadow-lg border border-slate-300 max-w-[1100px] w-full font-sans text-xs selection:bg-slate-200"
              style={{ minWidth: '950px' }}
            >
              
              {/* 1. KOP SURAT RESMI MADRASAH TSANAWIYAH */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b-2 border-black">
                {/* Logo Kiri (Madrasah) */}
                <div className="w-20 h-20 flex items-center justify-center shrink-0">
                  <img 
                    src="/logo.png" 
                    alt="Logo MTs Asy-Syafi'iyyah" 
                    className="w-18 h-18 object-contain"
                  />
                </div>

                {/* Teks Kop Surat */}
                <div className="text-center flex-1 px-4 leading-tight">
                  <h2 className="text-lg sm:text-xl font-extrabold uppercase tracking-tight text-black">
                    {schoolProfile?.schoolName || "MTs ASY-SYAFI'IYYAH JATIBARANG"}
                  </h2>
                  <p className="text-[10.5px] font-semibold text-black mt-1 font-mono">
                    NSM: {schoolProfile?.nsm || "121232120015"} &nbsp;|&nbsp; NPSN: {schoolProfile?.npsn || "20279093"} &nbsp;|&nbsp; Terakreditasi: {schoolProfile?.akreditasi || "A (Unggul)"}
                  </p>
                  <p className="text-[9.5px] text-black italic mt-0.5">
                    Alamat: {schoolProfile?.alamat || "Jl. Mayor Dasuki No. 136 Jatibarang, Kab. Indramayu - Jawa Barat 45273"}
                  </p>
                </div>

                {/* Spacer Kanan agar Posisi Teks Tetap Simetris di Tengah */}
                <div className="w-20 shrink-0" aria-hidden="true" />
              </div>

              {/* Garis Ganda Pembatas Kop Surat */}
              <div className="border-b border-black mb-4 -mt-1" />

              {/* 2. JUDUL DOKUMEN & PERIODE */}
              <div className="text-center mb-4">
                <h3 className="text-sm font-extrabold tracking-wide uppercase text-black underline underline-offset-4">
                  REKAPITULASI KEHADIRAN BULANAN GURU & TENAGA KEPENDIDIKAN
                </h3>
                <p className="text-xs font-bold text-black uppercase mt-1 tracking-wider">
                  BULAN: {monthName} TAHUN {year}
                </p>
              </div>

              {/* 3. KOTAK IDENTITAS PEGAWAI (2 KOLOM RESMI) */}
              <div className="border border-black p-3 mb-4 text-[11px] bg-slate-50/30">
                <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                  
                  {/* Kolom Kiri */}
                  <div className="space-y-1">
                    <div className="flex">
                      <span className="w-32 font-bold text-black">Nama Lengkap</span>
                      <span className="mr-1">:</span>
                      <span className="font-extrabold text-black uppercase">
                        {activeEmployee.name || 'Guru Madrasah'}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-32 font-semibold text-black">NIP / ID GTK</span>
                      <span className="mr-1">:</span>
                      <span className="font-mono font-bold text-black">
                        {activeEmployee.nip || activeEmployee.id || '-'}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-32 font-semibold text-black">Status Pegawai</span>
                      <span className="mr-1">:</span>
                      <span className="text-black">
                        {activeEmployee.status || 'Guru Tetap Madrasah (GTM)'}
                      </span>
                    </div>
                  </div>

                  {/* Kolom Kanan */}
                  <div className="space-y-1">
                    <div className="flex">
                      <span className="w-28 font-semibold text-black">Unit Kerja</span>
                      <span className="mr-1">:</span>
                      <span className="font-bold text-black">MTs Asy-Syafi'iyyah Jatibarang</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 font-semibold text-black">Fungsi / Tugas</span>
                      <span className="mr-1">:</span>
                      <span className="text-black">
                        {activeEmployee.role === 'tendik' ? 'Tenaga Kependidikan' : 'Tenaga Pendidik (Guru)'}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-28 font-semibold text-black">Periode</span>
                      <span className="mr-1">:</span>
                      <span className="font-mono text-black font-semibold">{periodeStr}</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* 4. TABEL PRESENSI HARIAN REALTIME (A4 LANDSCAPE DENSITY) */}
              <table className="attendance-table-printable w-full border-collapse border border-black text-[9.5px] mb-2">
                <thead>
                  <tr className="bg-slate-100 text-center font-bold text-black border-b border-black">
                    <th className="border border-black py-1 px-1 w-8">No</th>
                    <th className="border border-black py-1 px-2 text-left w-36">Hari & Tanggal</th>
                    <th className="border border-black py-1 px-1.5 w-20">Jadwal Msk</th>
                    <th className="border border-black py-1 px-1.5 w-20">Scan Masuk</th>
                    <th className="border border-black py-1 px-1.5 w-20">Jadwal Plg</th>
                    <th className="border border-black py-1 px-1.5 w-20">Scan Pulang</th>
                    <th className="border border-black py-1 px-2 w-32">Status Kehadiran</th>
                    <th className="border border-black py-1 px-2 text-left">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/80">
                  {rows.map((r) => {
                    return (
                      <tr 
                        key={r.day}
                        className={`h-4 leading-tight ${
                          r.isSunday 
                            ? 'bg-slate-100/70' 
                            : r.isHoliday 
                            ? 'bg-amber-50/50' 
                            : r.statusType === 'terlambat' 
                            ? 'bg-amber-50/30' 
                            : ''
                        }`}
                      >
                        <td className="border border-black py-0.5 px-1 text-center font-mono text-[9px]">
                          {r.day}
                        </td>
                        <td className={`border border-black py-0.5 px-2 ${r.isSunday ? 'font-bold italic text-slate-800' : ''}`}>
                          {r.tanggalFormatted}
                        </td>
                        <td className="border border-black py-0.5 px-1 text-center font-mono">
                          {r.jadwalMasuk}
                        </td>
                        <td className={`border border-black py-0.5 px-1 text-center font-mono font-bold ${
                          r.statusType === 'terlambat' ? 'text-amber-800' : ''
                        }`}>
                          {r.scanMasuk}
                        </td>
                        <td className="border border-black py-0.5 px-1 text-center font-mono">
                          {r.jadwalPulang}
                        </td>
                        <td className="border border-black py-0.5 px-1 text-center font-mono font-bold">
                          {r.scanPulang}
                        </td>
                        <td className="border border-black py-0.5 px-1.5 text-center font-semibold">
                          <span className={
                            r.statusType === 'hadir' ? 'text-emerald-800 font-bold' :
                            r.statusType === 'terlambat' ? 'text-amber-800 font-bold' :
                            r.statusType === 'izin' ? 'text-blue-800 font-bold' :
                            r.statusType === 'libur' ? 'text-slate-600 italic' :
                            r.statusType === 'alpa' ? 'text-rose-800 font-bold' : 'text-slate-400'
                          }>
                            {r.statusText}
                          </span>
                        </td>
                        <td className="border border-black py-0.5 px-2 text-black text-[9px] truncate max-w-[260px]">
                          {r.keterangan}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Footer Ringkas Halaman 1 */}
              <div className="flex items-center justify-between text-[9px] text-slate-600 font-mono mt-1 pt-1 border-t border-slate-300">
                <span>Halaman 1 dari 2 • Rekapitulasi Presensi Harian GTK</span>
                <span>MTs Asy-Syafi'iyyah Jatibarang • SIM GTK Digital</span>
              </div>

              {/* Pemisah Halaman untuk Tampilan Layar (No-print) */}
              <div className="no-print my-8 flex items-center gap-3 text-slate-400 text-xs font-semibold">
                <div className="flex-1 border-t-2 border-dashed border-slate-300" />
                <span className="px-4 py-1.5 bg-slate-100 rounded-full border border-slate-300 text-slate-700 shadow-2xs flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-sky-600" />
                  <span>HALAMAN 2 (LEMBAR RINGKASAN STATISTIK & PENGESAHAN)</span>
                </span>
                <div className="flex-1 border-t-2 border-dashed border-slate-300" />
              </div>

              {/* ========================================================================= */}
              {/* HALAMAN 2: RINGKASAN STATISTIK KEHADIRAN & PENGESAHAN RESMI (NEXT PAGE) */}
              {/* ========================================================================= */}
              <div className="page-break-next pt-2 sm:pt-4">
                
                {/* Header Resmi Halaman 2 */}
                <div className="pb-3 mb-5 border-b-2 border-black flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="Logo MTs" className="w-12 h-12 object-contain" />
                    <div>
                      <h4 className="text-sm font-extrabold uppercase text-black tracking-wide">
                        LEMBAR RINGKASAN STATISTIK & PENGESAHAN KEHADIRAN GTK
                      </h4>
                      <p className="text-[10px] font-semibold text-black">
                        MTs Asy-Syafi'iyyah Jatibarang • Periode: {monthName} {year}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-[10px] text-black">
                    <p className="font-bold text-xs">{activeEmployee.name}</p>
                    <p className="font-mono text-slate-700">NIP/ID: {activeEmployee.nip || activeEmployee.id || '-'}</p>
                    <p className="text-slate-600 font-semibold">{activeEmployee.position || (activeEmployee.role === 'tendik' ? 'Tenaga Kependidikan' : 'Guru')}</p>
                  </div>
                </div>

                {/* 5. BOX RINGKASAN REKAPITULASI KEHADIRAN (1 BULAN) */}
                <div className="border-2 border-black p-4 mb-8 bg-slate-50/40 text-[11px]">
                  <div className="font-bold text-black uppercase mb-3 pb-1.5 border-b border-black flex items-center justify-between text-xs tracking-wide">
                    <span>RINGKASAN STATISTIK KEHADIRAN ({monthName.toUpperCase()} {year})</span>
                    <span className="font-mono text-black font-extrabold">INDEKS DISIPLIN: {kategoriDisiplin}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-black leading-relaxed">
                    <div className="space-y-1.5">
                      <p>• Hari Kalender: <strong>{daysInMonth} Hari</strong></p>
                      <p>• Hari Kerja Efektif: <strong>{totalHariEfektif} Hari</strong></p>
                    </div>
                    <div className="space-y-1.5">
                      <p>• Total Kehadiran: <strong className="text-emerald-900">{hadirCount} Hari</strong></p>
                      <p>• Hadir Tepat Waktu: <strong>{tepatWaktuCount} Hari</strong></p>
                    </div>
                    <div className="space-y-1.5">
                      <p>• Hadir Terlambat: <strong className={terlambatCount > 0 ? 'text-amber-800' : ''}>{terlambatCount} Hari</strong></p>
                      <p>• Izin / Cuti Resmi: <strong>{izinCount} Hari</strong></p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border-2 border-black text-center flex flex-col justify-center shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">PERSENTASE KEHADIRAN</span>
                      <span className="text-2xl font-black font-mono text-black mt-1">
                        {persentaseKehadiran}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* 6. LEMBAR PENGESAHAN DUAL SIGNATURE RESMI */}
                <div className="text-[11px] text-black mt-10">
                  <div className="flex justify-between items-start px-8 sm:px-12">
                    
                    {/* Kolom Kiri: Tanda Tangan Pegawai */}
                    <div className="text-center w-72">
                      <p className="text-transparent select-none">_</p>
                      <p className="font-semibold text-black">Pegawai Yang Bersangkutan,</p>
                      <div className="h-28 flex items-center justify-center">
                        <span className="text-[9.5px] text-slate-400 italic font-mono">[ Tanda Tangan ]</span>
                      </div>
                      <p className="font-extrabold uppercase underline text-black text-xs">
                        {activeEmployee.name || 'Guru MTs Asy-Syafi\'iyyah'}
                      </p>
                      <p className="font-mono text-[10.5px] text-black font-semibold mt-0.5">
                        NIP/ID. {activeEmployee.nip || activeEmployee.id || '-'}
                      </p>
                    </div>

                    {/* Kolom Kanan: Tanda Tangan Kepala Madrasah */}
                    <div className="text-center w-80">
                      <p className="font-medium text-black">
                        Jatibarang, {titimangsaDate}
                      </p>
                      <p className="font-semibold text-black">
                        Mengetahui,<br />
                        Kepala {schoolProfile?.schoolName || "MTs Asy-Syafi'iyyah Jatibarang"}
                      </p>
                      
                      {/* Visual Stamp & QR Code */}
                      <div className="h-28 flex items-center justify-center relative my-1">
                        <div className="border border-emerald-800/60 bg-emerald-50/40 text-emerald-900 rounded-lg px-3 py-1.5 text-center shadow-2xs">
                          <span className="text-[8.5px] font-bold tracking-widest block uppercase text-emerald-950">
                            TERVERIFIKASI SISTEM SIM GTK
                          </span>
                          <span className="text-[8px] font-mono text-slate-700 block">
                            Tanda Tangan Digital Resmi Madrasah
                          </span>
                          <span className="text-[7.5px] text-slate-600 font-mono uppercase">
                            {schoolProfile?.schoolName || "MTs ASY-SYAFI'IYYAH JATIBARANG"}
                          </span>
                        </div>
                      </div>

                      <p className="font-extrabold uppercase underline text-black text-xs">
                        {schoolProfile?.headmasterName || "Drs. H. AKHMAD ROSIDI"}
                      </p>
                      <p className="font-mono text-[10.5px] text-black font-semibold mt-0.5">
                        {(() => {
                          const rawNip = (schoolProfile?.headmasterNip || '').trim();
                          if (!rawNip || rawNip === '-') return 'NIP. -';
                          return rawNip.toUpperCase().startsWith('NIP') ? rawNip : `NIP. ${rawNip}`;
                        })()}
                      </p>
                    </div>

                  </div>

                  {/* Footer Barcode / Security ID */}
                  <div className="mt-14 pt-3 border-t border-slate-300 flex items-center justify-between text-[9.5px] text-slate-500 font-mono">
                    <span>Halaman 2 dari 2 • Dokumen Sah SIM Presensi GTK Digital • MTs Asy-Syafi'iyyah Jatibarang</span>
                    <span>Kode Otentikasi: SIMPATIKA-{activeEmployee.nip || 'GTK'}-{selectedMonth}</span>
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* BOTTOM MODAL BAR (No-print) */}
          <div className="no-print p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>
                Dokumen siap cetak langsung atau disimpan sebagai berkas PDF standar A4 resmi madrasah.
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold transition-colors cursor-pointer"
              >
                Tutup
              </button>

              <button
                type="button"
                onClick={handleOpenInNewTab}
                className="px-4 py-2.5 rounded-xl border border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold transition-all cursor-pointer flex items-center gap-2"
                title="Buka dokumen di tab baru bersih khusus cetak & simpan PDF"
              >
                <ExternalLink className="w-4 h-4 text-sky-700" />
                <span>Buka di Tab Baru</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-md shadow-sky-600/20 transition-all cursor-pointer flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Cetak PDF</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
