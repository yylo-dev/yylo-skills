#!/usr/bin/env python3
"""No-model Grok Build package smoke. This does not certify Grok Bot.

Uses only a new temporary HOME/GROK_HOME, retains logs on success or failure,
and never inherits credentials. Pass an explicitly reviewed binary. Optional
catalog extraction uses the exact reviewed xai-org/plugin-marketplace script.
"""
import argparse
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

CATALOG_SHA256 = '71f5d638d0659f36dd28ed677427c640e34d17efaff6e008aedbd690d8bf1ddf'
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--binary', type=Path, required=True)
parser.add_argument('--catalog-script', type=Path)
args = parser.parse_args()
binary = args.binary.resolve(strict=True)
source = Path(__file__).resolve().parent.parent
names = set(json.loads((source / 'skills-manifest.json').read_text())['skills'])
assert len(names) == 8
if args.catalog_script:
    assert hashlib.sha256(args.catalog_script.read_bytes()).hexdigest() == CATALOG_SHA256, 'unreviewed catalog script'
    spec = importlib.util.spec_from_file_location('yylo_reviewed_catalog', args.catalog_script)
    catalog = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(catalog)
    record = catalog.extract_plugin(source)
    assert record['version'] == (source / 'VERSION').read_text().strip()
    assert set(record['components']) == {'skills'}
    assert {row['name'] for row in record['components']['skills']} == names
    print('PASS: pinned xAI marketplace scanner sees eight skills, no hooks or MCP components')

home = Path(tempfile.mkdtemp(prefix='yylo-grok-smoke-')).resolve()
print(f'Evidence home (retained): {home}', flush=True)
fixture = home / 'fixture'
fixture.mkdir()
for name in ['plugin.json', '.grok-plugin', '.cursor-plugin', '.claude-plugin', 'skills',
             'skills-manifest.json', 'VERSION', 'README.md', 'LICENSE']:
    item = source / name
    if item.is_dir():
        shutil.copytree(item, fixture / name)
    else:
        shutil.copy2(item, fixture / name)
unrelated = home / '.grok/skills/yylo-smoke-unrelated/SKILL.md'
unrelated.parent.mkdir(parents=True)
unrelated.write_text('---\nname: yylo-smoke-unrelated\ndescription: Unrelated smoke fixture\n---\nRead only.\n')
unrelated_bytes = unrelated.read_bytes()
env = {'PATH': os.environ['PATH'], 'HOME': str(home), 'GROK_HOME': str(home / '.grok'),
       'XDG_CONFIG_HOME': str(home / '.config'), 'XDG_CACHE_HOME': str(home / '.cache'),
       'DO_NOT_TRACK': '1'}


def run(*argv):
    result = subprocess.run([str(binary), *argv], cwd=home, env=env, text=True,
                            stdin=subprocess.DEVNULL, capture_output=True, timeout=60)
    with (home / 'host.log').open('a') as log:
        log.write(json.dumps(argv) + '\n' + result.stdout + result.stderr + '\n')
    assert result.returncode == 0, f'{argv}: {result.stderr}; see {home}/host.log'
    return result.stdout


def package_skills():
    report = json.loads(run('inspect', '--json'))
    return [row for row in report['skills'] if row['source'].get('plugin_name') == 'yylo-skills']


print(run('--version').strip())
run('plugin', 'validate', str(fixture))
# Independently exercise the fallback instead of only validating root plugin.json.
(fixture / 'plugin.json').rename(fixture / 'portable.saved')
run('plugin', 'validate', str(fixture))
(fixture / 'portable.saved').rename(fixture / 'plugin.json')
run('plugin', 'install', str(fixture), '--trust')
run('plugin', 'enable', 'yylo-skills')
installed = [row for row in json.loads(run('plugin', 'list', '--json')) if row['name'] == 'yylo-skills']
assert len(installed) == 1
installed_root = Path(installed[0]['path']).resolve()
assert installed_root.is_relative_to(home)
rows = package_skills()
assert {row['name'] for row in rows} == names
for row in rows:
    instruction = Path(row['source']['path']).resolve()
    assert instruction.is_relative_to(installed_root)
    assert instruction.read_bytes() == (source / 'skills' / row['name'] / 'SKILL.md').read_bytes()
    assert row['userInvocable'] is True
expected = {p.relative_to(source / 'skills') for p in (source / 'skills').rglob('*') if p.is_file()}
actual = {p.relative_to(installed_root / 'skills') for p in (installed_root / 'skills').rglob('*') if p.is_file()}
assert actual == expected
for relative in expected:
    assert (source / 'skills' / relative).read_bytes() == (installed_root / 'skills' / relative).read_bytes()
guide = installed_root / 'skills/ledger-tasks-yylo/references/retrieval.md'
assert 'Never guess types' in guide.read_text()
run('plugin', 'disable', 'yylo-skills')
assert not package_skills()
run('plugin', 'uninstall', 'yylo-skills', '--confirm')
assert not [row for row in json.loads(run('plugin', 'list', '--json')) if row['name'] == 'yylo-skills']
assert unrelated.read_bytes() == unrelated_bytes
assert (fixture / 'skills/ledger-tasks-yylo/SKILL.md').is_file()
print(f'PASS: validate, install, enable, eight-skill discovery, {len(expected)} canonical files, disable and uninstall')
print('NOT TESTED: model invocation, argument expansion, missing-runtime responses, Grok Bot desktop/cloud execution')
