import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  AlertTriangle,
  Zap,
  Calendar,
  Sparkles,
  Info,
  Clock,
  Package,
} from 'lucide-react';
import { PharmacyBatchItem } from '../types';
import { PredictiveReorderForecast } from '../utils/predictiveInventory';
import {
  InventoryPredictionService,
  DailyUsagePoint,
  DailyUsageTimeline,
} from '../services/inventoryPredictionService';

interface Props {
  batch: PharmacyBatchItem;
  forecast?: PredictiveReorderForecast;
  allBatches?: PharmacyBatchItem[];
  onSelectBatch?: (batchId: string) => void;
  isUrdu?: boolean;
}

export function Modal30DayLineChart({
  batch,
  forecast,
  allBatches = [],
  onSelectBatch,
  isUrdu = true,
}: Props) {
  // Generate 30-day continuous timeline from dispensing history
  const timeline: DailyUsageTimeline = InventoryPredictionService.get30DayUsageTimeSeries(batch);
  const avgUsage = timeline.averageDailyUsage;
  const seasonalThreshold = Math.max(3, parseFloat((avgUsage * 1.75).toFixed(1)));

  // Custom Dot renderer highlighting seasonal demand spikes on the LineChart
  const renderSpikeDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload) return null;

    if (payload.isSpike) {
      return (
        <g key={`spike-line-dot-${payload.date}`}>
          {/* Animated glowing ring */}
          <circle cx={cx} cy={cy} r={8.5} fill="#f59e0b" opacity={0.3} className="animate-ping" />
          {/* Outer stroke circle */}
          <circle
            cx={cx}
            cy={cy}
            r={5.5}
            fill="#dc2626"
            stroke="#ffffff"
            strokeWidth={2}
          />
          {/* Center core */}
          <circle cx={cx} cy={cy} r={2} fill="#fef08a" />
        </g>
      );
    }

    if (payload.dispensed > 0) {
      return (
        <circle
          key={`regular-line-dot-${payload.date}`}
          cx={cx}
          cy={cy}
          r={3}
          fill="#7c3aed"
          stroke="#ffffff"
          strokeWidth={1.5}
        />
      );
    }

    return null;
  };

  // Custom Tooltip for LineChart
  const CustomLineTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: DailyUsagePoint = payload[0].payload;
      const isSpike = data.isSpike;
      const pctOverAvg = avgUsage > 0 ? Math.round(((data.dispensed - avgUsage) / avgUsage) * 100) : 0;

      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-2xl border border-slate-700 text-xs min-w-[220px] space-y-2 pointer-events-none">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5 gap-2">
            <span className="font-bold text-slate-300 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              {data.dayOfWeek}, {data.displayDate}
            </span>
            {isSpike && (
              <span className="text-[9.5px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                <Zap className="w-2.5 h-2.5" />
                <span>{isUrdu ? 'موسمی تیزی (Spike)' : 'Seasonal Spike'}</span>
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <span className="text-slate-400">{isUrdu ? '۳۰ دن یومیہ کھپت:' : 'Dispensed Volume:'}</span>
              <span className="font-black text-purple-300 text-sm font-mono">
                {data.dispensed} <span className="text-[10px] font-sans text-slate-400">{isUrdu ? 'یونٹس' : 'units'}</span>
              </span>
            </div>

            <div className="flex items-baseline justify-between text-[11px]">
              <span className="text-slate-400">{isUrdu ? '۳۰ روزہ اوسط بیس لائن:' : '30-Day Avg Baseline:'}</span>
              <span className="font-mono text-slate-300">{avgUsage} / {isUrdu ? 'دن' : 'day'}</span>
            </div>

            <div className="flex items-baseline justify-between text-[11px]">
              <span className="text-slate-400">{isUrdu ? 'اوسط سے انحراف:' : 'Variance vs Baseline:'}</span>
              <span
                className={`font-mono font-bold ${
                  pctOverAvg > 50 ? 'text-amber-400' : pctOverAvg < 0 ? 'text-slate-400' : 'text-emerald-400'
                }`}
              >
                {pctOverAvg > 0 ? `+${pctOverAvg}%` : `${pctOverAvg}%`}
              </span>
            </div>
          </div>

          {isSpike && (
            <div className="bg-amber-950/70 border border-amber-600/60 p-2 rounded-xl text-[10px] text-amber-200">
              ⚡ <strong>{isUrdu ? 'موسمی تیزی کی وضاحت:' : 'Seasonal Surge:'}</strong>{' '}
              {isUrdu
                ? 'اس تاریخ کو کلینک میں مریضوں کا غیر معمولی رش یا موسمی کھپت دیکھی گئی۔ ری آرڈر پلان میں موسمی اضافے کو مدنظر رکھیں۔'
                : 'Sudden spike due to clinic rush or seasonal demand change. Factor into safety stock buffers.'}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-purple-950/40 to-slate-900 border border-purple-300/40 rounded-3xl p-4 sm:p-5 text-white shadow-xl space-y-4">
      {/* Top Header & Medicine Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-purple-500/20 text-purple-300 rounded-xl border border-purple-500/30">
              <TrendingUp className="w-4 h-4 text-purple-400" />
            </span>
            <h4 className="font-black text-sm sm:text-base text-white flex items-center gap-2">
              <span>{isUrdu ? '۳۰ روزہ یومیہ کھپت اور موسمی تیزی چارٹ' : '30-Day Dispensing Volume & Seasonal Demand Spikes'}</span>
              <span className="text-[10px] bg-purple-600 text-white font-bold px-2 py-0.5 rounded-full">
                Recharts LineChart
              </span>
            </h4>
          </div>
          <p className="text-[11px] text-slate-300">
            {isUrdu
              ? `منتخب دوا: ${batch.productNameUrdu || batch.productNameEnglish} (${batch.productNameEnglish}) • بیچ: ${batch.batchNumber}`
              : `Inspecting: ${batch.productNameEnglish} • Batch: ${batch.batchNumber}`}
          </p>
        </div>

        {/* Medicine Switcher Pills */}
        {allBatches.length > 0 && onSelectBatch && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-bold mr-1">
              {isUrdu ? 'دیگر ادویات کا معائنہ:' : 'Inspect Medicine:'}
            </span>
            {allBatches.slice(0, 5).map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => onSelectBatch(b.id)}
                className={`px-2.5 py-1 rounded-xl text-[10.5px] font-bold transition-all cursor-pointer ${
                  b.id === batch.id
                    ? 'bg-purple-600 text-white shadow-xs ring-1 ring-purple-300'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                }`}
              >
                {b.productNameUrdu || b.productNameEnglish}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Metric Telemetry Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 text-xs">
        <div className="bg-slate-800/80 border border-slate-700 p-2.5 rounded-2xl">
          <span className="text-[10.5px] text-slate-400 font-bold block">{isUrdu ? '۳۰ روزہ کل کھپت:' : '30-Day Volume:'}</span>
          <span className="text-base font-black text-purple-300 font-mono mt-0.5 block">
            {timeline.total30DayDispensed} <span className="text-[10px] font-sans text-slate-400">{isUrdu ? 'یونٹس' : 'units'}</span>
          </span>
          <span className="text-[9.5px] text-slate-400 block mt-0.5">
            فعال ایام: <strong>30 دن</strong>
          </span>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 p-2.5 rounded-2xl">
          <span className="text-[10.5px] text-slate-400 font-bold block">{isUrdu ? 'اوسط یومیہ برن ریٹ:' : 'Daily Burn Rate:'}</span>
          <span className="text-base font-black text-emerald-400 font-mono mt-0.5 block">
            {avgUsage} <span className="text-[10px] font-sans text-slate-400">/{isUrdu ? 'یومیہ' : 'day'}</span>
          </span>
          <span className="text-[9.5px] text-slate-400 block mt-0.5">
            ہفتہ وار اوسط: ~<strong>{(avgUsage * 7).toFixed(1)}</strong>
          </span>
        </div>

        <div className="bg-slate-800/80 border border-amber-600/50 p-2.5 rounded-2xl">
          <span className="text-[10.5px] text-amber-300 font-bold block flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>{isUrdu ? 'موسمی تیزی (Spikes):' : 'Seasonal Spikes:'}</span>
          </span>
          <span className="text-base font-black text-amber-400 font-mono mt-0.5 block">
            {timeline.spikesCount} <span className="text-[10px] font-sans text-amber-300/80">{isUrdu ? 'مرتبہ' : 'Spikes'}</span>
          </span>
          <span className="text-[9.5px] text-amber-200/90 block mt-0.5">
            پیک حجم: <strong>{timeline.peakDailyDispensed} یونٹ</strong> ({timeline.peakDisplayDate})
          </span>
        </div>

        <div className="bg-slate-800/80 border border-purple-500/50 p-2.5 rounded-2xl">
          <span className="text-[10.5px] text-purple-300 font-bold block flex items-center gap-1">
            <Calendar className="w-3 h-3 text-amber-300" />
            <span>{isUrdu ? 'تجویز کردہ ری آرڈر:' : 'Reorder Date:'}</span>
          </span>
          <span className="text-sm sm:text-base font-black text-amber-300 font-mono mt-0.5 block truncate">
            {forecast?.reorderDateFormatted || '—'}
          </span>
          <span className="text-[9.5px] text-purple-200 block mt-0.5">
            باقی ایام: <strong>{forecast?.daysUntilReorder ?? 0} دن</strong>
          </span>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 p-2.5 rounded-2xl col-span-2 sm:col-span-4 lg:col-span-1">
          <span className="text-[10.5px] text-slate-400 font-bold block">{isUrdu ? 'موجودہ اسٹاک:' : 'Current Stock:'}</span>
          <span className="text-base font-black text-white font-mono mt-0.5 block">
            {batch.currentStock} <span className="text-[10px] font-sans text-slate-400">{isUrdu ? 'یونٹس' : 'units'}</span>
          </span>
          <span className="text-[9.5px] text-slate-400 block mt-0.5">
            سیفٹی بفر: <strong>{forecast?.safetyStockUnits || batch.minThreshold || 5}</strong>
          </span>
        </div>
      </div>

      {/* Main Recharts LineChart */}
      <div className="bg-slate-950/80 p-3.5 sm:p-4 rounded-2xl border border-slate-800 space-y-2">
        {/* Chart Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 border-b border-slate-800/80 pb-2">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 font-bold text-purple-300">
              <span className="w-3 h-1 bg-purple-500 rounded-full inline-block"></span>
              <span>{isUrdu ? 'یومیہ فروخت شدہ حجم (Daily Dispensed Volume)' : 'Daily Dispensed Volume'}</span>
            </span>
            <span className="flex items-center gap-1.5 font-bold text-rose-400">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-rose-500 inline-block"></span>
              <span>{isUrdu ? `۳۰ روزہ اوسط بیس لائن (${avgUsage}/دن)` : `30-Day Avg Baseline (${avgUsage}/day)`}</span>
            </span>
            <span className="flex items-center gap-1.5 font-bold text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 ring-2 ring-amber-400 inline-block animate-pulse"></span>
              <span>{isUrdu ? 'موسمی تیزی و اضافہ (Seasonal Demand Spike)' : 'Seasonal Demand Spike'}</span>
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            {timeline.points[0]?.displayDate} — {timeline.points[timeline.points.length - 1]?.displayDate}
          </span>
        </div>

        {/* Recharts LineChart */}
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeline.points} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.4} />

              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                interval="preserveStartEnd"
                minTickGap={20}
              />

              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                allowDecimals={false}
                domain={[0, (dataMax: number) => Math.max(dataMax + 2, Math.ceil(avgUsage * 2) + 2)]}
              />

              <Tooltip content={<CustomLineTooltip />} />

              {/* 30-Day Average Reference Line */}
              <ReferenceLine
                y={avgUsage}
                stroke="#f43f5e"
                strokeDasharray="4 4"
                strokeWidth={2}
                label={{
                  value: `30-Day Avg: ${avgUsage}/day`,
                  position: 'insideTopLeft',
                  fill: '#f43f5e',
                  fontSize: 10,
                  fontWeight: 'bold',
                }}
              />

              {/* Seasonal Surge Reference Threshold */}
              <ReferenceLine
                y={seasonalThreshold}
                stroke="#d97706"
                strokeDasharray="2 2"
                strokeWidth={1.5}
                label={{
                  value: `Spike Threshold: ≥${seasonalThreshold}`,
                  position: 'insideTopRight',
                  fill: '#d97706',
                  fontSize: 9.5,
                  fontWeight: 'bold',
                }}
              />

              {/* Primary Line */}
              <Line
                type="monotone"
                dataKey="dispensed"
                stroke="#a855f7"
                strokeWidth={3}
                dot={renderSpikeDot}
                activeDot={{ r: 7, stroke: '#ffffff', strokeWidth: 2, fill: '#7c3aed' }}
                name="Dispensed Volume"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Seasonal Spike Intelligence Banner */}
      {timeline.spikeEvents.length > 0 ? (
        <div className="bg-amber-950/40 border border-amber-500/50 rounded-2xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <span className="p-1.5 bg-amber-500 text-slate-950 rounded-xl font-bold mt-0.5">
              <Zap className="w-4 h-4 animate-bounce" />
            </span>
            <div>
              <div className="font-black text-amber-300">
                {isUrdu
                  ? `ماڈل نے گزشتہ ۳۰ ایام میں ${timeline.spikeEvents.length} موسمی کھپت کی تیزیوں (Seasonal Demand Spikes) کی نشاندہی کی:`
                  : `Model identified ${timeline.spikeEvents.length} seasonal demand spikes in the 30-day timeline:`}
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                {timeline.spikeEvents.map((spk, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-amber-900/60 border border-amber-600/60 text-amber-200 px-2 py-0.5 rounded-lg text-[10.5px] font-mono"
                  >
                    <strong>{spk.displayDate} ({spk.dayOfWeek}):</strong> {spk.quantity} یونٹس (+{Math.round((spk.ratio - 1) * 100)}% اضافہ)
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="text-[10px] text-amber-300/90 bg-amber-900/40 p-2 rounded-xl border border-amber-600/30 max-w-sm">
            💡 {isUrdu ? 'موسمی تبدیلیوں (Seasonal Spikes) کے باعث اسٹاک معمول سے جلد ختم ہو سکتا ہے۔ سپلائر آرڈر کی مقدار بڑھانے کی سفارش کی جاتی ہے۔' : 'Seasonal surges can cause premature stockouts. Increase requisition quantity accordingly.'}
          </div>
        </div>
      ) : (
        <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-2.5 flex items-center justify-between text-xs text-slate-400">
          <span>{isUrdu ? 'اس دوا کی کھپت میں کوئی غیر معمولی جھٹکا یا موسمی تیزی نہیں دیکھی گئی، طلب مستحکم ہے۔' : 'Consistent demand pattern with no seasonal spikes detected.'}</span>
          <span className="text-[10px] text-slate-500 font-mono">Demand Stability: 99%</span>
        </div>
      )}
    </div>
  );
}
