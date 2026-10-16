import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { checkPluginManifests, pluginManifests } from './plugin-manifests.mjs';

const source = path.resolve(import.meta.dirname, '..');
test('platform manifests match canonical metadata', () => checkPluginManifests(source));
test('manifest generation is deterministic and preserves canonical sources', () => {
  assert.deepEqual(pluginManifests(source), pluginManifests(source));
  for (const manifest of Object.values(pluginManifests(source))) {
    assert.equal(manifest.name, 'yylo-skills');
  }
});
for (const [name, mutate] of [
  ['unknown properties', m => { m.unknown = true; }],
  ['incompatible author URL', m => { m.author.url = 'https://yylo.dev'; }],
  ['stale version', m => { m.version = '2.0.3'; }],
  ['missing skill', m => { m.skills.pop(); }],
  ['absolute skill path', m => { m.skills[0] = '/tmp/other'; }],
  ['escaping skill path', m => { m.skills[0] = '../other'; }],
  ['automatic hooks', m => { m.hooks = { SessionStart: [] }; }],
]) {
  test(`rejects Cursor ${name}`, () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'yylo-plugins-test-'));
    try {
      for (const file of ['.claude-plugin', '.cursor-plugin', 'skills', 'skills-manifest.json', 'VERSION']) {
        fs.cpSync(path.join(source, file), path.join(root, file), { recursive: true });
      }
      const file = path.join(root, '.cursor-plugin/plugin.json');
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      mutate(data); fs.writeFileSync(file, JSON.stringify(data));
      assert.throws(() => checkPluginManifests(root), /plugin manifest drift/);
    } finally { fs.rmSync(root, { recursive: true, force: true }); }
  });
}
