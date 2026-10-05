import React, { useState } from 'react';
import { BookOpen, Plus, Download, Search, Calendar, User, FileText, ChevronRight } from 'lucide-react';
import { useLims } from '../../context/LimsContext';
import { exportToExcel } from '../../utils/excelExport';
import { LogbookFormModal } from './LogbookFormModal';

export const LogbookView: React.FC = () => {
  const { logbookEntries, researchProjects } = useLims();

  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredEntries = logbookEntries.filter((l) => {
    const matchesSearch =
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.conclusion.toLowerCase().includes(search.toLowerCase()) ||
      l.author.toLowerCase().includes(search.toLowerCase()) ||
      l.researchProjectTitle.toLowerCase().includes(search.toLowerCase());

    const matchesProject =
      selectedProject === 'ALL' || l.researchProjectId === selectedProject;

    return matchesSearch && matchesProject;
  });

  const handleExportExcel = () => {
    const today = new Date().toISOString().slice(0, 10);
    exportToExcel({
      fileName: `Research_Logbook_Report_${today}.xlsx`,
      sheetName: 'Logbook Entries',
      reportTitle: 'BUKU CATATAN DIGITAL PENELITIAN (ELECTRONIC LAB NOTEBOOK)',
      data: filteredEntries.map((l) => ({
        'Tanggal': l.date,
        'Project Riset': l.researchProjectTitle,
        'Judul Catatan': l.title,
        'Hipotesis': l.hypothesis,
        'Prosedur': l.procedure,
        'Observasi': l.observations,
        'Hasil': l.resultsSummary,
        'Kendala': l.problemsEncountered || '-',
        'Solusi': l.solutionImplemented || '-',
        'Kesimpulan': l.conclusion,
        'Tindak Lanjut': l.nextSteps,
        'Penulis': l.author,
      })),
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Digital Laboratory Logbook (ELN)
          </h1>
          <p className="text-xs text-slate-500">
            Pencatatan kronologis ilmiah, hipotesis penyesuaian resep enamel, prosedur preparasi plat, dan dokumentasi temuan laboratorium
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
            <span>+ Tulis Catatan Logbook</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul, observasi, kesimpulan, penulis..."
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 font-medium"
          >
            <option value="ALL">Semua Project Riset</option>
            {researchProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} - {p.title}
              </option>
            ))}
          </select>
        </div>

        <span className="text-slate-500 font-mono text-[11px]">
          {filteredEntries.length} Jurnal Logbook Tercatat
        </span>
      </div>

      {/* Logbook Timeline Cards */}
      <div className="space-y-4">
        {filteredEntries.map((log) => (
          <div
            key={log.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:border-teal-300 transition-all space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded bg-teal-50 text-teal-800 font-mono font-bold text-xs border border-teal-200">
                  {log.date}
                </span>
                <span className="font-semibold text-slate-700 text-xs truncate max-w-md">
                  {log.researchProjectTitle}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{log.author}</span>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-snug">{log.title}</h2>
              {log.hypothesis && (
                <p className="text-xs text-slate-600 mt-1 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <strong>Hipotesis:</strong> "{log.hypothesis}"
                </p>
              )}
            </div>

            <div className="space-y-1.5 text-xs text-slate-700">
              <p>
                <strong>Prosedur:</strong> {log.procedure}
              </p>
              <p>
                <strong>Hasil & Pengamatan:</strong> {log.observations}
              </p>
              {log.problemsEncountered && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 bg-amber-50/50 rounded border border-amber-200 text-amber-900 text-[11px]">
                  <div>
                    <strong>Kendala:</strong> {log.problemsEncountered}
                  </div>
                  <div>
                    <strong>Solusi:</strong> {log.solutionImplemented}
                  </div>
                </div>
              )}
              <div className="p-2.5 bg-teal-50/40 rounded border border-teal-200 text-teal-900">
                <strong>Kesimpulan:</strong> {log.conclusion}
              </div>
            </div>

            {log.nextSteps && (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  <strong>Next Action:</strong> {log.nextSteps}
                </span>
                <span className="font-mono text-slate-400">Versi {log.version}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <LogbookFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
