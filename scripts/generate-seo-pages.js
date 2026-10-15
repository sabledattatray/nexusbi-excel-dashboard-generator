import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');
const indexHtmlPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexHtmlPath)) {
  console.error(`Error: ${indexHtmlPath} not found. Run "vite build" first.`);
  process.exit(1);
}

const baseHtml = fs.readFileSync(indexHtmlPath, 'utf-8');

const pages = [
  {
    slug: 'excel-dashboard-generator',
    title: 'Excel Dashboard Generator Online | Automated KPI Reports',
    description: 'Generate automated Excel dashboards online with live formulas, charts, and executive KPI summaries from CSV or Excel data. Free in-browser generator.',
    canonical: 'https://excel.dattasable.com/excel-dashboard-generator',
    h1: 'Excel Dashboard Generator Online – Free Automated KPI & MIS Reports',
    metaHeading: 'Excel Dashboard Generator Online',
  },
  {
    slug: 'mis-report-generator',
    title: 'Excel MIS Report Generator | Automated MIS Reporting Tool',
    description: 'Automate your monthly MIS reports in Excel. Generate multi-tab executive workbooks with SUMIFS formulas, pivot summaries, and KPI trackers without coding.',
    canonical: 'https://excel.dattasable.com/mis-report-generator',
    h1: 'Excel MIS Report Generator – Automated MIS Reporting Tool',
    metaHeading: 'Automated MIS Reporting in Excel',
  },
  {
    slug: 'sales-dashboard',
    title: 'Excel Sales Dashboard Generator | ARR & Revenue Analytics',
    description: 'Create professional Excel sales dashboards automatically. Track ARR, Net Revenue Retention, customer cohorts, and sales velocity with native formulas.',
    canonical: 'https://excel.dattasable.com/sales-dashboard',
    h1: 'Excel Sales Dashboard Generator – Track ARR, Revenue & Sales KPIs',
    metaHeading: 'Excel Sales Dashboard & Revenue Analytics',
  },
  {
    slug: 'hr-dashboard',
    title: 'Excel HR Dashboard Generator | Workforce & Headcount Analytics',
    description: 'Generate interactive Excel HR dashboards for employee retention, headcount growth, attrition rates, and compensation analytics with live formulas.',
    canonical: 'https://excel.dattasable.com/hr-dashboard',
    h1: 'Excel HR Dashboard Generator – Workforce & Headcount Analytics',
    metaHeading: 'Excel HR & Workforce Dashboard',
  },
  {
    slug: 'financial-dashboard',
    title: 'Excel Financial Dashboard Generator | Banking & Performance Reports',
    description: 'Build automated financial performance dashboards in Excel. Monitor loan originations, net interest margins, portfolio yields, and financial statements.',
    canonical: 'https://excel.dattasable.com/financial-dashboard',
    h1: 'Excel Financial Dashboard Generator – Financial Performance Reports',
    metaHeading: 'Excel Financial & Performance Dashboard',
  },
  {
    slug: 'kpi-dashboard',
    title: 'KPI Dashboard Generator Online | Interactive Business Reports',
    description: 'Turn spreadsheet metrics into interactive KPI scorecards and downloadable Excel dashboards with dynamic charts, variance tracking, and native formulas.',
    canonical: 'https://excel.dattasable.com/kpi-dashboard',
    h1: 'KPI Dashboard Generator Online – Interactive Business Reports',
    metaHeading: 'Interactive KPI Dashboard Generator',
  },
  {
    slug: 'excel-dashboard-examples',
    title: 'Excel Dashboard Examples & Free Templates | excel.dattasable.com',
    description: 'Explore real interactive Excel dashboard examples for SaaS, Healthcare, Retail, Finance, and Manufacturing. Downloadable workbooks with live formulas.',
    canonical: 'https://excel.dattasable.com/excel-dashboard-examples',
    h1: 'Excel Dashboard Examples – Free Pre-Built Industry Templates',
    metaHeading: 'Excel Dashboard Examples & Industry Models',
  },
];

for (const page of pages) {
  let customizedHtml = baseHtml;

  // Replace title
  customizedHtml = customizedHtml.replace(
    /<title>.*?<\/title>/s,
    `<title>${page.title}</title>`
  );

  // Replace canonical
  customizedHtml = customizedHtml.replace(
    /<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i,
    `<link rel="canonical" href="${page.canonical}" />`
  );

  // Replace meta description
  customizedHtml = customizedHtml.replace(
    /<meta\s+name="description"\s+content=".*?"\s*\/?>/i,
    `<meta name="description" content="${page.description}" />`
  );

  // Replace OpenGraph Title & Description
  customizedHtml = customizedHtml.replace(
    /<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:title" content="${page.title}" />`
  );
  customizedHtml = customizedHtml.replace(
    /<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:description" content="${page.description}" />`
  );
  customizedHtml = customizedHtml.replace(
    /<meta\s+property="og:url"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:url" content="${page.canonical}" />`
  );

  // Replace Twitter Title & Description
  customizedHtml = customizedHtml.replace(
    /<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:title" content="${page.title}" />`
  );
  customizedHtml = customizedHtml.replace(
    /<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:description" content="${page.description}" />`
  );

  // Replace H1 in pre-rendered crawler fallback
  customizedHtml = customizedHtml.replace(
    /<h1[^>]*>.*?<\/h1>/s,
    `<h1 style="font-size: 28px; font-weight: 800; color: #064e3b; margin-bottom: 8px;">${page.h1}</h1>`
  );

  const targetDir = path.join(distDir, page.slug);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const outputPath = path.join(targetDir, 'index.html');
  fs.writeFileSync(outputPath, customizedHtml, 'utf-8');
  console.log(`✓ Generated static SEO page: dist/${page.slug}/index.html`);
}

console.log('Successfully generated all 7 static SEO landing pages!');
