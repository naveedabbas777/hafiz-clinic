import React, { useState, useMemo } from 'react';
import { Search, Globe, Code, FileCode, Check, Copy, Settings, ShieldCheck, Download, RefreshCw, Layers, ExternalLink } from 'lucide-react';
import {
  generateSitemapXml,
  downloadSitemapFile,
  generateRobotsTxt,
  getSitemapSummary,
  DEFAULT_CLINIC_DOMAIN,
} from '../services/sitemapGenerator';

interface SeoToolsViewProps {
  language?: 'urdu' | 'english';
}

export const SeoToolsView: React.FC<SeoToolsViewProps> = ({ language = 'english' }) => {
  const isUrdu = language === 'urdu';
  const [copied, setCopied] = useState<string | null>(null);
  const [customDomain, setCustomDomain] = useState<string>(DEFAULT_CLINIC_DOMAIN);

  const schemaJson = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    "name": "Hafiz Clinic & Vision Center (حافظ کلینک)",
    "alternateName": "حافظ کلینک اینڈ ہربل ہیلتھ کیئر",
    "url": customDomain,
    "logo": `${customDomain}/icons/icon-512x512.png`,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+92-300-6428789",
      "contactType": "Customer Service",
      "areaServed": "PK",
      "availableLanguage": ["Urdu", "English"]
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Near Al-Habib Bakery, Wazirabad Road",
      "addressLocality": "Gujranwala",
      "addressRegion": "Punjab",
      "postalCode": "52250",
      "addressCountry": "PK"
    },
    "medicalSpecialty": ["GeneralPractice", "Physiotherapy", "Optometry", "Pathology"],
    "priceRange": "$$"
  };

  // Dynamically generated sitemap, robots, and audit summary
  const sitemapXml = useMemo(() => generateSitemapXml({ domain: customDomain }), [customDomain]);
  const robotsTxt = useMemo(() => generateRobotsTxt(customDomain), [customDomain]);
  const sitemapSummary = useMemo(() => getSitemapSummary({ domain: customDomain }), [customDomain]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen text-slate-900">
      <div className="max-w-5xl mx-auto px-4 space-y-8">
        {/* Banner */}
        <div className="bg-gradient-to-r from-teal-950 via-emerald-900 to-slate-900 text-white p-8 rounded-3xl shadow-xl">
          <span className="bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full inline-block mb-2">
            {isUrdu ? 'سرچ انجن آپٹمائزیشن (SEO Settings)' : 'Search Engine Optimization & Meta Engine'}
          </span>
          <h1 className="text-3xl font-black">
            {isUrdu ? 'SEO میٹا ٹیگز، اسکیمہ ڈاٹا اور ڈائنامک سائٹ میپ' : 'SEO Meta Tags, Schema.org & Dynamic Sitemap'}
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1">
            {isUrdu
              ? 'گوگل سرچ انجن کی مکمل انڈیکسنگ کے لیے خودکار ڈائنامک sitemap.xml، طبی بلاگ، ہربل پراڈکٹس اور بیماریوں کے علاج کا مکمل ریکارڈ۔'
              : 'Dynamic sitemap.xml generator indexing all clinical departments, herbal products, medical articles, and diseases for Google & Bing.'}
          </p>

          {/* Domain Selector */}
          <div className="mt-6 flex flex-wrap items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
            <span className="text-xs text-white/80 font-bold">{isUrdu ? 'بیس ڈومین URL:' : 'Active Domain URL:'}</span>
            <input
              type="text"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              className="bg-white text-slate-900 text-xs px-3 py-1.5 rounded-xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 min-w-[240px]"
              placeholder="https://hafizclinic.com"
            />
            <button
              onClick={() => downloadSitemapFile('sitemap.xml', { domain: customDomain })}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black px-4 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer ml-auto"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'ڈاؤنلوڈ sitemap.xml' : 'Download sitemap.xml'}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Sitemap Summary Cards */}
        <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-700" />
                <span>{isUrdu ? 'ڈائنامک انڈیکس سمری (Active Routes Overview)' : 'Live Sitemap Coverage & Route Breakdown'}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isUrdu ? 'کلینک کی تمام فعال لنکس جو سرچ بوٹس کے لیے خودکار طور پر تیار کی گئی ہیں۔' : 'Total unique URLs dynamically indexed for search engine spiders.'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-emerald-700">{sitemapSummary.totalUrls}</span>
              <span className="text-xs text-slate-500 block">{isUrdu ? 'کل انڈیکس شدہ لنکس' : 'Total Indexed URLs'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-center">
              <span className="text-lg font-black text-emerald-900 block">{sitemapSummary.categories.core}</span>
              <span className="text-[11px] font-bold text-emerald-700">{isUrdu ? 'بنیادی پیجز' : 'Core Pages'}</span>
            </div>
            <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl text-center">
              <span className="text-lg font-black text-blue-900 block">{sitemapSummary.categories.services}</span>
              <span className="text-[11px] font-bold text-blue-700">{isUrdu ? 'طبی شعبہ جات' : 'Services'}</span>
            </div>
            <div className="bg-purple-50 border border-purple-100 p-3 rounded-xl text-center">
              <span className="text-lg font-black text-purple-900 block">{sitemapSummary.categories.store}</span>
              <span className="text-[11px] font-bold text-purple-700">{isUrdu ? 'ہربل پراڈکٹس' : 'Store Items'}</span>
            </div>
            <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl text-center">
              <span className="text-lg font-black text-rose-900 block">{sitemapSummary.categories.diseases}</span>
              <span className="text-[11px] font-bold text-rose-700">{isUrdu ? 'بیماریاں و علاج' : 'Diseases'}</span>
            </div>
            <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl text-center">
              <span className="text-lg font-black text-amber-900 block">{sitemapSummary.categories.articles}</span>
              <span className="text-[11px] font-bold text-amber-700">{isUrdu ? 'طبی مضامین' : 'Articles'}</span>
            </div>
          </div>
        </div>

        {/* SEO Live Meta Cards */}
        <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm space-y-4">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-700" />
            <span>{isUrdu ? 'گوگل سرچ رزلٹ پریویو (Google Search Preview)' : 'Google Search Result Preview'}</span>
          </h2>

          <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 space-y-1 font-sans">
            <div className="text-xs text-slate-600 flex items-center gap-1">
              <span>{customDomain}</span>
              <span className="text-gray-400">› Hafiz Clinic</span>
            </div>
            <h3 className="text-base text-blue-700 font-bold hover:underline cursor-pointer">
              {isUrdu
                ? 'حافظ کلینک — ڈاکٹر زیشان و ڈاکٹر وقاص | کمپیوٹرائزڈ چیک اپ و فزیوتھراپی'
                : 'Hafiz Clinic — Dr. Zeeshan & Dr. Waqas | Eye Care, Physio & Lab'}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {isUrdu
                ? 'پنجاب ہیلتھ کیئر کمیشن سے منظور شدہ حافظ کلینک۔ جدید کمپیوٹرائزڈ آئی اسکین، فزیوتھراپی، ہوراب ہربل ہیئر آئل، بیوٹی کریم اور آن لائن اپائنٹمنٹ۔'
                : 'Punjab Healthcare Commission accredited medical clinic. Computerized eye test, blue cut glasses, herbal skin/hair remedies, physiotherapy, and lab reports.'}
            </p>
          </div>
        </div>

        {/* Schema JSON-LD */}
        <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Code className="w-5 h-5 text-emerald-700" />
              <span>{isUrdu ? 'اسکیما ڈیٹا (Schema.org JSON-LD)' : 'Structured Data (Schema.org JSON-LD)'}</span>
            </h2>
            <button
              onClick={() => copyToClipboard(JSON.stringify(schemaJson, null, 2), 'schema')}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1 cursor-pointer"
            >
              {copied === 'schema' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied === 'schema' ? 'Copied' : 'Copy JSON'}</span>
            </button>
          </div>
          <pre className="bg-slate-900 text-emerald-300 p-4 rounded-xl text-xs overflow-x-auto font-mono">
            {JSON.stringify(schemaJson, null, 2)}
          </pre>
        </div>

        {/* Sitemap & Robots */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-emerald-700" />
                  <span>sitemap.xml (Dynamic)</span>
                </h2>
                <span className="text-[10px] text-emerald-700 font-bold block">{sitemapSummary.totalUrls} active URLs generated</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadSitemapFile('sitemap.xml', { domain: customDomain })}
                  className="text-xs text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 cursor-pointer"
                  title="Download File"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => copyToClipboard(sitemapXml, 'sitemap')}
                  className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  {copied === 'sitemap' ? 'Copied' : 'Copy XML'}
                </button>
              </div>
            </div>
            <pre className="bg-slate-900 text-gray-200 p-3 rounded-xl text-xs overflow-x-auto font-mono h-48">
              {sitemapXml}
            </pre>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Settings className="w-4 h-4 text-emerald-700" />
                <span>robots.txt</span>
              </h2>
              <button
                onClick={() => copyToClipboard(robotsTxt, 'robots')}
                className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
              >
                {copied === 'robots' ? 'Copied' : 'Copy Robots'}
              </button>
            </div>
            <pre className="bg-slate-900 text-gray-200 p-3 rounded-xl text-xs overflow-x-auto font-mono h-48">
              {robotsTxt}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
