export type UserRole = 'SUPER_ADMIN' | 'ADMIN_RD';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  department: string;
  avatar: string;
  status: 'ACTIVE' | 'INACTIVE';
  lastLogin: string;
  phone?: string;
  password?: string;
}

export type MaterialCategory = 'METAL' | 'ENAMEL' | 'CHEMICAL' | 'PACKAGING' | 'OTHER';

export interface Material {
  id: string;
  code: string;
  name: string;
  category: MaterialCategory;
  subCategory: string;
  description: string;
  specification: string;
  brand: string;
  supplierId: string;
  supplierName: string;
  unit: string;
  minimumStock: number;
  maximumStock: number;
  currentStock: number;
  reservedStock: number;
  unitCost: number; // in IDR
  reorderPoint: number;
  safetyStock: number;
  batchNumber: string;
  lotNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  storageLocation: string;
  status: 'AVAILABLE' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRED' | 'ARCHIVED';
  msdsDocumentUrl?: string;
  photoUrl?: string;
  createdBy: string;
  createdDate: string;
  updatedBy: string;
  updatedDate: string;
}

export type TransactionType = 
  | 'STOCK_IN' 
  | 'STOCK_OUT' 
  | 'RESEARCH_USAGE' 
  | 'SAMPLE_USAGE' 
  | 'WASTE' 
  | 'ADJUSTMENT' 
  | 'RETURN' 
  | 'TRANSFER';

export interface InventoryLedger {
  id: string;
  transactionNumber: string;
  date: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  type: TransactionType;
  quantityChange: number; // positive or negative
  previousStock: number;
  currentStock: number;
  unit: string;
  referenceId?: string; // PO ID, Research ID, Experiment ID, etc.
  referenceNumber?: string;
  purpose?: string;
  requestedBy: string;
  approvedBy?: string;
  notes?: string;
}

export interface StockInRecord {
  id: string;
  transactionNumber: string;
  date: string;
  materialId: string;
  materialName: string;
  supplierId: string;
  supplierName: string;
  purchaseOrderId?: string;
  purchaseOrderNumber?: string;
  batchNumber: string;
  lotNumber: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  receivedBy: string;
  storageLocation: string;
  expiryDate: string;
  qcStatus: 'PENDING_QC' | 'APPROVED' | 'REJECTED';
  qcInspector?: string;
  qcNotes?: string;
  notes?: string;
  attachment?: string;
}

export interface StockOutRecord {
  id: string;
  transactionNumber: string;
  date: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  purpose: 'RESEARCH' | 'TRIAL' | 'PRODUCTION_TRIAL' | 'SAMPLE' | 'TESTING' | 'OTHER';
  researchProjectId?: string;
  researchProjectTitle?: string;
  experimentId?: string;
  experimentNumber?: string;
  requestedBy: string;
  approvedBy: string;
  notes?: string;
}

export interface StockAdjustmentRecord {
  id: string;
  transactionNumber: string;
  date: string;
  materialId: string;
  materialName: string;
  systemStock: number;
  actualStock: number;
  difference: number;
  unit: string;
  reason: string;
  requestedBy: string;
  approvedBy?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  materialsSupplied: string[];
  internalRating: number; // 1 to 5
  status: 'ACTIVE' | 'INACTIVE';
  paymentTerms: string;
  notes?: string;
}

export type POStatus = 
  | 'DRAFT' 
  | 'SUBMITTED' 
  | 'APPROVED' 
  | 'ORDERED' 
  | 'PARTIALLY_RECEIVED' 
  | 'RECEIVED' 
  | 'CLOSED' 
  | 'REJECTED';

export interface POItem {
  id: string;
  materialId: string;
  materialName: string;
  materialCode: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  receivedQuantity: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  poDate: string;
  expectedDelivery: string;
  items: POItem[];
  subTotal: number;
  tax: number; // 11% PPN
  grandTotal: number;
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID';
  deliveryStatus: POStatus;
  requestedBy: string;
  approvedBy?: string;
  notes?: string;
  createdDate: string;
}

export interface PurchaseRequest {
  id: string;
  prNumber: string;
  requestDate: string;
  requestedBy: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  requiredDate: string;
  purpose: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CONVERTED_TO_PO';
  approvedBy?: string;
  notes?: string;
}

export type ResearchCategory = 
  | 'NEW_PRODUCT_DEVELOPMENT' 
  | 'PRODUCT_IMPROVEMENT' 
  | 'COST_REDUCTION' 
  | 'MATERIAL_RESEARCH' 
  | 'ENAMEL_RESEARCH' 
  | 'FORMULA_DEVELOPMENT' 
  | 'QUALITY_IMPROVEMENT' 
  | 'PROCESS_IMPROVEMENT';

export type ResearchStatus = 
  | 'DRAFT' 
  | 'PLANNING' 
  | 'EXPERIMENT' 
  | 'TESTING' 
  | 'REVIEW' 
  | 'APPROVED' 
  | 'COMPLETED' 
  | 'ARCHIVED';

