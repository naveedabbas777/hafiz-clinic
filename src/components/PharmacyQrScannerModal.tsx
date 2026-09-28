import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import {
  Camera,
  X,
  RefreshCw,
  Zap,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Barcode,
  QrCode,
  User,
  Pill,
  Sparkles,
  Info,
  Maximize2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { PharmacyBatchItem } from '../types';

interface PharmacyQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  batches: PharmacyBatchItem[];
  pendingDoctorRxList: any[];
  onScannedPatient: (rx: any) => void;
  onScannedMedicine: (batch: PharmacyBatchItem) => void;
  onScannedRawQuery: (query: string) => void;
  isUrdu?: boolean;
}

export const PharmacyQrScannerModal: React.FC<PharmacyQrScannerModalProps> = ({
  isOpen,
  onClose,
  batches,
  pendingDoctorRxList,
  onScannedPatient,
  onScannedMedicine,
  onScannedRawQuery,
  isUrdu = true,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [lastScannedResult, setLastScannedResult] = useState<{
    code: string;
    type: 'patient' | 'medicine' | 'raw';
    title: string;
    subtitle: string;
    timestamp: number;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [continuousMode, setContinuousMode] = useState<boolean>(true);

  const animationFrameId = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastScannedCodeRef = useRef<string>('');
  const lastScannedTimeRef = useRef<number>(0);

  // Play audio chime when QR/Barcode detected
  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.1); // A6 chirp

      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);

      if (navigator.vibrate) {
        navigator.vibrate([40, 20, 40]);
      }
    } catch (_) {}
  };

  // Start Camera Stream
  const startCamera = async () => {
    stopCamera();
    setErrorMessage('');
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setHasCameraPermission(true);
        startScanningLoop();
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setHasCameraPermission(false);
      if (err.name === 'NotAllowedError') {
        setErrorMessage(
          isUrdu
            ? 'کیمرہ کی اجازت مسترد کر دی گئی ہے۔ براہ کرم براؤزر سیٹنگز میں کیمرہ کی اجازت دیں۔'
            : 'Camera permission denied. Please allow camera access in browser settings.'
        );
      } else {
        setErrorMessage(
          isUrdu
            ? 'کیمرہ شروع کرنے میں دشواری پیش آئی ہے۔ آپ نیچے سے نمونہ کیو آر کوڈز یا فائل اپلوڈ استعمال کر سکتے ہیں۔'
            : 'Could not access camera. You can use test tokens or upload a QR image below.'
        );
      }
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setLastScannedResult(null);
    }
    return () => stopCamera();
  }, [isOpen, facingMode]);

  // Frame Scanning Loop using jsQR
  const startScanningLoop = () => {
    const scanFrame = () => {
      if (!videoRef.current || !canvasRef.current) {
        animationFrameId.current = requestAnimationFrame(scanFrame);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Run jsQR
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });

        if (code && code.data) {
          const now = Date.now();
          const trimmedCode = code.data.trim();

          // Debounce: prevent re-triggering same code within 2.5 seconds
          if (trimmedCode !== lastScannedCodeRef.current || now - lastScannedTimeRef.current > 2500) {
            lastScannedCodeRef.current = trimmedCode;
            lastScannedTimeRef.current = now;
            handleDetectedCode(trimmedCode);
          }
        }
      }

      animationFrameId.current = requestAnimationFrame(scanFrame);
    };

    animationFrameId.current = requestAnimationFrame(scanFrame);
  };

  // Process Scanned Data: Determine if it's a Patient MRN Token, Medicine Label, or Raw Query
  const handleDetectedCode = (rawPayload: string) => {
    setIsProcessing(true);
    playBeep();

    let cleanQuery = rawPayload.trim();

    // Check if JSON payload (e.g. {"mrn":"MRN-84920"} or {"type":"patient","mrn":"MRN-6543"})
    if (cleanQuery.startsWith('{') && cleanQuery.endsWith('}')) {
      try {
        const parsed = JSON.parse(cleanQuery);
        if (parsed.mrn || parsed.token || parsed.patientId) {
          cleanQuery = parsed.mrn || parsed.token || parsed.patientId;
        } else if (parsed.barcode || parsed.batch || parsed.sku) {
          cleanQuery = parsed.barcode || parsed.batch || parsed.sku;
        }
      } catch (_) {}
    }

    // Also check URL parameters e.g. https://.../?mrn=MRN-6543 or ?barcode=8964000123
    if (cleanQuery.includes('?')) {
      try {
        const urlParams = new URLSearchParams(cleanQuery.split('?')[1]);
        if (urlParams.has('mrn')) cleanQuery = urlParams.get('mrn')!;
        else if (urlParams.has('token')) cleanQuery = urlParams.get('token')!;
        else if (urlParams.has('barcode')) cleanQuery = urlParams.get('barcode')!;
        else if (urlParams.has('batch')) cleanQuery = urlParams.get('batch')!;
      } catch (_) {}
    }

    const queryLower = cleanQuery.toLowerCase();
    const queryDigits = cleanQuery.replace(/\D/g, '');

    // 1. MATCH PATIENT MRN / DOCTOR PRESCRIPTION TOKEN
    const matchedRx = pendingDoctorRxList.find((rx) => {
      const tok = (rx.tokenNumber || '').toLowerCase();
      const tokDigits = tok.replace(/\D/g, '');
      const mrn = (rx.mrnNumber || '').toLowerCase();
      const mrnDigits = mrn.replace(/\D/g, '');
      const ph = (rx.phone || '').replace(/\D/g, '');

      return (
        tok === queryLower ||
        (queryDigits && tokDigits === queryDigits) ||
        mrn === queryLower ||
        (queryDigits && mrnDigits === queryDigits) ||
        (queryDigits && ph.includes(queryDigits)) ||
        (rx.patientName && rx.patientName.toLowerCase().includes(queryLower))
      );
    });

    if (matchedRx) {
      setLastScannedResult({
        code: cleanQuery,
        type: 'patient',
        title: matchedRx.patientName || 'Patient Found',
        subtitle: `Token: ${matchedRx.tokenNumber || 'TK'} • MRN: ${matchedRx.mrnNumber || 'MRN'} (${matchedRx.medicinesList?.length || 0} Prescribed Items)`,
        timestamp: Date.now(),
      });

      onScannedPatient(matchedRx);

      if (!continuousMode) {
        setTimeout(() => onClose(), 1200);
      }
      setIsProcessing(false);
      return;
    }

    // 2. MATCH MEDICINE LABEL / BATCH BARCODE
    const matchedBatch = batches.find((b) => {
      const barcodeMatch = b.barcode && b.barcode.trim() === cleanQuery;
      const batchNumberMatch = b.batchNumber.toLowerCase() === queryLower;
      const productIdMatch = b.productId.toLowerCase() === queryLower;
      const nameMatch =
        b.productNameEnglish.toLowerCase() === queryLower ||
        b.productNameUrdu.toLowerCase() === queryLower;

      return barcodeMatch || batchNumberMatch || productIdMatch || nameMatch;
    });

    if (matchedBatch) {
      setLastScannedResult({
        code: cleanQuery,
        type: 'medicine',
        title: isUrdu ? matchedBatch.productNameUrdu : matchedBatch.productNameEnglish,
        subtitle: `Batch: ${matchedBatch.batchNumber} • Stock: ${matchedBatch.currentStock} • Rs. ${matchedBatch.salePricePKR}`,
        timestamp: Date.now(),
      });

      onScannedMedicine(matchedBatch);

      if (!continuousMode) {
        setTimeout(() => onClose(), 1200);
      }
      setIsProcessing(false);
      return;
    }

    // 3. RAW QUERY SEARCH FALLBACK
    setLastScannedResult({
      code: cleanQuery,
      type: 'raw',
      title: isUrdu ? `سرچ انکوائری: ${cleanQuery}` : `Search Query: ${cleanQuery}`,
      subtitle: isUrdu ? 'فارمیسی انوینٹری میں خودکار تلاش کی گئی ہے' : 'Inventory filtered for this scanned text.',
      timestamp: Date.now(),
    });

    onScannedRawQuery(cleanQuery);
    setIsProcessing(false);
  };

  // Handle Image File Upload (Scan QR from photo)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth',
          });

          if (code && code.data) {
            handleDetectedCode(code.data);
          } else {
            alert(
              isUrdu
                ? 'تصویر میں کوئی واضح کیو آر کوڈ یا بارکوڈ نہیں مل سکا۔ براہ کرم واضح تصویر منتخب کریں۔'
                : 'No clear QR code or barcode found in this image. Please try another.'
            );
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div
        className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        dir={isUrdu ? 'rtl' : 'ltr'}
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight">
                  {isUrdu ? 'کیمرہ کیو آر و بارکوڈ اسکینر' : 'Camera QR & Barcode Scanner'}
                </h3>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                  Live Feed
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isUrdu
                  ? 'مریض کے نسخہ ٹوکن (MRN) یا دواؤں کے لیبل کو کیمرے کے سامنے لائیں'
                  : 'Point camera at Patient MRN tokens or Medicine barcodes'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute Chime' : 'Enable Chime'}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scanner Viewport Section */}
        <div className="p-4 sm:p-5 space-y-4 flex-1 overflow-y-auto">
          {/* Video Container with Reticle */}
          <div className="relative w-full aspect-video sm:aspect-4/3 max-h-[300px] bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 flex items-center justify-center shadow-inner">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              muted
              playsInline
            />
            {/* Hidden canvas for jsQR analysis */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Target Reticle Overlay with Corner Markers */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
              <div className="relative w-48 sm:w-60 h-48 sm:h-60 border-2 border-emerald-400/40 rounded-3xl overflow-hidden shadow-2xl">
                {/* 4 Corner Accents */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />

                {/* Animated Horizontal Laser Scanner Line */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-[bounce_2s_infinite]" />
              </div>
            </div>

            {/* Live Camera Controls Floating Overlay */}
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <button
                onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
                className="bg-slate-900/80 hover:bg-slate-900 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                title="Switch Camera (Front/Back)"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isUrdu ? 'کیمرہ بدلیں' : 'Switch'}</span>
              </button>
            </div>

            {/* Camera Permission / Error Banner */}
            {hasCameraPermission === false && (
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
                <AlertTriangle className="w-10 h-10 text-amber-400" />
                <p className="text-xs text-slate-300 max-w-sm leading-relaxed">
                  {errorMessage || (isUrdu ? 'کیمرہ دستیاب نہیں ہے۔' : 'Camera stream unavailable.')}
                </p>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={startCamera}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'دوبارہ کوشش کریں' : 'Retry Camera'}</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isUrdu ? 'تصویر اپلوڈ کریں' : 'Upload Image'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Scanned Result Live Feedback Banner */}
          {lastScannedResult && (
            <div
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                lastScannedResult.type === 'patient'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 ring-2 ring-emerald-500/20'
                  : lastScannedResult.type === 'medicine'
                  ? 'bg-purple-50 border-purple-300 text-purple-950 ring-2 ring-purple-500/20'
                  : 'bg-blue-50 border-blue-300 text-blue-950 ring-2 ring-blue-500/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                    lastScannedResult.type === 'patient'
                      ? 'bg-emerald-600 text-white'
                      : lastScannedResult.type === 'medicine'
                      ? 'bg-purple-600 text-white'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {lastScannedResult.type === 'patient' ? (
                    <User className="w-5 h-5" />
                  ) : lastScannedResult.type === 'medicine' ? (
                    <Pill className="w-5 h-5" />
                  ) : (
                    <Barcode className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        lastScannedResult.type === 'patient'
                          ? 'bg-emerald-200 text-emerald-900'
                          : lastScannedResult.type === 'medicine'
                          ? 'bg-purple-200 text-purple-900'
                          : 'bg-blue-200 text-blue-900'
                      }`}
                    >
                      {lastScannedResult.type === 'patient'
                        ? isUrdu
                          ? 'مریض کا نسخہ لوڈ ہو گیا'
                          : 'Patient Rx Loaded'
                        : lastScannedResult.type === 'medicine'
                        ? isUrdu
                          ? 'دوا کارٹ میں شامل'
                          : 'Medicine Added to Cart'
                        : isUrdu
                        ? 'انوینٹری فلٹر'
                        : 'Record Filtered'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      Code: {lastScannedResult.code}
                    </span>
                  </div>
                  <h4 className="text-sm font-black mt-0.5">{lastScannedResult.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{lastScannedResult.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          )}

          {/* Quick Upload / File Scan Action */}
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <Upload className="w-4 h-4 text-emerald-700" />
              <span className="font-bold">
                {isUrdu ? 'تصویر سے کیو آر اسکین کریں:' : 'Scan from Photo or Receipt:'}
              </span>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white hover:bg-slate-100 text-slate-800 font-bold px-3 py-1.5 rounded-xl border border-slate-300 shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>{isUrdu ? 'تصویر منتخب کریں' : 'Choose Image'}</span>
              </button>
            </div>
          </div>

          {/* Quick Simulation / Test Tokens for Immediate Pharmacist Testing */}
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{isUrdu ? 'فوری ٹیسٹ کیو آر کوڈز (Simulate Scan):' : 'Quick Test Tokens (Simulate Scan):'}</span>
              </span>
              <span className="text-[10px] text-slate-400">1-Click Test</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Token 1: Patient Rx TK-101 */}
              <button
                type="button"
                onClick={() => handleDetectedCode('MRN-6543')}
                className="bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-950 p-2.5 rounded-xl text-right transition-all cursor-pointer flex flex-col"
              >
                <div className="flex justify-between items-center text-[10px] font-bold text-emerald-800 mb-0.5">
                  <span>{isUrdu ? 'مریض ٹوکن' : 'Patient Token'}</span>
                  <span className="font-mono bg-emerald-200/80 text-emerald-900 px-1.5 rounded">MRN-6543</span>
                </div>
                <span className="text-xs font-bold truncate">محمد فاروق (Muhammad Farooq)</span>
                <span className="text-[10px] text-emerald-700 mt-0.5">۳ ادویات کا نسخہ (TK-101)</span>
              </button>

              {/* Token 2: Patient Rx TK-102 */}
              <button
                type="button"
                onClick={() => handleDetectedCode('MRN-4321')}
                className="bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-950 p-2.5 rounded-xl text-right transition-all cursor-pointer flex flex-col"
              >
                <div className="flex justify-between items-center text-[10px] font-bold text-emerald-800 mb-0.5">
                  <span>{isUrdu ? 'مریض ٹوکن' : 'Patient Token'}</span>
                  <span className="font-mono bg-emerald-200/80 text-emerald-900 px-1.5 rounded">MRN-4321</span>
                </div>
                <span className="text-xs font-bold truncate">چوہدری بشیر احمد (Ch. Bashir)</span>
                <span className="text-[10px] text-emerald-700 mt-0.5">۳ ادویات کا نسخہ (TK-102)</span>
              </button>

              {/* Medicine Barcode 1 */}
              <button
                type="button"
                onClick={() => handleDetectedCode('BATCH-JOINT-01')}
                className="bg-purple-50 hover:bg-purple-100/80 border border-purple-200 text-purple-950 p-2.5 rounded-xl text-right transition-all cursor-pointer flex flex-col"
              >
                <div className="flex justify-between items-center text-[10px] font-bold text-purple-800 mb-0.5">
                  <span>{isUrdu ? 'دوا لیبل' : 'Medicine Label'}</span>
                  <span className="font-mono bg-purple-200/80 text-purple-900 px-1.5 rounded">BATCH-JOINT-01</span>
                </div>
                <span className="text-xs font-bold truncate">روغن مفاصل خاص (Joint Oil)</span>
                <span className="text-[10px] text-purple-700 mt-0.5">Rs. 850 • اسٹاک میں موجود</span>
              </button>

              {/* Medicine Barcode 2 */}
              <button
                type="button"
                onClick={() => handleDetectedCode('BAT-702')}
                className="bg-purple-50 hover:bg-purple-100/80 border border-purple-200 text-purple-950 p-2.5 rounded-xl text-right transition-all cursor-pointer flex flex-col"
              >
                <div className="flex justify-between items-center text-[10px] font-bold text-purple-800 mb-0.5">
                  <span>{isUrdu ? 'دوا لیبل' : 'Medicine Label'}</span>
                  <span className="font-mono bg-purple-200/80 text-purple-900 px-1.5 rounded">BAT-702</span>
                </div>
                <span className="text-xs font-bold truncate">ہربل شوگر کنٹرول پاؤڈر</span>
                <span className="text-[10px] text-purple-700 mt-0.5">Rs. 950 • اسٹاک میں موجود</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={continuousMode}
              onChange={(e) => setContinuousMode(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
            />
            <span>{isUrdu ? 'مسلسل اسکیننگ موڈ (ایک ساتھ کئی بارکوڈز اسکین کریں)' : 'Continuous Scan Mode (Scan multiple items)'}</span>
          </label>

          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            {isUrdu ? 'مکمل کریں و بند کریں' : 'Done & Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
