import React, { useState } from 'react';
import {
  X,
  Package,
  Layers,
  Building2,
  FileText,
  History,
  Beaker,
  AlertTriangle,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import { Material } from '../../types/lims';
import { useLims } from '../../context/LimsContext';
import { formatCurrencyIDR, formatDate } from '../../utils/formatters';

interface MaterialDetailModalProps {
  material: Material | null;
  onClose: () => void;
  onEdit: (material: Material) => void;
}

export const MaterialDetailModal: React.FC<MaterialDetailModalProps> = ({
  material,
  onClose,
  onEdit,
}) => {
  const { ledger, experiments, purchaseOrders, wasteRecords } = useLims();
  const [activeTab, setActiveTab] = useState<'overview' | 'stock' | 'purchasing' | 'research' | 'waste' | 'docs'>('overview');

  if (!material) return null;

  // Filter relational records for this specific material
  const materialLedger = ledger.filter((l) => l.materialId === material.id);
  const materialExperiments = experiments.filter((e) =>
    e.materialsUsed.some((mu) => mu.materialId === material.id)
  );
  const materialPOs = purchaseOrders.filter((po) =>
    po.items.some((i) => i.materialId === material.id)
  );
  const materialWaste = wasteRecords.filter((w) => w.materialId === material.id);

  const availableStock = material.currentStock - material.reservedStock;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-end bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 truncate max-w-md">{material.name}</h2>
              <p className="text-xs text-slate-500 font-mono">
                {material.code} · Kategori: {material.category} / {material.subCategory}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(material)}
              className="px-3 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-md transition-colors"
            >
              Edit Bahan
            </button>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-md">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Smart Tabs Nav */}
        <div className="px-4 border-b border-slate-200 flex items-center gap-1 bg-white overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'stock', label: `Stock Movement (${materialLedger.length})` },
            { id: 'purchasing', label: `Purchasing (${materialPOs.length})` },
            { id: 'research', label: `Research Usage (${materialExperiments.length})` },
            { id: 'waste', label: `Limbah (${materialWaste.length})` },
            { id: 'docs', label: 'SDS / Dokumen' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-teal-500 text-teal-700 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Stock Status Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Stok Fisik Saat Ini</span>
                  <span className="text-lg font-bold text-slate-900 font-mono">
                    {material.currentStock} {material.unit}
                  </span>
                </div>
                <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200">
                  <span className="text-[11px] text-amber-700 block">Stok Dicadangkan (Reserved)</span>
                  <span className="text-lg font-bold text-amber-800 font-mono">
                    {material.reservedStock} {material.unit}
                  </span>
                </div>
                <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200">
                  <span className="text-[11px] text-emerald-700 block">Stok Tersedia (Available)</span>
                  <span className="text-lg font-bold text-emerald-800 font-mono">
                    {availableStock} {material.unit}
                  </span>
                </div>
              </div>

              {/* Specification & General Info */}
              <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-200 space-y-3">
                <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider">
                  Deskripsi & Spesifikasi Material
                </h3>
                <p className="text-slate-600 leading-relaxed">{material.description}</p>
                <div className="p-2.5 bg-white rounded border border-slate-200 text-slate-700 font-mono text-[11px]">
                  <strong>Spesifikasi Teknis:</strong> {material.specification}
                </div>
              </div>

              {/* Inventory Parameters */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border border-slate-200 rounded-lg space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Parameter Stok</span>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Minimum Stock:</span>
                    <span className="font-mono font-medium">{material.minimumStock} {material.unit}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Reorder Point:</span>
                    <span className="font-mono font-medium">{material.reorderPoint} {material.unit}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Safety Stock:</span>
                    <span className="font-mono font-medium">{material.safetyStock} {material.unit}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Maksimum Gudang:</span>
                    <span className="font-mono font-medium">{material.maximumStock} {material.unit}</span>
                  </div>
                </div>

                <div className="p-3 border border-slate-200 rounded-lg space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Batch & Penyimpanan</span>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Lokasi Simpan:</span>
                    <span className="font-medium text-slate-800">{material.storageLocation}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Batch Number:</span>
                    <span className="font-mono">{material.batchNumber}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Lot Number:</span>
                    <span className="font-mono">{material.lotNumber}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Kadaluarsa (Expiry):</span>
                    <span className="font-mono text-slate-800">{formatDate(material.expiryDate)}</span>
                  </div>
                </div>
              </div>

              {/* Commercial & Supplier Info */}
              <div className="p-3 border border-slate-200 rounded-lg space-y-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Informasi Pembelian & Pemasok</span>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Supplier Utama:</span>
                    <span className="font-semibold text-slate-900">{material.supplierName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Estimasi Harga Satuan:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatCurrencyIDR(material.unitCost)} / {material.unit}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stock' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Riwayat Mutasi Stok (Ledger)</h3>
                <span className="text-[11px] text-slate-500 font-mono">{materialLedger.length} Transaksi</span>
              </div>
              {materialLedger.length === 0 ? (
                <p className="text-slate-400 py-6 text-center">Belum ada transaksi mutasi untuk bahan ini.</p>
              ) : (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 text-[11px] border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Tanggal</th>
                        <th className="py-2 px-3">Tipe</th>
                        <th className="py-2 px-3 text-right">Perubahan</th>
                        <th className="py-2 px-3 text-right">Sisa Stok</th>
                        <th className="py-2 px-3">Tujuan / Referensi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {materialLedger.map((l) => (
                        <tr key={l.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono text-slate-600">{l.date}</td>
                          <td className="py-2 px-3">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700">
                              {l.type}
                            </span>
                          </td>
                          <td className={`py-2 px-3 text-right font-mono font-semibold ${l.quantityChange > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {l.quantityChange > 0 ? `+${l.quantityChange}` : l.quantityChange} {l.unit}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-800">
                            {l.currentStock} {l.unit}
                          </td>
                          <td className="py-2 px-3 text-slate-600 truncate max-w-xs">
                            {l.purpose || l.referenceNumber || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'purchasing' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Purchase Orders Terkait</h3>
                <span className="text-[11px] text-slate-500">{materialPOs.length} Dokumen PO</span>
              </div>
              {materialPOs.length === 0 ? (
                <p className="text-slate-400 py-6 text-center">Belum ada PO tercatat untuk bahan ini.</p>
              ) : (
                materialPOs.map((po) => (
                  <div key={po.id} className="p-3 border border-slate-200 rounded-lg space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-900">{po.poNumber}</span>
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                        {po.deliveryStatus}
                      </span>
                    </div>
                    <p className="text-slate-600">Supplier: {po.supplierName}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <span>Tanggal PO: {po.poDate}</span>
                      <span className="font-mono font-bold text-slate-800">
                        Total PO: {formatCurrencyIDR(po.grandTotal)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'research' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Pemakaian dalam Riset & Eksperimen</h3>
                <span className="text-[11px] text-slate-500">{materialExperiments.length} Eksperimen</span>
              </div>
              {materialExperiments.length === 0 ? (
                <p className="text-slate-400 py-6 text-center">Bahan ini belum digunakan dalam eksperimen aktif.</p>
              ) : (
                materialExperiments.map((exp) => (
                  <div key={exp.id} className="p-3 border border-slate-200 rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold text-teal-700">{exp.experimentNumber}</span>
                      <span className="text-[11px] text-slate-400">{exp.experimentDate}</span>
                    </div>
                    <p className="font-medium text-slate-800">{exp.researchProjectTitle}</p>
                    <p className="text-slate-600 line-clamp-1">{exp.objective}</p>
                    <div className="text-[11px] text-slate-500 pt-1">
                      Parameter: {exp.processParameters.temperature}°C, {exp.processParameters.firingTime} menit
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'waste' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Catatan Limbah / Sisa Uji Coba</h3>
                <span className="text-[11px] text-slate-500">{materialWaste.length} Catatan</span>
              </div>
              {materialWaste.length === 0 ? (
                <p className="text-slate-400 py-6 text-center">Belum ada limbah tercatat untuk bahan ini.</p>
              ) : (
                materialWaste.map((w) => (
                  <div key={w.id} className="p-3 border border-slate-200 rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold text-rose-700">{w.wasteCode}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 bg-rose-50 text-rose-700 rounded">
                        {w.hazardCategory}
                      </span>
                    </div>
                    <p className="text-slate-800 font-medium">{w.materialName}</p>
                    <p className="text-slate-500">Jumlah: {w.quantity} {w.unit} · {w.disposalMethod}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'docs' && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-800">Dokumen Kepatuhan & MSDS/SDS</h3>
              <div className="p-4 border border-slate-200 rounded-lg flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-rose-600" />
                  <div>
                    <p className="font-semibold text-slate-900">
                      MSDS_{material.code}.pdf
                    </p>
                    <p className="text-[11px] text-slate-500">Lembar Data Keselamatan Bahan (GHS Compliant) · 1.4 MB</p>
                  </div>
                </div>
                <button
                  onClick={() => alert(`Mengunduh dokumen MSDS untuk ${material.name}`)}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download SDS</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
