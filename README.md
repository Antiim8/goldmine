# Goldmine

Monorepo:
- `web/` (Vite + React + TS)
- `server/` (Express + Prisma + Postgres)
- `ingesters/go/` (Go ingester)

## Dev
docker compose -f docker-compose.prod.yml up -d

## Useful
curl http://localhost/api/health
