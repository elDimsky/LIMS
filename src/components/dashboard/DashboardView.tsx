import React from 'react';
import {
  Package,
  FolderGit2,
  ShoppingCart,
  Trash2,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Activity,
  Layers,
  ChevronRight,
  Flame,
  Award,
} from 'lucide-react';
import { useLims } from '../../context/LimsContext';
import { formatCurrencyIDR, formatDate, formatNumber } from '../../utils/formatters';

interface DashboardViewProps {
  onQuickAction: (actionType: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onQuickAction }) => {
  const {
    currentUser,
    materials,
    researchProjects,
    experiments,
    labTests,
    purchaseOrders,
    purchaseRequests,
    wasteRecords,
    approvals,
    auditLogs,
    setActiveTab,
    approveItem,
    rejectItem,
  } = useLims();

  // Metrics calculations
  const totalMaterials = materials.length;
  const lowStockCount = materials.filter((m) => m.status === 'LOW_STOCK').length;
  const outOfStockCount = materials.filter((m) => m.status === 'OUT_OF_STOCK').length;
  const totalStockValue = materials.reduce((acc, m) => acc + m.currentStock * m.unitCost, 0);

  const activeProjectsCount = researchProjects.filter(
    (p) => p.status === 'PLANNING' || p.status === 'EXPERIMENT' || p.status === 'TESTING' || p.status === 'REVIEW'
  ).length;
  const completedProjectsCount = researchProjects.filter((p) => p.status === 'COMPLETED' || p.status === 'APPROVED').length;

  const successfulExperiments = experiments.filter((e) => e.success).length;
  const failedExperiments = experiments.filter((e) => !e.success).length;

  const pendingApprovals = approvals.filter((a) => a.status === 'PENDING');
  const pendingPOCount = purchaseOrders.filter((po) => po.deliveryStatus === 'ORDERED' || po.deliveryStatus === 'DRAFT').length;
  const totalPurchaseCost = purchaseOrders.reduce((acc, po) => acc + po.grandTotal, 0);

  const totalWasteKg = wasteRecords
    .filter((w) => w.unit === 'KG')
    .reduce((acc, w) => acc + w.quantity, 0);
  const totalWasteLiter = wasteRecords
    .filter((w) => w.unit === 'L')
    .reduce((acc, w) => acc + w.quantity, 0);
  const totalWasteCost = wasteRecords.reduce((acc, w) => acc + w.estimatedDisposalCost, 0);
  const totalSavingCost = wasteRecords
    .filter((w) => w.isRecycled)
    .reduce((acc, w) => acc + (w.savingCost || 0), 0);

  const labPassedTests = labTests.filter((t) => t.status === 'PASS').length;
  const labTotalTests = labTests.length;
  const labPassRate = labTotalTests > 0 ? Math.round((labPassedTests / labTotalTests) * 100) : 100;

  // Alerts array
  const activeAlerts: { id: string; title: string; desc: string; type: 'danger' | 'warning' | 'info'; actionTab: string }[] = [];
  if (lowStockCount > 0) {
    activeAlerts.push({
      id: 'alt-low',
      title: `${lowStockCount} Bahan Baku Mendekati Reorder Point`,
      desc: 'Plat Baja SPCE dan Nikel Sulfat berada di bawah safety threshold. Perlu segera diproses PO.',
      type: 'warning',
      actionTab: 'materials',
    });
  }
  if (pendingApprovals.length > 0) {
    activeAlerts.push({
      id: 'alt-app',
      title: `${pendingApprovals.length} Berkas Menunggu Persetujuan Supervisor`,
      desc: 'Terdapat pengajuan Proposal Riset, Penyesuaian Stok Opname, dan Pembuangan Limbah.',
      type: 'info',
      actionTab: 'approvals',
    });
  }

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 rounded-xl p-6 text-white border border-slate-700 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none hidden md:block">
          <img
            src="/src/assets/images/cookware_enamel_lab_1790755736227.jpg"
            alt="Cookware Lab"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-right"
          />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-teal-500/20 text-teal-300 text-xs font-medium border border-teal-500/30 mb-3">
            <Flame className="w-3.5 h-3.5 text-teal-400" />
            <span>Integrated Cookware & Enamel Coating R&D Laboratory</span>
          </div>

          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            {currentUser.name === 'Ayu Jamilatul Janah' ? 'Good Morning, Ayu 👋' : `Welcome back, ${currentUser.name}`}
          </h1>
          <p className="text-xs md:text-sm text-slate-300 mt-1 leading-relaxed">
            Here's your R&D overview today. Sistem terintegrasi mengelola formulasi enamel, pengujian mekanis alat masak, stok bahan, hingga kepatuhan limbah B3.
          </p>

          {/* Quick Action Button Group */}
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={() => onQuickAction('new_research')}
              className="px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white text-xs font-medium rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Research</span>
            </button>
            <button
              onClick={() => onQuickAction('new_material')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-600 transition-colors flex items-center gap-1.5"
            >
              <Package className="w-3.5 h-3.5" />
              <span>Add Material</span>
            </button>
            <button
              onClick={() => onQuickAction('stock_in')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-600 transition-colors flex items-center gap-1.5"
            >
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
              <span>Stock In</span>
            </button>
            <button
              onClick={() => onQuickAction('stock_out')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-600 transition-colors flex items-center gap-1.5"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
              <span>Stock Out</span>
            </button>
            <button
              onClick={() => onQuickAction('new_experiment')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-600 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              <span>New Experiment</span>
            </button>
            <button
              onClick={() => onQuickAction('purchase_request')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-600 transition-colors flex items-center gap-1.5"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-indigo-400" />
              <span>Purchase Request</span>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-600 transition-colors flex items-center gap-1.5"
            >
              <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
              <span>Generate Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Alerts Bar */}
      {activeAlerts.length > 0 && (
        <div className="space-y-2">
          {activeAlerts.map((alt) => (
            <div
              key={alt.id}
              className={`p-3.5 rounded-lg border flex items-center justify-between gap-4 transition-colors ${
                alt.type === 'warning'
                  ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                  : 'bg-blue-50/70 border-blue-200 text-blue-900'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <AlertTriangle
                  className={`w-4 h-4 shrink-0 ${
                    alt.type === 'warning' ? 'text-amber-600' : 'text-blue-600'
                  }`}
                />
                <div className="min-w-0 text-xs">
                  <span className="font-semibold">{alt.title}</span>
                  <span className="hidden sm:inline text-slate-600 ml-2">— {alt.desc}</span>
                </div>
              </div>
              <button
                onClick={() => setActiveTab(alt.actionTab)}
                className="px-2.5 py-1 text-xs font-medium bg-white hover:bg-slate-50 border border-slate-300 rounded shadow-2xs whitespace-nowrap text-slate-700 transition-colors shrink-0"
              >
                Tindak Lanjuti →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 4 Main Core KPI Clusters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Inventory */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Inventory & Raw Materials
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {formatCurrencyIDR(totalStockValue)}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
              <span>{totalMaterials} Master Bahan</span>
              <span aria-hidden="true">·</span>
              <span className={lowStockCount > 0 ? 'text-amber-600 font-semibold' : ''}>
                {lowStockCount} Low Stock
              </span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Stock In Bulan Ini: 250 KG</span>
            <button
              onClick={() => setActiveTab('materials')}
              className="text-teal-600 hover:underline font-medium"
            >
              Lihat Detail
            </button>
          </div>
        </div>

        {/* KPI 2: Research */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Research & Experiments
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {activeProjectsCount} Active
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
              <span className="text-emerald-600 font-medium">{successfulExperiments} Eksperimen Sukses</span>
              <span aria-hidden="true">·</span>
              <span>{labPassRate}% QC Pass</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{completedProjectsCount} Selesai / Arsip</span>
            <button
              onClick={() => setActiveTab('research')}
              className="text-blue-600 hover:underline font-medium"
            >
              Lihat Project
            </button>
          </div>
        </div>

        {/* KPI 3: Purchasing */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Purchasing & Supply
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {formatCurrencyIDR(totalPurchaseCost)}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
              <span>{purchaseOrders.length} Purchase Orders</span>
              <span aria-hidden="true">·</span>
              <span className="text-indigo-600 font-medium">{pendingPOCount} In Delivery</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{purchaseRequests.length} Requests Diajukan</span>
            <button
              onClick={() => setActiveTab('purchase_orders')}
              className="text-indigo-600 hover:underline font-medium"
            >
              Lihat PO
            </button>
          </div>
        </div>

        {/* KPI 4: Waste Management */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Waste & Environment
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-100">
              <Trash2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {totalWasteKg} KG + {totalWasteLiter} L
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs">
              <span className="text-slate-500">Biaya: {formatCurrencyIDR(totalWasteCost)}</span>
              {totalSavingCost > 0 && (
                <>
                  <span className="text-slate-300" aria-hidden="true">·</span>
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    Saving: +{formatCurrencyIDR(totalSavingCost)}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Manifest PT Wastec: Aktif</span>
            <button
              onClick={() => setActiveTab('waste')}
              className="text-rose-600 hover:underline font-medium"
            >
              Kelola Limbah
            </button>
          </div>
        </div>
      </div>

      {/* Middle Row: Active Projects Grid + Approvals Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Research Projects Highlights (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Project Riset & Pengembangan Terkini</h2>
              <p className="text-xs text-slate-500">Tracking progres formula, uji coba tungku enamel, dan sampel bodi alat masak</p>
            </div>
            <button
              onClick={() => setActiveTab('research')}
              className="text-xs font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1 hover:underline"
            >
              Lihat Semua ({researchProjects.length}) →
            </button>
          </div>

          <div className="space-y-3">
            {researchProjects.slice(0, 3).map((prj) => (
              <div
                key={prj.id}
                className="p-3.5 rounded-lg border border-slate-200 hover:border-teal-300 hover:bg-slate-50/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0 max-w-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 truncate">{prj.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                      {prj.code}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{prj.objective}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                    <span>PIC: {prj.pic}</span>
                    <span aria-hidden="true">·</span>
                    <span>Target: {prj.targetCompletion}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-slate-700">Budget: {formatCurrencyIDR(prj.budget)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                  <div className="text-right">
                    <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
                      {prj.status}
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('research')}
                    className="p-1.5 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Micro Analytics Bar */}
          <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded bg-slate-50">
              <span className="block text-[11px] text-slate-400">Total Eksperimen</span>
              <span className="font-bold text-slate-800 font-mono">{experiments.length} Uji Coba</span>
            </div>
            <div className="p-2 rounded bg-slate-50">
              <span className="block text-[11px] text-slate-400">Sample Terdaftar</span>
              <span className="font-bold text-slate-800 font-mono">{materials.length} Sample QR</span>
            </div>
            <div className="p-2 rounded bg-slate-50">
              <span className="block text-[11px] text-slate-400">QC Pass Standard</span>
              <span className="font-bold text-emerald-600 font-mono">{labPassRate}% Lolos Uji</span>
            </div>
          </div>
        </div>

        {/* Pending Approvals Quick Hub (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <h2 className="text-sm font-bold text-slate-900">Antrean Persetujuan</h2>
              </div>
              <span className="px-2 py-0.5 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-mono">
                {pendingApprovals.length} Pending
              </span>
            </div>

            <div className="mt-3 space-y-3">
              {pendingApprovals.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                  <p>Semua berkas persetujuan telah diproses</p>
                </div>
              ) : (
                pendingApprovals.slice(0, 3).map((app) => (
                  <div
                    key={app.id}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                        {app.type.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400">{app.requestDate}</span>
                    </div>
                    <p className="font-semibold text-slate-800 line-clamp-1">{app.title}</p>
                    <p className="text-[11px] text-slate-500">Pemohon: {app.requesterName}</p>

                    {/* Quick Approve / Reject Actions (Super Admin can 1-click approve) */}
                    {currentUser.role === 'SUPER_ADMIN' ? (
                      <div className="pt-2 flex items-center justify-end gap-2">
                        <button
                          onClick={() => rejectItem(app.id, 'Ditolak via review ringkas dashboard')}
                          className="px-2.5 py-1 text-[11px] text-rose-700 hover:bg-rose-100 rounded transition-colors"
                        >
                          Tolak
                        </button>
                        <button
                          onClick={() => approveItem(app.id, 'Disetujui dari Ringkasan Dashboard')}
                          className="px-2.5 py-1 text-[11px] font-medium bg-teal-600 hover:bg-teal-700 text-white rounded shadow-2xs transition-colors"
                        >
                          Setujui ✓
                        </button>
                      </div>
                    ) : (
                      <div className="text-[11px] text-amber-600 italic">
                        Menunggu persetujuan Supervisor Ayu Jamilatul Janah
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('approvals')}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors text-center"
          >
            Buka Approval Center Lengkap →
          </button>
        </div>
      </div>

      {/* Bottom Row: Recent Audit Trail Activity */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-900">Audit Trail Aktivitas Laboratorium</h2>
          </div>
          <button
            onClick={() => setActiveTab('audit_trail')}
            className="text-xs font-medium text-teal-600 hover:text-teal-700 hover:underline"
          >
            Buka Seluruh Log ({auditLogs.length}) →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="py-2 px-3 font-semibold">Waktu</th>
                <th className="py-2 px-3 font-semibold">User</th>
                <th className="py-2 px-3 font-semibold">Modul</th>
                <th className="py-2 px-3 font-semibold">Aksi</th>
                <th className="py-2 px-3 font-semibold">Detail Transaksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.slice(0, 5).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-800 whitespace-nowrap">
                    {log.userName}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{log.module}</td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
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
                  <td className="py-2.5 px-3 text-slate-600 truncate max-w-md">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
