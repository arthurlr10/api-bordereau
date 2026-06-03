#!/usr/bin/env bash
# Même traitement que POST /process, sans serveur (écrit samples/sortie.pdf)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PDF="${1:-$ROOT/samples/vinted-go.pdf}"
TRANSPORTEUR="${2:-vinted-go}"
ARTICLE="${3:-Mon article}"
node "$ROOT/scripts/preview.js" "$PDF" "$TRANSPORTEUR" "$ARTICLE"
cp "$ROOT/samples/${TRANSPORTEUR}-preview.pdf" "$ROOT/samples/sortie.pdf"
echo "Écrit: $ROOT/samples/sortie.pdf (identique au preview)"
