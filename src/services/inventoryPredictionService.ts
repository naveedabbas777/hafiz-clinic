/**
 * Inventory Prediction Service
 * 
 * Provides algorithmic forecasting for pharmacy medicines:
 * 1. Analyzes 30-day dispensing patterns to determine average daily usage (burn rate / velocity).
 * 2. Auto-calculates the Recommended Reorder Date based on remaining stock quantity, supplier lead time, and dynamic safety stock buffers.
 * 3. Identifies medicines trending toward stockout to warn pharmacists before inventory depletion occurs.
 */

import { PharmacyBatchItem } from '../types';

export interface DispensingRecord {
  id: string;
  batchId?: string;
  productId: string;
  productName: string;
  quantity: number;
  date: string; // YYYY-MM-DD
  timestamp: string;
  slipNo?: string;
  patientName?: string;
}

export interface DailyUsagePoint {
  date: string; // YYYY-MM-DD
  displayDate: string; // "14 Sep"
  shortDate: string; // "14 Sep"
  dayOfWeek: string; // "Fri"
  dispensed: number;
  average: number;
  isSpike: boolean;
  spikeRatio: number;
  spikeNote?: string;
  cumulativeDispensed: number;
}

export interface SpikeEvent {
  date: string;
  displayDate: string;
  dayOfWeek: string;
  quantity: number;
  average: number;
  ratio: number;
  note: string;
}

export interface DailyUsageTimeline {
  batchId: string;
  productId: string;
  productNameUrdu: string;
  productNameEnglish: string;
  points: DailyUsagePoint[];
  total30DayDispensed: number;
  averageDailyUsage: number;
  peakDailyDispensed: number;
  peakDate: string;
  peakDisplayDate: string;
  spikesCount: number;
  spikeEvents: SpikeEvent[];
}

export interface ThirtyDayUsageStats {
  productId: string;
  productNameEnglish: string;
  productNameUrdu: string;
  total30DayDispensed: number;
  averageDailyUsage: number; // units/day (30-day burn rate)
  dispensingDaysCount: number; // active days with dispensing
  weeklyEstimatedUsage: number; // average weekly volume
  trendLast7Days: number[]; // daily units dispensed for the past 7 days
}

export interface ReorderPrediction {
  productId: string;
  batchId: string;
  batchNumber: string;
  productNameUrdu: string;
  productNameEnglish: string;
  rackLocation: string;
  supplierName: string;
  costPricePKR: number;
  salePricePKR: number;

  // Remaining quantity in stock
  currentStock: number;
  minThreshold: number;

  // 30-Day Usage Analysis
  dispensedLast30Days: number;
  averageDailyBurnRate: number; // 30-day average usage (units/day)
  dispensingFrequencyDays: number;

  // Lead Time & Buffer parameters
  supplierLeadTimeDays: number;
  safetyStockUnits: number;
  reorderPointUnits: number;

  // Predictive Horizons & Calculated Dates
  runoutDaysRemaining: number; // Total days until zero inventory
  daysUntilReorder: number; // Days until current stock hits safety threshold
  recommendedReorderDateStr: string; // YYYY-MM-DD
  recommendedReorderDateFormatted: string; // e.g. "29 Sep 2026"
  
  // Stockout Risk Warnings
  isTrendingTowardStockout: boolean; // Flag to immediately warn pharmacist
  stockoutRiskLevel: 'CRITICAL_STOCKOUT' | 'STOCKOUT_WARNING' | 'OPTIMAL' | 'LOW_MOVEMENT';
  warningBadgeUrdu: string;
  warningBadgeEnglish: string;

  // Replenishment Suggestion
  suggestedReorderUnits: number;
  estimatedReorderCostPKR: number;
  recentTrend: number[];
}

const STORAGE_KEY_DISPENSING = 'hafiz_pharmacy_dispensing_history_v3';

/**
 * Baseline demand distribution profiles for Hafiz Clinic medicines
 */
