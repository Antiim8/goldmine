
BIN=goldmine-ingester

run:
	GOLDMINE_API_URL?=http://localhost:3001
	go run . -file ./deals.json

build:
	CGO_ENABLED=0 go build -o $(BIN) ./main.go

tidy:
	go mod tidy
