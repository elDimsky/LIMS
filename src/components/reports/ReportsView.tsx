import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  FileSpreadsheet,
  Filter,
  Package,
  ShoppingCart,
  FolderGit2,
  CheckCircle2,
  Trash2,
  Scale,
  Calendar,
} from 'lucide-react';
import { useLims } from '../../context/LimsContext';
import { formatCurrencyIDR, formatDate } from '../../utils/formatters';
import { exportToExcel, printCurrentView } from '../../utils/excelExport';

export const ReportsView: React.FC = () => {
  const {
    materials,
    purchaseOrders,
    researchProjects,
    experiments,
    labTests,
    wasteRecords,
    auditLogs,
  } = useLims();

  const [activeReportType, setActiveReportType] = useState<
    'inventory' | 'purchasing' | 'research' | 'laboratory' | 'waste' | 'audit'
  >('inventory');

  const [filterMonth, setFilterMonth] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');

  const today = new Date().toISOString().slice(0, 10);

  // Export handlers for each report
  const handleExport = () => {
    switch (activeReportType) {
      case 'inventory':
        exportToExcel({
          fileName: `Inventory_Report_${today}.xlsx`,
          sheetName: 'Inventory Summary',
          reportTitle: 'PT KENCANA ENAMEL & COOKWARE - INVENTORY & VALUATION REPORT',
          metadata: { 'Tanggal Cetak': today, 'Filter Kategori': filterCategory },
          data: materials
            .filter((m) => filterCategory === 'ALL' || m.category === filterCategory)
            .map((m) => ({
              'Kode': m.code,
              'Nama Bahan': m.name,
              'Kategori': m.category,
              'Stok Fisik': m.currentStock,
              'Reserved': m.reservedStock,
              'Available': m.currentStock - m.reservedStock,
              'Satuan': m.unit,
              'Harga Satuan (IDR)': m.unitCost,
              'Total Valuasi (IDR)': m.currentStock * m.unitCost,
              'Reorder Point': m.reorderPoint,
              'Status': m.status,
              'Lokasi Simpan': m.storageLocation,
            })),
        });
        break;

      case 'purchasing':
        exportToExcel({
          fileName: `Purchasing_Report_${today}.xlsx`,
          sheetName: 'Purchasing Summary',
          reportTitle: 'PT KENCANA ENAMEL & COOKWARE - PURCHASING & PO REPORT',
          metadata: { 'Tanggal Cetak': today },
          data: purchaseOrders.map((po) => ({
            'No. PO': po.poNumber,
            'Tanggal PO': po.poDate,
            'Supplier': po.supplierName,
            'Subtotal (IDR)': po.subTotal,
            'PPN 11% (IDR)': po.tax,
            'Grand Total (IDR)': po.grandTotal,
            'Status Pengiriman': po.deliveryStatus,
            'Status Pembayaran': po.paymentStatus,
            'Pemohon': po.requestedBy,
          })),
        });
        break;

      case 'research':
        exportToExcel({
          fileName: `Research_Report_${today}.xlsx`,
          sheetName: 'Research Summary',
          reportTitle: 'PT KENCANA ENAMEL & COOKWARE - R&D RESEARCH PROJECTS REPORT',
          metadata: { 'Tanggal Cetak': today },
          data: researchProjects.map((p) => ({
            'Kode Project': p.code,
            'Judul Riset': p.title,
            'Kategori': p.category,
            'Target Produk': p.productTarget,
            'Mulai': p.startDate,
            'Target Selesai': p.targetCompletion,
            'Budget (IDR)': p.budget,
            'Realisasi (IDR)': p.actualSpent,
            'PIC': p.pic,
            'Status': p.status,
            'Kriteria Keberhasilan': p.targetMetric,
          })),
        });
        break;

      case 'laboratory':
        exportToExcel({
          fileName: `Laboratory_Report_${today}.xlsx`,
          sheetName: 'Lab QC Summary',
          reportTitle: 'PT KENCANA ENAMEL & COOKWARE - LABORATORY TESTING & QC REPORT',
          metadata: { 'Tanggal Cetak': today },
          data: labTests.map((t) => ({
            'Kode Uji': t.testCode,
            'Tanggal': t.testDate,
            'Sample ID': t.sampleCode,
            'Project Riset': t.researchProjectTitle,
            'Pengujian': t.testName,
            'Standar Metode': t.methodStandard,
            'Target Spesifikasi': t.specificationTarget,
            'Hasil': t.resultValue,
            'Status Verdict': t.status,
            'Analis': t.testedBy,
          })),
        });
        break;

      case 'waste':
        exportToExcel({
          fileName: `Waste_Report_${today}.xlsx`,
          sheetName: 'Waste Summary',
          reportTitle: 'PT KENCANA ENAMEL & COOKWARE - ENVIRONMENTAL & B3 WASTE REPORT',
          metadata: { 'Tanggal Cetak': today },
          data: wasteRecords.map((w) => ({
            'Kode Limbah': w.wasteCode,
            'Tanggal': w.date,
            'Material Asal': w.materialName,
            'Kategori Bahaya': w.hazardCategory,
            'Tipe Limbah': w.wasteType,
            'Jumlah': w.quantity,
            'Satuan': w.unit,
            'Penyebab': w.reason,
            'Lokasi TPS': w.storageLocation,
            'Transporter': w.disposalMethod,
            'Biaya (IDR)': w.estimatedDisposalCost,
            'Status': w.status,
          })),
        });
        break;

      case 'audit':
        exportToExcel({
          fileName: `User_Activity_Report_${today}.xlsx`,
          sheetName: 'Audit Trail',
          reportTitle: 'PT KENCANA ENAMEL & COOKWARE - USER ACTIVITY & AUDIT TRAIL REPORT',
          metadata: { 'Tanggal Cetak': today },
          data: auditLogs.map((l) => ({
            'Waktu': l.timestamp,
            'User': l.userName,
            'Role': l.userRole,
            'Aksi': l.action,
            'Modul': l.module,
            'Record': l.recordIdentifier,
            'Detail': l.details,
            'IP Address': l.ipAddress,
          })),
        });
        break;
    }
  };

  return (
    <div className="space-y-5">
      {/* Header and Print Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Executive R&D Reporting & Analytics
          </h1>
          <p className="text-xs text-slate-500">
            Modul pelaporan komprehensif inventaris, pengadaan, riset alat masak, pengujian mutu, dan kepatuhan limbah dengan ekspor Excel profesional
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => printCurrentView('LIMS R&D Report')}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Report Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { id: 'inventory', label: 'Inventory Report', icon: Package },
          { id: 'purchasing', label: 'Purchasing Report', icon: ShoppingCart },
          { id: 'research', label: 'Research Report', icon: FolderGit2 },
          { id: 'laboratory', label: 'Laboratory QC', icon: CheckCircle2 },
          { id: 'waste', label: 'Waste Report', icon: Trash2 },
          { id: 'audit', label: 'User Activity', icon: Scale },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReportType(tab.id as any)}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                activeReportType === tab.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${activeReportType === tab.id ? 'text-teal-400' : 'text-slate-500'}`} />
              <span className="text-xs font-bold truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Report Content Preview Box */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Report Top Meta Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <h2 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
              {activeReportType === 'inventory' && 'Laporan Ringkasan Stok & Valuasi Bahan Baku'}
              {activeReportType === 'purchasing' && 'Laporan Pengadaan & Purchase Order R&D'}
              {activeReportType === 'research' && 'Laporan Proyek Penelitian & Alokasi Anggaran'}
              {activeReportType === 'laboratory' && 'Laporan Pengujian Mutu Enamel & Standar ISO'}
              {activeReportType === 'waste' && 'Laporan Rekapitulasi Limbah Laboratorium & B3'}
              {activeReportType === 'audit' && 'Laporan Jejak Audit Aktivitas Pengguna (Audit Trail)'}
            </h2>
            <p className="text-slate-500 mt-0.5">
              PT Kencana Enamel & Cookware Nusantara · Divalidasi oleh Supervisor Ayu Jamilatul Janah
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-600 bg-white px-2.5 py-1 rounded border border-slate-200">
              Format: Microsoft Excel (.xlsx)
            </span>
          </div>
        </div>

        {/* Live Table Preview */}
        <div className="overflow-x-auto p-2">
          {activeReportType === 'inventory' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Kode</th>
                  <th className="py-2.5 px-3">Nama Bahan</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3 text-right">Stok Fisik</th>
                  <th className="py-2.5 px-3 text-right">Available</th>
                  <th className="py-2.5 px-3 text-right">Valuasi (IDR)</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {materials.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono font-semibold">{m.code}</td>
                    <td className="py-2 px-3 font-medium text-slate-900">{m.name}</td>
                    <td className="py-2 px-3 text-slate-500">{m.category}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold">{m.currentStock} {m.unit}</td>
                    <td className="py-2 px-3 text-right font-mono text-emerald-700 font-semibold">{m.currentStock - m.reservedStock} {m.unit}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{formatCurrencyIDR(m.currentStock * m.unitCost)}</td>
                    <td className="py-2 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReportType === 'purchasing' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">No. PO</th>
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Supplier</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                  <th className="py-2.5 px-3 text-right">PPN 11%</th>
                  <th className="py-2.5 px-3 text-right">Grand Total</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono font-semibold">{po.poNumber}</td>
                    <td className="py-2 px-3 font-mono">{po.poDate}</td>
                    <td className="py-2 px-3 text-slate-900 font-medium">{po.supplierName}</td>
                    <td className="py-2 px-3 text-right font-mono">{formatCurrencyIDR(po.subTotal)}</td>
                    <td className="py-2 px-3 text-right font-mono">{formatCurrencyIDR(po.tax)}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-indigo-700">{formatCurrencyIDR(po.grandTotal)}</td>
                    <td className="py-2 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {po.deliveryStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReportType === 'research' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Kode</th>
                  <th className="py-2.5 px-3">Judul Proyek</th>
                  <th className="py-2.5 px-3">Produk Target</th>
                  <th className="py-2.5 px-3">PIC</th>
                  <th className="py-2.5 px-3 text-right">Budget Alokasi</th>
                  <th className="py-2.5 px-3 text-right">Realisasi</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {researchProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono font-semibold">{p.code}</td>
                    <td className="py-2 px-3 font-medium text-slate-900">{p.title}</td>
                    <td className="py-2 px-3 text-slate-600">{p.productTarget}</td>
                    <td className="py-2 px-3 text-slate-700">{p.pic}</td>
                    <td className="py-2 px-3 text-right font-mono">{formatCurrencyIDR(p.budget)}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-teal-700">{formatCurrencyIDR(p.actualSpent)}</td>
                    <td className="py-2 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReportType === 'laboratory' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Kode Uji</th>
                  <th className="py-2.5 px-3">Sample ID</th>
                  <th className="py-2.5 px-3">Nama Uji</th>
                  <th className="py-2.5 px-3">Standar</th>
                  <th className="py-2.5 px-3">Target</th>
                  <th className="py-2.5 px-3">Hasil</th>
                  <th className="py-2.5 px-3 text-center">Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {labTests.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono font-semibold">{t.testCode}</td>
                    <td className="py-2 px-3 font-mono">{t.sampleCode}</td>
                    <td className="py-2 px-3 font-medium text-slate-900">{t.testName}</td>
                    <td className="py-2 px-3 font-mono text-slate-500">{t.methodStandard}</td>
                    <td className="py-2 px-3 text-slate-600">{t.specificationTarget}</td>
                    <td className="py-2 px-3 font-mono font-bold text-slate-900">{t.resultValue}</td>
                    <td className="py-2 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReportType === 'waste' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Kode Limbah</th>
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Material</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3 text-right">Jumlah</th>
                  <th className="py-2.5 px-3">TPS</th>
                  <th className="py-2.5 px-3 text-right">Biaya Pengelolaan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {wasteRecords.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono font-semibold">{w.wasteCode}</td>
                    <td className="py-2 px-3 font-mono">{w.date}</td>
                    <td className="py-2 px-3 font-medium text-slate-900">{w.materialName}</td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        {w.hazardCategory}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold">{w.quantity} {w.unit}</td>
                    <td className="py-2 px-3 text-slate-600">{w.storageLocation}</td>
                    <td className="py-2 px-3 text-right font-mono text-rose-700 font-semibold">{formatCurrencyIDR(w.estimatedDisposalCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReportType === 'audit' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Waktu</th>
                  <th className="py-2.5 px-3">User & Role</th>
                  <th className="py-2.5 px-3">Aksi</th>
                  <th className="py-2.5 px-3">Modul</th>
                  <th className="py-2.5 px-3">Detail Transaksi</th>
                  <th className="py-2.5 px-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono text-slate-500">{l.timestamp}</td>
                    <td className="py-2 px-3 font-medium text-slate-900">{l.userName} ({l.userRole})</td>
                    <td className="py-2 px-3 font-mono font-semibold text-slate-800">{l.action}</td>
                    <td className="py-2 px-3 text-slate-600">{l.module}</td>
                    <td className="py-2 px-3 text-slate-700 truncate max-w-sm">{l.details}</td>
                    <td className="py-2 px-3 font-mono text-slate-400">{l.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
