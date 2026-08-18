import React, { useState, useMemo } from 'react';
import { X, Calendar, Clock, User, Phone, MapPin, CheckCircle, Sparkles, MessageCircle, ArrowRight, ShieldCheck, Stethoscope } from 'lucide-react';
import { analyzeSymptoms, TriageResult } from '../services/triageService';
import { openWhatsAppNotification } from '../utils/notificationDispatcher';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedDoctor?: string;
  preselectedDisease?: string;
  currentUser?: any;
  language?: 'urdu' | 'english';
  onAddAppointment?: (appointment: any) => void;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  preselectedDoctor = '',
  preselectedDisease = '',
  currentUser,
  language = 'urdu',
  onAddAppointment,
}) => {
  const isUrdu = language === 'urdu';
  const [patientName, setPatientName] = React.useState(currentUser?.fullName || currentUser?.name || '');
  const [phone, setPhone] = React.useState(currentUser?.phone || '');
  const [city, setCity] = React.useState(currentUser?.city || 'گوجرانوالہ');
  const [selectedDoctor, setSelectedDoctor] = React.useState(preselectedDoctor || 'ڈاکٹر زیشان چوہدری (MBBS)');
  const [problem, setProblem] = React.useState(preselectedDisease || 'جوڑوں اور مہروں کا درد');
  const [date, setDate] = React.useState(() => new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = React.useState('صبح 10:00 - 11:00');
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [submittedAppt, setSubmittedAppt] = React.useState<any>(null);

  // Real-Time AI Symptom Triage Analysis
  const triageResult: TriageResult | null = useMemo(() => {
    return analyzeSymptoms(problem);
  }, [problem]);

  React.useEffect(() => {
    if (currentUser) {
      if (!patientName) setPatientName(currentUser.fullName || currentUser.name || '');
      if (!phone) setPhone(currentUser.phone || '');
      if (currentUser.city) setCity(currentUser.city);
    }
  }, [currentUser]);

  React.useEffect(() => {
    if (preselectedDoctor) setSelectedDoctor(preselectedDoctor);
    if (preselectedDisease) setProblem(preselectedDisease);
  }, [preselectedDoctor, preselectedDisease]);

  if (!isOpen) return null;

  const handleApplyTriage = (triage: TriageResult) => {
    setSelectedDoctor(triage.recommendedDoctor);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !phone) {
      alert(isUrdu ? 'برائے مہربانی اپنا نام اور فون نمبر لازمی درج کریں۔' : 'Please enter your name and phone number.');
      return;
    }

    const tokenNumber = Math.floor(1 + Math.random() * 25);
    const newApp = {
      id: `APP-${Math.floor(100000 + Math.random() * 900000)}`,
      patientId: currentUser?.id || currentUser?._id || undefined,
      patientName,
      phone,
      city,
      doctorName: selectedDoctor,
      problem,
      date,
      timeSlot,
      tokenNumber,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    if (onAddAppointment) {
      onAddAppointment(newApp);
    }

    setSubmittedAppt(newApp);
    setIsSubmitted(true);
  };

  const handleSendWhatsAppNotification = () => {
    if (!submittedAppt) return;
    openWhatsAppNotification({
      type: 'appointment_confirm',
      recipientPhone: submittedAppt.phone,
      recipientName: submittedAppt.patientName,
      doctorName: submittedAppt.doctorName,
      tokenNumber: submittedAppt.tokenNumber,
      date: submittedAppt.date,
      timeSlot: submittedAppt.timeSlot,
    }, isUrdu ? 'urdu' : 'english');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white p-6 sticky top-0 z-10 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-black">آن لائن اپائنٹمنٹ بکنگ (Book Appointment)</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full bg-white/10 hover:bg-white/20">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {isSubmitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-9 h-9" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-black text-emerald-950">
                  {isUrdu ? 'آپ کی اپائنٹمنٹ کامیابی سے بک ہو گئی ہے!' : 'Appointment Successfully Booked!'}
                </h4>
                <p className="text-xs text-slate-600">
                  {isUrdu
                    ? 'آپ کو او پی ڈی قطار میں خودکار ٹوکن نمبر الاٹ کر دیا گیا ہے۔'
                    : 'A sequential OPD queue token has been automatically generated for your visit.'}
                </p>
              </div>

              {submittedAppt && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-semibold text-slate-800 space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="text-slate-500">{isUrdu ? 'مریض کا نام:' : 'Patient:'}</span>
                    <strong className="text-slate-900">{submittedAppt.patientName}</strong>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="text-slate-500">{isUrdu ? 'او پی ڈی ٹوکن نمبر:' : 'OPD Token:'}</span>
                    <span className="bg-emerald-700 text-white font-mono font-black px-3 py-1 rounded-lg text-sm">
                      #{submittedAppt.tokenNumber || '1'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="text-slate-500">{isUrdu ? 'معالج / شعبہ:' : 'Doctor:'}</span>
                    <strong className="text-emerald-800">{submittedAppt.doctorName}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">{isUrdu ? 'تاریخ و وقت:' : 'Date & Slot:'}</span>
                    <span>{submittedAppt.date} ({submittedAppt.timeSlot})</span>
                  </div>
                </div>
              )}

              {/* 1-Click WhatsApp Token Dispatch */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleSendWhatsAppNotification}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{isUrdu ? 'اپائنٹمنٹ ٹوکن اپنے واٹس ایپ پر حاصل کریں' : 'Receive Token on WhatsApp'}</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-2xl text-xs transition-colors"
                >
                  {isUrdu ? 'بند کریں' : 'Close Window'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-800">
              {currentUser && (
                <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center justify-between text-emerald-900">
                  <div className="flex items-center gap-2 font-bold">
                    <User className="w-4 h-4 text-emerald-700" />
                    <span>
                      {isUrdu ? 'تصدیق شدہ مریض:' : 'Verified Patient:'}{' '}
                      <span className="text-emerald-800 font-black">{currentUser.fullName || currentUser.name}</span>
                    </span>
                  </div>
                  <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {isUrdu ? 'لاگ ان فعال' : 'Logged In'}
                  </span>
                </div>
              )}

              <div>
                <label className="block mb-1 font-bold">مریض کا پورا نام (Patient Name) *</label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="اپنا نام لکھیں"
                  className="w-full p-2.5 border rounded-lg bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-bold">موبائل نمبر (Phone) *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="03001234567"
                    className="w-full p-2.5 border rounded-lg bg-slate-50 font-mono"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-bold">شہر (City)</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 border rounded-lg bg-slate-50"
                  />
                </div>
              </div>

              {/* Problem / Symptoms with Real-time AI Triage */}
              <div>
                <label className="block mb-1 font-bold">بیماری یا معائنے کی نوعیت (Problem / Symptoms)</label>
                <input
                  type="text"
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="مثلاً: جوڑوں کا درد، فالج، کمپیوٹر آئی ٹیسٹ، بالوں کا گرنا..."
                  className="w-full p-2.5 border rounded-lg bg-slate-50"
                />
              </div>

              {/* AI Triage Recommendation Card */}
              {triageResult && (
                <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-emerald-300 rounded-2xl p-3.5 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-emerald-900 font-black text-xs">
                      <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                      <span>{isUrdu ? 'طبی تشخیص و شعبہ کی خودکار تجویز (Smart AI Triage)' : 'AI Clinical Routing'}</span>
                    </div>
                    <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {triageResult.urgencyUrdu}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    {triageResult.adviceUrdu}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-emerald-200">
                    <div className="text-[11px] text-emerald-950 font-bold">
                      {isUrdu ? 'تجویز کردہ ڈاکٹر:' : 'Recommended:'}{' '}
                      <span className="text-emerald-800 font-extrabold">{triageResult.recommendedDoctor}</span>
                    </div>
                    {selectedDoctor !== triageResult.recommendedDoctor && (
                      <button
                        type="button"
                        onClick={() => handleApplyTriage(triageResult)}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                      >
                        <span>{isUrdu ? 'تجویز لاگو کریں' : 'Apply'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block mb-1 font-bold">ڈاکٹر کا انتخاب کریں (Select Doctor)</label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="w-full p-2.5 border rounded-lg bg-slate-50 font-bold text-emerald-900"
                >
                  <option value="ڈاکٹر زیشان چوہدری (MBBS)">ڈاکٹر زیشان چوہدری (MBBS) - Senior Physician & Eye Specialist</option>
                  <option value="ڈاکٹر وقاص صغیر چوہدری (MBBS)">ڈاکٹر وقاص صغیر چوہدری (MBBS) - Physiotherapist & Spine Care</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-bold">معائنے کی تاریخ (Date)</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2.5 border rounded-lg bg-slate-50 font-mono"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-bold">وقت (Time Slot)</label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full p-2.5 border rounded-lg bg-slate-50 font-medium"
                  >
                    <option value="صبح 09:00 - 10:00">صبح 09:00 - 10:00</option>
                    <option value="صبح 10:00 - 11:00">صبح 10:00 - 11:00</option>
                    <option value="صبح 11:00 - 12:00">صبح 11:00 - 12:00</option>
                    <option value="دوپہر 02:00 - 03:00">دوپہر 02:00 - 03:00</option>
                    <option value="شام 05:00 - 06:00">شام 05:00 - 06:00</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-xl text-xs shadow-md transition-transform hover:scale-[1.01] cursor-pointer"
              >
                {isUrdu ? 'اپائنٹمنٹ کی تصدیق کریں (Confirm Booking)' : 'Confirm Appointment'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
