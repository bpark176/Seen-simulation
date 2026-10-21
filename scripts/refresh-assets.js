'use strict';
const { readFileSync, writeFileSync } = require('node:fs');
const { createHash } = require('node:crypto');
const { join } = require('node:path');

const docs = join(__dirname, '..', 'docs');
const indexPath = join(docs, 'index.html');
let html = readFileSync(indexPath, 'utf8');
for (const name of ['style.css', 'story.js', 'app.js']) {
  const version = createHash('sha256').update(readFileSync(join(docs, name))).digest('hex').slice(0, 10);
  // Match an asset URL, leaving the surrounding tag and other attributes intact.
  const assetUrl = new RegExp(`((?:href|src)="${name.replace(/\./g, '\\.')})(?:\\?v=[^"]*)?"`);
  if (!assetUrl.test(html)) throw new Error(`Missing asset reference: ${name}`);
  html = html.replace(assetUrl, `$1?v=${version}"`);
}
if (html !== readFileSync(indexPath, 'utf8')) writeFileSync(indexPath, html);
console.log('Asset references match the current website files.');
