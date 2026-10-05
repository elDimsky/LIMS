import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  User,
  Material,
  InventoryLedger,
  StockInRecord,
  StockOutRecord,
  StockAdjustmentRecord,
  Supplier,
  PurchaseOrder,
  PurchaseRequest,
  ResearchProject,
  Experiment,
  LaboratoryTest,
  Sample,
  Formula,
  FormulaVersion,
  WasteRecord,
  ResearchLogbookEntry,
  DocumentRecord,
  ApprovalItem,
  AuditLog,
  AppNotification,
} from '../types/lims';
import {
  INITIAL_USERS,
  INITIAL_MATERIALS,
  INITIAL_SUPPLIERS,
  INITIAL_LEDGER,
  INITIAL_STOCK_IN_RECORDS,
  INITIAL_STOCK_OUT_RECORDS,
  INITIAL_STOCK_ADJUSTMENTS,
  INITIAL_PURCHASE_REQUESTS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_RESEARCH_PROJECTS,
  INITIAL_EXPERIMENTS,
  INITIAL_LAB_TESTS,
  INITIAL_SAMPLES,
  INITIAL_FORMULAS,
  INITIAL_WASTE_RECORDS,
  INITIAL_LOGBOOK,
  INITIAL_DOCUMENTS,
  INITIAL_APPROVALS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
} from '../data/initialData';

interface LimsContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  addUser: (userData: Omit<User, 'id' | 'lastLogin'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => { success: boolean; error?: string };
  activeTab: string;
  setActiveTab: (tab: string) => void;
  // Raw Materials
  materials: Material[];
  addMaterial: (material: Omit<Material, 'id' | 'createdDate' | 'updatedDate'>) => void;
  updateMaterial: (material: Material) => void;
  deleteMaterial: (id: string) => { success: boolean; error?: string };
  // Inventory
  ledger: InventoryLedger[];
  stockInRecords: StockInRecord[];
  stockOutRecords: StockOutRecord[];
  stockAdjustments: StockAdjustmentRecord[];
  processStockIn: (record: Omit<StockInRecord, 'id' | 'transactionNumber'>) => void;
  processStockOut: (record: Omit<StockOutRecord, 'id' | 'transactionNumber'>) => { success: boolean; error?: string };
  processStockAdjustment: (record: Omit<StockAdjustmentRecord, 'id' | 'transactionNumber' | 'status'>) => void;
  // Purchasing
  suppliers: Supplier[];
  purchaseRequests: PurchaseRequest[];
  purchaseOrders: PurchaseOrder[];
  createPurchaseRequest: (pr: Omit<PurchaseRequest, 'id' | 'prNumber' | 'status'>) => void;
  createPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'poNumber' | 'createdDate'>) => void;
  receiveGoodsPO: (poId: string, receivedNotes?: string) => void;
  // Research & Lab
  researchProjects: ResearchProject[];
  experiments: Experiment[];
  labTests: LaboratoryTest[];
  samples: Sample[];
  formulas: Formula[];
  createResearchProject: (project: Omit<ResearchProject, 'id' | 'code' | 'createdDate' | 'updatedDate' | 'actualSpent' | 'documentsCount'>) => void;
  updateResearchProject: (project: ResearchProject) => void;
  createExperiment: (exp: Omit<Experiment, 'id' | 'experimentNumber'>) => void;
  createLabTest: (test: Omit<LaboratoryTest, 'id' | 'testCode'>) => void;
  createSample: (sample: Omit<Sample, 'id' | 'sampleCode'>) => void;
  createFormula: (formula: Omit<Formula, 'id' | 'code' | 'createdDate'>) => void;
  addFormulaVersion: (formulaId: string, versionData: Omit<FormulaVersion, 'approvalStatus'>) => void;
  // Waste
  wasteRecords: WasteRecord[];
  createWasteRecord: (waste: Omit<WasteRecord, 'id' | 'wasteCode' | 'status'>) => void;
  updateWasteRecord: (id: string, updates: Partial<WasteRecord>) => void;
  // Logbook & Documents
  logbookEntries: ResearchLogbookEntry[];
  addLogbookEntry: (entry: Omit<ResearchLogbookEntry, 'id' | 'version' | 'updatedAt'>) => void;
  documents: DocumentRecord[];
  uploadDocument: (doc: Omit<DocumentRecord, 'id' | 'uploadDate' | 'documentNumber'>) => void;
  // Approvals
  approvals: ApprovalItem[];
  approveItem: (approvalId: string, reviewComments?: string) => void;
  rejectItem: (approvalId: string, reason: string) => void;
  // Notifications & Audit
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  auditLogs: AuditLog[];
  addAuditLog: (action: AuditLog['action'], module: string, recordId: string, recordIdentifier: string, details: string, beforeState?: string, afterState?: string) => void;
  resetToInitialData: () => void;
}

const LimsContext = createContext<LimsContextType | undefined>(undefined);

const STORAGE_PREFIX = 'enamelcook_lims_';

function getStoredItem<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setStoredItem<T>(key: string, val: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(val));
  } catch (err) {
    console.error('Storage error:', err);
  }
}

const DEVICE_ID = typeof window !== 'undefined'
  ? (sessionStorage.getItem('lims_client_device_id') || (() => {
      const id = 'dev_' + Math.random().toString(36).substring(2, 9);
      sessionStorage.setItem('lims_client_device_id', id);
      return id;
    })())
  : 'server_env';

