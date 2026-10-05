import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  FolderGit2,
  Sliders,
  Atom,
  ShoppingCart,
  Trash2,
  FileCheck,
} from 'lucide-react';
import { ApprovalItem } from '../../types/lims';
import { useLims } from '../../context/LimsContext';

export const ApprovalsView: React.FC = () => {
  const { approvals, approveItem, rejectItem, currentUser } = useLims();

  const [filterStatus, setFilterStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');
  const [rejectingItem, setRejectingItem] = useState<ApprovalItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const filteredApprovals = approvals.filter((a) => {
    if (filterStatus === 'ALL') return true;
    return a.status === filterStatus;
  });

  const pendingCount = approvals.filter((a) => a.status === 'PENDING').length;

  const handleConfirmReject = () => {
    if (!rejectingItem || !rejectReason.trim()) return;
    rejectItem(rejectingItem.id, rejectReason);
    setRejectingItem(null);
    setRejectReason('');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'RESEARCH_PROJECT':
        return <FolderGit2 className="w-4 h-4 text-blue-600" />;
      case 'STOCK_ADJUSTMENT':
        return <Sliders className="w-4 h-4 text-indigo-600" />;
      case 'FORMULA':
        return <Atom className="w-4 h-4 text-teal-600" />;
      case 'PURCHASE_REQUEST':
        return <ShoppingCart className="w-4 h-4 text-amber-600" />;
      case 'WASTE_DISPOSAL':
        return <Trash2 className="w-4 h-4 text-rose-600" />;
      default:
        return <FileCheck className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Supervisor Approval & Otorisasi Center
          </h1>
          <p className="text-xs text-slate-500">
            Pusat validasi dan pengesahan permohonan riset baru, penyesuaian stok opname, formula, dan pembuangan limbah B3
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold font-mono">
            {pendingCount} Permohonan Pending
          </span>
        </div>
      </div>

      {currentUser.role !== 'SUPER_ADMIN' && (
        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-amber-900 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Hanya Super Admin / Supervisor R&D (<strong>Ayu Jamilatul Janah</strong>) yang memiliki kewenangan menyetujui (Approve) atau menolak (Reject) permohonan ini.
          </span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-2 text-xs">
        <button
          onClick={() => setFilterStatus('PENDING')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            filterStatus === 'PENDING'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Menunggu Review ({pendingCount})
        </button>
        <button
          onClick={() => setFilterStatus('APPROVED')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            filterStatus === 'APPROVED'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Telah Disetujui ({approvals.filter((a) => a.status === 'APPROVED').length})
        </button>
        <button
          onClick={() => setFilterStatus('REJECTED')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            filterStatus === 'REJECTED'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Ditolak ({approvals.filter((a) => a.status === 'REJECTED').length})
        </button>
        <button
          onClick={() => setFilterStatus('ALL')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            filterStatus === 'ALL'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Semua Riwayat ({approvals.length})
        </button>
      </div>

      {/* Approvals Cards List */}
      <div className="space-y-3">
        {filteredApprovals.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
            <p className="font-semibold text-slate-700">Tidak ada data approval pada filter ini</p>
          </div>
        ) : (
          filteredApprovals.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-slate-50 border border-slate-200">
                    {getTypeIcon(app.type)}
                  </div>
                  <div>
                    <span className="font-mono text-[10px] text-slate-400 block font-semibold">
                      {app.type.replace(/_/g, ' ')} · {app.referenceNumber}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{app.title}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold rounded-full border ${
                      app.status === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : app.status === 'REJECTED'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {app.status}
                  </span>
                  <span className="font-mono text-slate-400 text-[11px]">{app.requestDate}</span>
                </div>
              </div>

              {/* Details Box */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
                <p className="text-slate-500">
                  <strong className="text-slate-700">Pemohon (Requester):</strong> {app.requesterName}
                </p>
                {Object.entries(app.details).map(([k, v]) => (
                  <p key={k} className="text-slate-600">
                    <strong className="text-slate-700 capitalize">{k}:</strong> {String(v)}
                  </p>
                ))}
                {app.reviewComments && (
                  <div className="pt-2 border-t border-slate-200 text-teal-800 text-[11px] italic">
                    <strong>Catatan Supervisor:</strong> "{app.reviewComments}"
                  </div>
                )}
              </div>

              {/* Action Buttons for Super Admin */}
              {app.status === 'PENDING' && (
                <div className="flex items-center justify-end gap-2 pt-1">
                  {currentUser.role === 'SUPER_ADMIN' ? (
                    <>
                      <button
                        onClick={() => {
                          setRejectingItem(app);
                          setRejectReason('');
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Tolak Permohonan</span>
                      </button>
                      <button
                        onClick={() => approveItem(app.id, 'Disetujui oleh Supervisor R&D.')}
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Setujui (Approve)</span>
                      </button>
                    </>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">
                      Hanya Supervisor Ayu Jamilatul Janah yang dapat melakukan approval.
                    </span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Reject Reason Modal */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-rose-50">
              <span className="font-bold text-rose-900 text-xs">Penolakan Permohonan</span>
              <button onClick={() => setRejectingItem(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs">
              <p className="font-semibold text-slate-800">{rejectingItem.title}</p>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Alasan Penolakan (Wajib Diisi) *
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Jelaskan alasan permohonan ditolak atau perlu revisi..."
                  required
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingItem(null)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  disabled={!rejectReason.trim()}
                  className="px-4 py-1.5 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded shadow-xs disabled:opacity-50"
                >
                  Konfirmasi Tolak
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
