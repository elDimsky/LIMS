import React, { useState } from 'react';
import {
  Beaker,
  Plus,
  Download,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Thermometer,
  Calendar,
  Eye,
} from 'lucide-react';
import { useLims } from '../../context/LimsContext';
import { formatDate } from '../../utils/formatters';
import { exportToExcel } from '../../utils/excelExport';
import { ExperimentFormModal } from './ExperimentFormModal';

export const ExperimentsView: React.FC = () => {
  const { experiments, researchProjects } = useLims();

  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeExpDetail, setActiveExpDetail] = useState<typeof experiments[0] | null>(null);

  const filteredExperiments = experiments.filter((e) => {
    const matchesSearch =
      e.experimentNumber.toLowerCase().includes(search.toLowerCase()) ||
      e.objective.toLowerCase().includes(search.toLowerCase()) ||
      e.conclusion.toLowerCase().includes(search.toLowerCase()) ||
      e.operator.toLowerCase().includes(search.toLowerCase());

    const matchesProject =
      selectedProject === 'ALL' || e.researchProjectId === selectedProject;

    return matchesSearch && matchesProject;
  });

  const successfulCount = experiments.filter((e) => e.success).length;

  const handleExportExcel = () => {
    const today = new Date().toISOString().slice(0, 10);
    exportToExcel({
      fileName: `Experiments_Report_${today}.xlsx`,
      sheetName: 'Experiments',
      reportTitle: 'LAPORAN HASIL EKSPERIMEN & TRIAL ENAMEL COOKWARE',
      data: filteredExperiments.map((e) => ({
        'No. Eksperimen': e.experimentNumber,
        'Tanggal': e.experimentDate,
        'Project Riset': e.researchProjectTitle,
        'Tujuan': e.objective,
        'Formula': e.formulaName || '-',
        'Suhu Firing (°C)': e.processParameters.temperature,
        'Waktu Firing (Min)': e.processParameters.firingTime,
        'Metode Aplikasi': e.processParameters.applicationMethod,
        'Operator': e.operator,
        'Hasil Pengamatan': e.observation,
        'Kesimpulan': e.conclusion,
        'Status': e.status,
        'Berhasil': e.success ? 'Ya (Pass)' : 'Tidak (Fail)',
      })),
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Eksperimen & Uji Coba Laboratorium
          </h1>
          <p className="text-xs text-slate-500">
            Pencatatan parameter suhu pembakaran, viskositas suspensi slip enamel, konsumsi bahan, dan korelasi sampel
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
            <span>+ Catat Eksperimen Baru</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Eksperimen Selesai
          </span>
          <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
            {experiments.length} Uji Coba
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Tingkat Keberhasilan
          </span>
          <span className="text-xl font-bold font-mono text-emerald-600 mt-1 block">
            {experiments.length > 0 ? Math.round((successfulCount / experiments.length) * 100) : 100}% Sukses ({successfulCount} Lolos)
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Formula Enamel Teruji
          </span>
          <span className="text-xl font-bold font-mono text-teal-600 mt-1 block">
            Ground Coat G-12 & Cover Coat W-20
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari no. eksperimen, tujuan, operator..."
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 font-medium"
          >
            <option value="ALL">Semua Project Riset ({researchProjects.length})</option>
            {researchProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} - {p.title}
              </option>
            ))}
          </select>
        </div>

        <span className="text-slate-500 font-mono text-[11px]">
          {filteredExperiments.length} Eksperimen Ditampilkan
        </span>
      </div>

      {/* Experiments Cards Grid */}
      <div className="space-y-3">
        {filteredExperiments.map((exp) => (
          <div
            key={exp.id}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-teal-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 min-w-0 max-w-2xl">
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-bold text-teal-700 text-xs px-2 py-0.5 rounded bg-teal-50 border border-teal-100">
                  {exp.experimentNumber}
                </span>
                <span className="text-slate-400">·</span>
                <span className="font-semibold text-slate-800 text-xs truncate">
                  {exp.researchProjectTitle}
                </span>
              </div>

              <p className="font-medium text-slate-900 text-xs">{exp.objective}</p>
              <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                <strong>Observasi:</strong> {exp.observation}
              </p>

              {/* Parameter Tags */}
              <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 pt-1 font-mono">
                <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                  Temp: {exp.processParameters.temperature}°C
                </span>
                <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                  Time: {exp.processParameters.firingTime} min
                </span>
                <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                  Method: {exp.processParameters.applicationMethod}
                </span>
                <span className="text-slate-400">Operator: {exp.operator}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end md:self-center shrink-0">
              <div className="text-right">
                <span
                  className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold rounded-full border ${
                    exp.status === 'APPROVED'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-cyan-50 text-cyan-700 border-cyan-200'
                  }`}
                >
                  {exp.status}
                </span>
                <span className="block text-[10px] text-slate-400 font-mono mt-1">
                  {exp.experimentDate}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ExperimentFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
