import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Format adapters, not independent skill sources. Keep this metadata-only:
// installation must never start YYLO tasks, install runtimes or execute hooks.
export function pluginManifests(root) {
  const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  const plugin = read('.claude-plugin/plugin.json');
  const release = read('skills-manifest.json');
  const version = fs.readFileSync(path.join(root, 'VERSION'), 'utf8').trim();
  assert.equal(plugin.version, version, 'Claude plugin version drift');
  assert.equal(release.sourceVersion, version, 'skills release version drift');
  const names = Object.keys(release.skills).sort();
  assert.deepEqual(fs.readdirSync(path.join(root, 'skills')).sort(), names, 'canonical skill set drift');
  for (const name of names) {
    assert.match(name, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    const dir = path.join(root, 'skills', name);
    assert.ok(fs.lstatSync(dir).isDirectory(), `not a real skill directory: ${name}`);
    assert.ok(fs.lstatSync(path.join(dir, 'SKILL.md')).isFile(), `missing skill: ${name}`);
  }
  // cursor/plugins ac4e25a0064cd600afdd605208bad72748cb019a:
  // schemas/plugin.schema.json. Its author object disallows Claude's url field.
  return {
    'plugin.json': {
      $schema: 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json',
      name: plugin.name,
      version,
      description: plugin.description,
      author: plugin.author,
      homepage: plugin.author.url,
      repository: plugin.repository,
      license: plugin.license,
      keywords: plugin.keywords,
    },
    '.cursor-plugin/plugin.json': {
      name: plugin.name,
      version,
      description: plugin.description,
      author: { name: plugin.author.name },
      homepage: plugin.author.url,
      repository: plugin.repository,
      license: plugin.license,
      keywords: [...plugin.keywords, 'cursor'],
      skills: names.map(name => `./skills/${name}`),
    },
  };
}

export function checkPluginManifests(root) {
  for (const [file, expected] of Object.entries(pluginManifests(root))) {
    const actual = JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
    // Exact object equality rejects unknown keys, stale versions, absolute paths,
    // component overrides and author fields not admitted by the reviewed schema.
    assert.deepEqual(actual, expected, `plugin manifest drift: ${file}; run node scripts/sync-plugins.mjs`);
  }
}
