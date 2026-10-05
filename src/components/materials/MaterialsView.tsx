import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Download,
  Filter,
  Eye,
  Edit2,
  Trash2,
  AlertTriangle,
  FileSpreadsheet,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { Material, MaterialCategory } from '../../types/lims';
import { useLims } from '../../context/LimsContext';
import { formatCurrencyIDR, formatDate } from '../../utils/formatters';
import { exportToExcel } from '../../utils/excelExport';
import { MaterialDetailModal } from './MaterialDetailModal';
import { MaterialFormModal } from './MaterialFormModal';

export const MaterialsView: React.FC = () => {
  const { materials, deleteMaterial, currentUser } = useLims();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'code' | 'stock' | 'valuation'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modals state
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [materialToEdit, setMaterialToEdit] = useState<Material | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Filter materials
  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.code.toLowerCase().includes(search.toLowerCase()) ||
      m.brand.toLowerCase().includes(search.toLowerCase()) ||
      m.supplierName.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'ALL' || m.category === selectedCategory;

    const matchesStatus =
      selectedStatus === 'ALL' || m.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sort materials
  const sortedMaterials = [...filteredMaterials].sort((a, b) => {
    let factor = sortOrder === 'asc' ? 1 : -1;
    if (sortBy === 'name') return a.name.localeCompare(b.name) * factor;
    if (sortBy === 'code') return a.code.localeCompare(b.code) * factor;
    if (sortBy === 'stock') return (a.currentStock - b.currentStock) * factor;
    if (sortBy === 'valuation')
      return (a.currentStock * a.unitCost - b.currentStock * b.unitCost) * factor;
    return 0;
  });

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleExportExcel = () => {
    const today = new Date().toISOString().slice(0, 10);
    exportToExcel({
      fileName: `Materials_Master_${today}.xlsx`,
      sheetName: 'Raw Materials Master',
      reportTitle: 'PT KENCANA ENAMEL & COOKWARE NUSANTARA - MASTER RAW MATERIALS REPORT',
      metadata: {
        'Kategori Filter': selectedCategory,
        'Status Filter': selectedStatus,
        'Pencarian': search || 'Semua Data',
        'Total Item': `${sortedMaterials.length} bahan`,
      },
      data: sortedMaterials.map((m) => ({
        'Kode Bahan': m.code,
        'Nama Bahan': m.name,
        'Kategori': m.category,
        'Sub Kategori': m.subCategory,
        'Brand': m.brand,
        'Supplier': m.supplierName,
        'Stok Fisik': m.currentStock,
        'Stok Reserved': m.reservedStock,
        'Stok Available': m.currentStock - m.reservedStock,
        'Satuan': m.unit,
        'Min Stock': m.minimumStock,
        'Reorder Point': m.reorderPoint,
        'Safety Stock': m.safetyStock,
        'Harga Satuan (IDR)': m.unitCost,
        'Total Valuasi (IDR)': m.currentStock * m.unitCost,
        'Lokasi Gudang': m.storageLocation,
        'Batch Number': m.batchNumber,
        'Lot Number': m.lotNumber,
        'Tgl Kadaluarsa': m.expiryDate,
        'Status': m.status,
      })),
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Yakin ingin menghapus master bahan baku "${name}"?`)) {
      const res = deleteMaterial(id);
      if (!res.success) {
        setDeleteError(res.error || 'Gagal menghapus bahan.');
      } else {
        setDeleteError(null);
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Master Data Bahan Baku</h1>
          <p className="text-xs text-slate-500">
            Katalog bahan baku metal, formula bubuk enamel, pigmen suhu tinggi, dan bahan kimia pretreatment
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
            onClick={() => {
              setMaterialToEdit(null);
              setIsFormOpen(true);
            }}
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Tambah Bahan</span>
          </button>
        </div>
      </div>

      {/* Delete Error Notification Banner */}
      {deleteError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{deleteError}</span>
          </div>
          <button onClick={() => setDeleteError(null)} className="text-xs font-semibold hover:underline">
            Tutup
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[300px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kode, nama bahan, brand, atau supplier..."
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-teal-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 font-medium"
          >
            <option value="ALL">Semua Kategori ({materials.length})</option>
            <option value="METAL">Metal / Logam</option>
            <option value="ENAMEL">Enamel & Frit</option>
            <option value="CHEMICAL">Kimia & Pretreatment</option>
            <option value="PACKAGING">Packaging</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 font-medium"
          >
            <option value="ALL">Semua Status</option>
            <option value="AVAILABLE">Tersedia (Normal)</option>
            <option value="LOW_STOCK">Stok Rendah (Warning)</option>
            <option value="OUT_OF_STOCK">Habis (Out of Stock)</option>
          </select>
        </div>

        <div className="text-slate-500 font-mono text-[11px]">
          Menampilkan {sortedMaterials.length} dari {materials.length} bahan
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th
                  onClick={() => handleSort('code')}
                  className="py-3 px-3.5 font-semibold cursor-pointer hover:text-slate-900 whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Kode Bahan</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-3.5 font-semibold cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Nama Bahan & Kategori</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3.5 font-semibold">Pemasok Utama</th>
                <th
                  onClick={() => handleSort('stock')}
                  className="py-3 px-3.5 font-semibold text-right cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Stok Fisik</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3.5 font-semibold text-right">Available</th>
                <th
                  onClick={() => handleSort('valuation')}
                  className="py-3 px-3.5 font-semibold text-right cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Valuasi Stok</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3.5 font-semibold text-center">Status</th>
                <th className="py-3 px-3.5 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedMaterials.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p>Tidak ada bahan baku yang cocok dengan kriteria filter.</p>
                  </td>
                </tr>
              ) : (
                sortedMaterials.map((m) => {
                  const available = m.currentStock - m.reservedStock;
                  const isLow = m.currentStock <= m.reorderPoint;
                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-slate-50 transition-colors group cursor-pointer"
                      onClick={() => setSelectedMaterial(m)}
                    >
                      <td className="py-3 px-3.5 font-mono font-semibold text-slate-900 whitespace-nowrap">
                        {m.code}
                      </td>
                      <td className="py-3 px-3.5 min-w-[220px]">
                        <p className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">
                          {m.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {m.category} · {m.subCategory || m.brand || 'Standar R&D'}
                        </p>
                      </td>
                      <td className="py-3 px-3.5 text-slate-600 truncate max-w-[180px]">
                        {m.supplierName}
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        {m.currentStock} {m.unit}
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono text-emerald-700 font-semibold whitespace-nowrap">
                        {available} {m.unit}
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono text-slate-800 whitespace-nowrap">
                        {formatCurrencyIDR(m.currentStock * m.unitCost)}
                      </td>
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                            m.status === 'LOW_STOCK'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : m.status === 'OUT_OF_STOCK'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {m.status === 'LOW_STOCK' ? 'Low Stock' : m.status === 'OUT_OF_STOCK' ? 'Habis' : 'Available'}
                        </span>
                      </td>
                      <td
                        className="py-3 px-3.5 text-center whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedMaterial(m)}
                            className="p-1 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded"
                            title="Detail Lengkap"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setMaterialToEdit(m);
                              setIsFormOpen(true);
                            }}
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit Bahan"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {currentUser.role === 'SUPER_ADMIN' && (
                            <button
                              onClick={() => handleDelete(m.id, m.name)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                              title="Hapus Bahan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <MaterialDetailModal
        material={selectedMaterial}
        onClose={() => setSelectedMaterial(null)}
        onEdit={(m) => {
          setSelectedMaterial(null);
          setMaterialToEdit(m);
          setIsFormOpen(true);
        }}
      />

      <MaterialFormModal
        isOpen={isFormOpen}
        materialToEdit={materialToEdit}
        onClose={() => {
          setIsFormOpen(false);
          setMaterialToEdit(null);
        }}
      />
    </div>
  );
};
