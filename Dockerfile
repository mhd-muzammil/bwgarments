# ── Stage 1: Build client ──
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# ── Stage 2: Production server ──
FROM node:20-alpine AS production
WORKDIR /app

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Copy server source
COPY server/ ./server/

# Copy built client into server's public dir
COPY --from=client-build /app/client/dist ./server/public

# Create logs directory
RUN mkdir -p ./server/logs

WORKDIR /app/server

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://localhost:5000/api/health || exit 1

CMD ["node", "server.js"]
