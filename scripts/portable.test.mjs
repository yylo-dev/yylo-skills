import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { checkPluginManifests, pluginManifests } from './plugin-manifests.mjs';
const source = path.resolve(import.meta.dirname, '..');
for (const [name, mutate] of [
  ['wrong schema', m => { m.$schema = 'https://example.com/schema'; }],
  ['stale version', m => { m.version = '2.0.3'; }],
  ['component paths', m => { m.skills = ['/tmp/skills']; }],
  ['automatic hook', m => { m.hooks = 'run.sh'; }],
  ['new runtime dependency', m => { m.mcpServers = { yylo: { command: 'yy' } }; }],
]) {
  test(`rejects portable ${name}`, () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'yylo-portable-test-'));
    try {
      for (const file of ['.claude-plugin', 'skills', 'skills-manifest.json', 'VERSION', ...Object.keys(pluginManifests(source))]) {
        fs.cpSync(path.join(source, file), path.join(root, file), { recursive: true });
      }
      const file = path.join(root, 'plugin.json');
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      mutate(data); fs.writeFileSync(file, JSON.stringify(data));
      assert.throws(() => checkPluginManifests(root), /plugin manifest drift/);
    } finally { fs.rmSync(root, { recursive: true, force: true }); }
  });
}
