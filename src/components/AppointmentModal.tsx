import React, { useState } from 'react';
import { X, Calendar, Clock, User, Phone, MapPin, CheckCircle } from 'lucide-react';

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
  const [date, setDate] = React.useState('2026-08-09');
  const [timeSlot, setTimeSlot] = React.useState('صبح 10:00 - 11:00');
  const [isSubmitted, setIsSubmitted] = React.useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !phone) {
      alert(isUrdu ? 'برائے مہربانی اپنا نام اور فون نمبر لازمی درج کریں۔' : 'Please enter your name and phone number.');
      return;
    }

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
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    if (onAddAppointment) {
      onAddAppointment(newApp);
    }

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 3500);
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
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-black text-emerald-950">آپ کی اپائنٹمنٹ کامیابی سے بک ہو گئی ہے!</h4>
              <p className="text-xs text-gray-600">
                حافظ کلینک کا عملہ چند منٹ میں آپ کو کال کر کے وقت کی حتمی تصدیق کرے گا۔
              </p>
              <div className="bg-slate-100 p-3 rounded-xl text-xs font-mono font-bold text-slate-800">
                Booking ID: APP-{Math.floor(100000 + Math.random() * 900000)}
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
                    className="w-full p-2.5 border rounded-lg bg-slate-50"
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

              <div>
                <label className="block mb-1 font-bold">ڈاکٹر کا انتخاب کریں (Select Doctor)</label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="w-full p-2.5 border rounded-lg bg-slate-50 font-bold text-emerald-900"
                >
                  <option value="ڈاکٹر زیشان چوہدری (MBBS)">ڈاکٹر زیشان چوہدری (MBBS) - Senior Physician</option>
                  <option value="ڈاکٹر وقاص صغیر چوہدری (MBBS)">ڈاکٹر وقاص صغیر چوہدری (MBBS) - Physiotherapist</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-bold">بیماری یا معائنے کی نوعیت (Problem)</label>
                <input
                  type="text"
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="مثلاً: جوڑوں کا درد، فالج، کمپیوٹر آئی ٹیسٹ..."
                  className="w-full p-2.5 border rounded-lg bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-bold">معائنے کی تاریخ (Date)</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2.5 border rounded-lg bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-bold">وقت (Time Slot)</label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full p-2.5 border rounded-lg bg-slate-50"
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
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl text-xs shadow-md transition-transform hover:scale-[1.01]"
              >
                اپائنٹمنٹ کی تصدیق کریں (Confirm Appointment)
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
