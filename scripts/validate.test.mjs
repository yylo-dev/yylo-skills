import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const source = path.resolve(import.meta.dirname, '..');

test('accepts complete canonical retrieval guidance', () => {
  assert.doesNotThrow(() => execFileSync(process.execPath,
    [path.join(source, 'scripts/validate.mjs')], { stdio: 'pipe' }));
});

const retrievalCases = [
  ...['ledger-tasks-yylo', 'artifact-yylo', 'wiki-yylo', 'workflow-yylo',
    'plan-ledger-tasks-yylo', 'understand-project-yylo'].flatMap((skill) =>
      ['yy ledger get --help', 'yy ledger get RECORD_ID -f json',
        'yy ledger record get RECORD_ID -f json', 'existing IDs remain unchanged'].map((contract) =>
        [`skills/${skill}/SKILL.md`, contract, 'lost retrieval contract'])),
  ...['artifact/report', 'document/pdr', '64 KiB', '16 MiB',
    '--content --max-content-bytes', 'never downloads external/link payloads',
    'metadata/history alone', 'A missing ID means no match', 'stop on corruption'].map((contract) =>
      ['skills/ledger-tasks-yylo/references/retrieval.md', contract, 'missing universal retrieval contract']),
];
for (const [file, contract, diagnostic] of retrievalCases) {
  test(`rejects removed retrieval boundary in ${file}: ${contract}`, () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'yylo-retrieval-contract-'));
    try {
      for (const item of ['skills', 'scripts', 'VERSION', 'skills.sh.json', '.claude-plugin']) {
        fs.cpSync(path.join(source, item), path.join(root, item), { recursive: true });
      }
      const target = path.join(root, file);
      const text = fs.readFileSync(target, 'utf8');
      const pattern = new RegExp(contract.split(/\s+/).map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s+'), 'gi');
      assert.match(text, pattern);
      fs.writeFileSync(target, text.replace(pattern, 'REMOVED RETRIEVAL BOUNDARY'));
      assert.throws(() => execFileSync(process.execPath, [path.join(root, 'scripts/validate.mjs')],
        { stdio: 'pipe' }), new RegExp(diagnostic));
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
}
for (const skill of fs.readdirSync(path.join(source, 'skills'))) {
  test(`rejects missing actual slug reporting in ${skill}`, () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'yylo-reporting-contract-'));
    try {
      for (const item of ['skills', 'scripts', 'VERSION', 'skills.sh.json', '.claude-plugin']) {
        fs.cpSync(path.join(source, item), path.join(root, item), { recursive: true });
      }
      const file = path.join(root, 'skills', skill, 'SKILL.md');
      fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('actual Ledger slug', 'guessed slug'));
      assert.throws(() => execFileSync(process.execPath, [path.join(root, 'scripts/validate.mjs')],
        { stdio: 'pipe' }), /lost invocation contract: actual Ledger slug/);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
}
for (const [file, contract, diagnostic] of [
  ...['yylo-benchmark --version', 'case -> run -> evaluate -> report',
    'fresh history-free repository', 'trusted-host hygiene, not a security sandbox',
    'YYLO_BENCHMARK_REQUEST_JSON', 'from initial input through X inclusive',
    'the prefix, not X independently', 'without rerunning candidates',
    'evaluator error', 'Disqualification is append-only',
    'Unknown cost is unknown, never zero', 'only when the agreed study protocol requires it']
    .map((contract) => ['SKILL.md', contract, 'lost invocation contract']),
  ['references/historical-tasks.md', 'baseline failure and reference success', 'missing benchmark preparation contract'],
  ['references/historical-tasks.md', 'conflicting ancestor YYLO workspace', 'missing benchmark preparation contract'],
  ['references/historical-tasks.md', 'metadata/history retrieval is not byte round-trip proof', 'missing benchmark preparation contract'],
  ['references/historical-tasks.md', 'not a verified native report', 'missing benchmark preparation contract'],
]) {
  test(`rejects removed benchmark boundary: ${contract}`, () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'yylo-benchmark-contract-'));
    try {
      for (const item of ['skills', 'scripts', 'VERSION', 'skills.sh.json', '.claude-plugin']) {
        fs.cpSync(path.join(source, item), path.join(root, item), { recursive: true });
      }
      const target = path.join(root, 'skills/benchmark-yylo', file);
      // Normalize wrapping so this tests the semantic contract, not layout.
      const text = fs.readFileSync(target, 'utf8');
      const pattern = new RegExp(contract.split(/\s+/).map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s+'), 'g');
      assert.match(text, pattern);
      fs.writeFileSync(target, text.replace(pattern, 'REMOVED BENCHMARK BOUNDARY'));
      assert.throws(() => execFileSync(process.execPath, [path.join(root, 'scripts/validate.mjs')],
        { stdio: 'pipe' }), new RegExp(diagnostic));
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
}
for (const injected of [
  'yylo-benchmark plan --task T1', 'yy benchmark recover --attempt old',
  'yylo-benchmark doctor', 'yy benchmark regrade', 'yylo-benchmark rejudge',
  'Use default isolation.', 'wait for owner approval before task 2',
  'Assume a fixed deterministic-command timeout.',
]) {
  test(`rejects retired Benchmark guidance: ${injected}`, () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'yylo-benchmark-retired-'));
    try {
      for (const item of ['skills', 'scripts', 'VERSION', 'skills.sh.json', '.claude-plugin']) {
        fs.cpSync(path.join(source, item), path.join(root, item), { recursive: true });
      }
      fs.writeFileSync(path.join(root, 'skills/benchmark-yylo/references/regression.md'), injected);
      assert.throws(() => execFileSync(process.execPath, [path.join(root, 'scripts/validate.mjs')],
        { stdio: 'pipe' }), /retired benchmark instruction/);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
}

for (const [name, injected] of [
  ['arbiter command', 'yy merge arbiter run TASK_ID'],
  ['drive command', 'yy merge drive TASK_ID'],
  ['obsolete capability denial', 'Do not advertise `record` or wiki namespaces.'],
  ['merge-owned reviewers', 'The managed queue is the sole lifecycle-semantic review owner.'],
  ['mandatory preflight', 'Run `yy task preflight TASK_ID` before expensive final validation.'],
  ['autonomous implementation', 'yy task run TASK_ID'],
  ['automatic resume', 'yy task resume TASK_ID'],
  ['budget reset', 'yy task recover-wall-budget TASK_ID'],
  ['watch execution', 'yy watch exec -- npm test'],
]) {
  test(`rejects ${name} in nested skill references`, () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'yylo-skill-contract-'));
    try {
      for (const item of ['skills', 'scripts', 'VERSION', 'skills.sh.json', '.claude-plugin']) {
        fs.cpSync(path.join(source, item), path.join(root, item), { recursive: true });
      }
      const validate = () => execFileSync(process.execPath, [path.join(root, 'scripts/validate.mjs')], { stdio: 'pipe' });
      assert.doesNotThrow(validate);
      fs.writeFileSync(path.join(root, 'skills/ralph-loop-yylo/references/regression.md'), injected);
      assert.throws(validate, /retired lifecycle instruction/);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
}
