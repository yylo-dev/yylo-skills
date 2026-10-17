import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createProvider, parseSkill, apply } from '../dsh/index.mjs';

const root = path.resolve(import.meta.dirname, '..');
test('DSH lists eight canonical skills and loads bodies/resources without rewriting requests', async () => {
  const provider = createProvider();
  const candidates = await provider.list();
  assert.equal(candidates.length, 8);
  for (const candidate of candidates) {
    assert.equal(candidate.rank, 600);
    assert.equal(candidate.content, undefined);
    const loaded = await provider.get(candidate);
    const canonical = fs.readFileSync(path.join(root, 'skills', candidate.name, 'SKILL.md'), 'utf8');
    assert.equal(loaded.content, parseSkill(canonical, candidate.name).content);
    assert.ok(loaded.content.includes('$ARGUMENTS'));
    assert.equal(loaded.resourceBase.path, fs.realpathSync(path.join(root, 'skills', candidate.name)));
  }
  assert.equal(await provider.get({ name: '../secret', locator: '/etc/passwd' }), undefined);
  const safe = await provider.get({ name: candidates[0].name, locator: '/etc/passwd' });
  assert.equal(safe.name, candidates[0].name);
});
test('DSH provider obeys cancellation', async () => {
  const signal = AbortSignal.abort(new Error('cancelled'));
  await assert.rejects(createProvider().list({ signal }), /cancelled/);
  await assert.rejects(createProvider().get({ name: 'wiki-yylo' }, { signal }), /cancelled/);
});
test('DSH invocation controls are independent', () => {
  const skill = '---\nname: test\ndescription: Example\ndisable-model-invocation: true\nuser-invocable: false\n---\n$ARGUMENTS';
  assert.deepEqual(parseSkill(skill, 'test').invocation, { modelInvocable: false, userInvocable: false });
  assert.throws(() => parseSkill(skill, 'other'), /identity mismatch/);
  assert.throws(() => parseSkill(skill.replace('description: Example', 'description: |'), 'test'), /unsupported/);
});
test('DSH registration uses the host-owned provider effect', () => {
  const factories = [];
  apply({ skills: { registerProvider: factory => factories.push(factory) } });
  assert.equal(factories.length, 1);
  assert.equal(factories[0]().name, 'yylo-skills');
});
test('DSH rejects skills escaping through symlinks', async () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'yylo-dsh-test-'));
  try {
    fs.mkdirSync(path.join(fixture, 'skills'));
    fs.writeFileSync(path.join(fixture, 'skills-manifest.json'), JSON.stringify({ skills: { 'wiki-yylo': {} } }));
    fs.symlinkSync(path.join(root, 'skills/wiki-yylo'), path.join(fixture, 'skills/wiki-yylo'));
    await assert.rejects(createProvider(fixture).list(), /escapes package/);
  } finally { fs.rmSync(fixture, { recursive: true, force: true }); }
});
