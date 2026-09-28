import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  AlertTriangle,
  Zap,
  Calendar,
  Package,
  Activity,
  ChevronDown,
  Info,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { PharmacyBatchItem } from '../types';
import {
  InventoryPredictionService,
  DailyUsagePoint,
  DailyUsageTimeline,
  ReorderPrediction,
} from '../services/inventoryPredictionService';

interface Props {
  batches: PharmacyBatchItem[];
  selectedBatchId: string;
  onSelectBatch: (batchId: string) => void;
  predictionMap: Map<string, ReorderPrediction>;
  isUrdu?: boolean;
}

export function MedicineUsageTrendChart({
  batches,
  selectedBatchId,
  onSelectBatch,
  predictionMap,
  isUrdu = true,
}: Props) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Find currently selected batch or fallback to first
  const currentBatch = batches.find((b) => b.id === selectedBatchId) || batches[0];
  const prediction = currentBatch ? predictionMap.get(currentBatch.id) : null;

  // Generate 30-day continuous chronological time-series
  const timeline: DailyUsageTimeline | null = currentBatch
    ? InventoryPredictionService.get30DayUsageTimeSeries(currentBatch)
    : null;

  if (!currentBatch || !timeline) {
    return null;
  }

  const avgBurn = timeline.averageDailyUsage;
  const peakUnits = timeline.peakDailyDispensed;
  const spikesCount = timeline.spikesCount;

  // Custom Dot renderer highlighting consumption spikes
  const renderCustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload) return null;

    if (payload.isSpike) {
      return (
        <g key={`spike-dot-${payload.date}`}>
          {/* Pulsing outer aura ring */}
          <circle cx={cx} cy={cy} r={9} fill="#ef4444" opacity={0.25} />
          {/* Main spike circle */}
          <circle
            cx={cx}
            cy={cy}
            r={5.5}
            fill="#dc2626"
            stroke="#ffffff"
            strokeWidth={2}
            className="animate-pulse"
          />
          {/* Center pinpoint */}
          <circle cx={cx} cy={cy} r={1.5} fill="#ffffff" />
        </g>
      );
    }

    // Regular subtle dot for active non-zero dispensing days
    if (payload.dispensed > 0) {
      return (
        <circle
          key={`dot-${payload.date}`}
          cx={cx}
          cy={cy}
          r={2.5}
          fill="#059669"
          stroke="#ffffff"
          strokeWidth={1}
        />
      );
    }

    return null;
  };

  // Custom Rich Tooltip
  const CustomChartTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: DailyUsagePoint = payload[0].payload;
      const isSpike = data.isSpike;
      const diffPct = avgBurn > 0 ? Math.round(((data.dispensed - avgBurn) / avgBurn) * 100) : 0;

      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-xl border border-slate-700 text-xs min-w-[210px] space-y-2 pointer-events-none">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5 gap-2">
            <span className="font-bold text-slate-300 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-emerald-400" />
              {data.dayOfWeek}, {data.displayDate}
            </span>
            {isSpike && (
              <span className="text-[9.5px] bg-rose-500 text-white font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5 animate-pulse">
                <AlertTriangle className="w-2.5 h-2.5" />
                <span>غیر معمولی اضافہ</span>
              </span>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-slate-400">{isUrdu ? 'فروخت / استعمال:' : 'Dispensed:'}</span>
              <span className="font-black text-emerald-300 text-sm font-mono">
                {data.dispensed} <span className="text-[10px] font-sans text-slate-400">{isUrdu ? 'یونٹس' : 'units'}</span>
              </span>
            </div>

            <div className="flex items-baseline justify-between text-[11px]">
              <span className="text-slate-400">{isUrdu ? '۳۰ روزہ اوسط:' : '30-Day Avg:'}</span>
              <span className="font-mono text-slate-300">{avgBurn} / {isUrdu ? 'دن' : 'day'}</span>
            </div>

            <div className="flex items-baseline justify-between text-[11px]">
              <span className="text-slate-400">{isUrdu ? 'اوسط سے موازنہ:' : 'Vs Baseline:'}</span>
              <span
                className={`font-mono font-bold ${
                  diffPct > 40 ? 'text-rose-400' : diffPct < -20 ? 'text-amber-300' : 'text-emerald-400'
                }`}
              >
                {diffPct > 0 ? `+${diffPct}%` : `${diffPct}%`}
              </span>
            </div>
          </div>

          {isSpike && (
            <div className="bg-rose-950/80 border border-rose-600/60 p-1.5 rounded-xl text-[10px] text-rose-200 font-medium">
              ⚠️ <strong>{isUrdu ? 'اسپائک الرٹ:' : 'Spike Alert:'}</strong> {isUrdu ? 'اس دن غیر معمولی کھپت دیکھی گئی، اسٹاک کی تیز رفتار کمی کا باعث۔' : 'Significant consumption surge detected, accelerating stock depletion.'}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-lg space-y-4">
      {/* Top Header & Medicine Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h3 className="font-black text-sm sm:text-base text-white flex items-center gap-2">
              <span>{isUrdu ? '۳۰ روزہ کھپت اور غیر معمولی اضافہ کا رجحان' : '30-Day Medicine Usage Trend & Consumption Spikes'}</span>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-400/30 font-bold">
                Recharts Analytics
              </span>
            </h3>
          </div>
          <p className="text-[11px] text-slate-400">
            {isUrdu
              ? 'منتخب دوا کے یومیہ استعمال کا چارٹ۔ غیر معمولی کھپت (Consumption Spikes) کی نشاندہی کر کے فارماسسٹ کو بروقت آگاہ کرتا ہے۔'
              : 'Interactive 30-day timeline highlighting sudden demand surges above baseline average.'}
          </p>
        </div>

        {/* Medicine Selector Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold px-3.5 py-2 rounded-2xl border border-slate-700 flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Package className="w-3.5 h-3.5 text-emerald-400" />
            <div className="text-right">
              <span className="block font-black text-white">{currentBatch.productNameUrdu || currentBatch.productNameEnglish}</span>
              <span className="block text-[10px] text-slate-400 font-mono">بیچ: {currentBatch.batchNumber}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isDropdownOpen && (
            <div className="absolute left-0 sm:right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-30 max-h-64 overflow-y-auto p-1 text-xs divide-y divide-slate-800">
              <div className="p-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/60 rounded-xl mb-1">
                {isUrdu ? 'دوا کا انتخاب کریں (۳۰ دن رجحان دیکھنے کیلئے)' : 'Select Medicine to Inspect'}
              </div>
              {batches.map((b) => {
                const bPred = predictionMap.get(b.id);
                const isCurrent = b.id === currentBatch.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      onSelectBatch(b.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-right p-2.5 rounded-xl flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      isCurrent
                        ? 'bg-emerald-900/40 text-emerald-300 font-black border border-emerald-700/50'
                        : 'hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs">{b.productNameUrdu || b.productNameEnglish}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {b.batchNumber} • اسٹاک: {b.currentStock} یونٹ
                      </div>
                    </div>
                    {bPred?.isTrendingTowardStockout && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded-md font-bold whitespace-nowrap">
                        ⚠️ ری آرڈر
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Selected Medicine Status Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
        <div className="bg-slate-800/70 border border-slate-700/70 p-2.5 rounded-2xl">
          <span className="text-[10.5px] text-slate-400 font-bold block">{isUrdu ? 'موجودہ اسٹاک:' : 'Current Stock:'}</span>
          <span className="text-base font-black text-white font-mono flex items-baseline gap-1 mt-0.5">
            {currentBatch.currentStock}
            <span className="text-[10px] text-slate-400 font-sans">{isUrdu ? 'یونٹس' : 'units'}</span>
          </span>
          <span className="text-[9.5px] text-slate-400 block mt-0.5">
            محفوظ حد: <strong>{prediction?.safetyStockUnits || currentBatch.minThreshold || 5}</strong>
          </span>
        </div>

        <div className="bg-slate-800/70 border border-slate-700/70 p-2.5 rounded-2xl">
          <span className="text-[10.5px] text-slate-400 font-bold block">{isUrdu ? '۳۰ روزہ کل کھپت:' : '30-Day Dispensed:'}</span>
          <span className="text-base font-black text-emerald-400 font-mono flex items-baseline gap-1 mt-0.5">
            {timeline.total30DayDispensed}
            <span className="text-[10px] text-slate-400 font-sans">{isUrdu ? 'یونٹ' : 'units'}</span>
          </span>
          <span className="text-[9.5px] text-slate-400 block mt-0.5">
            کل فعال ایام: <strong>30 دن</strong>
          </span>
        </div>

        <div className="bg-slate-800/70 border border-slate-700/70 p-2.5 rounded-2xl">
          <span className="text-[10.5px] text-slate-400 font-bold block">{isUrdu ? 'اوسط یومیہ برن ریٹ:' : 'Daily Burn Rate:'}</span>
          <span className="text-base font-black text-cyan-300 font-mono flex items-baseline gap-1 mt-0.5">
            {avgBurn}
            <span className="text-[10px] text-slate-400 font-sans">/{isUrdu ? 'یومیہ' : 'day'}</span>
          </span>
          <span className="text-[9.5px] text-slate-400 block mt-0.5">
            ہفتہ وار: ~<strong>{(avgBurn * 7).toFixed(1)}</strong> یونٹ
          </span>
        </div>

        <div className={`p-2.5 rounded-2xl border ${spikesCount > 0 ? 'bg-rose-950/40 border-rose-600/50 text-rose-200' : 'bg-slate-800/70 border-slate-700/70 text-slate-200'}`}>
          <span className="text-[10.5px] text-rose-300 font-bold flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>{isUrdu ? 'غیر معمولی اضافے (Spikes):' : 'Consumption Spikes:'}</span>
          </span>
          <span className="text-base font-black text-rose-300 font-mono flex items-baseline gap-1 mt-0.5">
            {spikesCount}
            <span className="text-[10px] text-rose-300/80 font-sans">{isUrdu ? 'مرتبہ بلند کھپت' : 'Spikes'}</span>
          </span>
          <span className="text-[9.5px] text-rose-300/90 block mt-0.5 font-bold">
            پیک کھپت: <strong>{peakUnits} یونٹ</strong> ({timeline.peakDisplayDate})
          </span>
        </div>

        <div className="bg-purple-950/40 border border-purple-600/50 p-2.5 rounded-2xl col-span-2 sm:col-span-1 lg:col-span-2">
          <span className="text-[10.5px] text-purple-300 font-bold flex items-center gap-1">
            <Calendar className="w-3 h-3 text-amber-300" />
            <span>{isUrdu ? 'خودکار تجویز کردہ ری آرڈر تاریخ:' : 'Recommended Reorder Date:'}</span>
          </span>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-base font-black text-amber-300 font-mono">
              {prediction?.recommendedReorderDateFormatted || '—'}
            </span>
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                (prediction?.daysUntilReorder ?? 10) <= 2
                  ? 'bg-rose-600 text-white animate-pulse'
                  : (prediction?.daysUntilReorder ?? 10) <= 7
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-purple-800/80 text-purple-200'
              }`}
            >
              {prediction?.daysUntilReorder === 0 ? '🚨 آج ہی آرڈر!' : `${prediction?.daysUntilReorder} دن باقی`}
            </span>
          </div>
          <span className="text-[9.5px] text-purple-300/80 block mt-0.5">
            اسٹاک ختم ہونے کا تخمینہ: <strong>{prediction?.runoutDaysRemaining ?? 0} دن</strong> بعد
          </span>
        </div>
      </div>

      {/* Main Recharts Line / Area Chart Container */}
      <div className="bg-slate-950/70 p-3.5 sm:p-4 rounded-2xl border border-slate-800 relative">
        {/* Chart Legend / Indicators */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-bold text-slate-200">
              <span className="w-3 h-1 bg-emerald-500 rounded-full inline-block"></span>
              <span>{isUrdu ? 'یومیہ کھپت (Units Dispensed)' : 'Daily Dispensed'}</span>
            </span>
            <span className="flex items-center gap-1.5 font-bold text-rose-400">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-rose-500 inline-block"></span>
              <span>{isUrdu ? `۳۰ روزہ اوسط بیس لائن (${avgBurn}/دن)` : `30-Day Avg Baseline (${avgBurn}/day)`}</span>
            </span>
            <span className="flex items-center gap-1.5 font-bold text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-amber-400 inline-block animate-pulse"></span>
              <span>{isUrdu ? 'غیر معمولی اضافہ (Consumption Spike)' : 'Spike Alert (>175% avg)'}</span>
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            {timeline.points[0]?.displayDate} &mdash; {timeline.points[timeline.points.length - 1]?.displayDate}
          </span>
        </div>

        {/* Recharts Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeline.points} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.4} />

              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                interval="preserveStartEnd"
                minTickGap={24}
              />

              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                allowDecimals={false}
                domain={[0, (dataMax: number) => Math.max(dataMax + 2, Math.ceil(avgBurn * 2) + 2)]}
              />

              <Tooltip content={<CustomChartTooltip />} />

              {/* 30-Day Average Reference Line */}
              <ReferenceLine
                y={avgBurn}
                stroke="#f43f5e"
                strokeDasharray="4 4"
                strokeWidth={2}
                label={{
                  value: `30-Day Avg: ${avgBurn}/day`,
                  position: 'insideTopLeft',
                  fill: '#f43f5e',
                  fontSize: 10.5,
                  fontWeight: 'bold',
                }}
              />

              {/* Gradient Area fill */}
              <Area
                type="monotone"
                dataKey="dispensed"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#usageGradient)"
                dot={renderCustomDot}
                activeDot={{ r: 7, stroke: '#ffffff', strokeWidth: 2, fill: '#059669' }}
                name="Units Dispensed"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Consumption Spikes Telemetry & Explanations Bar */}
      {timeline.spikeEvents.length > 0 ? (
        <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <span className="p-1.5 bg-amber-500 text-slate-950 rounded-xl font-bold mt-0.5">
              <Zap className="w-4 h-4 animate-bounce" />
            </span>
            <div>
              <div className="font-black text-amber-300 flex items-center gap-1.5">
                <span>{isUrdu ? `گزشتہ ۳۰ ایام میں ${timeline.spikeEvents.length} مرتبہ کھپت میں غیر معمولی اضافہ ریکارڈ ہوا:` : `${timeline.spikeEvents.length} Consumption Spikes Detected in Past 30 Days:`}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {timeline.spikeEvents.map((spk, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-amber-900/60 border border-amber-600/60 text-amber-200 px-2 py-0.5 rounded-lg text-[10.5px] font-mono"
                  >
                    <strong>{spk.displayDate} ({spk.dayOfWeek}):</strong> {spk.quantity} یونٹ (+{Math.round((spk.ratio - 1) * 100)}%)
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="text-[10px] text-amber-300/80 bg-amber-900/40 p-2 rounded-xl border border-amber-600/30 max-w-xs">
            💡 {isUrdu ? 'اسپائک ایام فارمیسی میں مریضوں کے رش، موسمی تبدیلی یا ہول سیل خریداری کی وجہ سے ہوتے ہیں۔ نیا آرڈر دیتے وقت اسے مدنظر رکھیں۔' : 'Spikes correlate with clinic rush days or seasonal demand. Factor these into supplier order quantities.'}
          </div>
        </div>
      ) : (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-2.5 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              {isUrdu
                ? 'اس دوا کی کھپت میں کوئی غیر معمولی جھٹکا (Spike) نہیں آیا، استعمال مسلسل اور مستحکم ہے۔'
                : 'Steady consumption pattern with no abnormal spikes detected.'}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">30-Day Stability: 98%</span>
        </div>
      )}
    </div>
  );
}
