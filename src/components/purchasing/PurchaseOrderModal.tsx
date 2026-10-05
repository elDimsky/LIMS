import React, { useState } from 'react';
import { X, Plus, Trash2, ShoppingCart, Check, FileSpreadsheet } from 'lucide-react';
import { POItem } from '../../types/lims';
import { useLims } from '../../context/LimsContext';
import { formatCurrencyIDR } from '../../utils/formatters';

interface PurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PurchaseOrderModal: React.FC<PurchaseOrderModalProps> = ({ isOpen, onClose }) => {
  const { suppliers, materials, createPurchaseOrder, currentUser } = useLims();

  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [poDate, setPoDate] = useState(new Date().toISOString().slice(0, 10));
  const [expectedDelivery, setExpectedDelivery] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState('Pengadaan bahan formulasi & plat uji coba R&D.');

  // Items line list
  const [items, setItems] = useState<POItem[]>([
    {
      id: `POI-${Date.now()}`,
      materialId: materials[0]?.id || '',
      materialName: materials[0]?.name || '',
      materialCode: materials[0]?.code || '',
      quantity: 100,
      unit: materials[0]?.unit || 'KG',
      unitPrice: materials[0]?.unitCost || 50000,
      totalPrice: (materials[0]?.unitCost || 50000) * 100,
      receivedQuantity: 0,
    },
  ]);

  if (!isOpen) return null;

  const selectedSupplier = suppliers.find((s) => s.id === supplierId) || suppliers[0];

  const handleAddItem = () => {
    const mat = materials[0];
    if (!mat) return;
    setItems((prev) => [
      ...prev,
      {
        id: `POI-${Date.now()}-${prev.length}`,
        materialId: mat.id,
        materialName: mat.name,
        materialCode: mat.code,
        quantity: 50,
        unit: mat.unit,
        unitPrice: mat.unitCost,
        totalPrice: mat.unitCost * 50,
        receivedQuantity: 0,
      },
    ]);
  };

  const handleItemChange = (index: number, field: string, val: any) => {
    setItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };

      if (field === 'materialId') {
        const mat = materials.find((m) => m.id === val);
        if (mat) {
          item.materialId = mat.id;
          item.materialName = mat.name;
          item.materialCode = mat.code;
          item.unit = mat.unit;
          item.unitPrice = mat.unitCost;
          item.totalPrice = item.quantity * mat.unitCost;
        }
      } else if (field === 'quantity') {
        item.quantity = Number(val);
        item.totalPrice = Number(val) * item.unitPrice;
      } else if (field === 'unitPrice') {
        item.unitPrice = Number(val);
        item.totalPrice = item.quantity * Number(val);
      }

      updated[index] = item;
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const subTotal = items.reduce((acc, i) => acc + i.totalPrice, 0);
  const tax = Math.round(subTotal * 0.11); // PPN 11%
  const grandTotal = subTotal + tax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    createPurchaseOrder({
      supplierId: selectedSupplier.id,
      supplierName: selectedSupplier.name,
      poDate,
      expectedDelivery,
      items,
      subTotal,
      tax,
      grandTotal,
      paymentStatus: 'UNPAID',
      deliveryStatus: currentUser.role === 'SUPER_ADMIN' ? 'ORDERED' : 'SUBMITTED',
      requestedBy: currentUser.name,
      approvedBy: currentUser.role === 'SUPER_ADMIN' ? currentUser.name : undefined,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-indigo-50/50">
          <div className="flex items-center gap-2.5">
            <ShoppingCart className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">Buat Purchase Order (PO) Baru</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pilih Supplier *</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal PO *</label>
              <input
                type="date"
                value={poDate}
                onChange={(e) => setPoDate(e.target.value)}
                required
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Estimasi Tiba (Delivery) *</label>
              <input
                type="date"
                value={expectedDelivery}
                onChange={(e) => setExpectedDelivery(e.target.value)}
                required
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          {/* PO Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 uppercase tracking-wider text-[11px]">
                Daftar Barang Pesanan
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-50 border border-indigo-200 rounded-md flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Baris</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Bahan Baku</th>
                    <th className="py-2 px-3 w-24">Jumlah</th>
                    <th className="py-2 px-3 w-16">Satuan</th>
                    <th className="py-2 px-3 w-32">Harga Satuan (IDR)</th>
                    <th className="py-2 px-3 text-right">Subtotal</th>
                    <th className="py-2 px-2 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3">
                        <select
                          value={item.materialId}
                          onChange={(e) => handleItemChange(index, 'materialId', e.target.value)}
                          className="w-full px-2 py-1 border border-slate-300 rounded text-xs bg-white"
                        >
                          {materials.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.code} - {m.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          min={1}
                          className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono font-bold"
                        />
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-600">{item.unit}</td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                          min={0}
                          className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono"
                        />
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        {formatCurrencyIDR(item.totalPrice)}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          disabled={items.length === 1}
                          className="text-slate-400 hover:text-rose-600 disabled:opacity-30 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Calculations */}
          <div className="flex justify-end pt-2">
            <div className="w-72 bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 font-mono text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>{formatCurrencyIDR(subTotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>PPN (11%):</span>
                <span>{formatCurrencyIDR(tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-1.5 border-t border-slate-200 text-sm">
                <span>Grand Total:</span>
                <span className="text-indigo-700">{formatCurrencyIDR(grandTotal)}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Catatan Purchase Order</label>
            <textarea
              rows={2}
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
              className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Simpan & Terbitkan PO</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
