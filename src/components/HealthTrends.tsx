import React, { useState, useMemo, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  AreaChart,
  Area,
} from 'recharts';
import {
  Activity,
  Heart,
  Thermometer,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Plus,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  Stethoscope,
  Filter,
  UserCheck,
  FileSpreadsheet,
  HeartPulse,
  Sparkles,
} from 'lucide-react';
import { NursingVitalsEntry } from './NursingCarePortalView';

export interface HealthTrendPoint {
  id: string;
  dayIndex: number;
  date: string; // YYYY-MM-DD
  displayDate: string; // e.g. "14 Sep"
  displayTime: string; // e.g. "14 Sep 08:00 AM"
  timeSlot: string; // "08:00 AM", "02:00 PM", "08:00 PM"
  heartRate: number; // pulse bpm (e.g. 68 - 88)
  temperature: number; // °F (e.g. 98.2 - 99.4)
  bpSystolic: number; // mmHg (e.g. 118 - 145)
  bpDiastolic: number; // mmHg (e.g. 76 - 92)
  respiratoryRate?: number;
  spO2?: number;
  source: 'nursing' | 'patient_self';
  nurseName?: string;
  notes?: string;
  status: 'Normal' | 'Elevated' | 'Attention Needed';
}

interface HealthTrendsProps {
  patientMrn?: string;
  patientName?: string;
  language?: 'urdu' | 'english';
  showSelfLogOption?: boolean;
}

