import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDocs, 
  deleteDoc,
  writeBatch,
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

// Helper LocalStorage Keys
const STORAGE_KEYS = {
  ATTENDANCE: 'presensi_gtk_attendance_list',
  EMPLOYEES: 'presensi_gtk_employees_list',
  LEAVES: 'presensi_gtk_leave_requests',
  CONFIG: 'presensi_gtk_system_config',
  SCHOOL_PROFILE: 'presensi_gtk_school_profile'
};

// ==========================================
// 0. DATE & TIME HELPER (WIB & REALTIME SAFE)
// ==========================================

/**
 * Mengembalikan tanggal lokal resmi (WIB / Asia/Jakarta) format YYYY-MM-DD.
 * Sangat penting: jangan menggunakan new Date().toISOString().split('T')[0]
 * karena pada pukul 00:00 - 06:59 WIB, jam UTC masih berada di hari kemarin!
 */
export function getTodayDateString(d = new Date()) {
  const date = d instanceof Date ? d : new Date(d);
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  } catch {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

/**
 * Mengembalikan bulan tahun format YYYY-MM
 */
export function getTodayMonthString(d = new Date()) {
  return getTodayDateString(d).slice(0, 7);
}

/**
 * Format string YYYY-MM-DD menjadi format tanggal resmi Indonesia
 * contoh: "Jumat, 23 Oktober 2026" tanpa risiko pergeseran timezone UTC.
 */
export function formatDateIndonesian(dateStr) {
  if (!dateStr) return 'Hari Ini';
  try {
    if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [year, month, day] = dateStr.split('-').map(Number);
      const d = new Date(year, month - 1, day, 12, 0, 0);
      return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(d);
    }
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

// Master GTK Kosong Awal (Tanpa data dummy)
export const DEFAULT_EMPLOYEES = [];

// Fungsi pembersihan otomatis seluruh data dummy dari penyimpanan lokal (menjaga akun admin dan kamad)
export function purgeDummyData() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;

    const isProtected = (nip, name) => {
      const n = (nip || '').toLowerCase();
      const nm = (name || '').toLowerCase();
      return n === 'admin' || n === 'kamad' || nm.includes('admin') || nm.includes('mulyadi');
    };

    const isDummy = (nip, name) => {
      if (isProtected(nip, name)) return false;
      const n = (nip || '').toUpperCase();
      const nm = (name || '').toUpperCase();
      return (
        n === '17527606681300102' ||
        n === '197906152009121003' ||
        n === '91000080112516' ||
        n === 'ADE AYU NUR TANTRI' ||
        nm.includes('AENI') ||
        nm.includes('BAMBANG') ||
        nm.includes('ADE AYU NUR TANTRI')
      );
    };

    // Bersihkan dari master pegawai
    const emps = JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLOYEES) || '[]');
    const filteredEmps = emps.filter(e => !isDummy(e.nip, e.name));
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(filteredEmps));

    // Bersihkan dari rekaman presensi
    const atts = JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || '[]');
    const filteredAtts = atts.filter(a => !isDummy(a.nip, a.name));
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(filteredAtts));

    // Bersihkan dari permohonan cuti
    const leaves = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEAVES) || '[]');
    const filteredLeaves = leaves.filter(l => !isDummy(l.applicantNip, l.applicantName));
    localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(filteredLeaves));

    window.dispatchEvent(new Event('employees_local_update'));
    window.dispatchEvent(new Event('presensi_local_update'));
    window.dispatchEvent(new Event('leaves_local_update'));
  } catch (err) {
    console.error('Error purging data:', err);
  }
}

// Perbaikan otomatis rekaman presensi yang tersimpan tanggal kemarin akibat bug toISOString() pada jam pagi WIB
export function fixAttendanceDates() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (!raw) return;
    const list = JSON.parse(raw);
    let modified = false;

    const updatedList = list.map(item => {
      if (item && item.updatedAt) {
        const correctWibDate = getTodayDateString(new Date(item.updatedAt));
        if (item.date !== correctWibDate) {
          modified = true;
          return {
            ...item,
            id: `${item.nip || 'unknown'}_${correctWibDate}`,
            date: correctWibDate
          };
        }
      }
      return item;
    });

    if (modified) {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(updatedList));
      window.dispatchEvent(new Event('presensi_local_update'));
    }
  } catch (err) {
    console.warn('Error fixing attendance dates:', err);
  }
}

