#!/usr/bin/env bash
# Signals — startup script (macOS / Linux)
# Usage: ./scripts/start.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PORT="${PORT:-5173}"
RUN_DIR="$ROOT/.run"
PID_FILE="$RUN_DIR/dev.pid"
LOG_FILE="$RUN_DIR/dev.log"

mkdir -p "$RUN_DIR"

# Prereq: Node 20+
if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: Node.js is not installed. Install Node 20+ from https://nodejs.org" >&2
  exit 1
fi
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo "ERROR: Node $NODE_MAJOR detected. Signals requires Node 20 or newer." >&2
  exit 1
fi

# Already running?
if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  echo "Signals dev server is already running (PID $(cat "$PID_FILE"))."
  echo "Open http://localhost:$PORT  —  stop it with ./scripts/stop.sh"
  exit 2
fi

# Pick package manager
if command -v bun >/dev/null 2>&1; then PM=bun
elif command -v pnpm >/dev/null 2>&1; then PM=pnpm
elif command -v npm  >/dev/null 2>&1; then PM=npm
else
  echo "ERROR: no package manager found (need bun, pnpm, or npm)." >&2
  exit 1
fi

# Install deps if missing
if [ ! -d node_modules ]; then
  echo "Installing dependencies with $PM..."
  $PM install
fi

# Seed .env from .env.example on first run
if [ ! -f .env ] && [ -f .env.example ]; then
  cp .env.example .env
  echo "Created .env from .env.example (driver=memory)."
fi

# Launch dev server in background
echo "Starting Signals on http://localhost:$PORT ..."
PORT="$PORT" nohup $PM run dev >"$LOG_FILE" 2>&1 &
echo $! >"$PID_FILE"

sleep 1
if ! kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  echo "ERROR: dev server failed to start. See $LOG_FILE" >&2
  rm -f "$PID_FILE"
  exit 1
fi

echo "Started (PID $(cat "$PID_FILE")). Logs: $LOG_FILE"
echo "Stop with: ./scripts/stop.sh"
