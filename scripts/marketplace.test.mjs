import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const source = path.resolve(import.meta.dirname, '..');
for (const [name, mutate, diagnostic] of [
  ['stale version', m => { m.plugins[0].version = '2.0.3'; }, /marketplace version/],
  ['wrong plugin name', m => { m.plugins[0].name = 'other'; }, /marketplace name/],
  ['stale description', m => { m.plugins[0].description = 'old'; }, /marketplace description/],
  ['remote source', m => { m.plugins[0].source = 'https://example.com'; }, /canonical root plugin/],
  ['missing plugin', m => { m.plugins = []; }, /canonical root plugin/],
  ['duplicate plugin', m => { m.plugins.push(m.plugins[0]); }, /canonical root plugin/],
  ['hidden skills', m => { m.plugins[0].skills = []; }, /component override/],
  ['non-strict override', m => { m.plugins[0].strict = false; }, /component override/],
]) {
  test(`rejects marketplace ${name}`, () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'yylo-marketplace-test-'));
    try {
      for (const item of ['skills', 'scripts', 'VERSION', 'skills.sh.json', 'skills-manifest.json', '.claude-plugin']) {
        fs.cpSync(path.join(source, item), path.join(root, item), { recursive: true });
      }
      const file = path.join(root, '.claude-plugin/marketplace.json');
      const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
      mutate(manifest);
      fs.writeFileSync(file, JSON.stringify(manifest));
      assert.throws(() => execFileSync(process.execPath, [path.join(root, 'scripts/validate.mjs')], { stdio: 'pipe' }), diagnostic);
    } finally { fs.rmSync(root, { recursive: true, force: true }); }
  });
}
