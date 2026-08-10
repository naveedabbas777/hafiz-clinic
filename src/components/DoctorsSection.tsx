import React from 'react';
import { Doctor } from '../types';
import { Stethoscope, Award, Clock, Phone, Calendar, ShieldCheck } from 'lucide-react';

interface DoctorsSectionProps {
  doctors: Doctor[];
  onOpenAppointment: (docName?: string) => void;
  language?: 'urdu' | 'english';
}

export const DoctorsSection: React.FC<DoctorsSectionProps> = ({ doctors, onOpenAppointment, language = 'english' }) => {
  const isUrdu = language === 'urdu';

  return (
    <section id="doctors" className="py-16 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 bg-amber-400 text-slate-950 px-3.5 py-1 rounded-full text-xs font-black">
            <Stethoscope className="w-4 h-4" />
            <span>{isUrdu ? 'تجربہ کار اور مستند معالجین' : 'Certified & Experienced Physicians'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {isUrdu ? 'ہمارے ڈاکٹرز اور کنسلٹنٹس (Our Doctors)' : 'Our Doctors & Medical Consultants'}
          </h2>
          <p className="text-slate-300 text-sm">
            {isUrdu
              ? 'حافظ کلینک پر آپ کے معائنے اور شفابخش علاج کے لیے MBBS مستند فزیشنز ہمہ وقت دستیاب ہیں۔'
              : 'Our PMDC-registered MBBS physicians bring over 15+ years of clinical excellence in internal medicine, neurology, and rehabilitation.'}
          </p>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {doctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl hover:border-emerald-500/50 transition-all flex flex-col sm:flex-row"
            >
              {/* Doctor Image */}
              <div className="sm:w-2/5 relative h-64 sm:h-auto overflow-hidden">
                <img
                  src={doc.image}
                  alt={isUrdu ? doc.nameUrdu : doc.nameEnglish}
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
                  <ShieldCheck className="w-3 h-3" />
                  <span>PMDC Registered</span>
                </div>
              </div>

              {/* Doctor Content */}
              <div className="sm:w-3/5 p-6 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded border border-amber-400/30">
                      {doc.qualification}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-white">{isUrdu ? doc.nameUrdu : doc.nameEnglish}</h3>
                  <p className="text-xs text-slate-400 font-semibold mb-3">{isUrdu ? doc.nameEnglish : doc.nameUrdu}</p>

                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex items-start gap-2">
                      <Award className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>{isUrdu ? 'تجربہ:' : 'Experience:'}</strong> {doc.experience}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Stethoscope className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>{isUrdu ? 'تخصص:' : 'Specialization:'}</strong> {isUrdu ? doc.specializationUrdu : doc.specializationEnglish}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div><strong>{isUrdu ? 'مارننگ ٹائمنگ:' : 'Morning Timings:'}</strong> {isUrdu ? doc.timingUrdu : (doc.timingEnglish || '8:00 AM - 2:00 PM')}</div>
                        {(doc.eveningTimingUrdu || doc.eveningTimingEnglish) && (
                          <div className="text-amber-300 font-semibold mt-0.5">
                            <strong>{isUrdu ? 'ایوننگ ٹائمنگ:' : 'Evening Timings:'}</strong> {isUrdu ? (doc.eveningTimingUrdu || doc.eveningTimingEnglish) : (doc.eveningTimingEnglish || doc.eveningTimingUrdu)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="pt-4 border-t border-slate-700/60 flex items-center gap-2">
                  <button
                    onClick={() => onOpenAppointment(isUrdu ? doc.nameUrdu : doc.nameEnglish)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'اپائنٹمنٹ بک کریں' : 'Book Appointment'}</span>
                  </button>
                  <a
                    href={`tel:${doc.phone}`}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold p-2.5 rounded-xl text-xs flex items-center justify-center"
                    title="Call Doctor"
                  >
                    <Phone className="w-4 h-4 text-amber-300" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
