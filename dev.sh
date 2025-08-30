#!/usr/bin/env bash
set -e

# always resolve to repo root (directory where this script lives)
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

echo "🔪 Cleaning up old processes on ports 3000, 3001, 3100, 5173..."
for port in 3000 3001 3100 5173; do
  pid=$(lsof -t -i :$port || true)
  if [ -n "$pid" ]; then
    echo "  killing PID $pid on port $port"
    kill -9 $pid || true
  fi
done

echo "🚀 Starting goldmine dev environment"

echo "➡️  Starting server on :3000"
(cd "$ROOT/server" && npm run dev) &

echo "➡️  Starting streamer on :3100"
(cd "$ROOT/streamer" && npm run dev) &

echo "➡️  Starting web on :5173 (this will stay in foreground)"
(cd "$ROOT/web" && npm run dev)
