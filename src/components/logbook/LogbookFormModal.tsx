import React, { useState } from 'react';
import { X, BookOpen, Check } from 'lucide-react';
import { useLims } from '../../context/LimsContext';

interface LogbookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogbookFormModal: React.FC<LogbookFormModalProps> = ({ isOpen, onClose }) => {
  const { researchProjects, addLogbookEntry, currentUser } = useLims();

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [researchProjectId, setResearchProjectId] = useState(researchProjects[0]?.id || '');
  const [title, setTitle] = useState('');
  const [hypothesis, setHypothesis] = useState('');
  const [procedure, setProcedure] = useState('');
  const [observations, setObservations] = useState('');
  const [resultsSummary, setResultsSummary] = useState('');
  const [problemsEncountered, setProblemsEncountered] = useState('');
  const [solutionImplemented, setSolutionImplemented] = useState('');
  const [conclusion, setConclusion] = useState('');
  const [nextSteps, setNextSteps] = useState('');

  if (!isOpen) return null;

  const selectedProject = researchProjects.find((p) => p.id === researchProjectId) || researchProjects[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !conclusion.trim()) return;

    addLogbookEntry({
      date,
      researchProjectId: selectedProject.id,
      researchProjectTitle: selectedProject.title,
      title,
      hypothesis,
      procedure,
      observations,
      resultsSummary,
      problemsEncountered,
      solutionImplemented,
      conclusion,
      nextSteps,
      author: currentUser.name,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 max-h-[90vh]">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-teal-50/50">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-900">Catat Jurnal Riset (Electronic Lab Notebook)</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Project Riset *</label>
              <select
                value={researchProjectId}
                onChange={(e) => setResearchProjectId(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium"
              >
                {researchProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} - {p.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Judul Catatan / Topik Investigasi *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="misal: Evaluasi Pelepasan Gas Karbon pada Firing Dutch Oven Cast Iron"
              required
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Hipotesis Ilmiah</label>
            <textarea
              rows={2}
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              placeholder="Dugaan awal mekanisme reaksi kimia atau termal..."
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Metode & Prosedur Percobaan</label>
            <textarea
              rows={3}
              value={procedure}
              onChange={(e) => setProcedure(e.target.value)}
              placeholder="Langkah preparasi permukaan, penimbangan resep, suhu kiln, parameter spray..."
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pengamatan & Observasi Fisik</label>
              <textarea
                rows={2}
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ringkasan Data Hasil</label>
              <textarea
                rows={2}
                value={resultsSummary}
                onChange={(e) => setResultsSummary(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kendala / Masalah yang Dihadapi</label>
              <input
                type="text"
                value={problemsEncountered}
                onChange={(e) => setProblemsEncountered(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Solusi yang Diterapkan</label>
              <input
                type="text"
                value={solutionImplemented}
                onChange={(e) => setSolutionImplemented(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Kesimpulan Logbook *</label>
            <textarea
              rows={2}
              value={conclusion}
              onChange={(e) => setConclusion(e.target.value)}
              required
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tindak Lanjut Berikutnya (Next Action)</label>
            <input
              type="text"
              value={nextSteps}
              onChange={(e) => setNextSteps(e.target.value)}
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
              className="px-4 py-2 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Jurnal Logbook</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
