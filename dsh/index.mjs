import assert from 'node:assert/strict';
import { readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const name = 'yylo-skills';
export const inject = ['skills'];
const packageRoot = fileURLToPath(new URL('../', import.meta.url));

// Canonical YYLO frontmatter uses plain, one-line name/description scalars.
// Fail closed if that contract changes rather than executing YAML directives or
// silently publishing a broken catalog. Extra host fields remain inert data.
export function parseSkill(text, expectedName) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(text);
  assert.ok(match, `missing frontmatter: ${expectedName}`);
  const scalar = key => {
    const values = [...match[1].matchAll(new RegExp(`^${key}: (.+)$`, 'gm'))];
    assert.equal(values.length, 1, `expected one ${key}: ${expectedName}`);
    const value = values[0][1].trim();
    assert.ok(value && !/^[|>\[\{&*!'\"]/.test(value), `unsupported ${key} scalar: ${expectedName}`);
    return value;
  };
  assert.equal(scalar('name'), expectedName, 'skill identity mismatch');
  const boolean = (key, fallback) => {
    const matches = [...match[1].matchAll(new RegExp(`^${key}: (.+)$`, 'gm'))];
    if (!matches.length) return fallback;
    assert.equal(matches.length, 1, `duplicate ${key}`);
    assert.match(matches[0][1].trim(), /^(true|false)$/);
    return matches[0][1].trim() === 'true';
  };
  return {
    description: scalar('description'),
    content: match[2],
    invocation: {
      modelInvocable: !boolean('disable-model-invocation', false),
      userInvocable: boolean('user-invocable', true),
    },
  };
}

export function createProvider(root = packageRoot) {
  const names = async () => {
    const release = JSON.parse(await readFile(path.join(root, 'skills-manifest.json'), 'utf8'));
    const result = Object.keys(release.skills).sort();
    for (const slug of result) assert.match(slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    return result;
  };
  const definition = async slug => {
    const base = await realpath(root);
    const directory = await realpath(path.join(base, 'skills', slug));
    const file = await realpath(path.join(directory, 'SKILL.md'));
    const contained = target => {
      const relative = path.relative(base, target);
      assert.ok(relative && !relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative), 'skill path escapes package');
    };
    contained(directory); contained(file);
    return {
      name: slug,
      path: file,
      provider: name,
      source: 'bundled',
      resourceBase: { kind: 'directory', path: directory },
      ...parseSkill(await readFile(file, 'utf8'), slug),
    };
  };
  return {
    name,
    async list(options = {}) {
      options.signal?.throwIfAborted();
      const results = [];
      for (const slug of await names()) {
        options.signal?.throwIfAborted();
        const { content, ...summary } = await definition(slug);
        results.push({ ...summary, rank: 600, locator: slug });
      }
      return results;
    },
    async get(candidate, options = {}) {
      options.signal?.throwIfAborted();
      // Never trust a caller-provided locator/path as a filesystem target.
      if (!(await names()).includes(candidate.name)) return undefined;
      return definition(candidate.name);
    },
  };
}

export function apply(ctx) {
  // Cordis owns this effect; unloading the plugin removes its provider.
  ctx.skills.registerProvider(() => createProvider());
}
