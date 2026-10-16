"""Opt-in real Hermes installer/loader smoke test. No model calls or user config.

python3 scripts/smoke-hermes.py --hermes-python /path/to/hermes/venv/bin/python \
    --hermes-source /path/to/hermes-agent
"""
import argparse
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--hermes', default=shutil.which('hermes'))
parser.add_argument('--hermes-python', required=True)
parser.add_argument('--hermes-source', required=True)
args = parser.parse_args()
if not args.hermes:
    parser.error('hermes executable is required')
root = Path(__file__).resolve().parent.parent
# TemporaryDirectory owns only this test's generated fixture and configuration.
with tempfile.TemporaryDirectory(prefix='yylo-hermes-smoke-') as temp:
    home = Path(temp)
    source = home / 'source'
    source.mkdir()
    for name in ['plugin.json', 'skills-manifest.json', 'LICENSE']:
        shutil.copy2(root / name, source / name)
    shutil.copytree(root / 'skills', source / 'skills')
    env = {
        'PATH': os.environ['PATH'], 'HOME': str(home),
        'HERMES_HOME': str(home / '.hermes'), 'XDG_CONFIG_HOME': str(home / '.config'),
        'GIT_CONFIG_NOSYSTEM': '1', 'GIT_TERMINAL_PROMPT': '0',
        'GIT_AUTHOR_NAME': 'Packaging test', 'GIT_AUTHOR_EMAIL': 'test@example.invalid',
        'GIT_COMMITTER_NAME': 'Packaging test', 'GIT_COMMITTER_EMAIL': 'test@example.invalid',
    }
    def run(argv):
        result = subprocess.run(argv, cwd=home, env=env, text=True, capture_output=True,
                                stdin=subprocess.DEVNULL, timeout=120)
        print(result.stdout, end='')
        print(result.stderr, end='')
        result.check_returncode()
        return result.stdout
    run(['git', 'init', str(source)])
    run(['git', '-C', str(source), 'add', '.'])
    run(['git', '-C', str(source), 'commit', '-m', 'Isolated portable plugin fixture'])
    run([args.hermes, 'plugins', 'install', source.as_uri(), '--no-enable'])
    run([args.hermes, 'plugins', 'list'])
    run([args.hermes, 'plugins', 'enable', 'yylo-skills'])
    installed = home / '.hermes/plugins/yylo-skills'
    code = r'''
import json, sys
from pathlib import Path
sys.path.insert(0, sys.argv[1])
from hermes_cli.agent_plugins import load_agent_plugin
root = Path(sys.argv[2])
package = load_agent_plugin(root, Path(sys.argv[3]))
expected = set(json.loads((root / 'skills-manifest.json').read_text())['skills'])
assert {s.name for s in package.skills} == expected
assert not package.mcp_servers
for skill in package.skills:
    assert skill.skill_md.is_file()
    assert skill.description
print('Hermes portable loader discovered all', len(expected), 'skills with descriptions')
for diagnostic in package.diagnostics:
    print('loader diagnostic:', diagnostic)
'''
    run([args.hermes_python, '-c', code, args.hermes_source, str(installed), str(home / 'plugin-data')])
    for file in (source / 'skills').rglob('*'):
        if file.is_file():
            assert file.read_bytes() == (installed / 'skills' / file.relative_to(source / 'skills')).read_bytes()
    run([args.hermes, 'plugins', 'disable', 'yylo-skills'])
    print('PASS: isolated install, enable, loader discovery, resource parity and disable; no model invocation tested')
