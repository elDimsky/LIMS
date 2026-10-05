import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  Plus,
  UserCheck,
  ChevronDown,
  LogOut,
  Sparkles,
  Package,
  FlaskConical,
  ArrowDownLeft,
  ArrowUpRight,
  Beaker,
  FileCheck,
  Trash2,
  Layers,
} from 'lucide-react';
import { useLims } from '../../context/LimsContext';

interface TopNavProps {
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
  onToggleNotifications: () => void;
  onQuickAction: (actionType: string) => void;
  onLogout: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onToggleSidebar,
  onOpenSearch,
  onToggleNotifications,
  onQuickAction,
  onLogout,
}) => {
  const { currentUser, setActiveTab, activeTab, notifications, approvals } = useLims();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;
  const pendingApprovalsCount = approvals.filter((a) => a.status === 'PENDING').length;

  const getBreadcrumbTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return 'Overview Dashboard';
      case 'research':
        return 'Research & Development / Projects';
      case 'experiments':
        return 'Research & Development / Experiments';
      case 'logbook':
        return 'Research & Development / Digital Lab Notebook';
      case 'samples':
        return 'Research & Development / Samples & Barcode QR';
      case 'lab_tests':
        return 'Research & Development / Laboratory Testing';
      case 'formulas':
        return 'Research & Development / Formula & Recipe Versioning';
      case 'materials':
        return 'Inventory / Raw Material Master Data';
      case 'inventory':
        return 'Inventory / Stock Levels & Availability';
      case 'stock_in':
        return 'Inventory / Stock In & QC Goods Receipt';
      case 'stock_out':
        return 'Inventory / Stock Out & Material Dispatch';
      case 'stock_adj':
        return 'Inventory / Stock Opname & Adjustment';
      case 'ledger':
        return 'Inventory / Continuous Inventory Ledger';
      case 'suppliers':
        return 'Purchasing / Approved Vendor & Supplier Master';
      case 'purchase_requests':
        return 'Purchasing / Purchase Requests (PR)';
      case 'purchase_orders':
        return 'Purchasing / Purchase Orders (PO)';
      case 'waste':
        return 'Environmental / Laboratory & Hazardous Waste Records';
      case 'documents':
        return 'Quality & Compliance / Central Document Management';
      case 'approvals':
        return 'Supervisor / Approval & Authorization Center';
      case 'reports':
        return 'Business Intelligence / Analytical Reports & Excel Export';
      case 'users':
        return 'Administration / Kelola Akun & Hak Akses (RBAC)';
      case 'audit_trail':
        return 'Compliance / Comprehensive Audit Trail Logs';
      case 'settings':
        return 'System / Laboratory Settings & Master Parameters';
      default:
        return 'R&D Laboratory Management System';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6">
      {/* Zone 1: Mobile toggle + Breadcrumb Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0 flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-800 text-sm hidden sm:inline-block">
            {getBreadcrumbTitle(activeTab).split('/')[0].trim()}
          </span>
          {getBreadcrumbTitle(activeTab).includes('/') && (
            <>
              <span className="text-slate-300 hidden sm:inline-block">/</span>
              <span className="text-slate-600 font-medium truncate text-xs sm:text-sm">
                {getBreadcrumbTitle(activeTab).split('/')[1]?.trim()}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Zone 2: Instant Global Search */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-500 rounded-lg text-xs transition-colors border border-slate-200"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Cari bahan, project, sample, PO, formula...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white text-slate-600 border border-slate-300 rounded shadow-2xs">
            Ctrl + K
          </kbd>
        </button>
      </div>

      {/* Zone 3: Actions + User Profile Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Search Icon */}
        <button
          onClick={onOpenSearch}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Quick Action Button */}
        <div className="relative">
          <button
            onClick={() => setQuickActionOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Aksi Cepat</span>
            <ChevronDown className="w-3 h-3 opacity-80" />
          </button>

          {quickActionOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setQuickActionOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Menu Pembuatan Cepat
                </div>
                <button
                  onClick={() => {
                    onQuickAction('new_research');
                    setQuickActionOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-teal-50 hover:text-teal-700 text-left transition-colors"
                >
                  <FlaskConical className="w-4 h-4 text-teal-600" />
                  <span>+ New Research Project</span>
                </button>
                <button
                  onClick={() => {
                    onQuickAction('new_material');
                    setQuickActionOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-teal-50 hover:text-teal-700 text-left transition-colors"
                >
                  <Package className="w-4 h-4 text-teal-600" />
                  <span>+ Tambah Bahan Baku</span>
                </button>
                <button
                  onClick={() => {
                    onQuickAction('stock_in');
                    setQuickActionOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-teal-50 hover:text-teal-700 text-left transition-colors"
                >
                  <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                  <span>+ Input Stock In (QC)</span>
                </button>
                <button
                  onClick={() => {
                    onQuickAction('stock_out');
                    setQuickActionOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-teal-50 hover:text-teal-700 text-left transition-colors"
                >
                  <ArrowUpRight className="w-4 h-4 text-amber-600" />
                  <span>+ Input Stock Out (Usage)</span>
                </button>
                <button
                  onClick={() => {
                    onQuickAction('new_experiment');
                    setQuickActionOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-teal-50 hover:text-teal-700 text-left transition-colors"
                >
                  <Beaker className="w-4 h-4 text-cyan-600" />
                  <span>+ Buat Eksperimen Baru</span>
                </button>
                <button
                  onClick={() => {
                    onQuickAction('purchase_request');
                    setQuickActionOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-teal-50 hover:text-teal-700 text-left transition-colors"
                >
                  <FileCheck className="w-4 h-4 text-indigo-600" />
                  <span>+ Buat Purchase Request</span>
                </button>
                <button
                  onClick={() => {
                    onQuickAction('add_waste');
                    setQuickActionOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-teal-50 hover:text-teal-700 text-left transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span>+ Catat Limbah R&D</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Notification Bell */}
        <button
          onClick={onToggleNotifications}
          className="relative p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          title="Notifikasi"
        >
          <Bell className="w-4 h-4" />
          {unreadNotifsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          )}
        </button>

        {/* User Account Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-lg hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-full object-cover border border-slate-300 shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80';
              }}
            />
            <div className="text-left hidden lg:block leading-tight">
              <span className="block text-xs font-semibold text-slate-900 truncate max-w-[130px]">
                {currentUser.name}
              </span>
              <span className="block text-[10px] text-teal-600 font-medium">
                {currentUser.role === 'SUPER_ADMIN' ? 'Super Admin / Spv' : 'Admin R&D'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {userDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setUserDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-900">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-teal-50 text-teal-700 rounded border border-teal-200">
                      {currentUser.title}
                    </span>
                  </div>
                </div>

                <div className="p-2 space-y-1">
                  {currentUser.role === 'SUPER_ADMIN' ? (
                    <button
                      onClick={() => {
                        setActiveTab('users');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-teal-600" />
                        <span className="font-medium">Kelola Akun & Pengguna</span>
                      </div>
                      <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-mono font-semibold">
                        Super Admin
                      </span>
                    </button>
                  ) : (
                    <div className="px-3 py-1.5 bg-slate-50 rounded-md border border-slate-100 text-[11px] text-slate-500 space-y-1">
                      <div className="flex items-center justify-between">
                        <span>Role:</span>
                        <span className="font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">Admin R&D</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>Hak Kelola Akun:</span>
                        <span className="text-amber-600 font-medium">Khusus Super Admin</span>
                      </div>
                    </div>
                  )}

                  <div className="px-3 py-1.5 bg-slate-50 rounded-md border border-slate-100 text-[11px] text-slate-500 space-y-0.5">
                    <p className="flex justify-between">
                      <span>Status:</span>
                      <span className="font-semibold text-emerald-600">Aktif Terverifikasi</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Divisi:</span>
                      <span className="font-medium text-slate-700">{currentUser.department}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-1 mt-1 border-t border-slate-100 px-2">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-md transition-colors font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar (Logout)</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
