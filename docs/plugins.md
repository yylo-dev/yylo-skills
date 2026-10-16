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
