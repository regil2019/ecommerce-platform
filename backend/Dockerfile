# Multi-stage build for production deployment on Koyeb

# First stage: Dependencies and build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Second stage: Runtime
FROM node:18-alpine AS runtime

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

# Expose port 4000
EXPOSE 4000

# Run migrations and start the application
CMD ["sh", "-c", "npm run migrate:latest && node server.js"]
