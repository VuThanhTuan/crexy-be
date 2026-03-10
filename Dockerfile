# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies for sharp (vips, python, build tools)
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    vips-dev

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install all dependencies needed for sharp and netcat for database health check
RUN apk add --no-cache \
    vips-dev \
    python3 \
    make \
    g++ \
    gcc \
    libc-dev \
    netcat-openbsd

# Copy package files
COPY package*.json ./

# Install production dependencies WITHOUT sharp first
RUN npm ci --only=production --omit=optional && \
    rm -rf node_modules/sharp || true

# Now install sharp specifically for Alpine Linux
RUN npm install sharp@0.33.5 --foreground-scripts --verbose && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose port
EXPOSE 3000

# Use entrypoint script
ENTRYPOINT ["docker-entrypoint.sh"]
