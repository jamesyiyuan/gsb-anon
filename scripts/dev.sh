#!/bin/bash
# Loads nvm if present so `npm` resolves even in a shell without profile
# scripts sourced (e.g. an editor/tool-launched process). Falls back to
# whatever's already on PATH otherwise.
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

cd "$(dirname "$0")/.."
exec npm run dev
