'use strict';
const { readFileSync, writeFileSync } = require('node:fs');
const { createHash } = require('node:crypto');
const { join } = require('node:path');
const docs = join(__dirname, '..', 'docs');
for (const page of ['index.html', 'comparison.html']) {
  const path = join(docs, page);
  const original = readFileSync(path, 'utf8');
  const html = original.replace(/((?:href|src)="([^"?]+\.(?:css|js)))(?:\?v=[^"]*)?"/g, (match, prefix, name) => {
    const version = createHash('sha256').update(readFileSync(join(docs, name))).digest('hex').slice(0, 10);
    return `${prefix}?v=${version}"`;
  });
  if (html !== original) writeFileSync(path, html);
}
console.log('Asset references match both current website entry points.');
