import React, { useState, useEffect } from 'react';
import { X, Package, Check, AlertCircle } from 'lucide-react';
import { Material, MaterialCategory } from '../../types/lims';
import { useLims } from '../../context/LimsContext';

interface MaterialFormModalProps {
  isOpen: boolean;
  materialToEdit: Material | null;
  onClose: () => void;
}

export const MaterialFormModal: React.FC<MaterialFormModalProps> = ({
  isOpen,
  materialToEdit,
  onClose,
}) => {
  const { suppliers, addMaterial, updateMaterial } = useLims();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MaterialCategory>('METAL');
  const [subCategory, setSubCategory] = useState('');
  const [description, setDescription] = useState('');
  const [specification, setSpecification] = useState('');
  const [brand, setBrand] = useState('');
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [unit, setUnit] = useState('KG');
  const [minimumStock, setMinimumStock] = useState(100);
  const [maximumStock, setMaximumStock] = useState(1000);
  const [currentStock, setCurrentStock] = useState(250);
  const [unitCost, setUnitCost] = useState(50000);
  const [reorderPoint, setReorderPoint] = useState(150);
  const [safetyStock, setSafetyStock] = useState(50);
  const [batchNumber, setBatchNumber] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  const [manufacturingDate, setManufacturingDate] = useState('2026-01-10');
  const [expiryDate, setExpiryDate] = useState('2030-12-31');
  const [storageLocation, setStorageLocation] = useState('Gudang R&D Rak A-01');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (materialToEdit) {
      setCode(materialToEdit.code);
      setName(materialToEdit.name);
      setCategory(materialToEdit.category);
      setSubCategory(materialToEdit.subCategory);
      setDescription(materialToEdit.description);
      setSpecification(materialToEdit.specification);
      setBrand(materialToEdit.brand);
      setSupplierId(materialToEdit.supplierId);
      setUnit(materialToEdit.unit);
      setMinimumStock(materialToEdit.minimumStock);
      setMaximumStock(materialToEdit.maximumStock);
      setCurrentStock(materialToEdit.currentStock);
      setUnitCost(materialToEdit.unitCost);
      setReorderPoint(materialToEdit.reorderPoint);
      setSafetyStock(materialToEdit.safetyStock);
      setBatchNumber(materialToEdit.batchNumber);
      setLotNumber(materialToEdit.lotNumber);
      setManufacturingDate(materialToEdit.manufacturingDate);
      setExpiryDate(materialToEdit.expiryDate);
      setStorageLocation(materialToEdit.storageLocation);
    } else {
      // Defaults for new item
      setCode(`MAT-${category.slice(0, 3)}-${Date.now().toString().slice(-3)}`);
      setName('');
      setSubCategory('');
      setDescription('');
      setSpecification('');
      setBrand('');
      setBatchNumber(`B-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`);
      setLotNumber(`LOT-${Date.now().toString().slice(-4)}`);
    }
    setErrorMsg('');
  }, [materialToEdit, isOpen, category]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setErrorMsg('Nama bahan dan Kode Bahan wajib diisi.');
      return;
    }

    const selectedSupplier = suppliers.find((s) => s.id === supplierId);
    const supplierName = selectedSupplier ? selectedSupplier.name : 'Supplier R&D';

    if (materialToEdit) {
      updateMaterial({
        ...materialToEdit,
        code,
        name,
        category,
        subCategory,
        description,
        specification,
        brand,
        supplierId,
        supplierName,
        unit,
        minimumStock: Number(minimumStock),
        maximumStock: Number(maximumStock),
        currentStock: Number(currentStock),
        unitCost: Number(unitCost),
        reorderPoint: Number(reorderPoint),
        safetyStock: Number(safetyStock),
        batchNumber,
        lotNumber,
        manufacturingDate,
        expiryDate,
        storageLocation,
      });
    } else {
      addMaterial({
        code,
        name,
        category,
        subCategory,
        description,
        specification,
        brand,
        supplierId,
        supplierName,
        unit,
        minimumStock: Number(minimumStock),
        maximumStock: Number(maximumStock),
        currentStock: Number(currentStock),
        reservedStock: 0,
        unitCost: Number(unitCost),
        reorderPoint: Number(reorderPoint),
        safetyStock: Number(safetyStock),
        batchNumber,
        lotNumber,
        manufacturingDate,
        expiryDate,
        storageLocation,
        status: Number(currentStock) <= Number(reorderPoint) ? 'LOW_STOCK' : 'AVAILABLE',
        createdBy: '',
        updatedBy: '',
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <Package className="w-5 h-5 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-900">
              {materialToEdit ? 'Edit Master Bahan Baku' : 'Tambah Bahan Baku Baru'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Row 1: Code, Category, Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kode Bahan *</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kategori *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MaterialCategory)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
              >
                <option value="METAL">METAL (Aluminium, SUS, Steel, Cast Iron)</option>
                <option value="ENAMEL">ENAMEL (Frit, Pigment, Additive, Binder)</option>
                <option value="CHEMICAL">CHEMICAL (Degreaser, Acid, Nickel Bath)</option>
                <option value="PACKAGING">PACKAGING</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Sub Kategori</label>
              <input
                type="text"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                placeholder="misal: Frit Ground Coat"
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Row 2: Name & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Nama Bahan Baku *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="misal: Ground Coat Enamel Frit G-12"
                required
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Brand / Merek</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="misal: Pemco / Ferro"
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Row 3: Description & Spec */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Deskripsi Material</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsi penggunaan untuk alat masak..."
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Spesifikasi Teknis</label>
              <textarea
                rows={2}
                value={specification}
                onChange={(e) => setSpecification(e.target.value)}
                placeholder="Ketebalan, suhu firing, kemurnian..."
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Row 4: Supplier & Unit Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Pemasok Utama (Supplier)</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Estimasi Harga Satuan (IDR)</label>
              <input
                type="number"
                value={unitCost}
                onChange={(e) => setUnitCost(Number(e.target.value))}
                min={0}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          {/* Row 5: Stock Thresholds */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
            <span className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider block">
              Pengaturan Batas Stok & Satuan
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="block font-medium text-slate-600 mb-1">Satuan (Unit)</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  <option value="KG">KG</option>
                  <option value="L">L (Liter)</option>
                  <option value="Pcs">Pcs</option>
                  <option value="Sheet">Sheet</option>
                  <option value="Gram">Gram</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Stok Saat Ini</label>
                <input
                  type="number"
                  value={currentStock}
                  onChange={(e) => setCurrentStock(Number(e.target.value))}
                  min={0}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Min. Stock</label>
                <input
                  type="number"
                  value={minimumStock}
                  onChange={(e) => setMinimumStock(Number(e.target.value))}
                  min={0}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Reorder Point</label>
                <input
                  type="number"
                  value={reorderPoint}
                  onChange={(e) => setReorderPoint(Number(e.target.value))}
                  min={0}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Safety Stock</label>
                <input
                  type="number"
                  value={safetyStock}
                  onChange={(e) => setSafetyStock(Number(e.target.value))}
                  min={0}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Row 6: Location & Batching */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Lokasi Penyimpanan</label>
              <input
                type="text"
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value)}
                placeholder="misal: Gudang R&D Rak B-02"
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
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

          {/* Row 7: Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Manufaktur</label>
              <input
                type="date"
                value={manufacturingDate}
                onChange={(e) => setManufacturingDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
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

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
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
              <span>{materialToEdit ? 'Simpan Perubahan' : 'Tambah Bahan Baku'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
