# Multi-stage build for API service
# Security-hardened production Dockerfile

FROM node:18-alpine AS base
WORKDIR /app

# Install security updates and minimal dependencies
RUN apk add --no-cache \
    libc6-compat \
    dumb-init \
    curl \
    && apk upgrade \
    && rm -rf /var/cache/apk/*

# Install dependencies
FROM base AS deps
COPY package*.json ./
COPY turbo.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/graphql/package.json ./packages/graphql/
COPY services/api/package.json ./services/api/
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Development stage
FROM base AS development
WORKDIR /app
ENV NODE_ENV development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 4000
CMD ["npm", "run", "dev"]

# Production stage
FROM node:18-alpine AS production
WORKDIR /app

# Install only production dependencies and security updates
RUN apk add --no-cache \
    dumb-init \
    curl \
    && apk upgrade \
    && rm -rf /var/cache/apk/*

# Create non-root user with specific UID/GID
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --ingroup nodejs node

# Set security-focused environment variables
ENV NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=512" \
    NPM_CONFIG_CACHE=/tmp/.npm \
    HOME=/app

# Copy built application and dependencies with correct ownership
COPY --from=builder --chown=node:nodejs /app/services/api/dist ./dist
COPY --from=builder --chown=node:nodejs /app/services/api/package.json ./
COPY --from=deps --chown=node:nodejs /app/node_modules ./node_modules

# Create necessary directories with correct permissions
RUN mkdir -p /tmp/.npm /app/.cache \
    && chown -R node:nodejs /tmp/.npm /app/.cache

# Remove unnecessary files and packages
RUN rm -rf /usr/local/lib/node_modules/npm \
    && rm -rf /tmp/* /var/tmp/* \
    && find /app -type f -name "*.md" -delete \
    && find /app -type f -name "*.map" -delete

# Switch to non-root user
USER node

# Expose port (non-privileged port)
EXPOSE 4000

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:4000/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
