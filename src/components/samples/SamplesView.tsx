import React, { useState } from 'react';
import {
  QrCode,
  Download,
  Search,
  ScanLine,
  Layers,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Sample } from '../../types/lims';
import { useLims } from '../../context/LimsContext';
import { exportToExcel } from '../../utils/excelExport';
import { SampleQrModal } from './SampleQrModal';

export const SamplesView: React.FC = () => {
  const { samples, labTests } = useLims();

  const [search, setSearch] = useState('');
  const [selectedSampleForQR, setSelectedSampleForQR] = useState<Sample | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [scannedResult, setScannedResult] = useState<Sample | null>(null);

  const filteredSamples = samples.filter(
    (s) =>
      s.sampleCode.toLowerCase().includes(search.toLowerCase()) ||
      s.productName.toLowerCase().includes(search.toLowerCase()) ||
      s.substrateMaterial.toLowerCase().includes(search.toLowerCase()) ||
      s.storageLocation.toLowerCase().includes(search.toLowerCase())
  );

  const handleSimulateScan = (codeToScan?: string) => {
    const code = codeToScan || scannedCode;
    const found = samples.find(
      (s) => s.sampleCode.toLowerCase() === code.trim().toLowerCase()
    );
    if (found) {
      setScannedResult(found);
    } else {
      alert(`Sample dengan kode "${code}" tidak ditemukan dalam sistem.`);
    }
  };

  const handleExportExcel = () => {
    const today = new Date().toISOString().slice(0, 10);
    exportToExcel({
      fileName: `Samples_Inventory_Report_${today}.xlsx`,
      sheetName: 'Samples',
      reportTitle: 'LAPORAN DATA SAMPEL & RETENSI UJI LABORATORIUM R&D',
      data: filteredSamples.map((s) => ({
        'Kode Sample': s.sampleCode,
        'Nama Produk / Benda Uji': s.productName,
        'Project Riset': s.researchProjectTitle,
        'Substrat Metal': s.substrateMaterial,
        'Sistem Enamel': s.enamelSystem,
        'Batch': s.batchNumber,
        'Jumlah (Pcs)': s.quantity,
        'Lokasi Simpan': s.storageLocation,
        'Tanggal Dibuat': s.dateCreated,
        'Batas Retensi': s.retentionDate,
        'Status Sample': s.status,
        'Status Uji QC': s.overallTestStatus,
      })),
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Sample Management & Barcode QR Tracking
          </h1>
          <p className="text-xs text-slate-500">
            Penomoran unik benda uji, coupon plat uji rekat, lokasi penyimpanan kabinet, dan pelabelan QR
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScannerOpen((prev) => !prev)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <ScanLine className="w-3.5 h-3.5 text-teal-400" />
            <span>Scan / Lookup QR</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* QR Scanner / Lookup Simulation Panel */}
      {scannerOpen && (
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl space-y-3 animate-in fade-in duration-150 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-teal-950 flex items-center gap-2">
              <ScanLine className="w-4 h-4 text-teal-700" />
              <span>Simulasi Scanner Barcode / QR Code Sample</span>
            </span>
            <button
              onClick={() => {
                setScannerOpen(false);
                setScannedResult(null);
              }}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center gap-2 max-w-md">
            <input
              type="text"
              value={scannedCode}
              onChange={(e) => setScannedCode(e.target.value)}
              placeholder="Ketik atau scan kode sample (misal: SMP-2026-0101)..."
              className="flex-1 px-3 py-1.5 border border-teal-300 rounded-lg text-xs bg-white font-mono"
            />
            <button
              onClick={() => handleSimulateScan()}
              className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-semibold shadow-2xs transition-colors"
            >
              Cari Sample
            </button>
          </div>

          {/* Quick preset buttons for instant testing */}
          <div className="flex items-center gap-2 text-[11px] text-teal-800">
            <span>Contoh Preset Cepat:</span>
            {samples.slice(0, 3).map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setScannedCode(s.sampleCode);
                  handleSimulateScan(s.sampleCode);
                }}
                className="px-2 py-0.5 bg-white border border-teal-300 rounded font-mono hover:bg-teal-100 transition-colors"
              >
                {s.sampleCode}
              </button>
            ))}
          </div>

          {/* Lookup Result Card */}
          {scannedResult && (
            <div className="mt-3 p-3 bg-white rounded-lg border border-teal-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {scannedResult.sampleCode}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Status: {scannedResult.overallTestStatus}
                </span>
              </div>
              <p className="font-semibold text-slate-800">{scannedResult.productName}</p>
              <p className="text-slate-600">Project: {scannedResult.researchProjectTitle}</p>
              <p className="text-slate-500 font-mono text-[11px]">
                Lokasi Rak: {scannedResult.storageLocation} · Batch: {scannedResult.batchNumber}
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                <button
                  onClick={() => setSelectedSampleForQR(scannedResult)}
                  className="px-2.5 py-1 text-xs font-semibold bg-slate-800 text-white rounded hover:bg-slate-900 flex items-center gap-1"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Lihat Label QR</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search Input */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode sample, nama benda uji, lokasi rak..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-teal-500"
          />
        </div>
        <span className="text-slate-500 font-mono text-[11px]">
          {filteredSamples.length} Samples Terdata
        </span>
      </div>

      {/* Samples Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSamples.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-purple-300 transition-all flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-900 text-xs px-2 py-0.5 rounded bg-slate-100">
                  {s.sampleCode}
                </span>
                <span
                  className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                    s.overallTestStatus === 'PASS'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : s.overallTestStatus === 'PENDING'
                      ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {s.overallTestStatus}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-xs leading-snug">{s.productName}</h3>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{s.researchProjectTitle}</p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-[11px] space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-500">Substrat:</span>
                  <span className="font-medium text-slate-800">{s.substrateMaterial}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Enamel System:</span>
                  <span className="font-medium text-slate-800">{s.enamelSystem}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Lokasi Simpan:</span>
                  <span className="font-mono font-medium text-slate-900">{s.storageLocation}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-mono">{s.quantity} {s.unit}</span>
              <button
                onClick={() => setSelectedSampleForQR(s)}
                className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-md font-semibold flex items-center gap-1 transition-colors"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QR Code Label</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <SampleQrModal
        sample={selectedSampleForQR}
        onClose={() => setSelectedSampleForQR(null)}
      />
    </div>
  );
};
