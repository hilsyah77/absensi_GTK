import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  GraduationCap, 
  Building2, 
  MoreVertical, 
  Mail, 
  Phone, 
  ShieldCheck,
  UserX,
  FileSpreadsheet,
  UploadCloud,
  Trash2,
  ArrowUpDown,
  ArrowDownAZ,
  ArrowUpZA
} from 'lucide-react';

export default function AdminEmployeesView({
  employees = [],
  onAddEmployee,
  onOpenUpload,
  onDeleteEmployee,
  onOpenMonthlyReport,
  searchQuery,
  setSearchQuery,
  roleFilter,
  setRoleFilter
}) {
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' = A-Z, 'desc' = Z-A

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filtered = employees
    .filter(emp => {
      const matchesSearch = !searchQuery || 
        emp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.nip?.includes(searchQuery) ||
        emp.position?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || emp.role === roleFilter;

      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        const nameA = (a.name || '').trim();
        const nameB = (b.name || '').trim();
        comparison = nameA.localeCompare(nameB, 'id', { sensitivity: 'base' });
      } else if (sortField === 'nip') {
        comparison = (a.nip || '').localeCompare(b.nip || '');
      } else if (sortField === 'role') {
        comparison = (a.role || '').localeCompare(b.role || '');
      } else if (sortField === 'position') {
        comparison = (a.position || '').localeCompare(b.position || '');
      } else if (sortField === 'status') {
        const statusA = a.employmentStatus || 'Aktif';
        const statusB = b.employmentStatus || 'Aktif';
        comparison = statusA.localeCompare(statusB);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  return (
    <div className="space-y-6">
      
      {/* Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-600" />
            <span>Manajemen Pegawai (Guru & Tenaga Kependidikan)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar master data pendidik dan staf kependidikan aktif di sekolah/madrasah.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Tombol Upload Pegawai */}
          <button
            type="button"
            onClick={onOpenUpload}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-sky-600" />
            <span>Upload Pegawai</span>
          </button>

          {/* Tombol Tambah Pegawai Baru */}
          <button
            type="button"
            onClick={onAddEmployee}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm shadow-sky-600/30 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Pegawai Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, NIP, atau mata pelajaran..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none transition-all"
          />
        </div>

        {/* Role Segmented & Sort Control */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Role Segmented */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600 w-full sm:w-auto">
            {[
              { id: 'all', label: 'Semua GTK' },
              { id: 'guru', label: 'Guru (Pendidik)' },
              { id: 'tendik', label: 'Tenaga Kependidikan' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRoleFilter(tab.id)}
                className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  roleFilter === tab.id
                    ? 'bg-white text-sky-700 font-semibold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Sort Toggle Button */}
          <button
            type="button"
            onClick={() => handleSort('name')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-2xs transition-all cursor-pointer ${
              sortField === 'name'
                ? 'bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
            }`}
            title={sortOrder === 'asc' ? 'Urutan: Nama A-Z (Klik untuk ubah ke Z-A)' : 'Urutan: Nama Z-A (Klik untuk ubah ke A-Z)'}
          >
            {sortOrder === 'asc' ? (
              <ArrowDownAZ className="w-4 h-4 text-sky-600" />
            ) : (
              <ArrowUpZA className="w-4 h-4 text-sky-600" />
            )}
            <span>Sortir: {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}</span>
          </button>
        </div>
      </div>

      {/* Employees Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          /* Empty State for Employees */
          <div className="py-16 px-4 text-center">
            <div className="max-w-md mx-auto flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-400 mb-4 shadow-2xs">
                <UserX className="w-8 h-8 text-slate-400 stroke-[1.5]" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 tracking-tight mb-1">
                Belum ada data pegawai terdaftar
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mb-5">
                Database kepegawaian masih kosong. Mulai dengan menambahkan profil Guru atau Tenaga Kependidikan pertama untuk mengaktifkan sistem presensi.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={onAddEmployee}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm shadow-sky-600/30 transition-all cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Tambah Pegawai Manual</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenUpload}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-all cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4 text-sky-600" />
                  <span>Upload Pegawai (.xlsx/.csv)</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th 
                    className="py-3.5 px-6 cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
                    onClick={() => handleSort('nip')}
                    title="Klik untuk mengurutkan NIP"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>NIP / ID</span>
                      {sortField === 'nip' ? (
                        <span className="text-sky-600 font-bold">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-300" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/80 transition-colors select-none group"
                    onClick={() => handleSort('name')}
                    title="Klik untuk mengurutkan Nama A-Z / Z-A"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={sortField === 'name' ? 'text-sky-700 font-extrabold' : ''}>Nama Lengkap</span>
                      {sortField === 'name' ? (
                        sortOrder === 'asc' ? (
                          <ArrowDownAZ className="w-4 h-4 text-sky-600" />
                        ) : (
                          <ArrowUpZA className="w-4 h-4 text-sky-600" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-300 group-hover:text-slate-500" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
                    onClick={() => handleSort('role')}
                    title="Klik untuk mengurutkan Kategori"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Kategori</span>
                      {sortField === 'role' && (
                        <span className="text-sky-600 font-bold">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
                    onClick={() => handleSort('position')}
                    title="Klik untuk mengurutkan Jabatan"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Jabatan / Mapel</span>
                      {sortField === 'position' && (
                        <span className="text-sky-600 font-bold">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
                    onClick={() => handleSort('status')}
                    title="Klik untuk mengurutkan Status"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Status</span>
                      {sortField === 'status' && (
                        <span className="text-sky-600 font-bold">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="py-3.5 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((emp, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6 font-mono text-slate-700">{emp.nip}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{emp.name}</div>
                      {emp.username && (
                        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                          <span>User:</span>
                          <span className="text-sky-700 font-medium">@{emp.username}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                        emp.role === 'guru' 
                          ? 'bg-sky-50 text-sky-700 border-sky-200' 
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}>
                        {emp.role === 'guru' ? 'Guru' : 'Tendik'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{emp.position}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {emp.employmentStatus || 'Aktif'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {onOpenMonthlyReport && (
                          <button
                            type="button"
                            onClick={() => onOpenMonthlyReport(emp)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
                            title="Cetak Laporan Presensi Bulanan PDF/Excel"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Cetak Laporan</span>
                          </button>
                        )}
                        {onDeleteEmployee && (
                          <button
                            type="button"
                            onClick={() => onDeleteEmployee(emp)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Hapus Pegawai Permanen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <button type="button" className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700">
                          <MoreVertical className="w-4 h-4 ml-auto" />
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

    </div>
  );
}
