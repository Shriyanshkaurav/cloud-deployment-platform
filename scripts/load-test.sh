#!/usr/bin/env bash
set -euo pipefail

TARGET_URL="${1:-http://localhost:8080/}"
REQUESTS="${2:-1000}"
CONCURRENCY="${3:-50}"

if ! command -v curl >/dev/null 2>&1; then
  echo "ERROR: curl is required."
  exit 1
fi

if ! command -v xargs >/dev/null 2>&1; then
  echo "ERROR: xargs is required."
  exit 1
fi

if ! [[ "$REQUESTS" =~ ^[1-9][0-9]*$ ]] ||
   ! [[ "$CONCURRENCY" =~ ^[1-9][0-9]*$ ]]; then
  echo "Usage: $0 [URL] [positive-request-count] [positive-concurrency]"
  exit 2
fi

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

echo "Target: $TARGET_URL"
echo "Requests: $REQUESTS"
echo "Concurrency: $CONCURRENCY"
echo "Starting test..."

START="$(date +%s)"

seq 1 "$REQUESTS" |
  xargs -P "$CONCURRENCY" -I '{}' \
    sh -c 'curl -sS -o /dev/null -w "%{http_code} %{time_total}\n" "$1" || echo "000 0"' _ "$TARGET_URL" \
    > "$TMP_DIR/results.txt"

END="$(date +%s)"
ELAPSED=$((END - START))

echo
echo "HTTP status counts:"
awk '{count[$1]++} END {for (status in count) print status, count[status]}' \
  "$TMP_DIR/results.txt" | sort

echo
echo "Total requests: $REQUESTS"
echo "Elapsed seconds: $ELAPSED"
if (( ELAPSED > 0 )); then
  echo "Approximate requests/second: $((REQUESTS / ELAPSED))"
fi
echo "Results saved only for this run; this script does not establish an SLA."
