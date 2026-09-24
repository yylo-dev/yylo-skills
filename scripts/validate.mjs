#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const skillsRoot = path.join(root, 'skills');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'skills-manifest.json'), 'utf8'));
if (manifest.schemaVersion !== 1 || manifest.packageId !== 'yylo-skills'
    || manifest.additionalSkills !== 'reject'
    || manifest.sourceVersion !== fs.readFileSync(path.join(root, 'VERSION'), 'utf8').trim()) {
  throw new Error('unsupported or inconsistent skills release manifest');
}
const expected = Object.keys(manifest.skills).sort();
const actual = fs.readdirSync(skillsRoot, { withFileTypes: true })
  .map((entry) => { if (!entry.isDirectory()) throw new Error(`unsafe skill entry: ${entry.name}`); return entry.name; }).sort();
if (JSON.stringify(actual) !== JSON.stringify(expected)) {
  throw new Error(`unexpected canonical skills: ${actual.join(', ')}`);
}

const requiredContracts = {
  'artifact-yylo': ['$ARGUMENTS'],
  'benchmark-yylo': ['$ARGUMENTS', 'references/historical-tasks.md',
    'yy pi --model openai-codex/<complete-name>', 'trusted-host lane requires explicit owner approval',
    'zero-dispatch setup canary', 'baseline failure and reference success',
    'Unknown quality', 'new plan/cohort', 'Unknown cost is unknown, never zero',
    'owner approval before task 2', 'not a failed capability test'],
  'ledger-tasks-yylo': ['$ARGUMENTS'],
  'plan-ledger-tasks-yylo': ['$ARGUMENTS'],
  'ralph-loop-yylo': ['Read [references/implement.md](references/implement.md) completely',
    '## Complete assigned request', '$ARGUMENTS'],
  'understand-project-yylo': ['$1', '$2', '$ARGUMENTS', '### Main task',
    '### Constraints and context', '### Complete raw request'],
  'wiki-yylo': ['$ARGUMENTS'],
  'workflow-yylo': ['$ARGUMENTS'],
};
// Behavioral requirements stay independently authored, never generated from
// the manifest: deleting an identity from both source and manifest must fail.
if (JSON.stringify(Object.keys(requiredContracts).sort()) !== JSON.stringify(expected)) {
  throw new Error('release manifest does not cover independent behavioral requirements');
}
const legacy = ['kanban-workflow', 'plan-kanban-tasks', 'ralph-loop`', 'understand-project`'];
for (const slug of expected) {
  const directory = path.join(skillsRoot, slug);
  const skillPath = path.join(directory, 'SKILL.md');
  const readmePath = path.join(directory, 'README.md');
  if (!fs.existsSync(skillPath) || !fs.existsSync(readmePath)) {
    throw new Error(`missing SKILL.md or README.md for ${slug}`);
  }
  const text = fs.readFileSync(skillPath, 'utf8');
  const contract = manifest.skills[slug];
  const counts = {};
  for (const [placeholder] of text.matchAll(/\$ARGUMENTS\b|\$[1-9][0-9]*/g)) counts[placeholder] = (counts[placeholder] ?? 0) + 1;
  const ordered = value => JSON.stringify(Object.entries(value ?? {}).sort(([a], [b]) => a.localeCompare(b)));
  if (contract.contractVersion !== 1 || typeof contract.semantics !== 'string'
      || !contract.placeholders?.$ARGUMENTS || ordered(counts) !== ordered(contract.placeholders)) {
    throw new Error(`${slug}: manifest invocation contract mismatch`);
  }
  if (!text.startsWith('---\n') || !text.includes(`\nname: ${slug}\n`)) {
    throw new Error(`frontmatter identity mismatch for ${slug}`);
  }
  for (const literal of [...requiredContracts[slug], 'Record kind/profile',
    'actual immutable Record ID', 'actual Ledger slug', 'native get readback',
    'Never invent a slug', 'IDs remain authoritative']) {
    if (!text.replace(/\s+/g, ' ').includes(literal)) throw new Error(`${slug} lost invocation contract: ${literal}`);
  }
  for (const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1];
    if (/^(?:https?:|#)/.test(target)) continue;
    if (!fs.existsSync(path.resolve(directory, target))) {
      throw new Error(`${slug} has unresolved local reference: ${target}`);
    }
  }
}

const retrievalSkills = ['ledger-tasks-yylo', 'artifact-yylo', 'wiki-yylo',
  'workflow-yylo', 'plan-ledger-tasks-yylo', 'understand-project-yylo'];
for (const slug of retrievalSkills) {
  const text = fs.readFileSync(path.join(skillsRoot, slug, 'SKILL.md'), 'utf8').replace(/\s+/g, ' ');
  for (const contract of ['yy ledger get --help', 'yy ledger get RECORD_ID -f json',
    'yy ledger record get RECORD_ID -f json', 'existing IDs remain unchanged']) {
    if (!text.toLowerCase().includes(contract.toLowerCase())) throw new Error(`${slug} lost retrieval contract: ${contract}`);
  }
}
const retrieval = fs.readFileSync(path.join(skillsRoot, 'ledger-tasks-yylo/references/retrieval.md'), 'utf8').replace(/\s+/g, ' ');
for (const contract of ['task_', 'doc_', 'artifact_', 'Existing IDs remain unchanged',
  'Never guess types', 'artifact/report', 'document/pdr', '64 KiB', '16 MiB',
  '--content --max-content-bytes', 'never downloads external/link payloads',
  'Metadata', 'metadata/history alone', 'selected project', '--scope archive',
  'A missing ID means no match', 'stop on corruption']) {
  if (!retrieval.toLowerCase().includes(contract.toLowerCase())) {
    throw new Error(`missing universal retrieval contract: ${contract}`);
  }
}

const markdown = [];
for (const directory of [root, ...expected.map((slug) => path.join(skillsRoot, slug))]) {
  const visit = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue;
      const file = path.join(current, entry.name);
      if (entry.isDirectory() && current !== root) visit(file);
      else if (entry.isFile() && entry.name.endsWith('.md')) markdown.push(fs.readFileSync(file, 'utf8'));
    }
  };
  visit(directory);
}
const joined = markdown.join('\n');
for (const old of legacy) {
  if (joined.includes(old)) throw new Error(`legacy skill reference remains: ${old}`);
}

