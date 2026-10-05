import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  FileCheck,
  Building2,
  Download,
  Search,
  CheckCircle2,
  Clock,
  Star,
  FileSpreadsheet,
  ArrowDownLeft,
} from 'lucide-react';
import { useLims } from '../../context/LimsContext';
import { formatCurrencyIDR, formatDate } from '../../utils/formatters';
import { exportToExcel } from '../../utils/excelExport';
import { PurchaseOrderModal } from './PurchaseOrderModal';
import { PurchaseRequestModal } from './PurchaseRequestModal';

export const PurchasingView: React.FC = () => {
  const {
    purchaseOrders,
    purchaseRequests,
    suppliers,
    receiveGoodsPO,
    currentUser,
  } = useLims();

  const [activeTab, setActiveTab] = useState<'po' | 'pr' | 'suppliers'>('po');
  const [search, setSearch] = useState('');
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [isPRModalOpen, setIsPRModalOpen] = useState(false);
  const [receivingPOId, setReceivingPOId] = useState<string | null>(null);

  const totalPOCost = purchaseOrders.reduce((acc, po) => acc + po.grandTotal, 0);
  const pendingOrders = purchaseOrders.filter((po) => po.deliveryStatus === 'ORDERED').length;

  const handleExportExcel = () => {
    const today = new Date().toISOString().slice(0, 10);
    if (activeTab === 'po') {
      exportToExcel({
        fileName: `Purchasing_Orders_Report_${today}.xlsx`,
        sheetName: 'Purchase Orders',
        reportTitle: 'LAPORAN PURCHASE ORDERS (PO) R&D DIVISION',
        data: purchaseOrders.map((po) => ({
          'No. PO': po.poNumber,
          'Tanggal PO': po.poDate,
          'Supplier': po.supplierName,
          'Estimasi Tiba': po.expectedDelivery,
          'Jumlah Item': po.items.length,
          'Subtotal (IDR)': po.subTotal,
          'PPN (IDR)': po.tax,
          'Grand Total (IDR)': po.grandTotal,
          'Status Pengiriman': po.deliveryStatus,
          'Status Pembayaran': po.paymentStatus,
          'Pemohon': po.requestedBy,
        })),
      });
    } else if (activeTab === 'pr') {
      exportToExcel({
        fileName: `Purchasing_Requests_Report_${today}.xlsx`,
        sheetName: 'Purchase Requests',
        reportTitle: 'LAPORAN PURCHASE REQUESTS (PR) R&D DIVISION',
        data: purchaseRequests.map((pr) => ({
          'No. PR': pr.prNumber,
          'Tanggal Pengajuan': pr.requestDate,
          'Bahan Baku': pr.materialName,
          'Jumlah': pr.quantity,
          'Satuan': pr.unit,
          'Tgl Dibutuhkan': pr.requiredDate,
          'Prioritas': pr.priority,
          'Status': pr.status,
          'Tujuan': pr.purpose,
          'Pemohon': pr.requestedBy,
        })),
      });
    } else {
      exportToExcel({
        fileName: `Suppliers_Master_${today}.xlsx`,
        sheetName: 'Approved Suppliers',
        reportTitle: 'MASTER APPROVED VENDOR & SUPPLIERS',
        data: suppliers.map((s) => ({
          'Kode': s.code,
          'Nama Pemasok': s.name,
          'Kontak Person': s.contactPerson,
          'Telepon': s.phone,
          'Email': s.email,
          'Alamat': s.address,
          'Material yang Disuplai': s.materialsSupplied.join(', '),
          'Rating Internal': s.internalRating,
          'Termin Pembayaran': s.paymentTerms,
          'Status': s.status,
        })),
      });
    }
  };

  const handleGoodsReceipt = (poId: string, poNumber: string) => {
    if (
      window.confirm(
        `Konfirmasi Penerimaan Barang untuk ${poNumber}?\n\nBarang akan otomatis masuk ke modul Stock In, QC Approved, dan menambah stok bahan di inventory.`
      )
    ) {
      receiveGoodsPO(poId, 'Penerimaan barang lengkap lolos QC inspeksi.');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Purchasing & Manajemen Supplier
          </h1>
          <p className="text-xs text-slate-500">
            Pengadaan bahan formulasi enamel, plat logam presisi, verifikasi vendor, dan penerimaan barang (Goods Receipt QC)
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
            onClick={() => setIsPRModalOpen(true)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <FileCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>+ Purchase Request</span>
          </button>
          <button
            onClick={() => setIsPOModalOpen(true)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>+ Buat Purchase Order</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Biaya PO Diterbitkan
          </span>
          <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
            {formatCurrencyIDR(totalPOCost)}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            PO Dalam Pengiriman
          </span>
          <span className="text-xl font-bold font-mono text-indigo-600 mt-1 block">
            {pendingOrders} Berkas Aktif
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Permohonan PR Tertunda
          </span>
          <span className="text-xl font-bold font-mono text-amber-600 mt-1 block">
            {purchaseRequests.filter((pr) => pr.status === 'PENDING').length} Menunggu Review
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Approved Suppliers
          </span>
          <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
            {suppliers.length} Vendor Terdaftar
          </span>
        </div>
      </div>

      {/* Main Tabs Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('po')}
              className={`px-3.5 py-3 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'po'
                  ? 'border-indigo-600 text-indigo-700 font-semibold bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Purchase Orders ({purchaseOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('pr')}
              className={`px-3.5 py-3 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'pr'
                  ? 'border-indigo-600 text-indigo-700 font-semibold bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Purchase Requests ({purchaseRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`px-3.5 py-3 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'suppliers'
                  ? 'border-indigo-600 text-indigo-700 font-semibold bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Vendor & Suppliers ({suppliers.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Purchase Orders */}
        {activeTab === 'po' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5 font-semibold">No. PO</th>
                  <th className="py-3 px-3.5 font-semibold">Tanggal</th>
                  <th className="py-3 px-3.5 font-semibold">Pemasok (Supplier)</th>
                  <th className="py-3 px-3.5 font-semibold">Rincian Item</th>
                  <th className="py-3 px-3.5 font-semibold text-right">Grand Total (PPN 11%)</th>
                  <th className="py-3 px-3.5 font-semibold text-center">Status Pengiriman</th>
                  <th className="py-3 px-3.5 font-semibold text-center">Aksi / Penerimaan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3.5 font-mono font-semibold text-slate-900">{po.poNumber}</td>
                    <td className="py-3 px-3.5 font-mono text-slate-500 whitespace-nowrap">{po.poDate}</td>
                    <td className="py-3 px-3.5 font-medium text-slate-800">{po.supplierName}</td>
                    <td className="py-3 px-3.5 text-slate-600">
                      {po.items.map((i) => `${i.materialName} (${i.quantity} ${i.unit})`).join(', ')}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrencyIDR(po.grandTotal)}
                    </td>
                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold rounded-full border ${
                          po.deliveryStatus === 'RECEIVED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : po.deliveryStatus === 'ORDERED'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {po.deliveryStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      {po.deliveryStatus === 'ORDERED' ? (
                        <button
                          onClick={() => handleGoodsReceipt(po.id, po.poNumber)}
                          className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded shadow-2xs flex items-center gap-1 mx-auto transition-colors"
                        >
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                          <span>Terima Barang & QC</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">Tuntas Diterima</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Purchase Requests */}
        {activeTab === 'pr' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5 font-semibold">No. PR</th>
                  <th className="py-3 px-3.5 font-semibold">Tanggal</th>
                  <th className="py-3 px-3.5 font-semibold">Bahan Baku</th>
                  <th className="py-3 px-3.5 font-semibold text-right">Jumlah</th>
                  <th className="py-3 px-3.5 font-semibold">Dibutuhkan</th>
                  <th className="py-3 px-3.5 font-semibold">Tujuan Pengadaan</th>
                  <th className="py-3 px-3.5 font-semibold text-center">Prioritas</th>
                  <th className="py-3 px-3.5 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchaseRequests.map((pr) => (
                  <tr key={pr.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3.5 font-mono font-semibold text-slate-900">{pr.prNumber}</td>
                    <td className="py-3 px-3.5 font-mono text-slate-500">{pr.requestDate}</td>
                    <td className="py-3 px-3.5 font-semibold text-slate-800">{pr.materialName}</td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900">
                      {pr.quantity} {pr.unit}
                    </td>
                    <td className="py-3 px-3.5 font-mono text-slate-600">{pr.requiredDate}</td>
                    <td className="py-3 px-3.5 text-slate-600 truncate max-w-xs">{pr.purpose}</td>
                    <td className="py-3 px-3.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded ${
                          pr.priority === 'HIGH' || pr.priority === 'URGENT'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {pr.priority}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        {pr.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Suppliers */}
        {activeTab === 'suppliers' && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {suppliers.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-all space-y-2.5 text-xs shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <h3 className="font-bold text-slate-900 text-sm truncate">{s.name}</h3>
                  </div>
                  <div className="flex items-center gap-1 text-amber-600 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                    <span>{s.internalRating}</span>
                  </div>
                </div>

                <p className="text-slate-600">{s.notes}</p>

                <div className="pt-2 border-t border-slate-100 space-y-1 text-slate-500">
                  <p>
                    <strong className="text-slate-700">Kontak Person:</strong> {s.contactPerson} ({s.phone})
                  </p>
                  <p>
                    <strong className="text-slate-700">Email:</strong> {s.email}
                  </p>
                  <p>
                    <strong className="text-slate-700">Alamat:</strong> {s.address}
                  </p>
                  <p className="pt-1">
                    <strong className="text-slate-700">Material Suplai:</strong>{' '}
                    <span className="text-indigo-700 font-medium">{s.materialsSupplied.join(', ')}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <PurchaseOrderModal isOpen={isPOModalOpen} onClose={() => setIsPOModalOpen(false)} />
      <PurchaseRequestModal isOpen={isPRModalOpen} onClose={() => setIsPRModalOpen(false)} />
    </div>
  );
};
