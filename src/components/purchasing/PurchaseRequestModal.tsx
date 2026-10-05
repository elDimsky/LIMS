import React, { useState } from 'react';
import { X, FileCheck, Check } from 'lucide-react';
import { useLims } from '../../context/LimsContext';

interface PurchaseRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PurchaseRequestModal: React.FC<PurchaseRequestModalProps> = ({ isOpen, onClose }) => {
  const { materials, createPurchaseRequest, currentUser } = useLims();

  const [requestDate, setRequestDate] = useState(new Date().toISOString().slice(0, 10));
  const [requiredDate, setRequiredDate] = useState(
    new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10)
  );
  const [materialId, setMaterialId] = useState(materials[0]?.id || '');
  const [quantity, setQuantity] = useState(100);
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('HIGH');
  const [purpose, setPurpose] = useState('Stok mendekati batas reorder point untuk trial formulasi wajan.');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const selectedMaterial = materials.find((m) => m.id === materialId) || materials[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterial || quantity <= 0) return;

    createPurchaseRequest({
      requestDate,
      requestedBy: currentUser.name,
      materialId: selectedMaterial.id,
      materialName: selectedMaterial.name,
      quantity: Number(quantity),
      unit: selectedMaterial.unit,
      requiredDate,
      purpose,
      priority,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <FileCheck className="w-5 h-5 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-900">Buat Purchase Request (PR) Baru</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Permohonan *</label>
              <input
                type="date"
                value={requestDate}
                onChange={(e) => setRequestDate(e.target.value)}
                required
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dibutuhkan Tanggal *</label>
              <input
                type="date"
                value={requiredDate}
                onChange={(e) => setRequiredDate(e.target.value)}
                required
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Pilih Bahan Baku *</label>
            <select
              value={materialId}
              onChange={(e) => setMaterialId(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium"
            >
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.code} - {m.name} (Stok: {m.currentStock} {m.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Jumlah Diminta ({selectedMaterial?.unit}) *
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min={1}
                required
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tingkat Prioritas</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High (Penting)</option>
                <option value="URGENT">Urgent (Kritis)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tujuan & Justifikasi Pengadaan *</label>
            <textarea
              rows={3}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
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
              className="px-4 py-2 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Ajukan Purchase Request</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
