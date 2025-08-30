#!/usr/bin/env bash
# Sends a demo "insert" event to the streamer to prove live updates work.
# Edit STREAMER_URL / TOKEN if you changed them.

STREAMER_URL="${STREAMER_URL:-http://localhost:3100/emit}"
TOKEN="${STREAMER_AUTH_TOKEN:-change-me}"

ts=$(date +%s)
payload=$(cat <<JSON
{
  "type": "insert",
  "table": "items",
  "row": { "id": $ts, "name": "demo-$ts", "note": "hello from send.sh" }
}
JSON
)

curl -s -X POST "$STREAMER_URL" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$payload" && echo
