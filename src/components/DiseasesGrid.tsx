import React, { useState } from 'react';
import { Disease } from '../types';
import { Activity, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface DiseasesGridProps {
  diseases: Disease[];
  onSelectDisease: (disease: Disease) => void;
  onOpenAppointment: (diseaseName?: string) => void;
  language?: 'urdu' | 'english';
}

export const DiseasesGrid: React.FC<DiseasesGridProps> = ({
  diseases,
  onSelectDisease,
  onOpenAppointment,
  language = 'english',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const isUrdu = language === 'urdu';

  const categories = [
    { id: 'all', labelUrdu: 'تمام بیماریاں', labelEnglish: 'All Diseases' },
    { id: 'pain', labelUrdu: 'درد اور مہرے', labelEnglish: 'Joint & Spine Pain' },
    { id: 'neurological', labelUrdu: 'اعصابی و فالج', labelEnglish: 'Neuro & Paralysis' },
    { id: 'kidney', labelUrdu: 'گردہ و پیشاب', labelEnglish: 'Kidney & Urinary' },
    { id: 'stomach', labelUrdu: 'معدہ و انہضام', labelEnglish: 'Gastric & Digestion' },
    { id: 'male', labelUrdu: 'مردانہ امراض', labelEnglish: 'Male Health' },
    { id: 'female', labelUrdu: 'زنانہ امراض', labelEnglish: 'Female Health' },
    { id: 'skin', labelUrdu: 'جلدی امراض', labelEnglish: 'Skin Disorders' },
    { id: 'general', labelUrdu: 'دیگر عام', labelEnglish: 'General Wellness' },
  ];

  const filteredDiseases = diseases.filter((dis) => {
    const matchesCategory = selectedCategory === 'all' || dis.category === selectedCategory;
    const matchesSearch =
      dis.nameUrdu.includes(searchQuery) ||
      dis.nameEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dis.shortDescUrdu.some((desc) => desc.includes(searchQuery));
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="diseases" className="py-16 bg-white text-slate-900">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-950 px-3.5 py-1 rounded-full text-xs font-black">
            <Activity className="w-4 h-4 text-emerald-700" />
            <span>{isUrdu ? 'تمام بیماریوں کے مکمل الگ صفحات' : 'Dedicated Disease Detail Pages'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {isUrdu
              ? 'اشتہار میں موجود تمام بیماریوں کی فہرست (Diseases Directory)'
              : 'Medical & Clinical Diseases Directory'}
          </h2>
          <p className="text-gray-600 text-sm">
            {isUrdu
              ? 'کسی بھی بیماری کے کارڈ پر کلک کر کے اس کی علامات، وجوہات اور شفابخش علاج کی تفصیل دیکھیں۔'
              : 'Click on any condition card below to read detailed symptoms, medical causes, and natural treatments.'}
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isUrdu
                  ? 'بیماری کا نام تلاش کریں (مثلاً: جوڑوں کا درد، فالج، شوگر...)'
                  : 'Search disease name (e.g. Joint Pain, Paralysis, Kidney Stone...)'
              }
              className={`w-full bg-slate-50 border border-slate-300 rounded-xl py-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 ${
                isUrdu ? 'pr-10 pl-4' : 'pl-10 pr-4'
              }`}
            />
            <Search className={`w-4 h-4 text-gray-400 absolute top-3.5 ${isUrdu ? 'right-3.5' : 'left-3.5'}`} />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center justify-center flex-wrap gap-2 text-xs font-bold">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {isUrdu ? cat.labelUrdu : cat.labelEnglish}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDiseases.map((dis) => {
            const displayImg = dis.image || dis.imageUrl;
            return (
              <div
                key={dis.id}
                onClick={() => onSelectDisease(dis)}
                className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  {displayImg && (
                    <div className="h-36 w-full overflow-hidden bg-slate-100 relative">
                      <img
                        src={displayImg}
                        alt={isUrdu ? dis.nameUrdu : dis.nameEnglish}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                      <span className="absolute bottom-2 left-2 right-2 text-white font-bold text-xs truncate drop-shadow-md">
                        {isUrdu ? dis.nameUrdu : dis.nameEnglish}
                      </span>
                    </div>
                  )}

                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {isUrdu ? dis.categoryUrdu : dis.nameEnglish.split(' ')[0]}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">{isUrdu ? dis.nameEnglish : dis.nameUrdu}</span>
                    </div>

                    <h3 className="text-base font-black text-slate-900 mb-1.5 group-hover:text-emerald-700 transition-colors">
                      {isUrdu ? `✔ ${dis.nameUrdu}` : dis.nameEnglish}
                    </h3>

                    <p className="text-xs text-gray-600 leading-relaxed mb-3 line-clamp-2">
                      {isUrdu ? dis.shortDescUrdu[0] : `Specialized diagnostic evaluation and effective treatments for ${dis.nameEnglish.toLowerCase()}.`}
                    </p>
                  </div>
                </div>

                <div className="px-4 pb-4 pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:text-emerald-800">
                  <span className="flex items-center gap-1">
                    {isUrdu ? 'مزید پڑھیں و علاج' : 'View Details & Treatment'}
                    {isUrdu ? (
                      <ChevronLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
                    ) : (
                      <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    )}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenAppointment(isUrdu ? dis.nameUrdu : dis.nameEnglish);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] px-2.5 py-1 rounded shadow"
                  >
                    {isUrdu ? 'اپائنٹمنٹ' : 'Book Appt'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredDiseases.length === 0 && (
          <div className="text-center py-12 text-gray-500 text-sm">
            {isUrdu
              ? 'آپ کے تلاش کردہ لفظ کے مطابق کوئی بیماری نہیں ملی۔ برائے مہربانی دوبارہ کوشش کریں۔'
              : 'No medical condition matches your search query. Please try searching with a different term.'}
          </div>
        )}
      </div>
    </section>
  );
};
