#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_PORT="${API_PORT:-3000}"
STREAMER_PORT="${STREAMER_PORT:-3100}"
WEB_PORT="${WEB_PORT:-5173}"
DB_PORT="${DB_PORT:-55432}"
DB_CONTAINER="${DB_CONTAINER:-goldmine-postgres}"

cd "$ROOT"
trap 'echo; echo "🧹 Shutting down background processes..."; kill 0 2>/dev/null || true' EXIT

echo "🔪 Killing processes on ports: $API_PORT, $STREAMER_PORT, $WEB_PORT, 5432, 5433, $DB_PORT"
for p in "$API_PORT" "$STREAMER_PORT" "$WEB_PORT" 5432 5433 "$DB_PORT"; do
  pid="$(lsof -t -i :"$p" 2>/dev/null || true)"
  [ -n "$pid" ] && { echo "  killing PID(s) $pid on :$p"; kill -9 $pid 2>/dev/null || true; }
done

echo "🐘 (Re)starting Postgres container on :$DB_PORT..."
docker rm -f "$DB_CONTAINER" >/dev/null 2>&1 || true
docker run --name "$DB_CONTAINER" -d -p "$DB_PORT":5432 \
  -e POSTGRES_USER=goldmine -e POSTGRES_PASSWORD=goldmine -e POSTGRES_DB=goldmine \
  postgres:16 >/dev/null

echo -n "⏳ Waiting for Postgres to be ready"
until docker logs "$DB_CONTAINER" 2>&1 | grep -q "database system is ready to accept connections"; do
  echo -n "."
  sleep 1
done
echo

echo "🧰 Prisma generate + migrate"
( cd "$ROOT/server" && npx prisma generate >/dev/null && (npx prisma migrate deploy || npx prisma migrate dev --name init) )

echo "🚀 Starting services"
echo "➡️  server :$API_PORT"
( cd "$ROOT/server" && npm run dev ) &

echo "➡️  streamer :$STREAMER_PORT"
( cd "$ROOT/streamer" && npm run dev ) &

echo "➡️  web :$WEB_PORT (foreground, Ctrl+C to stop all)"
( cd "$ROOT/web" && npm run dev )
