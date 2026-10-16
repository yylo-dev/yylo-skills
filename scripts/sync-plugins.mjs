#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { checkPluginManifests, pluginManifests } from './plugin-manifests.mjs';

const root = path.resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
if (args.length > 1 || (args.length === 1 && args[0] !== '--check')) {
  throw new Error('Usage: node scripts/sync-plugins.mjs [--check]');
}
if (args[0] !== '--check') {
  for (const [file, manifest] of Object.entries(pluginManifests(root))) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), JSON.stringify(manifest, null, 2) + '\n');
  }
}
checkPluginManifests(root);
console.log('Platform plugin manifests match canonical metadata and skill paths');
