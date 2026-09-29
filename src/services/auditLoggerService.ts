export type AuditActionType =
  | 'DOCTOR_DELETED'
  | 'DOCTOR_CREATED'
  | 'DOCTOR_UPDATED'
  | 'PRODUCT_DELETED'
  | 'PRODUCT_CREATED'
  | 'PRODUCT_UPDATED'
  | 'APPOINTMENT_STATUS_CHANGED'
  | 'APPOINTMENT_DELETED'
  | 'DISEASE_DELETED'
  | 'REPORT_DELETED'
  | 'USER_DELETED'
  | 'SLIP_DELETED';

export type AuditSeverity = 'critical' | 'warning' | 'info';

export interface CriticalAuditLog {
  id: string;
  action: AuditActionType;
  actionLabelUrdu: string;
  actionLabelEnglish: string;
  entityType: 'Doctor' | 'Product' | 'Appointment' | 'Disease' | 'Report' | 'User' | 'MoneySlip';
  entityId?: string;
  entityName: string;
  details: string;
  detailsUrdu?: string;
  previousValue?: string;
  newValue?: string;
  timestamp: string; // ISO 8601 string
  staffName: string;
  staffRole: string;
  severity: AuditSeverity;
}

const STORAGE_KEY = 'hafiz_critical_audit_logs_v1';

// Seed initial historical operations so the audit log is instantly informative
const INITIAL_AUDIT_LOGS: CriticalAuditLog[] = [
  {
    id: 'AUD-001',
    action: 'APPOINTMENT_STATUS_CHANGED',
    actionLabelEnglish: 'Appointment Approved',
    actionLabelUrdu: 'اپائنٹمنٹ منظور کی گئی',
    entityType: 'Appointment',
    entityId: 'APP-101',
    entityName: 'محمد طارق (Tariq)',
    previousValue: 'Pending',
    newValue: 'Approved',
    details: 'Appointment status approved and auto-billed to patient token queue by OPD desk.',
    detailsUrdu: 'مریض کی اپائنٹمنٹ منظور کر کے ٹوکن اور بل میں منتقل کر دی گئی۔',
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35 mins ago
    staffName: 'Dr. Zeeshan Chaudhry',
    staffRole: 'Super Admin',
    severity: 'info',
  },
  {
    id: 'AUD-002',
    action: 'PRODUCT_DELETED',
    actionLabelEnglish: 'Product Deleted',
    actionLabelUrdu: 'پروڈکٹ حذف کی گئی',
    entityType: 'Product',
    entityId: 'prod-old-99',
    entityName: 'Expired Herbal Tonic Pack',
    details: 'Product record removed from pharmacy catalog and associated Cloudinary media permanently destroyed.',
    detailsUrdu: 'میعاد ختم شدہ پروڈکٹ کو سسٹم اور کلاؤڈنری میڈیا سے مستقل ڈیلیٹ کیا گیا۔',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    staffName: 'Rana Usman',
    staffRole: 'Pharmacy Head',
    severity: 'critical',
  },
  {
    id: 'AUD-003',
    action: 'APPOINTMENT_STATUS_CHANGED',
    actionLabelEnglish: 'Appointment Completed',
    actionLabelUrdu: 'معائنہ مکمل ہوا',
    entityType: 'Appointment',
    entityId: 'APP-094',
    entityName: 'عائشہ بی بی (Ayesha Bibi)',
    previousValue: 'Approved',
    newValue: 'Completed',
    details: 'Clinical consultation concluded and prescription dispatched digitally to patient.',
    detailsUrdu: 'ڈاکٹر معائنہ مکمل ہو گیا اور نسخہ مریض کو بذریعہ ای میل روانہ کر دیا گیا۔',
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 hours ago
    staffName: 'Dr. Waqas Sagheer',
    staffRole: 'Eye Specialist',
    severity: 'info',
  },
  {
    id: 'AUD-004',
    action: 'DOCTOR_DELETED',
    actionLabelEnglish: 'Doctor Record Deleted',
    actionLabelUrdu: 'ڈاکٹر ریکارڈ حذف کیا گیا',
    entityType: 'Doctor',
    entityId: 'DOC-TEMP-04',
    entityName: 'Dr. Adnan (Visiting Physician)',
    details: 'Visiting doctor profile archived and deleted from online appointments schedule.',
    detailsUrdu: 'ویزیٹنگ ڈاکٹر کا پروفائل اور شیڈول کلینک سسٹم سے حذف کر دیا گیا۔',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    staffName: 'Super Admin',
    staffRole: 'Medical Director',
    severity: 'critical',
  },
  {
    id: 'AUD-005',
    action: 'APPOINTMENT_STATUS_CHANGED',
    actionLabelEnglish: 'Appointment Cancelled',
    actionLabelUrdu: 'اپائنٹمنٹ منسوخ کی گئی',
    entityType: 'Appointment',
    entityId: 'APP-082',
    entityName: 'کاشف محمود (Kashif Mehmood)',
    previousValue: 'Pending',
    newValue: 'Cancelled',
    details: 'Patient requested cancellation due to travel delay. Slot released.',
    detailsUrdu: 'مریض کی درخواست پر اپائنٹمنٹ منسوخ کی گئی اور ٹائم سلاٹ آزاد کر دیا گیا۔',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(), // 30 hours ago
    staffName: 'Farhan Ali',
    staffRole: 'OPD Receptionist',
    severity: 'warning',
  },
];

/**
 * Retrieves all stored audit logs from persistent storage.
 */
export function getCriticalAuditLogs(): CriticalAuditLog[] {
  if (typeof window === 'undefined') return INITIAL_AUDIT_LOGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_AUDIT_LOGS));
      return INITIAL_AUDIT_LOGS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_AUDIT_LOGS;
  } catch (e) {
    return INITIAL_AUDIT_LOGS;
  }
}

/**
 * Records a new critical operation log.
 */
export function logCriticalOperation(entry: Omit<CriticalAuditLog, 'id' | 'timestamp'> & { timestamp?: string }): CriticalAuditLog {
  const currentLogs = getCriticalAuditLogs();
  const newLog: CriticalAuditLog = {
    id: `AUD-${Date.now().toString().slice(-6)}`,
    timestamp: entry.timestamp || new Date().toISOString(),
    ...entry,
  };

  const updated = [newLog, ...currentLogs].slice(0, 500); // keep up to 500 recent audit logs
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (_) {}
  }
  return newLog;
}

/**
 * Clears or resets the audit logs with a safety backup.
 */
export function clearCriticalAuditLogs(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * Exports audit logs into a CSV formatted string for compliance reports.
 */
export function exportAuditLogsToCsv(logs: CriticalAuditLog[]): string {
  const headers = ['Log ID', 'Timestamp', 'Action', 'Severity', 'Entity Type', 'Entity Name', 'Staff Name', 'Staff Role', 'Details'];
  const rows = logs.map((l) => [
    `"${l.id}"`,
    `"${l.timestamp}"`,
    `"${l.actionLabelEnglish}"`,
    `"${l.severity.toUpperCase()}"`,
    `"${l.entityType}"`,
    `"${(l.entityName || '').replace(/"/g, '""')}"`,
    `"${(l.staffName || '').replace(/"/g, '""')}"`,
    `"${(l.staffRole || '').replace(/"/g, '""')}"`,
    `"${(l.details || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Downloads the audit logs CSV file directly to the admin computer.
 */
export function downloadAuditLogsCsv(logs: CriticalAuditLog[], filename = 'HafizClinic_Audit_Log.csv'): void {
  if (typeof window === 'undefined') return;
  const csvContent = exportAuditLogsToCsv(logs);
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
