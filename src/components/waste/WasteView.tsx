import React, { useState } from 'react';
import {
  Trash2,
  Plus,
  Download,
  Search,
  Filter,
  AlertTriangle,
  ShieldCheck,
  FileSpreadsheet,
  Recycle,
  Sparkles,
  TrendingDown,
  Edit2,
  CheckCircle2,
  ArrowRight,
  Boxes,
} from 'lucide-react';
import { useLims } from '../../context/LimsContext';
import { formatCurrencyIDR } from '../../utils/formatters';
import { exportToExcel } from '../../utils/excelExport';
import { WasteRecord } from '../../types/lims';
import { WasteFormModal } from './WasteFormModal';

export const WasteView: React.FC = () => {
  const { wasteRecords } = useLims();

  const [search, setSearch] = useState('');
  const [selectedHazard, setSelectedHazard] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [recycleFilter, setRecycleFilter] = useState<'ALL' | 'RECYCLED_ONLY' | 'NON_RECYCLED'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWasteToEdit, setSelectedWasteToEdit] = useState<WasteRecord | null>(null);

  const filteredWaste = wasteRecords.filter((w) => {
    const matchesSearch =
      w.wasteCode.toLowerCase().includes(search.toLowerCase()) ||
      w.materialName.toLowerCase().includes(search.toLowerCase()) ||
      w.reason.toLowerCase().includes(search.toLowerCase()) ||
      (w.recycleResult && w.recycleResult.toLowerCase().includes(search.toLowerCase())) ||
      w.responsiblePerson.toLowerCase().includes(search.toLowerCase());

    const matchesHazard =
      selectedHazard === 'ALL' || w.hazardCategory === selectedHazard;

    const matchesType =
      selectedType === 'ALL' || w.wasteType === selectedType;

    const matchesRecycle =
      recycleFilter === 'ALL' ||
      (recycleFilter === 'RECYCLED_ONLY' && w.isRecycled) ||
      (recycleFilter === 'NON_RECYCLED' && !w.isRecycled);

    return matchesSearch && matchesHazard && matchesType && matchesRecycle;
  });

  // Calculate KPIs
  const totalKg = wasteRecords
    .filter((w) => w.unit === 'KG')
    .reduce((acc, w) => acc + w.quantity, 0);

  const totalLiter = wasteRecords
    .filter((w) => w.unit === 'L')
    .reduce((acc, w) => acc + w.quantity, 0);

  const totalDisposalCost = wasteRecords.reduce((acc, w) => acc + (w.estimatedDisposalCost || 0), 0);

  const totalSavingCost = wasteRecords
    .filter((w) => w.isRecycled)
    .reduce((acc, w) => acc + (w.savingCost || 0), 0);

  const totalRecycledQty = wasteRecords
    .filter((w) => w.isRecycled)
    .reduce((acc, w) => acc + (w.recycledQuantity || w.quantity || 0), 0);

  const recycledCount = wasteRecords.filter((w) => w.isRecycled).length;

  const handleOpenAddModal = () => {
    setSelectedWasteToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (waste: WasteRecord) => {
    setSelectedWasteToEdit(waste);
    setIsModalOpen(true);
  };

  const handleExportExcel = () => {
    const today = new Date().toISOString().slice(0, 10);
    exportToExcel({
      fileName: `Laporan_Limbah_Recycle_R&D_${today}.xlsx`,
      sheetName: 'Waste & Recycling',
      reportTitle: 'LAPORAN PENGELOLAAN LIMBAH & HASIL RECYCLE LABORATORIUM R&D',
      data: filteredWaste.map((w) => ({
        'Kode Limbah': w.wasteCode,
        'Tanggal': w.date,
        'Deskripsi / Material': w.materialName,
        'Kategori Bahaya': w.hazardCategory,
        'Tipe Limbah': w.wasteType,
        'Volume/Berat': `${w.quantity} ${w.unit}`,
        'Status Daur Ulang': w.isRecycled ? 'RECYCLED' : 'DISPOSED',
        'Hasil Recycle Limbah': w.recycleResult || '-',
        'Jumlah Recycle': w.isRecycled ? `${w.recycledQuantity || w.quantity} ${w.recycledUnit || w.unit}` : '-',
        'Metode Recycle': w.recycleMethod || '-',
        'Estimasi Saving Cost (IDR)': w.savingCost || 0,
        'Penyebab Limbah': w.reason,
        'Lokasi TPS': w.storageLocation,
        'Biaya Disposal (IDR)': w.estimatedDisposalCost,
        'Transporter': w.disposalMethod,
        'Penanggung Jawab': w.responsiblePerson,
        'Status Approval': w.status,
      })),
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Waste Management & Circular Recycling</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              Hasil Recycle & Cost Saving
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            Pengelolaan limbah B3/non-B3, pencatatan hasil daur ulang (enamel sludge, scrap logam alat masak), dan kalkulasi estimasi saving cost
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Catat Limbah & Recycle</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Estimasi Saving Cost Highlighted Card */}
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white p-4 rounded-xl border-2 border-emerald-300 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">
              Total Estimasi Saving Cost
            </span>
            <span className="p-1 bg-emerald-200/60 text-emerald-800 rounded-md">
              <Recycle className="w-3.5 h-3.5" />
            </span>
          </div>
          <span className="text-xl font-bold font-mono text-emerald-700 mt-1 block">
            {formatCurrencyIDR(totalSavingCost)}
          </span>
          <p className="text-[11px] text-emerald-800/80 mt-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>Dari <strong>{recycledCount} batch</strong> daur ulang material</span>
          </p>
        </div>

        {/* Total Hasil Recycle */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Bahan Berhasil Di-Recycle
            </span>
            <span className="p-1 bg-teal-50 text-teal-700 rounded-md">
              <Boxes className="w-3.5 h-3.5" />
            </span>
          </div>
          <span className="text-xl font-bold font-mono text-teal-800 mt-1 block">
            {totalRecycledQty.toFixed(1)} Unit
          </span>
          <p className="text-[11px] text-slate-500 mt-1">
            Substitusi frit ground coat & scrap ingot
          </p>
        </div>

        {/* Total Volume Limbah */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Timbulan Limbah
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold font-mono text-slate-900">
              {totalKg} KG
            </span>
            <span className="text-sm font-semibold text-slate-500 font-mono">
              + {totalLiter} L
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Lumpur enamel, spent acid & scrap SPCE
          </p>
        </div>

        {/* Biaya Pengelolaan Disposal */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Biaya Pengelolaan (Disposal)
          </span>
          <span className="text-xl font-bold font-mono text-rose-700 mt-1 block">
            {formatCurrencyIDR(totalDisposalCost)}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">
            Transporter Berizin: <strong>PT Wastec Int.</strong>
          </p>
        </div>
      </div>

      {/* Quick Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setRecycleFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
            recycleFilter === 'ALL'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Semua Catatan Limbah ({wasteRecords.length})
        </button>
        <button
          onClick={() => setRecycleFilter('RECYCLED_ONLY')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            recycleFilter === 'RECYCLED_ONLY'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300'
          }`}
        >
          <Recycle className="w-3.5 h-3.5" />
          <span>Hasil Recycle & Saving Cost ({recycledCount})</span>
        </button>
        <button
          onClick={() => setRecycleFilter('NON_RECYCLED')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
            recycleFilter === 'NON_RECYCLED'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Limbah Disposed / Netralisasi ({wasteRecords.length - recycledCount})
        </button>
      </div>

      {/* Search & Select Filters */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kode, nama material, hasil recycle, alasan..."
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          <select
            value={selectedHazard}
            onChange={(e) => setSelectedHazard(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 font-medium"
          >
            <option value="ALL">Semua Kategori Bahaya</option>
            <option value="NON_B3">Non-B3</option>
            <option value="B3_HAZARDOUS">Limbah B3 (Hazardous)</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 font-medium"
          >
            <option value="ALL">Semua Jenis Limbah</option>
            <option value="ENAMEL_WASTE">Lumpur Enamel (Sludge/Overspray)</option>
            <option value="METAL_WASTE">Scrap Logam Alat Masak</option>
            <option value="CHEMICAL_WASTE">Chemical Pretreatment Waste</option>
          </select>
        </div>

        <span className="text-slate-500 font-mono text-[11px]">
          {filteredWaste.length} Catatan Limbah Ditampilkan
        </span>
      </div>

      {/* Waste Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-3.5 font-semibold">Kode & Tanggal</th>
                <th className="py-3 px-3.5 font-semibold">Material / Deskripsi</th>
                <th className="py-3 px-3.5 font-semibold text-right">Volume</th>
                <th className="py-3 px-3.5 font-semibold">Hasil Recycle Limbah</th>
                <th className="py-3 px-3.5 font-semibold text-right">Estimasi Saving Cost</th>
                <th className="py-3 px-3.5 font-semibold">Lokasi TPS & Transporter</th>
                <th className="py-3 px-3.5 font-semibold text-center">Status</th>
                <th className="py-3 px-3.5 font-semibold text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWaste.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ada catatan limbah yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredWaste.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Kode & Tanggal */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <p className="font-mono font-bold text-slate-900">{w.wasteCode}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{w.date}</p>
                    </td>

                    {/* Material */}
                    <td className="py-3 px-3.5 max-w-xs">
                      <p className="font-semibold text-slate-900 truncate">{w.materialName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{w.reason}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span
                          className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                            w.hazardCategory === 'B3_HAZARDOUS'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {w.hazardCategory === 'B3_HAZARDOUS' ? 'B3' : 'Non-B3'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {w.source}
                        </span>
                      </div>
                    </td>

                    {/* Volume */}
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      {w.quantity} {w.unit}
                    </td>

                    {/* Hasil Recycle Limbah */}
                    <td className="py-3 px-3.5 min-w-[200px]">
                      {w.isRecycled ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                            <Recycle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate max-w-[220px]" title={w.recycleResult}>
                              {w.recycleResult || 'Bahan Daur Ulang In-House'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-mono font-medium">
                              Qty: {w.recycledQuantity || w.quantity} {w.recycledUnit || w.unit}
                            </span>
                            {w.recycleMethod && (
                              <span className="truncate max-w-[140px]" title={w.recycleMethod}>
                                {w.recycleMethod}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">
                          Tidak di-recycle (Disposal Transporter)
                        </span>
                      )}
                    </td>

                    {/* Estimasi Saving Cost */}
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      {w.isRecycled && (w.savingCost || 0) > 0 ? (
                        <div>
                          <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded font-mono font-bold text-xs">
                            +{formatCurrencyIDR(w.savingCost || 0)}
                          </span>
                          <p className="text-[10px] text-emerald-800/70 mt-0.5">
                            Cost Saving
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-mono text-[11px]">Rp 0</span>
                      )}
                    </td>

                    {/* Lokasi TPS & Transporter */}
                    <td className="py-3 px-3.5 text-slate-600 text-[11px] max-w-xs">
                      <p className="truncate font-medium text-slate-800">{w.storageLocation}</p>
                      <p className="truncate text-slate-500">{w.disposalMethod}</p>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                          w.status === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {w.status}
                      </span>
                    </td>

                    {/* Aksi */}
                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEditModal(w)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[11px] font-semibold transition-colors inline-flex items-center gap-1"
                        title="Edit Data Limbah / Input Hasil Recycle"
                      >
                        <Edit2 className="w-3 h-3 text-slate-500" />
                        <span>{w.isRecycled ? 'Edit' : '+ Recycle'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Waste Form Modal */}
      <WasteFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedWasteToEdit(null);
        }}
        wasteToEdit={selectedWasteToEdit}
      />
    </div>
  );
};
