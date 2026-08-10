import React, { useState } from 'react';
import { Search, Globe, Code, FileCode, Check, Copy, Settings, ShieldCheck } from 'lucide-react';

interface SeoToolsViewProps {
  language?: 'urdu' | 'english';
}

export const SeoToolsView: React.FC<SeoToolsViewProps> = ({ language = 'english' }) => {
  const isUrdu = language === 'urdu';
  const [copied, setCopied] = useState<string | null>(null);

  const schemaJson = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    "name": "Hafiz Clinic & Vision Center (حافظ کلینک)",
    "alternateName": "حافظ کلینک اینڈ ہربل ہیلتھ کیئر",
    "url": "https://hafizclinic.com",
    "logo": "https://hafizclinic.com/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+92-300-1234567",
      "contactType": "Customer Service",
      "areaServed": "PK",
      "availableLanguage": ["Urdu", "English"]
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Main GT Road, Near City Center",
      "addressLocality": "Lahore",
      "addressRegion": "Punjab",
      "postalCode": "54000",
      "addressCountry": "PK"
    },
    "medicalSpecialty": ["GeneralPractice", "Physiotherapy", "Optometry", "Dermatology"],
    "priceRange": "$$"
  };

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://hafizclinic.com/</loc><priority>1.0</priority><changefreq>daily</changefreq></url>
  <url><loc>https://hafizclinic.com/#services</loc><priority>0.9</priority><changefreq>weekly</changefreq></url>
  <url><loc>https://hafizclinic.com/#eyecare</loc><priority>0.8</priority><changefreq>weekly</changefreq></url>
  <url><loc>https://hafizclinic.com/#store</loc><priority>0.8</priority><changefreq>daily</changefreq></url>
  <url><loc>https://hafizclinic.com/#patient-portal</loc><priority>0.7</priority></url>
  <url><loc>https://hafizclinic.com/#lab-reports</loc><priority>0.7</priority></url>
</urlset>`;

  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /doctor-portal/private/

Sitemap: https://hafizclinic.com/sitemap.xml`;

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
            {isUrdu ? 'SEO میٹا ٹیگز، اسکیمہ ڈاٹا اور سائٹ میپ' : 'SEO Meta Tags, Schema.org & Sitemap Manager'}
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1">
            {isUrdu
              ? 'گوگل سرچ انجن کی رینکنگ کے لیے میٹا ٹائٹل، میٹا ڈسکرپشن، اور JSON-LD میڈیکل کلینک اسکیما ڈیٹا۔'
              : 'Google search meta configurations, JSON-LD Structured Data, XML Sitemap, and Robots.txt specifications.'}
          </p>
        </div>

        {/* SEO Live Meta Cards */}
        <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm space-y-4">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-700" />
            <span>{isUrdu ? 'گوگل سرچ رزلٹ پریویو (Google Search Preview)' : 'Google Search Result Preview'}</span>
          </h2>

          <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 space-y-1 font-sans">
            <div className="text-xs text-slate-600 flex items-center gap-1">
              <span>https://hafizclinic.com</span>
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
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1"
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
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-700" />
                <span>sitemap.xml</span>
              </h2>
              <button
                onClick={() => copyToClipboard(sitemapXml, 'sitemap')}
                className="text-xs text-emerald-700 font-bold hover:underline"
              >
                {copied === 'sitemap' ? 'Copied' : 'Copy Sitemap'}
              </button>
            </div>
            <pre className="bg-slate-900 text-gray-200 p-3 rounded-xl text-xs overflow-x-auto font-mono h-40">
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
                className="text-xs text-emerald-700 font-bold hover:underline"
              >
                {copied === 'robots' ? 'Copied' : 'Copy Robots'}
              </button>
            </div>
            <pre className="bg-slate-900 text-gray-200 p-3 rounded-xl text-xs overflow-x-auto font-mono h-40">
              {robotsTxt}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
