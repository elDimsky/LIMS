import React, { useState } from 'react';
import {
  X,
  FolderGit2,
  Beaker,
  Package,
  QrCode,
  CheckCircle2,
  Trash2,
  FileText,
  Clock,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { ResearchProject } from '../../types/lims';
import { useLims } from '../../context/LimsContext';
import { formatCurrencyIDR, formatDate } from '../../utils/formatters';

interface ResearchDetailModalProps {
  project: ResearchProject | null;
  onClose: () => void;
  onEdit: (project: ResearchProject) => void;
}

export const ResearchDetailModal: React.FC<ResearchDetailModalProps> = ({
  project,
  onClose,
  onEdit,
}) => {
  const { experiments, samples, labTests, wasteRecords, documents, currentUser } = useLims();
  const [activeTab, setActiveTab] = useState<'overview' | 'experiments' | 'samples' | 'tests' | 'waste' | 'docs'>('overview');

  if (!project) return null;

  const projectExperiments = experiments.filter((e) => e.researchProjectId === project.id);
  const projectSamples = samples.filter((s) => s.researchProjectId === project.id);
  const projectTests = labTests.filter((t) => t.researchProjectId === project.id);
  const projectWaste = wasteRecords.filter((w) => w.researchProjectId === project.id);
  const projectDocs = documents.filter((d) => d.relatedEntityId === project.id);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-end bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-3xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 truncate max-w-md">{project.title}</h2>
              <p className="text-xs text-slate-500 font-mono">
                {project.code} · Kategori: {project.category.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(project)}
              className="px-3 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-md transition-colors"
            >
              Edit Project
            </button>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-md">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Smart Tabs Nav */}
        <div className="px-4 border-b border-slate-200 flex items-center gap-1 bg-white overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview & Metrik' },
            { id: 'experiments', label: `Eksperimen (${projectExperiments.length})` },
            { id: 'samples', label: `Samples (${projectSamples.length})` },
            { id: 'tests', label: `Uji Lab QC (${projectTests.length})` },
            { id: 'waste', label: `Limbah (${projectWaste.length})` },
            { id: 'docs', label: `Dokumen (${projectDocs.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-teal-500 text-teal-700 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Status and Progress Bar */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block">Status Riset Saat Ini:</span>
                  <span className="text-sm font-bold text-teal-800">{project.status}</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block">Persetujuan Supervisor:</span>
                  <span className="text-xs font-semibold text-emerald-700">
                    {project.approvedBy ? `Disetujui oleh ${project.approvedBy}` : 'Menunggu Review'}
                  </span>
                </div>
              </div>

              {/* Objectives & Target */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Tujuan & Target Produk
                </span>
                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1.5">
                  <p className="font-semibold text-slate-900">Produk Sasaran: {project.productTarget}</p>
                  <p className="text-slate-600 leading-relaxed">{project.objective}</p>
                </div>
              </div>

              {/* Background and Problem */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50/70 border border-slate-200 rounded-lg space-y-1">
                  <span className="font-semibold text-slate-800 block text-[11px]">Latar Belakang Pasar</span>
                  <p className="text-slate-600 leading-relaxed">{project.background}</p>
                </div>
                <div className="p-3 bg-slate-50/70 border border-slate-200 rounded-lg space-y-1">
                  <span className="font-semibold text-slate-800 block text-[11px]">Masalah Teknis & Tantangan</span>
                  <p className="text-slate-600 leading-relaxed">{project.problemStatement}</p>
                </div>
              </div>

              {/* Target Metric */}
              <div className="p-3 bg-teal-50/50 border border-teal-200 rounded-lg space-y-1">
                <span className="font-semibold text-teal-900 block text-[11px]">Target Kriteria Keberhasilan (Acceptance Criteria):</span>
                <p className="text-teal-800 font-medium">{project.targetMetric}</p>
              </div>

              {/* Team & Timeline */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border border-slate-200 rounded-lg space-y-1.5">
                  <span className="font-semibold text-slate-500 uppercase text-[11px]">Timeline & PIC</span>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">PIC Utama:</span>
                    <span className="font-medium text-slate-900">{project.pic}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Mulai:</span>
                    <span className="font-mono">{project.startDate}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Target Selesai:</span>
                    <span className="font-mono">{project.targetCompletion}</span>
                  </div>
                </div>

                <div className="p-3 border border-slate-200 rounded-lg space-y-1.5">
                  <span className="font-semibold text-slate-500 uppercase text-[11px]">Anggaran & Biaya</span>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Alokasi Budget:</span>
                    <span className="font-mono font-bold text-slate-900">{formatCurrencyIDR(project.budget)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Realisasi Biaya:</span>
                    <span className="font-mono font-bold text-teal-700">{formatCurrencyIDR(project.actualSpent)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Prioritas:</span>
                    <span className="font-semibold text-slate-900">{project.priority}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'experiments' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Daftar Uji Coba Eksperimen Laboratorium</h3>
                <span className="text-slate-500">{projectExperiments.length} Eksperimen</span>
              </div>
              {projectExperiments.length === 0 ? (
                <p className="text-slate-400 py-6 text-center">Belum ada eksperimen dicatat untuk project ini.</p>
              ) : (
                projectExperiments.map((exp) => (
                  <div key={exp.id} className="p-3.5 border border-slate-200 rounded-lg space-y-2 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-teal-700">{exp.experimentNumber}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {exp.status}
                      </span>
                    </div>
                    <p className="font-medium text-slate-900">{exp.objective}</p>
                    <p className="text-slate-600 leading-relaxed">{exp.observation}</p>
                    <div className="p-2 bg-white rounded border border-slate-200 text-[11px] text-slate-700 font-mono">
                      <strong>Parameter:</strong> {exp.processParameters.temperature}°C · {exp.processParameters.firingTime} menit · {exp.processParameters.applicationMethod}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'samples' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Sample & Benda Uji Terdaftar</h3>
                <span className="text-slate-500">{projectSamples.length} Samples</span>
              </div>
              {projectSamples.map((s) => (
                <div key={s.id} className="p-3 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-slate-900">{s.sampleCode}</span>
                    <p className="text-slate-800 font-medium">{s.productName}</p>
                    <p className="text-slate-500 text-[11px]">Lokasi: {s.storageLocation}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {s.overallTestStatus}
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'tests' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Hasil Pengujian Laboratorium</h3>
                <span className="text-slate-500">{projectTests.length} Uji Dilakukan</span>
              </div>
              {projectTests.map((t) => (
                <div key={t.id} className="p-3 border border-slate-200 rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{t.testName}</span>
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {t.status}
                    </span>
                  </div>
                  <p className="text-slate-600">Hasil: <strong className="text-slate-900 font-mono">{t.resultValue}</strong> (Standar: {t.specificationTarget})</p>
                  <p className="text-slate-500 text-[11px]">{t.remarks}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'waste' && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-800">Catatan Limbah dari Project Ini</h3>
              {projectWaste.length === 0 ? (
                <p className="text-slate-400 py-6 text-center">Tidak ada limbah tercatat untuk project ini.</p>
              ) : (
                projectWaste.map((w) => (
                  <div key={w.id} className="p-3 border border-slate-200 rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold text-slate-800">{w.wasteCode}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold">
                        {w.hazardCategory}
                      </span>
                    </div>
                    <p className="text-slate-800 font-medium">{w.materialName} ({w.quantity} {w.unit})</p>
                    <p className="text-slate-500">{w.reason}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'docs' && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-800">Dokumen & Laporan Terlampir</h3>
              {projectDocs.length === 0 ? (
                <p className="text-slate-400 py-6 text-center">Belum ada dokumen terlampir.</p>
              ) : (
                projectDocs.map((doc) => (
                  <div key={doc.id} className="p-3 border border-slate-200 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{doc.title}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{doc.documentNumber} · {doc.fileSize}</p>
                    </div>
                    <span className="text-teal-600 font-medium text-xs">PDF</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