// Alias untuk kompatibilitas ke belakang
export const purgeAeniAndBambang = purgeDummyData;

// Jalankan pembersihan dan perbaikan tanggal saat modul diimpor
purgeDummyData();
fixAttendanceDates();

// ==========================================
// 1. MANAJEMEN PRESENSI (CHECK-IN / CHECK-OUT)
// ==========================================

export async function saveAttendanceRecord(record) {
  const dateStr = record.date || getTodayDateString();
  const docId = `${record.nip || 'unknown'}_${dateStr}`;

  // 1. Simpan ke LocalStorage langsung (instant UI update tanpa latensi jaringan)
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || '[]');
    const idx = existing.findIndex(item => item.id === docId || (item.nip === record.nip && item.date === dateStr));
    
    const updatedRecord = {
      id: docId,
      ...record,
      date: dateStr,
      updatedAt: new Date().toISOString()
    };

    if (idx >= 0) {
      existing[idx] = { ...existing[idx], ...updatedRecord };
    } else {
      existing.unshift(updatedRecord);
    }

    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(existing));
    window.dispatchEvent(new Event('presensi_local_update'));
  } catch (e) {
    console.error('Gagal simpan ke cache lokal:', e);
  }

  // 2. Sinkronisasi ke Firebase Firestore secara realtime
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'attendances', docId);
      await setDoc(docRef, {
        ...record,
        date: dateStr,
        updatedAt: serverTimestamp()
      }, { merge: true });
      return { success: true, mode: 'firebase' };
    } catch (error) {
      console.error('[Firebase Error] Gagal simpan presensi online:', error);
    }
  }

  return { success: true, mode: 'local' };
}

export function subscribeAttendances(selectedDate, onUpdate) {
  const dateStr = selectedDate || getTodayDateString();

  if (isFirebaseConfigured && db) {
    const q = query(
      collection(db, 'attendances'),
      where('date', '==', dateStr)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records = [];
      snapshot.forEach(docSnap => {
        records.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Mirror ke LocalStorage agar konsisten di semua tab
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const localList = JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || '[]');
          const nonDateList = localList.filter(item => item.date !== dateStr);
          localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify([...records, ...nonDateList]));
        }
      } catch {}
      onUpdate(records);
    }, (error) => {
      console.error('[Firebase] Error listen attendances:', error);
      try {
        const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || '[]');
        onUpdate(list.filter(item => item.date === dateStr));
      } catch {
        onUpdate([]);
      }
    });

    return unsubscribe;
  }

  // Fallback LocalStorage listener
  const readLocal = () => {
    try {
      const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || '[]');
      const filtered = list.filter(item => item.date === dateStr);
      onUpdate(filtered);
    } catch {
      onUpdate([]);
    }
  };

  readLocal();
  window.addEventListener('presensi_local_update', readLocal);
  window.addEventListener('storage', readLocal);

  return () => {
    window.removeEventListener('presensi_local_update', readLocal);
    window.removeEventListener('storage', readLocal);
  };
}

export function subscribeMonthAttendances(yearMonthStr, onUpdate) {
  const ym = yearMonthStr || getTodayMonthString();

  const readLocal = () => {
    try {
      const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || '[]');
      const filtered = list.filter(item => item.date && item.date.startsWith(ym));
      onUpdate(filtered);
    } catch {
      onUpdate([]);
    }
  };

  if (isFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, 'attendances'),
        where('date', '>=', `${ym}-01`),
        where('date', '<=', `${ym}-31`)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const records = [];
        snapshot.forEach(docSnap => {
          records.push({ id: docSnap.id, ...docSnap.data() });
        });
        onUpdate(records);
      }, (error) => {
        console.warn('[Firebase] Fallback month attendances:', error);
        readLocal();
      });

      return unsubscribe;
    } catch (e) {
      readLocal();
    }
  }

  readLocal();
  window.addEventListener('presensi_local_update', readLocal);
  window.addEventListener('storage', readLocal);

  return () => {
    window.removeEventListener('presensi_local_update', readLocal);
    window.removeEventListener('storage', readLocal);
  };
}

