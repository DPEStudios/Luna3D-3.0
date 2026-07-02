#!/bin/sh
# Copia el hook pre-commit a .git/hooks. Correr una vez por clon.
ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"
[ -z "$ROOT" ] && { echo "No estás dentro del repo git."; exit 1; }
cp "$ROOT/_tools/pre-commit" "$ROOT/.git/hooks/pre-commit"
chmod +x "$ROOT/.git/hooks/pre-commit"
echo "Hook instalado en .git/hooks/pre-commit — el guardián correrá en cada commit."
