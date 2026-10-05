import React, { useState } from 'react';
import { X, ArrowUpRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useLims } from '../../context/LimsContext';

interface StockOutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StockOutModal: React.FC<StockOutModalProps> = ({ isOpen, onClose }) => {
  const { materials, researchProjects, experiments, processStockOut, currentUser } = useLims();

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [materialId, setMaterialId] = useState(materials[0]?.id || '');
  const [quantity, setQuantity] = useState(10);
  const [purpose, setPurpose] = useState<'RESEARCH' | 'TRIAL' | 'PRODUCTION_TRIAL' | 'SAMPLE' | 'TESTING' | 'OTHER'>('RESEARCH');
  const [researchProjectId, setResearchProjectId] = useState(researchProjects[0]?.id || '');
  const [notes, setNotes] = useState('Pengambilan bahan untuk trial proses lab');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const selectedMaterial = materials.find((m) => m.id === materialId) || materials[0];
  const selectedProject = researchProjects.find((p) => p.id === researchProjectId);

  const availableStock = selectedMaterial ? selectedMaterial.currentStock - selectedMaterial.reservedStock : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (quantity <= 0) {
      setErrorMsg('Jumlah pengeluaran harus lebih besar dari 0.');
      return;
    }

    if (quantity > selectedMaterial.currentStock) {
      setErrorMsg(
        `Insufficient Stock (Stok Tidak Mencukupi). Stok Fisik Saat Ini: ${selectedMaterial.currentStock} ${selectedMaterial.unit}, Jumlah yang Diminta: ${quantity} ${selectedMaterial.unit}. Transaksi tidak dapat diproses.`
      );
      return;
    }

    const result = processStockOut({
      date,
      materialId: selectedMaterial.id,
      materialName: selectedMaterial.name,
      quantity: Number(quantity),
      unit: selectedMaterial.unit,
      purpose,
      researchProjectId: selectedProject?.id,
      researchProjectTitle: selectedProject?.title,
      requestedBy: currentUser.name,
      approvedBy: 'Ayu Jamilatul Janah',
      notes,
    });

    if (!result.success) {
      setErrorMsg(result.error || 'Gagal memproses stock out.');
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-amber-50/50">
          <div className="flex items-center gap-2.5">
            <ArrowUpRight className="w-5 h-5 text-amber-600" />
            <h2 className="text-sm font-bold text-slate-900">Formulir Pengeluaran Bahan (Stock Out)</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {/* Current Stock Indicator Box */}
          {selectedMaterial && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 block">Status Bahan yang Dipilih:</span>
                <span className="font-semibold text-slate-900">{selectedMaterial.name}</span>
                <span className="text-slate-500 font-mono text-[11px] block">{selectedMaterial.code}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 block">Stok Fisik Tersedia:</span>
                <span className={`text-base font-bold font-mono ${selectedMaterial.currentStock < 100 ? 'text-amber-600' : 'text-emerald-700'}`}>
                  {selectedMaterial.currentStock} {selectedMaterial.unit}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Pengeluaran *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pilih Bahan Baku *</label>
              <select
                value={materialId}
                onChange={(e) => {
                  setMaterialId(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium"
              >
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.code} - {m.name} ({m.currentStock} {m.unit})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Jumlah Pengambilan ({selectedMaterial?.unit}) *
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => {
                  setQuantity(Number(e.target.value));
                  setErrorMsg('');
                }}
                min={0.1}
                step="any"
                required
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tujuan Pengambilan *</label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value as any)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
              >
                <option value="RESEARCH">Research & Formulation</option>
                <option value="TRIAL">Trial Proses & Pembakaran Enamel</option>
                <option value="PRODUCTION_TRIAL">Production Pilot Trial</option>
                <option value="SAMPLE">Pembuatan Sample & Coupon</option>
                <option value="TESTING">Pengujian Laboratorium QC</option>
                <option value="OTHER">Lainnya</option>
              </select>
            </div>
          </div>

          {/* Project Relational Link */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Hubungkan ke Research Project Terkait
            </label>
            <select
              value={researchProjectId}
              onChange={(e) => setResearchProjectId(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
            >
              <option value="">-- Tanpa Project Khusus --</option>
              {researchProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Catatan Keterangan Pengambilan</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="misal: Dipping 10 wajan wok rim diameter 32cm"
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
              className="px-4 py-2 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Proses Pengeluaran Stok</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
