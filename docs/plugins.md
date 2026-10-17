# Host plugin packaging

All manifests expose the same canonical `skills/` tree. They do not bundle YYLO
runtimes, grant permissions, install hooks, or automatically execute workflows.
Use one installation route per host to avoid duplicate skill identities.

## Cursor

`.cursor-plugin/plugin.json` is a Cursor-format plugin, not a renamed Claude
manifest. It declares the eight skill directories explicitly. Add the repository
through the plugin-capable Cursor client's marketplace/install UI, following that
client's current documentation. A local source manifest does not mean the plugin
has been accepted into Cursor's official marketplace. Older `cursor-agent` CLIs
without plugin commands cannot validate or install this format; use a supported
client rather than interpreting their generic help output as installation success.

The manifest targets the schema at
[cursor/plugins ac4e25a](https://github.com/cursor/plugins/blob/ac4e25a0064cd600afdd605208bad72748cb019a/schemas/plugin.schema.json).
Only supported author fields are emitted. Regenerate after changing the canonical
Claude metadata or skill inventory:

```bash
node scripts/sync-plugins.mjs
node scripts/sync-plugins.mjs --check
node scripts/validate.mjs
node --test scripts/*.test.mjs
```

The checked-in manifest is versioned with the skills source. Generation is local
and deterministic; it never calls a registry or publishes anything.

## Hermes (portable Agent Plugins)

Root `plugin.json` targets Agent Plugins **1.0.0**, the portable subset supported
by Hermes. It uses fixed `skills/<name>/SKILL.md` locations; no native Python
plugin, tools, MCP server or hooks are necessary.

After this source is publicly available:

```bash
hermes plugins install yylo-dev/yylo-skills --no-enable
hermes plugins list
hermes plugins enable yylo-skills
```

Use `skills_list` and `skill_view` to discover the qualified names. Hermes gives
portable skills an `agent-plugin-<slug>-<hash>` namespace; do not hardcode it.
Installation and enablement are separate intentional actions. A local development
clone can be tested with `hermes plugins install file:///absolute/checkout
--no-enable` in a disposable `HERMES_HOME`; the installer reads committed bytes.

Maintainers can run the no-model installer/loader test with
`python3 scripts/smoke-hermes.py --hermes-python /path/to/hermes/venv/bin/python
--hermes-source /path/to/hermes-agent`. It creates and removes only its own
temporary Git fixture/profile, checks all eight skills/resources, and does not
grant built-in-tool override. This tests loading, not user-prompt preprocessing.

The Revell index requires an entry pinned to the **full 40-character public
commit SHA**. Add one plugin per PR, owned/maintained by the submitter. Do not
submit an unpublished local SHA. Hermes archive repository cards have a separate
>50,000-star gate; a working plugin only establishes a possible Skills/workflow
submission, not a repository-card exemption.

## Nix

The flake pins `agent-stacks/agent-pkgs` and follows its nixpkgs. It uses that
collection's `buildAgentPlugin` builder and mandatory `check-plugin` validation:

```bash
nix build .#agent-plugin-yylo-skills
nix flake check
```

The result is `result/share/agent-plugins/yylo-skills/{plugin.json,skills/}`.
The resource-parity check compares every skill/reference with canonical source,
allowing only the bundled forwarding script's declared Bash shebang rewrite.
Bash is included for that script. This is a **skills package**, not a complete
YYLO runtime stack: Markdown command mentions do not create Nix dependencies. Provide compatible YYLO CLI,
Ledger and Benchmark separately in the consuming environment.

For submission to `agent-pkgs`, wait for a reviewed public source commit, then
use its importer rather than hand-authoring a source hash:

```bash
# In a fresh agent-pkgs contribution checkout
nix run .#agent-stacks -- import yylo-dev/yylo-skills --out pkgs
# Review the generated source.json rev/hash, skill inventory and warnings.
git add pkgs/agent-plugin-yylo-skills
nix build .#agent-plugin-yylo-skills
```

Commit its generated `source.json` and `default.nix` only. Keep installation
checks enabled and disclose unresolved runtime prerequisites. The local flake
is not itself a submitted upstream package.

## DeepSeek Harness (DSH)

The root `package.json` declares `dsh.bundle.patch`; `dsh/cordis.patch.yml`
mounts the dependency-free `dsh/index.mjs` skill provider. It registers with
`ctx.skills`, exposes all eight canonical bodies and resource directories, and
lets Cordis remove the registration on unload. It installs no tools, UI, hooks,
automatic execution loop or YYLO runtimes. Use a profile/preset with skill
loading enabled; a minimal preset does not gain a skill tool from this bundle.

After the reviewed source is public, install into an existing profile:

```bash
dsh plugin --profile web add github:yylo-dev/yylo-skills
```

For a local development check, with Node 22 and pnpm available:

```bash
node scripts/sync-dsh.mjs
export DSH_HOME="$(mktemp -d)"
dsh --profile yylo-test --from-default-profile web --dump-config
# A local tarball exercises the distributable package, rather than a source link.
npm pack --ignore-scripts --pack-destination "$DSH_HOME"
dsh plugin --profile yylo-test add "$DSH_HOME"/yylo-skills-*.tgz
dsh --profile yylo-test --dump-config
```

Be explicit about `DSH_HOME` even for profile-scoped help: some CLI versions
initialize a profile before delegating `--help` to pnpm. Do not modify an existing
user profile for smoke tests. The package is marked private to prevent accidental
npm publication; Git and local tarball installation remain available.

The minimum targeted DSH version is `0.2.0-rc.2`. Maintainers can exercise that
version's real Cordis registry without a model request:

```bash
runtime="$(mktemp -d)"
npm install --prefix "$runtime" --ignore-scripts --no-audit --no-fund @deepseek-ai/dsh@0.2.0-rc.2
node scripts/smoke-dsh.mjs "$runtime"
```

The adapter preserves skill bodies verbatim after removing frontmatter; user
request text remains owned by the host. It does not interpret `$ARGUMENTS` as
shell code or add a custom argument-substitution protocol. Static and no-model
host checks are not an end-to-end model-execution certification.

## Runtime and invocation requirements

- Ledger skills: a compatible `yylo-ledger`, or `yy ledger` in its controller.
- Planning/execution: YYLO CLI, a registered controller and hydrated task worktrees.
- Benchmark: compatible YYLO Benchmark and the chosen experiment dependencies.
- Inspect installed help before using optional commands. Missing prerequisites
  must produce an actionable setup instruction, never a pretend successful task.
- Preserve the user's request literally. `$ARGUMENTS`, `$1`, and `$2` are invocation
  placeholders, not shell code. A host that does not expand them needs a tested
  invocation adapter before claiming equivalent invocation semantics.
- Resolve `references/` and examples relative to the installed skill directory.
  Marketplace namespacing may change the invocation name; use host discovery.

## Host acceptance checklist

Static manifest checks are necessary but do not establish host compatibility.
Before advertising a host/version as tested, use a fresh temporary profile to:

1. Install the package without touching existing user skills or credentials.
2. Discover all eight skills; load a Ledger skill and its referenced guide.
3. Verify the complete user request (including quotes, dollar signs and newlines)
   arrives literally, and relative resources resolve inside the installed package.
4. Run one authorized operation against a disposable Ledger project; verify missing
   runtime dependencies fail clearly. Do not test against a user's live board.
5. Verify removal leaves unrelated installed skills intact.

Record the host version and actual checks performed separately. Do not equate JSON
validation, a downloaded package, or a marketplace listing with an executed skill.
