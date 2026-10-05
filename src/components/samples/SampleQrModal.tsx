import React from 'react';
import { X, QrCode, Printer, Download, CheckCircle2 } from 'lucide-react';
import { Sample } from '../../types/lims';
import { formatDate } from '../../utils/formatters';

interface SampleQrModalProps {
  sample: Sample | null;
  onClose: () => void;
}

export const SampleQrModal: React.FC<SampleQrModalProps> = ({ sample, onClose }) => {
  if (!sample) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8">
        <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-purple-50/50">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-purple-600" />
            <h2 className="text-xs font-bold text-slate-900">QR Code Label Sample R&D</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 text-center space-y-4">
          {/* Printable Label Box */}
          <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 space-y-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              PT Kencana Enamel Nusantara · R&D Lab
            </div>

            {/* Simulated High-Res QR SVG */}
            <div className="w-44 h-44 mx-auto bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
                {/* SVG pattern representing realistic QR */}
                <rect x="5" y="5" width="25" height="25" fill="currentColor" rx="2" />
                <rect x="9" y="9" width="17" height="17" fill="white" />
                <rect x="13" y="13" width="9" height="9" fill="currentColor" />

                <rect x="70" y="5" width="25" height="25" fill="currentColor" rx="2" />
                <rect x="74" y="9" width="17" height="17" fill="white" />
                <rect x="78" y="13" width="9" height="9" fill="currentColor" />

                <rect x="5" y="70" width="25" height="25" fill="currentColor" rx="2" />
                <rect x="9" y="74" width="17" height="17" fill="white" />
                <rect x="13" y="78" width="9" height="9" fill="currentColor" />

                {/* Random QR matrix blocks */}
                <rect x="35" y="10" width="8" height="8" fill="currentColor" />
                <rect x="48" y="10" width="14" height="6" fill="currentColor" />
                <rect x="35" y="24" width="6" height="14" fill="currentColor" />
                <rect x="45" y="22" width="18" height="6" fill="currentColor" />
                <rect x="10" y="38" width="16" height="6" fill="currentColor" />
                <rect x="32" y="38" width="8" height="8" fill="currentColor" />
                <rect x="46" y="36" width="12" height="10" fill="currentColor" />
                <rect x="64" y="38" width="14" height="6" fill="currentColor" />
                <rect x="82" y="36" width="8" height="8" fill="currentColor" />

                <rect x="35" y="52" width="12" height="8" fill="currentColor" />
                <rect x="52" y="50" width="8" height="14" fill="currentColor" />
                <rect x="68" y="52" width="22" height="8" fill="currentColor" />

                <rect x="38" y="66" width="14" height="8" fill="currentColor" />
                <rect x="60" y="68" width="12" height="12" fill="currentColor" />
                <rect x="78" y="66" width="12" height="8" fill="currentColor" />

                <rect x="35" y="80" width="8" height="10" fill="currentColor" />
                <rect x="48" y="82" width="16" height="8" fill="currentColor" />
                <rect x="70" y="82" width="20" height="8" fill="currentColor" />
              </svg>
            </div>

            <div>
              <p className="font-mono font-bold text-slate-900 text-sm">{sample.sampleCode}</p>
              <p className="text-xs font-semibold text-slate-800 line-clamp-1">{sample.productName}</p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">{sample.storageLocation}</p>
            </div>

            <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-400 font-mono flex justify-between">
              <span>Tgl: {sample.dateCreated}</span>
              <span>Retensi: {sample.retentionDate}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Label Barcode</span>
            </button>
            <button
              onClick={() => alert(`Mengunduh file barcode image untuk ${sample.sampleCode}`)}
              className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>SVG / PNG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
