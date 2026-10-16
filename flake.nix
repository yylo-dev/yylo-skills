{
  description = "Canonical YYLO skills in the portable Agent Plugins layout";

  inputs.agent-pkgs.url = "github:agent-stacks/agent-pkgs/93f2c24d5687b969309bf21915b0f0a0145f997a";
  inputs.nixpkgs.follows = "agent-pkgs/nixpkgs";

  outputs = { self, agent-pkgs, nixpkgs }:
    let
      systems = [ "x86_64-linux" "aarch64-linux" "aarch64-darwin" ];
      eachSystem = nixpkgs.lib.genAttrs systems;
      pluginFor = system: import ./nix {
        inherit (agent-pkgs.lib.${system}) buildAgentPlugin;
      };
    in {
      packages = eachSystem (system: {
        agent-plugin-yylo-skills = pluginFor system;
        default = pluginFor system;
      });
      checks = eachSystem (system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
          plugin = pluginFor system;
        in {
          # buildAgentPlugin also runs the upstream check-plugin validator.
          plugin = plugin;
          resources = pkgs.runCommand "yylo-skills-resource-parity" { } ''
            ${pkgs.python3}/bin/python3 ${./nix/check-resources.py} \
              ${./.} ${plugin}/share/agent-plugins/yylo-skills
            touch "$out"
          '';
        });
    };
}
