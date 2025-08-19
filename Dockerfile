# TECHNO-ETL v2.1.0 - Professional Production Dockerfile
# Author: Mounir Abderrahmani (mounir.ab@techno-dz.com)
# Multi-stage build for optimal production image

# ============================================
# Stage 1: Build Frontend (React + Vite)
# ============================================
FROM node:18-alpine AS frontend-builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY .babelrc.js ./
COPY vite.config.js ./

# Install dependencies with production optimizations
RUN npm ci --silent --no-audit --prefer-offline

# Copy source code
COPY src ./src
COPY public ./public
COPY index.html ./

# Build frontend for production
ENV NODE_ENV=production
RUN npm run build:frontend:optimized

# ============================================
# Stage 2: Build Backend (Node.js + Express)
# ============================================
FROM node:18-alpine AS backend-builder

# Set working directory
WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --silent --no-audit --prefer-offline

# Copy backend source code
COPY backend ./

# Build backend for production
ENV NODE_ENV=production
RUN npm run build:prod

# ============================================
# Stage 3: Production Runtime
# ============================================
FROM node:18-alpine AS production

# Install system dependencies
RUN apk add --no-cache \
    tini \
    curl \
    bash \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S techno && \
    adduser -S techno -u 1001

# Set working directory
WORKDIR /app

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/dist ./public

# Copy built backend from builder stage  
COPY --from=backend-builder /app/backend/dist ./backend
COPY --from=backend-builder /app/backend/package.json ./backend/

# Install only production dependencies for backend
WORKDIR /app/backend
RUN npm ci --production --silent --no-audit

# Copy additional configuration files
WORKDIR /app
COPY --from=backend-builder /app/backend/ecosystem.config.cjs ./
COPY --from=backend-builder /app/backend/production.config.js ./

# Create necessary directories
RUN mkdir -p /app/logs /app/uploads /app/cache && \
    chown -R techno:techno /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000
ENV FRONTEND_PORT=3000
ENV LOG_LEVEL=info

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# Expose ports
EXPOSE 3000 5000

# Use tini as entrypoint for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Switch to non-root user
USER techno

# Create startup script
COPY <<EOF /app/start.sh
#!/bin/bash
set -e

echo "🚀 Starting TECHNO-ETL v2.1.0"
echo "👨‍💻 Built by: Mounir Abderrahmani"
echo "📧 Contact: mounir.ab@techno-dz.com"
echo "=================================="

# Start backend
echo "🖥️  Starting backend server..."
cd /app/backend
node server.js &
BACKEND_PID=$!

# Start frontend server (simple static file server)
echo "🌐 Starting frontend server..."
cd /app/public
npx serve -s . -l 3000 &
FRONTEND_PID=$!

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?
EOF

# Make startup script executable
RUN chmod +x /app/start.sh

# Set labels for metadata
LABEL maintainer="Mounir Abderrahmani <mounir.ab@techno-dz.com>"
LABEL version="2.1.0"
LABEL description="TECHNO-ETL - Professional ETL Solution with Advanced Analytics"
LABEL org.techno-dz.name="Techno-ETL"
LABEL org.techno-dz.version="2.1.0"
LABEL org.techno-dz.vendor="Techno DZ"
LABEL org.techno-dz.release-date="2025-08-06"

# Start the application
CMD ["/app/start.sh"]

# ============================================
# Build Instructions:
# ============================================
# Build: docker build -t techno-etl:v2.1.0 .
# Run:   docker run -d -p 3000:3000 -p 5000:5000 \
#        -e DB_SERVER=your-db-server \
#        -e MAGENTO_BASE_URL=your-magento-url \
#        --name techno-etl \
#        techno-etl:v2.1.0
#
# Environment Variables:
# - DB_SERVER: SQL Server connection string
# - MAGENTO_BASE_URL: Magento API base URL
# - MAGENTO_ADMIN_TOKEN: Magento admin token
# - REDIS_HOST: Redis server host (optional)
# - JWT_SECRET: JWT secret for authentication
# ============================================