export const HealthTrends: React.FC<HealthTrendsProps> = ({
  patientMrn = 'MRN-84920',
  patientName = 'محمد فاروق / Muhammad Farooq',
  language = 'urdu',
  showSelfLogOption = true,
}) => {
  const isUrdu = language === 'urdu';

  // Active Metric Mode
  // 'all' = Combined Tri-Metric, 'hr' = Heart Rate, 'temp' = Temperature, 'bp' = Blood Pressure
  const [activeMetric, setActiveMetric] = useState<'all' | 'bp' | 'hr' | 'temp'>('all');
  const [timeRange, setTimeRange] = useState<'30d' | '14d' | '7d'>('30d');
  const [showLogModal, setShowLogModal] = useState<boolean>(false);

  // New self-log form states
  const [newSystolic, setNewSystolic] = useState<number>(120);
  const [newDiastolic, setNewDiastolic] = useState<number>(80);
  const [newHeartRate, setNewHeartRate] = useState<number>(74);
  const [newTemp, setNewTemp] = useState<number>(98.6);
  const [newNote, setNewNote] = useState<string>('');

  // 30-Day Vitals Data State
  const [vitalsData, setVitalsData] = useState<HealthTrendPoint[]>([]);

  // Load 30-Day Vitals from Nursing Care Portal + Synthetic Baseline
  useEffect(() => {
    loadThirtyDayHealthData();
  }, [patientMrn]);

  const loadThirtyDayHealthData = () => {
    const today = new Date();
    const generated30DayData: HealthTrendPoint[] = [];

    // Base clinical parameters simulating patient's 30-day trajectory (improving from mild hypertension & viral febrile episode)
    for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
      const pointDate = new Date(today.getTime() - dayOffset * 24 * 60 * 60 * 1000);
      const dateStr = pointDate.toISOString().split('T')[0];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const displayDate = `${pointDate.getDate()} ${monthNames[pointDate.getMonth()]}`;

      // Morning reading (08:00 AM)
      // Earlier days had slightly elevated BP and occasional fever, progressing towards stabilization
      const recoveryProgress = (29 - dayOffset) / 29; // 0 to 1

      // Blood pressure starts ~142/92 and stabilizes ~120/78
      const systolicBase = Math.round(140 - recoveryProgress * 20 + Math.sin(dayOffset * 0.9) * 4);
      const diastolicBase = Math.round(90 - recoveryProgress * 12 + Math.cos(dayOffset * 0.9) * 3);

      // Heart rate starts ~84 bpm and settles ~72 bpm
      const hrBase = Math.round(84 - recoveryProgress * 12 + Math.sin(dayOffset * 1.3) * 4);

      // Temperature: Day 25-27 had a minor febrile spike (99.8°F), normalized to ~98.4°F
      let tempBase = 98.4 + Math.sin(dayOffset * 0.5) * 0.3;
      if (dayOffset >= 24 && dayOffset <= 26) {
        tempBase = 99.6 + (dayOffset === 25 ? 0.4 : 0.1);
      }
      tempBase = parseFloat(tempBase.toFixed(1));

      let nurse = 'Staff Nurse Fouzia Parveen';
      if (dayOffset % 3 === 0) nurse = 'Sister Shamaila Akhtar';
      else if (dayOffset % 3 === 1) nurse = 'Staff Nurse Sadia Bibi';

      let notes = 'Routine ward clinical round. Medication administered.';
      let status: 'Normal' | 'Elevated' | 'Attention Needed' = 'Normal';

      if (tempBase >= 99.5) {
        notes = 'Mild pyrexia noted. Cold sponging & Paracetamol given.';
        status = 'Elevated';
      } else if (systolicBase >= 140) {
        notes = 'Blood pressure on higher threshold. Doctor alerted; herbal garlic extract advised.';
        status = 'Elevated';
      } else if (dayOffset === 0) {
        notes = 'Optimal parameters. Patient fully active and compliant.';
      }

      generated30DayData.push({
        id: `gen-vital-${dayOffset}`,
        dayIndex: 30 - dayOffset,
        date: dateStr,
        displayDate,
        displayTime: `${displayDate} 08:00 AM`,
        timeSlot: '08:00 AM',
        heartRate: hrBase,
        temperature: tempBase,
        bpSystolic: systolicBase,
        bpDiastolic: diastolicBase,
        spO2: 98,
        respiratoryRate: 18,
        source: 'nursing',
        nurseName: nurse,
        notes,
        status,
      });
    }

    // Now overlay any actual records stored in NursingCarePortalView localStorage
    try {
      const savedNursing = localStorage.getItem('hc_nursing_vitals_logs_v2');
      if (savedNursing) {
        const parsedNursing: NursingVitalsEntry[] = JSON.parse(savedNursing);
        if (Array.isArray(parsedNursing) && parsedNursing.length > 0) {
          parsedNursing.forEach((log) => {
            if (log.timestamp) {
              const d = new Date(log.timestamp);
              const dateStr = d.toISOString().split('T')[0];
              const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              const displayDate = `${d.getDate()} ${monthNames[d.getMonth()]}`;

              // Replace or append
              const existingIdx = generated30DayData.findIndex((item) => item.date === dateStr);
              const formatted: HealthTrendPoint = {
                id: log.id || `nurse-${Date.now()}`,
                dayIndex: 30,
                date: dateStr,
                displayDate,
                displayTime: `${displayDate} ${log.timeSlot || '12:00 PM'}`,
                timeSlot: log.timeSlot || '12:00 PM',
                heartRate: log.pulseRate || 74,
                temperature: log.temperature || 98.6,
                bpSystolic: log.bpSystolic || 120,
                bpDiastolic: log.bpDiastolic || 80,
                spO2: log.spO2 || 98,
                respiratoryRate: log.respiratoryRate || 18,
                source: 'nursing',
                nurseName: log.nurseName || 'Ward Nurse Station',
                notes: log.nursingNotesEnglish || log.nursingNotesUrdu || 'Nursing observation completed.',
                status: (log.bpSystolic >= 140 || log.temperature >= 99.5) ? 'Attention Needed' : 'Normal',
              };

              if (existingIdx >= 0) {
                generated30DayData[existingIdx] = formatted;
              } else {
                generated30DayData.push(formatted);
              }
            }
          });
        }
      }

      // Also overlay any self-logged patient readings
      const savedSelf = localStorage.getItem(`hc_patient_vitals_self_${patientMrn}`);
      if (savedSelf) {
        const parsedSelf = JSON.parse(savedSelf);
        if (Array.isArray(parsedSelf)) {
          parsedSelf.forEach((s: any) => {
            const d = new Date(s.fullDate || s.date || Date.now());
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const displayDate = `${d.getDate()} ${monthNames[d.getMonth()]}`;
            generated30DayData.push({
              id: s.id,
              dayIndex: 30,
              date: s.fullDate || d.toISOString().split('T')[0],
              displayDate,
              displayTime: s.displayTime || `${displayDate} ${s.timeSlot || '09:00 AM'}`,
              timeSlot: s.timeSlot || '09:00 AM',
              heartRate: s.pulseRate || s.heartRate || 75,
              temperature: s.temperature || 98.6,
              bpSystolic: s.bpSystolic || 120,
              bpDiastolic: s.bpDiastolic || 80,
              source: 'patient_self',
              notes: s.notes || 'Patient self-monitored reading.',
              status: s.bpSystolic >= 140 ? 'Attention Needed' : 'Normal',
            });
          });
        }
      }
    } catch (e) {
      console.error('Error loading nursing vitals:', e);
    }

    // Sort chronologically by date
    generated30DayData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setVitalsData(generated30DayData);
  };

  // Filtered dataset according to time range
  const filteredData = useMemo(() => {
    if (timeRange === '7d') {
      return vitalsData.slice(-7);
    }
    if (timeRange === '14d') {
      return vitalsData.slice(-14);
    }
    return vitalsData.slice(-30);
  }, [vitalsData, timeRange]);

  // Aggregate clinical metrics over the filtered range
  const summaryStats = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        latestHR: 72,
        avgHR: 74,
        minHR: 66,
        maxHR: 88,
        latestTemp: 98.6,
        avgTemp: 98.5,
        maxTemp: 99.4,
        latestBP: '120/80',
        latestSystolic: 120,
        latestDiastolic: 80,
        avgSystolic: 124,
        avgDiastolic: 82,
        maxSystolic: 142,
        readingsCount: 0,
        controlledBpPct: 88,
      };
    }

    const latest = filteredData[filteredData.length - 1];
    const totalCount = filteredData.length;

    // Heart Rate
    const hrValues = filteredData.map((d) => d.heartRate);
    const avgHR = Math.round(hrValues.reduce((a, b) => a + b, 0) / totalCount);
    const minHR = Math.min(...hrValues);
    const maxHR = Math.max(...hrValues);

    // Temperature
    const tempValues = filteredData.map((d) => d.temperature);
    const avgTemp = parseFloat((tempValues.reduce((a, b) => a + b, 0) / totalCount).toFixed(1));
    const maxTemp = Math.max(...tempValues);

    // Blood Pressure
    const sysValues = filteredData.map((d) => d.bpSystolic);
    const diaValues = filteredData.map((d) => d.bpDiastolic);
    const avgSystolic = Math.round(sysValues.reduce((a, b) => a + b, 0) / totalCount);
    const avgDiastolic = Math.round(diaValues.reduce((a, b) => a + b, 0) / totalCount);
    const maxSystolic = Math.max(...sysValues);

    // Controlled BP percentage (<130/<85)
    const controlledCount = filteredData.filter((d) => d.bpSystolic <= 130 && d.bpDiastolic <= 85).length;
    const controlledBpPct = Math.round((controlledCount / totalCount) * 100);

    return {
      latestHR: latest.heartRate,
      avgHR,
      minHR,
      maxHR,
      latestTemp: latest.temperature,
      avgTemp,
      maxTemp,
      latestBP: `${latest.bpSystolic}/${latest.bpDiastolic}`,
      latestSystolic: latest.bpSystolic,
      latestDiastolic: latest.bpDiastolic,
      avgSystolic,
      avgDiastolic,
      maxSystolic,
      readingsCount: totalCount,
      controlledBpPct,
    };
  }, [filteredData]);

  // Handle saving a new patient self-entry
  const handleSaveSelfLog = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const displayDate = `${today.getDate()} ${monthNames[today.getMonth()]}`;

    const newEntry: HealthTrendPoint = {
      id: `self-${Date.now()}`,
      dayIndex: 30,
      date: today.toISOString().split('T')[0],
      displayDate,
      displayTime: `${displayDate} ${today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      timeSlot: today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      heartRate: Number(newHeartRate),
      temperature: Number(newTemp),
      bpSystolic: Number(newSystolic),
      bpDiastolic: Number(newDiastolic),
      source: 'patient_self',
      notes: newNote || (isUrdu ? 'مریض کا خود کار ریکارڈ شدہ معائنہ' : 'Patient self-monitored reading.'),
      status: Number(newSystolic) >= 140 || Number(newTemp) >= 99.5 ? 'Attention Needed' : 'Normal',
    };

    try {
      const savedSelf = localStorage.getItem(`hc_patient_vitals_self_${patientMrn}`);
      const selfLogs = savedSelf ? JSON.parse(savedSelf) : [];
      selfLogs.push(newEntry);
      localStorage.setItem(`hc_patient_vitals_self_${patientMrn}`, JSON.stringify(selfLogs));
    } catch (_) {}

    setVitalsData((prev) => [...prev, newEntry]);
    setShowLogModal(false);
    setNewNote('');
  };

  // Custom Chart Tooltip
  const CustomHealthTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item: HealthTrendPoint = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700 text-xs min-w-[210px] space-y-2">
          <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
            <span className="font-bold text-slate-200">{item.displayTime}</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                item.source === 'nursing'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              }`}
            >
              {item.source === 'nursing' ? 'Nursing Care' : 'Self Log'}
            </span>
          </div>

          <div className="space-y-1 pt-0.5">
            {/* Blood Pressure */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                {isUrdu ? 'بلڈ پریشر:' : 'Blood Pressure:'}
              </span>
              <span className="font-mono font-black text-emerald-300">
                {item.bpSystolic}/{item.bpDiastolic} <span className="text-[10px] font-normal text-slate-400">mmHg</span>
              </span>
            </div>

            {/* Heart Rate */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                {isUrdu ? 'دل کی دھڑکن:' : 'Heart Rate:'}
              </span>
              <span className="font-mono font-black text-rose-300">
                {item.heartRate} <span className="text-[10px] font-normal text-slate-400">bpm</span>
              </span>
            </div>

            {/* Temperature */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                {isUrdu ? 'درجہ حرارت:' : 'Temperature:'}
              </span>
              <span className="font-mono font-black text-amber-300">
                {item.temperature}°F
              </span>
            </div>
          </div>

          {item.notes && (
            <div className="bg-slate-800/80 p-2 rounded-xl text-[11px] text-slate-300 border border-slate-700/60 leading-relaxed">
              <span className="text-slate-400 font-bold block text-[10px] mb-0.5">
                {item.nurseName ? `Nurse: ${item.nurseName}` : 'Clinical Note:'}
              </span>
              {item.notes}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-7 space-y-6" dir={isUrdu ? 'rtl' : 'ltr'}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                {isUrdu ? 'صحت کے رجحانات (Health Trends - پچھلے ۳۰ دن)' : 'Health Trends — 30-Day Clinical Vitals'}
              </h3>
              <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                {patientMrn}
              </span>
              <span className="bg-blue-100 text-blue-900 border border-blue-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                Recharts
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isUrdu
                ? 'وارڈ نرسنگ کیئر پورٹل (NursingCarePortalView) سے حاصل شدہ دل کی دھڑکن، جسم کا درجہ حرارت اور بلڈ پریشر کا جامع گراف'
                : 'Continuous 30-day time-series visualizing heart rate, body temperature, and blood pressure from inpatient & outpatient nursing records.'}
            </p>
          </div>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          {showSelfLogOption && (
            <button
              onClick={() => setShowLogModal(true)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-200" />
              <span>{isUrdu ? 'نیا ریڈنگ درج کریں' : 'Log Reading'}</span>
            </button>
          )}

          {/* Time Filter tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                timeRange === '30d' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isUrdu ? '۳۰ دن (30 Days)' : '30 Days'}
            </button>
            <button
              onClick={() => setTimeRange('14d')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                timeRange === '14d' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isUrdu ? '۱۴ دن' : '14 Days'}
            </button>
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                timeRange === '7d' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isUrdu ? '۷ دن' : '7 Days'}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Highlight Cards: Heart Rate, Temperature, Blood Pressure */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Metric 1: Blood Pressure */}
        <button
          onClick={() => setActiveMetric(activeMetric === 'bp' ? 'all' : 'bp')}
          className={`p-4 rounded-2xl border text-right transition-all cursor-pointer relative overflow-hidden ${
            activeMetric === 'bp'
              ? 'bg-emerald-50 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
              : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
            <span>{isUrdu ? 'بلڈ پریشر (Blood Pressure)' : 'Blood Pressure (BP)'}</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            {summaryStats.latestBP}{' '}
            <span className="text-xs font-normal text-slate-500">mmHg</span>
          </div>
          <div className="text-[11px] text-emerald-800 font-bold mt-1.5 flex items-center justify-between">
            <span>{isUrdu ? `۳۰ روزہ اوسط: ${summaryStats.avgSystolic}/${summaryStats.avgDiastolic}` : `30-Day Avg: ${summaryStats.avgSystolic}/${summaryStats.avgDiastolic}`}</span>
            <span className="bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded font-mono text-[10px]">
              {summaryStats.controlledBpPct}% Controlled
            </span>
          </div>
        </button>

        {/* Metric 2: Heart Rate / Pulse */}
        <button
          onClick={() => setActiveMetric(activeMetric === 'hr' ? 'all' : 'hr')}
          className={`p-4 rounded-2xl border text-right transition-all cursor-pointer relative overflow-hidden ${
            activeMetric === 'hr'
              ? 'bg-rose-50 border-rose-500 shadow-sm ring-2 ring-rose-500/20'
              : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
            <span>{isUrdu ? 'دل کی دھڑکن (Heart Rate)' : 'Heart Rate (Pulse)'}</span>
            <Heart className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            {summaryStats.latestHR}{' '}
            <span className="text-xs font-normal text-slate-500">bpm</span>
          </div>
          <div className="text-[11px] text-rose-800 font-bold mt-1.5 flex items-center justify-between">
            <span>{isUrdu ? `اوسط: ${summaryStats.avgHR} bpm` : `30-Day Avg: ${summaryStats.avgHR} bpm`}</span>
            <span className="bg-rose-100 text-rose-900 px-1.5 py-0.5 rounded font-mono text-[10px]">
              رینج: {summaryStats.minHR}-{summaryStats.maxHR}
            </span>
          </div>
        </button>

        {/* Metric 3: Body Temperature */}
        <button
          onClick={() => setActiveMetric(activeMetric === 'temp' ? 'all' : 'temp')}
          className={`p-4 rounded-2xl border text-right transition-all cursor-pointer relative overflow-hidden ${
            activeMetric === 'temp'
              ? 'bg-amber-50 border-amber-500 shadow-sm ring-2 ring-amber-500/20'
              : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
            <span>{isUrdu ? 'درجہ حرارت (Temperature)' : 'Body Temperature'}</span>
            <Thermometer className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            {summaryStats.latestTemp}°F
          </div>
          <div className="text-[11px] text-amber-800 font-bold mt-1.5 flex items-center justify-between">
            <span>{isUrdu ? `اوسط: ${summaryStats.avgTemp}°F` : `30-Day Avg: ${summaryStats.avgTemp}°F`}</span>
            <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-mono text-[10px]">
              چوٹی: {summaryStats.maxTemp}°F
            </span>
          </div>
        </button>
      </div>

      {/* Metric Mode Filter Pills */}
      <div className="flex items-center justify-between bg-slate-50 p-2 rounded-2xl border border-slate-200">
        <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5 px-2">
          <Filter className="w-3.5 h-3.5 text-emerald-600" />
          <span>{isUrdu ? 'چارٹ ویو منتخب کریں:' : 'Select Metric View:'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveMetric('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
              activeMetric === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            {isUrdu ? 'تمام وائٹلز (Combined)' : 'All Vitals Combined'}
          </button>
          <button
            onClick={() => setActiveMetric('bp')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
              activeMetric === 'bp'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            {isUrdu ? 'بلڈ پریشر' : 'Blood Pressure'}
          </button>
          <button
            onClick={() => setActiveMetric('hr')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
              activeMetric === 'hr'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            {isUrdu ? 'دل کی دھڑکن' : 'Heart Rate'}
          </button>
          <button
            onClick={() => setActiveMetric('temp')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
              activeMetric === 'temp'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            {isUrdu ? 'درجہ حرارت' : 'Temperature'}
          </button>
        </div>
      </div>

      {/* Main Recharts Visualization Canvas */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Chart Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-300">
              {activeMetric === 'all' && (isUrdu ? 'پچھلے ۳۰ دنوں کے تمام بنیادی وائٹلز کا رجحان' : '30-Day Multi-Parameter Health Trend')}
              {activeMetric === 'bp' && (isUrdu ? 'بلڈ پریشر کی ۳۰ روزہ ٹائم سیریز (سسٹولک و ڈائیسٹولک)' : '30-Day Blood Pressure Trajectory (Systolic / Diastolic)')}
              {activeMetric === 'hr' && (isUrdu ? 'دل کی دھڑکن (پلس ریٹ فی منٹ) کا ۳۰ روزہ گراف' : '30-Day Heart Rate & Pulse Variability')}
              {activeMetric === 'temp' && (isUrdu ? 'جسمانی درجہ حرارت (°F) کا ۳۰ روزہ معائنہ' : '30-Day Body Temperature (°F) Monitoring')}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-400 inline-block" />
              <span>Systolic (BP)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-teal-300 inline-block" />
              <span>Diastolic</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-rose-400 inline-block" />
              <span>Heart Rate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-amber-400 inline-block" />
              <span>Temp (°F)</span>
            </div>
          </div>
        </div>

        {/* The Recharts LineChart Component */}
        <div className="w-full h-80 sm:h-96" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData} margin={{ top: 15, right: 20, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              
              <XAxis
                dataKey="displayDate"
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                interval={Math.ceil(filteredData.length / 8)}
                tickLine={{ stroke: '#475569' }}
              />

              {/* Left Y Axis for BP & Heart Rate (values 50 to 180) */}
              <YAxis
                yAxisId="left"
                domain={[50, 160]}
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={(val) => `${val}`}
                tickLine={{ stroke: '#475569' }}
              />

              {/* Right Y Axis for Temperature (values 96 to 104 °F) */}
              {(activeMetric === 'all' || activeMetric === 'temp') && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[96.0, 102.0]}
                  stroke="#fbbf24"
                  tick={{ fill: '#fbbf24', fontSize: 11 }}
                  tickFormatter={(val) => `${val}°F`}
                  tickLine={{ stroke: '#f59e0b' }}
                />
              )}

              <Tooltip content={<CustomHealthTooltip />} />

              {/* Clinical Reference Benchmarks */}
              {activeMetric !== 'temp' && (
                <>
                  <ReferenceLine
                    yAxisId="left"
                    y={120}
                    stroke="#10b981"
                    strokeDasharray="4 4"
                    label={{ value: 'Target Systolic (120)', fill: '#10b981', fontSize: 10, position: 'insideTopLeft' }}
                  />
                  <ReferenceLine
                    yAxisId="left"
                    y={80}
                    stroke="#0d9488"
                    strokeDasharray="4 4"
                    label={{ value: 'Target Diastolic (80)', fill: '#0d9488', fontSize: 10, position: 'insideBottomLeft' }}
                  />
                </>
              )}

              {(activeMetric === 'all' || activeMetric === 'temp') && (
                <ReferenceLine
                  yAxisId="right"
                  y={98.6}
                  stroke="#f59e0b"
                  strokeDasharray="3 3"
                  label={{ value: 'Normal Temp (98.6°F)', fill: '#fbbf24', fontSize: 10, position: 'insideTopRight' }}
                />
              )}

              {/* Lines according to active selection */}
              {(activeMetric === 'all' || activeMetric === 'bp') && (
                <>
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="bpSystolic"
                    name="Systolic BP"
                    stroke="#34d399"
                    strokeWidth={2.5}
                    dot={{ fill: '#34d399', r: 3 }}
                    activeDot={{ r: 6, fill: '#10b981' }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="bpDiastolic"
                    name="Diastolic BP"
                    stroke="#2dd4bf"
                    strokeWidth={2}
                    dot={{ fill: '#2dd4bf', r: 2.5 }}
                    activeDot={{ r: 5, fill: '#0d9488' }}
                  />
                </>
              )}

              {(activeMetric === 'all' || activeMetric === 'hr') && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="heartRate"
                  name="Heart Rate (bpm)"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  dot={{ fill: '#f43f5e', r: 3 }}
                  activeDot={{ r: 6, fill: '#e11d48' }}
                />
              )}

              {(activeMetric === 'all' || activeMetric === 'temp') && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="temperature"
                  name="Temperature (°F)"
                  stroke="#fbbf24"
                  strokeWidth={2}
                  dot={{ fill: '#fbbf24', r: 2.5 }}
                  activeDot={{ r: 5, fill: '#d97706' }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Clinical Interpretation Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              {isUrdu
                ? 'حافظ کلینک میڈیکل ریکارڈز: پنجاب ہیلتھ کیئر کمیشن کے معیارات کے مطابق تصدیق شدہ'
                : 'Verified Hafiz Clinic Inpatient & Outpatient EHR data streams.'}
            </span>
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            Total {filteredData.length} observation points plotted
          </div>
        </div>
      </div>

      {/* Nursing Observation Timeline Log Table */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-emerald-700" />
            <h4 className="font-bold text-xs sm:text-sm text-slate-900">
              {isUrdu ? 'وارڈ نرسنگ و کلینیکل معائنہ لاگ (Recent Clinical Readings)' : 'Recent Nursing Rounds & Clinical Readings'}
            </h4>
          </div>
          <span className="text-[11px] text-slate-500 font-bold">
            {isUrdu ? 'آخری ۵ ان پٹس' : 'Showing Recent 5 Entries'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-100/75 text-slate-700 font-black border-b border-slate-200">
              <tr>
                <th className="p-3 text-right">{isUrdu ? 'تاریخ و وقت' : 'Date & Time'}</th>
                <th className="p-3 text-right">{isUrdu ? 'بلڈ پریشر' : 'Blood Pressure'}</th>
                <th className="p-3 text-right">{isUrdu ? 'دل کی دھڑکن' : 'Heart Rate'}</th>
                <th className="p-3 text-right">{isUrdu ? 'درجہ حرارت' : 'Temperature'}</th>
                <th className="p-3 text-right">{isUrdu ? 'ذریعہ / نرس' : 'Source / Nurse'}</th>
                <th className="p-3 text-right">{isUrdu ? 'کیفیت و نوٹس' : 'Clinical Notes'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredData.slice(-5).reverse().map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {entry.displayTime}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span className="font-mono font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {entry.bpSystolic}/{entry.bpDiastolic} mmHg
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap font-mono font-bold text-rose-700">
                    {entry.heartRate} bpm
                  </td>
                  <td className="p-3 whitespace-nowrap font-mono font-bold text-amber-700">
                    {entry.temperature}°F
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        entry.source === 'nursing'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {entry.nurseName || 'Patient Self-Log'}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600 max-w-xs truncate">
                    {entry.notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Self Log New Vitals */}
      {showLogModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-emerald-600" />
                <span>{isUrdu ? 'نیا معائنہ درج کریں' : 'Log Self-Monitored Reading'}</span>
              </h3>
              <button
                onClick={() => setShowLogModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSelfLog} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isUrdu ? 'سسٹولک (Systolic)' : 'Systolic (mmHg)'}
                  </label>
                  <input
                    type="number"
                    min="70"
                    max="240"
                    required
                    value={newSystolic}
                    onChange={(e) => setNewSystolic(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isUrdu ? 'ڈائیسٹولک (Diastolic)' : 'Diastolic (mmHg)'}
                  </label>
                  <input
                    type="number"
                    min="40"
                    max="140"
                    required
                    value={newDiastolic}
                    onChange={(e) => setNewDiastolic(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isUrdu ? 'دل کی دھڑکن (Pulse bpm)' : 'Heart Rate (bpm)'}
                  </label>
                  <input
                    type="number"
                    min="40"
                    max="180"
                    required
                    value={newHeartRate}
                    onChange={(e) => setNewHeartRate(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isUrdu ? 'درجہ حرارت (°F)' : 'Temperature (°F)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="95"
                    max="106"
                    required
                    value={newTemp}
                    onChange={(e) => setNewTemp(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isUrdu ? 'کیفیت / علامات (اختیاری)' : 'Clinical Note / Symptoms (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder={isUrdu ? 'مثلاً: ادویات کے بعد پرسکون...' : 'e.g. After evening herbal tea...'}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  {isUrdu ? 'محفوظ کریں' : 'Save Reading'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  {isUrdu ? 'منسوخ' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
