import React, { useState, useEffect } from 'react';
import { X, UserPlus, Check, Shield, Mail, Phone, Building, User, Lock, AlertCircle } from 'lucide-react';
import { User as UserType, UserRole } from '../../types/lims';
import { useLims } from '../../context/LimsContext';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: UserType | null;
}

const PRESET_AVATARS = [
  {
    label: 'Supervisor Ayu (Default)',
    url: '/src/assets/images/avatar_ayu_supervisor_1790755748521.jpg',
  },
  {
    label: 'Female Scientist',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  },
  {
    label: 'Male Metallurgy Engineer',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
  },
  {
    label: 'Process Technician',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
  },
  {
    label: 'Chemical Analyst',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
  },
  {
    label: 'R&D Researcher',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80',
  },
];

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  userToEdit,
}) => {
  const { addUser, updateUser, users, currentUser } = useLims();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('ADMIN_RD');
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Research & Development');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(PRESET_AVATARS[1].url);
  const [errorMessage, setErrorMessage] = useState('');

  const isEditing = Boolean(userToEdit);
  const isProtectedSuperAdmin = isEditing && userToEdit?.id === 'USR-001';

  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name);
      setEmail(userToEdit.email);
      setRole(userToEdit.role);
      setTitle(userToEdit.title);
      setDepartment(userToEdit.department);
      setPhone(userToEdit.phone || '');
      setStatus(userToEdit.status);
      setAvatar(userToEdit.avatar);
      setPassword(userToEdit.password || 'password123');
      setErrorMessage('');
    } else {
      setName('');
      setEmail('');
      setRole('ADMIN_RD');
      setTitle('R&D Laboratory Analyst');
      setDepartment('Research & Development');
      setPhone('+62 8');
      setStatus('ACTIVE');
      setPassword('admin123');
      setAvatar(PRESET_AVATARS[1].url);
      setErrorMessage('');
    }
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  if (currentUser.role !== 'SUPER_ADMIN') {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (currentUser.role !== 'SUPER_ADMIN') {
      setErrorMessage('Akses ditolak: Hanya Super Admin yang berwenang mengelola akun pengguna.');
      return;
    }

    if (!name.trim()) {
      setErrorMessage('Nama lengkap wajib diisi.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Format email perusahaan tidak valid.');
      return;
    }

    // Check duplicate email
    const duplicate = users.find(
      (u) =>
        u.email.trim().toLowerCase() === email.trim().toLowerCase() &&
        u.id !== userToEdit?.id
    );

    if (duplicate) {
      setErrorMessage('Email tersebut sudah digunakan oleh akun lain.');
      return;
    }

    if (isEditing && userToEdit) {
      updateUser(userToEdit.id, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: isProtectedSuperAdmin ? 'SUPER_ADMIN' : role,
        title: title.trim(),
        department: department.trim(),
        phone: phone.trim(),
        status: isProtectedSuperAdmin ? 'ACTIVE' : status,
        avatar,
        password: password.trim() || userToEdit.password || 'admin123',
      });
    } else {
      addUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        title: title.trim(),
        department: department.trim(),
        phone: phone.trim(),
        status,
        avatar,
        password: password.trim() || 'admin123',
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-900 to-teal-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {isEditing ? 'Edit Akun Pengguna' : 'Tambah Akun Pengguna Baru'}
              </h2>
              <p className="text-[11px] text-teal-300">
                Departemen Research & Development (R&D) Alat Masak & Enamel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isProtectedSuperAdmin && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-purple-800 text-[11px] flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-600 shrink-0" />
              <span>
                Akun ini adalah <strong>Super Admin Utama (Supervisor R&D)</strong>. Hak akses dan status terkunci untuk menjaga keamanan sistem.
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Lengkap & Gelar *
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Contoh: Ayu Jamilatul Janah, S.T."
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Email Perusahaan (@kencana-enamel.com) *
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="nama@kencana-enamel.com"
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Hak Akses (Role RBAC) *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                disabled={isProtectedSuperAdmin}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium focus:ring-1 focus:ring-teal-500 focus:outline-hidden disabled:bg-slate-100"
              >
                <option value="ADMIN_RD">Admin R&D (Akses Operasional)</option>
                <option value="SUPER_ADMIN">Super Admin (Supervisor R&D - Full Access & Approval)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Status Akun *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                disabled={isProtectedSuperAdmin}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium focus:ring-1 focus:ring-teal-500 focus:outline-hidden disabled:bg-slate-100"
              >
                <option value="ACTIVE">Aktif (Dapat Login & Beroperasi)</option>
                <option value="INACTIVE">Nonaktif (Akses Ditangguhkan)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Jabatan / Job Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Contoh: Formulator & Enamel Specialist"
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Divisi / Departemen *
              </label>
              <div className="relative">
                <Building className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                  placeholder="Contoh: R&D Formulation Lab"
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nomor Telepon / WhatsApp
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+62 812-xxxx-xxxx"
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Avatar Selection */}
          <div className="space-y-1.5 pt-1">
            <label className="block font-semibold text-slate-700">Foto Profil / Avatar</label>
            <div className="flex items-center gap-3">
              <img
                src={avatar}
                alt="Selected Avatar"
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full object-cover border-2 border-teal-500 shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80';
                }}
              />
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_AVATARS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatar(p.url)}
                      className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                        avatar === p.url
                          ? 'bg-teal-50 text-teal-700 border-teal-500 font-semibold'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="Atau masukkan tautan URL gambar avatar..."
                  className="w-full px-2.5 py-1 border border-slate-200 rounded text-[11px] font-mono text-slate-600"
                />
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'Simpan Perubahan Akun' : 'Daftarkan Akun Pengguna'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