export async function deleteAttendanceRecord(recordIdOrNip, dateStr) {
  const docId = dateStr ? `${recordIdOrNip}_${dateStr}` : recordIdOrNip;

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'attendances', docId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('[Firebase Error] Gagal menghapus presensi:', error);
    }
  }

  // Fallback / sinkronisasi LocalStorage
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || '[]');
    const filtered = existing.filter(item => {
      const idMatches = item.id === docId || item.id === recordIdOrNip;
      const nipDateMatches = dateStr ? (item.nip === recordIdOrNip && item.date === dateStr) : false;
      return !idMatches && !nipDateMatches;
    });
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(filtered));
    window.dispatchEvent(new Event('presensi_local_update'));
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ==========================================
// 2. MANAJEMEN MASTER PEGAWAI (GURU & TENDIK)
// ==========================================

export async function saveEmployee(employee) {
  const empId = employee.id || employee.nip || Date.now().toString();

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'employees', empId);
      await setDoc(docRef, {
        ...employee,
        id: empId,
        updatedAt: serverTimestamp()
      }, { merge: true });
      return { success: true, mode: 'firebase' };
    } catch (error) {
      console.error('[Firebase Error] Gagal simpan pegawai:', error);
    }
  }

  // Fallback LocalStorage
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLOYEES) || '[]');
    const idx = existing.findIndex(e => e.id === empId || e.nip === employee.nip);
    
    const updated = {
      ...employee,
      id: empId,
      createdAt: employee.createdAt || new Date().toISOString()
    };

    if (idx >= 0) {
      existing[idx] = { ...existing[idx], ...updated };
    } else {
      existing.unshift(updated);
    }

    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(existing));
    window.dispatchEvent(new Event('employees_local_update'));
    return { success: true, mode: 'local' };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export async function saveEmployeesBulk(employeeList) {
  if (!Array.isArray(employeeList) || employeeList.length === 0) {
    return { success: true, count: 0 };
  }

  const nowIso = new Date().toISOString();

  if (isFirebaseConfigured && db) {
    try {
      const chunkSize = 450;
      for (let i = 0; i < employeeList.length; i += chunkSize) {
        const chunk = employeeList.slice(i, i + chunkSize);
        const batch = writeBatch(db);
        chunk.forEach(emp => {
          const empId = emp.id || emp.nip || `${Date.now()}_${Math.random()}`;
          const docRef = doc(db, 'employees', String(empId));
          batch.set(docRef, {
            ...emp,
            id: String(empId),
            updatedAt: serverTimestamp(),
            createdAt: emp.createdAt || nowIso
          }, { merge: true });
        });
        await batch.commit();
      }
    } catch (error) {
      console.error('[Firebase Error] Gagal simpan pegawai massal:', error);
    }
  }

  // Update LocalStorage
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLOYEES) || '[]');
    const existingMap = new Map();
    existing.forEach(e => {
      const key = e.id || e.nip;
      if (key) existingMap.set(key, e);
    });

    employeeList.forEach(emp => {
      const key = emp.id || emp.nip;
      const merged = {
        ...emp,
        id: String(key || Date.now()),
        createdAt: emp.createdAt || nowIso
      };
      existingMap.set(key, merged);
    });

    const updatedList = Array.from(existingMap.values());
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(updatedList));
    window.dispatchEvent(new Event('employees_local_update'));
    return { success: true, count: employeeList.length };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export function subscribeEmployees(onUpdate) {
  if (isFirebaseConfigured && db) {
    const q = query(collection(db, 'employees'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      if (list.length === 0) {
        onUpdate([]);
      } else {
        onUpdate(list);
      }
    }, () => {
      const fallbackQ = collection(db, 'employees');
      return onSnapshot(fallbackQ, snap => {
        const list = [];
        snap.forEach(d => list.push({ id: d.id, ...d.data() }));
        onUpdate(list);
      });
    });
  }

  const readLocal = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
      if (!stored) {
        onUpdate([]);
      } else {
        const list = JSON.parse(stored);
        onUpdate(Array.isArray(list) ? list : []);
      }
    } catch {
      onUpdate([]);
    }
  };

  readLocal();
  window.addEventListener('employees_local_update', readLocal);
  window.addEventListener('storage', readLocal);

  return () => {
    window.removeEventListener('employees_local_update', readLocal);
    window.removeEventListener('storage', readLocal);
  };
}

