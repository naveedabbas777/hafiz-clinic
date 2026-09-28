import React, { useState, useMemo, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  Activity,
  Heart,
  Droplets,
  Thermometer,
  Wind,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Plus,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  UserCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { NursingVitalsEntry } from './NursingCarePortalView';

export interface VitalsChartDataPoint {
  id: string;
  displayTime: string;
  fullDate: string;
  timeSlot: string;
  bpSystolic: number;
  bpDiastolic: number;
  bloodSugarRBS: number;
  pulseRate: number;
  temperature: number;
  spO2: number;
  respiratoryRate: number;
  painScale: number;
  source: 'nursing' | 'patient_self';
  nurseName?: string;
  notes?: string;
  doctorAlertStatus?: string;
}

interface PatientVitalsTrendChartProps {
  patientMrn?: string;
  patientName?: string;
  language?: 'urdu' | 'english';
  showSelfLogOption?: boolean;
}

export { HealthTrends } from './HealthTrends';

export const PatientVitalsTrendChart: React.FC<PatientVitalsTrendChartProps> = ({
  patientMrn = 'MRN-84920',
  patientName = 'محمد فاروق / Muhammad Farooq',
  language = 'urdu',
  showSelfLogOption = true,
}) => {
  const isUrdu = language === 'urdu';

  // Selected Active Metric
  const [activeMetric, setActiveMetric] = useState<'bp' | 'sugar' | 'pulse_spo2' | 'temp'>('bp');
  const [timeFilter, setTimeFilter] = useState<'24h' | '7d' | 'all'>('7d');
  const [showLogModal, setShowLogModal] = useState<boolean>(false);

  // Self-log form state
  const [newSystolic, setNewSystolic] = useState<number>(120);
  const [newDiastolic, setNewDiastolic] = useState<number>(80);
  const [newSugar, setNewSugar] = useState<number>(125);
  const [newPulse, setNewPulse] = useState<number>(75);
  const [newSpO2, setNewSpO2] = useState<number>(98);
  const [newTemp, setNewTemp] = useState<number>(98.6);
  const [newNote, setNewNote] = useState<string>('');

  // Load Nursing & Patient Vitals
  const [vitalsList, setVitalsList] = useState<VitalsChartDataPoint[]>([]);

  useEffect(() => {
    loadVitalsData();
  }, [patientMrn, patientName]);

  const loadVitalsData = () => {
    const defaultData: VitalsChartDataPoint[] = [
      {
        id: 'vit-1',
        displayTime: 'Mon 08:00 AM',
        fullDate: '2026-08-16',
        timeSlot: '08:00 AM',
        bpSystolic: 145,
        bpDiastolic: 95,
        bloodSugarRBS: 168,
        pulseRate: 88,
        temperature: 99.1,
        spO2: 95,
        respiratoryRate: 20,
        painScale: 6,
        source: 'nursing',
        nurseName: 'Staff Nurse Fouzia Parveen',
        notes: 'Initial admission baseline. Patient reported headache & neck tension.',
        doctorAlertStatus: 'Alert Raised',
      },
      {
        id: 'vit-2',
        displayTime: 'Mon 02:00 PM',
        fullDate: '2026-08-16',
        timeSlot: '02:00 PM',
        bpSystolic: 138,
        bpDiastolic: 88,
        bloodSugarRBS: 152,
        pulseRate: 82,
        temperature: 98.8,
        spO2: 96,
        respiratoryRate: 19,
        painScale: 5,
        source: 'nursing',
        nurseName: 'Staff Nurse Fouzia Parveen',
        notes: 'After herbal muscle relaxation therapy. BP improving.',
        doctorAlertStatus: 'Normal',
      },
      {
        id: 'vit-3',
        displayTime: 'Mon 08:00 PM',
        fullDate: '2026-08-16',
        timeSlot: '08:00 PM',
        bpSystolic: 132,
        bpDiastolic: 85,
        bloodSugarRBS: 140,
        pulseRate: 78,
        temperature: 98.6,
        spO2: 97,
        respiratoryRate: 18,
        painScale: 4,
        source: 'nursing',
        nurseName: 'Sister Shamaila Akhtar',
        notes: 'Evening post-dinner check. Comfortable in bed.',
        doctorAlertStatus: 'Normal',
      },
      {
        id: 'vit-4',
        displayTime: 'Tue 08:00 AM',
        fullDate: '2026-08-17',
        timeSlot: '08:00 AM',
        bpSystolic: 128,
        bpDiastolic: 82,
        bloodSugarRBS: 118,
        pulseRate: 74,
        temperature: 98.4,
        spO2: 98,
        respiratoryRate: 17,
        painScale: 3,
        source: 'nursing',
        nurseName: 'Staff Nurse Fouzia Parveen',
        notes: 'Fasting vitals. Blood pressure well controlled. Sugar in normal zone.',
        doctorAlertStatus: 'Normal',
      },
      {
        id: 'vit-5',
        displayTime: 'Tue 02:00 PM',
        fullDate: '2026-08-17',
        timeSlot: '02:00 PM',
        bpSystolic: 124,
        bpDiastolic: 80,
        bloodSugarRBS: 132,
        pulseRate: 72,
        temperature: 98.6,
        spO2: 98,
        respiratoryRate: 18,
        painScale: 2,
        source: 'nursing',
        nurseName: 'Staff Nurse Fouzia Parveen',
        notes: 'Post-physiotherapy reading. Patient walked comfortably without support.',
        doctorAlertStatus: 'Normal',
      },
      {
        id: 'vit-6',
        displayTime: 'Wed 08:00 AM',
        fullDate: '2026-08-18',
        timeSlot: '08:00 AM',
        bpSystolic: 122,
        bpDiastolic: 80,
        bloodSugarRBS: 115,
        pulseRate: 70,
        temperature: 98.5,
        spO2: 99,
        respiratoryRate: 16,
        painScale: 2,
        source: 'nursing',
        nurseName: 'Sister Shamaila Akhtar',
        notes: 'Excellent clinical stability. All parameters optimal.',
        doctorAlertStatus: 'Normal',
      },
      {
        id: 'vit-7',
        displayTime: 'Wed 08:00 PM',
        fullDate: '2026-08-18',
        timeSlot: '08:00 PM',
        bpSystolic: 120,
        bpDiastolic: 78,
        bloodSugarRBS: 122,
        pulseRate: 72,
        temperature: 98.6,
        spO2: 98,
        respiratoryRate: 16,
        painScale: 1,
        source: 'nursing',
        nurseName: 'Staff Nurse Fouzia Parveen',
        notes: 'Pre-discharge checkup. Prescribed home herbal regimen.',
        doctorAlertStatus: 'Normal',
      },
      {
        id: 'vit-8',
        displayTime: 'Today 09:30 AM',
        fullDate: new Date().toISOString().split('T')[0],
        timeSlot: '09:30 AM',
        bpSystolic: 118,
        bpDiastolic: 78,
        bloodSugarRBS: 112,
        pulseRate: 72,
        temperature: 98.4,
        spO2: 99,
        respiratoryRate: 16,
        painScale: 1,
        source: 'patient_self',
        notes: 'Home digital monitor reading after morning herbal tea.',
        doctorAlertStatus: 'Normal',
      },
    ];

    try {
      const savedV2 = localStorage.getItem('hc_nursing_vitals_logs_v2');
      if (savedV2) {
        const parsed: NursingVitalsEntry[] = JSON.parse(savedV2);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Map real nursing logs into chart data
          const mappedLogs: VitalsChartDataPoint[] = parsed.map((item, idx) => {
            const dateObj = new Date(item.timestamp || Date.now());
            const displayTime = `${dateObj.toLocaleDateString([], { weekday: 'short' })} ${item.timeSlot || dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            return {
              id: item.id || `nv-${idx}`,
              displayTime,
              fullDate: dateObj.toISOString().split('T')[0],
              timeSlot: item.timeSlot || '08:00 AM',
              bpSystolic: item.bpSystolic || 120,
              bpDiastolic: item.bpDiastolic || 80,
              bloodSugarRBS: item.bloodSugarRBS || 120,
              pulseRate: item.pulseRate || 74,
              temperature: item.temperature || 98.6,
              spO2: item.spO2 || 98,
              respiratoryRate: item.respiratoryRate || 18,
              painScale: item.painScale || 2,
              source: 'nursing',
              nurseName: item.nurseName || 'Nursing Station',
              notes: item.nursingNotesEnglish || item.nursingNotesUrdu || 'Normal round completed.',
              doctorAlertStatus: item.doctorAlertStatus || 'Normal',
            };
          });

          // Check if patient self logs exist in localStorage
          const savedSelf = localStorage.getItem(`hc_patient_vitals_self_${patientMrn}`);
          const selfLogs: VitalsChartDataPoint[] = savedSelf ? JSON.parse(savedSelf) : [];

          const combined = [...defaultData, ...mappedLogs, ...selfLogs];
          // Deduplicate by id
          const unique = Array.from(new Map(combined.map((m) => [m.id, m])).values());
          setVitalsList(unique);
          return;
        }
      }

      // Check self logs if no V2
      const savedSelf = localStorage.getItem(`hc_patient_vitals_self_${patientMrn}`);
      const selfLogs: VitalsChartDataPoint[] = savedSelf ? JSON.parse(savedSelf) : [];
      setVitalsList([...defaultData, ...selfLogs]);
    } catch (_) {
      setVitalsList(defaultData);
    }
  };

  // Filter time range
  const filteredData = useMemo(() => {
    if (timeFilter === '24h') {
      return vitalsList.slice(-4);
    }
    if (timeFilter === '7d') {
      return vitalsList.slice(-8);
    }
    return vitalsList;
  }, [vitalsList, timeFilter]);

  // Metric Computed Stats
  const stats = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        latestSystolic: 120,
        latestDiastolic: 80,
        avgSystolic: 120,
        avgDiastolic: 80,
        latestSugar: 120,
        avgSugar: 120,
        latestPulse: 72,
        latestSpO2: 98,
        minSpO2: 96,
        latestTemp: 98.6,
      };
    }
    const latest = filteredData[filteredData.length - 1];
    const sumSys = filteredData.reduce((acc, d) => acc + d.bpSystolic, 0);
    const sumDia = filteredData.reduce((acc, d) => acc + d.bpDiastolic, 0);
    const sumSugar = filteredData.reduce((acc, d) => acc + d.bloodSugarRBS, 0);
    const minSpO2 = Math.min(...filteredData.map((d) => d.spO2));

    return {
      latestSystolic: latest.bpSystolic,
      latestDiastolic: latest.bpDiastolic,
      avgSystolic: Math.round(sumSys / filteredData.length),
      avgDiastolic: Math.round(sumDia / filteredData.length),
      latestSugar: latest.bloodSugarRBS,
      avgSugar: Math.round(sumSugar / filteredData.length),
      latestPulse: latest.pulseRate,
      latestSpO2: latest.spO2,
      minSpO2,
      latestTemp: latest.temperature,
    };
  }, [filteredData]);

  // Handle Save New Reading
  const handleSaveSelfLog = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const newEntry: VitalsChartDataPoint = {
      id: `self-${Date.now()}`,
      displayTime: `Today ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      fullDate: now.toISOString().split('T')[0],
      timeSlot: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      bpSystolic: Number(newSystolic),
      bpDiastolic: Number(newDiastolic),
      bloodSugarRBS: Number(newSugar),
      pulseRate: Number(newPulse),
      temperature: Number(newTemp),
      spO2: Number(newSpO2),
      respiratoryRate: 18,
      painScale: 1,
      source: 'patient_self',
      notes: newNote || 'Self-monitored reading logged by patient.',
      doctorAlertStatus: newSystolic >= 140 || newSugar >= 180 ? 'Attention Needed' : 'Normal',
    };

    try {
      const savedSelf = localStorage.getItem(`hc_patient_vitals_self_${patientMrn}`);
      const selfLogs: VitalsChartDataPoint[] = savedSelf ? JSON.parse(savedSelf) : [];
      selfLogs.push(newEntry);
      localStorage.setItem(`hc_patient_vitals_self_${patientMrn}`, JSON.stringify(selfLogs));
    } catch (_) {}

    setVitalsList((prev) => [...prev, newEntry]);
    setShowLogModal(false);
    setNewNote('');
  };

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload as VitalsChartDataPoint;
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-2xl shadow-xl border border-slate-700 text-xs space-y-1.5 backdrop-blur-md min-w-[200px]">
          <div className="flex justify-between items-center border-b border-slate-700 pb-1 font-mono text-[10px] text-emerald-400 font-bold">
            <span>{dataPoint.displayTime}</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[9px] font-sans ${
                dataPoint.source === 'nursing' ? 'bg-emerald-800 text-emerald-100' : 'bg-blue-800 text-blue-100'
              }`}
            >
              {dataPoint.source === 'nursing' ? (isUrdu ? 'نرسنگ ان پٹ' : 'Nursing Ward') : (isUrdu ? 'مریض کا اندراج' : 'Self Log')}
            </span>
          </div>

          {activeMetric === 'bp' && (
            <div className="space-y-0.5">
              <div className="flex justify-between font-bold">
                <span className="text-emerald-400">{isUrdu ? 'سسٹولک (Systolic):' : 'Systolic BP:'}</span>
                <span className="font-mono text-emerald-300">{dataPoint.bpSystolic} mmHg</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-sky-400">{isUrdu ? 'ڈائسٹولک (Diastolic):' : 'Diastolic BP:'}</span>
                <span className="font-mono text-sky-300">{dataPoint.bpDiastolic} mmHg</span>
              </div>
              <div className="text-[10px] text-slate-400 pt-0.5">
                {dataPoint.bpSystolic < 120 && dataPoint.bpDiastolic < 80
                  ? isUrdu ? '✓ مثالی نارمل ریڈنگ' : '✓ Optimal BP'
                  : dataPoint.bpSystolic <= 139
                  ? isUrdu ? 'معتدل پری ہائپر ٹینشن' : 'Mild Pre-Hypertension'
                  : isUrdu ? '⚠️ ہائی بلڈ پریشر الرٹ' : '⚠️ Stage 1/2 Hypertension'}
              </div>
            </div>
          )}

          {activeMetric === 'sugar' && (
            <div className="space-y-0.5">
              <div className="flex justify-between font-bold">
                <span className="text-amber-400">{isUrdu ? 'شوگر لیول (RBS):' : 'Blood Sugar (RBS):'}</span>
                <span className="font-mono text-amber-300 text-sm font-black">{dataPoint.bloodSugarRBS} mg/dL</span>
              </div>
              <div className="text-[10px] text-slate-400 pt-0.5">
                {dataPoint.bloodSugarRBS <= 140
                  ? isUrdu ? '✓ نارمل محفوظ رینج (70-140)' : '✓ In Target Range (70-140)'
                  : isUrdu ? '⚠️ شوگر معمول سے زیادہ ہے' : '⚠️ Elevated Post-Prandial'}
              </div>
            </div>
          )}

          {activeMetric === 'pulse_spo2' && (
            <div className="space-y-0.5">
              <div className="flex justify-between font-bold">
                <span className="text-rose-400">{isUrdu ? 'نبض کی رفتار (Pulse):' : 'Pulse Rate:'}</span>
                <span className="font-mono text-rose-300">{dataPoint.pulseRate} bpm</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-cyan-400">{isUrdu ? 'آکسیجن سیچوریشن (SpO2):' : 'Oxygen (SpO2):'}</span>
                <span className="font-mono text-cyan-300">{dataPoint.spO2}%</span>
              </div>
            </div>
          )}

          {activeMetric === 'temp' && (
            <div className="space-y-0.5">
              <div className="flex justify-between font-bold">
                <span className="text-orange-400">{isUrdu ? 'درجہ حرارت (Temp):' : 'Temperature:'}</span>
                <span className="font-mono text-orange-300">{dataPoint.temperature}°F</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-teal-400">{isUrdu ? 'تنفس (Respiration):' : 'Resp Rate:'}</span>
                <span className="font-mono text-teal-300">{dataPoint.respiratoryRate}/min</span>
              </div>
            </div>
          )}

          {dataPoint.notes && (
            <div className="text-[10px] text-slate-300 border-t border-slate-700/80 pt-1 italic">
              "{dataPoint.notes}"
            </div>
          )}
          {dataPoint.nurseName && (
            <div className="text-[9px] text-slate-400 text-right">
              {isUrdu ? `درج کنندہ: ${dataPoint.nurseName}` : `Logged by: ${dataPoint.nurseName}`}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-7 space-y-6" dir={isUrdu ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  {isUrdu ? 'وائٹل سائنز ٹرینڈ اینالیسس (Vital Signs Visualization)' : 'Vital Signs Trend & Nursing Care Analytics'}
                </h3>
                <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                  {patientMrn}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isUrdu
                  ? 'وارڈ نرسنگ کیئر ان پٹس اور روزانہ معائنے کے ذریعے بلڈ پریشر اور شوگر لیول کا خودکار ٹرینڈ گراف'
                  : 'Time-series tracking of blood pressure, blood glucose, and oxygen from nursing 4-hourly clinical rounds.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          {showSelfLogOption && (
            <button
              onClick={() => setShowLogModal(true)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>{isUrdu ? 'نیا معائنہ درج کریں' : 'Log Self Reading'}</span>
            </button>
          )}

          {/* Time Filter buttons */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setTimeFilter('24h')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                timeFilter === '24h' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isUrdu ? '۲۴ گھنٹے' : '24h'}
            </button>
            <button
              onClick={() => setTimeFilter('7d')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                timeFilter === '7d' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isUrdu ? '۷ دن' : '7 Days'}
            </button>
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                timeFilter === 'all' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isUrdu ? 'مکمل ہسٹری' : 'All'}
            </button>
          </div>
        </div>
      </div>

      {/* 4 Interactive Metric Toggles with Live KPI Badges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Blood Pressure */}
        <button
          onClick={() => setActiveMetric('bp')}
          className={`p-4 rounded-2xl border text-right transition-all cursor-pointer relative overflow-hidden ${
            activeMetric === 'bp'
              ? 'bg-emerald-50/80 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
              : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
            <span>{isUrdu ? 'بلڈ پریشر (BP)' : 'Blood Pressure'}</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-slate-900">
            {stats.latestSystolic}/{stats.latestDiastolic}
            <span className="text-xs font-normal text-slate-500 ml-1">mmHg</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>
              {isUrdu ? `اوسط: ${stats.avgSystolic}/${stats.avgDiastolic}` : `Avg: ${stats.avgSystolic}/${stats.avgDiastolic}`}
            </span>
          </div>
        </button>

        {/* Metric 2: Blood Sugar */}
        <button
          onClick={() => setActiveMetric('sugar')}
          className={`p-4 rounded-2xl border text-right transition-all cursor-pointer relative overflow-hidden ${
            activeMetric === 'sugar'
              ? 'bg-amber-50/80 border-amber-500 shadow-md ring-2 ring-amber-500/20'
              : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
            <span>{isUrdu ? 'شوگر لیول (RBS)' : 'Blood Sugar (RBS)'}</span>
            <Droplets className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-slate-900">
            {stats.latestSugar}
            <span className="text-xs font-normal text-slate-500 ml-1">mg/dL</span>
          </div>
          <div className="text-[11px] text-amber-700 font-bold mt-1 flex items-center gap-1">
            <span>
              {isUrdu ? `اوسط شوگر: ${stats.avgSugar} mg/dL` : `Avg: ${stats.avgSugar} mg/dL`}
            </span>
          </div>
        </button>

        {/* Metric 3: Pulse & SpO2 */}
        <button
          onClick={() => setActiveMetric('pulse_spo2')}
          className={`p-4 rounded-2xl border text-right transition-all cursor-pointer relative overflow-hidden ${
            activeMetric === 'pulse_spo2'
              ? 'bg-rose-50/80 border-rose-500 shadow-md ring-2 ring-rose-500/20'
              : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
            <span>{isUrdu ? 'نبض و آکسیجن' : 'Pulse & Oxygen'}</span>
            <Heart className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-slate-900">
            {stats.latestPulse} <span className="text-xs font-normal text-slate-500">bpm</span> / {stats.latestSpO2}%
          </div>
          <div className="text-[11px] text-slate-600 font-bold mt-1 flex items-center gap-1">
            <span>{isUrdu ? `کم از کم SpO2: ${stats.minSpO2}%` : `Min SpO2: ${stats.minSpO2}%`}</span>
          </div>
        </button>

        {/* Metric 4: Temperature */}
        <button
          onClick={() => setActiveMetric('temp')}
          className={`p-4 rounded-2xl border text-right transition-all cursor-pointer relative overflow-hidden ${
            activeMetric === 'temp'
              ? 'bg-teal-50/80 border-teal-500 shadow-md ring-2 ring-teal-500/20'
              : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
            <span>{isUrdu ? 'درجہ حرارت و تنفس' : 'Temperature'}</span>
            <Thermometer className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-slate-900">
            {stats.latestTemp}
            <span className="text-xs font-normal text-slate-500 ml-1">°F</span>
          </div>
          <div className="text-[11px] text-teal-700 font-bold mt-1 flex items-center gap-1">
            <span>{isUrdu ? 'معمول کا درجہ حرارت (98.6°F)' : 'Baseline: 98.6°F'}</span>
          </div>
        </button>
      </div>

      {/* =================================================================== */}
      {/* RECHARTS VISUALIZATION CANVAS */}
      {/* =================================================================== */}
      <div className="bg-slate-50/70 border border-slate-200 rounded-3xl p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <h4 className="font-black text-sm text-slate-900">
              {activeMetric === 'bp' && (isUrdu ? 'بلڈ پریشر کی وقت کے ساتھ پیش رفت (Systolic vs Diastolic Trend)' : 'Blood Pressure Trend (Systolic vs Diastolic)')}
              {activeMetric === 'sugar' && (isUrdu ? 'شوگر لیول اور گلوکوز اتار چڑھاؤ (RBS Trajectory)' : 'Blood Sugar Levels (RBS Over Time)')}
              {activeMetric === 'pulse_spo2' && (isUrdu ? 'دل کی دھڑکن اور آکسیجن کی مقدار (Heart Rate & SpO2 %)' : 'Pulse Rate & Oxygen Saturation (SpO2)')}
              {activeMetric === 'temp' && (isUrdu ? 'جسم کا درجہ حرارت اور تنفس (Body Temp & Respiration)' : 'Body Temperature & Respiratory Rate')}
            </h4>
          </div>

          {/* Reference benchmark legend badge */}
          <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-3">
            {activeMetric === 'bp' && (
              <>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-1 bg-emerald-600 rounded" />
                  <span>{isUrdu ? 'سسٹولک (نارمل < 120)' : 'Systolic (< 120)'}</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-1 bg-sky-600 rounded" />
                  <span>{isUrdu ? 'ڈائسٹولک (نارمل < 80)' : 'Diastolic (< 80)'}</span>
                </span>
                <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold">
                  ✓ {isUrdu ? 'ہائپر ٹینشن بارڈر: 140/90' : 'Stage 1 Threshold: 140/90'}
                </span>
              </>
            )}

            {activeMetric === 'sugar' && (
              <>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-amber-500/30 border border-amber-500 rounded" />
                  <span>{isUrdu ? 'محفوظ رینج: 70 - 140 mg/dL' : 'Target Zone: 70-140 mg/dL'}</span>
                </span>
                <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded text-[10px] font-bold">
                  {isUrdu ? 'کھانے کے بعد عام رینج' : 'Post-Prandial Safe Floor'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Dynamic Recharts Chart Area */}
        <div className="w-full h-72 sm:h-80" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            {activeMetric === 'bp' ? (
              <LineChart data={filteredData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="displayTime"
                  stroke="#64748b"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[50, 180]}
                  stroke="#64748b"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  unit=" mmHg"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} />

                {/* Normal blood pressure target benchmark lines */}
                <ReferenceLine y={120} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Normal Systolic 120', fill: '#059669', fontSize: 10, position: 'insideTopRight' }} />
                <ReferenceLine y={80} stroke="#0284c7" strokeDasharray="3 3" label={{ value: 'Normal Diastolic 80', fill: '#0284c7', fontSize: 10, position: 'insideBottomRight' }} />
                <ReferenceLine y={140} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: 'Hypertension 140', fill: '#f43f5e', fontSize: 10, position: 'right' }} />
                <ReferenceLine y={90} stroke="#fb7185" strokeDasharray="4 4" label={{ value: 'Diastolic Limit 90', fill: '#fb7185', fontSize: 10, position: 'right' }} />

                <Line
                  type="monotone"
                  dataKey="bpSystolic"
                  name={isUrdu ? 'سسٹولک (Systolic)' : 'Systolic BP'}
                  stroke="#059669"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#059669', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 7, fill: '#047857' }}
                />
                <Line
                  type="monotone"
                  dataKey="bpDiastolic"
                  name={isUrdu ? 'ڈائسٹولک (Diastolic)' : 'Diastolic BP'}
                  stroke="#0284c7"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#0284c7', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 7, fill: '#0369a1' }}
                />
              </LineChart>
            ) : activeMetric === 'sugar' ? (
              <AreaChart data={filteredData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="sugarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="displayTime"
                  stroke="#64748b"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[60, 220]}
                  stroke="#64748b"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  unit=" mg/dL"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} />

                {/* Normal blood sugar safe target zone reference lines */}
                <ReferenceLine y={140} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Target Max 140', fill: '#059669', fontSize: 10, position: 'insideTopRight' }} />
                <ReferenceLine y={70} stroke="#059669" strokeDasharray="3 3" label={{ value: 'Target Min 70', fill: '#059669', fontSize: 10, position: 'insideBottomRight' }} />
                <ReferenceLine y={180} stroke="#dc2626" strokeDasharray="4 4" label={{ value: 'High Alert 180', fill: '#dc2626', fontSize: 10, position: 'right' }} />

                <Area
                  type="monotone"
                  dataKey="bloodSugarRBS"
                  name={isUrdu ? 'شوگر لیول (mg/dL)' : 'Blood Sugar (mg/dL)'}
                  stroke="#d97706"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#sugarGradient)"
                  dot={{ r: 4, fill: '#d97706', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 7, fill: '#b45309' }}
                />
              </AreaChart>
            ) : activeMetric === 'pulse_spo2' ? (
              <LineChart data={filteredData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="displayTime"
                  stroke="#64748b"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="pulse"
                  domain={[50, 120]}
                  stroke="#e11d48"
                  tick={{ fontSize: 11, fill: '#e11d48' }}
                  unit=" bpm"
                />
                <YAxis
                  yAxisId="spo2"
                  orientation="right"
                  domain={[88, 100]}
                  stroke="#0891b2"
                  tick={{ fontSize: 11, fill: '#0891b2' }}
                  unit="%"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} />

                <ReferenceLine yAxisId="spo2" y={95} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Min SpO2 95%', fill: '#f43f5e', fontSize: 10, position: 'insideTopLeft' }} />

                <Line
                  yAxisId="pulse"
                  type="monotone"
                  dataKey="pulseRate"
                  name={isUrdu ? 'نبض (Pulse bpm)' : 'Heart Rate (bpm)'}
                  stroke="#e11d48"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#e11d48', strokeWidth: 2, stroke: '#ffffff' }}
                />
                <Line
                  yAxisId="spo2"
                  type="monotone"
                  dataKey="spO2"
                  name={isUrdu ? 'آکسیجن (SpO2 %)' : 'Oxygen (SpO2 %)'}
                  stroke="#0891b2"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#0891b2', strokeWidth: 2, stroke: '#ffffff' }}
                />
              </LineChart>
            ) : (
              <LineChart data={filteredData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="displayTime"
                  stroke="#64748b"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[96, 104]}
                  stroke="#0d9488"
                  tick={{ fontSize: 11, fill: '#0d9488' }}
                  unit="°F"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} />

                <ReferenceLine y={98.6} stroke="#059669" strokeDasharray="3 3" label={{ value: 'Normal 98.6°F', fill: '#059669', fontSize: 10, position: 'right' }} />
                <ReferenceLine y={100.4} stroke="#e11d48" strokeDasharray="3 3" label={{ value: 'Fever 100.4°F', fill: '#e11d48', fontSize: 10, position: 'right' }} />

                <Line
                  type="monotone"
                  dataKey="temperature"
                  name={isUrdu ? 'درجہ حرارت (°F)' : 'Temperature (°F)'}
                  stroke="#0d9488"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#0d9488', strokeWidth: 2, stroke: '#ffffff' }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Clinical Interpretation Footer */}
        <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="text-emerald-950 font-bold">
              {isUrdu
                ? 'طبی مشاہدہ: مریض کا بلڈ پریشر بتدریج مستحکم ہو رہا ہے اور شوگر لیول محفوظ رینج میں ہے (Blood Pressure stable).'
                : 'Clinical Impression: Blood pressure demonstrates healthy downward normalization with stable glycemic control.'}
            </span>
          </div>

          <div className="text-[11px] text-emerald-800 font-mono font-bold bg-white px-2.5 py-1 rounded-lg border border-emerald-300">
            {isUrdu ? 'تصدیق شدہ نرسنگ وائٹلز ڈیٹا' : 'Certified Nursing Vitals Feed'}
          </div>
        </div>
      </div>

      {/* Nursing Shift Entry Timeline Feed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-black text-xs text-slate-800 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isUrdu ? 'وارڈ نرسنگ کیئر ان پٹس کی تفصیلی ہسٹری' : 'Recorded 4-Hourly Nursing Log History'}</span>
          </h4>
          <span className="text-[10px] text-slate-400 font-mono">
            {filteredData.length} {isUrdu ? 'اندراجات' : 'Recorded checkpoints'}
          </span>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {filteredData.slice().reverse().map((entry) => (
            <div
              key={entry.id}
              className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 font-mono">{entry.displayTime}</span>
                  <span
                    className={`text-[9.5px] px-2 py-0.5 rounded-full font-bold ${
                      entry.source === 'nursing'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-blue-100 text-blue-900 border border-blue-300'
                    }`}
                  >
                    {entry.source === 'nursing' ? '👨‍⚕️ Nursing In-Patient' : '🏠 Self Log'}
                  </span>
                  {entry.nurseName && (
                    <span className="text-[10px] text-slate-500 font-medium">({entry.nurseName})</span>
                  )}
                </div>
                {entry.notes && <p className="text-[11px] text-slate-600 italic">"{entry.notes}"</p>}
              </div>

              <div className="flex items-center gap-3 font-mono font-bold text-[11px] self-end sm:self-auto shrink-0">
                <div className="bg-white px-2 py-1 rounded-lg border border-slate-200">
                  BP: <span className="text-emerald-700">{entry.bpSystolic}/{entry.bpDiastolic}</span>
                </div>
                <div className="bg-white px-2 py-1 rounded-lg border border-slate-200">
                  RBS: <span className="text-amber-700">{entry.bloodSugarRBS}</span>
                </div>
                <div className="bg-white px-2 py-1 rounded-lg border border-slate-200">
                  Pulse: <span className="text-rose-700">{entry.pulseRate}</span>
                </div>
                <div className="bg-white px-2 py-1 rounded-lg border border-slate-200">
                  SpO2: <span className="text-cyan-700">{entry.spO2}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =================================================================== */}
      {/* SELF-LOG MODAL */}
      {/* =================================================================== */}
      {showLogModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative text-slate-900">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-sm text-slate-900">
                  {isUrdu ? 'گھر بیٹھے نیا وائٹل سائن درج کریں' : 'Record Home Vitals Reading'}
                </h3>
              </div>
              <button
                onClick={() => setShowLogModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSelfLog} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">
                    {isUrdu ? 'سسٹولک بی پی (Systolic)' : 'Systolic BP (mmHg)'}
                  </label>
                  <input
                    type="number"
                    value={newSystolic}
                    onChange={(e) => setNewSystolic(Number(e.target.value))}
                    required
                    min={60}
                    max={250}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">
                    {isUrdu ? 'ڈائسٹولک بی پی (Diastolic)' : 'Diastolic BP (mmHg)'}
                  </label>
                  <input
                    type="number"
                    value={newDiastolic}
                    onChange={(e) => setNewDiastolic(Number(e.target.value))}
                    required
                    min={40}
                    max={160}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">
                    {isUrdu ? 'شوگر لیول (Blood Sugar mg/dL)' : 'Blood Sugar (mg/dL)'}
                  </label>
                  <input
                    type="number"
                    value={newSugar}
                    onChange={(e) => setNewSugar(Number(e.target.value))}
                    required
                    min={40}
                    max={600}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">
                    {isUrdu ? 'نبض کی رفتار (Pulse bpm)' : 'Pulse Rate (bpm)'}
                  </label>
                  <input
                    type="number"
                    value={newPulse}
                    onChange={(e) => setNewPulse(Number(e.target.value))}
                    required
                    min={40}
                    max={200}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">
                    {isUrdu ? 'آکسیجن (SpO2 %)' : 'Oxygen (SpO2 %)'}
                  </label>
                  <input
                    type="number"
                    value={newSpO2}
                    onChange={(e) => setNewSpO2(Number(e.target.value))}
                    required
                    min={70}
                    max={100}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">
                    {isUrdu ? 'درجہ حرارت (°F)' : 'Temperature (°F)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newTemp}
                    onChange={(e) => setNewTemp(Number(e.target.value))}
                    required
                    min={90}
                    max={108}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">
                  {isUrdu ? 'نوٹس یا علامات (Optional Notes)' : 'Notes or Symptoms'}
                </label>
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder={isUrdu ? 'مثال: ناشتے کے بعد بلڈ پریشر چیک کیا گیا' : 'e.g. Measured 2 hours after morning breakfast'}
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors font-bold cursor-pointer"
                >
                  {isUrdu ? 'منسوخ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition-all shadow-md cursor-pointer"
                >
                  {isUrdu ? 'محفوظ کریں' : 'Save Reading'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
