import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

await build({ entryPoints: ['scripts/prerender-entry.tsx'], outfile: '.prerender/entry.mjs', bundle: true, platform: 'node', format: 'esm', packages: 'external', loader: { '.css': 'empty' }, define: { 'process.env.NODE_ENV': '"production"' } });
const { renderPage, extraPaths = [] } = await import(pathToFileURL(path.resolve('.prerender/entry.mjs')).href);
const base = await fs.readFile('dist/index.html', 'utf8');
const xml = await fs.readFile('public/sitemap.xml', 'utf8');
const paths = [...new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]).pathname).concat(extraPaths))];
for (const route of paths) {
  const { html, head = '' } = await renderPage(route);
  if (!html.includes('<h1')) throw Error('Missing rendered heading: ' + route);
  let template;
  const target = path.join('dist', route, 'index.html');
  try { template = await fs.readFile(target, 'utf8'); } catch { template = base; }
  const start = template.indexOf('<div id="root"');
  if (start < 0) throw Error('Missing root container');
  // Source and generated shells use an empty root; remove the old preloader.
  const rootEnd = template.indexOf('</body>');
  const before = template.slice(0, start);
  // Vite puts entry scripts in head. Root content can therefore be replaced
  // through the final closing root div; the rendered page also works without JavaScript.
  const tail = template.slice(rootEnd);
  let result = before + '<div id="root">' + html + '</div>\n' + tail;
  if (head) {
    result = result.replace(/<title>[\s\S]*?<\/title>/g, '').replace(/<meta[^>]+(?:name="(?:description|keywords|robots|author|title)"|property="(?:og:|twitter:)[^"]+")[^>]*>/g, '').replace(/<link[^>]+rel="canonical"[^>]*>/g, '').replace(/<script[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/g, '').replace('</head>', head + '</head>');
  }
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, result);
}
console.log('Rendered public page content for ' + paths.length + ' routes.');

// Generated routes are served before the existing application fallback.
const routing = JSON.parse(await fs.readFile('vercel.json', 'utf8'));
const existing = routing.rewrites || [];
const exact = paths.filter(route => route !== '/').map(route => ({ source: route, destination: route + '/index.html' }));
const api = existing.filter(rule => rule.source.startsWith('/api'));
const rest = existing.filter(rule => !rule.source.startsWith('/api') && !paths.includes(rule.source));
routing.rewrites = [...api, ...exact, ...rest];
await fs.writeFile('vercel.json', JSON.stringify(routing, null, 2) + '\n');