export async function deleteEmployee(empIdOrNip) {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'employees', empIdOrNip);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('[Firebase Error] Gagal menghapus pegawai:', error);
    }
  }

  // Fallback / sinkronisasi LocalStorage
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLOYEES) || '[]');
    const filtered = existing.filter(e => e.id !== empIdOrNip && e.nip !== empIdOrNip);
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(filtered));
    window.dispatchEvent(new Event('employees_local_update'));
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ==========================================
// 3. PENGAJUAN IZIN & CUTI (LEAVE REQUESTS)
// ==========================================

export async function saveLeaveRequest(leaveData) {
  const leaveId = Date.now().toString();

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'leave_requests', leaveId);
      await setDoc(docRef, {
        ...leaveData,
        id: leaveId,
        status: leaveData.status || 'menunggu',
        submittedAt: serverTimestamp()
      });
      return { success: true, mode: 'firebase' };
    } catch (error) {
      console.error('[Firebase Error] Gagal simpan cuti:', error);
    }
  }

  // Fallback LocalStorage
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEAVES) || '[]');
    const newLeave = {
      ...leaveData,
      id: leaveId,
      status: leaveData.status || 'menunggu',
      submittedAt: new Date().toISOString()
    };
    existing.unshift(newLeave);
    localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(existing));
    window.dispatchEvent(new Event('leaves_local_update'));
    return { success: true, mode: 'local' };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export async function updateLeaveStatus(leaveId, newStatus, approvedBy = 'Drs. H. Akhmad Rosidi (Kepala Madrasah)', note = '') {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'leave_requests', String(leaveId));
      const updateData = {
        status: newStatus,
        dispositionBy: approvedBy,
        dispositionAt: serverTimestamp()
      };
      if (note) updateData.dispositionNote = note;
      await setDoc(docRef, updateData, { merge: true });
      return { success: true, mode: 'firebase' };
    } catch (error) {
      console.error('[Firebase Error] Gagal update status cuti:', error);
    }
  }

  // Fallback LocalStorage
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEAVES) || '[]');
    const idx = existing.findIndex(l => String(l.id) === String(leaveId));
    if (idx >= 0) {
      existing[idx] = {
        ...existing[idx],
        status: newStatus,
        dispositionBy: approvedBy,
        dispositionAt: new Date().toISOString(),
        ...(note ? { dispositionNote: note } : {})
      };
      localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(existing));
      window.dispatchEvent(new Event('leaves_local_update'));
      return { success: true, mode: 'local' };
    }
    return { success: false, error: 'Berkas tidak ditemukan' };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export async function deleteLeaveRequest(leaveId) {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'leave_requests', String(leaveId));
      await deleteDoc(docRef);
      return { success: true, mode: 'firebase' };
    } catch (error) {
      console.error('[Firebase Error] Gagal hapus cuti:', error);
    }
  }

  // Fallback LocalStorage
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEAVES) || '[]');
    const filtered = existing.filter(l => String(l.id) !== String(leaveId));
    localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(filtered));
    window.dispatchEvent(new Event('leaves_local_update'));
    return { success: true, mode: 'local' };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export function subscribeLeaveRequests(onUpdate) {
  if (isFirebaseConfigured && db) {
    const q = collection(db, 'leave_requests');
    return onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      onUpdate(list);
    }, (err) => {
      console.error('[Firebase] Error listen leaves:', err);
    });
  }

  const readLocal = () => {
    try {
      const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEAVES) || '[]');
      onUpdate(list);
    } catch {
      onUpdate([]);
    }
  };

  readLocal();
  window.addEventListener('leaves_local_update', readLocal);
  window.addEventListener('storage', readLocal);

  return () => {
    window.removeEventListener('leaves_local_update', readLocal);
    window.removeEventListener('storage', readLocal);
  };
}

