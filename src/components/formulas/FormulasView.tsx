import React, { useState } from 'react';
import { Atom, Plus, Download, Search, History, Eye, CheckCircle2 } from 'lucide-react';
import { Formula } from '../../types/lims';
import { useLims } from '../../context/LimsContext';
import { exportToExcel } from '../../utils/excelExport';
import { FormulaDetailModal } from './FormulaDetailModal';
import { FormulaFormModal } from './FormulaFormModal';

export const FormulasView: React.FC = () => {
  const { formulas } = useLims();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filteredFormulas = formulas.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.code.toLowerCase().includes(search.toLowerCase()) ||
      f.applicableSubstrate.toLowerCase().includes(search.toLowerCase());

    const matchesType = selectedType === 'ALL' || f.type === selectedType;

    return matchesSearch && matchesType;
  });

  const handleExportExcel = () => {
    const today = new Date().toISOString().slice(0, 10);
    exportToExcel({
      fileName: `Formulas_Recipes_Report_${today}.xlsx`,
      sheetName: 'Enamel Formulas',
      reportTitle: 'LAPORAN MASTER RESEP & FORMULA ENAMEL COATING',
      data: filteredFormulas.map((f) => ({
        'Kode Formula': f.code,
        'Nama Formula': f.name,
        'Tipe Lapisan': f.type,
        'Substrat Logam': f.applicableSubstrate,
        'Versi Aktif': f.currentVersion,
        'Jumlah Versi Tersimpan': f.versions.length,
        'Status': f.status,
        'Dibuat Oleh': f.createdBy,
        'Deskripsi': f.description,
      })),
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Formula & Recipe Management (Version Control)
          </h1>
          <p className="text-xs text-slate-500">
            Resep komposisi ground coat, cover coat putih titanium, dan enamel warna dengan versioning v1.0, v1.1 tanpa menghapus histori
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Buat Formula Baru</span>
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kode formula, nama resep, substrat..."
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 font-medium"
          >
            <option value="ALL">Semua Tipe Enamel</option>
            <option value="GROUND_COAT">Ground Coat (Dasar)</option>
            <option value="COVER_COAT">Cover Coat (Penutup)</option>
            <option value="DIRECT_ON">Direct On</option>
            <option value="SPECIAL_EFFECT">Special Effect</option>
          </select>
        </div>

        <span className="text-slate-500 font-mono text-[11px]">
          {filteredFormulas.length} Formula Aktif
        </span>
      </div>

      {/* Formulas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFormulas.map((f) => (
          <div
            key={f.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:border-teal-300 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-700">
                    {f.code}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-50 text-teal-700 border border-teal-200">
                    v{f.currentVersion}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-slate-500">
                  {f.versions.length} Versi Tersedia
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm">{f.name}</h3>
                <p className="text-xs text-slate-600 line-clamp-2 mt-1">{f.description}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tipe Enamel:</span>
                  <span className="font-semibold text-slate-900">{f.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Substrat Sesuai:</span>
                  <span className="font-medium text-slate-800">{f.applicableSubstrate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Komposisi Aktif:</span>
                  <span className="font-mono text-teal-700 font-semibold">
                    {f.versions[0]?.components.length || 0} Bahan (100%)
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">Dibuat oleh {f.createdBy}</span>
              <button
                onClick={() => setSelectedFormula(f)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
              >
                <History className="w-3.5 h-3.5 text-teal-600" />
                <span>Lihat Resep & Versi ({f.versions.length})</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <FormulaDetailModal
        formula={selectedFormula}
        onClose={() => setSelectedFormula(null)}
      />

      <FormulaFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </div>
  );
};
