import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Download,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  FileSpreadsheet,
  Tag,
} from 'lucide-react';
import { DocumentRecord } from '../../types/lims';
import { useLims } from '../../context/LimsContext';
import { exportToExcel } from '../../utils/excelExport';
import { DocumentUploadModal } from './DocumentUploadModal';

export const DocumentsView: React.FC = () => {
  const { documents } = useLims();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentRecord | null>(null);

  const filteredDocs = documents.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.documentNumber.toLowerCase().includes(search.toLowerCase()) ||
      d.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'ALL' || d.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleExportExcel = () => {
    const today = new Date().toISOString().slice(0, 10);
    exportToExcel({
      fileName: `Documents_Library_Report_${today}.xlsx`,
      sheetName: 'Documents',
      reportTitle: 'REKAPITULASI DOKUMEN SISTEM MANAJEMEN LABORATORIUM R&D',
      data: filteredDocs.map((d) => ({
        'No. Dokumen': d.documentNumber,
        'Judul Dokumen': d.title,
        'Kategori': d.category,
        'Versi': d.version,
        'Format': d.fileFormat,
        'Ukuran': d.fileSize,
        'Tanggal Unggah': d.uploadDate,
        'Diupload Oleh': d.uploadedBy,
        'Status': d.status,
        'Tags': d.tags.join(', '),
      })),
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Centralized Document Management
          </h1>
          <p className="text-xs text-slate-500">
            Penyimpanan dokumen SOP, Work Instruction, COA bahan, MSDS/SDS bahan kimia, dan sertifikasi kepatuhan ISO/LFGB
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
            onClick={() => setIsUploadOpen(true)}
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>+ Upload Dokumen</span>
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
              placeholder="Cari judul dokumen, nomor, tags..."
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 font-medium"
          >
            <option value="ALL">Semua Kategori ({documents.length})</option>
            <option value="SOP">SOP</option>
            <option value="WORK_INSTRUCTION">Work Instruction</option>
            <option value="RESEARCH_REPORT">Research Report</option>
            <option value="MSDS_SDS">MSDS / SDS</option>
            <option value="COA">COA Vendor</option>
          </select>
        </div>

        <span className="text-slate-500 font-mono text-[11px]">
          {filteredDocs.length} Dokumen Tersedia
        </span>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-3.5 font-semibold">No. Dokumen</th>
                <th className="py-3 px-3.5 font-semibold">Judul Dokumen</th>
                <th className="py-3 px-3.5 font-semibold">Kategori</th>
                <th className="py-3 px-3.5 font-semibold">Versi</th>
                <th className="py-3 px-3.5 font-semibold">Format & Size</th>
                <th className="py-3 px-3.5 font-semibold">Tgl Upload</th>
                <th className="py-3 px-3.5 font-semibold text-center">Status</th>
                <th className="py-3 px-3.5 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3.5 font-mono font-semibold text-slate-900">{doc.documentNumber}</td>
                  <td className="py-3 px-3.5 min-w-[240px]">
                    <p className="font-semibold text-slate-900">{doc.title}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {doc.tags.map((t, idx) => (
                        <span key={idx} className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3.5 text-slate-600">{doc.category}</td>
                  <td className="py-3 px-3.5 font-mono font-semibold text-slate-800">v{doc.version}</td>
                  <td className="py-3 px-3.5 font-mono text-slate-500">
                    {doc.fileFormat} · {doc.fileSize}
                  </td>
                  <td className="py-3 px-3.5 font-mono text-slate-500">{doc.uploadDate}</td>
                  <td className="py-3 px-3.5 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {doc.status}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="p-1 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 rounded"
                        title="Preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => alert(`Mengunduh berkas ${doc.title} (${doc.fileFormat})`)}
                        className="p-1 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded"
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Preview Simulator Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-600" />
                <h2 className="text-xs font-bold text-slate-900">{previewDoc.title}</h2>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="p-1 text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <p><strong>Nomor:</strong> {previewDoc.documentNumber}</p>
                <p><strong>Kategori:</strong> {previewDoc.category}</p>
                <p><strong>Versi:</strong> {previewDoc.version}</p>
                <p><strong>Diupload Oleh:</strong> {previewDoc.uploadedBy} pada {previewDoc.uploadDate}</p>
                <p><strong>Deskripsi:</strong> {previewDoc.description}</p>
              </div>

              <div className="p-8 border-2 border-dashed border-slate-300 rounded-xl text-center text-slate-400 space-y-2">
                <FileText className="w-12 h-12 mx-auto text-slate-300" />
                <p className="font-semibold text-slate-700">Preview Dokumen Terintegrasi ({previewDoc.fileFormat})</p>
                <p className="text-[11px]">Dokumen tervalidasi dan siap digunakan oleh tim laboratorium R&D.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    alert(`Mengunduh ${previewDoc.documentNumber}`);
                    setPreviewDoc(null);
                  }}
                  className="px-4 py-1.5 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded shadow-xs flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Dokumen</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <DocumentUploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  );
};
