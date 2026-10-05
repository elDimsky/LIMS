import React, { useState } from 'react';
import { X, Sliders, Check, AlertCircle } from 'lucide-react';
import { useLims } from '../../context/LimsContext';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({ isOpen, onClose }) => {
  const { materials, processStockAdjustment, currentUser } = useLims();

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [materialId, setMaterialId] = useState(materials[0]?.id || '');
  const [actualStock, setActualStock] = useState(0);
  const [reason, setReason] = useState('Hasil stock opname fisik gudang bulanan.');

  if (!isOpen) return null;

  const selectedMaterial = materials.find((m) => m.id === materialId) || materials[0];
  const systemStock = selectedMaterial ? selectedMaterial.currentStock : 0;
  const difference = Number(actualStock) - systemStock;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterial) return;

    processStockAdjustment({
      date,
      materialId: selectedMaterial.id,
      materialName: selectedMaterial.name,
      systemStock,
      actualStock: Number(actualStock),
      difference,
      unit: selectedMaterial.unit,
      reason,
      requestedBy: currentUser.name,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">Penyesuaian Stok Opname (Stock Adjustment)</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {currentUser.role !== 'SUPER_ADMIN' ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 leading-relaxed">
              <strong>Info Approval:</strong> Anda masuk sebagai {currentUser.name}. Pengajuan penyesuaian stok akan diteruskan ke Supervisor <strong>Ayu Jamilatul Janah</strong> untuk disetujui sebelum mengubah saldo stok gudang.
            </div>
          ) : (
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-teal-800 leading-relaxed">
              <strong>Super Admin Override:</strong> Penyesuaian stok akan langsung diperbarui ke sistem inventori dan tercatat dalam buku besar ledger serta audit trail.
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tanggal Opname *</label>
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
                const mat = materials.find((m) => m.id === e.target.value);
                if (mat) setActualStock(mat.currentStock);
              }}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium"
            >
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.code} - {m.name} (Sistem: {m.currentStock} {m.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div>
              <span className="text-[11px] text-slate-500 block">Stok Sistem Saat Ini:</span>
              <span className="text-base font-bold font-mono text-slate-900">
                {systemStock} {selectedMaterial?.unit}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Selisih Koreksi:</span>
              <span className={`text-base font-bold font-mono ${difference >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {difference > 0 ? `+${difference}` : difference} {selectedMaterial?.unit}
              </span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Hasil Penghitungan Fisik Aktual ({selectedMaterial?.unit}) *
            </label>
            <input
              type="number"
              value={actualStock}
              onChange={(e) => setActualStock(Number(e.target.value))}
              min={0}
              step="any"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Alasan Penyesuaian / Temuan Opname *</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Jelaskan penyebab selisih fisik vs catatan (evaporasi, tumpahan uji coba, koreksi timbangan)..."
              required
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
              className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{currentUser.role === 'SUPER_ADMIN' ? 'Terapkan Penyesuaian' : 'Kirim untuk Approval'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
