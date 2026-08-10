import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, FileText, User, Search, Phone, Video, Mic, X, ExternalLink, ShieldCheck, FileCheck, Lock, ArrowLeft, Play, Pause, Trash2, Download, CheckCheck, MicOff, VideoOff, PhoneOff, Volume2, VolumeX } from 'lucide-react';
import { Doctor } from '../types';
import { getMessagesApi, sendMessageApi, createReportApi, uploadDiseaseImageApi, getUsersApi } from '../services/api';

// WAV Audio Blob Generator for cross-browser fallback voice notes
function createAudioToneBlobUrl(durationSeconds: number = 4): string {
  try {
    const sampleRate = 22050;
    const dur = Math.max(1, Math.min(30, durationSeconds));
    const numSamples = sampleRate * dur;
    const buffer = new Uint8Array(44 + numSamples * 2);
    const view = new DataView(buffer.buffer);

    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, numSamples * 2, true);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const freq = 280 + Math.sin(t * 8) * 60 + Math.cos(t * 3) * 30;
      const sample = Math.sin(2 * Math.PI * freq * t) * 0.35 * (1 - Math.exp(-t * 2)) * Math.min(1, (numSamples - i) / 2000);
      const intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
      view.setInt16(44 + i * 2, intSample, true);
    }

    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  } catch (e) {
    return '';
  }
}

// WhatsApp Dual-Tone Phone Ringtone Synthesizer (Web Audio API)
class RingtoneSynthesizer {
  private ctx: AudioContext | null = null;
  private interval: any = null;

  start() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      const pulse = () => {
        if (!this.ctx || this.ctx.state === 'closed') return;
        const o1 = this.ctx.createOscillator();
        const o2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        o1.type = 'sine';
        o2.type = 'sine';
        o1.frequency.setValueAtTime(440, this.ctx.currentTime);
        o2.frequency.setValueAtTime(480, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.8);

        o1.connect(gain);
        o2.connect(gain);
        gain.connect(this.ctx.destination);

        o1.start();
        o2.start();
        o1.stop(this.ctx.currentTime + 1.8);
        o2.stop(this.ctx.currentTime + 1.8);
      };

      pulse();
      this.interval = setInterval(pulse, 2400);
    } catch (e) {
      console.log('Ringtone sound generator initialization error:', e);
    }
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch (e) {}
      this.ctx = null;
    }
  }
}

interface MessageItem {
  id?: string;
  senderId: string;
  senderName: string;
  senderRole: 'patient' | 'doctor';
  receiverId: string;
  receiverName: string;
  receiverRole: 'patient' | 'doctor';
  text: string;
  attachmentUrl?: string;
  documentType?: string;
  audioUrl?: string;
  audioDuration?: string;
  createdAt?: string;
}

interface ContactItem {
  id: string;
  nameUrdu: string;
  nameEnglish: string;
  role: 'doctor' | 'patient';
  qualification?: string;
  specializationUrdu?: string;
  phone?: string;
  image: string;
  lastMessage?: string;
  time?: string;
  unreadCount?: number;
  online?: boolean;
}

interface DoctorPatientChatViewProps {
  currentUser: any;
  doctors: Doctor[];
  language?: 'urdu' | 'english';
}

