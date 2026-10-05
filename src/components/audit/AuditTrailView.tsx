import React, { useState } from 'react';
import { Scale, Download, Search, Filter, ShieldCheck, Clock, User } from 'lucide-react';
import { useLims } from '../../context/LimsContext';
import { exportToExcel } from '../../utils/excelExport';

export const AuditTrailView: React.FC = () => {
  const { auditLogs } = useLims();

  const [search, setSearch] = useState('');
  const [selectedAction, setSelectedAction] = useState('ALL');
  const [selectedModule, setSelectedModule] = useState('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      log.module.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.recordIdentifier.toLowerCase().includes(search.toLowerCase());

    const matchesAction = selectedAction === 'ALL' || log.action === selectedAction;
    const matchesModule = selectedModule === 'ALL' || log.module === selectedModule;

    return matchesSearch && matchesAction && matchesModule;
  });

  const handleExportExcel = () => {
    const today = new Date().toISOString().slice(0, 10);
    exportToExcel({
      fileName: `Audit_Trail_Log_${today}.xlsx`,
      sheetName: 'Audit Trail',
      reportTitle: 'LAPORAN AUDIT TRAIL AKTIVITAS & KEPATUHAN SISTEM LIMS',
      data: filteredLogs.map((l) => ({
        'Timestamp': l.timestamp,
        'User': l.userName,
        'Role': l.userRole,
        'Aksi': l.action,
        'Modul': l.module,
        'ID Record': l.recordId,
        'Identifier': l.recordIdentifier,
        'State Sebelum': l.beforeState || '-',
        'State Sesudah': l.afterState || '-',
        'Detail Transaksi': l.details,
        'IP Address': l.ipAddress,
      })),
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Audit Trail & Log Kepatuhan Sistem
          </h1>
          <p className="text-xs text-slate-500">
            Pencatatan mutlak dan tidak dapat diubah (immutable) terhadap setiap aksi create, update, delete, approval, dan mutasi stok
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
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari user, modul, kode item, detail..."
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 font-medium"
          >
            <option value="ALL">Semua Aksi</option>
            <option value="CREATE">CREATE (Buat)</option>
            <option value="UPDATE">UPDATE (Ubah)</option>
            <option value="DELETE">DELETE (Hapus)</option>
            <option value="APPROVE">APPROVE (Setujui)</option>
            <option value="STOCK_IN">STOCK_IN</option>
            <option value="STOCK_OUT">STOCK_OUT</option>
          </select>
        </div>

        <span className="text-slate-500 font-mono text-[11px]">
          {filteredLogs.length} Baris Log Tercatat
        </span>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-3.5 font-semibold">Timestamp</th>
                <th className="py-3 px-3.5 font-semibold">Pengguna & Role</th>
                <th className="py-3 px-3.5 font-semibold">Modul</th>
                <th className="py-3 px-3.5 font-semibold">Aksi</th>
                <th className="py-3 px-3.5 font-semibold">Deskripsi Aktivitas</th>
                <th className="py-3 px-3.5 font-semibold">Perubahan State (Before → After)</th>
                <th className="py-3 px-3.5 font-semibold">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3.5 font-mono text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <span className="font-semibold text-slate-900 block">{log.userName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{log.userRole}</span>
                  </td>
                  <td className="py-3 px-3.5 font-medium text-slate-700 whitespace-nowrap">{log.module}</td>
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded font-mono ${
                        log.action === 'CREATE'
                          ? 'bg-emerald-50 text-emerald-700'
                          : log.action === 'APPROVE'
                          ? 'bg-blue-50 text-blue-700'
                          : log.action === 'STOCK_OUT'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-slate-800 min-w-[200px] leading-relaxed">
                    {log.details}
                  </td>
                  <td className="py-3 px-3.5 font-mono text-[11px] text-slate-500 min-w-[180px]">
                    {log.beforeState || log.afterState ? (
                      <div>
                        {log.beforeState && <p className="text-rose-600 line-through">B: {log.beforeState}</p>}
                        {log.afterState && <p className="text-emerald-700">A: {log.afterState}</p>}
                      </div>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="py-3 px-3.5 font-mono text-slate-400 whitespace-nowrap">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
