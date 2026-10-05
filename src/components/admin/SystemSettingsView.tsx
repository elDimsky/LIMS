import React, { useState } from 'react';
import { Settings, Building2, Flame, RotateCcw, Check, ShieldAlert } from 'lucide-react';
import { useLims } from '../../context/LimsContext';

export const SystemSettingsView: React.FC = () => {
  const { resetToInitialData, currentUser } = useLims();

  const [companyName, setCompanyName] = useState('PT Kencana Enamel & Cookware Nusantara');
  const [division, setDivision] = useState('Research & Development (R&D) Division');
  const [labLocation, setLabLocation] = useState('Gedung Pusat Inovasi Cookware Kav. B-04, Cikarang');
  const [defaultFiringTemp, setDefaultFiringTemp] = useState(835);
  const [defaultFiringTime, setDefaultFiringTime] = useState(4.5);
  const [reorderBufferPercent, setReorderBufferPercent] = useState(20);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    if (
      window.confirm(
        'PERINGATAN: Seluruh database demo akan dikembalikan ke data awal pabrik. Lanjutkan?'
      )
    ) {
      resetToInitialData();
      alert('Data sistem telah berhasil direset ke kondisi awal.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Konfigurasi & Parameter Sistem LIMS
          </h1>
          <p className="text-xs text-slate-500">
            Profil laboratorium, parameter standar pembakaran enamel, batas reorder stok, dan pemeliharaan database
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Pengaturan parameter sistem berhasil disimpan.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5 text-xs">
        {/* Organization Profile */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-teal-600" />
            <h2 className="font-bold text-slate-900 text-sm">Profil Organisasi & Fasilitas Laboratorium</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Perusahaan Manufaktur</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Divisi / Departemen</label>
              <input
                type="text"
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Alamat Fasilitas Uji & Pilot Plant</label>
            <input
              type="text"
              value={labLocation}
              onChange={(e) => setLabLocation(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
            <p><strong>Super Admin Penanggung Jawab:</strong> Ayu Jamilatul Janah</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Jabatan: Supervisor Research & Development (R&D)</p>
          </div>
        </div>

        {/* Process Defaults */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Flame className="w-4 h-4 text-amber-600" />
            <h2 className="font-bold text-slate-900 text-sm">Parameter Bawaan Proses Enameling Lab</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Suhu Firing Bawaan (°C)</label>
              <input
                type="number"
                value={defaultFiringTemp}
                onChange={(e) => setDefaultFiringTemp(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Waktu Firing Bawaan (Menit)</label>
              <input
                type="number"
                value={defaultFiringTime}
                onChange={(e) => setDefaultFiringTime(Number(e.target.value))}
                step="0.1"
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Buffer Safety Stock (%)</label>
              <input
                type="number"
                value={reorderBufferPercent}
                onChange={(e) => setReorderBufferPercent(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold shadow-xs transition-colors"
            >
              Simpan Konfigurasi
            </button>
          </div>
        </div>
      </form>

      {/* Dangerous Zone / Factory Reset */}
      <div className="bg-rose-50/50 rounded-xl border border-rose-200 p-5 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-rose-800">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <h2 className="font-bold text-sm">Reset Database Awal (Demo Factory Reset)</h2>
        </div>
        <p className="text-xs text-rose-700 leading-relaxed">
          Mengembalikan semua data master bahan, stok, purchase order, eksperimen, hasil uji lab, dan logbook ke kondisi seed awal PT Kencana Enamel Nusantara.
        </p>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset ke Data Demo Awal</span>
        </button>
      </div>
    </div>
  );
};
