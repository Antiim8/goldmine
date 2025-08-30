# Install deps with devDependencies (prisma CLI)
FROM node:20-bullseye-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build TypeScript and do an initial generate (optional)
FROM deps AS builder
WORKDIR /app
COPY prisma ./prisma
RUN npx prisma generate
COPY tsconfig.json ./tsconfig.json
COPY src ./src
RUN npm run build

# Final runtime image (Debian; install openssl)
FROM node:20-bullseye-slim
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

# Bring in node_modules (includes prisma CLI and @prisma/client pkg)
COPY --from=deps /app/node_modules ./node_modules

# Bring schema and generate Prisma client **in the final image**
COPY prisma ./prisma
RUN npx prisma generate

# Bring the compiled JS
COPY --from=builder /app/dist ./dist

# On start: try migrate; if fails (first run), db push; then start api
CMD sh -c "npx prisma migrate deploy || npx prisma db push; node dist/index.js"
