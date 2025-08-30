
# syntax=docker/dockerfile:1

FROM golang:1.22 AS build
WORKDIR /app
COPY go.mod ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /out/goldmine-ingester ./main.go

FROM gcr.io/distroless/base-debian12
COPY --from=build /out/goldmine-ingester /goldmine-ingester
ENTRYPOINT ["/goldmine-ingester"]
