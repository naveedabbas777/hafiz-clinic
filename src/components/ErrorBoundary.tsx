import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  AlertTriangle,
  RefreshCw,
  Home,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Stethoscope,
  Terminal,
} from 'lucide-react';

export interface ErrorLogEntry {
  id: string;
  timestamp: string;
  message: string;
  stack?: string;
  componentStack?: string;
  viewContext?: string;
  url: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((props: { error: Error; reset: () => void }) => ReactNode);
  isUrdu?: boolean;
  onReset?: () => void;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  viewContext?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  copied: boolean;
}

/**
 * Hospital System Error Boundary
 * Catches runtime React rendering errors, logs diagnostic telemetry to local storage,
 * and presents a resilient, reassuring bilingual medical recovery screen.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  props: ErrorBoundaryProps;
  state: ErrorBoundaryState;
  // @ts-ignore
  setState: (state: Partial<ErrorBoundaryState> | ((prevState: ErrorBoundaryState) => Partial<ErrorBoundaryState>)) => void;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      copied: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // 1. Structured console diagnostic logging
    console.error(
      '%c[Hafiz Clinic Telemetry] Caught Runtime System Exception:',
      'background: #064e3b; color: #a7f3d0; font-weight: bold; padding: 4px 8px; border-radius: 4px;',
      error,
      errorInfo
    );

    // 2. Persist diagnostic crash report in localStorage for admin audit / debugging
    try {
      const existingLogsRaw = localStorage.getItem('hafiz_clinic_runtime_error_logs');
      const existingLogs: ErrorLogEntry[] = existingLogsRaw ? JSON.parse(existingLogsRaw) : [];

      const newLog: ErrorLogEntry = {
        id: `err-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        message: error.message || 'Unknown runtime error',
        stack: error.stack,
        componentStack: errorInfo.componentStack || undefined,
        viewContext: this.props.viewContext || window.location.hash || 'clinical-workspace',
        url: window.location.href,
      };

      // Retain last 20 crash logs to prevent localStorage bloat
      const updatedLogs = [newLog, ...existingLogs].slice(0, 20);
      localStorage.setItem('hafiz_clinic_runtime_error_logs', JSON.stringify(updatedLogs));
    } catch (e) {
      console.warn('Unable to write error log to localStorage:', e);
    }

    // 3. Trigger optional onError prop callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetErrorBoundary = () => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      copied: false,
    });
  };

  handleCopyDiagnostics = () => {
    const { error, errorInfo } = this.state;
    const diagnosticPayload = {
      hospital: 'Hafiz Clinic Healthcare System',
      timestamp: new Date().toLocaleString(),
      errorMessage: error?.message || 'Unknown',
      errorStack: error?.stack || 'No stack trace',
      componentStack: errorInfo?.componentStack || 'No component stack',
      location: window.location.href,
      userAgent: navigator.userAgent,
    };

    navigator.clipboard.writeText(JSON.stringify(diagnosticPayload, null, 2)).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2500);
    });
  };

  render() {
    const { hasError, error, errorInfo, showDetails, copied } = this.state;
    const { children, fallback, isUrdu = true } = this.props;

    if (!hasError) {
      return children;
    }

    // Support custom fallback function or node
    if (fallback) {
      if (typeof fallback === 'function' && error) {
        return (fallback as any)({
          error,
          reset: this.resetErrorBoundary,
        });
      }
      return fallback;
    }

    return (
      <div
        className="min-h-[65vh] flex items-center justify-center p-4 sm:p-8 bg-slate-50/80 my-6 mx-auto max-w-4xl"
        dir={isUrdu ? 'rtl' : 'ltr'}
        role="alert"
        aria-live="assertive"
      >
        <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-6 sm:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0 shadow-inner">
                  <AlertTriangle className="w-7 h-7 animate-pulse text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-black uppercase tracking-wider bg-emerald-800 text-emerald-200 px-2.5 py-0.5 rounded-full border border-emerald-700/60">
                      {isUrdu ? 'سیستم خودکار بحالی' : 'Resilience & Safe Recovery'}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-emerald-300 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      {isUrdu ? 'ریکارڈز محفوظ ہیں' : 'Records Preserved'}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                    {isUrdu
                      ? 'ماڈیول میں عارضی تکنیکی تعطل پیش آیا ہے'
                      : 'Temporary Runtime Exception in Clinical Module'}
                  </h2>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-xs bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 text-emerald-100">
                <Stethoscope className="w-4 h-4 text-emerald-300" />
                <span>Hafiz Clinic Guard</span>
              </div>
            </div>
          </div>

          {/* Main Body */}
          <div className="p-6 sm:p-8 space-y-6">
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {isUrdu
                ? 'پریشان ہونے کی ضرورت نہیں۔ حافظ کلینک کا سیکیورٹی ماڈل فعال ہے اور آپ کے محفوظ ڈیٹا، اپائنٹمنٹس اور میڈیکل ریکارڈز بالکل سلامت ہیں۔ آپ نیچے دیے گئے بٹنوں سے ورک اسپیس بحال کر سکتے ہیں۔'
                : 'Do not worry. The clinical security safeguard is active, and all existing patient files, appointments, and database entries remain completely safe and uncorrupted. You can safely recover this workspace using the options below.'}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.resetErrorBoundary}
                className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white font-bold rounded-2xl shadow-lg shadow-emerald-900/20 flex items-center gap-2 text-sm transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{isUrdu ? 'دوبارہ لوڈ کریں (Retry Workspace)' : 'Retry Workspace'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  this.resetErrorBoundary();
                  if (this.props.onReset) {
                    this.props.onReset();
                  } else {
                    window.location.hash = '#home';
                  }
                }}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-800 font-bold rounded-2xl border border-slate-200 flex items-center gap-2 text-sm transition-all cursor-pointer"
              >
                <Home className="w-4 h-4 text-slate-600" />
                <span>{isUrdu ? 'مین ہوم اسکرین پر جائیں' : 'Return to Home'}</span>
              </button>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 font-semibold rounded-2xl border border-slate-200 flex items-center gap-2 text-sm transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-slate-500" />
                <span>{isUrdu ? 'مکمل پیج ریفریش' : 'Reload Page'}</span>
              </button>

              <button
                type="button"
                onClick={() => this.setState({ showDetails: !showDetails })}
                className="ms-auto px-4 py-3 text-slate-500 hover:text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Terminal className="w-4 h-4 text-slate-400" />
                <span>
                  {showDetails
                    ? isUrdu
                      ? 'تکنیکی معلومات چھپائیں'
                      : 'Hide Technical Log'
                    : isUrdu
                    ? 'تکنیکی معلومات دیکھیں'
                    : 'Show Technical Log'}
                </span>
                {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Diagnostic Details Accordion */}
            {showDetails && (
              <div className="mt-4 p-5 bg-slate-900 rounded-2xl text-slate-200 border border-slate-800 text-xs font-mono space-y-3 animate-fadeIn" dir="ltr">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <Terminal className="w-4 h-4" />
                    <span>System Diagnostic Trace</span>
                  </div>
                  <button
                    type="button"
                    onClick={this.handleCopyDiagnostics}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white rounded-lg transition-all text-[11px] cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Diagnostic Report</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-rose-400 font-bold">Error Message:</span>{' '}
                    <span className="text-slate-100">{error?.message || 'No error message provided'}</span>
                  </div>

                  {error?.stack && (
                    <div>
                      <span className="text-amber-400 font-bold block mb-1">Stack Trace:</span>
                      <pre className="bg-slate-950 p-3 rounded-xl overflow-x-auto text-[11px] text-slate-300 max-h-48 leading-relaxed whitespace-pre-wrap">
                        {error.stack}
                      </pre>
                    </div>
                  )}

                  {errorInfo?.componentStack && (
                    <div>
                      <span className="text-teal-400 font-bold block mb-1">Component Hierarchy:</span>
                      <pre className="bg-slate-950 p-3 rounded-xl overflow-x-auto text-[11px] text-slate-400 max-h-36 leading-relaxed whitespace-pre-wrap">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}
