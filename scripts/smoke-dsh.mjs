#!/usr/bin/env node
// Real registry test, without booting an agent. Install a reviewed exact DSH
// version in a disposable directory and pass its package root as argv[2].
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import * as plugin from '../dsh/index.mjs';

assert.ok(process.argv[2], 'Usage: node scripts/smoke-dsh.mjs /path/to/dsh-runtime');
const require = createRequire(path.join(path.resolve(process.argv[2]), 'package.json'));
const { Context } = await import(pathToFileURL(require.resolve('@deepseek-ai/cordis')));
const { SkillRegistry, renderSkillContent } = await import(pathToFileURL(require.resolve('@deepseek-ai/dsh-skill')));
const ctx = new Context();
const registry = ctx.plugin(SkillRegistry);
await registry.inertia;
const fiber = ctx.plugin(plugin);
try {
  await fiber.inertia;
  const skills = await ctx.skills.list();
  assert.equal(skills.filter(skill => skill.provider === 'yylo-skills').length, 8);
  const skill = await ctx.skills.get('ledger-tasks-yylo');
  assert.ok(skill.content.includes('$ARGUMENTS'));
  const guide = path.join(skill.resourceBase.path, 'references/retrieval.md');
  assert.ok(fs.readFileSync(guide, 'utf8').includes('Never guess types'));
  assert.ok(renderSkillContent(skill).includes('ledger-tasks-yylo'));
  await fiber.dispose();
  assert.equal((await ctx.skills.list()).filter(skill => skill.provider === 'yylo-skills').length, 0);
  console.log('PASS: real DSH registry discovery, body/resource loading, rendering and disposal; no model run');
} finally { await ctx.fiber.dispose(); }
