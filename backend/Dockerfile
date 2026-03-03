# Multi-stage build for production deployment

# First stage: Dependencies and build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install dependencies — prefer pnpm if lockfile exists, fall back to npm
RUN if [ -f pnpm-lock.yaml ]; then \
    npm install -g pnpm && \
    pnpm install --frozen-lockfile; \
    else \
    npm ci --omit=dev || npm install --omit=dev; \
    fi

# Copy source code
COPY . .

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy node_modules from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy package.json
COPY --from=builder /app/package.json ./

# Copy source code
COPY --from=builder /app/server.js ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/config ./config
COPY --from=builder /app/.sequelizerc ./

# Development stage (same as production but with all deps)
FROM node:18-alpine AS development

WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml* ./

RUN if [ -f pnpm-lock.yaml ]; then \
    npm install -g pnpm && \
    pnpm install; \
    else \
    npm install; \
    fi

COPY . .

# Expose port 4000
EXPOSE 4000

# Start the application
CMD ["node", "server.js"]
