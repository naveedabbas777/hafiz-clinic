import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Maximize, Minimize, Users, Clock, ArrowRight, Activity, CheckCircle2, UserCheck, Play, Bell, AlertCircle, RefreshCw } from 'lucide-react';
import { OPDQueueToken, Doctor } from '../types';
import { getLocalQueueTokens, saveLocalQueueTokens, playChimeBell, announceTokenSpeech } from '../services/queueService';

interface Props {
  doctors: Doctor[];
  language: 'urdu' | 'english';
  clinicSettings?: any;
  onBackToApp?: () => void;
}

export function OpdQueueScreenView({ doctors, language, clinicSettings, onBackToApp }: Props) {
  const isUrdu = language === 'urdu';
  const [tokens, setTokens] = useState<OPDQueueToken[]>(getLocalQueueTokens());
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock interval
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync queue tokens listener
  useEffect(() => {
    const handleUpdate = () => {
      setTokens(getLocalQueueTokens());
    };
    window.addEventListener('opd_queue_updated', handleUpdate);
    return () => window.removeEventListener('opd_queue_updated', handleUpdate);
  }, []);

  const handleCallToken = (token: OPDQueueToken) => {
    const updated = tokens.map((t) => {
      if (t.id === token.id) return { ...t, status: 'Calling' as const };
      if (t.doctorId === token.doctorId && t.status === 'Calling') return { ...t, status: 'Waiting' as const };
      return t;
    });
    setTokens(updated);
    saveLocalQueueTokens(updated);

    if (isAudioEnabled) {
      announceTokenSpeech(token.tokenCode, token.patientName, token.doctorName);
    }
  };

  const handleStartConsultation = (tokenId: string) => {
    const updated = tokens.map((t) =>
      t.id === tokenId ? { ...t, status: 'In Consultation' as const } : t
    );
    setTokens(updated);
    saveLocalQueueTokens(updated);
  };

  const handleCompleteToken = (tokenId: string) => {
    const updated = tokens.map((t) =>
      t.id === tokenId ? { ...t, status: 'Completed' as const } : t
    );
    setTokens(updated);
    saveLocalQueueTokens(updated);
  };

  const handleSkipToken = (tokenId: string) => {
    const updated = tokens.map((t) =>
      t.id === tokenId ? { ...t, status: 'Skipped' as const } : t
    );
    setTokens(updated);
    saveLocalQueueTokens(updated);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const callingTokens = tokens.filter((t) => t.status === 'Calling' || t.status === 'In Consultation');
  const waitingTokens = tokens.filter((t) => t.status === 'Waiting');
  const completedTokens = tokens.filter((t) => t.status === 'Completed');

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans selection:bg-emerald-500 selection:text-white" dir={isUrdu ? 'rtl' : 'ltr'}>
      {/* Top TV Screen Header */}
      <header className="bg-slate-900 border-b border-emerald-900/60 px-6 py-4 flex flex-wrap justify-between items-center gap-4 shadow-xl shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-900/40">
            <Activity className="w-7 h-7 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>{clinicSettings?.clinicNameUrdu || 'حافظ کلینک اینڈ ہربل ہسپتال'}</span>
              <span className="text-xs font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                LIVE OPD QUEUE
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              {isUrdu ? 'لائیو ٹوکن ڈسپلے برائے ویٹنگ ایریا و استقبالیہ کاؤنٹر' : 'Live Patient Queue & Waiting Room Screen'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Live Digital Clock */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl px-4 py-2 text-center">
            <div className="text-lg font-black font-mono text-emerald-400">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              {currentTime.toLocaleDateString(isUrdu ? 'ur-PK' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>

          {/* Audio Alert Toggle */}
          <button
            type="button"
            onClick={() => {
              setIsAudioEnabled(!isAudioEnabled);
              if (!isAudioEnabled) playChimeBell();
            }}
            className={`p-3 rounded-2xl border transition-all ${
              isAudioEnabled
                ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300 hover:bg-emerald-900'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
            }`}
            title={isAudioEnabled ? 'آواز بند کریں (Mute)' : 'آواز کھولیں (Unmute)'}
          >
            {isAudioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Fullscreen TV Mode */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-2xl transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>

          {onBackToApp && (
            <button
              type="button"
              onClick={onBackToApp}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-2xl transition-all shadow-md"
            >
              {isUrdu ? '← واپس کلینک' : '← Back to Clinic'}
            </button>
          )}
        </div>
      </header>

      {/* Main Broadcast Grid */}
      <main className="flex-1 p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto">
        {/* Left / Center (Columns 7): NOW SERVING / ACTIVE CALLS */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border-2 border-emerald-500/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                </span>
                <h2 className="text-xl font-black text-emerald-400 tracking-wide uppercase">
                  {isUrdu ? 'معائنہ جاری ہے / اب تشریف لائیں' : 'Now Calling / In Consultation'}
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {callingTokens.length} {isUrdu ? 'مریض' : 'Active'}
              </span>
            </div>

            {callingTokens.length === 0 ? (
              <div className="text-center py-16 bg-slate-950/40 rounded-2xl border border-slate-800">
                <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3 animate-pulse" />
                <p className="text-lg font-bold text-slate-400">
                  {isUrdu ? 'اس وقت کوئی ٹوکن کال نہیں ہو رہا۔' : 'No active token currently being called.'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {isUrdu ? 'انتظار فرمائیں، ڈاکٹر جلد اگلے مریض کو طلب فرمائیں گے۔' : 'Please wait, doctors will call next in line.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {callingTokens.map((t) => (
                  <div
                    key={t.id}
                    className={`rounded-3xl p-5 border transition-all ${
                      t.status === 'Calling'
                        ? 'bg-gradient-to-b from-amber-500/20 to-slate-900 border-amber-400/80 ring-4 ring-amber-500/20 animate-pulse'
                        : 'bg-gradient-to-b from-emerald-500/20 to-slate-900 border-emerald-500/80 ring-2 ring-emerald-500/20'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-4xl font-black font-mono tracking-tight text-white drop-shadow-md">
                        {t.tokenCode}
                      </span>
                      <span
                        className={`text-[11px] font-black uppercase px-2.5 py-1 rounded-full border ${
                          t.status === 'Calling'
                            ? 'bg-amber-500 text-slate-950 border-amber-400 animate-bounce'
                            : 'bg-emerald-600 text-white border-emerald-400'
                        }`}
                      >
                        {t.status === 'Calling' ? (isUrdu ? 'طلب کیا گیا' : 'CALLING') : (isUrdu ? 'معائنہ جاری' : 'IN CABIN')}
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800">
                      <div className="text-lg font-black text-white">{t.patientName}</div>
                      <div className="text-xs text-emerald-300 font-bold mt-1">👨‍⚕️ {t.doctorName}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{t.department}</div>
                    </div>

                    {/* Quick Doctor Desk Controls */}
                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleCallToken(t)}
                        className="px-2.5 py-1.5 bg-amber-600/30 hover:bg-amber-600 text-amber-200 hover:text-white rounded-xl text-xs font-bold transition-all border border-amber-500/40 flex items-center gap-1"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        <span>{isUrdu ? 'دوبارہ بلائیں' : 'Recall'}</span>
                      </button>

                      {t.status === 'Calling' ? (
                        <button
                          type="button"
                          onClick={() => handleStartConsultation(t.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                        >
                          {isUrdu ? 'کمرے میں داخل' : 'Admit Patient'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleCompleteToken(t.id)}
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                        >
                          {isUrdu ? 'مکمل ہوا' : 'Mark Done'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Clinic Information & Announcements Ticker */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
            <span className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400">
              <AlertCircle className="w-5 h-5" />
            </span>
            <div className="text-xs text-slate-300 leading-relaxed">
              <strong>{isUrdu ? 'ضروری ہدایت:' : 'Important Notice:'}</strong>{' '}
              {isUrdu
                ? 'تمام محترم مریض اپنی باری پر ٹوکن نمبر اسکرین پر دیکھ کر متعلقہ ڈاکٹر کے کمرے میں تشریف لائیں۔ پرچی ساتھ رکھنا لازمی ہے۔'
                : 'Please check your token number on screen and proceed to the designated consultation room when called.'}
            </div>
          </div>
        </section>

        {/* Right (Columns 5): UPCOMING QUEUE LIST */}
        <section className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col">
          <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <span>{isUrdu ? 'اگلی قطار / انتظار گاہ' : 'Upcoming In Queue'}</span>
              </h3>
              <span className="text-xs text-slate-400">
                {waitingTokens.length} {isUrdu ? 'مریض منتظر ہیں' : 'Patients Waiting'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setTokens(getLocalQueueTokens())}
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
              title="Refresh Queue"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Waiting Tokens Scrollable List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[520px]">
            {waitingTokens.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                {isUrdu ? 'کوئی مریض قطار میں منتظر نہیں۔' : 'No patients currently in waiting list.'}
              </div>
            ) : (
              waitingTokens.map((w, idx) => (
                <div
                  key={w.id}
                  className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-3 flex items-center justify-between hover:border-emerald-700/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-slate-800 text-emerald-400 font-mono font-bold text-base flex items-center justify-center border border-slate-700">
                      #{w.tokenNumber}
                    </span>
                    <div>
                      <div className="font-bold text-white text-sm">{w.patientName}</div>
                      <div className="text-[11px] text-emerald-400 font-medium">👨‍⚕️ {w.doctorName}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>جاری وقت: {w.issueTime}</span>
                        <span>• انتظار: ~{w.estimatedWaitMins} منٹ</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCallToken(w)}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                      title={isUrdu ? 'اس مریض کو بلائیں' : 'Call Patient'}
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>{isUrdu ? 'بلائیں' : 'Call'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSkipToken(w.id)}
                      className="px-2 py-1.5 bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-200 rounded-xl text-xs transition-colors"
                      title="Skip / Absent"
                    >
                      {isUrdu ? 'غیر حاضر' : 'Skip'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Today's Completed Tally */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{isUrdu ? 'آج کل چیک شدہ مریض:' : 'Today Completed Patients:'}</span>
            </span>
            <span className="font-bold text-white font-mono">{completedTokens.length}</span>
          </div>
        </section>
      </main>
    </div>
  );
}
