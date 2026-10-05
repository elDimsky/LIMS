import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Package,
  FolderGit2,
  Beaker,
  QrCode,
  FileSpreadsheet,
  Building2,
  Atom,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { useLims } from '../../context/LimsContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectItem?: (type: string, id: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onSelectItem }) => {
  const {
    materials,
    researchProjects,
    experiments,
    samples,
    purchaseOrders,
    suppliers,
    formulas,
    setActiveTab,
  } = useLims();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Global keydown listener for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  // Filter entities
  const filteredMaterials = q
    ? materials.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.code.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q)
      ).slice(0, 4)
    : [];

  const filteredProjects = q
    ? researchProjects.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.productTarget.toLowerCase().includes(q)
      ).slice(0, 4)
    : [];

  const filteredExperiments = q
    ? experiments.filter(
        (e) =>
          e.experimentNumber.toLowerCase().includes(q) ||
          e.objective.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const filteredSamples = q
    ? samples.filter(
        (s) =>
          s.sampleCode.toLowerCase().includes(q) ||
          s.productName.toLowerCase().includes(q) ||
          s.substrateMaterial.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const filteredPOs = q
    ? purchaseOrders.filter(
        (po) =>
          po.poNumber.toLowerCase().includes(q) ||
          po.supplierName.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const filteredFormulas = q
    ? formulas.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.code.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const hasResults =
    filteredMaterials.length > 0 ||
    filteredProjects.length > 0 ||
    filteredExperiments.length > 0 ||
    filteredSamples.length > 0 ||
    filteredPOs.length > 0 ||
    filteredFormulas.length > 0;

  const handleSelect = (tab: string) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-slate-200 flex items-center gap-3 bg-slate-50/50">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari master bahan, project R&D, eksperimen, sample barcode, PO..."
            className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white text-slate-500 border border-slate-200 rounded">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {!q && (
            <div className="py-8 text-center text-slate-400 text-xs">
              <Search className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
              <p>Ketik kata kunci untuk mencari data di seluruh departemen R&D</p>
              <div className="mt-4 flex flex-wrap justify-center gap-1.5 text-[11px] text-slate-500">
                <span className="px-2 py-0.5 bg-slate-100 rounded">Aluminium</span>
                <span className="px-2 py-0.5 bg-slate-100 rounded">Wajan Wok</span>
                <span className="px-2 py-0.5 bg-slate-100 rounded">Enamel Frit G12</span>
                <span className="px-2 py-0.5 bg-slate-100 rounded">Dutch Oven</span>
                <span className="px-2 py-0.5 bg-slate-100 rounded">PO-2026</span>
              </div>
            </div>
          )}

          {q && !hasResults && (
            <div className="py-8 text-center text-slate-400 text-xs">
              <p>Tidak ada data yang cocok dengan "{query}"</p>
            </div>
          )}

          {/* Materials Section */}
          {filteredMaterials.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 px-2">
                Raw Materials ({filteredMaterials.length})
              </div>
              <div className="space-y-1">
                {filteredMaterials.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleSelect('materials')}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
                        <Package className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 group-hover:text-teal-700 truncate">
                          {m.name}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {m.code} · Stok: {m.currentStock} {m.unit}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Research Projects */}
          {filteredProjects.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 px-2">
                Research Projects ({filteredProjects.length})
              </div>
              <div className="space-y-1">
                {filteredProjects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelect('research')}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
                        <FolderGit2 className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 group-hover:text-blue-700 truncate">
                          {p.title}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {p.code} · Target: {p.productTarget}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Experiments */}
          {filteredExperiments.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 px-2">
                Experiments ({filteredExperiments.length})
              </div>
              <div className="space-y-1">
                {filteredExperiments.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => handleSelect('experiments')}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
                        <Beaker className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {e.experimentNumber}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {e.objective}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Samples */}
          {filteredSamples.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 px-2">
                Samples & QR ({filteredSamples.length})
              </div>
              <div className="space-y-1">
                {filteredSamples.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelect('samples')}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-100">
                        <QrCode className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {s.sampleCode} - {s.productName}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          Lokasi: {s.storageLocation}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Purchase Orders */}
          {filteredPOs.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 px-2">
                Purchase Orders ({filteredPOs.length})
              </div>
              <div className="space-y-1">
                {filteredPOs.map((po) => (
                  <button
                    key={po.id}
                    onClick={() => handleSelect('purchase_orders')}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {po.poNumber} · {po.supplierName}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Status: {po.deliveryStatus} · Total: Rp {po.grandTotal.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-2.5 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between px-4">
          <span>Gunakan panah atau klik untuk navigasi cepat</span>
          <span className="font-mono">EnamelCook Integrated System</span>
        </div>
      </div>
    </div>
  );
};
