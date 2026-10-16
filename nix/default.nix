# Repository-local counterpart of agent-pkgs' generated import package.
# Upstream submissions must use agent-stacks import to capture a public rev/hash.
{ buildAgentPlugin }:
let
  manifest = builtins.fromJSON (builtins.readFile ../plugin.json);
  release = builtins.fromJSON (builtins.readFile ../skills-manifest.json);
in
buildAgentPlugin {
  inherit (manifest) name version;
  inherit manifest;
  src = ../.;
  sourceUrl = manifest.repository;
  skills = builtins.mapAttrs (name: _: "skills/${name}") release.skills;
  # The bundled Kanban forwarding script needs Bash. YYLO executables remain
  # user prerequisites; this is not a self-contained YYLO runtime stack.
  requiredRuntimes = [ "bash" ];
  meta = {
    description = "YYLO skills for task, knowledge and evidence workflows";
    homepage = manifest.repository;
    license = "MIT";
  };
}
