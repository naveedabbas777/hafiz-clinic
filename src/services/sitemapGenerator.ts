import { initialDiseases, initialProducts, initialArticles } from '../data/initialData';
import { Disease, Product, HealthArticle } from '../types';

export interface SitemapRouteItem {
  loc: string;
  lastmod?: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  category: 'core' | 'store' | 'diseases' | 'articles' | 'services';
  title?: string;
  titleUrdu?: string;
  imageUrl?: string;
}

export interface SitemapGeneratorOptions {
  domain?: string;
  products?: Product[];
  diseases?: Disease[];
  articles?: HealthArticle[];
  includeHashUrls?: boolean;
  includeImages?: boolean;
}

// Default base domain for Hafiz Clinic
export const DEFAULT_CLINIC_DOMAIN = 'https://hafizclinic.com';

/**
 * Resolves current active domain based on environment or user configuration.
 */
export function resolveCurrentDomain(customDomain?: string): string {
  if (customDomain && customDomain.trim()) {
    return customDomain.trim().replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    // If not localhost or preview, use the current origin
    if (!window.location.origin.includes('localhost') && !window.location.origin.includes('127.0.0.1')) {
      return window.location.origin.replace(/\/+$/, '');
    }
  }
  return DEFAULT_CLINIC_DOMAIN;
}

/**
 * Escapes characters to ensure 100% valid XML output.
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generates an array of all active and indexable routes across the Hafiz Clinic application.
 */
