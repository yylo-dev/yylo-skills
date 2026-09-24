# YYLO Skills

Reusable agent skills maintained by [YYLO](https://yylo.dev). This repository is the canonical, independently versioned source for skills used by YYLO CLI and YYLO Ledger.

[![skills.sh](https://skills.sh/b/yylo-dev/yylo-skills)](https://skills.sh/yylo-dev/yylo-skills)
[![Mentioned in Claude Skill Registry](https://awesome.re/mentioned-badge.svg)](https://github.com/majiayu000/claude-skill-registry)
[![Mentioned in Agent Skill Exchange](https://awesome.re/mentioned-badge.svg)](https://github.com/agentskillexchange/skills)
[![Mentioned in GAIA Skill Tree](https://awesome.re/mentioned-badge.svg)](https://github.com/gaia-research/gaia-skill-tree/blob/main/registry/named/yylo-dev/ledger-tasks-yylo.md)
[![Mentioned in Claude Skills Collection](https://awesome.re/mentioned-badge.svg)](https://github.com/abubakarsiddik31/claude-skills-collection)
[![Mentioned in Awesome Skills](https://awesome.re/mentioned-badge.svg)](https://github.com/gmh5225/awesome-skills)
[![Mentioned in SkillsAllYouNeed](https://awesome.re/mentioned-badge.svg)](https://github.com/kishormorol/SkillsAllYouNeed)
[![Featured in PM Skills Community](https://mohitagw15856.github.io/pm-claude-skills/assets/community-badge.svg)](https://github.com/mohitagw15856/pm-claude-skills/blob/main/COMMUNITY-SKILLS.md)

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

## Native delivery and compatible CLI installation

Version 2.1.0 source updates `benchmark-yylo` for Benchmark 0.2.0's breaking
thin-runner lifecycle: reviewed case, run, independent evaluate, report and
append-only disqualify. It documents workflow-prefix comparisons, interchangeable
harnesses and trusted-host hygiene without claiming a sandbox or mandatory pilot
ceremony. CLI 0.2.10 source requires skills `^2.1.0`. These are unreleased source
versions, not evidence of publication or an installed upgrade.

Version 2.0.4 introduced `benchmark-yylo`, completing the eight-skill set required
by CLI 0.2.9, whose source declared skills `^2.0.4`. Version 2.1.0 replaces that
skill's old Benchmark lifecycle guidance; inspect installed Benchmark help/version
before use. Existing 0.1.x study evidence retains its original interpretation.

Version 2.0.3 requires user-facing Record results to include the actual kind/profile,
immutable ID, and Ledger-returned slug. Missing fields must be reported as unavailable,
not guessed. Validator regressions protect this contract across all canonical skills.

Version 2.0.2 clarified optional read-only preflight, finish-enforced admission
and validation, explicit project tests/reviews outside merge, and native
`yy merge status|land|project` delivery with projection recovery. The canonical
Ralph implementation contract lives in `skills/ralph-loop-yylo/references/implement.md`;
edit it here, not in installed agent directories or old CLI template copies.

The current source contract places implementation, tests and commits with the
external agent. The CLI prepares workspaces and verifies delivery. Autonomous
task execution and budget recovery are retired; optional watch observation
never launches, retries, cancels or completes work. Explicit continuation must
preserve the workspace, historical evidence and current ownership checks.
These source changes require a separately reviewed immutable skills release;
source commits do not update already-installed skills or authorize publication.

A compatible YYLO CLI declares its supported skill range in `yyloSkills.version`.
Run `yy skills install` or `yy skills update` explicitly to select the latest
compatible stable release and update all three agent copies. Unchanged
receipt-owned skills upgrade without force; differing customized/unrecorded
copies require review. Unrecorded legacy copies remain preserved and flagged,
not silently deleted. CLI installation alone does not replace skills.

Validate before delivery with `node scripts/validate.mjs`. It checks nested
references for retired lifecycle instructions as well as invocation contracts
and plugin version parity. Run `node --test scripts/validate.test.mjs` for regression
coverage. Maintainers publish each new version with a new immutable tag; never
replace an existing release tag. `capabilities.json`
retains evidence for previously published releases; do not invent new release
hashes before publication.

## Universal Ledger retrieval guidance

The source skills teach `yy ledger get ID` (`yylo-ledger get ID` standalone) as
the universal read, with `task_`, `doc_`, and `artifact_` storage-kind prefixes for
new generated IDs and unchanged historical identities. PDR purpose does not
require a PDR prefix: new PDRs remain artifact/report, with historical
document/pdr still readable. See the
[retrieval guide](skills/ledger-tasks-yylo/references/retrieval.md) for bounded
search, hot/archive lookup, content limits, explicit bytes and refusal handling.

This source contract requires a matching Ledger runtime and a separately reviewed
skills release; it is not a claim that installed flat get already supports all
kinds. Inspect `get --help`; on task-only versions use native `record get` if
available, not trial-and-error typed commands. Source merge does not install,
activate, publish, or overwrite customized skills.

## Skills

| Skill | Purpose |
| --- | --- |
| [`ledger-tasks-yylo`](skills/ledger-tasks-yylo/) | Retrieve any Ledger Record by ID and operate tasks, dependencies and source-of-truth boundaries. |
| [`wiki-yylo`](skills/wiki-yylo/) | Find and maintain durable Markdown knowledge as revisioned Ledger Records. |
| [`workflow-yylo`](skills/workflow-yylo/) | Store and validate workflow Records while keeping execution separately authorized. |
| [`artifact-yylo`](skills/artifact-yylo/) | Capture and inspect durable, provenance-bound Ledger evidence. |
| [`benchmark-yylo`](skills/benchmark-yylo/) | Prepare reusable cases, compare models/harnesses and independently evaluate retained outputs. |
| [`understand-project-yylo`](skills/understand-project-yylo/) | Inspect the user project before planning or implementation. |
| [`plan-ledger-tasks-yylo`](skills/plan-ledger-tasks-yylo/) | Create a PDR and implementation-sized Ledger tasks. |
| [`ralph-loop-yylo`](skills/ralph-loop-yylo/) | Execute exactly one explicitly assigned Ledger task through validated delivery. |

The `benchmark-yylo` skill (for YYLO Benchmark / `yylo-benchmark` requests)
is included starting with version 2.0.4. Current source targets Benchmark 0.2.0:
historical tasks, arbitrary prompts and workflow prefixes; Pi, command and
Workflow Runner adapters; later independent judges without candidate reruns.
Execution, checks, opinions, errors and disqualification remain separate. Study
protocols may require pilot approval, but the runner adds no such ceremony.

The four Ledger Record skills are usable with standalone Ledger. The planning and execution skills rely on YYLO orchestration. Each skill has one canonical cross-agent source under `skills/<slug>/`; agent-specific variants are added only for demonstrated runtime incompatibility.

Ledger Record namespaces must be present in the installed `yylo-ledger --help` (or delegated `yy ledger --help`) before an agent uses them. Ledger stores and validates workflow Records but does not execute them.

## Repository layout

```text
skills.sh.json
skills/
├── artifact-yylo/
├── benchmark-yylo/
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
