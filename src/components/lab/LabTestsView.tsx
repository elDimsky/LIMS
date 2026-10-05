import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Plus,
  Download,
  Search,
  Filter,
  FileSpreadsheet,
  Award,
  Layers,
} from 'lucide-react';
import { useLims } from '../../context/LimsContext';
import { exportToExcel } from '../../utils/excelExport';
import { LabTestFormModal } from './LabTestFormModal';

export const LabTestsView: React.FC = () => {
  const { labTests } = useLims();

  const [search, setSearch] = useState('');
  const [selectedVerdict, setSelectedVerdict] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredTests = labTests.filter((t) => {
    const matchesSearch =
      t.testName.toLowerCase().includes(search.toLowerCase()) ||
      t.sampleCode.toLowerCase().includes(search.toLowerCase()) ||
      t.researchProjectTitle.toLowerCase().includes(search.toLowerCase()) ||
      t.testedBy.toLowerCase().includes(search.toLowerCase());

    const matchesVerdict =
      selectedVerdict === 'ALL' || t.status === selectedVerdict;

    return matchesSearch && matchesVerdict;
  });

  const passedCount = labTests.filter((t) => t.status === 'PASS').length;
  const passRate = labTests.length > 0 ? Math.round((passedCount / labTests.length) * 100) : 100;

  const handleExportExcel = () => {
    const today = new Date().toISOString().slice(0, 10);
    exportToExcel({
      fileName: `Laboratory_Tests_Report_${today}.xlsx`,
      sheetName: 'Lab Tests Report',
      reportTitle: 'LAPORAN HASIL PENGUJIAN LABORATORIUM R&D',
      data: filteredTests.map((t) => ({
        'Kode Uji': t.testCode,
        'Tanggal Uji': t.testDate,
        'Sample ID': t.sampleCode,
        'Project Riset': t.researchProjectTitle,
        'Nama Pengujian': t.testName,
        'Standar Metode': t.methodStandard,
        'Target Spesifikasi': t.specificationTarget,
        'Hasil Pengujian': t.resultValue,
        'Verdict': t.status,
        'Diuji Oleh': t.testedBy,
        'Diverifikasi': t.verifiedBy || '-',
        'Catatan': t.remarks,
      })),
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Pengujian Mutu Laboratorium (Laboratory Testing)
          </h1>
          <p className="text-xs text-slate-500">
            Standar internasional ASTM/ISO pengujian ketebalan, daya rekat cross-cut, kejut panas 220°C, dan rebus asam sitrat
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
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Input Pengujian</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Pengujian Fisik & Kimia
          </span>
          <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
            {labTests.length} Uji Dilakukan
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Tingkat Kelolosan (Pass Rate)
          </span>
          <span className="text-xl font-bold font-mono text-emerald-600 mt-1 block">
            {passRate}% Lolos Spesifikasi ({passedCount} Pass)
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Metode Baku Internasional
          </span>
          <span className="text-xl font-bold font-mono text-teal-600 mt-1 block">
            ISO 2409 & ISO 28706
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari pengujian, sample ID, project, analis..."
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <select
            value={selectedVerdict}
            onChange={(e) => setSelectedVerdict(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 font-medium"
          >
            <option value="ALL">Semua Status Verdict</option>
            <option value="PASS">PASS (Lolos)</option>
            <option value="FAIL">FAIL (Gagal)</option>
            <option value="PENDING">PENDING</option>
          </select>
        </div>

        <span className="text-slate-500 font-mono text-[11px]">
          {filteredTests.length} Data Uji Ditampilkan
        </span>
      </div>

      {/* Lab Tests Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-3.5 font-semibold">Kode Uji</th>
                <th className="py-3 px-3.5 font-semibold">Sample Benda Uji</th>
                <th className="py-3 px-3.5 font-semibold">Nama Pengujian</th>
                <th className="py-3 px-3.5 font-semibold">Metode Baku</th>
                <th className="py-3 px-3.5 font-semibold">Spesifikasi Target</th>
                <th className="py-3 px-3.5 font-semibold">Hasil Terukur</th>
                <th className="py-3 px-3.5 font-semibold text-center">Status</th>
                <th className="py-3 px-3.5 font-semibold">Analis QC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTests.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3.5 font-mono font-semibold text-slate-900">{t.testCode}</td>
                  <td className="py-3 px-3.5 font-mono text-teal-700 font-bold">{t.sampleCode}</td>
                  <td className="py-3 px-3.5">
                    <p className="font-semibold text-slate-900">{t.testName}</p>
                    <p className="text-[11px] text-slate-500 truncate max-w-xs">{t.researchProjectTitle}</p>
                  </td>
                  <td className="py-3 px-3.5 font-mono text-slate-600">{t.methodStandard}</td>
                  <td className="py-3 px-3.5 text-slate-700">{t.specificationTarget}</td>
                  <td className="py-3 px-3.5 font-mono font-bold text-slate-900">{t.resultValue}</td>
                  <td className="py-3 px-3.5 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold rounded-full border ${
                        t.status === 'PASS'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : t.status === 'FAIL'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-slate-600">{t.testedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <LabTestFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