export interface ResearchProject {
  id: string;
  title: string;
  code: string;
  category: ResearchCategory;
  productTarget: string; // e.g. "Wajan Wok Enamel 32cm", "Panci Dutch Oven Cast Iron 24cm"
  objective: string;
  background: string;
  problemStatement: string;
  targetMetric: string;
  startDate: string;
  targetCompletion: string;
  actualCompletion?: string;
  pic: string;
  teamMembers: string[];
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: ResearchStatus;
  budget: number;
  actualSpent: number;
  materialsRequired: { materialId: string; materialName: string; estimatedQty: number; unit: string }[];
  documentsCount: number;
  approvedBy?: string;
  approvalDate?: string;
  conclusion?: string;
  createdDate: string;
  updatedDate: string;
}

export type ExperimentStatus = 
  | 'PLANNED' 
  | 'IN_PROGRESS' 
  | 'TESTING' 
  | 'COMPLETED' 
  | 'FAILED' 
  | 'APPROVED';

export interface ExperimentMaterialUsage {
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  batchNumber?: string;
}

export interface Experiment {
  id: string;
  experimentNumber: string;
  researchProjectId: string;
  researchProjectTitle: string;
  experimentDate: string;
  objective: string;
  materialsUsed: ExperimentMaterialUsage[];
  formulaId?: string;
  formulaName?: string;
  formulaVersion?: string;
  processParameters: {
    temperature: number; // °C (e.g. 830°C for enamel firing)
    firingTime: number; // minutes
    slipViscosity?: string; // Ford Cup #4 seconds
    slipDensity?: number; // g/cm³
    applicationMethod: string; // Dipping, Spraying, Flow coating
    pressure?: number; // bar
    mixingSpeed?: string; // RPM
  };
  equipment: string;
  operator: string;
  sampleIds: string[];
  observation: string;
  result: string;
  conclusion: string;
  status: ExperimentStatus;
  success: boolean;
  notes?: string;
}

export type TestType = 
  | 'THICKNESS_TEST' 
  | 'ADHESION_TEST' 
  | 'HARDNESS_TEST' 
  | 'THERMAL_SHOCK_TEST' 
  | 'ACID_RESISTANCE_TEST' 
  | 'BOILING_WATER_TEST' 
  | 'IMPACT_TEST' 
  | 'COLOR_GLOSS_TEST' 
  | 'SURFACE_PINHOLE_TEST' 
  | 'CHEMICAL_DISHWASHER_TEST';

export interface LaboratoryTest {
  id: string;
  testCode: string;
  sampleId: string;
  sampleCode: string;
  researchProjectId: string;
  researchProjectTitle: string;
  experimentId?: string;
  testType: TestType;
  testName: string;
  testDate: string;
  methodStandard: string; // e.g. "ISO 2409 / ASTM D3359", "ISO 28706-1"
  specificationTarget: string;
  resultValue: string;
  numericResult?: number;
  unit: string;
  minLimit?: number;
  maxLimit?: number;
  status: 'PASS' | 'FAIL' | 'PENDING';
  testedBy: string;
  verifiedBy?: string;
  remarks: string;
  attachmentName?: string;
}

export interface Sample {
  id: string;
  sampleCode: string;
  researchProjectId: string;
  researchProjectTitle: string;
  experimentId?: string;
  experimentNumber?: string;
  productName: string; // e.g. "Coupons Enamel 100x100mm SUS 304", "Wajan Wok Prototype #03"
  substrateMaterial: string;
  enamelSystem: string;
  batchNumber: string;
  quantity: number;
  unit: string;
  storageLocation: string; // e.g. "Cabinet R-01, Rack B"
  dateCreated: string;
  retentionDate: string;
  status: 'REGISTERED' | 'TESTING' | 'RETAINED' | 'DISPOSED' | 'APPROVED';
  overallTestStatus: 'PASS' | 'FAIL' | 'PENDING' | 'NOT_TESTED';
  qrPayload: string;
  notes?: string;
}

export interface FormulaComponent {
  materialId: string;
  materialName: string;
  percentage: number; // 0 - 100
  notes?: string;
}

export interface FormulaVersion {
  version: string; // e.g. "1.0", "1.1", "2.0"
  components: FormulaComponent[];
  solidsContentPercent?: number;
  recommendedViscosity?: string;
  recommendedFiringTemp?: number;
  changeReason: string;
  changedBy: string;
  date: string;
  approvalStatus: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  approvalDate?: string;
}

