"""Check builder output; only the declared Bash shebang may be rewritten."""
import json
from pathlib import Path
import sys

source, output = map(Path, sys.argv[1:])
assert json.loads((source / 'plugin.json').read_text()) == json.loads((output / 'plugin.json').read_text())
expected = {p.relative_to(source / 'skills') for p in (source / 'skills').rglob('*') if p.is_file()}
actual = {p.relative_to(output / 'skills') for p in (output / 'skills').rglob('*') if p.is_file()}
assert expected == actual, (expected - actual, actual - expected)
for relative in sorted(expected):
    before = (source / 'skills' / relative).read_bytes()
    after = (output / 'skills' / relative).read_bytes()
    if relative.as_posix() == 'ralph-loop-yylo/scripts/kanban.sh':
        first, rest = after.split(b'\n', 1)
        assert before.startswith(b'#!/usr/bin/env bash\n')
        assert first == ('#!' + str(output / 'bin/bash')).encode(), first
        assert (output / 'bin/bash').is_file()
        assert rest == before.split(b'\n', 1)[1], relative
    else:
        assert before == after, relative
print(f'Validated {len(expected)} packaged skill/resources; only declared Bash shebang rewritten')
