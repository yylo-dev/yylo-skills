#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const plugin = JSON.parse(fs.readFileSync(path.join(root, 'plugin.json'), 'utf8'));
const version = fs.readFileSync(path.join(root, 'VERSION'), 'utf8').trim();
assert.equal(plugin.version, version, 'portable version drift');
const expected = {
  name: '@yylo/skills', version, private: true,
  description: plugin.description, type: 'module', license: plugin.license,
  repository: { type: 'git', url: `${plugin.repository}.git` },
  main: './dsh/index.mjs',
  exports: { '.': './dsh/index.mjs', './package.json': './package.json', './dsh/cordis.patch.yml': './dsh/cordis.patch.yml' },
  files: ['dsh', 'skills', 'skills-manifest.json', 'plugin.json', 'VERSION', 'LICENSE', 'README.md', 'docs'],
  keywords: [...plugin.keywords, 'dsh-plugin', 'deepseek-harness'],
  engines: { node: '>=22', dsh: '>=0.2.0-rc.2 <0.3.0' },
  dsh: { bundle: { patch: './dsh/cordis.patch.yml' } },
  scripts: {
    test: 'node scripts/validate.mjs && node scripts/sync-plugins.mjs --check && node scripts/sync-dsh.mjs --check && node --test scripts/*.test.mjs',
  },
};
const args = process.argv.slice(2);
assert.ok(args.length === 0 || (args.length === 1 && args[0] === '--check'), 'Usage: node scripts/sync-dsh.mjs [--check]');
const file = path.join(root, 'package.json');
if (!args.length) fs.writeFileSync(file, JSON.stringify(expected, null, 2) + '\n');
assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')), expected, 'DSH package metadata drift');
assert.equal(fs.readFileSync(path.join(root, 'dsh/cordis.patch.yml'), 'utf8'), "- insert:\n    - id: yylo-skills\n      name: '@yylo/skills'\n", 'DSH patch drift');
console.log('DSH bundle metadata matches canonical portable plugin');