// ==========================================
// 4. KONFIGURASI SISTEM (GEOFENCE & JADWAL SHIFT)
// ==========================================

export const DEFAULT_CONFIG = {
  checkInStartTime: '06:00',
  checkInTime: '07:00',
  lateTolerance: '07:10',
  checkInEndTime: '07:10',
  checkOutTime: '14:30',
  fridayCheckOutTime: '11:30',
  saturdayCheckOutTime: '15:00',
  checkOutEndTime: '21:00',
  activeDays: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
  locationName: "Kampus Utama MTs Asy-Syafi'iyyah Jatibarang",
  latitude: '-6.208800',
  longitude: '106.845600',
  radius: 50
};

export function getSystemConfig() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (stored) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }
    }
  } catch (e) {}
  return { ...DEFAULT_CONFIG };
}

export async function saveSystemConfig(newConfig) {
  const merged = { ...DEFAULT_CONFIG, ...newConfig, updatedAt: new Date().toISOString() };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'system_config', 'settings');
      await setDoc(docRef, { ...merged, updatedAt: serverTimestamp() }, { merge: true });
    } catch (err) {
      console.error('[Firebase Error] Gagal simpan konfigurasi sistem:', err);
    }
  }

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(merged));
      window.dispatchEvent(new CustomEvent('config_local_update', { detail: merged }));
    }
    return { success: true, config: merged };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export function subscribeSystemConfig(onUpdate) {
  if (isFirebaseConfigured && db) {
    const docRef = doc(db, 'system_config', 'settings');
    const unsub = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const merged = { ...DEFAULT_CONFIG, ...data };
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(merged));
          }
        } catch {}
        onUpdate(merged);
      } else {
        onUpdate(getSystemConfig());
      }
    }, (err) => {
      console.warn('[Firebase] Gagal sinkron konfigurasi online, menggunakan lokal:', err);
      onUpdate(getSystemConfig());
    });
    return unsub;
  }

  const readLocal = () => {
    onUpdate(getSystemConfig());
  };

  readLocal();
  const handleCustomUpdate = (e) => onUpdate(e.detail || getSystemConfig());
  window.addEventListener('config_local_update', handleCustomUpdate);
  window.addEventListener('storage', readLocal);

  return () => {
    window.removeEventListener('config_local_update', handleCustomUpdate);
    window.removeEventListener('storage', readLocal);
  };
}

// ==========================================
// 4B. PROFIL & IDENTITAS SEKOLAH / MADRASAH
// ==========================================

export const DEFAULT_SCHOOL_PROFILE = {
  schoolName: "MTs Asy-Syafi'iyyah Jatibarang",
  nsm: '121232120015',
  npsn: '20279093',
  alamat: 'Jl. Mayor Dasuki No. 136 Jatibarang, Kab. Indramayu - Jawa Barat 45273',
  akreditasi: 'A (Unggul)',
  headmasterName: 'Drs. H. Akhmad Rosidi',
  headmasterNip: '-',
  adminName: 'Administrator Utama SIM GTK',
  adminEmail: 'admin.gtk@mts-asysyafiiyyah.sch.id',
  adminRole: 'Super Administrator GTK'
};

export function getSchoolProfile() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(STORAGE_KEYS.SCHOOL_PROFILE);
      if (stored) {
        return { ...DEFAULT_SCHOOL_PROFILE, ...JSON.parse(stored) };
      }
    }
  } catch (e) {}
  return { ...DEFAULT_SCHOOL_PROFILE };
}

