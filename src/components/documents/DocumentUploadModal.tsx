import React, { useState } from 'react';
import { X, Upload, Check, FileText } from 'lucide-react';
import { DocumentCategory } from '../../types/lims';
import { useLims } from '../../context/LimsContext';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({ isOpen, onClose }) => {
  const { uploadDocument, currentUser } = useLims();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('SOP');
  const [version, setVersion] = useState('1.0');
  const [fileFormat, setFileFormat] = useState<'PDF' | 'DOCX' | 'XLSX'>('PDF');
  const [tagsInput, setTagsInput] = useState('SOP, Cookware, Enamel');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

    uploadDocument({
      title,
      category,
      version,
      fileFormat,
      fileSize: '2.4 MB',
      uploadedBy: currentUser.name,
      tags,
      status: currentUser.role === 'SUPER_ADMIN' ? 'APPROVED' : 'PENDING_APPROVAL',
      approvedBy: currentUser.role === 'SUPER_ADMIN' ? currentUser.name : undefined,
      description,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-cyan-50/50">
          <div className="flex items-center gap-2.5">
            <Upload className="w-5 h-5 text-cyan-600" />
            <h2 className="text-sm font-bold text-slate-900">Upload Dokumen Laboratorium</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Judul Dokumen *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="misal: SOP Pengujian Ketahanan Asam Sitrat Cookware Enamel"
              required
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kategori Dokumen *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium"
              >
                <option value="SOP">SOP (Standar Operasional)</option>
                <option value="WORK_INSTRUCTION">Work Instruction (WI)</option>
                <option value="RESEARCH_REPORT">Research Report</option>
                <option value="TEST_REPORT">Test Report Lab QC</option>
                <option value="COA">COA (Certificate of Analysis)</option>
                <option value="MSDS_SDS">MSDS / SDS Bahan Kimia</option>
                <option value="FORMULA_SHEET">Formula Sheet</option>
                <option value="SPECIFICATION">Spesifikasi Standar</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Versi Dokumen</label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          {/* Drag & Drop Upload Zone Simulator */}
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center space-y-2 bg-slate-50/70 hover:bg-slate-50 transition-colors">
            <Upload className="w-8 h-8 mx-auto text-slate-400" />
            <p className="text-slate-700 font-semibold">Tarik & Jatuhkan file PDF/DOCX/XLSX di sini</p>
            <p className="text-[11px] text-slate-400">Ukuran maksimal file 25 MB</p>
            <button
              type="button"
              className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium shadow-2xs hover:bg-slate-100"
            >
              Pilih Berkas Lokal
            </button>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tags / Label (Pisahkan koma)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Deskripsi & Ruang Lingkup</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Unggah Dokumen</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