const BASELINE_DEMAND_PROFILES: Record<string, { avgDaily: number; variance: number }> = {
  'herbal-joint-oil': { avgDaily: 2.4, variance: 1.5 },
  'herbal-sugar-control': { avgDaily: 1.9, variance: 1.2 },
  'eye-cooling-drops': { avgDaily: 2.6, variance: 1.8 },
  'hoorab-hair-oil': { avgDaily: 1.7, variance: 1.0 },
  'hoorab-beauty-cream': { avgDaily: 1.3, variance: 0.8 },
  'majoon-shabab': { avgDaily: 0.9, variance: 0.6 },
};

/**
 * Retrieves existing dispensing history or seeds 30 days of realistic clinical dispensing
 */
export function getDispensingHistory(batches: PharmacyBatchItem[] = []): DispensingRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DISPENSING);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (_) {}

  // Generate synthetic but realistic past 30 days dispensing for the catalog
  const records: DispensingRecord[] = [];
  const now = new Date();

  batches.forEach((batch) => {
    const profile = BASELINE_DEMAND_PROFILES[batch.productId] || { avgDaily: 1.2, variance: 0.7 };

    for (let dayOffset = 30; dayOffset >= 1; dayOffset--) {
      const recordDate = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
      const dateStr = recordDate.toISOString().split('T')[0];

      // Explicitly inject 2 to 3 consumption spikes (e.g. medical camp day, Friday rush, viral surge)
      const isSpikeDay = dayOffset === 4 || dayOffset === 12 || dayOffset === 22;
      let rawQty: number;

      if (isSpikeDay) {
        // Surge event: 2.5x to 3.5x regular volume
        rawQty = Math.round(profile.avgDaily * 2.8 + 2.5 + Math.random() * 1.5);
      } else {
        // Simulate weekend vs weekday variance (Fridays & Sundays have high footfall)
        const isPeakDay = recordDate.getDay() === 0 || recordDate.getDay() === 5;
        const multiplier = isPeakDay ? 1.45 : 0.85;
        const noise = (Math.random() - 0.35) * profile.variance;
        rawQty = Math.round(profile.avgDaily * multiplier + noise);
      }

      const qty = Math.max(0, rawQty);

      if (qty > 0) {
        records.push({
          id: `DSP-SEED-${batch.id}-${dayOffset}`,
          batchId: batch.id,
          productId: batch.productId,
          productName: batch.productNameEnglish || batch.productNameUrdu,
          quantity: qty,
          date: dateStr,
          timestamp: recordDate.toISOString(),
          slipNo: isSpikeDay ? `PHARM-SURGE-${Math.floor(1000 + Math.random() * 9000)}` : `PHARM-HIST-${Math.floor(1000 + Math.random() * 9000)}`,
        });
      }
    }
  });

  try {
    localStorage.setItem(STORAGE_KEY_DISPENSING, JSON.stringify(records));
  } catch (_) {}

  return records;
}

/**
 * Records a new dispensing transaction into the 30-day time series
 */
