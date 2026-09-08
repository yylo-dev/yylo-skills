# YYLO Skills

Reusable agent skills maintained by [YYLO](https://yylo.dev). This repository is the canonical, independently versioned source for skills used by YYLO CLI and YYLO Ledger.

[![skills.sh](https://skills.sh/b/yylo-dev/yylo-skills)](https://skills.sh/yylo-dev/yylo-skills)

## Install

Install interactively with the open `skills` CLI:

```bash
npx skills add yylo-dev/yylo-skills
```

Install all skills for Claude Code, Codex, and Pi without prompts:

```bash
npx skills add yylo-dev/yylo-skills --skill '*' -a claude-code -a codex -a pi --copy -y
```

Install one skill:

```bash
npx skills add yylo-dev/yylo-skills --skill kanban-workflow
```

Review skill instructions and scripts before installing them. Published versions use immutable `vMAJOR.MINOR.PATCH` tags; `VERSION` identifies the repository release represented by the default branch.

## Skills

| Skill | Purpose |
| --- | --- |
| [`kanban-workflow`](skills/kanban-workflow/) | Operate YYLO Ledger task management safely and consistently. |
| [`understand-project`](skills/understand-project/) | Inspect architecture, dependencies, guidance, and validation before changing a project. |
| [`plan-kanban-tasks`](skills/plan-kanban-tasks/) | Turn an approved product requirement into implementation-sized Ledger tasks. |
| [`ralph-loop`](skills/ralph-loop/) | Execute exactly one explicitly assigned Ledger task through validated delivery. |

Each skill has one canonical cross-agent source under `skills/<slug>/`. Agent-specific variants are added only when a demonstrated runtime incompatibility makes them necessary.

## Repository layout

```text
skills.sh.json
skills/
├── kanban-workflow/
├── plan-kanban-tasks/
├── ralph-loop/
└── understand-project/
```

`skills.sh.json` controls grouping on skills.sh; it does not alter installation behavior.

## License

MIT