export interface Formula {
  id: string;
  code: string;
  name: string; // e.g. "Formula Enamel Ground Coat Series A-10"
  type: 'GROUND_COAT' | 'COVER_COAT' | 'DIRECT_ON' | 'SPECIAL_EFFECT';
  applicableSubstrate: string; // e.g. "Cast Iron", "Decarburized Steel", "Stainless 304"
  currentVersion: string;
  versions: FormulaVersion[];
  status: 'ACTIVE' | 'SUPERSEDED' | 'ARCHIVED';
  createdBy: string;
  createdDate: string;
  description: string;
}

export type WasteType = 
  | 'CHEMICAL_WASTE' 
  | 'METAL_WASTE' 
  | 'ENAMEL_WASTE' 
  | 'CONTAMINATED_MATERIAL' 
  | 'FAILED_EXPERIMENT' 
  | 'EXPIRED_MATERIAL' 
  | 'PRODUCTION_TRIAL_WASTE' 
  | 'OTHER';

export interface WasteRecord {
  id: string;
  wasteCode: string;
  date: string;
  materialId?: string;
  materialName: string;
  source: 'EXPERIMENT' | 'TRIAL' | 'EXPIRY' | 'LAB_CLEANING' | 'SAMPLE_SCRAP';
  researchProjectId?: string;
  researchProjectTitle?: string;
  experimentId?: string;
  wasteType: WasteType;
  hazardCategory: 'B3_HAZARDOUS' | 'NON_B3';
  quantity: number;
  unit: string;
  reason: string;
  storageLocation: string; // e.g. "TPS Limbah B3 Ruang R-05"
  handlingMethod: string;
  disposalMethod: string; // e.g. "Licensed Hazardous Waste Transporter PT Wastec"
  estimatedDisposalCost: number; // IDR
  isRecycled?: boolean;
  recycleResult?: string; // Hasil pemanfaatan daur ulang
  recycledQuantity?: number;
  recycledUnit?: string;
  recycleMethod?: string;
  savingCost?: number; // Estimasi saving cost (IDR)
  responsiblePerson: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'DISPOSED' | 'REJECTED';
  approvedBy?: string;
  disposalDate?: string;
  manifestNumber?: string;
}

export interface ResearchLogbookEntry {
  id: string;
  date: string;
  researchProjectId: string;
  researchProjectTitle: string;
  experimentId?: string;
  experimentNumber?: string;
  title: string;
  hypothesis: string;
  procedure: string;
  observations: string;
  resultsSummary: string;
  problemsEncountered?: string;
  solutionImplemented?: string;
  conclusion: string;
  nextSteps: string;
  author: string;
  attachments?: { name: string; size: string; type: string }[];
  version: number;
  updatedAt: string;
}

export type DocumentCategory = 
  | 'RESEARCH_REPORT' 
  | 'SOP' 
  | 'WORK_INSTRUCTION' 
  | 'TEST_REPORT' 
  | 'COA' 
  | 'MSDS_SDS' 
  | 'FORMULA_SHEET' 
  | 'SPECIFICATION' 
  | 'PURCHASE_DOCUMENT' 
  | 'CERTIFICATE' 
  | 'PHOTO' 
  | 'OTHER';

export interface DocumentRecord {
  id: string;
  documentNumber: string;
  title: string;
  category: DocumentCategory;
  version: string;
  fileFormat: 'PDF' | 'DOCX' | 'XLSX' | 'JPG' | 'PNG';
  fileSize: string;
  uploadDate: string;
  uploadedBy: string;
  relatedEntityId?: string; // Material ID, Research ID, Test ID, PO ID
  relatedEntityType?: string;
  tags: string[];
  status: 'APPROVED' | 'PENDING_APPROVAL' | 'DRAFT';
  approvedBy?: string;
  description: string;
}

export type ApprovalType = 
  | 'RESEARCH_PROJECT' 
  | 'STOCK_ADJUSTMENT' 
  | 'FORMULA' 
  | 'PURCHASE_ORDER' 
  | 'PURCHASE_REQUEST' 
  | 'WASTE_DISPOSAL' 
  | 'DOCUMENT';

export interface ApprovalItem {
  id: string;
  type: ApprovalType;
  referenceId: string;
  referenceNumber: string;
  title: string;
  requesterName: string;
  requestDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  details: Record<string, any>;
  reviewComments?: string;
  approvedBy?: string;
  reviewedDate?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'STOCK_IN' | 'STOCK_OUT' | 'LOGIN' | 'LOGOUT';
  module: string; // e.g. "Raw Material", "Inventory", "Research Project", "Experiment", "Formula", "Waste", "Purchasing"
  recordId: string;
  recordIdentifier: string; // code or title
  beforeState?: string;
  afterState?: string;
  details: string;
  ipAddress: string;
}

export interface AppNotification {
  id: string;
  type: 'LOW_STOCK' | 'EXPIRED_MATERIAL' | 'PO_DELAY' | 'APPROVAL_NEEDED' | 'EXPERIMENT_COMPLETED' | 'TEST_FAILED' | 'SYSTEM';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  actionLink?: string;
  referenceId?: string;
}
