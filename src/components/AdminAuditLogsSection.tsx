import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Trash2,
  CheckCircle,
  Clock,
  User,
  Search,
  Download,
  Filter,
  RefreshCw,
  AlertTriangle,
  Info,
  Calendar,
  Stethoscope,
  Package,
  Layers,
  FileText,
  ArrowRight,
} from 'lucide-react';
import {
  CriticalAuditLog,
  getCriticalAuditLogs,
  downloadAuditLogsCsv,
  AuditSeverity,
} from '../services/auditLoggerService';

interface AdminAuditLogsSectionProps {
  isUrdu?: boolean;
  onNavigateTab?: (tab: string) => void;
}

export const AdminAuditLogsSection: React.FC<AdminAuditLogsSectionProps> = ({
  isUrdu = false,
  onNavigateTab,
}) => {
  const [logs, setLogs] = useState<CriticalAuditLog[]>(() => getCriticalAuditLogs());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<'all' | AuditSeverity>('all');
  const [selectedActionGroup, setSelectedActionGroup] = useState<'all' | 'deletions' | 'appointments' | 'products' | 'doctors'>('all');

  const refreshLogs = () => {
    setLogs(getCriticalAuditLogs());
  };

  // Filtered logs
  const filteredLogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return logs.filter((log) => {
      // Severity Filter
      if (selectedSeverity !== 'all' && log.severity !== selectedSeverity) return false;

      // Category Action Group Filter
      if (selectedActionGroup === 'deletions') {
        if (!log.action.includes('DELETED')) return false;
      } else if (selectedActionGroup === 'appointments') {
        if (!log.action.startsWith('APPOINTMENT_')) return false;
      } else if (selectedActionGroup === 'products') {
        if (!log.action.startsWith('PRODUCT_')) return false;
      } else if (selectedActionGroup === 'doctors') {
        if (!log.action.startsWith('DOCTOR_')) return false;
      }

      // Query Search
      if (q) {
        const matchAction = (log.actionLabelEnglish || '').toLowerCase().includes(q) || (log.actionLabelUrdu || '').includes(q);
        const matchEntity = (log.entityName || '').toLowerCase().includes(q) || (log.entityId || '').toLowerCase().includes(q);
        const matchStaff = (log.staffName || '').toLowerCase().includes(q) || (log.staffRole || '').toLowerCase().includes(q);
        const matchDetails = (log.details || '').toLowerCase().includes(q) || (log.detailsUrdu || '').includes(q);
        return matchAction || matchEntity || matchStaff || matchDetails;
      }

      return true;
    });
  }, [logs, searchQuery, selectedSeverity, selectedActionGroup]);

  // Statistics
  const stats = useMemo(() => {
    let criticalCount = 0;
    let appointmentChanges = 0;
    let deletionCount = 0;
    const staffSet = new Set<string>();

    logs.forEach((l) => {
      if (l.severity === 'critical') criticalCount++;
      if (l.action.startsWith('APPOINTMENT_STATUS')) appointmentChanges++;
      if (l.action.includes('DELETED')) deletionCount++;
      if (l.staffName) staffSet.add(l.staffName);
    });

    return {
      total: logs.length,
      criticalCount,
      appointmentChanges,
      deletionCount,
      staffCount: staffSet.size,
    };
  }, [logs]);

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      const dateStr = d.toLocaleDateString(isUrdu ? 'ur-PK' : 'en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const timeStr = d.toLocaleTimeString(isUrdu ? 'ur-PK' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      return { dateStr, timeStr };
    } catch (_) {
      return { dateStr: iso, timeStr: '' };
    }
  };

  const getRelativeTime = (iso: string) => {
    try {
      const diffMs = Date.now() - new Date(iso).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return isUrdu ? 'ابھی' : 'Just now';
      if (diffMins < 60) return isUrdu ? `${diffMins} منٹ پہلے` : `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return isUrdu ? `${diffHours} گھنٹے پہلے` : `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return isUrdu ? `${diffDays} دن پہلے` : `${diffDays}d ago`;
    } catch (_) {
      return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-7 rounded-3xl text-white shadow-xl flex flex-wrap items-center justify-between gap-4 border border-slate-700">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            </span>
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-rose-300">
              {isUrdu ? 'سیکیورٹی آڈٹ ٹریل و احتساب' : 'Audit Trail & Operations Accountability'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {isUrdu ? 'کریٹیکل آپریشنز و تبدیلیوں کا ریکارڈ' : 'Critical Operations & Security Audit Log'}
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            {isUrdu
              ? 'ڈاکٹرز یا ادویات کے حذف ہونے اور مریضوں کی اپائنٹمنٹ اسٹیٹس تبدیلیوں کا خودکار ریکارڈ۔ معائنہ کار، وقت اور تبدیل شدہ تفصیلات شفافیت کے ساتھ محفوظ ہیں۔'
              : 'Tamper-evident operational logging for doctor deletions, pharmacy catalog purges, and appointment lifecycle changes with full staff attribution.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={refreshLogs}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-slate-200 rounded-xl transition-all cursor-pointer border border-white/10 shadow-xs"
            title={isUrdu ? 'تازہ ترین ریکارڈ لائیں' : 'Refresh audit records'}
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => downloadAuditLogsCsv(filteredLogs)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isUrdu ? 'ایکسپورٹ CSV رپورٹ' : 'Export Audit CSV'}</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>{isUrdu ? 'کل آپریشنز' : 'Total Operations'}</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">{stats.total}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {isUrdu ? 'تمام ریکارڈ شدہ ایونٹس' : 'Active system audit events'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-2xs">
          <div className="flex items-center justify-between text-rose-600 text-xs font-bold">
            <span>{isUrdu ? 'حذف شدہ ریکارڈز' : 'Total Deletions'}</span>
            <Trash2 className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 mt-2 font-mono">{stats.deletionCount}</div>
          <div className="text-[11px] text-rose-800 mt-0.5">
            {isUrdu ? 'ڈاکٹرز، پروڈکٹس، بیماری' : 'Doctors & product purges'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-2xs">
          <div className="flex items-center justify-between text-blue-600 text-xs font-bold">
            <span>{isUrdu ? 'اپائنٹمنٹ تبدیلیاں' : 'Status Transitions'}</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-700 mt-2 font-mono">{stats.appointmentChanges}</div>
          <div className="text-[11px] text-blue-800 mt-0.5">
            {isUrdu ? 'منظور، مکمل، یا منسوخ' : 'Approved, Completed, Cancelled'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-bold">
            <span>{isUrdu ? 'شامل اسٹاف ممبرز' : 'Staff Members'}</span>
            <User className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-800 mt-2 font-mono">{stats.staffCount}</div>
          <div className="text-[11px] text-emerald-800 mt-0.5">
            {isUrdu ? 'جوابدہ صارفین' : 'Responsible team members'}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isUrdu
                  ? 'ڈاکٹر کا نام، دوا، مریض، یا اسٹاف ممبر تلاش کریں...'
                  : 'Search by doctor, product, patient, staff name, or action...'
              }
              className="w-full text-xs font-medium pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
            />
          </div>

          {/* Severity Badges */}
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <span className="text-slate-600 text-[11px] mr-1">{isUrdu ? 'شدت:' : 'Severity:'}</span>
            {(['all', 'critical', 'warning', 'info'] as const).map((sev) => (
              <button
                key={sev}
                type="button"
                onClick={() => setSelectedSeverity(sev)}
                className={`px-2.5 py-1 rounded-lg transition-all capitalize cursor-pointer ${
                  selectedSeverity === sev
                    ? sev === 'critical'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : sev === 'warning'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : sev === 'info'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Action Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-100 text-xs font-bold scrollbar-none">
          <span className="text-slate-600 text-[11px] shrink-0 mr-1">{isUrdu ? 'کیٹیگری:' : 'Category:'}</span>
          {[
            { id: 'all', label: isUrdu ? 'تمام لاگز' : 'All Operations' },
            { id: 'deletions', label: isUrdu ? 'حذف شدہ (Deletions)' : 'Deletions Only' },
            { id: 'appointments', label: isUrdu ? 'اپائنٹمنٹس تبدیلیاں' : 'Appointments' },
            { id: 'doctors', label: isUrdu ? 'ڈاکٹرز ریکارڈز' : 'Doctors' },
            { id: 'products', label: isUrdu ? 'فارمیسی و ادویات' : 'Pharmacy Products' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedActionGroup(cat.id as any)}
              className={`px-3 py-1 rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                selectedActionGroup === cat.id
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-200 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table / Feed */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">
              {isUrdu ? 'کوئی متعلقہ ریکارڈ نہیں ملا' : 'No matching audit records found'}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {isUrdu
                ? 'موجودہ فلٹرز میں کوئی کریٹیکل ایکشن موجود نہیں ہے۔ تلاش کا لفظ تبدیل کریں۔'
                : 'No critical deletion or transition matches your selected filters.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLogs.map((log) => {
              const { dateStr, timeStr } = formatTimestamp(log.timestamp);
              const relativeTime = getRelativeTime(log.timestamp);

              const isDelete = log.action.includes('DELETED');
              const isStatusChange = log.action.startsWith('APPOINTMENT_STATUS');

              return (
                <div
                  key={log.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left: Action Icon, Type, and Entity Details */}
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                        log.severity === 'critical'
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : log.severity === 'warning'
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : 'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {isDelete ? (
                        <Trash2 className="w-5 h-5 text-rose-600" />
                      ) : isStatusChange ? (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      ) : log.entityType === 'Doctor' ? (
                        <Stethoscope className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Package className="w-5 h-5 text-purple-600" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                            log.severity === 'critical'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : log.severity === 'warning'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {isUrdu ? log.actionLabelUrdu : log.actionLabelEnglish}
                        </span>

                        <span className="text-xs font-mono font-bold text-slate-600">
                          [{log.id}]
                        </span>

                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {log.entityType}
                        </span>
                      </div>

                      <div className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                        <span>{log.entityName}</span>
                        {log.entityId && (
                          <span className="text-xs font-mono text-slate-600 font-semibold">
                            (ID: {log.entityId})
                          </span>
                        )}
                      </div>

                      {/* Transition Badge if status changed */}
                      {log.previousValue && log.newValue && (
                        <div className="flex items-center gap-1.5 text-xs font-bold pt-0.5">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 line-through">
                            {log.previousValue}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                            {log.newValue}
                          </span>
                        </div>
                      )}

                      <p className="text-xs text-slate-600 leading-relaxed max-w-2xl pt-0.5">
                        {isUrdu && log.detailsUrdu ? log.detailsUrdu : log.details}
                      </p>
                    </div>
                  </div>

                  {/* Right: Staff Attribution & Timestamp */}
                  <div className="flex md:flex-col items-center md:items-end justify-between gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
                    {/* Responsible Staff Member */}
                    <div className="flex items-center gap-2 md:text-right">
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 order-first md:order-last">
                        {log.staffName.slice(0, 1)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{log.staffName}</div>
                        <div className="text-[10px] text-emerald-800 font-semibold">{log.staffRole}</div>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="text-right text-[11px] text-slate-500 font-medium">
                      <div className="font-mono text-slate-700">{dateStr} {timeStr}</div>
                      {relativeTime && (
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                          {relativeTime}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