export function recordDispensingTransaction(
  batch: PharmacyBatchItem,
  quantity: number,
  slipNo?: string,
  patientName?: string
): void {
  try {
    const current = getDispensingHistory([batch]);
    const newRecord: DispensingRecord = {
      id: `DSP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      batchId: batch.id,
      productId: batch.productId,
      productName: batch.productNameEnglish || batch.productNameUrdu,
      quantity,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      slipNo,
      patientName,
    };
    current.unshift(newRecord);
    // Keep last 1500 logs to maintain fast performance in browser storage
    localStorage.setItem(STORAGE_KEY_DISPENSING, JSON.stringify(current.slice(0, 1500)));
  } catch (err) {
    console.warn('InventoryPredictionService: Failed to record dispensing transaction:', err);
  }
}

/**
 * Calculates the 30-day average usage (daily burn rate) for a given medicine
 */
export function calculate30DayAverageUsage(
  batch: PharmacyBatchItem,
  history: DispensingRecord[]
): ThirtyDayUsageStats {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

  // Filter dispensing events from the past 30 days
  const matchedRecords = history.filter((r) => {
    if (r.date < thirtyDaysAgoStr) return false;
    return (
      (r.batchId && r.batchId === batch.id) ||
      (r.productId && r.productId === batch.productId) ||
      (batch.productNameEnglish && r.productName && r.productName.toLowerCase() === batch.productNameEnglish.toLowerCase())
    );
  });

  const total30DayDispensed = matchedRecords.reduce((sum, r) => sum + (r.quantity || 0), 0);
  const activeDaysSet = new Set(matchedRecords.map((r) => r.date));
  const dispensingDaysCount = activeDaysSet.size;

  // Daily burn rate (velocity). If none recorded yet, use a conservative floor of 0.25 units/day
  const averageDailyUsage = total30DayDispensed > 0 
    ? parseFloat((total30DayDispensed / 30).toFixed(2)) 
    : 0.25;

  const weeklyEstimatedUsage = parseFloat((averageDailyUsage * 7).toFixed(1));

  // Past 7 days trend
  const trendLast7Days: number[] = [];
  for (let d = 6; d >= 0; d--) {
    const targetDate = new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const dayQty = matchedRecords
      .filter((r) => r.date === targetDate)
      .reduce((sum, r) => sum + r.quantity, 0);
    trendLast7Days.push(dayQty);
  }

  return {
    productId: batch.productId,
    productNameEnglish: batch.productNameEnglish,
    productNameUrdu: batch.productNameUrdu,
    total30DayDispensed,
    averageDailyUsage,
    dispensingDaysCount,
    weeklyEstimatedUsage,
    trendLast7Days,
  };
}

/**
 * Auto-calculates the Recommended Reorder Date based on remaining quantity and 30-day average usage
 */
export function calculateRecommendedReorderDate(
  remainingQuantity: number,
  averageDailyUsage: number,
  leadTimeDays: number = 4,
  minThreshold: number = 5
): {
  recommendedReorderDateStr: string;
  recommendedReorderDateFormatted: string;
  daysUntilReorder: number;
  runoutDaysRemaining: number;
  safetyStockUnits: number;
  reorderPointUnits: number;
  isTrendingTowardStockout: boolean;
  stockoutRiskLevel: 'CRITICAL_STOCKOUT' | 'STOCKOUT_WARNING' | 'OPTIMAL' | 'LOW_MOVEMENT';
  warningBadgeUrdu: string;
  warningBadgeEnglish: string;
} {
  const currentStock = Math.max(0, remainingQuantity);
  const burnRate = averageDailyUsage > 0 ? averageDailyUsage : 0.25;

  // Dynamic Safety Stock buffer = max(minThreshold, ceil(ADR * LeadTime * 1.5))
  const safetyStockUnits = Math.max(minThreshold, Math.ceil(burnRate * leadTimeDays * 1.5));

  // Reorder Point (ROP) = (ADR * LeadTime) + SafetyStock
  const reorderPointUnits = Math.ceil(burnRate * leadTimeDays + safetyStockUnits);

  // Remaining days before complete stockout (zero inventory)
  const runoutDaysRemaining = Math.max(0, Math.floor(currentStock / burnRate));

  // Days countdown until current stock depletes to the safety threshold
  const rawDaysUntilReorder = Math.floor((currentStock - safetyStockUnits) / burnRate);
  const daysUntilReorder = Math.max(0, rawDaysUntilReorder);

  // Compute exact Recommended Reorder Date
  const now = new Date();
  const reorderTimestamp = now.getTime() + daysUntilReorder * 24 * 60 * 60 * 1000;
  const reorderDate = new Date(reorderTimestamp);
  const recommendedReorderDateStr = reorderDate.toISOString().split('T')[0];
  const recommendedReorderDateFormatted = reorderDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // Evaluate if stock is trending toward a stockout
  let isTrendingTowardStockout = false;
  let stockoutRiskLevel: 'CRITICAL_STOCKOUT' | 'STOCKOUT_WARNING' | 'OPTIMAL' | 'LOW_MOVEMENT' = 'OPTIMAL';
  let warningBadgeUrdu = '🟢 تسلی بخش اسٹاک';
  let warningBadgeEnglish = 'Optimal Stock';

  if (currentStock <= safetyStockUnits || daysUntilReorder <= 1 || runoutDaysRemaining <= leadTimeDays) {
    // Critical: Stockout is imminent or already breached safety buffer
    isTrendingTowardStockout = true;
    stockoutRiskLevel = 'CRITICAL_STOCKOUT';
    warningBadgeUrdu = '🚨 شدید خطرہ: فوری ری آرڈر ضروری (Stockout Imminent)';
    warningBadgeEnglish = 'Critical Stockout Alert: Reorder Today!';
  } else if (daysUntilReorder <= 7 || runoutDaysRemaining <= leadTimeDays + 7 || currentStock <= reorderPointUnits) {
    // Warning: Stock is trending toward stockout within 7 days
    isTrendingTowardStockout = true;
    stockoutRiskLevel = 'STOCKOUT_WARNING';
    warningBadgeUrdu = `⚠️ اسٹاک آؤٹ خطرہ: ${daysUntilReorder} دن میں ری آرڈر کریں`;
    warningBadgeEnglish = `Trending to Stockout: Reorder Due in ${daysUntilReorder} Days`;
  } else if (burnRate < 0.3) {
    stockoutRiskLevel = 'LOW_MOVEMENT';
    warningBadgeUrdu = 'سست رفتار کھپت (کافی اسٹاک)';
    warningBadgeEnglish = 'Low Velocity / Adequate Runaway';
  } else {
    stockoutRiskLevel = 'OPTIMAL';
    warningBadgeUrdu = '🟢 تسلی بخش اسٹاک (مناسب توازن)';
    warningBadgeEnglish = 'Stock Level Healthy';
  }

  return {
    recommendedReorderDateStr,
    recommendedReorderDateFormatted,
    daysUntilReorder,
    runoutDaysRemaining,
    safetyStockUnits,
    reorderPointUnits,
    isTrendingTowardStockout,
    stockoutRiskLevel,
    warningBadgeUrdu,
    warningBadgeEnglish,
  };
}

/**
 * Generates comprehensive predictive reorder forecasts for all inventory batches
 */
export function generateInventoryPredictions(
  batches: PharmacyBatchItem[],
  customLeadTimeDays: number = 4
): ReorderPrediction[] {
  const history = getDispensingHistory(batches);

  return batches.map((batch) => {
    const usageStats = calculate30DayAverageUsage(batch, history);
    const minThreshold = batch.minThreshold || 6;
    const reorderCalc = calculateRecommendedReorderDate(
      batch.currentStock,
      usageStats.averageDailyUsage,
      customLeadTimeDays,
      minThreshold
    );

    // Suggested replenishment order (30 days of burn rate + buffer replenishment)
    const suggestedReorderUnits = Math.max(
      minThreshold * 2,
      Math.ceil(usageStats.averageDailyUsage * 30 + reorderCalc.safetyStockUnits - batch.currentStock)
    );
    const estimatedReorderCostPKR = suggestedReorderUnits * (batch.costPricePKR || 450);

    return {
      productId: batch.productId,
      batchId: batch.id,
      batchNumber: batch.batchNumber,
      productNameUrdu: batch.productNameUrdu,
      productNameEnglish: batch.productNameEnglish,
      rackLocation: batch.rackLocation || 'Shelf A',
      supplierName: batch.supplierName || 'Hafiz Herbal Laboratories Ltd.',
      costPricePKR: batch.costPricePKR || 450,
      salePricePKR: batch.salePricePKR || 800,
      currentStock: batch.currentStock,
      minThreshold,

      dispensedLast30Days: usageStats.total30DayDispensed,
      averageDailyBurnRate: usageStats.averageDailyUsage,
      dispensingFrequencyDays: usageStats.dispensingDaysCount,

      supplierLeadTimeDays: customLeadTimeDays,
      safetyStockUnits: reorderCalc.safetyStockUnits,
      reorderPointUnits: reorderCalc.reorderPointUnits,

      runoutDaysRemaining: reorderCalc.runoutDaysRemaining,
      daysUntilReorder: reorderCalc.daysUntilReorder,
      recommendedReorderDateStr: reorderCalc.recommendedReorderDateStr,
      recommendedReorderDateFormatted: reorderCalc.recommendedReorderDateFormatted,

      isTrendingTowardStockout: reorderCalc.isTrendingTowardStockout,
      stockoutRiskLevel: reorderCalc.stockoutRiskLevel,
      warningBadgeUrdu: reorderCalc.warningBadgeUrdu,
      warningBadgeEnglish: reorderCalc.warningBadgeEnglish,

      suggestedReorderUnits,
      estimatedReorderCostPKR,
      recentTrend: usageStats.trendLast7Days,
    };
  });
}

/**
 * Generates continuous 30-day chronological time series data points for charting with Recharts
 * Detects consumption spikes (days where dispensing surged significantly above the 30-day baseline).
 */
export function get30DayUsageTimeSeries(
  batch: PharmacyBatchItem,
  history?: DispensingRecord[]
): DailyUsageTimeline {
  const dispensingHistory = history || getDispensingHistory([batch]);
  const stats = calculate30DayAverageUsage(batch, dispensingHistory);
  const avg = stats.averageDailyUsage;

  const now = new Date();
  const points: DailyUsagePoint[] = [];
  const spikeEvents: SpikeEvent[] = [];

  let cumulativeDispensed = 0;
  let peakDailyDispensed = 0;
  let peakDate = '';
  let peakDisplayDate = '';

  // Generate 30 contiguous chronological days from 29 days ago to 0 (today)
  for (let offset = 29; offset >= 0; offset--) {
    const d = new Date(now.getTime() - offset * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    const displayDate = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    const shortDate = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const dayOfWeek = d.toLocaleDateString('en-GB', { weekday: 'short' });

    // Aggregate dispensing quantity for this medicine on this specific date
    const dayRecords = dispensingHistory.filter((r) => {
      if (r.date !== dateStr) return false;
      return (
        (r.batchId && r.batchId === batch.id) ||
        (r.productId && r.productId === batch.productId) ||
        (batch.productNameEnglish && r.productName && r.productName.toLowerCase() === batch.productNameEnglish.toLowerCase())
      );
    });

    const dispensed = dayRecords.reduce((sum, r) => sum + (r.quantity || 0), 0);
    cumulativeDispensed += dispensed;

    if (dispensed > peakDailyDispensed) {
      peakDailyDispensed = dispensed;
      peakDate = dateStr;
      peakDisplayDate = displayDate;
    }

    // Determine consumption spike
    const isSpike = dispensed >= 3 && (avg <= 0 || dispensed >= avg * 1.75 || (dispensed - avg) >= 2);
    const spikeRatio = avg > 0 ? parseFloat((dispensed / avg).toFixed(2)) : (dispensed > 0 ? 3 : 1);

    let spikeNote: string | undefined = undefined;
    if (isSpike) {
      spikeNote = `${dispensed} units dispensed (${Math.round((spikeRatio - 1) * 100)}% above 30-day baseline)`;
      spikeEvents.push({
        date: dateStr,
        displayDate,
        dayOfWeek,
        quantity: dispensed,
        average: avg,
        ratio: spikeRatio,
        note: spikeNote,
      });
    }

    points.push({
      date: dateStr,
      displayDate,
      shortDate,
      dayOfWeek,
      dispensed,
      average: avg,
      isSpike,
      spikeRatio,
      spikeNote,
      cumulativeDispensed,
    });
  }

  return {
    batchId: batch.id,
    productId: batch.productId,
    productNameUrdu: batch.productNameUrdu,
    productNameEnglish: batch.productNameEnglish,
    points,
    total30DayDispensed: stats.total30DayDispensed,
    averageDailyUsage: avg,
    peakDailyDispensed,
    peakDate: peakDate || (points[points.length - 1] ? points[points.length - 1].date : ''),
    peakDisplayDate: peakDisplayDate || (points[points.length - 1] ? points[points.length - 1].displayDate : ''),
    spikesCount: spikeEvents.length,
    spikeEvents,
  };
}

/**
 * Service Object encapsulation
 */
export const InventoryPredictionService = {
  getDispensingHistory,
  recordDispensingTransaction,
  calculate30DayAverageUsage,
  calculateRecommendedReorderDate,
  generateInventoryPredictions,
  get30DayUsageTimeSeries,
};
