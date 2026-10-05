import React, { useState } from 'react';
import { X, ArrowDownLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLims } from '../../context/LimsContext';

interface StockInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StockInModal: React.FC<StockInModalProps> = ({ isOpen, onClose }) => {
  const { materials, suppliers, purchaseOrders, processStockIn, currentUser } = useLims();

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [materialId, setMaterialId] = useState(materials[0]?.id || '');
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [purchaseOrderId, setPurchaseOrderId] = useState('');
  const [batchNumber, setBatchNumber] = useState(`B-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`);
  const [lotNumber, setLotNumber] = useState(`LOT-${Date.now().toString().slice(-4)}`);
  const [quantity, setQuantity] = useState(50);
  const [storageLocation, setStorageLocation] = useState('Gudang Bahan R&D Rak A-02');
  const [expiryDate, setExpiryDate] = useState('2028-12-31');
  const [qcStatus, setQcStatus] = useState<'APPROVED' | 'PENDING_QC'>('APPROVED');
  const [qcNotes, setQcNotes] = useState('Pemeriksaan fisik kemasan utuh, segel baik, lolos uji saringan laboratorium.');
  const [notes, setNotes] = useState('Pengiriman dari pemasok berkala.');

  if (!isOpen) return null;

  const selectedMaterial = materials.find((m) => m.id === materialId) || materials[0];
  const selectedSupplier = suppliers.find((s) => s.id === supplierId) || suppliers[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialId || quantity <= 0) return;

    const poObj = purchaseOrders.find((p) => p.id === purchaseOrderId);

    processStockIn({
      date,
      materialId: selectedMaterial.id,
      materialName: selectedMaterial.name,
      supplierId: selectedSupplier.id,
      supplierName: selectedSupplier.name,
      purchaseOrderId: poObj?.id,
      purchaseOrderNumber: poObj?.poNumber,
      batchNumber,
      lotNumber,
      quantity: Number(quantity),
      unit: selectedMaterial.unit,
      unitPrice: selectedMaterial.unitCost,
      receivedBy: currentUser.name,
      storageLocation,
      expiryDate,
      qcStatus,
      qcInspector: currentUser.name,
      qcNotes,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-2.5">
            <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">Formulir Penerimaan Barang (Stock In & QC)</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 leading-relaxed">
            Penerimaan barang dengan status <strong>Approved QC</strong> akan secara otomatis menambah stok bahan baku di gudang dan mencatat transaksi ke dalam continuous inventory ledger.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Penerimaan *</label>
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pemasok (Supplier)</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Referensi Purchase Order (Opsional)</label>
              <select
                value={purchaseOrderId}
                onChange={(e) => setPurchaseOrderId(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
              >
                <option value="">Tanpa PO (Penerimaan Langsung/Sampel)</option>
                {purchaseOrders.map((po) => (
                  <option key={po.id} value={po.id}>
                    {po.poNumber} - {po.supplierName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Jumlah Diterima ({selectedMaterial?.unit}) *
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min={0.1}
                step="any"
                required
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Batch Number</label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Lot Number</label>
              <input
                type="text"
                value={lotNumber}
                onChange={(e) => setLotNumber(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Lokasi Penyimpanan Rak</label>
              <input
                type="text"
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Kadaluarsa (Expiry)</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          {/* QC Inspection Section */}
          <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-emerald-900 text-xs">Pemeriksaan Kualitas (QC Inspection)</span>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-1.5 text-xs text-emerald-800 cursor-pointer">
                  <input
                    type="radio"
                    name="qc"
                    checked={qcStatus === 'APPROVED'}
                    onChange={() => setQcStatus('APPROVED')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>QC Approved (Lolos)</span>
                </label>
                <label className="inline-flex items-center gap-1.5 text-xs text-amber-800 cursor-pointer">
                  <input
                    type="radio"
                    name="qc"
                    checked={qcStatus === 'PENDING_QC'}
                    onChange={() => setQcStatus('PENDING_QC')}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span>Karantina (Pending QC)</span>
                </label>
              </div>
            </div>
            <textarea
              rows={2}
              value={qcNotes}
              onChange={(e) => setQcNotes(e.target.value)}
              placeholder="Catatan inspeksi QC visual, sieving mesh, COA vendor..."
              className="w-full px-3 py-1.5 border border-emerald-300 rounded-lg text-xs bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Catatan Tambahan Penerimaan</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              className="px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan Penerimaan Barang</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
