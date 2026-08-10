import React from 'react';
import { Disease } from '../types';
import { X, CheckCircle, AlertTriangle, Stethoscope, Calendar, Phone, MessageCircle } from 'lucide-react';

interface DiseaseDetailModalProps {
  disease: Disease | null;
  onClose: () => void;
  onOpenAppointment: (diseaseName: string) => void;
  language?: 'urdu' | 'english';
}

export const DiseaseDetailModal: React.FC<DiseaseDetailModalProps> = ({
  disease,
  onClose,
  onOpenAppointment,
  language = 'english',
}) => {
  if (!disease) return null;

  const isUrdu = language === 'urdu';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white p-6 sticky top-0 z-10 flex justify-between items-start">
          <div>
            <span className="text-[10px] font-black bg-amber-400 text-emerald-950 px-2.5 py-0.5 rounded-full mb-2 inline-block">
              {isUrdu ? disease.categoryUrdu : disease.nameEnglish.split(' ')[0]}
            </span>
            <h2 className="text-2xl font-black">{isUrdu ? disease.nameUrdu : disease.nameEnglish}</h2>
            <p className="text-xs text-emerald-200">{isUrdu ? disease.nameEnglish : disease.nameUrdu}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-slate-800 text-xs sm:text-sm">
          {(disease.image || disease.imageUrl) && (
            <div className="w-full h-48 sm:h-56 rounded-2xl overflow-hidden shadow border border-slate-200">
              <img
                src={disease.image || disease.imageUrl}
                alt={isUrdu ? disease.nameUrdu : disease.nameEnglish}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* Overview */}
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
            <h3 className="font-bold text-emerald-950 text-base mb-1">
              {isUrdu ? 'تفصیل و جائزہ' : 'Overview & Description'}
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {isUrdu ? disease.shortDescUrdu[0] : `Specialized diagnostic evaluation and treatment procedures for ${disease.nameEnglish.toLowerCase()} at Hafiz Clinic.`}
            </p>
          </div>

          {/* Symptoms */}
          <div>
            <h3 className="font-bold text-slate-900 text-base mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>{isUrdu ? 'عام علامات (Symptoms)' : 'Common Clinical Symptoms'}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-medium">
              {disease.symptomsUrdu.map((sym, idx) => (
                <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-gray-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span>{sym}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Causes */}
          <div>
            <h3 className="font-bold text-slate-900 text-base mb-2 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-emerald-600" />
              <span>{isUrdu ? 'وجوہات (Causes)' : 'Medical Causes'}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-medium">
              {disease.causesUrdu.map((cause, idx) => (
                <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-gray-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                  <span>{cause}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Treatment */}
          <div>
            <h3 className="font-bold text-slate-900 text-base mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>{isUrdu ? 'حافظ کلینک کا علاج (Treatment Procedure)' : 'Hafiz Clinic Specialized Treatment'}</span>
            </h3>
            <div className="bg-emerald-900 text-white p-4 rounded-2xl space-y-2">
              {disease.treatmentUrdu.map((trt, idx) => (
                <div key={idx} className="flex items-center gap-2 text-emerald-100">
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{trt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap gap-3">
            <button
              onClick={() => {
                onClose();
                onOpenAppointment(isUrdu ? disease.nameUrdu : disease.nameEnglish);
              }}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow"
            >
              <Calendar className="w-4 h-4" />
              <span>{isUrdu ? 'اس بیماری کے لیے اپائنٹمنٹ لیں' : 'Book Appointment for this Condition'}</span>
            </button>
            <a
              href="https://wa.me/923001234567"
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-100 text-emerald-900 hover:bg-emerald-200 font-bold py-3 px-4 rounded-xl flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-emerald-700" />
              <span>{isUrdu ? 'واٹس ایپ مشورہ' : 'WhatsApp Chat'}</span>
            </a>
            <a
              href="tel:+923001234567"
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 px-4 rounded-xl flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>Call Now</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
