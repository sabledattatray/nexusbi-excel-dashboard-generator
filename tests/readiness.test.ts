import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
test('all sitemap pages contain real route content before JavaScript runs',()=>{
 const xml=fs.readFileSync('public/sitemap.xml','utf8');
 const paths=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>new URL(m[1]).pathname);
 assert.equal(paths.length,15);
 for(const p of paths){const html=fs.readFileSync('dist'+(p==='/'?'':p)+'/index.html','utf8');assert.match(html,/<h1/);const main=html.slice(html.indexOf('<main'));assert.ok(main.replace(/<[^>]+>/g,' ').split(/\s+/).length>100,p);assert.doesNotMatch(html,/googletagmanager\.com\/gtag|gtag\('config'/);}
});
test('the privacy page describes hosting and support boundaries without zero-risk claims',()=>{
 const html=fs.readFileSync('dist/privacy/index.html','utf8');assert.match(html,/Hosting providers receive ordinary request information/);assert.doesNotMatch(html,/zero risk of server data breaches|engineered in compliance with global data protection/);
});
