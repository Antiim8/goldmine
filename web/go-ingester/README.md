
# Goldmine Ingester (Go)

Posts deals to your Node API (`/api/deals`) with retries, rate limiting, and bulk ingest.

## Files
- `main.go` — program entry
- `go.mod` — module file (change module name if you like)
- `deals.json` — sample array to ingest
- `Makefile` — simple run/build targets
- `Dockerfile` — optional container build
- `.gitignore`

## Run locally
```bash
cd go-ingester
go mod tidy
export GOLDMINE_API_URL=http://localhost:3001
go run . -file ./deals.json -concurrency 8 -rps 10
```

## Build
```bash
go build -o goldmine-ingester ./main.go
./goldmine-ingester -file ./deals.json
```

## Docker
```bash
docker build -t goldmine-ingester .
docker run --rm -e GOLDMINE_API_URL=http://host.docker.internal:3001 goldmine-ingester -file /deals.json
```
(If you want to bundle the JSON: `docker run -v $PWD/deals.json:/deals.json:ro ...`)
