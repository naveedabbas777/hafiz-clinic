import { OPDQueueToken } from '../types';

const QUEUE_STORAGE_KEY = 'hafiz_clinic_opd_queue_v2';

export const INITIAL_OPD_TOKENS: OPDQueueToken[] = [
  {
    id: 'TK-101',
    tokenNumber: 41,
    tokenCode: 'TK-041',
    patientName: 'محمد عثمان علی',
    patientPhone: '0301-7654321',
    doctorId: 'doc-1',
    doctorName: 'ڈاکٹر زیشان چوہدری',
    department: 'General OPD & Herbal Medicine (کمرہ نمبر ۱)',
    issueTime: '10:15 AM',
    estimatedWaitMins: 0,
    status: 'In Consultation',
  },
  {
    id: 'TK-102',
    tokenNumber: 42,
    tokenCode: 'TK-042',
    patientName: 'شمیم اختر بیگم',
    patientPhone: '0322-8877665',
    doctorId: 'doc-2',
    doctorName: 'ڈاکٹر وقاص صغیر چوہدری',
    department: 'Physiotherapy & Eye Care (کمرہ نمبر ۲)',
    issueTime: '10:30 AM',
    estimatedWaitMins: 5,
    status: 'Calling',
  },
  {
    id: 'TK-103',
    tokenNumber: 43,
    tokenCode: 'TK-043',
    patientName: 'محمد بلال انصاری',
    patientPhone: '0345-1234567',
    doctorId: 'doc-1',
    doctorName: 'ڈاکٹر زیشان چوہدری',
    department: 'General OPD & Herbal Medicine (کمرہ نمبر ۱)',
    issueTime: '10:45 AM',
    estimatedWaitMins: 12,
    status: 'Waiting',
  },
  {
    id: 'TK-104',
    tokenNumber: 44,
    tokenCode: 'TK-044',
    patientName: 'عائشہ بی بی',
    patientPhone: '0300-9988776',
    doctorId: 'doc-2',
    doctorName: 'ڈاکٹر وقاص صغیر چوہدری',
    department: 'Physiotherapy & Eye Care (کمرہ نمبر ۲)',
    issueTime: '11:00 AM',
    estimatedWaitMins: 20,
    status: 'Waiting',
  },
  {
    id: 'TK-105',
    tokenNumber: 45,
    tokenCode: 'TK-045',
    patientName: 'طاہر محمود',
    patientPhone: '0313-5544332',
    doctorId: 'doc-1',
    doctorName: 'ڈاکٹر زیشان چوہدری',
    department: 'General OPD & Herbal Medicine (کمرہ نمبر ۱)',
    issueTime: '11:15 AM',
    estimatedWaitMins: 30,
    status: 'Waiting',
  },
  {
    id: 'TK-106',
    tokenNumber: 46,
    tokenCode: 'TK-046',
    patientName: 'حاجی محمد بشیر',
    patientPhone: '0333-8765432',
    doctorId: 'doc-2',
    doctorName: 'ڈاکٹر وقاص صغیر چوہدری',
    department: 'Physiotherapy & Eye Care (کمرہ نمبر ۲)',
    issueTime: '11:30 AM',
    estimatedWaitMins: 35,
    status: 'Waiting',
  },
];

export function getLocalQueueTokens(): OPDQueueToken[] {
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(INITIAL_OPD_TOKENS));
  return INITIAL_OPD_TOKENS;
}

export function saveLocalQueueTokens(tokens: OPDQueueToken[]): void {
  localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(tokens));
  // Broadcast event across windows / tabs
  window.dispatchEvent(new Event('opd_queue_updated'));
}

// Play notification bell audio using Web Audio API (cross-platform, no external asset dependencies)
export function playChimeBell(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Two-tone pleasant hospital chime
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc1.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.15);

    gainNode.gain.setValueAtTime(0.01, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 1.2);
    osc2.stop(ctx.currentTime + 1.2);
  } catch (e) {
    console.warn('Audio chime notice:', e);
  }
}

// Text-to-Speech Announcement in Urdu/English
export function announceTokenSpeech(tokenCode: string, patientName: string, doctorName?: string): void {
  playChimeBell();
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const text = `Token number ${tokenCode.replace('TK-', '')}. Patient ${patientName}. Please proceed to doctor consultation room.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 500);
    } catch (e) {}
  }
}
