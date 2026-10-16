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