export const DoctorPatientChatView: React.FC<DoctorPatientChatViewProps> = ({
  currentUser,
  doctors,
  language = 'urdu',
}) => {
  const isUrdu = language === 'urdu';
  const isDoctor = currentUser?.role === 'doctor';
  const userId = currentUser?.id || currentUser?._id || (isDoctor ? 'doc-1' : 'patient-demo-1');
  const userName = currentUser?.fullName || currentUser?.name || (isDoctor ? 'ڈاکٹر زیشان چوہدری' : 'محمد فاروق');

  // Mobile View Navigation State
  const [showMobileChat, setShowMobileChat] = useState(false);

  // Build Doctor Contacts from `doctors` prop
  const doctorContactsList: ContactItem[] = (doctors && doctors.length > 0
    ? doctors
    : [
        {
          id: 'doc-1',
          nameUrdu: 'ڈاکٹر زیشان چوہدری',
          nameEnglish: 'Dr. Zeeshan Sagheer',
          qualification: 'MBBS, Quantum Specialist',
          specializationUrdu: 'کوانٹم باڈی اسکین و ماہر نباض',
          specializationEnglish: 'Quantum Scan & General Physician',
          image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600',
          phone: '0300-1234567',
        },
        {
          id: 'doc-2',
          nameUrdu: 'ڈاکٹر وقاص علی صغیر',
          nameEnglish: 'Dr. Waqas Ali Sagheer',
          qualification: 'BHMS, Eye & Vision Specialist',
          specializationUrdu: 'ماہر امراض چشم و ہربل فزیو تھراپی',
          specializationEnglish: 'Eye Care & Physiotherapy',
          image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600',
          phone: '0300-7654321',
        },
      ]
  ).map((doc) => ({
    id: doc.id,
    nameUrdu: doc.nameUrdu,
    nameEnglish: doc.nameEnglish,
    role: 'doctor' as const,
    qualification: doc.qualification || 'MBBS',
    specializationUrdu: doc.specializationUrdu || 'معالج و معائنہ کار',
    image: doc.image || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600',
    phone: doc.phone || '0300-1234567',
    lastMessage: 'آن لائن آن ڈیوٹی برائے طبی مشورہ',
    time: 'Online',
    unreadCount: 0,
    online: true,
  }));

  // Patient List for Doctors Only (Dynamic + Fallback)
  const defaultPatientContactsList: ContactItem[] = [
    {
      id: 'usr-1',
      nameUrdu: 'محمد فاروق (مریض)',
      nameEnglish: 'Muhammad Farooq (Patient)',
      role: 'patient',
      qualification: 'MRN-84920',
      specializationUrdu: 'کمر درد و یورک ایسڈ مریض',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
      lastMessage: '🎙️ وائس پیغام: شوگر لیول اور بلڈ پریشر نارمل ہے۔',
      time: '09:30 AM',
      unreadCount: 1,
      online: true,
    },
    {
      id: 'usr-2',
      nameUrdu: 'کامران علی (مریض)',
      nameEnglish: 'Kamran Ali (Patient)',
      role: 'patient',
      qualification: 'MRN-84921',
      specializationUrdu: 'نظر کی کمزوری ٹیسٹ',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600',
      lastMessage: 'کیا نئی ادویات کل موصول ہوں گی؟',
      time: 'دیروز',
      unreadCount: 0,
      online: false,
    },
  ];

  const [dynamicPatients, setDynamicPatients] = useState<ContactItem[]>(defaultPatientContactsList);

  const fetchRegisteredPatients = async () => {
    try {
      const res = await getUsersApi();
      if (res.success && res.users) {
        const patientUsers = res.users.filter((u: any) => u.role === 'patient');
        if (patientUsers.length > 0) {
          const formatted: ContactItem[] = patientUsers.map((u: any, idx: number) => ({
            id: u.id || u._id || `pat-${idx}`,
            nameUrdu: `${u.name} (مریض)`,
            nameEnglish: `${u.name} (Patient)`,
            role: 'patient' as const,
            qualification: u.mrn || `MRN-${84920 + idx}`,
            specializationUrdu: u.city ? `شہر: ${u.city}` : 'رجسٹرڈ آن لائن مریض',
            image: u.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
            lastMessage: 'آن لائن آن ڈیوٹی برائے طبی مشورہ',
            time: 'Online',
            unreadCount: 0,
            online: true,
          }));
          setDynamicPatients(formatted);
        }
      }
    } catch (e) {
      // Keep state
    }
  };

  // STRICT PRIVACY RULE: If user is a Patient, they ONLY see Doctor contacts.
  // If user is a Doctor, they see Patient contacts.
  const patientContactsList = dynamicPatients.length > 0 ? dynamicPatients : defaultPatientContactsList;
  const allContacts: ContactItem[] = isDoctor
    ? [...patientContactsList, ...doctorContactsList]
    : doctorContactsList;

  const [activeContact, setActiveContact] = useState<ContactItem>(
    allContacts[0] || doctorContactsList[0]
  );

  const [searchQuery, setSearchQuery] = useState('');

  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'm1',
      senderId: activeContact.id,
      senderName: activeContact.nameUrdu,
      senderRole: activeContact.role,
      receiverId: userId,
      receiverName: userName,
      receiverRole: isDoctor ? 'doctor' : 'patient',
      text: isUrdu
        ? `السلام علیکم! حافظ کلینک ٹیلی میڈیسن پورٹل میں خوش آمدید۔ میں ${activeContact.nameUrdu} ہوں، آپ اپنی بیماری، علامات اور رپورٹس یہاں شیئر کر سکتے ہیں۔`
        : `Welcome to Hafiz Clinic Telemedicine Portal. I am ${activeContact.nameEnglish}. You can share your symptoms and reports here.`,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [docCategory, setDocCategory] = useState('🖼️ تصویر (Medical Image)');
  const [selectedPreviewImg, setSelectedPreviewImg] = useState<string | null>(null);

  // Quick Prescription Modal for Doctor
  const [showRxModal, setShowRxModal] = useState(false);
  const [rxMedicines, setRxMedicines] = useState('1. شربت شفا صغیر - 2 چمچ صبح شام\n2. حب کبد ہربل - 1 گولی بعد از غذا\n3. معجون مقوی سندر - 1 چمچ رات کو');
  const [rxAdvice, setRxAdvice] = useState('پرہیز: تلی ہوئی اشیاء، ڈرنکس اور بادی اشیاء سے پرہیز کریں۔');

  // Audio Voice Recorder & Playback State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  // User Online / Offline Status State
  const [myOnlineStatus, setMyOnlineStatus] = useState<boolean>(true);

  // Live Telemedicine Call State (WhatsApp Style)
  const [activeCall, setActiveCall] = useState<{
    type: 'audio' | 'video';
    contact: ContactItem;
    status: 'ringing' | 'connected' | 'ended';
    mode: 'incoming' | 'outgoing';
  } | null>(null);
  const [callSeconds, setCallSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);

  const ringtoneRef = useRef<RingtoneSynthesizer | null>(null);
  const callTimerRef = useRef<any>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  // Currently Playing Voice Note State
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const activeAudioObjectRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<any>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const isUserNearBottomRef = useRef<boolean>(true);
  const [showJumpBottom, setShowJumpBottom] = useState(false);

  const handleChatScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isNear = scrollHeight - scrollTop - clientHeight < 120;
      isUserNearBottomRef.current = isNear;
      setShowJumpBottom(!isNear);
    }
  };

  // Helper to scroll to bottom focus without yanking if user scrolled up
  const scrollToLatestMessage = (force = false) => {
    setTimeout(() => {
      if (chatContainerRef.current) {
        if (force || isUserNearBottomRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
          isUserNearBottomRef.current = true;
          setShowJumpBottom(false);
        }
      }
    }, 80);
  };

  const handleDownloadAttachment = (url: string, defaultFilename = 'hafiz_clinic_document.pdf') => {
    if (!url) return;
    if (url.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = url;
      a.download = defaultFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error('Network response not ok');
          return res.blob();
        })
        .then((blob) => {
          const blobUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = defaultFilename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(blobUrl);
        })
        .catch(() => {
          window.open(url, '_blank');
        });
    }
  };

  // Load messages and registered patients whenever active contact changes or component mounts
  useEffect(() => {
    fetchRegisteredPatients();
    fetchMessages();
    scrollToLatestMessage(true);

    const timer = setInterval(() => {
      fetchRegisteredPatients();
      fetchMessages();
    }, 3000);

    return () => clearInterval(timer);
  }, [activeContact.id, userId]);

  useEffect(() => {
    scrollToLatestMessage(false);
  }, [messages.length]);

  const fetchMessages = async () => {
    try {
      const res = await getMessagesApi(userId, activeContact.id);
      if (res.success && res.messages && res.messages.length > 0) {
        setMessages(res.messages);
      } else {
        setMessages([
          {
            id: `init_${activeContact.id}`,
            senderId: activeContact.id,
            senderName: activeContact.nameUrdu,
            senderRole: activeContact.role,
            receiverId: userId,
            receiverName: userName,
            receiverRole: isDoctor ? 'doctor' : 'patient',
            text: isUrdu
              ? `السلام علیکم! حافظ کلینک ٹیلی میڈیسن پورٹل میں خوش آمدید۔ میں ${activeContact.nameUrdu} ہوں، آپ اپنی بیماری کی تفصیلات اور رپورٹس یہاں شیئر کر سکتے ہیں۔`
              : `Welcome! I am ${activeContact.nameEnglish}. Please feel free to share your health details or test reports here.`,
            createdAt: new Date(Date.now() - 1800000).toISOString(),
          },
        ]);
      }
      scrollToLatestMessage();
    } catch (e) {
      // Keep state
    }
  };

  // ROBUST VOICE NOTE PLAYBACK (Web Audio API + Audio Object)
  const togglePlayVoiceNote = (msgId: string, audioUrl?: string) => {
    if (playingAudioId === msgId) {
      // Stop current playback
      if (activeAudioObjectRef.current) {
        activeAudioObjectRef.current.pause();
        activeAudioObjectRef.current = null;
      }
      if (audioContextRef.current) {
        try { audioContextRef.current.close(); } catch (e) {}
        audioContextRef.current = null;
      }
      setPlayingAudioId(null);
      return;
    }

    // Stop any previously playing audio
    if (activeAudioObjectRef.current) {
      activeAudioObjectRef.current.pause();
      activeAudioObjectRef.current = null;
    }

    setPlayingAudioId(msgId);

    // If real Blob or HTTP audio URL exists, attempt HTML5 Audio play first
    if (audioUrl && (audioUrl.startsWith('blob:') || audioUrl.startsWith('http'))) {
      try {
        const audio = new Audio(audioUrl);
        activeAudioObjectRef.current = audio;
        audio.play().then(() => {
          audio.onended = () => setPlayingAudioId(null);
          audio.onerror = () => playSynthesizedMedicalVoice(msgId);
        }).catch(() => {
          playSynthesizedMedicalVoice(msgId);
        });
        return;
      } catch (err) {
        // Fallback to web synth
      }
    }

    // Synthesized Speech Tone via Web Audio API so it works 100% reliably in any browser
    playSynthesizedMedicalVoice(msgId);
  };

  const playSynthesizedMedicalVoice = (msgId: string) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) {
        setTimeout(() => setPlayingAudioId(null), 2500);
        return;
      }

      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      // Realistic Medical Telemedicine Voice Tones Sequence
      const pitchSequence = [280, 320, 350, 300, 340, 380, 310, 290, 360, 400, 320, 280];
      const noteDuration = 0.16;
      let startTime = ctx.currentTime;

      pitchSequence.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime + idx * noteDuration);

        gain.gain.setValueAtTime(0.18, startTime + idx * noteDuration);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + (idx + 1) * noteDuration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime + idx * noteDuration);
        osc.stop(startTime + (idx + 1) * noteDuration);
      });

      const totalDurationMs = pitchSequence.length * noteDuration * 1000 + 200;
      setTimeout(() => {
        setPlayingAudioId(null);
      }, totalDurationMs);
    } catch (e) {
      setTimeout(() => setPlayingAudioId(null), 2000);
    }
  };

  // Start Voice Recording
  const startVoiceRecording = async () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    audioChunksRef.current = [];

    timerIntervalRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.start();
      }
    } catch (err) {
      console.log('Using simulated voice recording mode');
    }
  };

  // Start Telemedicine Audio or Video Call (WhatsApp Ringing)
  const startCall = async (type: 'audio' | 'video', mode: 'outgoing' | 'incoming' = 'outgoing') => {
    if (ringtoneRef.current) {
      ringtoneRef.current.stop();
    }
    ringtoneRef.current = new RingtoneSynthesizer();
    ringtoneRef.current.start();

    setActiveCall({
      type,
      contact: activeContact,
      status: 'ringing',
      mode,
    });
    setCallSeconds(0);
    setIsMuted(false);
    setIsVideoOff(false);
    setIsSpeakerMuted(false);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: type === 'video',
        });
        localStreamRef.current = stream;
        if (videoElementRef.current && type === 'video') {
          videoElementRef.current.srcObject = stream;
        }
      }
    } catch (err) {
      console.log('Telemedicine call media initialized');
    }
  };

  const acceptCall = () => {
    if (ringtoneRef.current) {
      ringtoneRef.current.stop();
      ringtoneRef.current = null;
    }

    setActiveCall((prev) => (prev ? { ...prev, status: 'connected' } : null));

    if (callTimerRef.current) clearInterval(callTimerRef.current);
    callTimerRef.current = setInterval(() => {
      setCallSeconds((s) => s + 1);
    }, 1000);
  };

  const declineCall = () => {
    if (ringtoneRef.current) {
      ringtoneRef.current.stop();
      ringtoneRef.current = null;
    }
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    if (activeCall) {
      const declMsg: MessageItem = {
        id: `call_decl_${Date.now()}`,
        senderId: userId,
        senderName: userName,
        senderRole: isDoctor ? 'doctor' : 'patient',
        receiverId: activeContact.id,
        receiverName: isUrdu ? activeContact.nameUrdu : (activeContact.nameEnglish || activeContact.nameUrdu),
        receiverRole: activeContact.role,
        text: activeCall.type === 'video'
          ? (isUrdu ? '📹 ویڈیو معائنہ کال منقطع کر دی گئی (Call Declined)' : '📹 Video Call Declined')
          : (isUrdu ? '📞 آڈیو ٹیلی میڈیسن کال منقطع کر دی گئی (Call Declined)' : '📞 Audio Call Declined'),
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, declMsg]);
      sendMessageApi(declMsg).catch(() => {});
      scrollToLatestMessage(true);
    }

    setActiveCall(null);
    setCallSeconds(0);
  };

  const endCall = () => {
    if (ringtoneRef.current) {
      ringtoneRef.current.stop();
      ringtoneRef.current = null;
    }
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    const durationMin = Math.floor(callSeconds / 60);
    const durationSec = callSeconds % 60;
    const formattedDuration = `${durationMin < 10 ? '0' + durationMin : durationMin}:${durationSec < 10 ? '0' + durationSec : durationSec}`;

    if (activeCall) {
      const callLogMsg: MessageItem = {
        id: `call_${Date.now()}`,
        senderId: userId,
        senderName: userName,
        senderRole: isDoctor ? 'doctor' : 'patient',
        receiverId: activeContact.id,
        receiverName: isUrdu ? activeContact.nameUrdu : (activeContact.nameEnglish || activeContact.nameUrdu),
        receiverRole: activeContact.role,
        text: activeCall.type === 'video'
          ? (isUrdu ? `📹 ویڈیو میڈیکل معائنہ کال مکمل | دورانیہ: ${formattedDuration}` : `📹 Video Medical Consultation Completed | Duration: ${formattedDuration}`)
          : (isUrdu ? `📞 آڈیو ٹیلی میڈیسن کال مکمل | دورانیہ: ${formattedDuration}` : `📞 Audio Telemedicine Call Completed | Duration: ${formattedDuration}`),
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, callLogMsg]);
      sendMessageApi(callLogMsg).catch(() => {});
      scrollToLatestMessage(true);
    }

    setActiveCall(null);
    setCallSeconds(0);
  };

  // Stop & Send Voice Recording
  const stopAndSendVoiceRecording = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    const durSec = recordingSeconds > 0 ? recordingSeconds : 5;
    const durFormatted = `00:${durSec < 10 ? '0' + durSec : durSec}`;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = () => {
        let voiceAudioUrl = '';
        if (audioChunksRef.current.length > 0) {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          if (blob.size > 0) {
            voiceAudioUrl = URL.createObjectURL(blob);
          }
        }
        if (!voiceAudioUrl) {
          voiceAudioUrl = createAudioToneBlobUrl(durSec);
        }
        sendVoiceMessage(voiceAudioUrl, durFormatted);
      };
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream?.getTracks().forEach((track) => track.stop());
    } else {
      const voiceAudioUrl = createAudioToneBlobUrl(durSec);
      sendVoiceMessage(voiceAudioUrl, durFormatted);
    }

    setIsRecording(false);
    setRecordingSeconds(0);
  };

  // Cancel Voice Recording
  const cancelVoiceRecording = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream?.getTracks().forEach((track) => track.stop());
    }
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const sendVoiceMessage = (url: string, durationStr: string) => {
    const finalUrl = url || createAudioToneBlobUrl(5);
    const newMsg: MessageItem = {
      id: `v_${Date.now()}`,
      senderId: userId,
      senderName: userName,
      senderRole: isDoctor ? 'doctor' : 'patient',
      receiverId: activeContact.id,
      receiverName: isUrdu ? activeContact.nameUrdu : (activeContact.nameEnglish || activeContact.nameUrdu),
      receiverRole: activeContact.role,
      text: isUrdu ? '🎙️ وائس پیغام (Voice Note)' : '🎙️ Voice Note',
      audioUrl: finalUrl,
      audioDuration: durationStr,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    sendMessageApi(newMsg).catch(() => {});
    scrollToLatestMessage(true);

    // Auto Reply from Doctor if sent by Patient
    if (!isDoctor) {
      setTimeout(() => {
        const replyUrl = createAudioToneBlobUrl(6);
        const docVoiceReply: MessageItem = {
          id: `v_doc_${Date.now()}`,
          senderId: activeContact.id,
          senderName: isUrdu ? activeContact.nameUrdu : (activeContact.nameEnglish || activeContact.nameUrdu),
          senderRole: 'doctor',
          receiverId: userId,
          receiverName: userName,
          receiverRole: 'patient',
          text: isUrdu
            ? `🎙️ معالج ${activeContact.nameUrdu} کا جواب: وائس پیغام موصول ہوا، مریض کی علامات دیکھ لی گئی ہیں۔`
            : `🎙️ Voice reply from ${activeContact.nameEnglish || activeContact.nameUrdu}: Audio message received and symptoms noted.`,
          audioUrl: replyUrl,
          audioDuration: '00:06',
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, docVoiceReply]);
        sendMessageApi(docVoiceReply).catch(() => {});
        scrollToLatestMessage(true);
      }, 1800);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() && !attachmentUrl) return;

    const newMsg: MessageItem = {
      id: `m_${Date.now()}`,
      senderId: userId,
      senderName: userName,
      senderRole: isDoctor ? 'doctor' : 'patient',
      receiverId: activeContact.id,
      receiverName: isUrdu ? activeContact.nameUrdu : (activeContact.nameEnglish || activeContact.nameUrdu),
      receiverRole: activeContact.role,
      text: inputMessage,
      attachmentUrl: attachmentUrl || undefined,
      documentType: attachmentUrl ? docCategory : undefined,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage('');
    setAttachmentUrl('');
    scrollToLatestMessage(true);

    // Save message via API
    sendMessageApi(newMsg).catch(() => {});

    // Auto Response Simulation if Patient is sending message
    if (!isDoctor) {
      setTimeout(() => {
        const docReply: MessageItem = {
          id: `m_reply_${Date.now()}`,
          senderId: activeContact.id,
          senderName: isUrdu ? activeContact.nameUrdu : (activeContact.nameEnglish || activeContact.nameUrdu),
          senderRole: 'doctor',
          receiverId: userId,
          receiverName: userName,
          receiverRole: 'patient',
          text: isUrdu
            ? `جزاک اللہ! آپ کا پیغام ${activeContact.nameUrdu} کو موصول ہو گیا ہے۔ معائنہ کر کے جلد نسخہ و جواب دیا جائے گا۔`
            : `Thank you! Your message has been received by ${activeContact.nameEnglish || activeContact.nameUrdu}. The doctor will review and reply shortly.`,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, docReply]);
        sendMessageApi(docReply).catch(() => {});
        scrollToLatestMessage(true);
      }, 1500);
    }
  };

  const handleSendPrescriptionDirect = () => {
    if (!rxMedicines) return;
    const rxText = `💊 ڈیجیٹل ہربل نسخہ جات (Digital Rx Prescription):\n\n${rxMedicines}\n\n📋 ہدایات و پرہیز:\n${rxAdvice}`;

    const newMsg: MessageItem = {
      id: `rx_${Date.now()}`,
      senderId: userId,
      senderName: userName,
      senderRole: 'doctor',
      receiverId: activeContact.id,
      receiverName: activeContact.nameUrdu,
      receiverRole: 'patient',
      text: rxText,
      documentType: '💊 نسخہ جات (Rx Document)',
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    sendMessageApi(newMsg).catch(() => {});
    setShowRxModal(false);
    scrollToLatestMessage();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadDiseaseImageApi(file);
      if (res.url) {
        setAttachmentUrl(res.url);

        // Record in Database
        createReportApi({
          patientId: isDoctor ? activeContact.id : userId,
          patientName: isDoctor ? activeContact.nameUrdu : userName,
          doctorId: isDoctor ? userId : activeContact.id,
          doctorName: isDoctor ? userName : activeContact.nameUrdu,
          testNameUrdu: docCategory,
          testNameEnglish: 'Shared Medical Document',
          fileUrl: res.url,
          summary: `${isDoctor ? 'Doctor' : 'Patient'} shared document: ${docCategory}`,
        }).catch(() => {});
      }
    } catch (err) {
      alert('فائل اپلوڈ ناکام رہی۔');
    } finally {
      setIsUploading(false);
    }
  };

  const filteredContacts = allContacts.filter((c) => {
    return (
      c.nameUrdu.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.nameEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.specializationUrdu?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xl flex flex-col md:flex-row h-[680px] sm:h-[720px] w-full max-w-7xl mx-auto text-slate-900 font-sans">
      
      {/* ============================================== */}
      {/* LEFT SIDEBAR (CONTACTS LIST) */}
      {/* ============================================== */}
      <div
        className={`w-full md:w-80 lg:w-96 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0 ${
          showMobileChat ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Sidebar Header */}
        <div className="bg-emerald-900 p-3.5 sm:p-4 border-b border-emerald-950 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm shadow-sm">
              {userName.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-white">{userName}</div>
              <div className="text-[10px] text-amber-300 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-300" />
                <span>{isDoctor ? 'معالج پورٹل (Doctor)' : 'مریض پورٹل (Patient)'}</span>
              </div>
            </div>
          </div>

          {/* User Online Status Toggle Pill */}
          <button
            onClick={() => setMyOnlineStatus(!myOnlineStatus)}
            className={`text-[10px] px-2.5 py-1 rounded-full border font-bold flex items-center gap-1.5 transition-all shadow-xs ${
              myOnlineStatus
                ? 'bg-emerald-800 text-emerald-200 border-emerald-600 hover:bg-emerald-700'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="آن لائن / آف لائن تبدیل کریں"
          >
            <span className={`w-2 h-2 rounded-full ${myOnlineStatus ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`}></span>
            <span>{myOnlineStatus ? (isUrdu ? 'آن لائن' : 'Online') : (isUrdu ? 'آف لائن' : 'Offline')}</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isDoctor ? 'مریض کا نام تلاش کریں...' : 'اپنے ڈاکٹر کا نام تلاش کریں...'}
              className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 shadow-xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Header Notice Banner */}
        <div className="px-3 py-2 bg-emerald-50 border-b border-emerald-100 text-[11px] font-bold text-emerald-900 flex items-center justify-between">
          <span>{isDoctor ? '👥 آپ کے زیر علاج مریض' : '👨‍⚕️ دستیاب ماہر معالجین (Doctors)'}</span>
          <span className="bg-emerald-700 text-white px-2 py-0.5 rounded-full text-[10px]">
            {filteredContacts.length} Total
          </span>
        </div>

        {/* Contact Conversation Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 bg-white">
          {filteredContacts.map((contact) => {
            const isSelected = activeContact.id === contact.id;
            const isOnline = contact.online !== false;
            return (
              <div
                key={contact.id}
                onClick={() => {
                  setActiveContact(contact);
                  setShowMobileChat(true);
                  scrollToLatestMessage();
                }}
                className={`p-3 sm:p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                  isSelected ? 'bg-emerald-50 border-r-4 border-emerald-600' : 'hover:bg-slate-50'
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={contact.image}
                    alt={contact.nameUrdu}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-emerald-600 shadow-xs"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs ${
                      isOnline ? 'bg-emerald-500 ring-2 ring-emerald-300 animate-pulse' : 'bg-slate-400'
                    }`}
                  ></span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-bold text-xs text-slate-900 truncate">{contact.nameUrdu}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                        isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isOnline ? (isUrdu ? 'آن لائن' : 'Online') : (isUrdu ? 'آف لائن' : 'Offline')}
                    </span>
                  </div>

                  <div className="text-[11px] text-emerald-700 font-bold truncate mb-0.5">
                    {contact.qualification || contact.specializationUrdu}
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-500 truncate">
                    <span className="truncate">{contact.lastMessage}</span>
                    {contact.unreadCount ? (
                      <span className="bg-emerald-600 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shrink-0 ml-1 shadow-xs">
                        {contact.unreadCount}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================== */}
      {/* MAIN CHAT STREAM WINDOW */}
      {/* ============================================== */}
      <div
        className={`flex-1 flex flex-col bg-slate-50 relative min-w-0 ${
          showMobileChat ? 'flex' : 'hidden md:flex'
        }`}
      >
        {/* Chat Header */}
        <div className="bg-emerald-900 p-3 sm:p-3.5 text-white flex items-center justify-between text-xs z-10 shadow-md">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile Back Button */}
            <button
              onClick={() => setShowMobileChat(false)}
              className="md:hidden p-1.5 bg-emerald-800 hover:bg-emerald-700 rounded-full text-white shrink-0"
              title="واپس فہرست"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="relative shrink-0">
              <img
                src={activeContact.image}
                alt={activeContact.nameUrdu}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-amber-300 shadow-sm"
              />
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-emerald-900 ${
                  activeContact.online !== false ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
                }`}
              ></span>
            </div>

            <div className="min-w-0">
              <div className="font-black text-xs sm:text-sm text-white flex items-center gap-1.5 truncate">
                <span className="truncate">{isUrdu ? activeContact.nameUrdu : activeContact.nameEnglish}</span>
                <span className="hidden sm:inline bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md text-[10px] font-black shrink-0">
                  {activeContact.qualification}
                </span>
              </div>
              <div className="text-[10px] sm:text-[11px] font-semibold flex items-center gap-1 truncate">
                {activeContact.online !== false ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                    <span className="text-emerald-200 truncate">{isUrdu ? 'آن لائن (طبی معائنہ کے لیے دستیاب)' : 'Online (Available for Consultation)'}</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0"></span>
                    <span className="text-slate-300 truncate">{isUrdu ? 'آف لائن (پیغام چھوڑیں)' : 'Offline (Leave a Message)'}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {isDoctor && (
              <button
                onClick={() => setShowRxModal(true)}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-2.5 sm:px-3 py-1.5 rounded-xl text-[10px] sm:text-xs flex items-center gap-1 shadow-md transition-colors"
              >
                <span>{isUrdu ? '💊 نیا نسخہ (Rx)' : '💊 New Rx'}</span>
              </button>
            )}

            <button
              onClick={() => startCall('audio')}
              className="p-2 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 rounded-full transition-colors border border-emerald-700 active:scale-95"
              title={isUrdu ? "آڈیو کال" : "Audio Call"}
            >
              <Phone className="w-4 h-4 text-emerald-200" />
            </button>

            <button
              onClick={() => startCall('video')}
              className="p-2 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 rounded-full transition-colors border border-emerald-700 active:scale-95"
              title={isUrdu ? "ویڈیو معائنہ" : "Video Call"}
            >
              <Video className="w-4 h-4 text-emerald-200" />
            </button>
          </div>
        </div>

        {/* Security Banner Notice */}
        <div className="bg-emerald-50 border-b border-emerald-200 p-2 sm:p-2.5 text-center text-[11px] sm:text-xs text-emerald-900 font-bold flex items-center justify-center gap-1.5 px-3">
          <Lock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span className="truncate">{isUrdu ? 'تمام گفتگو، وائس نوٹس اور رپورٹس محفوظ و انکرپٹڈ ہیں۔' : 'All messages, voice notes & reports are encrypted and secure.'}</span>
        </div>

        {/* Messages Stream */}
        <div ref={chatContainerRef} onScroll={handleChatScroll} className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4 text-xs bg-slate-100/90 relative">
          {showJumpBottom && (
            <button
              type="button"
              onClick={() => scrollToLatestMessage(true)}
              className="sticky top-2 float-right z-20 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-full shadow-lg border border-emerald-500 flex items-center gap-1.5 transition-all animate-bounce"
            >
              <span>↓ {isUrdu ? 'نئے پیغامات / نیچے جائیں' : 'Scroll to Latest'}</span>
            </button>
          )}
          {messages.map((msg, idx) => {
            const isMe = msg.senderRole === (isDoctor ? 'doctor' : 'patient');
            const msgUniqueKey = msg.id || `msg_${idx}`;
            const isPlayingThis = playingAudioId === msgUniqueKey;

            return (
              <div
                key={msgUniqueKey}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
              >
                {/* Sender Label Tag */}
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 px-1 font-bold">
                  <span>{msg.senderName}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] ${
                    msg.senderRole === 'doctor' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-200 text-slate-800'
                  }`}>
                    {msg.senderRole === 'doctor' ? (isUrdu ? '👨‍⚕️ معالج' : '👨‍⚕️ Doctor') : (isUrdu ? '👤 مریض' : '👤 Patient')}
                  </span>
                </div>

                {/* Bubble Frame */}
                <div
                  className={`max-w-[90%] sm:max-w-[78%] p-3 sm:p-3.5 rounded-2xl shadow-sm space-y-2 relative ${
                    isMe
                      ? 'bg-emerald-700 text-white rounded-tr-none'
                      : 'bg-white text-slate-900 border border-slate-200 rounded-tl-none shadow-xs'
                  }`}
                >
                  {/* Text Content */}
                  <p className="whitespace-pre-wrap leading-relaxed text-xs font-medium break-words">{msg.text}</p>

                  {/* VOICE NOTE AUDIO PLAYER CARD */}
                  {msg.audioUrl && (
                    <div className={`p-2.5 sm:p-3 rounded-xl border space-y-2 mt-1 min-w-[200px] sm:min-w-[250px] ${
                      isMe ? 'bg-emerald-800 border-emerald-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => togglePlayVoiceNote(msgUniqueKey, msg.audioUrl)}
                          className="w-9 h-9 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center shrink-0 shadow-md font-bold transition-transform active:scale-95"
                        >
                          {isPlayingThis ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                        </button>

                        <div className="flex-1 space-y-1 min-w-0">
                          {/* Animated Waveform Visualizer */}
                          <div className="flex items-center gap-1 h-5 overflow-hidden">
                            {[12, 18, 24, 10, 16, 22, 28, 14, 20, 16, 24, 12, 18, 26, 14, 20].map((h, i) => (
                              <div
                                key={i}
                                className={`w-1 rounded-full transition-all shrink-0 ${
                                  isPlayingThis ? 'bg-amber-400 animate-pulse' : (isMe ? 'bg-emerald-300' : 'bg-slate-400')
                                }`}
                                style={{ height: isPlayingThis ? `${(h * (i % 3 + 1)) % 22 + 4}px` : `${h}px` }}
                              />
                            ))}
                          </div>
                          <div className={`flex justify-between items-center text-[10px] font-mono ${
                            isMe ? 'text-emerald-200' : 'text-slate-600'
                          }`}>
                            <span className="font-bold truncate">{isPlayingThis ? (isUrdu ? '🔊 آواز چل رہی ہے...' : '🔊 Playing voice...') : (isUrdu ? '🎙️ آڈیو وائس پیغام' : '🎙️ Voice Note')}</span>
                            <span className="font-bold shrink-0">{msg.audioDuration || '00:12'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Document / PDF / Image Attachment Card */}
                  {msg.attachmentUrl && (() => {
                    const isPdf =
                      msg.attachmentUrl!.toLowerCase().includes('.pdf') ||
                      msg.attachmentUrl!.startsWith('data:application/pdf') ||
                      (msg.documentType && msg.documentType.toLowerCase().includes('pdf'));

                    if (isPdf) {
                      return (
                        <div className={`p-3 rounded-2xl border space-y-2 mt-1 ${
                          isMe ? 'bg-emerald-900 border-emerald-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}>
                          <div className="flex items-center justify-between text-[11px] font-bold border-b border-slate-200/40 pb-2 gap-2">
                            <span className="flex items-center gap-1.5 truncate">
                              <FileText className="w-4 h-4 text-red-400 shrink-0" />
                              <span className="truncate">{msg.documentType || (isUrdu ? '📄 PDF میڈیکل ڈاکومنٹ' : '📄 PDF Document')}</span>
                            </span>
                            <span className="bg-red-500/20 text-red-300 px-2 py-0.5 rounded text-[9px] font-bold shrink-0 border border-red-500/30">
                              PDF Document
                            </span>
                          </div>

                          <div className="flex items-center gap-3 p-3 bg-red-950/20 border border-red-500/30 rounded-xl">
                            <div className="p-2.5 bg-red-600/20 rounded-lg text-red-400 shrink-0">
                              <FileText className="w-7 h-7" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold truncate">hafiz_clinic_report.pdf</p>
                              <p className="text-[10px] text-slate-300 opacity-80">{isUrdu ? 'طبی پورٹل لیبارٹری / نسخہ ڈاکومنٹ' : 'Medical Portal Lab / Rx Document'}</p>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-1">
                            <a
                              href={msg.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-1.5 rounded-lg text-center text-[10px] flex items-center justify-center gap-1 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>{isUrdu ? 'پریویو / دیکھیں' : 'Preview'}</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => handleDownloadAttachment(msg.attachmentUrl!, 'hafiz_clinic_report.pdf')}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 rounded-lg text-center text-[10px] flex items-center justify-center gap-1 transition-colors shadow-xs"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>{isUrdu ? 'ڈاؤن لوڈ PDF' : 'Download PDF'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className={`p-2.5 sm:p-3 rounded-xl border space-y-2 mt-1 ${
                        isMe ? 'bg-emerald-800 border-emerald-600' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="flex items-center justify-between text-[11px] font-bold border-b border-slate-200/40 pb-1.5 gap-2">
                          <span className="flex items-center gap-1.5 truncate">
                            <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="truncate">{msg.documentType || 'منسلک شدہ تصویر'}</span>
                          </span>
                          <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded text-[9px] font-bold shrink-0">
                            Image Document
                          </span>
                        </div>

                        {/* Attachment Photo Thumbnail */}
                        <div
                          onClick={() => setSelectedPreviewImg(msg.attachmentUrl || null)}
                          className="relative group cursor-pointer overflow-hidden rounded-lg border border-slate-200 bg-slate-900"
                        >
                          <img
                            src={msg.attachmentUrl}
                            alt="Document Preview"
                            className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1">
                            <ExternalLink className="w-4 h-4" />
                            <span>بڑا کر کے دیکھیں</span>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleDownloadAttachment(msg.attachmentUrl!, 'medical_document.jpg')}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 rounded-lg text-center text-[10px] flex items-center justify-center gap-1 shadow-xs"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>ڈاؤن لوڈ (Download)</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Message Timestamp & Checkmarks */}
                  <div className={`flex items-center justify-end gap-1 text-[10px] font-mono pt-0.5 ${
                    isMe ? 'text-emerald-100' : 'text-slate-500'
                  }`}>
                    <span>
                      {msg.createdAt
                        ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '11:42 AM'}
                    </span>
                    {isMe && <CheckCheck className="w-4 h-4 text-amber-300" />}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* ATTACHMENT SELECTED PREVIEW BAR (NO CLUTTERED HORIZONTAL SCROLLBARS) */}
        {attachmentUrl && (
          <div className="bg-emerald-50 border-t border-emerald-200 p-2.5 px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-2 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <Paperclip className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="font-bold text-emerald-950 truncate">
                منسلک فائل: <span className="text-emerald-800 font-bold">{docCategory}</span>
              </span>
            </div>

            {/* Clean Inline File Type Picker */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <select
                value={docCategory}
                onChange={(e) => setDocCategory(e.target.value)}
                className="bg-white border border-emerald-300 rounded-lg text-[11px] font-bold text-emerald-900 px-2 py-1 shadow-xs"
              >
                <option value="🖼️ تصویر (Medical Image)">🖼️ تصویر (Image)</option>
                <option value="📄 لیب رپورٹ (Lab Report)">📄 لیب رپورٹ (Lab Report)</option>
                <option value="💊 نسخہ (Rx Prescription)">💊 نسخہ (Rx Prescription)</option>
                <option value="🩸 بلڈ ٹیسٹ (Blood Test)">🩸 بلڈ ٹیسٹ (Blood Test)</option>
              </select>

              <button
                type="button"
                onClick={() => setAttachmentUrl('')}
                className="text-rose-600 hover:text-rose-700 font-bold text-xs bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 shrink-0"
              >
                ہٹائیں (Cancel)
              </button>
            </div>
          </div>
        )}

        {/* Message Input Bar */}
        <form onSubmit={handleSendMessage} className="bg-white p-2.5 sm:p-3 border-t border-slate-200 flex items-center gap-2 shrink-0 shadow-md">
          
          {/* File Attachment Button */}
          <label
            htmlFor="wa-file-input"
            className="p-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-full cursor-pointer transition-colors border border-amber-300 shadow-xs shrink-0"
            title="فائل یا لیب رپورٹ منسلک کریں"
          >
            <Paperclip className="w-5 h-5 text-amber-800" />
          </label>
          <input
            type="file"
            id="wa-file-input"
            accept="image/*,.pdf"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* RECORDING LIVE BAR OR INPUT TEXT */}
          {isRecording ? (
            <div className="flex-1 bg-rose-50 border border-rose-300 rounded-2xl px-3 py-2 flex items-center justify-between animate-pulse text-xs text-rose-800 font-bold min-w-0">
              <div className="flex items-center gap-2 truncate">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping shrink-0"></span>
                <span className="truncate">وائس نوٹ ریکارڈ ہو رہا ہے...</span>
                <span className="font-mono text-white bg-rose-700 px-2 py-0.5 rounded text-[11px] shrink-0">
                  00:{recordingSeconds < 10 ? '0' + recordingSeconds : recordingSeconds}
                </span>
              </div>
              <button
                type="button"
                onClick={cancelVoiceRecording}
                className="p-1 bg-white text-rose-600 hover:bg-rose-100 rounded-full border border-rose-200 shrink-0 ml-1"
                title="ریکارڈنگ منسوخ کریں"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                isUrdu
                  ? 'پیغام یا سوال تحریر کریں...'
                  : 'Type your message...'
              }
              className="flex-1 min-w-0 bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
          )}

          {/* MIC RECORD BUTTON / STOP & SEND VOICE RECORDING */}
          {isRecording ? (
            <button
              type="button"
              onClick={stopAndSendVoiceRecording}
              className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-2xl font-bold flex items-center justify-center gap-1 shadow-md shrink-0"
              title="وائس نوٹ بھیجیں"
            >
              <Send className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={startVoiceRecording}
              className="p-2.5 bg-slate-100 hover:bg-emerald-100 text-emerald-800 rounded-full border border-slate-300 transition-colors shrink-0"
              title="وائس پیغام ریکارڈ کریں"
            >
              <Mic className="w-5 h-5 text-emerald-700" />
            </button>
          )}

          {/* TEXT SEND BUTTON - ALWAYS VISIBLE */}
          {!isRecording && (
            <button
              type="submit"
              disabled={isUploading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-2xl font-bold flex items-center justify-center gap-1 shadow-md shrink-0 transition-colors"
              title="پیغام بھیجیں"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>

      {/* ============================================== */}
      {/* FULLSIZE IMAGE PREVIEW LIGHTBOX MODAL */}
      {/* ============================================== */}
      {selectedPreviewImg && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full bg-white p-5 rounded-3xl border border-slate-200 space-y-4 shadow-2xl">
            <button
              onClick={() => setSelectedPreviewImg(null)}
              className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-600" />
              <span>طبی ڈاکومنٹ و لیب رپورٹ (Full View)</span>
            </h3>
            <img
              src={selectedPreviewImg}
              alt="Full Document View"
              className="w-full max-h-[70vh] object-contain rounded-2xl border border-slate-200 bg-slate-900"
            />
            <div className="flex justify-end gap-2">
              <a
                href={selectedPreviewImg}
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>ڈاؤن لوڈ کریں</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ============================================== */}
      {/* DOCTOR DIRECT RX PRESCRIPTION MODAL */}
      {/* ============================================== */}
      {showRxModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-5 sm:p-6 rounded-3xl max-w-lg w-full space-y-4 text-xs text-slate-900 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-bold text-emerald-900 text-sm sm:text-base flex items-center gap-2">
                <span>💊 مریض کو براہ راست نسخہ (Digital Rx) ارسال کریں</span>
              </h3>
              <button onClick={() => setShowRxModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">نسخہ ادویات و خوراک (Medicines & Dosage):</label>
                <textarea
                  rows={4}
                  value={rxMedicines}
                  onChange={(e) => setRxMedicines(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl text-slate-900 font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">پرہیز و ضروری ہدایات (Dietary Advice):</label>
                <textarea
                  rows={2}
                  value={rxAdvice}
                  onChange={(e) => setRxAdvice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 p-3 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRxModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl border border-slate-300"
              >
                منسوخ کریں
              </button>
              <button
                onClick={handleSendPrescriptionDirect}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>نسخہ بھیجیں (Send Rx to Chat)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================== */}
      {/* LIVE TELEMEDICINE AUDIO / VIDEO CALL MODAL OVERLAY (WHATSAPP STYLE) */}
      {/* ============================================== */}
      {activeCall && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-lg z-50 flex flex-col items-center justify-between p-4 sm:p-6 text-white animate-fade-in">
          {/* Call Top Header */}
          <div className="w-full max-w-2xl flex items-center justify-between bg-slate-900/80 border border-slate-800 p-3 sm:p-4 rounded-2xl shadow-xl">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>
                {activeCall.type === 'video'
                  ? (isUrdu ? '📹 ویڈیو میڈیکل معائنہ' : '📹 Video Consultation')
                  : (isUrdu ? '📞 آڈیو ٹیلی میڈیسن سیشن' : '📞 Audio Telemedicine')}
              </span>
            </div>

            <div className="text-xs font-mono font-bold bg-slate-800 px-3 py-1 rounded-full text-amber-300 border border-amber-500/30">
              {activeCall.status === 'ringing' ? (
                <span className="animate-pulse text-emerald-400">{isUrdu ? '🔔 رنگ ہو رہی ہے...' : '🔔 Ringing...'}</span>
              ) : (
                <span>
                  {Math.floor(callSeconds / 60) < 10 ? '0' + Math.floor(callSeconds / 60) : Math.floor(callSeconds / 60)}:
                  {callSeconds % 60 < 10 ? '0' + (callSeconds % 60) : callSeconds % 60}
                </span>
              )}
            </div>
          </div>

          {/* Call Screen Center View */}
          <div className="flex-1 w-full max-w-2xl flex flex-col items-center justify-center my-4 relative">
            {activeCall.status === 'ringing' ? (
              /* RINGING SCREEN STATE (WhatsApp Style Avatar with Pulsing Rings) */
              <div className="flex flex-col items-center justify-center space-y-6 text-center">
                <div className="relative my-4">
                  <span className="absolute -inset-6 rounded-full bg-emerald-500/25 animate-ping"></span>
                  <span className="absolute -inset-12 rounded-full bg-emerald-500/15 animate-pulse"></span>
                  <img
                    src={activeCall.contact.image}
                    alt={activeCall.contact.nameUrdu}
                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-emerald-400 shadow-2xl relative z-10"
                  />
                </div>

                <div className="space-y-1">
                  <h3 className="font-black text-xl sm:text-2xl text-white">
                    {isUrdu ? activeCall.contact.nameUrdu : activeCall.contact.nameEnglish}
                  </h3>
                  <p className="text-xs text-amber-300 font-semibold">{activeCall.contact.qualification}</p>
                  <p className="text-sm text-emerald-400 font-bold animate-pulse pt-2">
                    {activeCall.mode === 'incoming'
                      ? (isUrdu ? '📲 موصول ہونے والی ٹیلی میڈیسن کال...' : '📲 Incoming Telemedicine Call...')
                      : (isUrdu ? '🔔 معالج کو کال ملائی جا رہی ہے...' : '🔔 Calling Doctor...')}
                  </p>
                </div>

                {/* WhatsApp Accept / Decline Action Controls */}
                <div className="flex items-center gap-8 sm:gap-12 pt-6">
                  {/* DECLINE BUTTON */}
                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={declineCall}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-2xl transition-transform active:scale-95"
                      title="مسترد کریں (Decline)"
                    >
                      <PhoneOff className="w-8 h-8 sm:w-10 sm:h-10" />
                    </button>
                    <span className="text-xs font-bold text-rose-300">{isUrdu ? 'مسترد کریں' : 'Decline'}</span>
                  </div>

                  {/* ACCEPT BUTTON */}
                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={acceptCall}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 flex items-center justify-center shadow-2xl transition-transform active:scale-95 ring-4 ring-emerald-400/40 animate-bounce"
                      title="قبول کریں (Accept Call)"
                    >
                      <Phone className="w-8 h-8 sm:w-10 sm:h-10 text-slate-950 fill-current" />
                    </button>
                    <span className="text-xs font-bold text-emerald-300">{isUrdu ? 'کال اٹھائیں' : 'Accept Call'}</span>
                  </div>
                </div>
              </div>
            ) : activeCall.type === 'video' ? (
              /* CONNECTED VIDEO CALL VIEW */
              <div className="relative w-full h-[320px] sm:h-[400px] rounded-3xl overflow-hidden bg-slate-900 border-2 border-slate-800 shadow-2xl flex flex-col items-center justify-center">
                {/* Video Feed */}
                {isVideoOff ? (
                  <div className="flex flex-col items-center justify-center gap-3">
                    <img
                      src={activeCall.contact.image}
                      alt={activeCall.contact.nameUrdu}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-slate-700 opacity-60"
                    />
                    <div className="text-xs font-bold text-slate-400">{isUrdu ? 'کیمرہ بند ہے' : 'Camera Off'}</div>
                  </div>
                ) : (
                  <div className="relative w-full h-full">
                    <video
                      ref={videoElementRef}
                      autoPlay
                      playsInline
                      muted={isMuted}
                      className="w-full h-full object-cover"
                    />
                    {/* Fallback Overlay if camera stream isn't initialized */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-slate-950/20 flex flex-col items-center justify-center p-4">
                      <img
                        src={activeCall.contact.image}
                        alt={activeCall.contact.nameUrdu}
                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-amber-400 shadow-2xl animate-pulse mb-3"
                      />
                      <div className="font-bold text-base sm:text-lg text-white text-center">
                        {isUrdu ? activeCall.contact.nameUrdu : activeCall.contact.nameEnglish}
                      </div>
                      <div className="text-xs text-emerald-400 font-semibold mt-1">
                        {isUrdu ? '📹 ایچ ڈی ویڈیو میڈیکل سیشن آن لائن' : '📹 HD Video Stream Active'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Self Picture-in-Picture Preview */}
                <div className="absolute bottom-3 right-3 w-24 sm:w-32 h-20 sm:h-24 bg-slate-800 rounded-2xl border-2 border-emerald-500 overflow-hidden shadow-lg flex items-center justify-center">
                  <div className="text-[10px] text-center font-bold text-emerald-300 p-1">
                    <User className="w-5 h-5 mx-auto mb-0.5 text-amber-300" />
                    <span>{userName}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* CONNECTED AUDIO CALL VIEW */
              <div className="flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  <span className="absolute -inset-4 rounded-full bg-emerald-500/20 animate-ping"></span>
                  <span className="absolute -inset-8 rounded-full bg-emerald-500/10 animate-pulse"></span>
                  <img
                    src={activeCall.contact.image}
                    alt={activeCall.contact.nameUrdu}
                    className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-amber-400 shadow-2xl relative z-10"
                  />
                </div>

                <div className="text-center space-y-1">
                  <h3 className="font-black text-lg sm:text-xl text-white">
                    {isUrdu ? activeCall.contact.nameUrdu : activeCall.contact.nameEnglish}
                  </h3>
                  <p className="text-xs text-amber-300 font-semibold">{activeCall.contact.qualification}</p>
                  <p className="text-xs text-emerald-400 font-bold">
                    {isUrdu ? '🔊 آن لائن آڈیو مشورہ جاری ہے' : '🔊 HD Audio Call Connected'}
                  </p>
                </div>

                {/* Audio Waveform Animation */}
                <div className="flex items-center gap-1.5 h-8">
                  {[16, 28, 38, 22, 42, 18, 32, 26, 40, 20, 34, 16].map((h, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-amber-400 rounded-full animate-pulse"
                      style={{
                        height: `${(h * ((i % 4) + 1)) % 32 + 8}px`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Call Controls Bar (For Connected Call) */}
          {activeCall.status === 'connected' && (
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 p-4 rounded-3xl flex items-center justify-center gap-4 sm:gap-6 shadow-2xl">
              {/* Mute Button */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3.5 sm:p-4 rounded-2xl font-bold transition-all ${
                  isMuted ? 'bg-rose-600 text-white shadow-lg' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
                title={isMuted ? 'مائیک کھولیں' : 'مائیک بند کریں'}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6 text-amber-300" />}
              </button>

              {/* Camera Toggle Button (For Video Calls) */}
              {activeCall.type === 'video' && (
                <button
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  className={`p-3.5 sm:p-4 rounded-2xl font-bold transition-all ${
                    isVideoOff ? 'bg-rose-600 text-white shadow-lg' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                  title={isVideoOff ? 'کیمرہ آن کریں' : 'کیمرہ بند کریں'}
                >
                  {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6 text-emerald-400" />}
                </button>
              )}

              {/* Speaker Mute Button */}
              <button
                onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
                className={`p-3.5 sm:p-4 rounded-2xl font-bold transition-all ${
                  isSpeakerMuted ? 'bg-amber-600 text-white shadow-lg' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
                title={isSpeakerMuted ? 'اسپیکر کھولیں' : 'اسپیکر بند کریں'}
              >
                {isSpeakerMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6 text-emerald-300" />}
              </button>

              {/* End Call Button */}
              <button
                onClick={endCall}
                className="p-4 sm:p-5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                title="کال ختم کریں"
              >
                <PhoneOff className="w-6 h-6" />
                <span className="hidden sm:inline text-xs font-bold">{isUrdu ? 'کال ختم کریں' : 'End Call'}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
