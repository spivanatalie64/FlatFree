#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');

const index = [];

// Walk all top-level directories looking for flatpak manifests
for (const entry of fs.readdirSync(ROOT)) {
  const dir = path.join(ROOT, entry);
  if (!fs.statSync(dir).isDirectory() || entry.startsWith('.')) continue;

  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.json') && !file.endsWith('.yml') && !file.endsWith('.yaml')) continue;
    const manifestPath = path.join(dir, file);
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      const appId = manifest['id'] || entry;
      const moduleName = manifest.modules?.[0]?.name || appId.split('.').pop();
      const desc = manifest['description'] || `${moduleName} — ${manifest.runtime || 'cross-platform'} app`;

      index.push({
        id: appId,
        name: moduleName,
        description: desc,
        runtime: manifest.runtime || 'unknown',
        runtimeVersion: manifest['runtime-version'] || '',
        categories: manifest['categories'] || [],
        manifest: file,
        path: `${entry}/${file}`
      });
    } catch (e) {
      console.warn(`Skipping ${manifestPath}: ${e.message}`);
    }
  }
}

fs.writeFileSync(path.join(DOCS, 'search.json'), JSON.stringify(index, null, 2));
console.log(`Generated search index: ${index.length} app(s)`);
