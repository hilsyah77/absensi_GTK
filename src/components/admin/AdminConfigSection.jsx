import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  SlidersHorizontal, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  ShieldCheck, 
  Radio, 
  Compass,
  AlertCircle,
  Calendar,
  CalendarDays,
  Plus,
  Trash2,
  Tag,
  Palmtree,
  Sparkles,
  Info,
  X
} from 'lucide-react';
import { 
  getSystemConfig, 
  saveSystemConfig, 
  subscribeSystemConfig, 
  DEFAULT_CONFIG 
} from '../../services/attendanceService';

export default function AdminConfigSection({ onShowToast }) {
  // Geofencing state (editable form)
  const [geoConfig, setGeoConfig] = useState(() => {
    const cfg = getSystemConfig();
    return {
      locationName: cfg.locationName || 'Kampus Utama MTs Asy-Syafi\'iyyah Jatibarang',
      latitude: cfg.latitude || '-6.208800',
      longitude: cfg.longitude || '106.845600',
      radius: cfg.radius || 50
    };
  });

  // Shift & Work Hours state (including Saturday checkout time)
  const [shiftConfig, setShiftConfig] = useState(() => {
    const cfg = getSystemConfig();
    return {
      checkInStartTime: cfg.checkInStartTime || '06:00',
      checkInTime: cfg.checkInTime || '07:00',
      lateTolerance: cfg.lateTolerance || '07:15',
      checkOutTime: cfg.checkOutTime || '15:30',
      fridayCheckOutTime: cfg.fridayCheckOutTime || '11:30',
      saturdayCheckOutTime: cfg.saturdayCheckOutTime || '13:00',
      activeDays: cfg.activeDays || ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    };
  });

  // Sinkronisasi realtime konfigurasi dari server database
  useEffect(() => {
    const unsub = subscribeSystemConfig((cfg) => {
      if (cfg) {
        setGeoConfig({
          locationName: cfg.locationName || 'Kampus Utama MTs Asy-Syafi\'iyyah Jatibarang',
          latitude: cfg.latitude || '-6.208800',
          longitude: cfg.longitude || '106.845600',
          radius: cfg.radius || 50
        });
        setShiftConfig({
          checkInStartTime: cfg.checkInStartTime || '06:00',
          checkInTime: cfg.checkInTime || '07:00',
          lateTolerance: cfg.lateTolerance || '07:15',
          checkOutTime: cfg.checkOutTime || '15:30',
          fridayCheckOutTime: cfg.fridayCheckOutTime || '11:30',
          saturdayCheckOutTime: cfg.saturdayCheckOutTime || '13:00',
          activeDays: cfg.activeDays || ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
        });
      }
    });

    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  // Setting Hari Liburan Sekolah & Libur Nasional
  const [autoDisableOnHolidays, setAutoDisableOnHolidays] = useState(true);
  const [holidayFilter, setHolidayFilter] = useState('all'); // 'all' | 'nasional' | 'sekolah'
  
  // List of holidays (Liburan Sekolah & Libur Nasional)
  const [holidays, setHolidays] = useState([
    {
      id: 'h-1',
      name: 'Libur Akhir Semester Ganjil',
      type: 'sekolah', // 'sekolah' | 'nasional' | 'cuti'
      startDate: '2026-12-21',
      endDate: '2027-01-02',
      description: 'Libur jeda semester ganjil kalender pendidikan sekolah',
      disableAttendance: true
    },
    {
      id: 'h-2',
      name: 'Tahun Baru Masehi 2027',
      type: 'nasional',
      startDate: '2027-01-01',
      endDate: '2027-01-01',
      description: 'Hari libur resmi nasional penetapan SKB 3 Menteri',
      disableAttendance: true
    },
    {
      id: 'h-3',
      name: 'Libur Awal Ramadhan 1448 H',
      type: 'sekolah',
      startDate: '2027-02-10',
      endDate: '2027-02-12',
      description: 'Penetapan libur awal puasa madrasah/sekolah',
      disableAttendance: true
    },
    {
      id: 'h-4',
      name: 'Hari Raya Idul Fitri & Cuti Bersama',
      type: 'nasional',
      startDate: '2027-03-20',
      endDate: '2027-03-25',
      description: 'Libur nasional dan cuti bersama keagamaan',
      disableAttendance: true
    }
  ]);

  // Form state for adding new holiday
  const [isAddHolidayModalOpen, setIsAddHolidayModalOpen] = useState(false);
  const [newHoliday, setNewHoliday] = useState({
    name: '',
    type: 'nasional',
    startDate: '',
    endDate: '',
    description: '',
    disableAttendance: true
  });

  const [isSaving, setIsSaving] = useState(false);

  const daysOfWeek = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  const toggleDay = (day) => {
    if (shiftConfig.activeDays.includes(day)) {
      setShiftConfig(prev => ({
        ...prev,
        activeDays: prev.activeDays.filter(d => d !== day)
      }));
    } else {
      setShiftConfig(prev => ({
        ...prev,
        activeDays: [...prev.activeDays, day]
      }));
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGeoConfig(prev => ({
            ...prev,
            latitude: pos.coords.latitude.toFixed(6),
            longitude: pos.coords.longitude.toFixed(6)
          }));
          if (onShowToast) {
            onShowToast('GPS Diperbarui', 'Koordinat berhasil sinkron dari sensor perangkat Anda.', 'success');
          }
        },
        () => {
          if (onShowToast) {
            onShowToast('GPS Default', 'Menggunakan koordinat preset simulasi sekolah.', 'info');
          }
        }
      );
    }
  };

  // Add new holiday
  const handleAddHoliday = (e) => {
    e.preventDefault();
    if (!newHoliday.name.trim() || !newHoliday.startDate) {
      if (onShowToast) {
        onShowToast('Validasi Gagal', 'Nama hari libur dan tanggal mulai wajib diisi.', 'error');
      }
      return;
    }

    const created = {
      id: 'h-' + Date.now(),
      ...newHoliday,
      endDate: newHoliday.endDate || newHoliday.startDate
    };

    setHolidays(prev => [created, ...prev]);
    setIsAddHolidayModalOpen(false);
    setNewHoliday({
      name: '',
      type: 'nasional',
      startDate: '',
      endDate: '',
      description: '',
      disableAttendance: true
    });

    if (onShowToast) {
      onShowToast('Hari Libur Ditambahkan', `"${created.name}" berhasil dimasukkan ke kalender presensi.`, 'success');
    }
  };

  // Delete holiday
  const handleDeleteHoliday = (id, name) => {
    setHolidays(prev => prev.filter(h => h.id !== id));
    if (onShowToast) {
      onShowToast('Hari Libur Dihapus', `Data "${name}" berhasil dihapus dari jadwal libur.`, 'info');
    }
  };

  // Save all configuration
  const handleSave = async (e) => {
    e?.preventDefault();
    setIsSaving(true);
    await saveSystemConfig({
      ...geoConfig,
      ...shiftConfig,
      checkInEndTime: shiftConfig.checkInEndTime || shiftConfig.lateTolerance,
      holidays,
      autoDisableOnHolidays
    });
    setIsSaving(false);
    if (onShowToast) {
      onShowToast('Konfigurasi Tersimpan', 'Titik geofence, jam buka presensi, jam pulang, dan jadwal kerja berhasil disinkronkan ke server.', 'success');
    }
  };

  const handleReset = async () => {
    setGeoConfig({
      locationName: DEFAULT_CONFIG.locationName,
      latitude: DEFAULT_CONFIG.latitude,
      longitude: DEFAULT_CONFIG.longitude,
      radius: DEFAULT_CONFIG.radius
    });
    setShiftConfig({
      checkInStartTime: DEFAULT_CONFIG.checkInStartTime,
      checkInTime: DEFAULT_CONFIG.checkInTime,
      lateTolerance: DEFAULT_CONFIG.lateTolerance,
      checkOutTime: DEFAULT_CONFIG.checkOutTime,
      fridayCheckOutTime: DEFAULT_CONFIG.fridayCheckOutTime,
      saturdayCheckOutTime: DEFAULT_CONFIG.saturdayCheckOutTime,
      activeDays: DEFAULT_CONFIG.activeDays
    });
    await saveSystemConfig(DEFAULT_CONFIG);
    if (onShowToast) {
      onShowToast('Konfigurasi Direset', 'Nilai konfigurasi dikembalikan ke pengaturan standar.', 'info');
    }
  };

  // Filtered holiday list
  const filteredHolidays = holidays.filter(item => {
    if (holidayFilter === 'all') return true;
    return item.type === holidayFilter;
  });

  return (
    <div className="space-y-6">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-sky-600" />
            <span>Konfigurasi Geofencing, Shift & Kalender Libur</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola perimeter lokasi, jam kepulangan reguler/Jumat/Sabtu, serta jadwal libur nasional dan liburan sekolah.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Atur Ulang</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 shadow-sm shadow-sky-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
          </button>
        </div>
      </div>

      {/* Grid: Geofencing & Shift Jam Kerja */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: Geofencing & Koordinat Sekolah */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Perimeter Titik Geofencing</h3>
                  <p className="text-[11px] text-slate-500">Validasi radius presensi berbasis GPS</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Status: Aktif
              </span>
            </div>

            <div className="space-y-4">
              {/* Nama Lokasi */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Titik Acuan Lokasi
                </label>
                <input
                  type="text"
                  value={geoConfig.locationName}
                  onChange={(e) => setGeoConfig({ ...geoConfig, locationName: e.target.value })}
                  placeholder="Contoh: Gerbang Utama Gedung A"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none transition-all text-slate-800"
                />
              </div>

              {/* Koordinat Lat & Long */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="text"
                    value={geoConfig.latitude}
                    onChange={(e) => setGeoConfig({ ...geoConfig, latitude: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none transition-all text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="text"
                    value={geoConfig.longitude}
                    onChange={(e) => setGeoConfig({ ...geoConfig, longitude: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none transition-all text-slate-800"
                  />
                </div>
              </div>

              {/* Radius Meter Slider & Number */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <label className="font-semibold text-slate-700">Radius Validasi Presensi</label>
                  <span className="font-bold text-sky-700 font-mono bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                    {geoConfig.radius} Meter
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="250"
                  step="5"
                  value={geoConfig.radius}
                  onChange={(e) => setGeoConfig({ ...geoConfig, radius: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>10 m (Sangat Ketat)</span>
                  <span>50 m (Rekomendasi)</span>
                  <span>250 m (Area Luas)</span>
                </div>
              </div>

              {/* Button GPS sensor */}
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-sky-600" />
                <span>Sinkronisasi Koordinat GPS Perangkat</span>
              </button>
            </div>
          </div>

          {/* Mini Visual Radar/Map Preview */}
          <div className="p-3.5 rounded-xl bg-slate-900 text-white flex items-center gap-3.5 border border-slate-800">
            <div className="relative w-12 h-12 rounded-xl bg-sky-950 flex items-center justify-center shrink-0 border border-sky-500/30">
              <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-sky-400 opacity-30" />
              <MapPin className="w-5 h-5 text-sky-400 relative z-10" />
            </div>
            <div className="text-xs min-w-0">
              <p className="font-bold truncate text-white">{geoConfig.locationName}</p>
              <p className="text-[11px] text-slate-400 font-mono truncate">
                Lat: {geoConfig.latitude}, Long: {geoConfig.longitude}
              </p>
              <p className="text-[10px] text-emerald-400 mt-0.5">
                ● Radius {geoConfig.radius}m terlindungi geofence anti-fake GPS
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Jam Kerja & Shift Reguler (Termasuk Jam Pulang Sabtu) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Shift & Jam Kerja Reguler</h3>
                  <p className="text-[11px] text-slate-500">Jadwal operasional kehadiran guru & tendik</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                {shiftConfig.activeDays.length} Hari Kerja
              </span>
            </div>

            <div className="space-y-4">
              {/* Jam Masuk: Buka Presensi, Batas Masuk, dan Toleransi */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Jam Buka Presensi Masuk
                  </label>
                  <input
                    type="time"
                    value={shiftConfig.checkInStartTime || '06:00'}
                    onChange={(e) => setShiftConfig({ ...shiftConfig, checkInStartTime: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none transition-all text-slate-800"
                  />
                  <span className="text-[10px] text-sky-600 block mt-0.5">Mulai aktif tombol masuk</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Batas Jam Masuk Tepat Waktu
                  </label>
                  <input
                    type="time"
                    value={shiftConfig.checkInTime}
                    onChange={(e) => setShiftConfig({ ...shiftConfig, checkInTime: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none transition-all text-slate-800"
                  />
                  <span className="text-[10px] text-emerald-600 block mt-0.5">Batas status tepat waktu</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Toleransi & Batas Tutup Masuk
                  </label>
                  <input
                    type="time"
                    value={shiftConfig.lateTolerance}
                    onChange={(e) => setShiftConfig({ 
                      ...shiftConfig, 
                      lateTolerance: e.target.value,
                      checkInEndTime: e.target.value 
                    })}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none transition-all text-slate-800"
                  />
                  <span className="text-[10px] text-amber-600 block mt-0.5">Lewat jam ini tombol dinonaktifkan</span>
                </div>
              </div>

              {/* JAM PULANG 3 KOLOM: Reguler, Hari Jumat, dan Hari Sabtu */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Jam Pulang Reguler (Senin-Kamis)
                  </label>
                  <input
                    type="time"
                    value={shiftConfig.checkOutTime}
                    onChange={(e) => setShiftConfig({ ...shiftConfig, checkOutTime: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none transition-all text-slate-800"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">Senin s/d Kamis</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Jam Pulang Hari Jumat
                  </label>
                  <input
                    type="time"
                    value={shiftConfig.fridayCheckOutTime}
                    onChange={(e) => setShiftConfig({ ...shiftConfig, fridayCheckOutTime: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none transition-all text-slate-800"
                  />
                  <span className="text-[10px] text-sky-600 block mt-0.5">Khusus Hari Jumat</span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-700">
                      Jam Pulang Hari Sabtu
                    </label>
                    {shiftConfig.activeDays.includes('Sabtu') && (
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 rounded font-semibold">Aktif</span>
                    )}
                  </div>
                  <input
                    type="time"
                    value={shiftConfig.saturdayCheckOutTime}
                    onChange={(e) => setShiftConfig({ ...shiftConfig, saturdayCheckOutTime: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none transition-all text-slate-800"
                  />
                  <span className="text-[10px] text-indigo-600 block mt-0.5">Khusus Hari Sabtu</span>
                </div>
              </div>

              {/* Hari Kerja Aktif Checkboxes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Hari Kerja Aktif Sekolah
                </label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map((day) => {
                    const isSelected = shiftConfig.activeDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-sky-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  *Klik untuk mengaktifkan atau menonaktifkan hari operasional (misal sekolah 5 hari vs 6 hari).
                </p>
              </div>
            </div>
          </div>

          {/* Quick Notice */}
          <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 text-slate-600 text-xs flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Presensi pulang diizinkan mulai pukul <span className="font-semibold text-slate-800">{shiftConfig.checkOutTime}</span> (Senin-Kamis), <span className="font-semibold text-slate-800">{shiftConfig.fridayCheckOutTime}</span> (Jumat), dan <span className="font-semibold text-slate-800">{shiftConfig.saturdayCheckOutTime}</span> (Sabtu).
            </p>
          </div>
        </div>

      </div>

      {/* CARD 3: SETTING HARI LIBURAN SEKOLAH & LIBUR NASIONAL */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-5">
        
        {/* Header Setting Hari Libur */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <Palmtree className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Pengaturan Kalender Libur (Liburan Sekolah & Libur Nasional)
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {holidays.length} Hari Terjadwal
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Sistem secara otomatis akan menonaktifkan kewajiban presensi bagi seluruh guru dan tendik pada tanggal libur yang ditetapkan.
              </p>
            </div>
          </div>

          {/* Tombol Tambah Hari Libur */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setIsAddHolidayModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm shadow-sky-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Hari Libur</span>
            </button>
          </div>
        </div>

        {/* Filter & Global Rule Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200/60">
          
          {/* Segmented Filter */}
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <span className="text-slate-500 mr-1 text-[11px]">Kategori:</span>
            {[
              { id: 'all', label: 'Semua Libur' },
              { id: 'nasional', label: 'Libur Nasional' },
              { id: 'sekolah', label: 'Liburan Sekolah' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setHolidayFilter(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                  holidayFilter === tab.id
                    ? 'bg-white text-sky-700 font-bold shadow-2xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Toggle Auto Disable */}
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={autoDisableOnHolidays}
              onChange={(e) => setAutoDisableOnHolidays(e.target.checked)}
              className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
            />
            <span>Nonaktifkan presensi & alpa otomatis pada hari libur</span>
          </label>
        </div>

        {/* List of Configured Holidays Table/Cards */}
        <div className="overflow-x-auto">
          {filteredHolidays.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/40">
              <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">Tidak ada agenda libur pada kategori ini</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Klik tombol "Tambah Hari Libur" untuk menambahkan agenda libur nasional atau liburan kalender sekolah.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Nama Hari Libur</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Rentang Tanggal</th>
                  <th className="py-3 px-4">Keterangan</th>
                  <th className="py-3 px-4 text-center">Status Presensi</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHolidays.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {item.name}
                    </td>
                    <td className="py-3 px-4">
                      {item.type === 'nasional' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <Tag className="w-3 h-3" />
                          <span>Libur Nasional</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                          <Palmtree className="w-3 h-3" />
                          <span>Liburan Sekolah</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {item.startDate === item.endDate ? (
                        item.startDate
                      ) : (
                        <span>{item.startDate} s/d {item.endDate}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                      {item.description || '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Libur (Otomatis Nonaktif)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteHoliday(item.id, item.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Hari Libur"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>

      {/* MODAL TAMBAH HARI LIBUR */}
      {isAddHolidayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Tambah Hari Libur Baru</h3>
                  <p className="text-[11px] text-slate-500">Kalender libur nasional atau liburan sekolah</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddHolidayModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddHoliday} className="p-5 space-y-4 text-xs">
              {/* Kategori Libur */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kategori Libur
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewHoliday({ ...newHoliday, type: 'nasional' })}
                    className={`py-2 px-3 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      newHoliday.type === 'nasional'
                        ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>Libur Nasional</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewHoliday({ ...newHoliday, type: 'sekolah' })}
                    className={`py-2 px-3 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      newHoliday.type === 'sekolah'
                        ? 'bg-sky-50 text-sky-700 border-sky-300 shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Palmtree className="w-3.5 h-3.5" />
                    <span>Liburan Sekolah</span>
                  </button>
                </div>
              </div>

              {/* Nama Libur */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Agenda Hari Libur <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newHoliday.name}
                  onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                  placeholder={newHoliday.type === 'nasional' ? 'Contoh: Hari Kemerdekaan RI' : 'Contoh: Libur Akhir Semester Genap'}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none transition-all"
                />
              </div>

              {/* Rentang Tanggal */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tanggal Mulai <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={newHoliday.startDate}
                    onChange={(e) => setNewHoliday({ ...newHoliday, startDate: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    value={newHoliday.endDate}
                    onChange={(e) => setNewHoliday({ ...newHoliday, endDate: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Keterangan */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Keterangan / Catatan Tambahan
                </label>
                <textarea
                  rows={2}
                  value={newHoliday.description}
                  onChange={(e) => setNewHoliday({ ...newHoliday, description: e.target.value })}
                  placeholder="Catatan surat edaran dinas/madrasah..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none transition-all resize-none"
                />
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddHolidayModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-bold shadow-sm shadow-sky-600/30 cursor-pointer"
                >
                  Simpan Hari Libur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