export async function saveSchoolProfile(newProfile) {
  const merged = { ...DEFAULT_SCHOOL_PROFILE, ...newProfile, updatedAt: new Date().toISOString() };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'system_config', 'school_profile');
      await setDoc(docRef, { ...merged, updatedAt: serverTimestamp() }, { merge: true });
    } catch (err) {
      console.error('[Firebase Error] Gagal simpan identitas sekolah:', err);
    }
  }

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEYS.SCHOOL_PROFILE, JSON.stringify(merged));
      window.dispatchEvent(new CustomEvent('school_profile_local_update', { detail: merged }));
    }
    return { success: true, profile: merged };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export function subscribeSchoolProfile(onUpdate) {
  if (isFirebaseConfigured && db) {
    const docRef = doc(db, 'system_config', 'school_profile');
    const unsub = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const merged = { ...DEFAULT_SCHOOL_PROFILE, ...data };
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem(STORAGE_KEYS.SCHOOL_PROFILE, JSON.stringify(merged));
          }
        } catch {}
        onUpdate(merged);
      } else {
        onUpdate(getSchoolProfile());
      }
    }, (err) => {
      console.warn('[Firebase] Gagal sinkron identitas sekolah online, menggunakan lokal:', err);
      onUpdate(getSchoolProfile());
    });
    return unsub;
  }

  const readLocal = () => {
    onUpdate(getSchoolProfile());
  };

  readLocal();
  const handleCustomUpdate = (e) => onUpdate(e.detail || getSchoolProfile());
  window.addEventListener('school_profile_local_update', handleCustomUpdate);
  window.addEventListener('storage', readLocal);

  return () => {
    window.removeEventListener('school_profile_local_update', handleCustomUpdate);
    window.removeEventListener('storage', readLocal);
  };
}

// ==========================================
// 5. EVALUASI JADWAL PRESENSI REALTIME
// ==========================================

export function getAttendanceScheduleStatus(config = {}, attendanceState = {}) {
  const now = new Date();
  
  // Hari dalam bahasa Indonesia
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const currentDayName = dayNames[now.getDay()];

  const activeDays = config.activeDays || ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const isWorkDay = activeDays.includes(currentDayName);

  // Format jam saat ini HH:mm
  const currentHours = String(now.getHours()).padStart(2, '0');
  const currentMinutes = String(now.getMinutes()).padStart(2, '0');
  const currentTimeStr = `${currentHours}:${currentMinutes}`;

  const checkInStart = config.checkInStartTime || '06:00';
  const checkInOnTime = config.checkInTime || '07:00';
  // Batas akhir presensi masuk (toleransi / jam tutup presensi masuk)
  const checkInEnd = config.checkInEndTime || config.lateTolerance || '07:10';

  // Tentukan jam pulang hari ini
  let checkOutTarget = config.checkOutTime || '14:30';
  if (currentDayName === 'Jumat') {
    checkOutTarget = config.fridayCheckOutTime || '11:30';
  } else if (currentDayName === 'Sabtu') {
    checkOutTarget = config.saturdayCheckOutTime || '15:00';
  }
  const checkOutEnd = config.checkOutEndTime || '21:00';

  // 1. Evaluasi Status Presensi Masuk (Check-In)
  let checkInAllowed = false;
  let checkInStatusMsg = '';
  let isLate = false;

  if (!isWorkDay) {
    checkInAllowed = false;
    checkInStatusMsg = `Hari Libur (${currentDayName}) - Tidak ada jadwal presensi`;
  } else if (attendanceState.status === 'masuk' || attendanceState.status === 'pulang') {
    checkInAllowed = false;
    checkInStatusMsg = `Sudah Tercatat: ${attendanceState.checkInTime || 'Hadir'}`;
  } else if (currentTimeStr < checkInStart) {
    // Belum masuk jam operasional pagi
    checkInAllowed = false;
    checkInStatusMsg = `Belum Jadwal Masuk (Buka pukul ${checkInStart} WIB)`;
  } else if (currentTimeStr > checkInEnd) {
    // Sudah melewati batas jam tutup presensi masuk
    checkInAllowed = false;
    checkInStatusMsg = `Presensi Masuk Ditutup (Jadwal: ${checkInStart} - ${checkInEnd} WIB)`;
  } else {
    // Berada di dalam jendela presensi masuk resmi
    checkInAllowed = true;
    if (currentTimeStr > checkInOnTime) {
      isLate = true;
      checkInStatusMsg = `Terlambat (Batas toleransi s/d ${checkInEnd} WIB)`;
    } else {
      isLate = false;
      checkInStatusMsg = `Batas tepat waktu: ${checkInOnTime} WIB`;
    }
  }

  // 2. Evaluasi Status Presensi Pulang (Check-Out)
  let checkOutAllowed = false;
  let checkOutStatusMsg = '';

  if (!isWorkDay) {
    checkOutAllowed = false;
    checkOutStatusMsg = `Hari Libur (${currentDayName})`;
  } else if (attendanceState.status === 'pulang') {
    checkOutAllowed = false;
    checkOutStatusMsg = `Sudah Tercatat: ${attendanceState.checkOutTime || 'Selesai'}`;
  } else if (attendanceState.status !== 'masuk') {
    checkOutAllowed = false;
    checkOutStatusMsg = 'Wajib Presensi Masuk Terlebih Dahulu';
  } else if (currentTimeStr < checkOutTarget) {
    // Belum jadwal kepulangan
    checkOutAllowed = false;
    checkOutStatusMsg = `Belum Jadwal Pulang (Pintu pulang dibuka pukul ${checkOutTarget} WIB)`;
  } else if (currentTimeStr > checkOutEnd) {
    checkOutAllowed = false;
    checkOutStatusMsg = `Presensi Pulang Ditutup (Batas s/d ${checkOutEnd} WIB)`;
  } else {
    // Waktu kepulangan sudah tiba
    checkOutAllowed = true;
    checkOutStatusMsg = `Waktu Pulang Terbuka (Jadwal: ${checkOutTarget} WIB)`;
  }

  return {
    currentDayName,
    currentTimeStr,
    isWorkDay,
    checkInStart,
    checkInOnTime,
    lateTolerance: checkInEnd,
    checkInEnd,
    checkOutTarget,
    checkOutEnd,
    checkInAllowed,
    checkInStatusMsg,
    isLate,
    checkOutAllowed,
    checkOutStatusMsg
  };
}