export function getSitemapRoutes(options: SitemapGeneratorOptions = {}): SitemapRouteItem[] {
  const domain = resolveCurrentDomain(options.domain);
  const today = new Date().toISOString().split('T')[0];

  const productsList = options.products && options.products.length > 0 ? options.products : initialProducts;
  const diseasesList = options.diseases && options.diseases.length > 0 ? options.diseases : initialDiseases;
  const articlesList = options.articles && options.articles.length > 0 ? options.articles : initialArticles;

  const routes: SitemapRouteItem[] = [
    // -------------------------------------------------------------------------
    // 1. Home & Primary Clinical Pillar Routes
    // -------------------------------------------------------------------------
    {
      loc: `${domain}/`,
      lastmod: today,
      changefreq: 'daily',
      priority: 1.0,
      category: 'core',
      title: 'Hafiz Clinic & Healthcare System — Home',
      titleUrdu: 'حافظ کلینک — ہوم پیج و بنیادی طبی خدمات',
    },
    {
      loc: `${domain}/#services`,
      lastmod: today,
      changefreq: 'weekly',
      priority: 0.9,
      category: 'services',
      title: 'Specialized Medical Services & OPD Departments',
      titleUrdu: 'طبی خدمات و سپیشلائزڈ او پی ڈی شعبہ جات',
    },
    {
      loc: `${domain}/#eyecare`,
      lastmod: today,
      changefreq: 'weekly',
      priority: 0.85,
      category: 'services',
      title: 'Hafiz Vision Center — Computerized Optical Diagnostics',
      titleUrdu: 'حافظ ویژن سینٹر — آنکھوں کا کمپیوٹرائزڈ معائنہ',
    },
    {
      loc: `${domain}/#physiotherapy`,
      lastmod: today,
      changefreq: 'weekly',
      priority: 0.85,
      category: 'services',
      title: 'Physiotherapy & Rehabilitation Center',
      titleUrdu: 'فزیوتھراپی و مہروں کی بحالی کا مرکز',
    },
    {
      loc: `${domain}/#appointment`,
      lastmod: today,
      changefreq: 'daily',
      priority: 0.85,
      category: 'core',
      title: 'Book Doctor Appointment & OPD Token',
      titleUrdu: 'آن لائن ڈاکٹر اپائنٹمنٹ و او پی ڈی ٹوکن',
    },
    {
      loc: `${domain}/#lab-reports`,
      lastmod: today,
      changefreq: 'daily',
      priority: 0.8,
      category: 'services',
      title: 'Pathology & Diagnostic Laboratory Reports',
      titleUrdu: 'پیتھالوجی لیب و تشخیصی رپورٹس',
    },
    {
      loc: `${domain}/#patient-portal`,
      lastmod: today,
      changefreq: 'weekly',
      priority: 0.75,
      category: 'core',
      title: 'Patient Portal & Telemedicine Records',
      titleUrdu: 'مریض پورٹل و ڈیجیٹل ہیلتھ ریکارڈز',
    },
    {
      loc: `${domain}/#faq`,
      lastmod: today,
      changefreq: 'monthly',
      priority: 0.7,
      category: 'core',
      title: 'Frequently Asked Questions (FAQ)',
      titleUrdu: 'عام پوچھے جانے والے سوالات',
    },

    // -------------------------------------------------------------------------
    // 2. Online Herbal Store & Products
    // -------------------------------------------------------------------------
    {
      loc: `${domain}/#store`,
      lastmod: today,
      changefreq: 'daily',
      priority: 0.9,
      category: 'store',
      title: 'Online Herbal Pharmacy & Store',
      titleUrdu: 'آن لائن ہربل اسٹور و قدرتی ادویات',
    },
  ];

  // Dynamic Product Items
  productsList.forEach((prod) => {
    const prodTitle = prod.nameEnglish || (prod as any).name || prod.nameUrdu || 'Herbal Product';
    routes.push({
      loc: `${domain}/#store?product=${encodeURIComponent(prod.id)}`,
      lastmod: today,
      changefreq: 'weekly',
      priority: 0.8,
      category: 'store',
      title: `${prodTitle} (${prod.category || 'Herbal Remedy'})`,
      titleUrdu: prod.nameUrdu || prodTitle,
      imageUrl: prod.image,
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Medical Encyclopedia & Disease Treatments
  // ---------------------------------------------------------------------------
  routes.push({
    loc: `${domain}/#diseases`,
    lastmod: today,
    changefreq: 'weekly',
    priority: 0.9,
    category: 'diseases',
    title: 'Medical Diseases & Advanced Herbal Treatments',
    titleUrdu: 'بیماریاں اور جدید طریقہ علاج',
  });

  // Dynamic Disease Items
  diseasesList.forEach((dis) => {
    const disTitle = dis.nameEnglish || (dis as any).name_en || dis.nameUrdu || 'Medical Disease';
    routes.push({
      loc: `${domain}/#diseases?disease=${encodeURIComponent(dis.id)}`,
      lastmod: today,
      changefreq: 'monthly',
      priority: 0.85,
      category: 'diseases',
      title: `${disTitle} — Diagnosis & Treatment`,
      titleUrdu: `${dis.nameUrdu || disTitle} — تشخیص و علاج`,
      imageUrl: dis.imageUrl || dis.image,
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Physician Articles & Medical Research Blog
  // ---------------------------------------------------------------------------
  routes.push({
    loc: `${domain}/#articles`,
    lastmod: today,
    changefreq: 'daily',
    priority: 0.9,
    category: 'articles',
    title: 'Medical Health Articles & Preventive Guidelines',
    titleUrdu: 'طبی معلوماتی مضامین و رہنمائی',
  });

  // Dynamic Article Items
  articlesList.forEach((art) => {
    routes.push({
      loc: `${domain}/#articles?article=${encodeURIComponent(art.id)}`,
      lastmod: today,
      changefreq: 'monthly',
      priority: 0.8,
      category: 'articles',
      title: art.titleEnglish || art.titleUrdu,
      titleUrdu: art.titleUrdu,
      imageUrl: art.imageUrl,
    });
  });

  return routes;
}

/**
 * Generates dynamic, SEO-compliant sitemap.xml content matching Google & Bing Sitemaps 0.9 standard.
 */
export function generateSitemapXml(options: SitemapGeneratorOptions = {}): string {
  const routes = getSitemapRoutes(options);
  const includeImages = options.includeImages !== false;

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`;

  if (includeImages) {
    xml += `\n        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"`;
  }
  xml += `\n        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

  routes.forEach((route) => {
    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(route.loc)}</loc>\n`;
    if (route.lastmod) {
      xml += `    <lastmod>${route.lastmod}</lastmod>\n`;
    }
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority.toFixed(2)}</priority>\n`;

    // Google Image Extension support for products and articles
    if (includeImages && route.imageUrl && route.imageUrl.startsWith('http')) {
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${escapeXml(route.imageUrl)}</image:loc>\n`;
      if (route.title) {
        xml += `      <image:title>${escapeXml(route.title)}</image:title>\n`;
      }
      if (route.titleUrdu) {
        xml += `      <image:caption>${escapeXml(route.titleUrdu)}</image:caption>\n`;
      }
      xml += `    </image:image>\n`;
    }

    xml += `  </url>\n`;
  });

  xml += `</urlset>\n`;
  return xml;
}

/**
 * Triggers a browser download of the dynamically generated sitemap.xml file.
 */
export function downloadSitemapFile(filename = 'sitemap.xml', options: SitemapGeneratorOptions = {}): void {
  if (typeof window === 'undefined') return;

  const xmlContent = generateSitemapXml(options);
  const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates an optimized robots.txt content referencing the active sitemap.
 */
export function generateRobotsTxt(domain?: string): string {
  const resolvedDomain = resolveCurrentDomain(domain);
  return `# ==============================================================================
# Hafiz Clinic & Vision Center (حافظ کلینک)
# Robots.txt Automated Search Engine Crawling Instructions
# ==============================================================================

User-agent: *
Allow: /
Allow: /#services
Allow: /#store
Allow: /#diseases
Allow: /#articles
Allow: /#eyecare
Allow: /#physiotherapy
Allow: /#faq
Allow: /#appointment

# Restrict private administrative endpoints and internal portals
Disallow: /admin
Disallow: /api/
Disallow: /doctor-portal/
Disallow: /pharmacy-pos/
Disallow: /pathology-lab/
Disallow: /ipd-ward/

# Official XML Sitemap Directive
Sitemap: ${resolvedDomain}/sitemap.xml
`;
}

/**
 * Computes an analytical breakdown of sitemap routes for webmasters and audit dashboards.
 */
export function getSitemapSummary(options: SitemapGeneratorOptions = {}) {
  const routes = getSitemapRoutes(options);
  const categories: Record<string, number> = {
    core: 0,
    store: 0,
    diseases: 0,
    articles: 0,
    services: 0,
  };

  routes.forEach((r) => {
    categories[r.category] = (categories[r.category] || 0) + 1;
  });

  return {
    totalUrls: routes.length,
    categories,
    domain: resolveCurrentDomain(options.domain),
    generatedAt: new Date().toISOString(),
  };
}
