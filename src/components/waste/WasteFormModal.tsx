import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  Check,
  AlertTriangle,
  Recycle,
  Sparkles,
  Calculator,
  ArrowRight,
  TrendingDown,
  Info,
} from 'lucide-react';
import { WasteType, WasteRecord } from '../../types/lims';
import { useLims } from '../../context/LimsContext';
import { formatCurrencyIDR } from '../../utils/formatters';

interface WasteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  wasteToEdit?: WasteRecord | null;
}

export const WasteFormModal: React.FC<WasteFormModalProps> = ({
  isOpen,
  onClose,
  wasteToEdit,
}) => {
  const { materials, researchProjects, createWasteRecord, updateWasteRecord, currentUser } = useLims();

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [materialId, setMaterialId] = useState(materials[0]?.id || '');
  const [wasteType, setWasteType] = useState<WasteType>('CHEMICAL_WASTE');
  const [hazardCategory, setHazardCategory] = useState<'B3_HAZARDOUS' | 'NON_B3'>('B3_HAZARDOUS');
  const [quantity, setQuantity] = useState(15);
  const [unit, setUnit] = useState('L');
  const [source, setSource] = useState<'EXPERIMENT' | 'TRIAL' | 'EXPIRY' | 'LAB_CLEANING' | 'SAMPLE_SCRAP'>('EXPERIMENT');
  const [researchProjectId, setResearchProjectId] = useState(researchProjects[0]?.id || '');
  const [reason, setReason] = useState('Limbah sisa pengujian dan pembersihan proses laboratorium.');
  const [storageLocation, setStorageLocation] = useState('TPS Limbah B3 Ruang R-05');
  const [handlingMethod, setHandlingMethod] = useState('Penyimpanan tertutup berlabel dan pemilahan terstandar.');
  const [disposalMethod, setDisposalMethod] = useState('Transporter limbah B3 berizin PT Wastec International.');
  const [estimatedDisposalCost, setEstimatedDisposalCost] = useState(500000);

  // Recycle & Cost Saving States
  const [isRecycled, setIsRecycled] = useState(false);
  const [recycleResult, setRecycleResult] = useState('');
  const [recycledQuantity, setRecycledQuantity] = useState(10);
  const [recycledUnit, setRecycledUnit] = useState('KG');
  const [recycleMethod, setRecycleMethod] = useState('');
  const [savingCost, setSavingCost] = useState<number>(0);

  const isEditing = Boolean(wasteToEdit);

  useEffect(() => {
    if (wasteToEdit) {
      setDate(wasteToEdit.date);
      setMaterialId(wasteToEdit.materialId || materials[0]?.id || '');
      setWasteType(wasteToEdit.wasteType);
      setHazardCategory(wasteToEdit.hazardCategory);
      setQuantity(wasteToEdit.quantity);
      setUnit(wasteToEdit.unit);
      setSource(wasteToEdit.source);
      setResearchProjectId(wasteToEdit.researchProjectId || '');
      setReason(wasteToEdit.reason);
      setStorageLocation(wasteToEdit.storageLocation);
      setHandlingMethod(wasteToEdit.handlingMethod);
      setDisposalMethod(wasteToEdit.disposalMethod);
      setEstimatedDisposalCost(wasteToEdit.estimatedDisposalCost);

      setIsRecycled(Boolean(wasteToEdit.isRecycled));
      setRecycleResult(wasteToEdit.recycleResult || '');
      setRecycledQuantity(wasteToEdit.recycledQuantity || wasteToEdit.quantity);
      setRecycledUnit(wasteToEdit.recycledUnit || wasteToEdit.unit);
      setRecycleMethod(wasteToEdit.recycleMethod || '');
      setSavingCost(wasteToEdit.savingCost || 0);
    } else {
      setDate(new Date().toISOString().slice(0, 10));
      setMaterialId(materials[0]?.id || '');
      setWasteType('ENAMEL_WASTE');
      setHazardCategory('NON_B3');
      setQuantity(15);
      setUnit('KG');
      setSource('EXPERIMENT');
      setResearchProjectId(researchProjects[0]?.id || '');
      setReason('Lumpur overspray bilasan ball mill enamel saat trial coating.');
      setStorageLocation('Bak Sedimentasi Enamel Ruang Persiapan Rak W-02');
      setHandlingMethod('Pengendapan gravitasi, filter press cake padat & pengeringan.');
      setDisposalMethod('Daur ulang in-house sebagai substitusi formulasi ground coat.');
      setEstimatedDisposalCost(300000);

      setIsRecycled(true);
      setRecycleResult('Frit Enamel Daur Ulang Grade B (Substitusi Ground Coat)');
      setRecycledQuantity(12.5);
      setRecycledUnit('KG');
      setRecycleMethod('Sedimentasi, Pengeringan Oven 150°C & Re-milling 200 Mesh');
      setSavingCost(1500000);
    }
  }, [wasteToEdit, isOpen, materials, researchProjects]);

  if (!isOpen) return null;

  const selectedMaterial = materials.find((m) => m.id === materialId) || materials[0];
  const selectedProject = researchProjects.find((p) => p.id === researchProjectId);

  const handleAutoCalculateSaving = () => {
    // Estimate cost saved: quantity * material unit cost + avoided disposal cost
    const matCost = selectedMaterial?.unitCost || 65000;
    const estimatedValue = Math.round(Number(recycledQuantity) * matCost);
    setSavingCost(estimatedValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0 || !reason.trim()) return;

    if (isEditing && wasteToEdit) {
      updateWasteRecord(wasteToEdit.id, {
        date,
        materialId: selectedMaterial?.id,
        materialName: selectedMaterial?.name || wasteToEdit.materialName,
        source,
        researchProjectId: selectedProject?.id,
        researchProjectTitle: selectedProject?.title,
        wasteType,
        hazardCategory,
        quantity: Number(quantity),
        unit,
        reason,
        storageLocation,
        handlingMethod,
        disposalMethod,
        estimatedDisposalCost: Number(estimatedDisposalCost),
        isRecycled,
        recycleResult: isRecycled ? recycleResult.trim() : undefined,
        recycledQuantity: isRecycled ? Number(recycledQuantity) : undefined,
        recycledUnit: isRecycled ? recycledUnit : undefined,
        recycleMethod: isRecycled ? recycleMethod.trim() : undefined,
        savingCost: isRecycled ? Number(savingCost) : 0,
      });
    } else {
      createWasteRecord({
        date,
        materialId: selectedMaterial?.id,
        materialName: selectedMaterial?.name || 'Limbah Sisa Proses',
        source,
        researchProjectId: selectedProject?.id,
        researchProjectTitle: selectedProject?.title,
        wasteType,
        hazardCategory,
        quantity: Number(quantity),
        unit,
        reason,
        storageLocation,
        handlingMethod,
        disposalMethod,
        estimatedDisposalCost: Number(estimatedDisposalCost),
        isRecycled,
        recycleResult: isRecycled ? recycleResult.trim() : undefined,
        recycledQuantity: isRecycled ? Number(recycledQuantity) : undefined,
        recycledUnit: isRecycled ? recycledUnit : undefined,
        recycleMethod: isRecycled ? recycleMethod.trim() : undefined,
        savingCost: isRecycled ? Number(savingCost) : 0,
        responsiblePerson: currentUser.name,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {isEditing ? 'Perbarui Data Limbah & Hasil Recycle' : 'Catat Limbah R&D & Hasil Recycle'}
              </h2>
              <p className="text-[11px] text-rose-300">
                Pencatatan Limbah Laboratorium, Daur Ulang Enamel/Metal & Estimasi Saving Cost
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Main Waste Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Timbul Limbah *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kategori Bahaya (Hazard) *</label>
              <select
                value={hazardCategory}
                onChange={(e) => setHazardCategory(e.target.value as any)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              >
                <option value="NON_B3">Non-B3 (Scrap Logam / Residu Padat / Sludge Enamel)</option>
                <option value="B3_HAZARDOUS">Limbah B3 (Bahan Berbahaya & Beracun)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Jenis Limbah *</label>
              <select
                value={wasteType}
                onChange={(e) => setWasteType(e.target.value as any)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              >
                <option value="ENAMEL_WASTE">Lumpur / Overspray Enamel (Enamel Sludge)</option>
                <option value="METAL_WASTE">Scrap Logam Alat Masak (SPCE/Alu/SS)</option>
                <option value="CHEMICAL_WASTE">Limbah Kimia Pretreatment (Spent Acid/Solvent)</option>
                <option value="FAILED_EXPERIMENT">Benda Uji Cacat (Failed Coupon / Defective Pan)</option>
                <option value="CONTAMINATED_MATERIAL">Material Terkontaminasi</option>
                <option value="EXPIRED_MATERIAL">Bahan Baku Kadaluarsa</option>
                <option value="OTHER">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bahan Baku Asal (Terkait)</label>
              <select
                value={materialId}
                onChange={(e) => setMaterialId(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              >
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.code} - {m.name} ({m.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Jumlah Volume / Berat *</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min={0.1}
                step="any"
                required
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Satuan (Unit)</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              >
                <option value="KG">KG (Kilogram)</option>
                <option value="L">L (Liter)</option>
                <option value="Drum">Drum</option>
                <option value="Pcs">Pcs</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Sumber Limbah</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as any)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              >
                <option value="EXPERIMENT">Eksperimen Laboratorium</option>
                <option value="TRIAL">Trial Produksi Pilot</option>
                <option value="LAB_CLEANING">Pembersihan Booth/Mesin</option>
                <option value="SAMPLE_SCRAP">Potongan Sample Uji</option>
                <option value="EXPIRY">Kadaluarsa Gudang</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Project Riset Asal Limbah</label>
            <select
              value={researchProjectId}
              onChange={(e) => setResearchProjectId(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
            >
              <option value="">-- Tanpa Project Khusus / Operasional Umum --</option>
              {researchProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Penyebab / Deskripsi Limbah *</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              placeholder="Contoh: Endapan bilasan ball mill setelah milling formula enamel cover coat granit."
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Lokasi Penyimpanan Sementara (TPS)</label>
              <input
                type="text"
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value)}
                placeholder="Contoh: TPS Limbah B3 Ruang Drum Asam R-05"
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Estimasi Biaya Pengelolaan / Disposal (IDR)</label>
              <input
                type="number"
                value={estimatedDisposalCost}
                onChange={(e) => setEstimatedDisposalCost(Number(e.target.value))}
                min={0}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* ============================================================== */}
          {/* RECYCLE & SAVING COST SECTION (Fitur Daur Ulang & Saving Cost) */}
          {/* ============================================================== */}
          <div className="pt-2">
            <div className="p-4 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-white shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                    <Recycle className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <span>Hasil Recycle Limbah & Estimasi Saving Cost</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-100 text-emerald-800 font-semibold">
                        Circular Economy
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Pemanfaatan kembali residu enamel, daur ulang scrap logam panci, dan recovery nilai ekonomi
                    </p>
                  </div>
                </div>

                {/* Checkbox Toggle */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isRecycled}
                    onChange={(e) => setIsRecycled(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="font-semibold text-xs text-emerald-900">
                    Ada Hasil Recycle
                  </span>
                </label>
              </div>

              {isRecycled ? (
                <div className="space-y-3 pt-1 animate-in fade-in duration-150">
                  {/* Form Input Hasil Recycle Limbah */}
                  <div>
                    <label className="block font-semibold text-emerald-950 mb-1">
                      Hasil Recycle Limbah (Produk / Bahan Dihasilkan) *
                    </label>
                    <input
                      type="text"
                      value={recycleResult}
                      onChange={(e) => setRecycleResult(e.target.value)}
                      required={isRecycled}
                      placeholder="Contoh: Frit Enamel Daur Ulang Grade B (Substitusi Ground Coat)"
                      className="w-full px-3 py-1.5 border border-emerald-300 rounded-lg text-xs bg-white font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    />
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Nama atau spesifikasi bahan hasil daur ulang yang dapat digunakan kembali di R&D atau produksi.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-emerald-950 mb-1">
                        Jumlah Hasil Recycle *
                      </label>
                      <input
                        type="number"
                        value={recycledQuantity}
                        onChange={(e) => setRecycledQuantity(Number(e.target.value))}
                        min={0.1}
                        step="any"
                        required={isRecycled}
                        className="w-full px-3 py-1.5 border border-emerald-300 rounded-lg text-xs font-mono font-bold bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-emerald-950 mb-1">
                        Satuan Recycle
                      </label>
                      <select
                        value={recycledUnit}
                        onChange={(e) => setRecycledUnit(e.target.value)}
                        className="w-full px-3 py-1.5 border border-emerald-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                      >
                        <option value="KG">KG (Kilogram)</option>
                        <option value="L">L (Liter)</option>
                        <option value="Drum">Drum</option>
                        <option value="Pcs">Pcs</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-emerald-950 mb-1">
                        Metode / Proses Daur Ulang
                      </label>
                      <input
                        type="text"
                        value={recycleMethod}
                        onChange={(e) => setRecycleMethod(e.target.value)}
                        placeholder="Contoh: Sedimentasi, Pengeringan Oven & Ball Milling"
                        className="w-full px-3 py-1.5 border border-emerald-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Form Input Estimasi Saving Cost */}
                  <div className="p-3 bg-white rounded-lg border border-emerald-200 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <label className="block font-bold text-emerald-900 text-xs">
                        Form Input Estimasi Saving Cost (IDR) *
                      </label>
                      <button
                        type="button"
                        onClick={handleAutoCalculateSaving}
                        className="text-[11px] text-teal-700 hover:text-teal-900 hover:underline flex items-center gap-1 font-medium"
                      >
                        <Calculator className="w-3.5 h-3.5" />
                        <span>Kalkulasi Otomatis dari Harga Bahan Asal</span>
                      </button>
                    </div>

                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs font-bold text-emerald-700 font-mono">
                        Rp
                      </span>
                      <input
                        type="number"
                        value={savingCost}
                        onChange={(e) => setSavingCost(Number(e.target.value))}
                        min={0}
                        required={isRecycled}
                        placeholder="0"
                        className="w-full pl-10 pr-3 py-1.5 border border-emerald-400 rounded-lg text-xs font-mono font-bold text-emerald-800 bg-emerald-50/30 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-100">
                      <div className="flex items-center gap-1.5">
                        <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Total Nilai Penghematan:</span>
                        <strong className="font-mono text-emerald-900">
                          {formatCurrencyIDR(savingCost || 0)}
                        </strong>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        (Mencegah biaya pembelian material baru & biaya buang)
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-2 text-center text-slate-500 text-[11px] flex items-center justify-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Centang <strong>"Ada Hasil Recycle"</strong> jika limbah ini didaur ulang kembali untuk menghasilkan penghematan biaya (saving cost).
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'Simpan Perubahan Limbah' : 'Simpan Catatan Limbah & Recycle'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
