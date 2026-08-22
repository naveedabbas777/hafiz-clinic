import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Paperclip,
  FileText,
  User,
  Search,
  Phone,
  Video,
  Mic,
  X,
  ExternalLink,
  ShieldCheck,
  FileCheck,
  Lock,
  ArrowLeft,
  Play,
  Pause,
  Trash2,
  Download,
  CheckCheck,
  MicOff,
  VideoOff,
  PhoneOff,
  Volume2,
  VolumeX,
  Smartphone,
  ChevronDown,
  MessageSquare,
  Receipt,
  Printer,
  Share2,
  Copy,
  Check,
  Pill,
  FlaskConical,
  Stethoscope,
  Activity,
  Eye,
  Sparkles,
  Plus,
  Calendar,
  DollarSign,
  QrCode,
} from 'lucide-react';
import { Doctor, DigitalSlipData, DigitalSlipItem } from '../types';
import { getMessagesApi, sendMessageApi, createReportApi, uploadDiseaseImageApi, getUsersApi, getActiveCallApi, startCallApi, acceptCallApi, declineCallApi, endCallApi, sendCallSignalApi, getCallSignalsApi, deleteMessageApi, clearConversationMessagesApi } from '../services/api';

// WAV Base64 Audio Generator for permanent cross-browser voice notes
function createAudioToneDataUrl(durationSeconds: number = 4): string {
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

    let binary = '';
    const bytes = new Uint8Array(buffer.buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    return `data:audio/wav;base64,${base64}`;
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
  digitalSlip?: DigitalSlipData;
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
  const userId = currentUser?.id || currentUser?._id || (isDoctor ? 'doc-1' : 'usr-1');
  const userName = currentUser?.fullName || currentUser?.name || (isDoctor ? 'ڈاکٹر زیشان چوہدری' : 'محمد فاروق');

  // Mobile View Navigation State (Auto-open chat stream on mobile for Patients)
  const [showMobileChat, setShowMobileChat] = useState(!isDoctor);

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
  const otherDoctors = doctorContactsList.filter((d) => d.id !== userId);
  const allContacts: ContactItem[] = isDoctor
    ? (patientContactsList.length > 0 ? [...patientContactsList, ...otherDoctors] : doctorContactsList)
    : doctorContactsList;

  const [activeContact, setActiveContact] = useState<ContactItem>(
    allContacts[0] || (isDoctor ? patientContactsList[0] : doctorContactsList[0])
  );

  const [searchQuery, setSearchQuery] = useState('');

  const [messages, setMessages] = useState<MessageItem[]>([]);

  const [inputMessage, setInputMessage] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [docCategory, setDocCategory] = useState('🖼️ تصویر (Medical Image)');
  const [selectedPreviewImg, setSelectedPreviewImg] = useState<string | null>(null);

  // Quick Prescription Modal for Doctor
  const [showRxModal, setShowRxModal] = useState(false);
  const [rxMedicines, setRxMedicines] = useState('1. شربت شفا صغیر - 2 چمچ صبح شام\n2. حب کبد ہربل - 1 گولی بعد از غذا\n3. معجون مقوی سندر - 1 چمچ رات کو');
  const [rxAdvice, setRxAdvice] = useState('پرہیز: تلی ہوئی اشیاء، ڈرنکس اور بادی اشیاء سے پرہیز کریں۔');

  // Digital Slip Modal & Full Management State
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [activeSlipTab, setActiveSlipTab] = useState<'prescription' | 'invoice' | 'lab_token' | 'discharge_summary'>('prescription');
  const [slipDoctorName, setSlipDoctorName] = useState(userName);
  const [slipDepartment, setSlipDepartment] = useState('شعبہ او پی ڈی و جنرل کلینک');
  const [slipDiagnosis, setSlipDiagnosis] = useState('معدہ، جگر و عام جسمانی کمزوری');
  const [slipInstructions, setSlipInstructions] = useState('کھانے کے بعد ادویات لیں، پانی کا زیادہ استعمال کریں۔');
  const [slipPrecautions, setSlipPrecautions] = useState('تلی ہوئی اشیاء، ڈرنکس اور بادی کھانوں سے پرہیز کریں۔');
  const [slipItems, setSlipItems] = useState<DigitalSlipItem[]>([
    { name: 'شربت شفا صغیر (Syp Shifa Sagheer)', category: 'Medicine', qty: 2, price: 350, dosage: '2 چمچ صبح و شام', instructions: 'بعد از غذا' },
    { name: 'حب کبد ہربل (Hab-e-Kabad Herbal)', category: 'Medicine', qty: 1, price: 280, dosage: '1 گولی رات کو', instructions: 'ہمراہ نیم گرم پانی' },
  ]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Medicine');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemPrice, setNewItemPrice] = useState(250);
  const [newItemDosage, setNewItemDosage] = useState('1+0+1 بعد از غذا');
  const [slipDiscount, setSlipDiscount] = useState(0);
  const [slipPaid, setSlipPaid] = useState(980);
  const [selectedSlipToPrint, setSelectedSlipToPrint] = useState<DigitalSlipData | null>(null);
  const [copiedSlipId, setCopiedSlipId] = useState<string | null>(null);

  // Audio Voice Recorder & Playback State
  const [myOnlineStatus, setMyOnlineStatus] = useState<boolean>(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  // Live Telemedicine Call State (WhatsApp Style)
  const [activeCall, setActiveCall] = useState<{
    id?: string;
    type: 'audio' | 'video';
    contact: ContactItem;
    status: 'ringing' | 'connected' | 'ended';
    mode: 'incoming' | 'outgoing';
  } | null>(null);
  const [callSeconds, setCallSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [speakerMode, setSpeakerMode] = useState<'loudspeaker' | 'earpiece'>('loudspeaker');
  const [remoteStreamState, setRemoteStreamState] = useState<MediaStream | null>(null);
  const [isSwappedVideo, setIsSwappedVideo] = useState(false);

  const ringtoneRef = useRef<RingtoneSynthesizer | null>(null);
  const callTimerRef = useRef<any>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const callAudioContextRef = useRef<AudioContext | null>(null);
  const audioGainNodeRef = useRef<GainNode | null>(null);
  const audioSourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const processedSignalsRef = useRef<Set<string>>(new Set());
  const signalPollTimerRef = useRef<any>(null);

  // Handle camera video toggle (On/Off)
  useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !isVideoOff;
      });
    }
  }, [isVideoOff]);

  // Handle Mute & Speaker Mode (Loudspeaker vs Earpiece) toggles in real-time
  useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !isMuted;
      });
    }
  }, [isMuted]);

  useEffect(() => {
    const vol = isSpeakerMuted ? 0 : (speakerMode === 'loudspeaker' ? 1.0 : 0.28);
    if (audioGainNodeRef.current) {
      audioGainNodeRef.current.gain.value = vol;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = isSpeakerMuted;
      remoteAudioRef.current.volume = vol;
    }
  }, [isSpeakerMuted, speakerMode]);

  // Ensure local and remote video elements stay updated with active MediaStreams
  useEffect(() => {
    if (activeCall?.type === 'video' && activeCall?.status === 'connected') {
      if (localVideoRef.current && localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
        localVideoRef.current.play().catch(() => {});
      }
      if (remoteVideoRef.current && remoteStreamState) {
        remoteVideoRef.current.srcObject = remoteStreamState;
        remoteVideoRef.current.play().catch(() => {});
      }
    }
  }, [activeCall?.status, activeCall?.type, isSwappedVideo, remoteStreamState]);

  // Real-time WebRTC Live Microphone Audio & Video Stream Connection
  useEffect(() => {
    let isCancelled = false;

    if (activeCall?.status === 'connected' && activeCall?.id) {
      const callId = activeCall.id;
      processedSignalsRef.current.clear();

      const initCallMediaAndWebRTC = async () => {
        try {
          // 1. Get user's local microphone/camera stream to transmit to the other user
          let localStream = localStreamRef.current;
          if (!localStream && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            localStream = await navigator.mediaDevices.getUserMedia({
              audio: true,
              video: activeCall.type === 'video',
            });
            localStreamRef.current = localStream;
          }

          if (localVideoRef.current && activeCall.type === 'video' && localStream) {
            localVideoRef.current.srcObject = localStream;
            localVideoRef.current.play().catch(() => {});
          }

          // 2. Initialize RTCPeerConnection for live real-time audio/video exchange
          const configuration = {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
            ],
          };

          if (peerConnectionRef.current) {
            try { peerConnectionRef.current.close(); } catch (e) {}
          }

          const pc = new RTCPeerConnection(configuration);
          peerConnectionRef.current = pc;

          // 3. Add local audio and video tracks so remote participant receives our stream live
          if (localStream) {
            localStream.getTracks().forEach((track) => {
              pc.addTrack(track, localStream!);
            });
          }

          // 4. Handle incoming remote audio and video stream from the patient / doctor
          pc.ontrack = (event) => {
            if (event.streams && event.streams[0]) {
              const remoteStream = event.streams[0];
              setRemoteStreamState(remoteStream);

              if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream;
                remoteVideoRef.current.play().catch(() => {});
              }
              if (remoteAudioRef.current) {
                remoteAudioRef.current.srcObject = remoteStream;
                remoteAudioRef.current.play().catch(() => {});
              }
              setupLiveCallAudio(remoteStream);
            }
          };

          // 5. Send ICE candidates to server signaling relay
          pc.onicecandidate = (event) => {
            if (event.candidate) {
              sendCallSignalApi(callId, userId, { candidate: event.candidate }).catch(() => {});
            }
          };

          // 6. If caller (outgoing call mode), create and send SDP Offer
          if (activeCall.mode === 'outgoing') {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            await sendCallSignalApi(callId, userId, { sdp: offer }).catch(() => {});
          }

          // 7. Poll server for remote peer WebRTC signals every second
          if (signalPollTimerRef.current) clearInterval(signalPollTimerRef.current);
          signalPollTimerRef.current = setInterval(async () => {
            if (isCancelled || !peerConnectionRef.current) return;
            try {
              const res = await getCallSignalsApi(callId, userId);
              if (res && res.success && res.signals && res.signals.length > 0) {
                for (const sig of res.signals) {
                  const sigStr = JSON.stringify(sig);
                  if (processedSignalsRef.current.has(sigStr)) continue;
                  processedSignalsRef.current.add(sigStr);

                  if (sig.sdp) {
                    if (sig.sdp.type === 'offer' && pc.signalingState !== 'closed') {
                      await pc.setRemoteDescription(new RTCSessionDescription(sig.sdp));
                      const answer = await pc.createAnswer();
                      await pc.setLocalDescription(answer);
                      await sendCallSignalApi(callId, userId, { sdp: answer }).catch(() => {});
                    } else if (sig.sdp.type === 'answer' && pc.signalingState !== 'closed') {
                      await pc.setRemoteDescription(new RTCSessionDescription(sig.sdp));
                    }
                  } else if (sig.candidate) {
                    await pc.addIceCandidate(new RTCIceCandidate(sig.candidate)).catch(() => {});
                  }
                }
              }
            } catch (err) {
              // Ignore polling signaling errors
            }
          }, 1000);

        } catch (e) {
          console.log('WebRTC P2P Live Call setup:', e);
        }
      };

      initCallMediaAndWebRTC();
    } else {
      if (signalPollTimerRef.current) {
        clearInterval(signalPollTimerRef.current);
        signalPollTimerRef.current = null;
      }
    }

    return () => {
      isCancelled = true;
      if (signalPollTimerRef.current) {
        clearInterval(signalPollTimerRef.current);
        signalPollTimerRef.current = null;
      }
    };
  }, [activeCall?.status, activeCall?.id]);

  // Currently Playing Voice Note State
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const activeAudioObjectRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<any>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const isUserNearBottomRef = useRef<boolean>(true);
  const [showJumpBottom, setShowJumpBottom] = useState(false);
  const [unreadNewCount, setUnreadNewCount] = useState<number>(0);
  const lastMessageIdRef = useRef<string | null>(null);

  const handleChatScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const distanceToBottom = scrollHeight - scrollTop - clientHeight;
      const isNear = distanceToBottom < 120;
      isUserNearBottomRef.current = isNear;
      if (isNear) {
        setShowJumpBottom(false);
        setUnreadNewCount(0);
      } else {
        setShowJumpBottom(true);
      }
    }
  };

  // Helper to scroll to bottom focus (WhatsApp style)
  const scrollToLatestMessage = (force = false, smooth = true) => {
    const doScroll = () => {
      if (chatContainerRef.current) {
        if (force || isUserNearBottomRef.current) {
          const target = chatContainerRef.current.scrollHeight;
          if (smooth) {
            chatContainerRef.current.scrollTo({ top: target, behavior: 'smooth' });
          } else {
            chatContainerRef.current.scrollTop = target;
          }
          isUserNearBottomRef.current = true;
          setShowJumpBottom(false);
          setUnreadNewCount(0);
        }
      }
      if (chatEndRef.current && (force || isUserNearBottomRef.current)) {
        try {
          chatEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'end' });
        } catch (e) {}
      }
    };

    doScroll();
    requestAnimationFrame(doScroll);
    setTimeout(doScroll, 50);
    setTimeout(doScroll, 180);
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

  // Poll server for active incoming or connected calls in realtime
  const pollActiveCall = async () => {
    try {
      const res = await getActiveCallApi(userId);
      if (res && res.success) {
        const serverCall = res.call;
        if (serverCall) {
          if (serverCall.receiverId === userId && serverCall.status === 'ringing') {
            if (!activeCall || activeCall.id !== serverCall.id) {
              const callerContact: ContactItem = {
                id: serverCall.callerId,
                nameUrdu: serverCall.callerName,
                nameEnglish: serverCall.callerName,
                role: serverCall.callerRole,
                image: serverCall.callerRole === 'doctor'
                  ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600'
                  : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
              };

              if (ringtoneRef.current) ringtoneRef.current.stop();
              ringtoneRef.current = new RingtoneSynthesizer();
              ringtoneRef.current.start();

              setActiveCall({
                id: serverCall.id,
                type: serverCall.type,
                contact: callerContact,
                status: 'ringing',
                mode: 'incoming',
              });
              setCallSeconds(0);
            }
          } else if (serverCall.status === 'connected') {
            if (activeCall && activeCall.status === 'ringing') {
              if (ringtoneRef.current) {
                ringtoneRef.current.stop();
                ringtoneRef.current = null;
              }
              setActiveCall((prev) => (prev ? { ...prev, status: 'connected' } : null));
              if (!callTimerRef.current) {
                callTimerRef.current = setInterval(() => {
                  setCallSeconds((s) => s + 1);
                }, 1000);
              }
            }
          }
        } else if (activeCall) {
          if (ringtoneRef.current) {
            ringtoneRef.current.stop();
            ringtoneRef.current = null;
          }
          if (callTimerRef.current) {
            clearInterval(callTimerRef.current);
            callTimerRef.current = null;
          }
          if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((t) => t.stop());
            localStreamRef.current = null;
          }
          setActiveCall(null);
          setCallSeconds(0);
        }
      }
    } catch (e) {
      // Ignore polling errors
    }
  };

  // Load messages and registered patients whenever active contact changes or component mounts
  useEffect(() => {
    isUserNearBottomRef.current = true;
    lastMessageIdRef.current = null;
    setUnreadNewCount(0);
    fetchRegisteredPatients();
    fetchMessages();
    pollActiveCall();
    scrollToLatestMessage(true, false);

    const timer = setInterval(() => {
      fetchRegisteredPatients();
      fetchMessages();
      pollActiveCall();
    }, 1500);

    return () => clearInterval(timer);
  }, [activeContact.id, userId, activeCall?.id, activeCall?.status]);

  const fetchMessages = async () => {
    try {
      const res = await getMessagesApi(userId, activeContact.id);
      if (res.success && Array.isArray(res.messages)) {
        if (res.messages.length > 0) {
          const serverMsgs = res.messages;
          const latestMsg = serverMsgs[serverMsgs.length - 1];
          const latestId = latestMsg?.id || latestMsg?.createdAt || '';

          const isBrandNewMessage = lastMessageIdRef.current !== null && lastMessageIdRef.current !== latestId;
          lastMessageIdRef.current = latestId;

          setMessages((prev) => {
            const serverMap = new Map(serverMsgs.map((m: MessageItem) => [m.id || m.createdAt, m]));
            // Retain any pending/optimistic local messages that aren't on server yet
            const pendingLocal = prev.filter((local) => {
              if (!local.id || local.id.startsWith('init_')) return false;
              if (serverMap.has(local.id)) return false;
              // Filter out if server already has an identical message
              const existsInServer = serverMsgs.some(
                (s: MessageItem) =>
                  s.senderId === local.senderId &&
                  s.receiverId === local.receiverId &&
                  s.text === local.text &&
                  s.attachmentUrl === local.attachmentUrl &&
                  s.audioUrl === local.audioUrl
              );
              return !existsInServer;
            });
            return [...serverMsgs, ...pendingLocal];
          });

          if (isBrandNewMessage) {
            if (isUserNearBottomRef.current) {
              scrollToLatestMessage(true, true);
            } else {
              setShowJumpBottom(true);
              setUnreadNewCount((prev) => prev + 1);
            }
          }
        } else {
          // Strictly empty conversation - do not auto-inject any greeting/reply
          setMessages((prev) => {
            return prev.filter((local) => local.id && !local.id.startsWith('init_') && !local.id.startsWith('m1'));
          });
        }
      }
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

    // If real Blob, Data URL or HTTP audio URL exists, attempt HTML5 Audio play first
    if (audioUrl && (audioUrl.startsWith('blob:') || audioUrl.startsWith('http') || audioUrl.startsWith('data:'))) {
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

  // Setup Live Audio Routing (Microphone to Speaker & Web Audio)
  const setupLiveCallAudio = (stream: MediaStream) => {
    try {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = stream;
        remoteAudioRef.current.play().catch(() => {});
      }

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        if (callAudioContextRef.current && callAudioContextRef.current.state !== 'closed') {
          try {
            callAudioContextRef.current.close();
          } catch (e) {}
        }
        const ctx = new AudioCtx();
        callAudioContextRef.current = ctx;

        const source = ctx.createMediaStreamSource(stream);
        audioSourceNodeRef.current = source;

        const gainNode = ctx.createGain();
        const vol = isSpeakerMuted ? 0 : (speakerMode === 'loudspeaker' ? 1.0 : 0.28);
        gainNode.gain.value = vol;
        audioGainNodeRef.current = gainNode;

        source.connect(gainNode);
        gainNode.connect(ctx.destination);
      }
    } catch (err) {
      console.log('Live Audio setup:', err);
    }
  };

  const cleanupCallAudioAndMedia = () => {
    if (callAudioContextRef.current) {
      try {
        callAudioContextRef.current.close();
      } catch (e) {}
      callAudioContextRef.current = null;
    }
    audioSourceNodeRef.current = null;
    audioGainNodeRef.current = null;

    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close();
      } catch (e) {}
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
  };

  // Start Telemedicine Audio or Video Call (WhatsApp Ringing)
  const startCall = async (type: 'audio' | 'video', mode: 'outgoing' | 'incoming' = 'outgoing') => {
    if (ringtoneRef.current) {
      ringtoneRef.current.stop();
    }
    ringtoneRef.current = new RingtoneSynthesizer();
    ringtoneRef.current.start();

    setCallSeconds(0);
    setIsMuted(false);
    setIsVideoOff(false);
    setIsSpeakerMuted(false);

    let callId = `call_${Date.now()}`;
    try {
      const res = await startCallApi({
        callerId: userId,
        callerName: userName,
        callerRole: isDoctor ? 'doctor' : 'patient',
        receiverId: activeContact.id,
        receiverName: isUrdu ? activeContact.nameUrdu : (activeContact.nameEnglish || activeContact.nameUrdu),
        receiverRole: activeContact.role,
        type,
      });
      if (res && res.call && res.call.id) {
        callId = res.call.id;
      }
    } catch (e) {
      // Fallback local call
    }

    setActiveCall({
      id: callId,
      type,
      contact: activeContact,
      status: 'ringing',
      mode,
    });

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: type === 'video',
        });
        localStreamRef.current = stream;
        // Do NOT play local stream back to self (prevents local voice echo)
        if (localVideoRef.current && type === 'video') {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play().catch(() => {});
        }
      }
    } catch (err) {
      console.log('Telemedicine call media initialized');
    }
  };

  const acceptCall = async () => {
    if (ringtoneRef.current) {
      ringtoneRef.current.stop();
      ringtoneRef.current = null;
    }

    if (activeCall?.id) {
      await acceptCallApi(activeCall.id).catch(() => {});
    }

    setActiveCall((prev) => (prev ? { ...prev, status: 'connected' } : null));

    if (callTimerRef.current) clearInterval(callTimerRef.current);
    callTimerRef.current = setInterval(() => {
      setCallSeconds((s) => s + 1);
    }, 1000);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: activeCall?.type === 'video',
        });
        localStreamRef.current = stream;
        // Do NOT play local stream back to self (prevents local voice echo)
        if (localVideoRef.current && activeCall?.type === 'video') {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play().catch(() => {});
        }
      }
    } catch (err) {
      console.log('Telemedicine call accepted');
    }
  };

  const declineCall = async () => {
    if (ringtoneRef.current) {
      ringtoneRef.current.stop();
      ringtoneRef.current = null;
    }
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    cleanupCallAudioAndMedia();

    if (activeCall) {
      if (activeCall.id) {
        await declineCallApi(activeCall.id).catch(() => {});
      }

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

  const endCall = async () => {
    if (ringtoneRef.current) {
      ringtoneRef.current.stop();
      ringtoneRef.current = null;
    }
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    cleanupCallAudioAndMedia();

    const durationMin = Math.floor(callSeconds / 60);
    const durationSec = callSeconds % 60;
    const formattedDuration = `${durationMin < 10 ? '0' + durationMin : durationMin}:${durationSec < 10 ? '0' + durationSec : durationSec}`;

    if (activeCall) {
      if (activeCall.id) {
        await endCallApi(activeCall.id).catch(() => {});
      }

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

  // Stop & Send Voice Recording with Base64 Data URL so it NEVER disappears
  const stopAndSendVoiceRecording = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    const durSec = recordingSeconds > 0 ? recordingSeconds : 5;
    const durFormatted = `00:${durSec < 10 ? '0' + durSec : durSec}`;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = () => {
        if (audioChunksRef.current.length > 0) {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          if (blob.size > 0) {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64Audio = reader.result as string;
              sendVoiceMessage(base64Audio, durFormatted);
            };
            reader.readAsDataURL(blob);
            setIsRecording(false);
            setRecordingSeconds(0);
            return;
          }
        }
        const fallbackUrl = createAudioToneDataUrl(durSec);
        sendVoiceMessage(fallbackUrl, durFormatted);
        setIsRecording(false);
        setRecordingSeconds(0);
      };
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream?.getTracks().forEach((track) => track.stop());
    } else {
      const fallbackUrl = createAudioToneDataUrl(durSec);
      sendVoiceMessage(fallbackUrl, durFormatted);
      setIsRecording(false);
      setRecordingSeconds(0);
    }
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
    const finalUrl = url || createAudioToneDataUrl(5);
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
    sendMessageApi(newMsg).then(() => fetchMessages()).catch(() => {});
    scrollToLatestMessage(true);
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

    // Save message via API and trigger immediate refresh
    sendMessageApi(newMsg).then(() => fetchMessages()).catch(() => {});
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

  // DIGITAL SLIP SHARING & MANAGEMENT HANDLERS
  const handleShareDigitalSlip = (customSlip?: DigitalSlipData) => {
    const subtotal = slipItems.reduce((acc, it) => acc + ((it.price || 0) * (it.qty || 1)), 0);
    const grandTotal = Math.max(0, subtotal - slipDiscount);
    const balance = Math.max(0, grandTotal - slipPaid);

    const generatedSlipNumber = `SLIP-${Date.now().toString().slice(-6)}`;

    const slipPayload: DigitalSlipData = customSlip || {
      slipType: activeSlipTab,
      slipNumber: generatedSlipNumber,
      patientName: activeContact.nameUrdu || activeContact.nameEnglish,
      patientPhone: activeContact.phone || '0300-1234567',
      mrnNumber: activeContact.qualification || 'MRN-84920',
      doctorName: isDoctor ? userName : (activeContact.role === 'doctor' ? activeContact.nameUrdu : 'ڈاکٹر زیشان چوہدری'),
      department: slipDepartment,
      date: new Date().toLocaleDateString('ur-PK'),
      timeSlot: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tokenNumber: Math.floor(Math.random() * 40) + 1,
      diagnosis: slipDiagnosis,
      instructions: slipInstructions,
      precautions: slipPrecautions,
      items: slipItems,
      subtotal,
      discount: slipDiscount,
      totalAmount: grandTotal,
      paidAmount: slipPaid,
      balanceAmount: balance,
      status: balance === 0 ? 'مکمل ادا شدہ (Paid)' : 'واجب الادا (Partial/Unpaid)',
      verifiedBy: userName,
    };

    const typeTitle =
      slipPayload.slipType === 'prescription'
        ? '💊 ڈیجیٹل نسخہ (Rx)'
        : slipPayload.slipType === 'lab_token'
        ? '🔬 لیب و ٹیسٹنگ ٹوکن'
        : slipPayload.slipType === 'discharge_summary'
        ? '🏥 ڈسچارج سمری و حتمی بل'
        : '🧾 او پی ڈی فیس سلپ';

    const newMsg: MessageItem = {
      id: `slip_${Date.now()}`,
      senderId: userId,
      senderName: userName,
      senderRole: isDoctor ? 'doctor' : 'patient',
      receiverId: activeContact.id,
      receiverName: isUrdu ? activeContact.nameUrdu : (activeContact.nameEnglish || activeContact.nameUrdu),
      receiverRole: activeContact.role,
      text: `🧾 ${typeTitle}: نمبر #${slipPayload.slipNumber} جاری کر دی گئی ہے۔ تمام تفاصیل نیچے منسلک ہیں۔`,
      digitalSlip: slipPayload,
      documentType: typeTitle,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    sendMessageApi(newMsg).catch(() => {});
    setShowSlipModal(false);
    scrollToLatestMessage(true);
  };

  const handleShareSlipToWhatsApp = (slip: DigitalSlipData) => {
    try {
      const typeLabel =
        slip.slipType === 'prescription'
          ? '💊 ڈیجیٹل نسخہ Rx'
          : slip.slipType === 'lab_token'
          ? '🔬 لیبارٹری و ریڈیالوجی ٹوکن'
          : slip.slipType === 'discharge_summary'
          ? '🏥 ڈسچارج بل'
          : '🧾 او پی ڈی سلپ';

      const itemsText = (slip.items || [])
        .map((it, i) => `${i + 1}. *${it.name}* ${it.dosage ? `(${it.dosage})` : ''} - تعداد: ${it.qty || 1} | رقم: Rs. ${((it.price || 0) * (it.qty || 1)).toLocaleString()}`)
        .join('\n');

      const waText =
`🏥 *حافظ کلینک اینڈ ڈائیگنوسٹک سینٹر*
━━━━━━━━━━━━━━━━━━━━
${typeLabel}: *#${slip.slipNumber}*
📅 تاریخ: ${slip.date} | وقت: ${slip.timeSlot || '11:00 AM'}
👤 مریض کا نام: *${slip.patientName}*
👨‍⚕️ معالج / شعبہ: ${slip.doctorName || slip.department || 'او پی ڈی'}
🔖 ٹوکن نمبر: #${slip.tokenNumber || '12'}

📋 *تجویز کردہ ادویات / چارجز:*
${itemsText || 'تفصیلات کلینک ریکارڈ میں درج ہیں۔'}

💰 *مالی تفصیلات:*
• کل رقم (Total): Rs. ${(slip.totalAmount || 0).toLocaleString()}
• ادا شدہ رقم (Paid): Rs. ${(slip.paidAmount || 0).toLocaleString()}
• بقایا (Balance): Rs. ${(slip.balanceAmount || 0).toLocaleString()}
• کیفیت: ${slip.status || 'Verified'}

📌 *طبی مشورہ و پرہیز:*
${slip.instructions || 'ادویات وقت پر لیں اور پرہیز کا خیال رکھیں۔'}
${slip.precautions ? `پرہیز: ${slip.precautions}` : ''}

━━━━━━━━━━━━━━━━━━━━
📞 ہیلپ لائن: 0300-1234567 | حافظ کلینک`;

      const cleanPhone = (slip.patientPhone || activeContact.phone || '').replace(/[^0-9]/g, '');
      const targetPhone = cleanPhone.startsWith('92') ? cleanPhone : cleanPhone.startsWith('0') ? '92' + cleanPhone.slice(1) : '92' + cleanPhone;
      
      const waUrl = cleanPhone
        ? `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(waText)}`
        : `https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`;

      window.open(waUrl, '_blank');
    } catch (e) {
      alert('واٹس ایپ لنک کھولنے میں خرابی پیش آئی۔');
    }
  };

  const handleCopySlipText = (slip: DigitalSlipData) => {
    try {
      const itemsText = (slip.items || [])
        .map((it, i) => `${i + 1}. ${it.name} ${it.dosage ? `(${it.dosage})` : ''} - Qty: ${it.qty || 1} - Rs. ${((it.price || 0) * (it.qty || 1)).toLocaleString()}`)
        .join('\n');

      const plainText =
`🏥 حافظ کلینک اینڈ ڈائیگنوسٹک سینٹر
سلپ نمبر: #${slip.slipNumber}
مریض: ${slip.patientName} | تاریخ: ${slip.date}
معالج: ${slip.doctorName || 'ڈاکٹر زیشان چوہدری'} | شعبہ: ${slip.department || 'او پی ڈی'}

تفاصیل:
${itemsText}

کل رقم: Rs. ${(slip.totalAmount || 0).toLocaleString()} | ادا شدہ: Rs. ${(slip.paidAmount || 0).toLocaleString()}
ہدایات: ${slip.instructions || 'کوئی خاص ہدایت نہیں'}`;

      navigator.clipboard.writeText(plainText);
      setCopiedSlipId(slip.slipNumber);
      setTimeout(() => setCopiedSlipId(null), 2500);
    } catch (e) {}
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

  const handleDeleteMessage = async (msg: MessageItem) => {
    const confirmText = isUrdu
      ? 'کیا آپ یہ پیغام اور اس کے ساتھ منسلک فائل / وائس نوٹ ڈیلیٹ کرنا چاہتے ہیں؟ (Cloudinary سے بھی حذف ہو جائے گی)'
      : 'Delete this message and purge attached file/audio from Cloudinary?';
    if (!window.confirm(confirmText)) return;

    setMessages((prev) => prev.filter((m) => m.id !== msg.id && (m as any)._id !== msg.id));
    await deleteMessageApi(msg.id || (msg as any)._id, msg.attachmentUrl, msg.audioUrl).catch(() => {});
  };

  const handleClearConversation = async () => {
    const confirmText = isUrdu
      ? `کیا آپ ${activeContact.nameUrdu || activeContact.nameEnglish} کے ساتھ تمام پیغامات، وائس نوٹس اور منسلکہ تصاویر/فائلیں مکمل ڈیلیٹ کرنا چاہتے ہیں؟`
      : `Clear this entire conversation and delete all attached files/audios from Cloudinary?`;
    if (!window.confirm(confirmText)) return;

    setMessages([]);
    await clearConversationMessagesApi(userId, activeContact.id).catch(() => {});
  };

  const filteredContacts = allContacts.filter((c) => {
    return (
      c.nameUrdu.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.nameEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.specializationUrdu?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="bg-white rounded-xl sm:rounded-3xl overflow-hidden border border-slate-200 shadow-xl flex flex-col md:flex-row h-[520px] sm:h-[620px] md:h-[calc(100vh-150px)] max-h-[820px] min-h-[460px] w-full max-w-7xl mx-auto text-slate-900 font-sans">
      
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
                  if (activeContact.id !== contact.id) {
                    setMessages([]);
                    setActiveContact(contact);
                  }
                  setShowMobileChat(true);
                  isUserNearBottomRef.current = true;
                  scrollToLatestMessage(true, false);
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
            {/* Digital Slip Sharing Button */}
            <button
              onClick={() => setShowSlipModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-2.5 sm:px-3 py-1.5 rounded-xl text-[10px] sm:text-xs flex items-center gap-1 shadow-md transition-all active:scale-95 border border-emerald-400/30"
              title="مریض کو ڈیجیٹل سلپ، نسخہ یا ٹیسٹ ٹوکن بھیجیں"
            >
              <Receipt className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">{isUrdu ? '🧾 سلپ شیئر کریں' : '🧾 Share Slip'}</span>
              <span className="sm:hidden">سلپ</span>
            </button>

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

            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleClearConversation}
                className="p-2 bg-emerald-950/80 hover:bg-rose-700 text-emerald-200 hover:text-white rounded-full transition-colors border border-emerald-800 active:scale-95 ml-1"
                title={isUrdu ? "گفتگو اور تمام میڈیا فائلیں مکمل ڈیلیٹ کریں" : "Clear conversation & media"}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Security Banner Notice */}
        <div className="bg-emerald-50 border-b border-emerald-200 p-2 sm:p-2.5 text-center text-[11px] sm:text-xs text-emerald-900 font-bold flex items-center justify-center gap-1.5 px-3">
          <Lock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span className="truncate">{isUrdu ? 'تمام گفتگو، وائس نوٹس اور رپورٹس محفوظ و انکرپٹڈ ہیں۔' : 'All messages, voice notes & reports are encrypted and secure.'}</span>
        </div>

        {/* Messages Stream */}
        <div ref={chatContainerRef} onScroll={handleChatScroll} className="flex-1 overflow-y-auto p-2.5 sm:p-5 space-y-3 sm:space-y-4 text-xs bg-slate-100/90 relative">
          {messages.length === 0 ? (
            <div className="h-full min-h-[360px] flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-inner">
                <MessageSquare className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-sm">
                <p className="font-black text-slate-800 text-sm">
                  {isUrdu ? 'کوئی پرانا پیغام موجود نہیں ہے' : 'No Message History'}
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {isUrdu
                    ? `آپ کی ${isDoctor ? activeContact.nameUrdu : (activeContact.nameUrdu || activeContact.nameEnglish)} کے ساتھ 100% پرائیویٹ براہ راست ون ٹو ون گفتگو ہے۔ نیا میسج لکھنے کے لیے نیچے ٹائپ کریں۔`
                    : `Private 1-to-1 direct consultation with ${activeContact.nameEnglish || activeContact.nameUrdu}. Type a message below to start.`}
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => {
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
                  className={`max-w-[88%] sm:max-w-[78%] p-3 sm:p-3.5 rounded-2xl shadow-xs space-y-2 relative ${
                    isMe
                      ? 'bg-emerald-700 text-white rounded-tr-none'
                      : 'bg-white text-slate-900 border border-slate-200 rounded-tl-none shadow-xs'
                  }`}
                >
                  {/* Text Content */}
                  {msg.text && (
                    <p className="whitespace-pre-wrap leading-relaxed text-xs sm:text-xs font-medium break-words">{msg.text}</p>
                  )}

                  {/* DIGITAL SLIP ATTACHMENT CARD */}
                  {msg.digitalSlip && (() => {
                    const slip = msg.digitalSlip;
                    const isPrescription = slip.slipType === 'prescription';
                    const isLab = slip.slipType === 'lab_token' || slip.slipType === 'diagnostic_appointment';
                    const isDischarge = slip.slipType === 'discharge_summary';
                    
                    return (
                      <div className={`p-3 sm:p-4 rounded-2xl border space-y-3 mt-1.5 w-full min-w-[260px] sm:min-w-[340px] text-slate-900 shadow-md ${
                        isMe ? 'bg-emerald-950/95 border-emerald-500/50 text-white' : 'bg-slate-50 border-emerald-300 text-slate-900'
                      }`}>
                        {/* Top Slip Badge Header */}
                        <div className="flex items-center justify-between border-b pb-2 gap-2 border-emerald-500/30">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`p-2 rounded-xl text-white shrink-0 ${
                              isPrescription ? 'bg-emerald-600' : isLab ? 'bg-amber-600' : isDischarge ? 'bg-indigo-600' : 'bg-teal-600'
                            }`}>
                              {isPrescription ? <Pill className="w-5 h-5" /> : isLab ? <FlaskConical className="w-5 h-5" /> : isDischarge ? <Activity className="w-5 h-5" /> : <Receipt className="w-5 h-5" />}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                  isMe ? 'bg-amber-400 text-slate-950' : 'bg-emerald-800 text-amber-300'
                                }`}>
                                  {isPrescription ? '💊 میڈیکل نسخہ Rx' : isLab ? '🔬 لیب و ٹیسٹ رسید' : isDischarge ? '🏥 ڈسچارج بل' : '🧾 او پی ڈی سلپ'}
                                </span>
                                <span className="font-mono text-[11px] font-black opacity-90 truncate">
                                  #{slip.slipNumber}
                                </span>
                              </div>
                              <p className={`text-[11px] font-bold truncate mt-0.5 ${isMe ? 'text-emerald-200' : 'text-emerald-900'}`}>
                                {slip.department || 'حافظ کلینک اینڈ ڈائیگنوسٹک سینٹر'}
                              </p>
                            </div>
                          </div>

                          {slip.tokenNumber && (
                            <div className="text-center bg-amber-400 text-slate-950 px-2.5 py-1 rounded-xl shadow-xs shrink-0 font-mono">
                              <div className="text-[8px] font-black uppercase">Token</div>
                              <div className="text-xs font-black">#{slip.tokenNumber}</div>
                            </div>
                          )}
                        </div>

                        {/* Patient & Doctor Subheader */}
                        <div className={`grid grid-cols-2 gap-2 p-2 rounded-xl text-[10px] font-semibold ${
                          isMe ? 'bg-emerald-900/60 border border-emerald-800 text-emerald-100' : 'bg-white border border-slate-200 text-slate-700'
                        }`}>
                          <div>
                            <span className="opacity-70">مریض کا نام: </span>
                            <span className="font-bold">{slip.patientName}</span>
                          </div>
                          <div className="text-left font-mono">
                            <span className="opacity-70">تاریخ: </span>
                            <span>{slip.date}</span>
                          </div>
                          {slip.doctorName && (
                            <div className="col-span-2 flex items-center justify-between border-t border-emerald-700/30 pt-1">
                              <span><span className="opacity-70">معالج: </span><b>{slip.doctorName}</b></span>
                              {slip.timeSlot && <span className="font-mono">{slip.timeSlot}</span>}
                            </div>
                          )}
                        </div>

                        {/* Diagnosis or Problem */}
                        {slip.diagnosis && (
                          <div className={`p-2 rounded-xl text-[11px] font-medium ${
                            isMe ? 'bg-emerald-900/40 text-emerald-200 border border-emerald-800/40' : 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                          }`}>
                            <span className="font-bold text-amber-400 ml-1">تشخیص (Diagnosis):</span>
                            <span>{slip.diagnosis}</span>
                          </div>
                        )}

                        {/* Itemized Table */}
                        {slip.items && slip.items.length > 0 && (
                          <div className={`rounded-xl overflow-hidden border ${
                            isMe ? 'border-emerald-800 bg-emerald-900/30' : 'border-slate-200 bg-white'
                          }`}>
                            <div className={`p-1.5 px-2.5 font-bold text-[10px] flex justify-between ${
                              isMe ? 'bg-emerald-900/80 text-emerald-200' : 'bg-slate-100 text-slate-700'
                            }`}>
                              <span>{isPrescription ? 'تجویز کردہ ادویات و خوراک' : 'ٹیسٹ / چارجز کی تفصیل'}</span>
                              <span>رقم (PKR)</span>
                            </div>
                            <div className="divide-y divide-emerald-800/20 text-[11px]">
                              {slip.items.map((item, itIdx) => (
                                <div key={itIdx} className="p-2 flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="font-bold truncate">{item.name}</p>
                                    {item.dosage && (
                                      <p className={`text-[10px] ${isMe ? 'text-amber-300' : 'text-emerald-700'} font-medium`}>
                                        خوراک: {item.dosage} {item.instructions ? `(${item.instructions})` : ''}
                                      </p>
                                    )}
                                    {item.qty && item.qty > 1 && (
                                      <span className="text-[9px] opacity-75 font-mono">تعداد: {item.qty}</span>
                                    )}
                                  </div>
                                  <div className="font-mono font-bold shrink-0 text-right">
                                    Rs. {((item.price || 0) * (item.qty || 1)).toLocaleString()}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Financial Summary */}
                        {(slip.totalAmount !== undefined && slip.totalAmount > 0) && (
                          <div className={`p-2.5 rounded-xl flex items-center justify-between text-xs font-mono font-bold ${
                            isMe ? 'bg-emerald-900 border border-emerald-700 text-white' : 'bg-emerald-50 border border-emerald-300 text-emerald-950'
                          }`}>
                            <div className="space-y-0.5">
                              <div>کل رقم: Rs. {slip.totalAmount.toLocaleString()}</div>
                              {slip.discount ? <div className="text-[10px] text-rose-300">رعایت: -Rs. {slip.discount}</div> : null}
                            </div>
                            <div className="text-right space-y-0.5">
                              <div className="text-emerald-400">ادا شدہ: Rs. {(slip.paidAmount || 0).toLocaleString()}</div>
                              <div className="text-[10px] text-amber-300">بقایا: Rs. {(slip.balanceAmount || 0).toLocaleString()}</div>
                            </div>
                          </div>
                        )}

                        {/* Advice & Instructions */}
                        {slip.instructions && (
                          <div className={`p-2 rounded-xl text-[10px] space-y-0.5 ${
                            isMe ? 'bg-emerald-900/40 text-emerald-200' : 'bg-slate-100 text-slate-800'
                          }`}>
                            <div className="font-bold flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-400" />
                              <span>ڈاکٹر کی ہدایات و پرہیز:</span>
                            </div>
                            <p className="leading-relaxed">{slip.instructions}</p>
                            {slip.precautions && <p className="text-rose-400 font-semibold mt-1">پرہیز: {slip.precautions}</p>}
                          </div>
                        )}

                        {/* Interactive Action Buttons */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => setSelectedSlipToPrint(slip)}
                            className="flex-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-2 px-2.5 rounded-xl text-[10px] flex items-center justify-center gap-1 shadow-md transition-transform active:scale-95 cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>پرنٹ سلپ / PDF</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleShareSlipToWhatsApp(slip)}
                            className="flex-1 bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-2.5 rounded-xl text-[10px] flex items-center justify-center gap-1 shadow-md transition-transform active:scale-95 cursor-pointer"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>واٹس ایپ شیئر</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopySlipText(slip)}
                            className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-transform active:scale-95 cursor-pointer"
                            title="سلپ ٹیکسٹ کاپی کریں"
                          >
                            {copiedSlipId === slip.slipNumber ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* VOICE NOTE AUDIO PLAYER CARD */}
                  {msg.audioUrl && (
                    <div className={`p-2.5 sm:p-3 rounded-xl border space-y-2 mt-1 w-full min-w-[210px] max-w-[280px] sm:min-w-[250px] ${
                      isMe ? 'bg-emerald-800 border-emerald-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => togglePlayVoiceNote(msgUniqueKey, msg.audioUrl)}
                          className="w-10 h-10 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center shrink-0 shadow-md font-bold transition-transform active:scale-95"
                          title="وائس پیغام چلائیں"
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
                            <span className="font-bold truncate">{isPlayingThis ? (isUrdu ? '🔊 آواز چل رہی ہے...' : '🔊 Playing...') : (isUrdu ? '🎙️ وائس پیغام' : '🎙️ Voice Note')}</span>
                            <span className="font-bold shrink-0 ml-1">{msg.audioDuration || '00:12'}</span>
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
                        <div className={`p-2.5 sm:p-3 rounded-2xl border space-y-2 mt-1 ${
                          isMe ? 'bg-emerald-900 border-emerald-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}>
                          <div className="flex items-center justify-between text-[11px] font-bold border-b border-slate-200/40 pb-2 gap-2">
                            <span className="flex items-center gap-1.5 truncate">
                              <FileText className="w-4 h-4 text-red-400 shrink-0" />
                              <span className="truncate">{msg.documentType || (isUrdu ? '📄 PDF میڈیکل ڈاکومنٹ' : '📄 PDF Document')}</span>
                            </span>
                            <span className="bg-red-500/20 text-red-300 px-2 py-0.5 rounded text-[9px] font-bold shrink-0 border border-red-500/30">
                              PDF
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5 p-2.5 bg-red-950/20 border border-red-500/30 rounded-xl">
                            <div className="p-2 bg-red-600/20 rounded-lg text-red-400 shrink-0">
                              <FileText className="w-6 h-6" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold truncate">hafiz_clinic_report.pdf</p>
                              <p className="text-[10px] text-slate-300 opacity-80 truncate">{isUrdu ? 'طبی پورٹل لیبارٹری / نسخہ ڈاکومنٹ' : 'Medical Portal Lab / Rx Document'}</p>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-1">
                            <a
                              href={msg.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-lg text-center text-[10px] flex items-center justify-center gap-1 transition-colors active:scale-95"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>{isUrdu ? 'پریویو' : 'Preview'}</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => handleDownloadAttachment(msg.attachmentUrl!, 'hafiz_clinic_report.pdf')}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-center text-[10px] flex items-center justify-center gap-1 transition-colors shadow-xs active:scale-95"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>{isUrdu ? 'ڈاؤن لوڈ' : 'Download'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className={`p-2 sm:p-3 rounded-xl border space-y-2 mt-1 ${
                        isMe ? 'bg-emerald-800 border-emerald-600' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="flex items-center justify-between text-[11px] font-bold border-b border-slate-200/40 pb-1.5 gap-2">
                          <span className="flex items-center gap-1.5 truncate">
                            <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="truncate">{msg.documentType || 'منسلک شدہ تصویر'}</span>
                          </span>
                          <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded text-[9px] font-bold shrink-0">
                            Image
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
                            className="w-full h-36 sm:h-48 object-cover group-hover:scale-105 transition-transform"
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
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-center text-[10px] flex items-center justify-center gap-1 shadow-xs active:scale-95"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>ڈاؤن لوڈ (Download)</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Message Timestamp, Checkmarks & Delete Option */}
                  <div className={`flex items-center justify-end gap-1.5 text-[10px] font-mono pt-0.5 ${
                    isMe ? 'text-emerald-100' : 'text-slate-500'
                  }`}>
                    <span>
                      {msg.createdAt
                        ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '11:42 AM'}
                    </span>
                    {isMe && <CheckCheck className="w-4 h-4 text-amber-300" />}
                    <button
                      type="button"
                      onClick={() => handleDeleteMessage(msg)}
                      className={`p-0.5 rounded transition-all cursor-pointer opacity-70 hover:opacity-100 ${
                        isMe ? 'text-emerald-200 hover:text-rose-200 hover:bg-emerald-800' : 'text-slate-400 hover:text-rose-600 hover:bg-slate-100'
                      }`}
                      title={isUrdu ? 'یہ پیغام اور فائل ڈیلیٹ کریں (Cloudinary Cleanup)' : 'Delete message & Cloudinary media'}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          }))}
          <div ref={chatEndRef} />
        </div>

        {/* Floating Jump to Bottom Button */}
        {showJumpBottom && (
          <button
            type="button"
            onClick={() => {
              setUnreadNewCount(0);
              scrollToLatestMessage(true, true);
            }}
            className="absolute bottom-20 right-4 sm:right-6 z-30 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-3.5 py-2 rounded-full shadow-2xl border-2 border-amber-400 flex items-center gap-1.5 transition-all active:scale-95 animate-bounce cursor-pointer"
            title={isUrdu ? 'نیچے آخری پیغام پر جائیں' : 'Scroll to latest message'}
          >
            <ChevronDown className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="truncate">
              {unreadNewCount > 0
                ? (isUrdu ? `${unreadNewCount} نیا پیغام ↓` : `${unreadNewCount} New Message ↓`)
                : (isUrdu ? 'نیچے جائیں ↓' : 'Scroll to latest ↓')}
            </span>
          </button>
        )}

        {/* ATTACHMENT SELECTED PREVIEW BAR */}
        {attachmentUrl && (
          <div className="bg-emerald-50 border-t border-emerald-200 p-2 sm:p-2.5 px-3 sm:px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-2 shrink-0">
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

        {/* Message Input Bar - Responsive Bottom Bar */}
        <form onSubmit={handleSendMessage} className="bg-white p-2 sm:p-3 border-t border-slate-200 flex items-center gap-1.5 sm:gap-2 shrink-0 shadow-md sticky bottom-0 z-20 pb-safe">
          
          {/* File Attachment Button */}
          <label
            htmlFor="wa-file-input"
            className="w-10 h-10 bg-amber-100 hover:bg-amber-200 active:bg-amber-300 text-amber-900 rounded-full cursor-pointer transition-colors border border-amber-300 shadow-xs shrink-0 flex items-center justify-center active:scale-95"
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

          {/* Digital Slip Direct Creator Button */}
          <button
            type="button"
            onClick={() => setShowSlipModal(true)}
            className="w-10 h-10 bg-emerald-100 hover:bg-emerald-200 active:bg-emerald-300 text-emerald-900 rounded-full cursor-pointer transition-colors border border-emerald-300 shadow-xs shrink-0 flex items-center justify-center active:scale-95"
            title="ڈیجیٹل سلپ یا نسخہ شیئر کریں"
          >
            <Receipt className="w-5 h-5 text-emerald-800" />
          </button>

          {/* RECORDING LIVE BAR OR INPUT TEXT */}
          {isRecording ? (
            <div className="flex-1 bg-rose-50 border border-rose-300 rounded-2xl px-3 py-2 flex items-center justify-between animate-pulse text-xs text-rose-800 font-bold min-w-0">
              <div className="flex items-center gap-2 truncate">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping shrink-0"></span>
                <span className="truncate text-xs">وائس نوٹ ریکارڈ...</span>
                <span className="font-mono text-white bg-rose-700 px-2 py-0.5 rounded text-[11px] shrink-0">
                  00:{recordingSeconds < 10 ? '0' + recordingSeconds : recordingSeconds}
                </span>
              </div>
              <button
                type="button"
                onClick={cancelVoiceRecording}
                className="p-1.5 bg-white text-rose-600 hover:bg-rose-100 rounded-full border border-rose-200 shrink-0 ml-1 active:scale-95"
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
                  ? 'پیغام تحریر کریں...'
                  : 'Type your message...'
              }
              className="flex-1 min-w-0 bg-slate-100/90 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-base sm:text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
          )}

          {/* MIC RECORD BUTTON / STOP & SEND VOICE RECORDING */}
          {isRecording ? (
            <button
              type="button"
              onClick={stopAndSendVoiceRecording}
              className="w-10 h-10 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-full font-bold flex items-center justify-center shadow-md shrink-0 active:scale-95 transition-transform"
              title="وائس نوٹ بھیجیں"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={startVoiceRecording}
              className="w-10 h-10 bg-slate-100 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-800 rounded-full border border-slate-300 transition-colors shrink-0 flex items-center justify-center active:scale-95"
              title="وائس پیغام ریکارڈ کریں"
            >
              <Mic className="w-5 h-5 text-emerald-700" />
            </button>
          )}

          {/* TEXT SEND BUTTON - ALWAYS VISIBLE WHEN NOT RECORDING */}
          {!isRecording && (
            <button
              type="submit"
              disabled={isUploading}
              className="w-10 h-10 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-full font-bold flex items-center justify-center shadow-md shrink-0 transition-transform active:scale-95 disabled:opacity-50"
              title="پیغام بھیجیں"
            >
              <Send className="w-4 h-4 ml-0.5" />
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
      {/* DIGITAL SLIP GENERATOR & SHARING MODAL */}
      {/* ============================================== */}
      {showSlipModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full text-xs text-slate-900 shadow-2xl my-auto overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-emerald-800 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base">
                    {isUrdu ? 'ڈیجیٹل سلپ و نسخہ شیئرنگ مرکز' : 'Digital Slip & Rx Sharing Hub'}
                  </h3>
                  <p className="text-[11px] text-emerald-200">
                    مریض: <b>{activeContact.nameUrdu || activeContact.nameEnglish}</b> ({activeContact.phone || '0300-1234567'})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSlipModal(false)}
                className="w-8 h-8 rounded-full bg-emerald-900 hover:bg-rose-600 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
              
              {/* Slip Type Selector Tabs */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">سلپ کی قسم کا انتخاب کریں (Select Slip Category):</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'prescription', label: '💊 طبی نسخہ (Rx)', desc: 'ہربل و میڈیکل نسخہ' },
                    { id: 'invoice', label: '🧾 او پی ڈی فیس', desc: 'کنسلٹیشن و جنرل رسید' },
                    { id: 'lab_token', label: '🔬 لیب / ٹیسٹ ٹوکن', desc: 'ایکسرے، خون، آنکھیں' },
                    { id: 'discharge_summary', label: '🏥 ڈسچارج بل', desc: 'حتمی طبی خلاصہ' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveSlipTab(tab.id as any)}
                      className={`p-2.5 rounded-2xl border text-center transition-all ${
                        activeSlipTab === tab.id
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-md font-black ring-2 ring-emerald-400/50'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:border-emerald-300'
                      }`}
                    >
                      <div className="text-xs font-bold">{tab.label}</div>
                      <div className={`text-[10px] mt-0.5 opacity-80 ${activeSlipTab === tab.id ? 'text-emerald-100' : 'text-slate-500'}`}>
                        {tab.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Doctor & Department Meta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">معالج / تصدیق کنندہ کا نام:</label>
                  <input
                    type="text"
                    value={slipDoctorName}
                    onChange={(e) => setSlipDoctorName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">شعبہ / کلینک:</label>
                  <input
                    type="text"
                    value={slipDepartment}
                    onChange={(e) => setSlipDepartment(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">طبی تشخیص / سبب رجوع (Diagnosis):</label>
                  <input
                    type="text"
                    value={slipDiagnosis}
                    onChange={(e) => setSlipDiagnosis(e.target.value)}
                    placeholder="مثلاً: معدے میں جلن، نزلہ و زکام، معمول کا بلڈ ٹیسٹ"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Items & Medicines List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-800 font-bold flex items-center gap-1.5">
                    <span>📋 تجویز کردہ اشیاء / ادویات / لیب ٹیسٹ ({slipItems.length}):</span>
                  </label>
                </div>

                {/* Items Table */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <div className="bg-slate-100 p-2.5 font-bold text-[11px] text-slate-700 grid grid-cols-12 gap-2">
                    <div className="col-span-5">نام دوا / ٹیسٹ</div>
                    <div className="col-span-3">خوراک / تفصیل</div>
                    <div className="col-span-2 text-center">تعداد</div>
                    <div className="col-span-2 text-right">رقم</div>
                  </div>

                  <div className="divide-y divide-slate-100 max-h-40 overflow-y-auto">
                    {slipItems.map((item, idx) => (
                      <div key={idx} className="p-2 text-xs grid grid-cols-12 gap-2 items-center hover:bg-slate-50">
                        <div className="col-span-5 font-bold text-slate-900 truncate">
                          {item.name}
                        </div>
                        <div className="col-span-3 text-[10px] text-emerald-700 font-medium truncate">
                          {item.dosage || '-'}
                        </div>
                        <div className="col-span-2 text-center font-mono font-bold">
                          {item.qty || 1}
                        </div>
                        <div className="col-span-2 text-right font-mono font-bold flex items-center justify-end gap-1.5">
                          <span>Rs. {((item.price || 0) * (item.qty || 1)).toLocaleString()}</span>
                          <button
                            type="button"
                            onClick={() => setSlipItems(slipItems.filter((_, i) => i !== idx))}
                            className="text-rose-500 hover:text-rose-700 p-1"
                            title="ہٹائیں"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add New Item Row Form */}
                  <div className="bg-emerald-50/50 p-2.5 border-t border-emerald-100 grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                    <div className="sm:col-span-4">
                      <input
                        type="text"
                        placeholder="دوا یا ٹیسٹ کا نام لکھیں..."
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        placeholder="خوراک (مثلاً 1 گولی صبح)"
                        value={newItemDosage}
                        onChange={(e) => setNewItemDosage(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <input
                        type="number"
                        min="1"
                        placeholder="تعداد"
                        value={newItemQty}
                        onChange={(e) => setNewItemQty(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-mono text-center focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <input
                        type="number"
                        min="0"
                        placeholder="رقم (PKR)"
                        value={newItemPrice}
                        onChange={(e) => setNewItemPrice(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-mono text-right focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (!newItemName.trim()) return;
                          setSlipItems([
                            ...slipItems,
                            {
                              name: newItemName,
                              category: newItemCategory,
                              qty: newItemQty,
                              price: newItemPrice,
                              dosage: newItemDosage,
                              instructions: 'بعد از غذا',
                            },
                          ]);
                          setNewItemName('');
                          setNewItemDosage('1+0+1');
                        }}
                        className="w-full bg-emerald-700 hover:bg-emerald-600 text-white p-1.5 rounded-lg font-bold flex items-center justify-center shadow-xs"
                        title="شامل کریں"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions & Precautions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">ہدایات و استعمال (Instructions):</label>
                  <textarea
                    rows={2}
                    value={slipInstructions}
                    onChange={(e) => setSlipInstructions(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">پرہیز و احتیاط (Precautions):</label>
                  <textarea
                    rows={2}
                    value={slipPrecautions}
                    onChange={(e) => setSlipPrecautions(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Financial Calculation Bar */}
              <div className="bg-slate-900 text-white p-3.5 rounded-2xl space-y-2 shadow-inner font-mono text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span>ذیلی رقم (Subtotal):</span>
                  <span>Rs. {slipItems.reduce((acc, it) => acc + ((it.price || 0) * (it.qty || 1)), 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-rose-300">
                  <span>خصوصی رعایت (Discount):</span>
                  <div className="flex items-center gap-1">
                    <span>Rs. </span>
                    <input
                      type="number"
                      min="0"
                      value={slipDiscount}
                      onChange={(e) => setSlipDiscount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-20 bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-right text-rose-300 font-mono text-xs"
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center text-emerald-300">
                  <span>وصول شدہ رقم (Paid Amount):</span>
                  <div className="flex items-center gap-1">
                    <span>Rs. </span>
                    <input
                      type="number"
                      min="0"
                      value={slipPaid}
                      onChange={(e) => setSlipPaid(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-20 bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-right text-emerald-300 font-mono text-xs"
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-sm font-black text-amber-300">
                  <span>بقایا رقم (Balance):</span>
                  <span>
                    Rs. {Math.max(
                      0,
                      slipItems.reduce((acc, it) => acc + ((it.price || 0) * (it.qty || 1)), 0) -
                        slipDiscount -
                        slipPaid
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="bg-slate-100 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowSlipModal(false)}
                className="bg-white hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl border border-slate-300"
              >
                منسوخ کریں
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const subtotal = slipItems.reduce((acc, it) => acc + ((it.price || 0) * (it.qty || 1)), 0);
                    const grandTotal = Math.max(0, subtotal - slipDiscount);
                    const balance = Math.max(0, grandTotal - slipPaid);

                    handleShareSlipToWhatsApp({
                      slipType: activeSlipTab,
                      slipNumber: `SLIP-${Date.now().toString().slice(-6)}`,
                      patientName: activeContact.nameUrdu || activeContact.nameEnglish,
                      patientPhone: activeContact.phone || '0300-1234567',
                      doctorName: slipDoctorName,
                      department: slipDepartment,
                      date: new Date().toLocaleDateString('ur-PK'),
                      timeSlot: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      tokenNumber: Math.floor(Math.random() * 40) + 1,
                      diagnosis: slipDiagnosis,
                      instructions: slipInstructions,
                      precautions: slipPrecautions,
                      items: slipItems,
                      subtotal,
                      discount: slipDiscount,
                      totalAmount: grandTotal,
                      paidAmount: slipPaid,
                      balanceAmount: balance,
                      status: balance === 0 ? 'مکمل ادا شدہ (Paid)' : 'واجب الادا (Partial/Unpaid)',
                    });
                  }}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  <span>واٹس ایپ بھیجیں</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleShareDigitalSlip()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-5 sm:px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-lg active:scale-95 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>چیٹ میں شیئر کریں (Share to Chat)</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ============================================== */}
      {/* FULL PRINTABLE DIGITAL SLIP / PDF PREVIEW MODAL */}
      {/* ============================================== */}
      {selectedSlipToPrint && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white border border-slate-300 rounded-3xl max-w-xl w-full text-slate-900 shadow-2xl my-auto overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Header with Print and Close */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-sm">ڈیجیٹل سلپ و رسید پرنٹ پریویو</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-md transition-transform active:scale-95"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>پرنٹ کریں (Print)</span>
                </button>
                <button
                  onClick={() => setSelectedSlipToPrint(null)}
                  className="w-7 h-7 rounded-full bg-slate-800 hover:bg-rose-600 text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* A4 Style Medical Slip Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-5 bg-slate-50 flex-1">
              
              {/* Slip Card Inside */}
              <div className="bg-white border-2 border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm relative overflow-hidden">
                
                {/* Clinic Header */}
                <div className="text-center border-b-2 border-slate-800 pb-3 space-y-1">
                  <h2 className="text-xl font-black text-slate-900">
                    حافظ کلینک اینڈ ڈائیگنوسٹک سینٹر
                  </h2>
                  <p className="text-xs text-slate-600 font-bold">
                    Hafiz Specialized Clinic & Advanced Diagnostic Center
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    نزد مین ہسپتال چوک | ہیلپ لائن: 0300-1234567 | رجسٹریشن # HC-9482
                  </p>
                  <div className="pt-1">
                    <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-black">
                      {selectedSlipToPrint.slipType === 'prescription'
                        ? 'طبی نسخہ (Rx Medical Prescription)'
                        : selectedSlipToPrint.slipType === 'lab_token'
                        ? 'لیب و ریڈیالوجی ٹوکن (Lab & Diagnostic Token)'
                        : selectedSlipToPrint.slipType === 'discharge_summary'
                        ? 'ڈسچارج سمری و حتمی بل (Discharge Summary)'
                        : 'او پی ڈی فیس سلپ (OPD Consultation Invoice)'}
                    </span>
                  </div>
                </div>

                {/* Patient & Token Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-300">
                  <div>
                    <span className="text-slate-500 font-bold">سلپ نمبر: </span>
                    <span className="font-mono font-black text-slate-900">#{selectedSlipToPrint.slipNumber}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 font-bold">ٹوکن نمبر: </span>
                    <span className="font-mono font-black text-emerald-800">#{selectedSlipToPrint.tokenNumber || '12'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold">مریض کا نام: </span>
                    <span className="font-black text-slate-900">{selectedSlipToPrint.patientName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 font-bold">فون نمبر: </span>
                    <span className="font-mono">{selectedSlipToPrint.patientPhone || '0300-1234567'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold">معالج / شعبہ: </span>
                    <span className="font-bold">{selectedSlipToPrint.doctorName || selectedSlipToPrint.department}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 font-bold">تاریخ و وقت: </span>
                    <span className="font-mono">{selectedSlipToPrint.date} {selectedSlipToPrint.timeSlot}</span>
                  </div>
                </div>

                {/* Diagnosis */}
                {selectedSlipToPrint.diagnosis && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-950">
                    <span className="font-bold text-emerald-900">تشخیص (Diagnosis): </span>
                    <span>{selectedSlipToPrint.diagnosis}</span>
                  </div>
                )}

                {/* Items / Prescription Table */}
                {selectedSlipToPrint.items && selectedSlipToPrint.items.length > 0 && (
                  <div className="border border-slate-300 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-right">
                      <thead className="bg-slate-800 text-white">
                        <tr>
                          <th className="p-2">شمار</th>
                          <th className="p-2">تفصیل / دوا / ٹیسٹ</th>
                          <th className="p-2">خوراک و ہدایات</th>
                          <th className="p-2 text-center">تعداد</th>
                          <th className="p-2 text-left font-mono">رقم</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {selectedSlipToPrint.items.map((it, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 text-slate-500 font-mono">{idx + 1}</td>
                            <td className="p-2 font-bold text-slate-900">{it.name}</td>
                            <td className="p-2 text-emerald-800 text-[11px]">{it.dosage || '-'}</td>
                            <td className="p-2 text-center font-mono">{it.qty || 1}</td>
                            <td className="p-2 text-left font-mono font-bold">Rs. {((it.price || 0) * (it.qty || 1)).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Totals */}
                {(selectedSlipToPrint.totalAmount !== undefined && selectedSlipToPrint.totalAmount > 0) && (
                  <div className="bg-slate-100 p-3 rounded-xl space-y-1 font-mono text-xs border border-slate-300">
                    <div className="flex justify-between">
                      <span>کل رقم (Total):</span>
                      <span>Rs. {selectedSlipToPrint.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700">
                      <span>ادا شدہ رقم (Paid):</span>
                      <span>Rs. {(selectedSlipToPrint.paidAmount || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-rose-700 font-black border-t border-slate-300 pt-1">
                      <span>بقایا رقم (Balance):</span>
                      <span>Rs. {(selectedSlipToPrint.balanceAmount || 0).toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {/* Instructions */}
                {selectedSlipToPrint.instructions && (
                  <div className="text-xs space-y-1 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-800">طبی ہدایات و پرہیز:</div>
                    <p className="leading-relaxed text-slate-600">{selectedSlipToPrint.instructions}</p>
                    {selectedSlipToPrint.precautions && (
                      <p className="text-rose-700 font-bold mt-1">پرہیز: {selectedSlipToPrint.precautions}</p>
                    )}
                  </div>
                )}

                {/* Signatures & Stamp */}
                <div className="flex justify-between items-end pt-6 border-t border-slate-300 text-[10px] text-slate-500">
                  <div className="text-center space-y-1">
                    <div className="w-24 border-b border-slate-400 mx-auto"></div>
                    <div>مریض / رشتہ دار کے دستخط</div>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="w-28 border-b-2 border-slate-800 mx-auto"></div>
                    <div className="font-bold text-slate-800">مجاز معالج / کلینک مہر</div>
                  </div>
                </div>

              </div>

            </div>

            {/* Modal Bottom Print Button */}
            <div className="bg-slate-100 p-3.5 border-t border-slate-200 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedSlipToPrint(null)}
                className="bg-white hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl border border-slate-300 text-xs"
              >
                بند کریں
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>پرنٹ سلپ (Print Slip)</span>
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
                  {/* DECLINE / CANCEL BUTTON */}
                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={declineCall}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-2xl transition-transform active:scale-95"
                      title={activeCall.mode === 'incoming' ? "مسترد کریں (Decline)" : "کال منقطع کریں (Cancel Call)"}
                    >
                      <PhoneOff className="w-8 h-8 sm:w-10 sm:h-10" />
                    </button>
                    <span className="text-xs font-bold text-rose-300">
                      {activeCall.mode === 'incoming' ? (isUrdu ? 'مسترد کریں' : 'Decline') : (isUrdu ? 'منقطع کریں' : 'Cancel')}
                    </span>
                  </div>

                  {/* ACCEPT BUTTON (FOR INCOMING CALLS) */}
                  {activeCall.mode === 'incoming' && (
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
                  )}
                </div>
              </div>
            ) : activeCall.type === 'video' ? (
              /* CONNECTED VIDEO CALL VIEW (WHATSAPP DUAL PIP STYLE WITH SWAP VIEW) */
              <div className="relative w-full h-[55vh] sm:h-[450px] max-h-[550px] rounded-3xl overflow-hidden bg-slate-950 border-2 border-slate-800 shadow-2xl flex flex-col items-center justify-center group">
                {/* MAIN SCREEN VIDEO FEED (Remote Participant by default, or Local if swapped) */}
                <div className="relative w-full h-full bg-slate-900 flex items-center justify-center overflow-hidden">
                  <video
                    ref={isSwappedVideo ? localVideoRef : remoteVideoRef}
                    autoPlay
                    playsInline
                    muted={isSwappedVideo}
                    className={`w-full h-full object-cover ${isSwappedVideo ? 'scale-x-[-1]' : ''}`}
                  />

                  {/* Fallback Screen for Main View if camera stream is off or remote stream hasn't arrived */}
                  {((!isSwappedVideo && (!remoteStreamState || remoteStreamState.getVideoTracks().length === 0)) ||
                    (isSwappedVideo && isVideoOff)) && (
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-950/60 flex flex-col items-center justify-center p-6 text-center">
                      <div className="relative mb-4">
                        <span className="absolute -inset-4 rounded-full bg-emerald-500/20 animate-ping"></span>
                        <img
                          src={isSwappedVideo ? (currentUser?.image || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600') : activeCall.contact.image}
                          alt={activeCall.contact.nameUrdu}
                          className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-amber-400 shadow-2xl relative z-10"
                        />
                      </div>
                      <div className="font-bold text-lg sm:text-xl text-white">
                        {isSwappedVideo ? userName : (isUrdu ? activeCall.contact.nameUrdu : activeCall.contact.nameEnglish)}
                      </div>
                      <div className="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>{isUrdu ? '📹 ایچ ڈی لائیو ویڈیو معائنہ آن لائن' : '📹 Live HD Video Consultation'}</span>
                      </div>
                    </div>
                  )}

                  {/* Top Info Tag in Video View */}
                  <div className="absolute top-3 left-3 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/60 text-white text-[11px] font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>
                      {isSwappedVideo
                        ? (isUrdu ? 'آپ کی سکرین (آپ کا کیمرہ)' : 'Your Camera (Main Screen)')
                        : (isUrdu ? `${activeCall.contact.nameUrdu} (لائیو ویڈیو)` : `${activeCall.contact.nameEnglish} (Live Video)`)}
                    </span>
                  </div>
                </div>

                {/* FLOATING PICTURE-IN-PICTURE (PiP) SMALL WINDOW (WhatsApp style - Tap to Swap!) */}
                <div
                  onClick={() => setIsSwappedVideo(!isSwappedVideo)}
                  className="absolute top-4 right-4 w-28 sm:w-36 h-36 sm:h-48 bg-slate-900 rounded-2xl border-2 border-amber-400 overflow-hidden shadow-2xl cursor-pointer hover:scale-105 transition-all z-20 group/pip"
                  title={isUrdu ? 'اسکرین تبدیل کرنے کے لیے ٹیپ کریں (Tap to Swap)' : 'Tap to Swap Screen'}
                >
                  <video
                    ref={isSwappedVideo ? remoteVideoRef : localVideoRef}
                    autoPlay
                    playsInline
                    muted={!isSwappedVideo}
                    className={`w-full h-full object-cover ${!isSwappedVideo ? 'scale-x-[-1]' : ''}`}
                  />

                  {/* PiP Overlay Fallback if video is off */}
                  {((!isSwappedVideo && isVideoOff) ||
                    (isSwappedVideo && (!remoteStreamState || remoteStreamState.getVideoTracks().length === 0))) && (
                    <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center p-2 text-center">
                      <User className="w-8 h-8 text-amber-300 mb-1" />
                      <span className="text-[10px] font-bold text-slate-300 truncate w-full px-1">
                        {!isSwappedVideo ? (isUrdu ? 'آپ کا کیمرہ' : 'Your Video') : (isUrdu ? activeCall.contact.nameUrdu : 'Remote')}
                      </span>
                    </div>
                  )}

                  {/* Small Tap-to-Swap Badge */}
                  <div className="absolute bottom-1 left-1 right-1 bg-slate-950/80 backdrop-blur-xs text-[9px] text-center font-bold text-amber-300 rounded py-0.5 px-1 truncate opacity-95 group-hover/pip:opacity-100">
                    🔄 {isUrdu ? 'تبدیل کریں' : 'Tap Swap'}
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

                <div className="text-center space-y-2">
                  <h3 className="font-black text-lg sm:text-xl text-white">
                    {isUrdu ? activeCall.contact.nameUrdu : activeCall.contact.nameEnglish}
                  </h3>
                  <p className="text-xs text-amber-300 font-semibold">{activeCall.contact.qualification}</p>
                  
                  {/* Live Speaker Voice Badge & Mode Indicator */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
                    <span className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
                      <Volume2 className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                      <span>{isDoctor ? (isUrdu ? '🗣️ مریض کی آواز اسپیکر سے آ رہی ہے' : '🗣️ Patient Remote Voice Active') : (isUrdu ? '🗣️ معالج کی آواز اسپیکر سے آ رہی ہے' : '🗣️ Doctor Remote Voice Active')}</span>
                    </span>

                    <span className={`border px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-sm ${
                      speakerMode === 'loudspeaker' ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 'bg-sky-500/20 text-sky-300 border-sky-500/50'
                    }`}>
                      {speakerMode === 'loudspeaker' ? <Volume2 className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
                      <span>{speakerMode === 'loudspeaker' ? (isUrdu ? '🔊 بڑا اسپیکر (100% Volume)' : '🔊 Loudspeaker (100% Vol)') : (isUrdu ? '📱 چھوٹا اسپیکر / ایئر پیس (30% Volume)' : '📱 Ear Speaker (30% Vol)')}</span>
                    </span>
                  </div>
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
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-3xl flex items-center justify-center gap-3 sm:gap-5 shadow-2xl flex-wrap">
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

              {/* Speaker Mode Toggle: Loudspeaker vs Ear Speaker (Bada vs Chhota Speaker) */}
              <button
                onClick={() => setSpeakerMode((prev) => (prev === 'loudspeaker' ? 'earpiece' : 'loudspeaker'))}
                className={`p-3.5 sm:p-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
                  speakerMode === 'loudspeaker'
                    ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg ring-2 ring-amber-300'
                    : 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg ring-2 ring-sky-400'
                }`}
                title={
                  speakerMode === 'loudspeaker'
                    ? (isUrdu ? 'چھوٹے اسپیکر (Earpiece) پر منتقل کریں' : 'Switch to Ear Speaker')
                    : (isUrdu ? 'بڑے اسپیکر (Loudspeaker) پر منتقل کریں' : 'Switch to Loudspeaker')
                }
              >
                {speakerMode === 'loudspeaker' ? (
                  <>
                    <Volume2 className="w-6 h-6 text-slate-950" />
                    <span className="text-xs font-black hidden sm:inline">{isUrdu ? 'بڑا اسپیکر' : 'Loudspeaker'}</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="w-6 h-6 text-white" />
                    <span className="text-xs font-black hidden sm:inline">{isUrdu ? 'چھوٹا اسپیکر' : 'Ear Speaker'}</span>
                  </>
                )}
              </button>

              {/* Camera Toggle Button (For Video Calls) */}
              {activeCall.type === 'video' && (
                <>
                  <button
                    onClick={() => setIsVideoOff(!isVideoOff)}
                    className={`p-3.5 sm:p-4 rounded-2xl font-bold transition-all ${
                      isVideoOff ? 'bg-rose-600 text-white shadow-lg' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                    title={isVideoOff ? 'کیمرہ آن کریں' : 'کیمرہ بند کریں'}
                  >
                    {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6 text-emerald-400" />}
                  </button>

                  {/* Swap Video Screen Button (Main vs PiP) */}
                  <button
                    onClick={() => setIsSwappedVideo(!isSwappedVideo)}
                    className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 font-bold transition-all flex items-center justify-center gap-1.5"
                    title={isUrdu ? 'اسکرین تبدیل کریں (Swap Screen)' : 'Swap Video Screen'}
                  >
                    <Smartphone className="w-6 h-6 text-amber-300" />
                    <span className="text-xs font-bold hidden sm:inline">{isUrdu ? 'تبدیل کریں' : 'Swap View'}</span>
                  </button>
                </>
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
                className="p-3.5 sm:p-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ml-1"
                title="کال ختم کریں"
              >
                <PhoneOff className="w-6 h-6" />
                <span className="hidden sm:inline text-xs font-bold">{isUrdu ? 'کال ختم کریں' : 'End Call'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Hidden Live Audio Stream Element for Call Speaker Output */}
      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />
    </div>
  );
};
