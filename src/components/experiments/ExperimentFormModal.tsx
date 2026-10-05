import React, { useState } from 'react';
import { X, Beaker, Check, Plus, Trash2 } from 'lucide-react';
import { ExperimentMaterialUsage, ExperimentStatus } from '../../types/lims';
import { useLims } from '../../context/LimsContext';

interface ExperimentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExperimentFormModal: React.FC<ExperimentFormModalProps> = ({ isOpen, onClose }) => {
  const { researchProjects, materials, formulas, createExperiment, currentUser } = useLims();

  const [researchProjectId, setResearchProjectId] = useState(researchProjects[0]?.id || '');
  const [experimentDate, setExperimentDate] = useState(new Date().toISOString().slice(0, 10));
  const [objective, setObjective] = useState('');
  const [formulaId, setFormulaId] = useState(formulas[0]?.id || '');
  const [temperature, setTemperature] = useState(835);
  const [firingTime, setFiringTime] = useState(4.5);
  const [slipViscosity, setSlipViscosity] = useState('38s Ford #4');
  const [slipDensity, setSlipDensity] = useState(1.68);
  const [applicationMethod, setApplicationMethod] = useState('Dipping + Drain Rotational');
  const [pressure, setPressure] = useState(2.5);
  const [equipment, setEquipment] = useState('Furnace Continuous Nabertherm Lab-800');
  const [operator, setOperator] = useState(currentUser.name);
  const [observation, setObservation] = useState('');
  const [result, setResult] = useState('');
  const [conclusion, setConclusion] = useState('');
  const [status, setStatus] = useState<ExperimentStatus>('APPROVED');
  const [success, setSuccess] = useState(true);

  // Materials used line items
  const [materialsUsed, setMaterialsUsed] = useState<ExperimentMaterialUsage[]>([
    {
      materialId: materials[0]?.id || '',
      materialName: materials[0]?.name || '',
      quantity: 5,
      unit: materials[0]?.unit || 'KG',
    },
  ]);

  if (!isOpen) return null;

  const selectedProject = researchProjects.find((p) => p.id === researchProjectId) || researchProjects[0];
  const selectedFormula = formulas.find((f) => f.id === formulaId);

  const handleAddMaterialRow = () => {
    const mat = materials[0];
    if (!mat) return;
    setMaterialsUsed((prev) => [
      ...prev,
      {
        materialId: mat.id,
        materialName: mat.name,
        quantity: 2,
        unit: mat.unit,
      },
    ]);
  };

  const handleMaterialChange = (index: number, matId: string) => {
    const mat = materials.find((m) => m.id === matId);
    if (!mat) return;
    setMaterialsUsed((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        materialId: mat.id,
        materialName: mat.name,
        unit: mat.unit,
      };
      return updated;
    });
  };

  const handleQtyChange = (index: number, qty: number) => {
    setMaterialsUsed((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], quantity: qty };
      return updated;
    });
  };

  const handleRemoveMaterialRow = (index: number) => {
    if (materialsUsed.length > 1) {
      setMaterialsUsed((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!objective.trim() || !conclusion.trim()) return;

    createExperiment({
      researchProjectId: selectedProject.id,
      researchProjectTitle: selectedProject.title,
      experimentDate,
      objective,
      materialsUsed,
      formulaId: selectedFormula?.id,
      formulaName: selectedFormula?.name,
      formulaVersion: selectedFormula?.currentVersion,
      processParameters: {
        temperature: Number(temperature),
        firingTime: Number(firingTime),
        slipViscosity,
        slipDensity: Number(slipDensity),
        applicationMethod,
        pressure: Number(pressure),
      },
      equipment,
      operator,
      sampleIds: [],
      observation,
      result,
      conclusion,
      status,
      success,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 max-h-[90vh]">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-teal-50/50">
          <div className="flex items-center gap-2.5">
            <Beaker className="w-5 h-5 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-900">Catat Eksperimen & Uji Coba Proses Lab</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 leading-relaxed">
            Menyimpan eksperimen akan secara otomatis memotong stok bahan baku terkait dari modul Inventory (Stock Out - Research Usage) dan menghasilkan sample berkode QR baru.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hubungkan ke Project Riset *</label>
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
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Eksperimen *</label>
              <input
                type="date"
                value={experimentDate}
                onChange={(e) => setExperimentDate(e.target.value)}
                required
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tujuan Eksperimen (Objective) *</label>
            <input
              type="text"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="misal: Optimasi suhu firing 835°C ground coat G-12 pada wajan wok 32cm"
              required
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          {/* Formula selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Formula / Resep Enamel</label>
              <select
                value={formulaId}
                onChange={(e) => setFormulaId(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium"
              >
                {formulas.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.code} - {f.name} (v{f.currentVersion})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Operator / Teknisi</label>
              <input
                type="text"
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Materials Used in Experiment */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 uppercase tracking-wider text-[11px]">
                Konsumsi Bahan Baku (Auto Deduct Stok)
              </span>
              <button
                type="button"
                onClick={handleAddMaterialRow}
                className="px-2 py-0.5 text-xs text-teal-700 hover:bg-teal-50 border border-teal-200 rounded flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Tambah Bahan</span>
              </button>
            </div>

            <div className="space-y-2">
              {materialsUsed.map((row, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    value={row.materialId}
                    onChange={(e) => handleMaterialChange(idx, e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    {materials.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} (Tersedia: {m.currentStock} {m.unit})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={row.quantity}
                    onChange={(e) => handleQtyChange(idx, Number(e.target.value))}
                    min={0.1}
                    step="any"
                    className="w-24 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                  />
                  <span className="font-mono text-slate-600 w-12">{row.unit}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMaterialRow(idx)}
                    disabled={materialsUsed.length === 1}
                    className="text-slate-400 hover:text-rose-600 disabled:opacity-30 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Process Parameters */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
            <span className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider block">
              Parameter Proses & Firing
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-600 mb-1">Suhu Firing (°C)</label>
                <input
                  type="number"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Waktu Firing (Menit)</label>
                <input
                  type="number"
                  value={firingTime}
                  onChange={(e) => setFiringTime(Number(e.target.value))}
                  step="0.1"
                  className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Viskositas Slip</label>
                <input
                  type="text"
                  value={slipViscosity}
                  onChange={(e) => setSlipViscosity(e.target.value)}
                  className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Metode Aplikasi</label>
                <input
                  type="text"
                  value={applicationMethod}
                  onChange={(e) => setApplicationMethod(e.target.value)}
                  className="w-full px-2.5 py-1 border border-slate-300 rounded text-xs"
                />
              </div>
            </div>
          </div>

          {/* Observations and Conclusions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Observasi Fisik & Hasil</label>
              <textarea
                rows={2}
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Kilap, kerataan warna, ada/tidaknya pinhole..."
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kesimpulan & Rekomendasi *</label>
              <textarea
                rows={2}
                value={conclusion}
                onChange={(e) => setConclusion(e.target.value)}
                placeholder="Suhu 835°C optimal untuk dipromosikan ke tahap pilot..."
                required
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Status & Success */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status Eksperimen</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ExperimentStatus)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
              >
                <option value="APPROVED">Approved (Validasi Berhasil)</option>
                <option value="COMPLETED">Completed</option>
                <option value="TESTING">Testing Lab</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
            <div className="flex items-center pt-5">
              <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                <input
                  type="checkbox"
                  checked={success}
                  onChange={(e) => setSuccess(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
                <span>Tandai Eksperimen Berhasil (Successful)</span>
              </label>
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
              <span>Simpan Eksperimen & Generate Sample</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
