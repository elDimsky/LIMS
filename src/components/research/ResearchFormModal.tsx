import React, { useState, useEffect } from 'react';
import { X, FolderGit2, Check } from 'lucide-react';
import { ResearchProject, ResearchCategory, ResearchStatus } from '../../types/lims';
import { useLims } from '../../context/LimsContext';

interface ResearchFormModalProps {
  isOpen: boolean;
  projectToEdit: ResearchProject | null;
  onClose: () => void;
}

export const ResearchFormModal: React.FC<ResearchFormModalProps> = ({
  isOpen,
  projectToEdit,
  onClose,
}) => {
  const { createResearchProject, updateResearchProject, currentUser, materials } = useLims();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ResearchCategory>('NEW_PRODUCT_DEVELOPMENT');
  const [productTarget, setProductTarget] = useState('');
  const [objective, setObjective] = useState('');
  const [background, setBackground] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [targetMetric, setTargetMetric] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [targetCompletion, setTargetCompletion] = useState(
    new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10)
  );
  const [pic, setPic] = useState(currentUser.name);
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('HIGH');
  const [status, setStatus] = useState<ResearchStatus>('PLANNING');
  const [budget, setBudget] = useState(75000000);

  useEffect(() => {
    if (projectToEdit) {
      setTitle(projectToEdit.title);
      setCategory(projectToEdit.category);
      setProductTarget(projectToEdit.productTarget);
      setObjective(projectToEdit.objective);
      setBackground(projectToEdit.background);
      setProblemStatement(projectToEdit.problemStatement);
      setTargetMetric(projectToEdit.targetMetric);
      setStartDate(projectToEdit.startDate);
      setTargetCompletion(projectToEdit.targetCompletion);
      setPic(projectToEdit.pic);
      setPriority(projectToEdit.priority);
      setStatus(projectToEdit.status);
      setBudget(projectToEdit.budget);
    } else {
      setTitle('');
      setProductTarget('');
      setObjective('');
      setBackground('');
      setProblemStatement('');
      setTargetMetric('Adhesi ISO 2409 Class 0, Ketahanan asam sitrat boiling Class AA, Thermal shock > 220°C.');
      setBudget(75000000);
      setPic(currentUser.name);
      setStatus('PLANNING');
    }
  }, [projectToEdit, isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !productTarget.trim()) return;

    if (projectToEdit) {
      updateResearchProject({
        ...projectToEdit,
        title,
        category,
        productTarget,
        objective,
        background,
        problemStatement,
        targetMetric,
        startDate,
        targetCompletion,
        pic,
        priority,
        status,
        budget: Number(budget),
      });
    } else {
      createResearchProject({
        title,
        category,
        productTarget,
        objective,
        background,
        problemStatement,
        targetMetric,
        startDate,
        targetCompletion,
        pic,
        teamMembers: [currentUser.name, 'Admin R&D 01', 'Admin R&D 02'],
        priority,
        status: currentUser.role === 'SUPER_ADMIN' ? 'EXPERIMENT' : 'PLANNING',
        budget: Number(budget),
        materialsRequired: [
          { materialId: materials[0]?.id || '', materialName: materials[0]?.name || '', estimatedQty: 100, unit: 'KG' },
        ],
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 max-h-[90vh]">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-teal-50/50">
          <div className="flex items-center gap-2.5">
            <FolderGit2 className="w-5 h-5 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-900">
              {projectToEdit ? 'Edit Research Project' : 'Buat Research Project Baru'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Judul Project Penelitian *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="misal: Pengembangan Wajan Wok Enamel Granit 32cm Anti-Gores"
              required
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kategori Riset *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ResearchCategory)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
              >
                <option value="NEW_PRODUCT_DEVELOPMENT">New Product Development (NPD)</option>
                <option value="PRODUCT_IMPROVEMENT">Product Improvement</option>
                <option value="COST_REDUCTION">Cost Reduction (Efisiensi Energi/Bahan)</option>
                <option value="MATERIAL_RESEARCH">Material Research</option>
                <option value="ENAMEL_RESEARCH">Enamel Coating Research</option>
                <option value="FORMULA_DEVELOPMENT">Formula Development</option>
                <option value="QUALITY_IMPROVEMENT">Quality Improvement</option>
                <option value="PROCESS_IMPROVEMENT">Process Improvement</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Produk Target *</label>
              <input
                type="text"
                value={productTarget}
                onChange={(e) => setProductTarget(e.target.value)}
                placeholder="misal: Wajan Wok Enamel 32cm Motif Granit"
                required
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tujuan Penelitian (Objective) *</label>
            <textarea
              rows={2}
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Jelaskan tujuan formulasi atau modifikasi proses..."
              required
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Latar Belakang Pasar</label>
              <textarea
                rows={2}
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                placeholder="Permintaan konsumen, kelemahan produk eksisting..."
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Permasalahan Teknis</label>
              <textarea
                rows={2}
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                placeholder="Kendala bubbling, adhesion loss, deformasi suhu..."
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Kriteria Mutu (Target Metric) *</label>
            <input
              type="text"
              value={targetMetric}
              onChange={(e) => setTargetMetric(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Mulai</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Selesai</label>
              <input
                type="date"
                value={targetCompletion}
                onChange={(e) => setTargetCompletion(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Alokasi Budget (IDR)</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                min={0}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">PIC Penelitian</label>
              <input
                type="text"
                value={pic}
                onChange={(e) => setPic(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Prioritas</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status Proyek</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ResearchStatus)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
              >
                <option value="DRAFT">Draft</option>
                <option value="PLANNING">Planning</option>
                <option value="EXPERIMENT">Experiment</option>
                <option value="TESTING">Testing</option>
                <option value="REVIEW">Review</option>
                <option value="APPROVED">Approved</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
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
              className="px-4 py-2 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{projectToEdit ? 'Simpan Perubahan' : 'Terbitkan Project Riset'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
