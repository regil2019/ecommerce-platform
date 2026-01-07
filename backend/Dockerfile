# ===============================
# Backend Dockerfile (Fly.io)
# Production-ready
# ===============================

FROM node:20-alpine

# Install minimal required packages
RUN apk add --no-cache \
    dumb-init \
    curl

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json* ./

# Install production dependencies
RUN npm install --production

# Copy application source
COPY . .

# Set environment
ENV NODE_ENV=production

# Fly.io uses PORT env (usually 8080)
EXPOSE 8080

# Health check (Fly compatible)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

# Proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start app
CMD ["node", "server.js"]