const normalized = joined.replace(/\s+/g, ' ');
for (const retired of [
  /public Ledger .* surface is task-oriented|Do not advertise `record`/i,
  /\byy(?:lo)?\s+merge\s+(?:arbiter|drive|next|resolve)\b/i,
  /sole lifecycle-semantic review owner|Reviewer A then Reviewer B|risk-based review sequence/i,
  /Run `yy task preflight TASK_ID` before|validates the exact preflighted tip/i,
  /\byy(?:lo)?\s+task\s+(?:run|resume|recover-predispatch|recover-wall-budget)\b/i,
  /\byy(?:lo)?\s+watch\s+exec\b/i,
]) {
  if (retired.test(normalized)) throw new Error(`retired lifecycle instruction: ${retired}`);
}
const implementation = fs.readFileSync(path.join(skillsRoot, 'ralph-loop-yylo/references/implement.md'), 'utf8');
for (const contract of [
  'Optional read-only `yy task preflight TASK_ID`', 'not a prerequisite',
  'Finish independently enforces admission', 'configured validation',
  'outside merge', 'launches no models', 'fencing token', 'hydration',
  'yy task finish TASK_ID --lease-token <current-token>',
  'yy merge status TASK_ID', 'yy merge land TASK_ID', 'yy merge project TASK_ID',
  'projects Ledger automatically', 'Recompose and recheck', 'preserve private conflicts',
  'The external agent performs implementation', 'budget recovery are retired',
  'read-only observer of existing evidence', 'never replay/reset them automatically',
]) {
  if (!implementation.replace(/\s+/g, ' ').includes(contract)) throw new Error(`missing native delivery contract: ${contract}`);
}

const benchmark = fs.readFileSync(path.join(skillsRoot, 'benchmark-yylo/references/historical-tasks.md'), 'utf8').replace(/\s+/g, ' ');
for (const contract of ['exact attempt-directory shape', 'conflicting ancestor YYLO workspace',
  'ignore rules that hide durable configuration', 'separate grader copy',
  'fixed deterministic-command timeout', 'metadata/history retrieval is not byte round-trip proof',
  'not a verified native report', 'Candidate staging, commits and new files all count']) {
  if (!benchmark.includes(contract)) throw new Error(`missing benchmark preparation contract: ${contract}`);
}

const config = JSON.parse(fs.readFileSync(path.join(root, 'skills.sh.json'), 'utf8'));
if (config.$schema !== 'https://skills.sh/schemas/skills.sh.schema.json') {
  throw new Error('skills.sh.json schema identity is missing');
}
const grouped = config.groupings.flatMap((group) => group.skills).sort();
if (JSON.stringify(grouped) !== JSON.stringify(expected)) {
  throw new Error(`skills.sh.json grouping mismatch: ${grouped.join(', ')}`);
}
if (!/^2\.\d+\.\d+$/.test(fs.readFileSync(path.join(root, 'VERSION'), 'utf8').trim())) {
  throw new Error('VERSION must identify the v2 skill contract');
}
const plugin = JSON.parse(fs.readFileSync(path.join(root, '.claude-plugin/plugin.json'), 'utf8'));
if (plugin.version !== fs.readFileSync(path.join(root, 'VERSION'), 'utf8').trim()) {
  throw new Error('plugin version must match VERSION');
}
console.log(`validated ${expected.length} canonical skills, nested lifecycle guidance and invocation contracts`);
