FROM golang:1.22-alpine AS build
WORKDIR /src
COPY go.mod ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /out/ingester ./main.go

FROM gcr.io/distroless/base-debian12
ENV GOLDMINE_API_URL=http://api:3001
ENV API_KEY=
WORKDIR /
COPY --from=build /out/ingester /ingester
VOLUME ["/data"]
ENTRYPOINT ["/ingester"]
