import React, { useState } from 'react';
import { FAQItem } from '../types';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface FAQSectionProps {
  faqs: FAQItem[];
  language?: 'urdu' | 'english';
}

export const FAQSection: React.FC<FAQSectionProps> = ({ faqs, language = 'english' }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const isUrdu = language === 'urdu';

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-16 bg-white text-slate-900">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-950 px-3.5 py-1 rounded-full text-xs font-black">
            <HelpCircle className="w-4 h-4 text-emerald-700" />
            <span>{isUrdu ? '20 اہم سوالات و جوابات' : '20 Essential Clinical FAQs'}</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900">
            {isUrdu ? 'بار بار پوچھے جانے والے سوالات (FAQ)' : 'Frequently Asked Questions'}
          </h2>
          <p className="text-gray-600 text-sm">
            {isUrdu ? 'مریضوں کی رہنمائی اور کلینک سروسز سے متعلق عمومی سوالات' : 'Patient guidance regarding consultation timings, treatments, home delivery, and checkups'}
          </p>
        </div>

        {/* FAQs Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.id}
                className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 transition-all"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className={`w-full p-4.5 flex items-center justify-between font-bold text-slate-900 text-sm hover:bg-slate-100 transition-colors ${
                    isUrdu ? 'text-right' : 'text-left'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-[11px] flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <span>{isUrdu ? faq.questionUrdu : (faq.questionEnglish || faq.questionUrdu)}</span>
                  </span>
                  {isOpen ? <ChevronUp className="w-5 h-5 text-emerald-700" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-gray-700 border-t border-slate-200/80 bg-white leading-relaxed">
                    {isUrdu ? faq.answerUrdu : (faq.answerEnglish || faq.answerUrdu)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
