import React, { useState } from 'react';
import {
  FolderGit2,
  Plus,
  Download,
  Search,
  Filter,
  Eye,
  Edit2,
  Layers,
  ChevronRight,
  Clock,
  CheckCircle2,
  Calendar,
  Users,
} from 'lucide-react';
import { ResearchProject, ResearchCategory, ResearchStatus } from '../../types/lims';
import { useLims } from '../../context/LimsContext';
import { formatCurrencyIDR, formatDate } from '../../utils/formatters';
import { exportToExcel } from '../../utils/excelExport';
import { ResearchDetailModal } from './ResearchDetailModal';
import { ResearchFormModal } from './ResearchFormModal';

export const ResearchView: React.FC = () => {
  const { researchProjects } = useLims();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const [selectedProject, setSelectedProject] = useState<ResearchProject | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<ResearchProject | null>(null);

  const filteredProjects = researchProjects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.productTarget.toLowerCase().includes(search.toLowerCase()) ||
      p.pic.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'ALL' || p.category === selectedCategory;

    const matchesStatus =
      selectedStatus === 'ALL' || p.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalBudget = researchProjects.reduce((acc, p) => acc + p.budget, 0);
  const totalSpent = researchProjects.reduce((acc, p) => acc + p.actualSpent, 0);
  const activeCount = researchProjects.filter(
    (p) => p.status === 'PLANNING' || p.status === 'EXPERIMENT' || p.status === 'TESTING' || p.status === 'REVIEW'
  ).length;

  const handleExportExcel = () => {
    const today = new Date().toISOString().slice(0, 10);
    exportToExcel({
      fileName: `Research_Projects_Report_${today}.xlsx`,
      sheetName: 'Research Projects',
      reportTitle: 'LAPORAN RESEARCH & DEVELOPMENT PROJECTS',
      metadata: {
        'Kategori': selectedCategory,
        'Status': selectedStatus,
        'Total Project': `${filteredProjects.length} proyek`,
      },
      data: filteredProjects.map((p) => ({
        'Kode Project': p.code,
        'Judul Riset': p.title,
        'Kategori': p.category,
        'Target Produk': p.productTarget,
        'PIC': p.pic,
        'Mulai': p.startDate,
        'Target Selesai': p.targetCompletion,
        'Prioritas': p.priority,
        'Status': p.status,
        'Budget (IDR)': p.budget,
        'Realisasi Biaya (IDR)': p.actualSpent,
        'Tujuan': p.objective,
        'Target Metrik': p.targetMetric,
        'Supervisor Approval': p.approvedBy || 'Pending',
      })),
    });
  };

  return (
    <div className="space-y-5">
      {/* Top Banner and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Research & Development Projects
          </h1>
          <p className="text-xs text-slate-500">
            Portofolio proyek riset alat masak, inovasi formula enamel tahan kejut panas, dan optimasi proses
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
            onClick={() => {
              setProjectToEdit(null);
              setIsFormOpen(true);
            }}
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Buat Project Baru</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Project Riset Aktif
          </span>
          <span className="text-xl font-bold font-mono text-teal-600 mt-1 block">
            {activeCount} Proyek Berjalan
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Alokasi Budget R&D
          </span>
          <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
            {formatCurrencyIDR(totalBudget)}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Realisasi Pengeluaran Biaya
          </span>
          <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
            {formatCurrencyIDR(totalSpent)}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Tuntas & Approved
          </span>
          <span className="text-xl font-bold font-mono text-emerald-600 mt-1 block">
            {researchProjects.filter((p) => p.status === 'APPROVED' || p.status === 'COMPLETED').length} Proyek Lolos
          </span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul project, kode, PIC, produk target..."
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 font-medium"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="NEW_PRODUCT_DEVELOPMENT">New Product Dev</option>
            <option value="PRODUCT_IMPROVEMENT">Product Improvement</option>
            <option value="COST_REDUCTION">Cost Reduction</option>
            <option value="ENAMEL_RESEARCH">Enamel Research</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 font-medium"
          >
            <option value="ALL">Semua Status</option>
            <option value="PLANNING">Planning</option>
            <option value="EXPERIMENT">Experiment</option>
            <option value="TESTING">Testing</option>
            <option value="REVIEW">Review</option>
            <option value="APPROVED">Approved</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <span className="text-slate-500 font-mono text-[11px]">
          {filteredProjects.length} Project Ditampilkan
        </span>
      </div>

      {/* Projects Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProjects.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:border-teal-300 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-700">
                      {p.code}
                    </span>
                    <span className="text-[11px] text-teal-700 font-medium">
                      {p.category.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{p.title}</h3>
                </div>
                <span
                  className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold rounded-full border shrink-0 ${
                    p.status === 'EXPERIMENT'
                      ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                      : p.status === 'TESTING'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {p.status}
                </span>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{p.objective}</p>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-700 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Target Produk:</span>
                  <span className="font-semibold text-slate-900">{p.productTarget}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Kriteria Keberhasilan:</span>
                  <span className="text-slate-800 line-clamp-1 truncate max-w-xs">{p.targetMetric}</span>
                </div>
              </div>
            </div>

            {/* Bottom info & actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-700">PIC: {p.pic}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-slate-900 font-semibold">{formatCurrencyIDR(p.budget)}</span>
                </div>
                <div className="text-[11px] text-slate-400">Target: {p.targetCompletion}</div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSelectedProject(p)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Detail</span>
                </button>
                <button
                  onClick={() => {
                    setProjectToEdit(p);
                    setIsFormOpen(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit Project"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      <ResearchDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onEdit={(p) => {
          setSelectedProject(null);
          setProjectToEdit(p);
          setIsFormOpen(true);
        }}
      />

      <ResearchFormModal
        isOpen={isFormOpen}
        projectToEdit={projectToEdit}
        onClose={() => {
          setIsFormOpen(false);
          setProjectToEdit(null);
        }}
      />
    </div>
  );
};
