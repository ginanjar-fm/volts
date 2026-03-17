# ---------------------------------------------------------------------------
# Stage 1: Install dependencies
# ---------------------------------------------------------------------------
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# ---------------------------------------------------------------------------
# Stage 2: Build the application
# ---------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Dummy env vars so the build can complete without real secrets.
# next.config.ts must have `output: "standalone"` for this build to produce
# the standalone server bundle used in the runner stage.
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV AUTH_SECRET="build-time-placeholder"
ENV AUTH_URL="http://localhost:3000"
ENV STRIPE_SECRET_KEY="sk_test_build_placeholder"
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_build_placeholder"

RUN npm run build

# ---------------------------------------------------------------------------
# Stage 3: Production runner
# ---------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy the standalone server and required assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
