# ==============================================================================
# Multi-stage Dockerfile for ResumeCraft AI (Node.js + Express + Vite + React)
# ==============================================================================

# Stage 1: Build frontend and backend
FROM node:22-alpine AS builder

WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

# Copy package manifests and patch folder (required for wouter patch)
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Install all dependencies (tolerant to lockfile sync differences across git pulls)
RUN pnpm install || pnpm install --no-frozen-lockfile

# Copy source code and config
COPY tsconfig.json vite.config.ts ./
COPY client ./client
COPY server ./server
COPY shared ./shared
COPY drizzle ./drizzle
COPY scripts ./scripts

# Build frontend (Vite) and backend (esbuild)
RUN pnpm build

# Stage 2: Production runner
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

# Copy package manifests and patches for production dependencies
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Install production dependencies only (tolerant to lockfile sync differences)
RUN pnpm install --prod || pnpm install --prod --no-frozen-lockfile

# Copy build artifacts and migrations from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle

# Expose HTTP port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/ || exit 1

# Start the application
CMD ["node", "dist/index.js"]
