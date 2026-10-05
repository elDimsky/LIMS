import React, { useState, useEffect } from 'react';
import { LimsProvider, useLims } from './context/LimsContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopNav } from './components/layout/TopNav';
import { CommandPalette } from './components/layout/CommandPalette';
import { NotificationDrawer } from './components/layout/NotificationDrawer';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { MaterialsView } from './components/materials/MaterialsView';
import { InventoryView } from './components/inventory/InventoryView';
import { PurchasingView } from './components/purchasing/PurchasingView';
import { ResearchView } from './components/research/ResearchView';
import { ExperimentsView } from './components/experiments/ExperimentsView';
import { LabTestsView } from './components/lab/LabTestsView';
import { SamplesView } from './components/samples/SamplesView';
import { FormulasView } from './components/formulas/FormulasView';
import { WasteView } from './components/waste/WasteView';
import { LogbookView } from './components/logbook/LogbookView';
import { DocumentsView } from './components/documents/DocumentsView';
import { ApprovalsView } from './components/approvals/ApprovalsView';
import { ReportsView } from './components/reports/ReportsView';
import { UserManagementView } from './components/admin/UserManagementView';
import { AuditTrailView } from './components/audit/AuditTrailView';
import { SystemSettingsView } from './components/admin/SystemSettingsView';
import { LoginView } from './components/auth/LoginView';

// Quick Action Modals
import { MaterialFormModal } from './components/materials/MaterialFormModal';
import { StockInModal } from './components/inventory/StockInModal';
import { StockOutModal } from './components/inventory/StockOutModal';
import { ExperimentFormModal } from './components/experiments/ExperimentFormModal';
import { ResearchFormModal } from './components/research/ResearchFormModal';
import { PurchaseRequestModal } from './components/purchasing/PurchaseRequestModal';
import { WasteFormModal } from './components/waste/WasteFormModal';

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab, currentUser } = useLims();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick Action Modal states
  const [activeModal, setActiveModal] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleQuickAction = (actionType: string) => {
    setActiveModal(actionType);
  };

  const handleLoginSuccess = (name: string) => {
    setIsLoggedIn(true);
    setToastMessage(`Welcome back, ${name}`);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Toast Notification Popup */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-lg border border-slate-700 text-xs font-semibold animate-in slide-in-from-bottom duration-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Sidebar */}
      <Sidebar isOpen={sidebarOpen} onCloseMobile={() => setSidebarOpen(false)} />

      {/* Viewport Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <TopNav
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onOpenSearch={() => setCommandPaletteOpen(true)}
          onToggleNotifications={() => setNotificationsOpen((prev) => !prev)}
          onQuickAction={handleQuickAction}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardView onQuickAction={handleQuickAction} />
          )}

          {activeTab === 'materials' && <MaterialsView />}

          {(activeTab === 'inventory' ||
            activeTab === 'stock_in' ||
            activeTab === 'stock_out' ||
            activeTab === 'stock_adj' ||
            activeTab === 'ledger') && <InventoryView />}

          {(activeTab === 'suppliers' ||
            activeTab === 'purchase_requests' ||
            activeTab === 'purchase_orders') && <PurchasingView />}

          {activeTab === 'research' && <ResearchView />}

          {activeTab === 'experiments' && <ExperimentsView />}

          {activeTab === 'logbook' && <LogbookView />}

          {activeTab === 'samples' && <SamplesView />}

          {activeTab === 'lab_tests' && <LabTestsView />}

          {activeTab === 'formulas' && <FormulasView />}

          {activeTab === 'waste' && <WasteView />}

          {activeTab === 'documents' && <DocumentsView />}

          {activeTab === 'approvals' && <ApprovalsView />}

          {activeTab === 'reports' && <ReportsView />}

          {activeTab === 'users' && <UserManagementView />}

          {activeTab === 'audit_trail' && <AuditTrailView />}

          {activeTab === 'settings' && <SystemSettingsView />}
        </main>
      </div>

      {/* Global Command Palette (Ctrl + K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* Notification Center Drawer */}
      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      {/* Fast Action Modal Injectors */}
      <MaterialFormModal
        isOpen={activeModal === 'new_material'}
        materialToEdit={null}
        onClose={() => setActiveModal(null)}
      />

      <StockInModal
        isOpen={activeModal === 'stock_in'}
        onClose={() => setActiveModal(null)}
      />

      <StockOutModal
        isOpen={activeModal === 'stock_out'}
        onClose={() => setActiveModal(null)}
      />

      <ResearchFormModal
        isOpen={activeModal === 'new_research'}
        projectToEdit={null}
        onClose={() => setActiveModal(null)}
      />

      <ExperimentFormModal
        isOpen={activeModal === 'new_experiment'}
        onClose={() => setActiveModal(null)}
      />

      <PurchaseRequestModal
        isOpen={activeModal === 'purchase_request'}
        onClose={() => setActiveModal(null)}
      />

      <WasteFormModal
        isOpen={activeModal === 'add_waste'}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
};

export default function App() {
  return (
    <LimsProvider>
      <MainLayout />
    </LimsProvider>
  );
}
