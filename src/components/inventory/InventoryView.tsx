import React, { useState } from 'react';
import {
  Boxes,
  ArrowDownLeft,
  ArrowUpRight,
  Sliders,
  History,
  Download,
  Search,
  Filter,
  Package,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { useLims } from '../../context/LimsContext';
import { formatCurrencyIDR, formatDate } from '../../utils/formatters';
import { exportToExcel } from '../../utils/excelExport';
import { StockInModal } from './StockInModal';
import { StockOutModal } from './StockOutModal';
import { StockAdjustmentModal } from './StockAdjustmentModal';

export const InventoryView: React.FC = () => {
  const {
    materials,
    ledger,
    stockInRecords,
    stockOutRecords,
    stockAdjustments,
    currentUser,
  } = useLims();

  const [activeTab, setActiveTab] = useState<'overview' | 'stock_in' | 'stock_out' | 'ledger' | 'adjustment'>('overview');
  const [search, setSearch] = useState('');

  // Modals state
  const [isStockInOpen, setIsStockInOpen] = useState(false);
  const [isStockOutOpen, setIsStockOutOpen] = useState(false);
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);

  // Stats
  const totalValuation = materials.reduce((acc, m) => acc + m.currentStock * m.unitCost, 0);
  const lowStockCount = materials.filter((m) => m.status === 'LOW_STOCK').length;
  const outOfStockCount = materials.filter((m) => m.status === 'OUT_OF_STOCK').length;

  const handleExportExcel = () => {
    const today = new Date().toISOString().slice(0, 10);

    if (activeTab === 'overview') {
      exportToExcel({
        fileName: `Inventory_Stock_Report_${today}.xlsx`,
        sheetName: 'Stock Overview',
        reportTitle: 'PT KENCANA ENAMEL & COOKWARE NUSANTARA - INVENTORY STOCK REPORT',
        data: materials.map((m) => ({
          'Kode Bahan': m.code,
          'Nama Bahan': m.name,
          'Kategori': m.category,
          'Stok Fisik': m.currentStock,
          'Reserved': m.reservedStock,
          'Available': m.currentStock - m.reservedStock,
          'Satuan': m.unit,
          'Minimum': m.minimumStock,
          'Reorder Point': m.reorderPoint,
          'Valuasi (IDR)': m.currentStock * m.unitCost,
          'Status': m.status,
          'Lokasi Gudang': m.storageLocation,
        })),
      });
    } else if (activeTab === 'ledger') {
      exportToExcel({
        fileName: `Inventory_Ledger_${today}.xlsx`,
        sheetName: 'Stock Ledger',
        reportTitle: 'CONTINUOUS INVENTORY LEDGER TRANSACTIONS',
        data: ledger.map((l) => ({
          'No. Transaksi': l.transactionNumber,
          'Waktu': l.date,
          'Kode Bahan': l.materialCode,
          'Nama Bahan': l.materialName,
          'Tipe Transaksi': l.type,
          'Perubahan': l.quantityChange,
          'Stok Sebelum': l.previousStock,
          'Stok Akhir': l.currentStock,
          'Satuan': l.unit,
          'Referensi': l.referenceNumber || l.referenceId || '-',
          'Tujuan / Alasan': l.purpose || '-',
          'Oleh': l.requestedBy,
        })),
      });
    } else if (activeTab === 'stock_in') {
      exportToExcel({
        fileName: `Stock_In_Records_${today}.xlsx`,
        sheetName: 'Stock In Records',
        reportTitle: 'HISTORI PENERIMAAN BARANG (STOCK IN & QC)',
        data: stockInRecords.map((r) => ({
          'No. Penerimaan': r.transactionNumber,
          'Tanggal': r.date,
          'Bahan Baku': r.materialName,
          'Pemasok': r.supplierName,
          'Jumlah': r.quantity,
          'Satuan': r.unit,
          'Batch': r.batchNumber,
          'Lot': r.lotNumber,
          'Status QC': r.qcStatus,
          'Penerima': r.receivedBy,
        })),
      });
    } else {
      exportToExcel({
        fileName: `Stock_Out_Records_${today}.xlsx`,
        sheetName: 'Stock Out Records',
        reportTitle: 'HISTORI PENGELUARAN BAHAN R&D (STOCK OUT)',
        data: stockOutRecords.map((r) => ({
          'No. Transaksi': r.transactionNumber,
          'Tanggal': r.date,
          'Bahan Baku': r.materialName,
          'Jumlah': r.quantity,
          'Satuan': r.unit,
          'Tujuan': r.purpose,
          'Project Terkait': r.researchProjectTitle || '-',
          'Pemohon': r.requestedBy,
          'Disetujui': r.approvedBy,
        })),
      });
    }
  };

  // Filtered collections
  const filteredMaterials = materials.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.code.toLowerCase().includes(search.toLowerCase())
  );

  const filteredLedger = ledger.filter(
    (l) =>
      l.materialName.toLowerCase().includes(search.toLowerCase()) ||
      l.transactionNumber.toLowerCase().includes(search.toLowerCase()) ||
      l.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Top Header & Fast Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Inventory & Pergudangan R&D
          </h1>
          <p className="text-xs text-slate-500">
            Perhitungan stok real-time, penerimaan barang, pengeluaran untuk riset, dan audit ledger berkelanjutan
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={() => setIsStockInOpen(true)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>+ Stock In (QC)</span>
          </button>
          <button
            onClick={() => setIsStockOutOpen(true)}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+ Stock Out (Usage)</span>
          </button>
          <button
            onClick={() => setIsAdjustmentOpen(true)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>+ Penyesuaian</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Nilai Valuasi Stok
          </span>
          <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
            {formatCurrencyIDR(totalValuation)}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Item Tersedia (Available)
          </span>
          <span className="text-xl font-bold font-mono text-emerald-600 mt-1 block">
            {materials.length - lowStockCount - outOfStockCount} Bahan Normal
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Perlu Reorder Segera
          </span>
          <span className={`text-xl font-bold font-mono mt-1 block ${lowStockCount > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
            {lowStockCount} Bahan Baku
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Buku Besar (Ledger Rows)
          </span>
          <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
            {ledger.length} Transaksi Tercatat
          </span>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-4 border-b border-slate-200 flex items-center justify-between gap-3 overflow-x-auto bg-slate-50/50">
          <div className="flex items-center gap-1">
            {[
              { id: 'overview', label: `Stock Overview (${materials.length})` },
              { id: 'ledger', label: `Continuous Ledger (${ledger.length})` },
              { id: 'stock_in', label: `Stock In (${stockInRecords.length})` },
              { id: 'stock_out', label: `Stock Out (${stockOutRecords.length})` },
              { id: 'adjustment', label: `Opname Adjustment (${stockAdjustments.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-teal-500 text-teal-700 font-semibold bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="py-2 flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari..."
                className="pl-8 pr-2.5 py-1 text-xs border border-slate-300 rounded-lg w-48 bg-white focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Tab 1: Stock Overview */}
        {activeTab === 'overview' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5 font-semibold">Kode</th>
                  <th className="py-3 px-3.5 font-semibold">Nama Bahan Baku</th>
                  <th className="py-3 px-3.5 font-semibold">Lokasi Rak</th>
                  <th className="py-3 px-3.5 font-semibold text-right">Stok Fisik</th>
                  <th className="py-3 px-3.5 font-semibold text-right">Reserved</th>
                  <th className="py-3 px-3.5 font-semibold text-right">Available</th>
                  <th className="py-3 px-3.5 font-semibold text-right">Reorder Point</th>
                  <th className="py-3 px-3.5 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMaterials.map((m) => {
                  const available = m.currentStock - m.reservedStock;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3.5 font-mono font-semibold text-slate-900">{m.code}</td>
                      <td className="py-3 px-3.5">
                        <span className="font-semibold text-slate-800">{m.name}</span>
                        <span className="text-[11px] text-slate-500 block">{m.category}</span>
                      </td>
                      <td className="py-3 px-3.5 text-slate-600">{m.storageLocation}</td>
                      <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900">
                        {m.currentStock} {m.unit}
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono text-amber-700">
                        {m.reservedStock} {m.unit}
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono text-emerald-700 font-bold">
                        {available} {m.unit}
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono text-slate-600">
                        {m.reorderPoint} {m.unit}
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                            m.status === 'LOW_STOCK'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : m.status === 'OUT_OF_STOCK'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Continuous Ledger */}
        {activeTab === 'ledger' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5 font-semibold">No. Transaksi</th>
                  <th className="py-3 px-3.5 font-semibold">Waktu</th>
                  <th className="py-3 px-3.5 font-semibold">Bahan Baku</th>
                  <th className="py-3 px-3.5 font-semibold">Tipe Transaksi</th>
                  <th className="py-3 px-3.5 font-semibold text-right">Mutasi</th>
                  <th className="py-3 px-3.5 font-semibold text-right">Stok Berjalan</th>
                  <th className="py-3 px-3.5 font-semibold">Keterangan / Tujuan</th>
                  <th className="py-3 px-3.5 font-semibold">Oleh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLedger.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3.5 font-mono font-semibold text-slate-900">{l.transactionNumber}</td>
                    <td className="py-3 px-3.5 font-mono text-slate-500 whitespace-nowrap">{l.date}</td>
                    <td className="py-3 px-3.5">
                      <p className="font-semibold text-slate-800">{l.materialName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{l.materialCode}</p>
                    </td>
                    <td className="py-3 px-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700 font-medium">
                        {l.type}
                      </span>
                    </td>
                    <td className={`py-3 px-3.5 text-right font-mono font-bold whitespace-nowrap ${l.quantityChange > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {l.quantityChange > 0 ? `+${l.quantityChange}` : l.quantityChange} {l.unit}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      {l.currentStock} {l.unit}
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 truncate max-w-xs">{l.purpose || l.notes || '-'}</td>
                    <td className="py-3 px-3.5 text-slate-600 whitespace-nowrap">{l.requestedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Stock In Records */}
        {activeTab === 'stock_in' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5 font-semibold">No. Penerimaan</th>
                  <th className="py-3 px-3.5 font-semibold">Tanggal</th>
                  <th className="py-3 px-3.5 font-semibold">Bahan Baku</th>
                  <th className="py-3 px-3.5 font-semibold">Pemasok</th>
                  <th className="py-3 px-3.5 font-semibold text-right">Jumlah</th>
                  <th className="py-3 px-3.5 font-semibold">Batch / Lot</th>
                  <th className="py-3 px-3.5 font-semibold text-center">Status QC</th>
                  <th className="py-3 px-3.5 font-semibold">Penerima</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stockInRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3.5 font-mono font-semibold text-slate-900">{r.transactionNumber}</td>
                    <td className="py-3 px-3.5 font-mono text-slate-500">{r.date}</td>
                    <td className="py-3 px-3.5 font-semibold text-slate-800">{r.materialName}</td>
                    <td className="py-3 px-3.5 text-slate-600">{r.supplierName}</td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-emerald-700">
                      +{r.quantity} {r.unit}
                    </td>
                    <td className="py-3 px-3.5 font-mono text-slate-500">{r.batchNumber}</td>
                    <td className="py-3 px-3.5 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {r.qcStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-slate-600">{r.receivedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Stock Out Records */}
        {activeTab === 'stock_out' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5 font-semibold">No. Transaksi</th>
                  <th className="py-3 px-3.5 font-semibold">Tanggal</th>
                  <th className="py-3 px-3.5 font-semibold">Bahan Baku</th>
                  <th className="py-3 px-3.5 font-semibold text-right">Jumlah</th>
                  <th className="py-3 px-3.5 font-semibold">Tujuan</th>
                  <th className="py-3 px-3.5 font-semibold">Project R&D</th>
                  <th className="py-3 px-3.5 font-semibold">Pemohon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stockOutRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3.5 font-mono font-semibold text-slate-900">{r.transactionNumber}</td>
                    <td className="py-3 px-3.5 font-mono text-slate-500">{r.date}</td>
                    <td className="py-3 px-3.5 font-semibold text-slate-800">{r.materialName}</td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-rose-700">
                      -{r.quantity} {r.unit}
                    </td>
                    <td className="py-3 px-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-50 text-amber-800 border border-amber-200">
                        {r.purpose}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 truncate max-w-xs">
                      {r.researchProjectTitle || '-'}
                    </td>
                    <td className="py-3 px-3.5 text-slate-600">{r.requestedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 5: Stock Adjustments */}
        {activeTab === 'adjustment' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5 font-semibold">No. Dokumen</th>
                  <th className="py-3 px-3.5 font-semibold">Tanggal</th>
                  <th className="py-3 px-3.5 font-semibold">Bahan Baku</th>
                  <th className="py-3 px-3.5 font-semibold text-right">Stok Sistem</th>
                  <th className="py-3 px-3.5 font-semibold text-right">Fisik Aktual</th>
                  <th className="py-3 px-3.5 font-semibold text-right">Selisih</th>
                  <th className="py-3 px-3.5 font-semibold">Alasan Opname</th>
                  <th className="py-3 px-3.5 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stockAdjustments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3.5 font-mono font-semibold text-slate-900">{a.transactionNumber}</td>
                    <td className="py-3 px-3.5 font-mono text-slate-500">{a.date}</td>
                    <td className="py-3 px-3.5 font-semibold text-slate-800">{a.materialName}</td>
                    <td className="py-3 px-3.5 text-right font-mono text-slate-600">
                      {a.systemStock} {a.unit}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900">
                      {a.actualStock} {a.unit}
                    </td>
                    <td className={`py-3 px-3.5 text-right font-mono font-bold ${a.difference >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {a.difference > 0 ? `+${a.difference}` : a.difference} {a.unit}
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 truncate max-w-xs">{a.reason}</td>
                    <td className="py-3 px-3.5 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <StockInModal isOpen={isStockInOpen} onClose={() => setIsStockInOpen(false)} />
      <StockOutModal isOpen={isStockOutOpen} onClose={() => setIsStockOutOpen(false)} />
      <StockAdjustmentModal isOpen={isAdjustmentOpen} onClose={() => setIsAdjustmentOpen(false)} />
    </div>
  );
};
