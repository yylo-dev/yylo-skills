# YYLO Skills

Reusable agent skills maintained by [YYLO](https://yylo.dev). This repository is the canonical, independently versioned source for skills used by YYLO CLI and YYLO Ledger.

[![skills.sh](https://skills.sh/b/yylo-dev/yylo-skills)](https://skills.sh/yylo-dev/yylo-skills)
[![Mentioned in Claude Skill Registry](https://awesome.re/mentioned-badge.svg)](https://github.com/majiayu000/claude-skill-registry)
[![Mentioned in Agent Skill Exchange](https://awesome.re/mentioned-badge.svg)](https://github.com/agentskillexchange/skills)
[![Mentioned in GAIA Skill Tree](https://awesome.re/mentioned-badge.svg)](https://github.com/gaia-research/gaia-skill-tree/blob/main/registry/named/yylo-dev/ledger-tasks-yylo.md)

## Install

Install interactively with the open `skills` CLI:

```bash
npx skills add yylo-dev/yylo-skills
```

Install all skills for Claude Code, Codex, and Pi without prompts:

```bash
npx skills add yylo-dev/yylo-skills --skill '*' -a claude-code -a codex -a pi --copy -y
```

Install one skill by user-intent-first name:

```bash
npx skills add yylo-dev/yylo-skills --skill wiki-yylo
```

Every canonical slug ends in `-yylo`, keeping selector prefixes useful: type `w` for wiki/workflow, `a` for artifacts, `p` for planning, `r` for the Ralph loop, or `u` for project understanding. Review skill instructions and scripts before installing them. Published versions use immutable `vMAJOR.MINOR.PATCH` tags; `VERSION` identifies the repository release represented by the default branch.

## Skills

| Skill | Purpose |
| --- | --- |
| [`ledger-tasks-yylo`](skills/ledger-tasks-yylo/) | Operate YYLO Ledger task management and source-of-truth boundaries. |
| [`wiki-yylo`](skills/wiki-yylo/) | Find and maintain durable Markdown knowledge as revisioned Ledger Records. |
| [`workflow-yylo`](skills/workflow-yylo/) | Store and validate workflow Records while keeping execution separately authorized. |
| [`artifact-yylo`](skills/artifact-yylo/) | Capture and inspect durable, provenance-bound Ledger evidence. |
| [`understand-project-yylo`](skills/understand-project-yylo/) | Inspect the user project before planning or implementation. |
| [`plan-ledger-tasks-yylo`](skills/plan-ledger-tasks-yylo/) | Create a PDR and implementation-sized Ledger tasks. |
| [`ralph-loop-yylo`](skills/ralph-loop-yylo/) | Execute exactly one explicitly assigned Ledger task through validated delivery. |

The four Ledger Record skills are usable with standalone Ledger. The planning and execution skills rely on YYLO orchestration. Each skill has one canonical cross-agent source under `skills/<slug>/`; agent-specific variants are added only for demonstrated runtime incompatibility.

Ledger Record namespaces must be present in the installed `yylo-ledger --help` (or delegated `yy ledger --help`) before an agent uses them. Ledger stores and validates workflow Records but does not execute them.

## Repository layout

```text
skills.sh.json
skills/
├── artifact-yylo/
├── ledger-tasks-yylo/
├── plan-ledger-tasks-yylo/
├── ralph-loop-yylo/
├── understand-project-yylo/
├── wiki-yylo/
└── workflow-yylo/
```

`skills.sh.json` controls grouping on skills.sh; it does not alter installation behavior.

## License

MIT