// ==========================================
// 6. AUTENTIKASI KETAT GTK (HANYA AKUN RESMI)
// ==========================================

export async function authenticateEmployee(identifier, password) {
  const ident = (identifier || '').trim().toLowerCase();
  const pass = (password || '').trim();

  let matchedEmp = null;

  // 1. Cek dari Cloud Firestore jika terhubung
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'employees'));
      snap.forEach(docSnap => {
        const emp = docSnap.data();
        const nip = (emp.nip || '').trim().toLowerCase();
        const username = (emp.username || '').trim().toLowerCase();
        const id = (emp.id || docSnap.id || '').trim().toLowerCase();
        if (nip === ident || username === ident || id === ident) {
          matchedEmp = { id: docSnap.id, ...emp };
        }
      });
    } catch (e) {
      console.warn('Firestore employee fetch error:', e);
    }
  }

  // 2. Fallback / cek dari penyimpanan lokal
  if (!matchedEmp) {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLOYEES) || '[]');
      matchedEmp = stored.find(emp => {
        const nip = (emp.nip || '').trim().toLowerCase();
        const username = (emp.username || '').trim().toLowerCase();
        const id = (emp.id || '').trim().toLowerCase();
        return nip === ident || username === ident || id === ident;
      });
    } catch (e) {}
  }

  // Tolak jika akun tidak terdaftar
  if (!matchedEmp) {
    return {
      success: false,
      error: 'Akun GTK tidak terdaftar. Hanya akun resmi yang telah didaftarkan oleh Administrator SIM GTK yang dapat login.'
    };
  }

  // Validasi Password Akun Resmi
  const validPassword = matchedEmp.password || (matchedEmp.nip ? `gtk.${matchedEmp.nip.slice(-4)}` : 'gtk12345');
  if (pass !== validPassword && pass !== matchedEmp.password && pass !== matchedEmp.nip) {
    return {
      success: false,
      error: 'Password akun GTK salah. Silakan periksa kembali atau hubungi Administrator SIM GTK.'
    };
  }

  return {
    success: true,
    employee: matchedEmp
  };
}
