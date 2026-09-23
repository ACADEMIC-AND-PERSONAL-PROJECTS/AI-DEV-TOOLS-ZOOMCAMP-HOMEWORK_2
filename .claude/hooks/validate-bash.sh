#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)

BLOCKED_PATTERNS=(
  'rm -rf /'
  'rm -rf ~'
  'rm -rf /*'
  'git push --force'
  'git push -f'
  'git reset --hard'
  'drop database'
  'DROP DATABASE'
  'pg_ctl -D'
  'mkfs'
  ':(){ :|:& };:'
)

COMMAND=$(printf '%s' "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null || true)

if [ -z "$COMMAND" ]; then
  exit 0
fi

for pattern in "${BLOCKED_PATTERNS[@]}"; do
  if printf '%s' "$COMMAND" | grep -qF -- "$pattern"; then
    printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Commande destructive bloquee par le hook (pattern: %s)"}}' "$pattern"
    exit 0
  fi
done

exit 0