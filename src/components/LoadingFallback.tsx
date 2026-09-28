import React from 'react';
import { Stethoscope } from 'lucide-react';

interface LoadingFallbackProps {
  title?: string;
  subtitle?: string;
  isUrdu?: boolean;
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  title,
  subtitle,
  isUrdu = true,
}) => {
  return (
    <div
      className="min-h-[50vh] flex flex-col items-center justify-center p-8 bg-slate-50/60 rounded-3xl border border-slate-200/80 my-6 mx-auto max-w-5xl"
      dir={isUrdu ? 'rtl' : 'ltr'}
      role="status"
      aria-live="polite"
    >
      <div className="relative flex items-center justify-center mb-4">
        {/* Subtle breathing ring */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-600/10 border border-emerald-500/30 animate-ping absolute" />
        
        {/* Centered medical icon */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-700 to-teal-900 text-white flex items-center justify-center shadow-lg shadow-emerald-900/20 relative z-10 animate-pulse">
          <Stethoscope className="w-7 h-7 text-emerald-200" />
        </div>
      </div>

      <div className="text-center space-y-1.5 max-w-sm">
        <h4 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
          {title || (isUrdu ? 'ماڈیول لوڈ ہو رہا ہے...' : 'Loading Clinical Workspace...')}
        </h4>
        <p className="text-xs text-slate-500 leading-relaxed">
          {subtitle || (isUrdu ? 'حافظ کلینک کا محفوظ ڈیٹا بیس تیار کیا جا رہا ہے۔' : 'Preparing verified healthcare telemetry and records.')}
        </p>
      </div>

      {/* Lightweight hairline skeleton indicator */}
      <div className="w-48 h-1 bg-slate-200 rounded-full mt-5 overflow-hidden">
        <div className="h-full bg-emerald-600 rounded-full animate-[progress_1.5s_ease-in-out_infinite] w-1/3" />
      </div>
    </div>
  );
};
