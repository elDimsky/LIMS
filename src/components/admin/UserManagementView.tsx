import React, { useState } from 'react';
import {
  Users,
  Shield,
  ShieldAlert,
  Plus,
  Edit2,
  Check,
  X,
  Search,
  Filter,
  UserCheck,
  UserX,
  Lock,
  Mail,
  Phone,
  Building,
  ArrowLeft,
} from 'lucide-react';
import { useLims } from '../../context/LimsContext';
import { User as UserType } from '../../types/lims';
import { UserFormModal } from './UserFormModal';

export const UserManagementView: React.FC = () => {
  const { users, currentUser, updateUser, setActiveTab } = useLims();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserToEdit, setSelectedUserToEdit] = useState<UserType | null>(null);

  // ACCESS GUARD: Hanya Super Admin yang berhak mengelola akun pengguna & RBAC
  if (currentUser.role !== 'SUPER_ADMIN') {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden animate-in fade-in duration-200">
        <div className="p-6 bg-gradient-to-r from-slate-900 to-rose-950 text-white flex items-center gap-4 border-b border-rose-900/40">
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Akses Dibatasi (RBAC Restricted)</h2>
            <p className="text-xs text-rose-200">Wewenang Khusus Super Admin / Supervisor R&D</p>
          </div>
        </div>

        <div className="p-6 space-y-4 text-xs text-slate-600">
          <p className="text-slate-800 leading-relaxed font-medium">
            Mohon maaf, modul <strong>Kelola Akun & Penugasan Hak Akses (RBAC)</strong> hanya dapat diakses dan dikonfigurasi oleh <strong>Super Admin / Supervisor R&D (Ayu Jamilatul Janah)</strong>.
          </p>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex justify-between items-center text-slate-700">
              <span>Akun Anda Saat Ini:</span>
              <strong className="text-slate-900">{currentUser.name}</strong>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span>Email:</span>
              <span className="font-mono text-slate-800">{currentUser.email}</span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span>Peran (Role):</span>
              <span className="px-2 py-0.5 rounded font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                Admin R&D Operasional
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span>Kewenangan:</span>
              <span className="font-medium text-rose-600">Tidak Berwenang Mengelola Akun</span>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 leading-relaxed">
            Sesuai standar operasional dan kepatuhan <strong>ISO 17025 Laboratory Security</strong>, staf Admin R&D tidak diperkenankan menambah, menyunting, atau menonaktifkan akun pengguna lain maupun akun Super Admin.
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke LIMS Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const permissionsMatrix = [
    { module: 'Dashboard & Executive KPI', superAdmin: true, admin: true },
    { module: 'Raw Material Management (CRUD)', superAdmin: true, admin: true },
    { module: 'Stock In & Stock Out (Input)', superAdmin: true, admin: true },
    { module: 'Stock Adjustment (Direct Approval)', superAdmin: true, admin: false },
    { module: 'Research Projects (Create & Edit)', superAdmin: true, admin: true },
    { module: 'Research Approval & Budget Sign-off', superAdmin: true, admin: false },
    { module: 'Experiment & Process Parameters', superAdmin: true, admin: true },
    { module: 'Laboratory Testing (Input & QC)', superAdmin: true, admin: true },
    { module: 'Formula Management (Versioning)', superAdmin: true, admin: true },
    { module: 'Formula Approval & Release', superAdmin: true, admin: false },
    { module: 'Waste Management (Disposal Authorization)', superAdmin: true, admin: false },
    { module: 'Audit Trail (View Complete History)', superAdmin: true, admin: true },
    { module: 'User Role & System Configuration', superAdmin: true, admin: false },
  ];

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.title.toLowerCase().includes(search.toLowerCase()) ||
      u.department.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleOpenAddUser = () => {
    if (currentUser.role !== 'SUPER_ADMIN') {
      setActionNotice({ type: 'error', message: 'Akses ditolak: Hanya Super Admin / Supervisor R&D yang berwenang menambah akun.' });
      return;
    }
    setSelectedUserToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditUser = (user: UserType) => {
    if (currentUser.role !== 'SUPER_ADMIN') {
      setActionNotice({ type: 'error', message: 'Akses ditolak: Hanya Super Admin / Supervisor R&D yang berwenang mengubah akun.' });
      return;
    }
    setSelectedUserToEdit(user);
    setIsModalOpen(true);
  };

  const handleToggleStatus = (user: UserType) => {
    if (currentUser.role !== 'SUPER_ADMIN') {
      setActionNotice({ type: 'error', message: 'Akses ditolak: Hanya Super Admin / Supervisor R&D yang berwenang mengubah status akun.' });
      return;
    }
    if (user.id === 'USR-001' || user.role === 'SUPER_ADMIN') {
      setActionNotice({ type: 'error', message: 'Akun Super Admin Utama (Ayu Jamilatul Janah) tidak dapat dinonaktifkan.' });
      return;
    }
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    updateUser(user.id, { status: newStatus });
    setActionNotice({
      type: 'success',
      message: `Status akun ${user.name} berhasil diperbarui menjadi ${newStatus === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}.`,
    });
  };

  const totalActive = users.filter((u) => u.status === 'ACTIVE').length;
  const totalSuperAdmins = users.filter((u) => u.role === 'SUPER_ADMIN').length;
  const totalAdmins = users.filter((u) => u.role === 'ADMIN_RD').length;

  return (
    <div className="space-y-6">
      {actionNotice && (
        <div
          className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
            actionNotice.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 shrink-0" />
            <span>{actionNotice.message}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-slate-400 hover:text-slate-600 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            User Accounts & Role Based Access Control (RBAC)
          </h1>
          <p className="text-xs text-slate-500">
            Kelola akun tim Research & Development, otorisasi peran, penugasan hak akses dan integritas sistem
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddUser}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Akun Baru</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Pengguna Terdaftar
          </span>
          <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
            {users.length} Akun
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Akun Aktif (Active)
          </span>
          <span className="text-xl font-bold font-mono text-emerald-700 mt-1 block">
            {totalActive} Akun
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Supervisor / Super Admin
          </span>
          <span className="text-xl font-bold font-mono text-purple-700 mt-1 block">
            {totalSuperAdmins} Orang
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Staf Admin R&D
          </span>
          <span className="text-xl font-bold font-mono text-teal-700 mt-1 block">
            {totalAdmins} Orang
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, email, jabatan, atau divisi..."
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 font-medium"
          >
            <option value="ALL">Semua Hak Akses (Role)</option>
            <option value="SUPER_ADMIN">Super Admin (Supervisor)</option>
            <option value="ADMIN_RD">Admin R&D</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 font-medium"
          >
            <option value="ALL">Semua Status</option>
            <option value="ACTIVE">Aktif (Active)</option>
            <option value="INACTIVE">Nonaktif (Inactive)</option>
          </select>
        </div>

        <span className="text-slate-500 font-mono text-[11px]">
          {filteredUsers.length} Akun Ditampilkan
        </span>
      </div>

      {/* Users Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredUsers.map((u) => {
          const isCurrent = u.id === currentUser.id;
          const isAyu = u.id === 'USR-001';

          return (
            <div
              key={u.id}
              className={`p-4 rounded-xl border bg-white shadow-2xs flex flex-col justify-between space-y-3 transition-all ${
                isCurrent
                  ? 'border-teal-500 ring-2 ring-teal-500/20'
                  : u.status === 'INACTIVE'
                  ? 'border-slate-200 opacity-60 bg-slate-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatar}
                      alt={u.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80';
                      }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-slate-900 text-xs truncate">{u.name}</h3>
                        {isAyu && (
                          <span title="Super Admin Utama" className="text-amber-500">
                            ★
                          </span>
                        )}
                      </div>
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded mt-0.5 ${
                          u.role === 'SUPER_ADMIN'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-teal-50 text-teal-700 border border-teal-200'
                        }`}
                      >
                        {u.role === 'SUPER_ADMIN' ? 'Super Admin / Spv' : 'Admin R&D'}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      u.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    {u.status === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>

                <div className="space-y-1 text-slate-600 text-[11px] pt-2 border-t border-slate-100">
                  <p className="truncate">
                    <strong>Jabatan:</strong> {u.title}
                  </p>
                  <p className="truncate">
                    <strong>Divisi:</strong> {u.department}
                  </p>
                  <p className="truncate">
                    <strong>Email:</strong> {u.email}
                  </p>
                  {u.phone && (
                    <p className="truncate">
                      <strong>Telepon:</strong> {u.phone}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-400 pt-1">
                    Login Terakhir: {u.lastLogin}
                  </p>
                </div>
              </div>

              {/* Action Buttons for Managing Account */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => handleOpenEditUser(u)}
                  className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Edit Akun</span>
                </button>

                {!isAyu && (
                  <button
                    onClick={() => handleToggleStatus(u)}
                    className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center ${
                      u.status === 'ACTIVE'
                        ? 'text-rose-600 hover:bg-rose-50 border border-rose-200'
                        : 'text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                    }`}
                    title={u.status === 'ACTIVE' ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                  >
                    {u.status === 'ACTIVE' ? (
                      <UserX className="w-3.5 h-3.5" />
                    ) : (
                      <UserCheck className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Permissions Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden space-y-2">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Matriks Hak Akses (Permissions Matrix)</h2>
            <p className="text-xs text-slate-500">Perbedaan otoritas antara Supervisor dan Staf Admin R&D</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="text-purple-700">Super Admin (Ayu Jamilatul Janah)</span>
            <span className="text-slate-600">Admin R&D Operasional</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Modul & Kewenangan</th>
                <th className="py-2.5 px-4 font-semibold text-center w-48">Super Admin / Spv</th>
                <th className="py-2.5 px-4 font-semibold text-center w-48">Admin R&D</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissionsMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-medium text-slate-800">{item.module}</td>
                  <td className="py-2.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Full Access</span>
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {item.admin ? (
                      <span className="inline-flex items-center gap-1 text-slate-700">
                        <Check className="w-4 h-4 text-slate-500" />
                        <span>Operasional</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-400">
                        <X className="w-4 h-4 text-slate-300" />
                        <span>No Approval</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Form Modal */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUserToEdit(null);
        }}
        userToEdit={selectedUserToEdit}
      />
    </div>
  );
};
