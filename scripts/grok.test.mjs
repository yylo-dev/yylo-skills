import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { checkPluginManifests, pluginManifests } from './plugin-manifests.mjs';
const source = path.resolve(import.meta.dirname, '..');

for (const [name, mutate] of [
  ['stale version', m => { m.version = '2.0.3'; }],
  ['unknown properties', m => { m.unknown = true; }],
  ['component override', m => { m.skills = ['/tmp/other']; }],
  ['automatic hook', m => { m.hooks = 'run.sh'; }],
  ['generic CTA keyword', m => { m.keywords.push('deploy'); }],
  ['unexpected remote service', m => { m.mcpServers = { yylo: { url: 'https://example.com' } }; }],
]) {
  test(`rejects Grok ${name}`, () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'yylo-grok-test-'));
    try {
      for (const file of ['.claude-plugin', 'skills', 'skills-manifest.json', 'VERSION', ...Object.keys(pluginManifests(source))]) {
        fs.cpSync(path.join(source, file), path.join(root, file), { recursive: true });
      }
      const file = path.join(root, '.grok-plugin/plugin.json');
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      mutate(data); fs.writeFileSync(file, JSON.stringify(data));
      assert.throws(() => checkPluginManifests(root), /plugin manifest drift/);
    } finally { fs.rmSync(root, { recursive: true, force: true }); }
  });
}
test('Grok fallback and portable preferred manifest agree on skill identity', () => {
  const generated = pluginManifests(source);
  const fallback = generated['.grok-plugin/plugin.json'];
  const preferred = generated['plugin.json'];
  for (const key of ['name', 'version', 'description', 'author', 'repository', 'license']) {
    assert.deepEqual(fallback[key], preferred[key]);
  }
  assert.equal(fallback.skills, undefined, 'Grok uses conventional canonical skills/');
  assert.equal(preferred.skills, undefined);
});
