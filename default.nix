{ pkgs ? import <nixpkgs> {} }:

pkgs.stdenv.mkDerivation {
  name = "my-project-tests";
  src = ./.; 
  buildInputs = [ pkgs.bash ]; 
  buildPhase = ''
    ./.idx/dev.nix.test 
  '';
}
