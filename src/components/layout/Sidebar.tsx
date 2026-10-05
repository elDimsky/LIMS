import React, { useState } from 'react';
import {
  LayoutDashboard,
  FlaskConical,
  Package,
  ShoppingCart,
  Trash2,
  FileText,
  BarChart3,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Beaker,
  BookOpen,
  QrCode,
  CheckCircle2,
  Atom,
  Boxes,
  ArrowDownLeft,
  ArrowUpRight,
  Sliders,
  History,
  Building2,
  FileCheck,
  FileSpreadsheet,
  AlertTriangle,
  FolderGit2,
  Users,
  Settings,
  Scale,
} from 'lucide-react';
import { useLims } from '../../context/LimsContext';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile?: () => void;
}

interface NavSection {
  title: string;
  items: {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: number;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, approvals, materials, currentUser } = useLims();

  // Expanded categories state
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    rd: true,
    inventory: true,
    purchasing: false,
    waste: false,
    documents: false,
    reports: false,
    admin: false,
  });

  const toggleGroup = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const pendingApprovalsCount = approvals.filter((a) => a.status === 'PENDING').length;
  const lowStockCount = materials.filter((m) => m.status === 'LOW_STOCK' || m.status === 'OUT_OF_STOCK').length;

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 border-r border-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-lg border border-teal-500/30">
            EC
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-white tracking-tight truncate">EnamelCook LIMS</h1>
            <p className="text-[11px] text-slate-400 truncate">R&D Cookware & Enamel Lab</p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Main Dashboard Link */}
          <div>
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-teal-500 text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Dashboard</span>
            </button>

            {/* Approvals Center */}
            <button
              onClick={() => handleNavClick('approvals')}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md mt-1 transition-colors ${
                activeTab === 'approvals'
                  ? 'bg-teal-500 text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Approval Center</span>
              </div>
              {pendingApprovalsCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                  {pendingApprovalsCount}
                </span>
              )}
            </button>
          </div>

          {/* R&D Category */}
          <div className="space-y-1">
            <button
              onClick={() => toggleGroup('rd')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold tracking-wider text-slate-400 hover:text-slate-200 uppercase"
            >
              <span className="flex items-center gap-2">
                <FlaskConical className="w-3.5 h-3.5 text-teal-400" />
                <span>R&D Research</span>
              </span>
              {expanded.rd ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {expanded.rd && (
              <div className="pl-2 space-y-0.5">
                {[
                  { id: 'research', label: 'Research Projects', icon: FolderGit2 },
                  { id: 'experiments', label: 'Experiments', icon: Beaker },
                  { id: 'logbook', label: 'Research Logbook', icon: BookOpen },
                  { id: 'samples', label: 'Samples & QR', icon: QrCode },
                  { id: 'lab_tests', label: 'Laboratory Tests', icon: CheckCircle2 },
                  { id: 'formulas', label: 'Formulas & Recipes', icon: Atom },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs rounded-md transition-colors ${
                        activeTab === item.id
                          ? 'bg-teal-500/20 text-teal-300 font-semibold border-l-2 border-teal-400'
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Inventory Category */}
          <div className="space-y-1">
            <button
              onClick={() => toggleGroup('inventory')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold tracking-wider text-slate-400 hover:text-slate-200 uppercase"
            >
              <span className="flex items-center gap-2">
                <Boxes className="w-3.5 h-3.5 text-teal-400" />
                <span>Inventory & Stock</span>
              </span>
              <div className="flex items-center gap-1.5">
                {lowStockCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                )}
                {expanded.inventory ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </div>
            </button>

            {expanded.inventory && (
              <div className="pl-2 space-y-0.5">
                {[
                  { id: 'materials', label: 'Raw Materials', icon: Package, badge: lowStockCount },
                  { id: 'inventory', label: 'Stock Overview', icon: Boxes },
                  { id: 'stock_in', label: 'Stock In', icon: ArrowDownLeft },
                  { id: 'stock_out', label: 'Stock Out', icon: ArrowUpRight },
                  { id: 'stock_adj', label: 'Stock Adjustment', icon: Sliders },
                  { id: 'ledger', label: 'Stock Ledger', icon: History },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-md transition-colors ${
                        activeTab === item.id
                          ? 'bg-teal-500/20 text-teal-300 font-semibold border-l-2 border-teal-400'
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && item.badge > 0 ? (
                        <span className="px-1.5 py-0.2 text-[10px] bg-rose-500/20 text-rose-300 rounded font-mono">
                          {item.badge}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Purchasing Category */}
          <div className="space-y-1">
            <button
              onClick={() => toggleGroup('purchasing')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold tracking-wider text-slate-400 hover:text-slate-200 uppercase"
            >
              <span className="flex items-center gap-2">
                <ShoppingCart className="w-3.5 h-3.5 text-teal-400" />
                <span>Purchasing</span>
              </span>
              {expanded.purchasing ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {expanded.purchasing && (
              <div className="pl-2 space-y-0.5">
                {[
                  { id: 'suppliers', label: 'Suppliers', icon: Building2 },
                  { id: 'purchase_requests', label: 'Purchase Requests', icon: FileCheck },
                  { id: 'purchase_orders', label: 'Purchase Orders', icon: FileSpreadsheet },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs rounded-md transition-colors ${
                        activeTab === item.id
                          ? 'bg-teal-500/20 text-teal-300 font-semibold border-l-2 border-teal-400'
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Waste Management */}
          <div className="space-y-1">
            <button
              onClick={() => handleNavClick('waste')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'waste'
                  ? 'bg-teal-500 text-white font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Trash2 className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Waste Management</span>
            </button>
          </div>

          {/* Documents */}
          <div className="space-y-1">
            <button
              onClick={() => handleNavClick('documents')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'documents'
                  ? 'bg-teal-500 text-white font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0 text-cyan-400" />
              <span>Central Documents</span>
            </button>
          </div>

          {/* Reports & Analytics */}
          <div className="space-y-1">
            <button
              onClick={() => handleNavClick('reports')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'reports'
                  ? 'bg-teal-500 text-white font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4 shrink-0 text-teal-400" />
              <span>Reports & Export</span>
            </button>
          </div>

          {/* Administration */}
          <div className="space-y-1 pt-2 border-t border-slate-800">
            <button
              onClick={() => toggleGroup('admin')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold tracking-wider text-slate-400 hover:text-slate-200 uppercase"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Administration</span>
              </span>
              {expanded.admin ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {expanded.admin && (
              <div className="pl-2 space-y-0.5">
                {[
                  { id: 'users', label: 'Kelola Akun (Users & RBAC)', icon: Users, superAdminOnly: true },
                  { id: 'audit_trail', label: 'Audit Trail Logs', icon: Scale },
                  { id: 'settings', label: 'System Settings', icon: Settings },
                ]
                  .filter((item) => !item.superAdminOnly || currentUser.role === 'SUPER_ADMIN')
                  .map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs rounded-md transition-colors ${
                          activeTab === item.id
                            ? 'bg-teal-500/20 text-teal-300 font-semibold border-l-2 border-teal-400'
                            : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* User Card at bottom of sidebar */}
        <div className="p-3 border-t border-slate-800 shrink-0 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
              onError={(e) => {
                // styled fallback
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80';
              }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
              <p className="text-[10px] text-teal-400 truncate">
                {currentUser.role === 'SUPER_ADMIN' ? 'Supervisor R&D' : 'Admin R&D'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
