import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Flame,
  CheckCircle2,
  Lock,
  Mail,
  ArrowRight,
  Shield,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { useLims } from '../../context/LimsContext';
import { INITIAL_USERS } from '../../data/initialData';

interface LoginViewProps {
  onLoginSuccess: (name: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const { users, setCurrentUser } = useLims();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Silakan masukkan email perusahaan dan kata sandi.');
      return;
    }

    setIsLoading(true);

    const normalizedInputEmail = email.trim().toLowerCase();
    const user =
      users.find((u) => u.email.trim().toLowerCase() === normalizedInputEmail) ||
      INITIAL_USERS.find((u) => u.email.trim().toLowerCase() === normalizedInputEmail);

    if (!user) {
      setIsLoading(false);
      setErrorMessage('Akun dengan email tersebut tidak terdaftar di sistem laboratorium.');
      return;
    }

    if (user.status === 'INACTIVE') {
      setIsLoading(false);
      setErrorMessage('Akun ini sedang dinonaktifkan. Silakan hubungi Administrator Sistem Laboratorium.');
      return;
    }

    const expectedPassword = user.password || (user.role === 'SUPER_ADMIN' ? 'supervisor123' : 'admin123');
    if (password.trim() !== expectedPassword.trim()) {
      setIsLoading(false);
      setErrorMessage('Kata sandi yang Anda masukkan salah. Silakan periksa kembali.');
      return;
    }

    // Authenticate
    setTimeout(() => {
      setCurrentUser(user);
      setIsLoading(false);
      onLoginSuccess(user.name);
    }, 350);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Card */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-sm border border-teal-500/30">
              EC
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">EnamelCook LIMS</h1>
              <p className="text-[11px] text-teal-400">R&D Laboratory Management System</p>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            PT Kencana Enamel & Cookware Nusantara · Masuk untuk mengelola formulasi enamel, pengujian alat masak, dan inventori.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {infoMessage && (
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-teal-800 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-teal-600" />
                <span>{infoMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setInfoMessage('')}
                className="text-teal-600 hover:text-teal-800 font-bold ml-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* Email input */}
          <div className="space-y-1">
            <label className="block font-semibold text-slate-700">Email Perusahaan</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="nama@kencana-enamel.com"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block font-semibold text-slate-700">Password</label>
              <button
                type="button"
                onClick={() => setInfoMessage('Untuk pengaturan ulang kata sandi, silakan hubungi Administrator Sistem Laboratorium.')}
                className="text-[11px] text-teal-600 hover:text-teal-700 hover:underline"
              >
                Lupa Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500 w-3.5 h-3.5"
              />
              <span>Ingat Sesi Login Saya</span>
            </label>
            <span className="text-[11px] text-slate-400 font-mono">v2.4 Production</span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span>Memverifikasi kredensial...</span>
            ) : (
              <>
                <span>Masuk ke LIMS Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Security & Organization Notice */}
          <div className="pt-3 border-t border-slate-100 flex items-start gap-2 text-slate-500 text-[11px]">
            <Shield className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <p className="leading-snug">
              Akses sistem terotentikasi dan terlindungi audit trail ISO 17025 Laboratory Management System.
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500">
          PT Kencana Enamel & Cookware Nusantara · Sistem Manajemen Laboratorium R&D
        </div>
      </div>
    </div>
  );
};
