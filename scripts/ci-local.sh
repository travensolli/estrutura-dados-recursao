#!/bin/sh
# Reproduz localmente as checagens do CI.
set -eu
cd "$(dirname "$0")/.."

base=$(git merge-base develop HEAD 2>/dev/null || git rev-list --max-parents=0 HEAD | tail -1)
if [ "$base" != "$(git rev-parse HEAD)" ]; then
  echo "== commitlint de $base até HEAD"
  pnpm exec commitlint --from "$base" --to HEAD --verbose
fi

echo "== lint";        pnpm lint
echo "== prettier";    pnpm format:check
echo "== typecheck";   pnpm typecheck
echo "== testes";      pnpm test
echo "== build";       pnpm build
echo "CI local: tudo passou"
