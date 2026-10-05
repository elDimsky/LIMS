import React, { useState } from 'react';
import { X, Atom, Plus, History, Check, AlertCircle, ShieldCheck } from 'lucide-react';
import { Formula, FormulaVersion } from '../../types/lims';
import { useLims } from '../../context/LimsContext';

interface FormulaDetailModalProps {
  formula: Formula | null;
  onClose: () => void;
}

export const FormulaDetailModal: React.FC<FormulaDetailModalProps> = ({ formula, onClose }) => {
  const { addFormulaVersion, currentUser, materials } = useLims();

  const [isAddingVersion, setIsAddingVersion] = useState(false);
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(0);

  // New version form state
  const [newVersionNum, setNewVersionNum] = useState('');
  const [changeReason, setChangeReason] = useState('');
  const [components, setComponents] = useState<FormulaVersion['components']>([]);
  const [viscosity, setViscosity] = useState('38 - 42s (Ford Cup #4)');
  const [firingTemp, setFiringTemp] = useState(835);

  if (!formula) return null;

  const currentVersionData = formula.versions[selectedVersionIndex] || formula.versions[0];

  const handleStartNewVersion = () => {
    // Generate next minor version suggestion
    const lastVer = formula.versions[0]?.version || '1.0';
    const parts = lastVer.split('.');
    const nextVer = parts.length === 2 ? `${parts[0]}.${Number(parts[1]) + 1}` : '2.0';
    setNewVersionNum(nextVer);
    setChangeReason('');
    setComponents(formula.versions[0]?.components ? JSON.parse(JSON.stringify(formula.versions[0].components)) : []);
    setIsAddingVersion(true);
  };

  const handleComponentPercentageChange = (idx: number, pct: number) => {
    setComponents((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], percentage: pct };
      return updated;
    });
  };

  const totalPercentage = components.reduce((acc, c) => acc + Number(c.percentage || 0), 0);

  const handleSubmitNewVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersionNum || !changeReason.trim()) return;

    if (totalPercentage !== 100) {
      alert(`Total persentase komponen formula harus 100%. Saat ini: ${totalPercentage}%`);
      return;
    }

    addFormulaVersion(formula.id, {
      version: newVersionNum,
      components,
      recommendedViscosity: viscosity,
      recommendedFiringTemp: Number(firingTemp),
      changeReason,
      changedBy: currentUser.name,
      date: new Date().toISOString().slice(0, 10),
    });

    setIsAddingVersion(false);
    setSelectedVersionIndex(0);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-end bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-3xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold">
              <Atom className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 truncate max-w-md">{formula.name}</h2>
              <p className="text-xs text-slate-500 font-mono">
                {formula.code} · Tipe: {formula.type} · Substrat: {formula.applicableSubstrate}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isAddingVersion && (
              <button
                onClick={handleStartNewVersion}
                className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-semibold shadow-xs flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Rilis Versi Baru</span>
              </button>
            )}
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* New Version Form Mode */}
          {isAddingVersion ? (
            <form onSubmit={handleSubmitNewVersion} className="space-y-4 bg-teal-50/30 p-4 rounded-xl border border-teal-200">
              <div className="flex items-center justify-between pb-2 border-b border-teal-200">
                <span className="font-bold text-teal-900 text-sm">Formulir Rilis Versi Formula Baru</span>
                <button
                  type="button"
                  onClick={() => setIsAddingVersion(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  Batal
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor Versi Baru *</label>
                  <input
                    type="text"
                    value={newVersionNum}
                    onChange={(e) => setNewVersionNum(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Suhu Firing (°C)</label>
                  <input
                    type="number"
                    value={firingTemp}
                    onChange={(e) => setFiringTemp(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alasan Perubahan (Change Reason) *</label>
                <textarea
                  rows={2}
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  placeholder="misal: Penurunan suhu firing furnace dari 840°C ke 835°C untuk efisiensi energi gas..."
                  required
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                />
              </div>

              {/* Recipe Components adjustments */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 uppercase tracking-wider text-[11px]">
                    Komposisi Bahan Resep (Total Harus 100%)
                  </span>
                  <span className={`font-mono font-bold ${totalPercentage === 100 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    Total: {totalPercentage}%
                  </span>
                </div>

                <div className="space-y-2">
                  {components.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                      <span className="flex-1 font-medium text-slate-800">{c.materialName}</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={c.percentage}
                          onChange={(e) => handleComponentPercentageChange(i, Number(e.target.value))}
                          min={0}
                          max={100}
                          className="w-16 px-2 py-1 border border-slate-300 rounded text-xs font-mono font-bold text-right"
                        />
                        <span className="text-slate-500 font-mono">%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingVersion(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded shadow-xs"
                >
                  Simpan Versi Baru
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Version History Selector */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-teal-600" />
                    <span>Riwayat Versi Formula (Version Control Log)</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {formula.versions.length} Versi Tersimpan
                  </span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {formula.versions.map((ver, idx) => (
                    <button
                      key={ver.version}
                      onClick={() => setSelectedVersionIndex(idx)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors shrink-0 ${
                        selectedVersionIndex === idx
                          ? 'bg-teal-600 text-white border-teal-600 font-bold shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      v{ver.version} {idx === 0 ? '(Current)' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Selected Version Details */}
              {currentVersionData && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        Versi {currentVersionData.version}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {currentVersionData.approvalStatus}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-slate-700 leading-relaxed">
                      <strong>Alasan Perubahan:</strong> {currentVersionData.changeReason}
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono pt-1">
                      <span>Diubah Oleh: {currentVersionData.changedBy}</span>
                      <span aria-hidden="true">·</span>
                      <span>Tanggal: {currentVersionData.date}</span>
                      <span aria-hidden="true">·</span>
                      <span>Suhu Firing: {currentVersionData.recommendedFiringTemp}°C</span>
                    </div>
                  </div>

                  {/* Recipe Percentage Table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <span className="font-semibold text-slate-800 text-xs">
                        Komposisi Bahan Resep Enamel
                      </span>
                      <span className="font-mono font-bold text-teal-700 text-xs">
                        Total 100%
                      </span>
                    </div>
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 text-[11px] border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">Bahan Baku / Raw Material</th>
                          <th className="py-2 px-3 text-right">Persentase (%)</th>
                          <th className="py-2 px-3">Fungsi / Catatan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {currentVersionData.components.map((c, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-semibold text-slate-900">
                              {c.materialName}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-teal-700">
                              {c.percentage}%
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">{c.notes || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
