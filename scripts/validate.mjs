#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const skillsRoot = path.join(root, 'skills');
const expected = [
  'artifact-yylo',
  'ledger-tasks-yylo',
  'plan-ledger-tasks-yylo',
  'ralph-loop-yylo',
  'understand-project-yylo',
  'wiki-yylo',
  'workflow-yylo',
];
const actual = fs.readdirSync(skillsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
if (JSON.stringify(actual) !== JSON.stringify(expected)) {
  throw new Error(`unexpected canonical skills: ${actual.join(', ')}`);
}

const requiredContracts = {
  'artifact-yylo': ['$ARGUMENTS'],
  'ledger-tasks-yylo': ['$ARGUMENTS'],
  'plan-ledger-tasks-yylo': ['$ARGUMENTS'],
  'ralph-loop-yylo': ['Read [references/implement.md](references/implement.md) completely',
    '## Complete assigned request', '$ARGUMENTS'],
  'understand-project-yylo': ['$1', '$2', '$ARGUMENTS', '### Main task',
    '### Constraints and context', '### Complete raw request'],
  'wiki-yylo': ['$ARGUMENTS'],
  'workflow-yylo': ['$ARGUMENTS'],
};
const legacy = ['kanban-workflow', 'plan-kanban-tasks', 'ralph-loop`', 'understand-project`'];
for (const slug of expected) {
  const directory = path.join(skillsRoot, slug);
  const skillPath = path.join(directory, 'SKILL.md');
  const readmePath = path.join(directory, 'README.md');
  if (!fs.existsSync(skillPath) || !fs.existsSync(readmePath)) {
    throw new Error(`missing SKILL.md or README.md for ${slug}`);
  }
  const text = fs.readFileSync(skillPath, 'utf8');
  if (!text.startsWith('---\n') || !text.includes(`\nname: ${slug}\n`)) {
    throw new Error(`frontmatter identity mismatch for ${slug}`);
  }
  for (const literal of requiredContracts[slug]) {
    if (!text.includes(literal)) throw new Error(`${slug} lost invocation contract: ${literal}`);
  }
  for (const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1];
    if (/^(?:https?:|#)/.test(target)) continue;
    if (!fs.existsSync(path.resolve(directory, target))) {
      throw new Error(`${slug} has unresolved local reference: ${target}`);
    }
  }
}

const markdown = [];
for (const directory of [root, ...expected.map((slug) => path.join(skillsRoot, slug))]) {
  for (const name of fs.readdirSync(directory)) {
    if (name.endsWith('.md')) markdown.push(fs.readFileSync(path.join(directory, name), 'utf8'));
  }
}
const joined = markdown.join('\n');
for (const old of legacy) {
  if (joined.includes(old)) throw new Error(`legacy skill reference remains: ${old}`);
}

const config = JSON.parse(fs.readFileSync(path.join(root, 'skills.sh.json'), 'utf8'));
if (config.$schema !== 'https://skills.sh/schemas/skills.sh.schema.json') {
  throw new Error('skills.sh.json schema identity is missing');
}
const grouped = config.groupings.flatMap((group) => group.skills).sort();
if (JSON.stringify(grouped) !== JSON.stringify(expected)) {
  throw new Error(`skills.sh.json grouping mismatch: ${grouped.join(', ')}`);
}
if (fs.readFileSync(path.join(root, 'VERSION'), 'utf8').trim() !== '2.0.0') {
  throw new Error('VERSION must identify the v2 skill contract');
}
console.log(`validated ${expected.length} canonical skills and invocation contracts`);
