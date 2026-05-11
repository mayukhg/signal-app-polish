#!/usr/bin/env bash
# Signals — shutdown script (macOS / Linux)
# Usage: ./scripts/stop.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${PORT:-5173}"
PID_FILE="$ROOT/.run/dev.pid"

stop_pid_tree() {
  local pid="$1"
  # Kill children first, then the parent. Works on macOS + Linux.
  if command -v pkill >/dev/null 2>&1; then
    pkill -TERM -P "$pid" 2>/dev/null || true
  fi
  kill -TERM "$pid" 2>/dev/null || true
  sleep 1
  kill -KILL "$pid" 2>/dev/null || true
}

if [ -f "$PID_FILE" ]; then
  PID="$(cat "$PID_FILE")"
  if kill -0 "$PID" 2>/dev/null; then
    echo "Stopping Signals dev server (PID $PID)..."
    stop_pid_tree "$PID"
  fi
  rm -f "$PID_FILE"
fi

# Fallback: anything still on $PORT
if command -v lsof >/dev/null 2>&1; then
  STRAY="$(lsof -ti tcp:"$PORT" 2>/dev/null || true)"
  if [ -n "$STRAY" ]; then
    echo "Killing stray processes on port $PORT: $STRAY"
    echo "$STRAY" | xargs -r kill -TERM 2>/dev/null || true
    sleep 1
    echo "$STRAY" | xargs -r kill -KILL 2>/dev/null || true
  fi
fi

echo "Stopped."
