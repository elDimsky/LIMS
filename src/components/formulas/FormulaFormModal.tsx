import React, { useState } from 'react';
import { X, Atom, Plus, Trash2, Check } from 'lucide-react';
import { FormulaComponent } from '../../types/lims';
import { useLims } from '../../context/LimsContext';

interface FormulaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FormulaFormModal: React.FC<FormulaFormModalProps> = ({ isOpen, onClose }) => {
  const { materials, createFormula, currentUser } = useLims();

  const [name, setName] = useState('');
  const [type, setType] = useState<'GROUND_COAT' | 'COVER_COAT' | 'DIRECT_ON' | 'SPECIAL_EFFECT'>('GROUND_COAT');
  const [applicableSubstrate, setApplicableSubstrate] = useState('Decarburized Steel Sheet SPCE-E');
  const [description, setDescription] = useState('');
  const [recommendedFiringTemp, setRecommendedFiringTemp] = useState(835);
  const [recommendedViscosity, setRecommendedViscosity] = useState('38 - 42s (Ford Cup #4)');
  const [errorMessage, setErrorMessage] = useState('');

  const [components, setComponents] = useState<FormulaComponent[]>([
    { materialId: materials[0]?.id || '', materialName: materials[0]?.name || '', percentage: 70, notes: 'Frit Utama' },
    { materialId: materials[1]?.id || '', materialName: materials[1]?.name || '', percentage: 20, notes: 'Pengatur Ekspansi' },
    { materialId: materials[2]?.id || '', materialName: materials[2]?.name || '', percentage: 10, notes: 'Additive Suspending' },
  ]);

  if (!isOpen) return null;

  const totalPercentage = components.reduce((acc, c) => acc + Number(c.percentage || 0), 0);

  const handleAddComponent = () => {
    const mat = materials[0];
    if (!mat) return;
    setComponents((prev) => [
      ...prev,
      { materialId: mat.id, materialName: mat.name, percentage: 5, notes: '' },
    ]);
  };

  const handleRemoveComponent = (index: number) => {
    if (components.length > 1) {
      setComponents((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleComponentChange = (index: number, field: string, val: any) => {
    setComponents((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };
      if (field === 'materialId') {
        const mat = materials.find((m) => m.id === val);
        if (mat) {
          item.materialId = mat.id;
          item.materialName = mat.name;
        }
      } else if (field === 'percentage') {
        item.percentage = Number(val);
      } else if (field === 'notes') {
        item.notes = val;
      }
      updated[index] = item;
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (totalPercentage !== 100) {
      setErrorMessage(`Total persentase resep formula harus tepat 100%. Saat ini terhitung: ${totalPercentage}%`);
      return;
    }
    setErrorMessage('');

    const today = new Date().toISOString().slice(0, 10);

    createFormula({
      name,
      type,
      applicableSubstrate,
      currentVersion: '1.0',
      status: 'ACTIVE',
      createdBy: currentUser.name,
      description,
      versions: [
        {
          version: '1.0',
          components,
          recommendedViscosity,
          recommendedFiringTemp: Number(recommendedFiringTemp),
          changeReason: 'Rilis inisiasi formula standar R&D.',
          changedBy: currentUser.name,
          date: today,
          approvalStatus: currentUser.role === 'SUPER_ADMIN' ? 'APPROVED' : 'PENDING_APPROVAL',
          approvedBy: currentUser.role === 'SUPER_ADMIN' ? currentUser.name : undefined,
          approvalDate: currentUser.role === 'SUPER_ADMIN' ? today : undefined,
        },
      ],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 max-h-[90vh]">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-teal-50/50">
          <div className="flex items-center gap-2.5">
            <Atom className="w-5 h-5 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-900">Buat Resep Formula Enamel Baru</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center justify-between">
              <span>{errorMessage}</span>
              <button
                type="button"
                onClick={() => setErrorMessage('')}
                className="text-rose-500 hover:text-rose-700 font-bold ml-2"
              >
                ✕
              </button>
            </div>
          )}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nama Formula / Resep *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="misal: Formula Enamel Cover Coat Royal Blue Series"
              required
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tipe Lapisan Enamel *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
              >
                <option value="GROUND_COAT">Ground Coat (Lapisan Dasar Bonding)</option>
                <option value="COVER_COAT">Cover Coat (Lapisan Penutup Kilap)</option>
                <option value="DIRECT_ON">Direct On (Satu Kali Bakar)</option>
                <option value="SPECIAL_EFFECT">Special Effect (Granit / Metallic)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Substrat Logam yang Sesuai *</label>
              <input
                type="text"
                value={applicableSubstrate}
                onChange={(e) => setApplicableSubstrate(e.target.value)}
                placeholder="misal: Decarburized Steel / Cast Iron / SUS304"
                required
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Suhu Firing Rekomendasi (°C)</label>
              <input
                type="number"
                value={recommendedFiringTemp}
                onChange={(e) => setRecommendedFiringTemp(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Viskositas Kerja Rekomendasi</label>
              <input
                type="text"
                value={recommendedViscosity}
                onChange={(e) => setRecommendedViscosity(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Components */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 uppercase tracking-wider text-[11px]">
                Komposisi Formula (Harus Total 100%)
              </span>
              <div className="flex items-center gap-3">
                <span className={`font-mono font-bold ${totalPercentage === 100 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  Total: {totalPercentage}%
                </span>
                <button
                  type="button"
                  onClick={handleAddComponent}
                  className="px-2 py-0.5 text-xs text-teal-700 hover:bg-teal-50 border border-teal-200 rounded flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Tambah Baris</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {components.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select
                    value={c.materialId}
                    onChange={(e) => handleComponentChange(i, 'materialId', e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    {materials.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={c.percentage}
                      onChange={(e) => handleComponentChange(i, 'percentage', e.target.value)}
                      min={1}
                      max={100}
                      className="w-16 px-2 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold text-right"
                    />
                    <span className="text-slate-500 font-mono">%</span>
                  </div>
                  <input
                    type="text"
                    value={c.notes}
                    onChange={(e) => handleComponentChange(i, 'notes', e.target.value)}
                    placeholder="Catatan fungsi..."
                    className="w-36 px-2 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveComponent(i)}
                    disabled={components.length === 1}
                    className="text-slate-400 hover:text-rose-600 disabled:opacity-30 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Deskripsi & Catatan Proses</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Waktu milling ball mill, kehalusan sieving 200 mesh..."
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
              <span>Simpan Resep Formula v1.0</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