export const LimsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const stored = getStoredItem<User>('currentUser', INITIAL_USERS[0]);
    const initMatch = INITIAL_USERS.find((iu) => iu.id === stored.id);
    return initMatch ? { ...stored, ...initMatch } : stored;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const stored = getStoredItem<User[]>('users', INITIAL_USERS);
    const initialUserIds = new Set(INITIAL_USERS.map((iu) => iu.id));
    const customUsers = stored.filter((u) => !initialUserIds.has(u.id));

    // Always synchronize system users with INITIAL_USERS so changes in initialData.ts take effect immediately
    const synchronizedInitialUsers = INITIAL_USERS.map((initUser) => {
      const storedMatch = stored.find((su) => su.id === initUser.id);
      return {
        ...initUser,
        lastLogin: storedMatch?.lastLogin || initUser.lastLogin,
        status: storedMatch?.status || initUser.status,
      };
    });

    return [...synchronizedInitialUsers, ...customUsers];
  });
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [materials, setMaterials] = useState<Material[]>(() => getStoredItem('materials', INITIAL_MATERIALS));
  const [ledger, setLedger] = useState<InventoryLedger[]>(() => getStoredItem('ledger', INITIAL_LEDGER));
  const [stockInRecords, setStockInRecords] = useState<StockInRecord[]>(() => getStoredItem('stockIn', INITIAL_STOCK_IN_RECORDS));
  const [stockOutRecords, setStockOutRecords] = useState<StockOutRecord[]>(() => getStoredItem('stockOut', INITIAL_STOCK_OUT_RECORDS));
  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustmentRecord[]>(() => getStoredItem('stockAdj', INITIAL_STOCK_ADJUSTMENTS));
  const [suppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>(() => getStoredItem('pr', INITIAL_PURCHASE_REQUESTS));
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => getStoredItem('po', INITIAL_PURCHASE_ORDERS));
  const [researchProjects, setResearchProjects] = useState<ResearchProject[]>(() => getStoredItem('research', INITIAL_RESEARCH_PROJECTS));
  const [experiments, setExperiments] = useState<Experiment[]>(() => getStoredItem('experiments', INITIAL_EXPERIMENTS));
  const [labTests, setLabTests] = useState<LaboratoryTest[]>(() => getStoredItem('labTests', INITIAL_LAB_TESTS));
  const [samples, setSamples] = useState<Sample[]>(() => getStoredItem('samples', INITIAL_SAMPLES));
  const [formulas, setFormulas] = useState<Formula[]>(() => getStoredItem('formulas', INITIAL_FORMULAS));
  const [wasteRecords, setWasteRecords] = useState<WasteRecord[]>(() => getStoredItem('waste', INITIAL_WASTE_RECORDS));
  const [logbookEntries, setLogbookEntries] = useState<ResearchLogbookEntry[]>(() => getStoredItem('logbook', INITIAL_LOGBOOK));
  const [documents, setDocuments] = useState<DocumentRecord[]>(() => getStoredItem('documents', INITIAL_DOCUMENTS));
  const [approvals, setApprovals] = useState<ApprovalItem[]>(() => getStoredItem('approvals', INITIAL_APPROVALS));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => getStoredItem('audit', INITIAL_AUDIT_LOGS));
  const [notifications, setNotifications] = useState<AppNotification[]>(() => getStoredItem('notifications', INITIAL_NOTIFICATIONS));

  // Multi-device synchronization state
  const isSyncingFromServer = useRef(false);

  // Sync to server function
  const pushServerUpdate = useCallback((field: string, data: any) => {
    if (isSyncingFromServer.current) return;
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: DEVICE_ID,
        updates: { [field]: data },
      }),
    }).catch((err) => {
      console.warn('Sync push error:', err);
    });
  }, []);

  const fetchLatestServerState = useCallback(async () => {
    try {
      const res = await fetch('/api/sync');
      if (!res.ok) return;
      const data = await res.json();
      if (!data.state || Object.keys(data.state).length === 0) {
        // Initial boot: seed server with initial data
        fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deviceId: DEVICE_ID,
            updates: {
              materials,
              ledger,
              stockInRecords,
              stockOutRecords,
              stockAdjustments,
              purchaseRequests,
              purchaseOrders,
              researchProjects,
              experiments,
              labTests,
              samples,
              formulas,
              wasteRecords,
              logbookEntries,
              documents,
              approvals,
              auditLogs,
              notifications,
              users,
            },
          }),
        }).catch(() => {});
        return;
      }

      isSyncingFromServer.current = true;
      const s = data.state;
      if (s.materials) setMaterials(s.materials);
      if (s.ledger) setLedger(s.ledger);
      if (s.stockInRecords) setStockInRecords(s.stockInRecords);
      if (s.stockOutRecords) setStockOutRecords(s.stockOutRecords);
      if (s.stockAdjustments) setStockAdjustments(s.stockAdjustments);
      if (s.purchaseRequests) setPurchaseRequests(s.purchaseRequests);
      if (s.purchaseOrders) setPurchaseOrders(s.purchaseOrders);
      if (s.researchProjects) setResearchProjects(s.researchProjects);
      if (s.experiments) setExperiments(s.experiments);
      if (s.labTests) setLabTests(s.labTests);
      if (s.samples) setSamples(s.samples);
      if (s.formulas) setFormulas(s.formulas);
      if (s.wasteRecords) setWasteRecords(s.wasteRecords);
      if (s.logbookEntries) setLogbookEntries(s.logbookEntries);
      if (s.documents) setDocuments(s.documents);
      if (s.approvals) setApprovals(s.approvals);
      if (s.auditLogs) setAuditLogs(s.auditLogs);
      if (s.notifications) setNotifications(s.notifications);
      if (s.users) setUsers(s.users);

      setTimeout(() => {
        isSyncingFromServer.current = false;
      }, 150);
    } catch (err) {
      console.warn('Sync pull error:', err);
    }
  }, [materials, ledger, stockInRecords, stockOutRecords, stockAdjustments, purchaseRequests, purchaseOrders, researchProjects, experiments, labTests, samples, formulas, wasteRecords, logbookEntries, documents, approvals, auditLogs, notifications, users]);

  useEffect(() => {
    fetchLatestServerState();

    // Listen to real-time SSE stream for instant updates
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events');
      eventSource.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.sourceDeviceId !== DEVICE_ID) {
            fetchLatestServerState();
          }
        } catch {
          fetchLatestServerState();
        }
      };
    } catch (err) {
      console.warn('EventSource failed:', err);
    }

    // Polling fallback every 3.5 seconds and on window focus
    const interval = setInterval(fetchLatestServerState, 3500);
    const onFocus = () => fetchLatestServerState();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);

    return () => {
      eventSource?.close();
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [fetchLatestServerState]);

  // Sync state changes to localStorage and Server
  useEffect(() => setStoredItem('currentUser', currentUser), [currentUser]);

  useEffect(() => {
    setStoredItem('users', users);
    pushServerUpdate('users', users);
  }, [users, pushServerUpdate]);

  useEffect(() => {
    setStoredItem('materials', materials);
    pushServerUpdate('materials', materials);
  }, [materials, pushServerUpdate]);

  useEffect(() => {
    setStoredItem('ledger', ledger);
    pushServerUpdate('ledger', ledger);
  }, [ledger, pushServerUpdate]);

  useEffect(() => {
    setStoredItem('stockIn', stockInRecords);
    pushServerUpdate('stockInRecords', stockInRecords);
  }, [stockInRecords, pushServerUpdate]);

  useEffect(() => {
    setStoredItem('stockOut', stockOutRecords);
    pushServerUpdate('stockOutRecords', stockOutRecords);
  }, [stockOutRecords, pushServerUpdate]);

  useEffect(() => {
    setStoredItem('stockAdj', stockAdjustments);
    pushServerUpdate('stockAdjustments', stockAdjustments);
  }, [stockAdjustments, pushServerUpdate]);

  useEffect(() => {
    setStoredItem('pr', purchaseRequests);
    pushServerUpdate('purchaseRequests', purchaseRequests);
  }, [purchaseRequests, pushServerUpdate]);

  useEffect(() => {
    setStoredItem('po', purchaseOrders);
    pushServerUpdate('purchaseOrders', purchaseOrders);
  }, [purchaseOrders, pushServerUpdate]);

  useEffect(() => {
    setStoredItem('research', researchProjects);
    pushServerUpdate('researchProjects', researchProjects);
  }, [researchProjects, pushServerUpdate]);

  useEffect(() => {
    setStoredItem('experiments', experiments);
    pushServerUpdate('experiments', experiments);
  }, [experiments, pushServerUpdate]);

  useEffect(() => {
    setStoredItem('labTests', labTests);
    pushServerUpdate('labTests', labTests);
  }, [labTests, pushServerUpdate]);

  useEffect(() => {
    setStoredItem('samples', samples);
    pushServerUpdate('samples', samples);
  }, [samples, pushServerUpdate]);

  useEffect(() => {
    setStoredItem('formulas', formulas);
    pushServerUpdate('formulas', formulas);
  }, [formulas, pushServerUpdate]);

  useEffect(() => {
    setStoredItem('waste', wasteRecords);
    pushServerUpdate('wasteRecords', wasteRecords);
  }, [wasteRecords, pushServerUpdate]);

  useEffect(() => {
    setStoredItem('logbook', logbookEntries);
    pushServerUpdate('logbookEntries', logbookEntries);
  }, [logbookEntries, pushServerUpdate]);

  useEffect(() => {
    setStoredItem('documents', documents);
    pushServerUpdate('documents', documents);
  }, [documents, pushServerUpdate]);

  useEffect(() => {
    setStoredItem('approvals', approvals);
    pushServerUpdate('approvals', approvals);
  }, [approvals, pushServerUpdate]);

  useEffect(() => {
    setStoredItem('audit', auditLogs);
    pushServerUpdate('auditLogs', auditLogs);
  }, [auditLogs, pushServerUpdate]);

  useEffect(() => {
    setStoredItem('notifications', notifications);
    pushServerUpdate('notifications', notifications);
  }, [notifications, pushServerUpdate]);

  // Helper for adding Audit Log
  const addAuditLog = (
    action: AuditLog['action'],
    module: string,
    recordId: string,
    recordIdentifier: string,
    details: string,
    beforeState?: string,
    afterState?: string
  ) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newLog: AuditLog = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: now,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      module,
      recordId,
      recordIdentifier,
      details,
      beforeState,
      afterState,
      ipAddress: '192.168.10.45',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Helper for adding Notification
  const addNotification = (
    type: AppNotification['type'],
    title: string,
    message: string,
    priority: AppNotification['priority'] = 'MEDIUM',
    actionLink?: string,
    referenceId?: string
  ) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newNotif: AppNotification = {
      id: `NOTIF-${Date.now().toString().slice(-4)}`,
      type,
      title,
      message,
      timestamp: now,
      read: false,
      priority,
      actionLink,
      referenceId,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Material Operations
  const addMaterial = (data: Omit<Material, 'id' | 'createdDate' | 'updatedDate'>) => {
    const id = `MAT-${data.category.slice(0, 3)}-${Date.now().toString().slice(-3)}`;
    const today = new Date().toISOString().slice(0, 10);
    const newMaterial: Material = {
      ...data,
      id,
      createdDate: today,
      updatedDate: today,
      createdBy: currentUser.name,
      updatedBy: currentUser.name,
    };

    setMaterials((prev) => [newMaterial, ...prev]);
    addAuditLog('CREATE', 'Raw Material', id, newMaterial.code, `Menambahkan bahan baku baru: ${newMaterial.name} (${newMaterial.code})`);

    // Check low stock initial condition
    if (newMaterial.currentStock <= newMaterial.reorderPoint) {
      addNotification(
        'LOW_STOCK',
        `Peringatan Stok Rendah: ${newMaterial.name}`,
        `Stok saat ini ${newMaterial.currentStock} ${newMaterial.unit} berada di bawah reorder point (${newMaterial.reorderPoint} ${newMaterial.unit}).`,
        'HIGH',
        'inventory',
        id
      );
    }
  };

  const updateMaterial = (updated: Material) => {
    const prevMat = materials.find((m) => m.id === updated.id);
    const today = new Date().toISOString().slice(0, 10);
    const finalMat = {
      ...updated,
      updatedDate: today,
      updatedBy: currentUser.name,
    };

    // Recompute status based on stock thresholds
    if (finalMat.currentStock <= 0) {
      finalMat.status = 'OUT_OF_STOCK';
    } else if (finalMat.currentStock <= finalMat.reorderPoint) {
      finalMat.status = 'LOW_STOCK';
    } else {
      finalMat.status = 'AVAILABLE';
    }

    setMaterials((prev) => prev.map((m) => (m.id === finalMat.id ? finalMat : m)));
    addAuditLog(
      'UPDATE',
      'Raw Material',
      finalMat.id,
      finalMat.code,
      `Memperbarui data bahan: ${finalMat.name}`,
      prevMat ? `Stock: ${prevMat.currentStock} ${prevMat.unit}, Min: ${prevMat.minimumStock}` : undefined,
      `Stock: ${finalMat.currentStock} ${finalMat.unit}, Min: ${finalMat.minimumStock}`
    );
  };

  const deleteMaterial = (id: string): { success: boolean; error?: string } => {
    const mat = materials.find((m) => m.id === id);
    if (!mat) return { success: false, error: 'Data bahan tidak ditemukan.' };

    // Relational integrity check: is material used in research or experiments?
    const isUsedInResearch = researchProjects.some((rp) =>
      rp.materialsRequired.some((mr) => mr.materialId === id)
    );
    const isUsedInExperiment = experiments.some((exp) =>
      exp.materialsUsed.some((mu) => mu.materialId === id)
    );
    const isUsedInPO = purchaseOrders.some((po) =>
      po.items.some((item) => item.materialId === id)
    );

    if (isUsedInResearch || isUsedInExperiment || isUsedInPO) {
      return {
        success: false,
        error: `Data "${mat.name}" tidak dapat dihapus karena masih berelasi dengan Research Project, Eksperimen, atau Purchase Order. Anda dapat mengubah statusnya menjadi Diarsipkan (ARCHIVED).`,
      };
    }

    setMaterials((prev) => prev.filter((m) => m.id !== id));
    addAuditLog('DELETE', 'Raw Material', id, mat.code, `Menghapus master bahan: ${mat.name}`);
    return { success: true };
  };

  // Stock In
  const processStockIn = (data: Omit<StockInRecord, 'id' | 'transactionNumber'>) => {
    const txNum = `TX-IN-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const id = `STK-IN-${Date.now().toString().slice(-4)}`;
    const newRecord: StockInRecord = {
      ...data,
      id,
      transactionNumber: txNum,
    };

    setStockInRecords((prev) => [newRecord, ...prev]);

    // If approved, update material stock immediately and write to ledger
    if (data.qcStatus === 'APPROVED') {
      const targetMat = materials.find((m) => m.id === data.materialId);
      if (targetMat) {
        const prevStock = targetMat.currentStock;
        const newStock = prevStock + data.quantity;
        const updatedStatus = newStock > targetMat.reorderPoint ? 'AVAILABLE' : 'LOW_STOCK';

        setMaterials((prev) =>
          prev.map((m) =>
            m.id === targetMat.id ? { ...m, currentStock: newStock, status: updatedStatus } : m
          )
        );

        // Append to ledger
        const ledgerEntry: InventoryLedger = {
          id: `LDG-${Date.now().toString().slice(-4)}`,
          transactionNumber: txNum,
          date: `${data.date} 10:00`,
          materialId: targetMat.id,
          materialCode: targetMat.code,
          materialName: targetMat.name,
          type: 'STOCK_IN',
          quantityChange: data.quantity,
          previousStock: prevStock,
          currentStock: newStock,
          unit: data.unit,
          referenceId: data.purchaseOrderId,
          referenceNumber: data.purchaseOrderNumber,
          purpose: 'Penerimaan Barang Gudang R&D',
          requestedBy: data.receivedBy,
          approvedBy: data.qcInspector || currentUser.name,
          notes: data.notes,
        };
        setLedger((prev) => [ledgerEntry, ...prev]);

        addAuditLog(
          'STOCK_IN',
          'Inventory',
          id,
          txNum,
          `Stock In ${data.quantity} ${data.unit} untuk ${targetMat.name} (Stok: ${prevStock} → ${newStock})`,
          `Stok: ${prevStock} ${data.unit}`,
          `Stok: ${newStock} ${data.unit}`
        );
      }
    }
  };

  // Stock Out with validation
  const processStockOut = (data: Omit<StockOutRecord, 'id' | 'transactionNumber'>): { success: boolean; error?: string } => {
    const targetMat = materials.find((m) => m.id === data.materialId);
    if (!targetMat) {
      return { success: false, error: 'Bahan baku tidak ditemukan di sistem.' };
    }

    const availableStock = targetMat.currentStock - targetMat.reservedStock;
    if (data.quantity > targetMat.currentStock) {
      return {
        success: false,
        error: `Insufficient Stock (Stok Tidak Mencukupi). Stok fisik: ${targetMat.currentStock} ${targetMat.unit}, Jumlah yang diminta: ${data.quantity} ${targetMat.unit}. Transaksi tidak dapat diproses.`,
      };
    }

    const txNum = `TX-OUT-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const id = `STK-OUT-${Date.now().toString().slice(-4)}`;
    const newRecord: StockOutRecord = {
      ...data,
      id,
      transactionNumber: txNum,
    };

    setStockOutRecords((prev) => [newRecord, ...prev]);

    const prevStock = targetMat.currentStock;
    const newStock = prevStock - data.quantity;
    const updatedStatus = newStock <= 0 ? 'OUT_OF_STOCK' : newStock <= targetMat.reorderPoint ? 'LOW_STOCK' : 'AVAILABLE';

    setMaterials((prev) =>
      prev.map((m) =>
        m.id === targetMat.id ? { ...m, currentStock: newStock, status: updatedStatus } : m
      )
    );

    // Append to ledger
    const ledgerEntry: InventoryLedger = {
      id: `LDG-${Date.now().toString().slice(-4)}`,
      transactionNumber: txNum,
      date: `${data.date} 14:00`,
      materialId: targetMat.id,
      materialCode: targetMat.code,
      materialName: targetMat.name,
      type: data.purpose === 'RESEARCH' ? 'RESEARCH_USAGE' : data.purpose === 'SAMPLE' ? 'SAMPLE_USAGE' : 'STOCK_OUT',
      quantityChange: -data.quantity,
      previousStock: prevStock,
      currentStock: newStock,
      unit: data.unit,
      referenceId: data.researchProjectId || data.experimentId,
      referenceNumber: data.researchProjectTitle || data.experimentNumber,
      purpose: data.purpose,
      requestedBy: data.requestedBy,
      approvedBy: data.approvedBy,
      notes: data.notes,
    };
    setLedger((prev) => [ledgerEntry, ...prev]);

    addAuditLog(
      'STOCK_OUT',
      'Inventory',
      id,
      txNum,
      `Stock Out ${data.quantity} ${data.unit} untuk ${targetMat.name} (${data.purpose})`,
      `Stok: ${prevStock} ${data.unit}`,
      `Stok: ${newStock} ${data.unit}`
    );

    // Alert if low stock triggered
    if (newStock <= targetMat.reorderPoint) {
      addNotification(
        'LOW_STOCK',
        `Peringatan Stok Rendah: ${targetMat.name}`,
        `Stok saat ini ${newStock} ${data.unit} berada di bawah reorder point (${targetMat.reorderPoint} ${data.unit}). Segera lakukan Purchase Request.`,
        'HIGH',
        'inventory',
        targetMat.id
      );
    }

    return { success: true };
  };

  // Stock Adjustment
  const processStockAdjustment = (data: Omit<StockAdjustmentRecord, 'id' | 'transactionNumber' | 'status'>) => {
    const txNum = `TX-ADJ-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const id = `ADJ-${Date.now().toString().slice(-4)}`;

    // If Super Admin, direct approval; else pending approval
    const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';
    const status = isSuperAdmin ? 'APPROVED' : 'PENDING';

    const newRecord: StockAdjustmentRecord = {
      ...data,
      id,
      transactionNumber: txNum,
      status,
      approvedBy: isSuperAdmin ? currentUser.name : undefined,
    };

    setStockAdjustments((prev) => [newRecord, ...prev]);

    if (isSuperAdmin) {
      const targetMat = materials.find((m) => m.id === data.materialId);
      if (targetMat) {
        const prevStock = targetMat.currentStock;
        const newStock = data.actualStock;
        const updatedStatus = newStock <= 0 ? 'OUT_OF_STOCK' : newStock <= targetMat.reorderPoint ? 'LOW_STOCK' : 'AVAILABLE';

        setMaterials((prev) =>
          prev.map((m) =>
            m.id === targetMat.id ? { ...m, currentStock: newStock, status: updatedStatus } : m
          )
        );

        const ledgerEntry: InventoryLedger = {
          id: `LDG-${Date.now().toString().slice(-4)}`,
          transactionNumber: txNum,
          date: `${data.date} 16:00`,
          materialId: targetMat.id,
          materialCode: targetMat.code,
          materialName: targetMat.name,
          type: 'ADJUSTMENT',
          quantityChange: data.difference,
          previousStock: prevStock,
          currentStock: newStock,
          unit: data.unit,
          purpose: 'Stock Opname Penyesuaian Fisik',
          requestedBy: data.requestedBy,
          approvedBy: currentUser.name,
          notes: data.reason,
        };
        setLedger((prev) => [ledgerEntry, ...prev]);

        addAuditLog(
          'UPDATE',
          'Inventory Adjustment',
          id,
          txNum,
          `Penyesuaian stok ${targetMat.name} dari ${prevStock} menjadi ${newStock} ${data.unit} (${data.difference > 0 ? '+' : ''}${data.difference})`,
          `Stok: ${prevStock} ${data.unit}`,
          `Stok: ${newStock} ${data.unit}`
        );
      }
    } else {
      // Add to approvals queue
      const approvalItem: ApprovalItem = {
        id: `APP-${Date.now().toString().slice(-4)}`,
        type: 'STOCK_ADJUSTMENT',
        referenceId: id,
        referenceNumber: txNum,
        title: `Persetujuan Penyesuaian Stok: ${data.materialName} (${data.difference > 0 ? '+' : ''}${data.difference} ${data.unit})`,
        requesterName: currentUser.name,
        requestDate: data.date,
        priority: 'MEDIUM',
        status: 'PENDING',
        details: {
          material: data.materialName,
          systemStock: `${data.systemStock} ${data.unit}`,
          actualStock: `${data.actualStock} ${data.unit}`,
          difference: `${data.difference} ${data.unit}`,
          reason: data.reason,
        },
      };
      setApprovals((prev) => [approvalItem, ...prev]);

      addNotification(
        'APPROVAL_NEEDED',
        'Permohonan Penyesuaian Stok',
        `${currentUser.name} mengajukan penyesuaian stok untuk ${data.materialName} (${data.difference} ${data.unit}).`,
        'MEDIUM',
        'approvals',
        approvalItem.id
      );
    }
  };

  // Purchasing
  const createPurchaseRequest = (data: Omit<PurchaseRequest, 'id' | 'prNumber' | 'status'>) => {
    const prNum = `PR-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${Date.now().toString().slice(-3)}`;
    const id = `PR-${Date.now().toString().slice(-4)}`;
    const newPR: PurchaseRequest = {
      ...data,
      id,
      prNumber: prNum,
      status: 'PENDING',
    };

    setPurchaseRequests((prev) => [newPR, ...prev]);

    // Add to approvals queue
    const approvalItem: ApprovalItem = {
      id: `APP-${Date.now().toString().slice(-4)}`,
      type: 'PURCHASE_REQUEST',
      referenceId: id,
      referenceNumber: prNum,
      title: `Purchase Request: ${data.materialName} (${data.quantity} ${data.unit})`,
      requesterName: data.requestedBy,
      requestDate: data.requestDate,
      priority: data.priority,
      status: 'PENDING',
      details: {
        material: data.materialName,
        quantity: `${data.quantity} ${data.unit}`,
        requiredDate: data.requiredDate,
        purpose: data.purpose,
      },
    };
    setApprovals((prev) => [approvalItem, ...prev]);

    addAuditLog('CREATE', 'Purchasing', id, prNum, `Membuat Purchase Request baru: ${prNum} untuk ${data.materialName}`);
  };

  const createPurchaseOrder = (data: Omit<PurchaseOrder, 'id' | 'poNumber' | 'createdDate'>) => {
    const poNum = `PO-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${Date.now().toString().slice(-3)}`;
    const id = `PO-${Date.now().toString().slice(-4)}`;
    const today = new Date().toISOString().slice(0, 10);

    const newPO: PurchaseOrder = {
      ...data,
      id,
      poNumber: poNum,
      createdDate: today,
    };

    setPurchaseOrders((prev) => [newPO, ...prev]);
    addAuditLog('CREATE', 'Purchasing', id, poNum, `Membuat Purchase Order baru: ${poNum} ke supplier ${data.supplierName}`);
  };

  const receiveGoodsPO = (poId: string, receivedNotes?: string) => {
    const po = purchaseOrders.find((p) => p.id === poId);
    if (!po) return;

    // Update PO delivery status to RECEIVED
    setPurchaseOrders((prev) =>
      prev.map((p) =>
        p.id === poId
          ? {
              ...p,
              deliveryStatus: 'RECEIVED',
              paymentStatus: 'PAID',
              notes: receivedNotes ? `${p.notes || ''} | Goods Received: ${receivedNotes}` : p.notes,
            }
          : p
      )
    );

    // Auto Stock In for each item
    po.items.forEach((item) => {
      processStockIn({
        date: new Date().toISOString().slice(0, 10),
        materialId: item.materialId,
        materialName: item.materialName,
        supplierId: po.supplierId,
        supplierName: po.supplierName,
        purchaseOrderId: po.id,
        purchaseOrderNumber: po.poNumber,
        batchNumber: `B-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
        lotNumber: `LOT-${Date.now().toString().slice(-4)}`,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        receivedBy: currentUser.name,
        storageLocation: 'Gudang Bahan R&D',
        expiryDate: '2028-12-31',
        qcStatus: 'APPROVED',
        qcInspector: currentUser.name,
        qcNotes: 'Lolos uji inspeksi kedatangan barang (Goods Receipt QC Approved).',
        notes: `Diterima dari PO ${po.poNumber}. ${receivedNotes || ''}`,
      });
    });

    addAuditLog('APPROVE', 'Purchasing', po.id, po.poNumber, `Goods Receipt & QC Approval untuk PO ${po.poNumber}. Stok bahan otomatis bertambah.`);
  };

  // Research Project
  const createResearchProject = (data: Omit<ResearchProject, 'id' | 'code' | 'createdDate' | 'updatedDate' | 'actualSpent' | 'documentsCount'>) => {
    const code = `PRJ-${data.category.slice(0, 3)}-${Date.now().toString().slice(-4)}`;
    const id = `RD-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const today = new Date().toISOString().slice(0, 10);

    const newProject: ResearchProject = {
      ...data,
      id,
      code,
      actualSpent: 0,
      documentsCount: 0,
      createdDate: today,
      updatedDate: today,
    };

    setResearchProjects((prev) => [newProject, ...prev]);

    // If supervisor created it, it can be approved directly or submitted
    if (currentUser.role === 'SUPER_ADMIN') {
      newProject.approvedBy = currentUser.name;
      newProject.approvalDate = today;
    } else {
      const approvalItem: ApprovalItem = {
        id: `APP-${Date.now().toString().slice(-4)}`,
        type: 'RESEARCH_PROJECT',
        referenceId: id,
        referenceNumber: code,
        title: `Persetujuan Project Riset: ${data.title}`,
        requesterName: data.pic,
        requestDate: today,
        priority: data.priority,
        status: 'PENDING',
        details: {
          category: data.category,
          productTarget: data.productTarget,
          budget: `Rp ${data.budget.toLocaleString('id-ID')}`,
          targetCompletion: data.targetCompletion,
          objective: data.objective,
        },
      };
      setApprovals((prev) => [approvalItem, ...prev]);
    }

    addAuditLog('CREATE', 'Research Project', id, code, `Membuat project riset baru: "${data.title}"`);
  };

  const updateResearchProject = (project: ResearchProject) => {
    const today = new Date().toISOString().slice(0, 10);
    const updated = {
      ...project,
      updatedDate: today,
    };
    setResearchProjects((prev) => prev.map((rp) => (rp.id === updated.id ? updated : rp)));
    addAuditLog('UPDATE', 'Research Project', updated.id, updated.code, `Memperbarui project riset: "${updated.title}"`);
  };

  // Experiment
  const createExperiment = (expData: Omit<Experiment, 'id' | 'experimentNumber'>) => {
    const expNum = `EXP-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const id = `EXP-${Date.now().toString().slice(-4)}`;

    const newExp: Experiment = {
      ...expData,
      id,
      experimentNumber: expNum,
    };

    setExperiments((prev) => [newExp, ...prev]);

    // Automatically deduct materials used from inventory!
    expData.materialsUsed.forEach((item) => {
      processStockOut({
        date: expData.experimentDate,
        materialId: item.materialId,
        materialName: item.materialName,
        quantity: item.quantity,
        unit: item.unit,
        purpose: 'RESEARCH',
        researchProjectId: expData.researchProjectId,
        researchProjectTitle: expData.researchProjectTitle,
        experimentId: id,
        experimentNumber: expNum,
        requestedBy: expData.operator,
        approvedBy: currentUser.name,
        notes: `Penggunaan bahan otomatis untuk eksperimen ${expNum}`,
      });
    });

    // Automatically create generated sample
    const sampleCode = `SMP-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const newSample: Sample = {
      id: `SMP-${Date.now().toString().slice(-4)}`,
      sampleCode,
      researchProjectId: expData.researchProjectId,
      researchProjectTitle: expData.researchProjectTitle,
      experimentId: id,
      experimentNumber: expNum,
      productName: `Benda Uji Eksperimen ${expNum} (${expData.processParameters.applicationMethod})`,
      substrateMaterial: 'Decarburized Steel / Cast Iron / SUS304',
      enamelSystem: expData.formulaName || 'Enamel Standard System',
      batchNumber: `B-${Date.now().toString().slice(-4)}`,
      quantity: 3,
      unit: 'Pcs',
      storageLocation: 'Lemari Sample R&D Kabinet S-02',
      dateCreated: expData.experimentDate,
      retentionDate: '2027-12-31',
      status: 'TESTING',
      overallTestStatus: 'PENDING',
      qrPayload: `LIMS-${sampleCode}|${expData.researchProjectId}|${expNum}`,
      notes: `Dihasilkan dari eksperimen ${expNum}. ${expData.result}`,
    };
    setSamples((prev) => [newSample, ...prev]);

    addAuditLog('CREATE', 'Experiment', id, expNum, `Membuat eksperimen baru: ${expNum} pada project "${expData.researchProjectTitle}"`);
    addNotification('EXPERIMENT_COMPLETED', `Eksperimen ${expNum} Dicatat`, `Eksperimen telah selesai dengan hasil: ${expData.conclusion.slice(0, 80)}...`, 'MEDIUM', 'experiments', id);
  };

  // Lab Test
  const createLabTest = (testData: Omit<LaboratoryTest, 'id' | 'testCode'>) => {
    const testCode = `TST-${testData.testType.slice(0, 3)}-${Date.now().toString().slice(-4)}`;
    const id = `TST-${Date.now().toString().slice(-4)}`;

    const newTest: LaboratoryTest = {
      ...testData,
      id,
      testCode,
    };

    setLabTests((prev) => [newTest, ...prev]);

    // Update target sample test status if linked
    if (testData.sampleId) {
      setSamples((prev) =>
        prev.map((s) =>
          s.id === testData.sampleId
            ? { ...s, overallTestStatus: testData.status, status: testData.status === 'PASS' ? 'APPROVED' : 'TESTING' }
            : s
        )
      );
    }

    addAuditLog('CREATE', 'Laboratory Test', id, testCode, `Mencatat hasil uji laboratorium: ${testData.testName} (${testData.status})`);
  };

  // Sample
  const createSample = (sampleData: Omit<Sample, 'id' | 'sampleCode'>) => {
    const sampleCode = `SMP-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const id = `SMP-${Date.now().toString().slice(-4)}`;

    const newSample: Sample = {
      ...sampleData,
      id,
      sampleCode,
      qrPayload: `LIMS-${sampleCode}|${sampleData.researchProjectId}|${sampleData.productName}`,
    };

    setSamples((prev) => [newSample, ...prev]);
    addAuditLog('CREATE', 'Sample Management', id, sampleCode, `Mendaftarkan sample baru: ${newSample.productName} (${sampleCode})`);
  };

  // Formula Management with Version Control
  const createFormula = (data: Omit<Formula, 'id' | 'code' | 'createdDate'>) => {
    const code = `FRM-${data.type.slice(0, 2)}-${Date.now().toString().slice(-4)}`;
    const id = `FRM-${Date.now().toString().slice(-4)}`;
    const today = new Date().toISOString().slice(0, 10);
    const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

    const formattedVersions: FormulaVersion[] = (data.versions || []).map((v) => ({
      ...v,
      approvalStatus: isSuperAdmin ? 'APPROVED' : 'PENDING_APPROVAL',
      approvedBy: isSuperAdmin ? currentUser.name : undefined,
      approvalDate: isSuperAdmin ? today : undefined,
    }));

    const newFormula: Formula = {
      ...data,
      id,
      code,
      createdDate: today,
      status: isSuperAdmin ? 'ACTIVE' : 'DRAFT',
      versions: formattedVersions,
    };

    setFormulas((prev) => [newFormula, ...prev]);

    // If created by Admin R&D, submit an approval request to Super Admin
    if (!isSuperAdmin) {
      const firstVer = formattedVersions[0];
      const approvalItem: ApprovalItem = {
        id: `APP-FRM-${Date.now().toString().slice(-4)}`,
        type: 'FORMULA',
        referenceId: id,
        referenceNumber: `${code} v${firstVer?.version || '1.0'}`,
        title: `Persetujuan Formula Baru: ${data.name} (v${firstVer?.version || '1.0'})`,
        requesterName: data.createdBy,
        requestDate: today,
        priority: 'HIGH',
        status: 'PENDING',
        details: {
          formulaName: data.name,
          type: data.type,
          version: firstVer?.version || '1.0',
          substrate: data.applicableSubstrate,
          componentsCount: firstVer?.components?.length || 0,
        },
      };
      setApprovals((prev) => [approvalItem, ...prev]);

      const notif: AppNotification = {
        id: `NOTIF-${Date.now().toString().slice(-4)}`,
        type: 'APPROVAL_NEEDED',
        title: 'Pengajuan Resep Formula Baru',
        message: `${data.createdBy} mengajukan persetujuan resep formula baru: ${data.name} (${code})`,
        timestamp: today,
        read: false,
        priority: 'HIGH',
        actionLink: 'approvals',
        referenceId: id,
      };
      setNotifications((prev) => [notif, ...prev]);
    }

    addAuditLog('CREATE', 'Formula Management', id, code, `Membuat formula baru: ${data.name} (${code})`);
  };

  const addFormulaVersion = (formulaId: string, versionData: Omit<FormulaVersion, 'approvalStatus'>) => {
    const formula = formulas.find((f) => f.id === formulaId);
    if (!formula) return;

    const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';
    const newVersion: FormulaVersion = {
      ...versionData,
      approvalStatus: isSuperAdmin ? 'APPROVED' : 'PENDING_APPROVAL',
      approvedBy: isSuperAdmin ? currentUser.name : undefined,
      approvalDate: isSuperAdmin ? versionData.date : undefined,
    };

    setFormulas((prev) =>
      prev.map((f) =>
        f.id === formulaId
          ? {
              ...f,
              currentVersion: newVersion.version,
              versions: [newVersion, ...f.versions],
            }
          : f
      )
    );

    if (!isSuperAdmin) {
      const approvalItem: ApprovalItem = {
        id: `APP-${Date.now().toString().slice(-4)}`,
        type: 'FORMULA',
        referenceId: formula.id,
        referenceNumber: `${formula.code} v${newVersion.version}`,
        title: `Persetujuan Revisi Formula: ${formula.name} (Versi ${newVersion.version})`,
        requesterName: versionData.changedBy,
        requestDate: versionData.date,
        priority: 'MEDIUM',
        status: 'PENDING',
        details: {
          formulaName: formula.name,
          version: newVersion.version,
          reason: newVersion.changeReason,
          componentsCount: newVersion.components.length,
        },
      };
      setApprovals((prev) => [approvalItem, ...prev]);
    }

    addAuditLog(
      'UPDATE',
      'Formula Management',
      formula.id,
      formula.code,
      `Merilis versi baru ${newVersion.version} untuk ${formula.name}. Alasan: ${newVersion.changeReason}`
    );
  };

  // Waste Management
  const createWasteRecord = (data: Omit<WasteRecord, 'id' | 'wasteCode' | 'status'>) => {
    const code = `WST-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const id = `WST-${Date.now().toString().slice(-4)}`;
    const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

    const newWaste: WasteRecord = {
      ...data,
      id,
      wasteCode: code,
      status: isSuperAdmin ? 'APPROVED' : 'PENDING_APPROVAL',
      approvedBy: isSuperAdmin ? currentUser.name : undefined,
    };

    setWasteRecords((prev) => [newWaste, ...prev]);

    if (!isSuperAdmin) {
      const approvalItem: ApprovalItem = {
        id: `APP-${Date.now().toString().slice(-4)}`,
        type: 'WASTE_DISPOSAL',
        referenceId: id,
        referenceNumber: code,
        title: `Persetujuan Pembuangan Limbah: ${data.materialName} (${data.quantity} ${data.unit})`,
        requesterName: data.responsiblePerson,
        requestDate: data.date,
        priority: data.hazardCategory === 'B3_HAZARDOUS' ? 'HIGH' : 'LOW',
        status: 'PENDING',
        details: {
          wasteType: data.wasteType,
          quantity: `${data.quantity} ${data.unit}`,
          hazard: data.hazardCategory,
          handling: data.handlingMethod,
          disposal: data.disposalMethod,
        },
      };
      setApprovals((prev) => [approvalItem, ...prev]);
    }

    addAuditLog('CREATE', 'Waste Management', id, code, `Mencatat limbah baru: ${data.materialName} (${data.quantity} ${data.unit})`);
  };

  const updateWasteRecord = (id: string, updates: Partial<WasteRecord>) => {
    setWasteRecords((prev) =>
      prev.map((w) => {
        if (w.id === id) {
          return { ...w, ...updates };
        }
        return w;
      })
    );
    addAuditLog('UPDATE', 'Waste Management', id, id, `Memperbarui data limbah / hasil daur ulang & estimasi saving cost`);
  };

  // User Management
  const addUser = (userData: Omit<User, 'id' | 'lastLogin'>) => {
    if (currentUser.role !== 'SUPER_ADMIN') {
      addAuditLog('REJECT', 'User Management', 'DENIED', 'UNAUTHORIZED', `Percobaan penambahan akun dibatalkan: ${currentUser.name} (${currentUser.role}) bukan Super Admin.`);
      return;
    }

    const id = `USR-${Date.now().toString().slice(-4)}`;
    const newUser: User = {
      ...userData,
      id,
      lastLogin: 'Belum pernah login',
    };
    setUsers((prev) => [...prev, newUser]);
    addAuditLog('CREATE', 'User Management', id, newUser.email, `Membuat akun pengguna baru: ${newUser.name} (${newUser.role})`);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    if (currentUser.role !== 'SUPER_ADMIN') {
      addAuditLog('REJECT', 'User Management', id, 'UNAUTHORIZED', `Percobaan penyuntingan akun ${id} dibatalkan: ${currentUser.name} (${currentUser.role}) bukan Super Admin.`);
      return;
    }

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updated = { ...u, ...updates };
          if (currentUser.id === id) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
    addAuditLog('UPDATE', 'User Management', id, updates.name || id, `Memperbarui profil akun pengguna: ${updates.name || id}`);
  };

  const deleteUser = (id: string): { success: boolean; error?: string } => {
    if (currentUser.role !== 'SUPER_ADMIN') {
      addAuditLog('REJECT', 'User Management', id, 'UNAUTHORIZED', `Percobaan penghapusan akun ${id} dibatalkan: Bukan Super Admin.`);
      return { success: false, error: 'Akses ditolak: Hanya Super Admin / Supervisor R&D yang berwenang menghapus akun.' };
    }

    if (id === 'USR-001' || id === currentUser.id) {
      return { success: false, error: 'Tidak dapat menghapus akun Super Admin utama atau akun yang sedang aktif digunakan!' };
    }
    const target = users.find((u) => u.id === id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
    addAuditLog('DELETE', 'User Management', id, target?.name || id, `Menghapus akun pengguna: ${target?.name}`);
    return { success: true };
  };

  // Logbook
  const addLogbookEntry = (data: Omit<ResearchLogbookEntry, 'id' | 'version' | 'updatedAt'>) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const id = `LOG-${Date.now().toString().slice(-4)}`;

    const newEntry: ResearchLogbookEntry = {
      ...data,
      id,
      version: 1,
      updatedAt: now,
    };

    setLogbookEntries((prev) => [newEntry, ...prev]);
    addAuditLog('CREATE', 'Research Logbook', id, id, `Menulis entri logbook: "${data.title}"`);
  };

  // Documents
  const uploadDocument = (docData: Omit<DocumentRecord, 'id' | 'uploadDate' | 'documentNumber'>) => {
    const docNum = `DOC-${docData.category.slice(0, 3)}-${Date.now().toString().slice(-4)}`;
    const id = `DOC-${Date.now().toString().slice(-4)}`;
    const today = new Date().toISOString().slice(0, 10);

    const newDoc: DocumentRecord = {
      ...docData,
      id,
      documentNumber: docNum,
      uploadDate: today,
    };

    setDocuments((prev) => [newDoc, ...prev]);
    addAuditLog('CREATE', 'Document Management', id, docNum, `Mengunggah dokumen baru: "${docData.title}" (${docNum})`);
  };

  // Approvals
  const approveItem = (approvalId: string, reviewComments?: string) => {
    const app = approvals.find((a) => a.id === approvalId);
    if (!app) return;

    const today = new Date().toISOString().slice(0, 10);

    // Update approval status
    setApprovals((prev) =>
      prev.map((a) =>
        a.id === approvalId
          ? {
              ...a,
              status: 'APPROVED',
              approvedBy: currentUser.name,
              reviewedDate: today,
              reviewComments,
            }
          : a
      )
    );

    // Cascade approval to target entity
    if (app.type === 'RESEARCH_PROJECT') {
      setResearchProjects((prev) =>
        prev.map((rp) =>
          rp.id === app.referenceId
            ? { ...rp, status: 'EXPERIMENT', approvedBy: currentUser.name, approvalDate: today }
            : rp
        )
      );
    } else if (app.type === 'STOCK_ADJUSTMENT') {
      setStockAdjustments((prev) =>
        prev.map((sa) =>
          sa.id === app.referenceId
            ? { ...sa, status: 'APPROVED', approvedBy: currentUser.name }
            : sa
        )
      );
    } else if (app.type === 'WASTE_DISPOSAL') {
      setWasteRecords((prev) =>
        prev.map((w) =>
          w.id === app.referenceId
            ? { ...w, status: 'APPROVED', approvedBy: currentUser.name, disposalDate: today }
            : w
        )
      );
    } else if (app.type === 'PURCHASE_REQUEST') {
      setPurchaseRequests((prev) =>
        prev.map((pr) =>
          pr.id === app.referenceId
            ? { ...pr, status: 'APPROVED', approvedBy: currentUser.name }
            : pr
        )
      );
    } else if (app.type === 'FORMULA') {
      setFormulas((prev) =>
        prev.map((f) => {
          if (f.id === app.referenceId) {
            return {
              ...f,
              status: 'ACTIVE',
              versions: f.versions.map((v) =>
                v.approvalStatus === 'PENDING_APPROVAL'
                  ? { ...v, approvalStatus: 'APPROVED', approvedBy: currentUser.name, approvalDate: today }
                  : v
              ),
            };
          }
          return f;
        })
      );
    }

    addAuditLog('APPROVE', 'Approval Center', app.id, app.referenceNumber, `Menyetujui ${app.title}. Komentar: ${reviewComments || 'Disetujui tanpa catatan khusus.'}`);
    addNotification('SYSTEM', 'Approval Disetujui', `Permohonan ${app.title} telah disetujui oleh ${currentUser.name}.`, 'MEDIUM');
  };

  const rejectItem = (approvalId: string, reason: string) => {
    const app = approvals.find((a) => a.id === approvalId);
    if (!app) return;

    const today = new Date().toISOString().slice(0, 10);

    setApprovals((prev) =>
      prev.map((a) =>
        a.id === approvalId
          ? {
              ...a,
              status: 'REJECTED',
              approvedBy: currentUser.name,
              reviewedDate: today,
              reviewComments: reason,
            }
          : a
      )
    );

    if (app.type === 'PURCHASE_REQUEST') {
      setPurchaseRequests((prev) =>
        prev.map((pr) =>
          pr.id === app.referenceId ? { ...pr, status: 'REJECTED' } : pr
        )
      );
    } else if (app.type === 'STOCK_ADJUSTMENT') {
      setStockAdjustments((prev) =>
        prev.map((sa) =>
          sa.id === app.referenceId ? { ...sa, status: 'REJECTED' } : sa
        )
      );
    } else if (app.type === 'FORMULA') {
      setFormulas((prev) =>
        prev.map((f) => {
          if (f.id === app.referenceId) {
            return {
              ...f,
              status: 'ARCHIVED',
              versions: f.versions.map((v) =>
                v.approvalStatus === 'PENDING_APPROVAL'
                  ? { ...v, approvalStatus: 'REJECTED' }
                  : v
              ),
            };
          }
          return f;
        })
      );
    }

    addAuditLog('REJECT', 'Approval Center', app.id, app.referenceNumber, `Menolak ${app.title}. Alasan: ${reason}`);
    addNotification('SYSTEM', 'Approval Ditolak', `Permohonan ${app.title} ditolak oleh ${currentUser.name}. Alasan: ${reason}`, 'HIGH');
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const resetToInitialData = () => {
    setMaterials(INITIAL_MATERIALS);
    setLedger(INITIAL_LEDGER);
    setStockInRecords(INITIAL_STOCK_IN_RECORDS);
    setStockOutRecords(INITIAL_STOCK_OUT_RECORDS);
    setStockAdjustments(INITIAL_STOCK_ADJUSTMENTS);
    setPurchaseRequests(INITIAL_PURCHASE_REQUESTS);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setResearchProjects(INITIAL_RESEARCH_PROJECTS);
    setExperiments(INITIAL_EXPERIMENTS);
    setLabTests(INITIAL_LAB_TESTS);
    setSamples(INITIAL_SAMPLES);
    setFormulas(INITIAL_FORMULAS);
    setWasteRecords(INITIAL_WASTE_RECORDS);
    setLogbookEntries(INITIAL_LOGBOOK);
    setDocuments(INITIAL_DOCUMENTS);
    setApprovals(INITIAL_APPROVALS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCurrentUser(INITIAL_USERS[0]);
    localStorage.clear();
    addAuditLog('UPDATE', 'System Settings', 'RESET', 'FACTORY_RESET', 'Mereset seluruh data aplikasi ke kondisi awal pabrik.');
  };

  return (
    <LimsContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        addUser,
        updateUser,
        deleteUser,
        activeTab,
        setActiveTab,
        materials,
        addMaterial,
        updateMaterial,
        deleteMaterial,
        ledger,
        stockInRecords,
        stockOutRecords,
        stockAdjustments,
        processStockIn,
        processStockOut,
        processStockAdjustment,
        suppliers,
        purchaseRequests,
        purchaseOrders,
        createPurchaseRequest,
        createPurchaseOrder,
        receiveGoodsPO,
        researchProjects,
        experiments,
        labTests,
        samples,
        formulas,
        createResearchProject,
        updateResearchProject,
        createExperiment,
        createLabTest,
        createSample,
        createFormula,
        addFormulaVersion,
        wasteRecords,
        createWasteRecord,
        updateWasteRecord,
        logbookEntries,
        addLogbookEntry,
        documents,
        uploadDocument,
        approvals,
        approveItem,
        rejectItem,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        auditLogs,
        addAuditLog,
        resetToInitialData,
      }}
    >
      {children}
    </LimsContext.Provider>
  );
};

export const useLims = () => {
  const context = useContext(LimsContext);
  if (!context) {
    throw new Error('useLims must be used within a LimsProvider');
  }
  return context;
};
