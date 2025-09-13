#!/bin/bash
# TECHNO-ETL Backend Startup Script
# Optimized for production use

echo "🚀 Starting TECHNO-ETL Backend with optimizations..."

# Set Node.js optimization flags
export NODE_OPTIONS="--max-old-space-size=512 --optimize-for-size"

# Set environment variables
export NODE_ENV=production
export UV_THREADPOOL_SIZE=4
export REDIS_URL=redis://localhost:6379

# Start Redis if not running
if ! pgrep -x "redis-server" > /dev/null; then
    echo "🔄 Starting Redis server..."
    redis-server redis.conf &
    sleep 2
fi

# Start the application with PM2
echo "🔄 Starting TECHNO-ETL Backend..."
pm2 start ecosystem.config.js --env production

echo "✅ TECHNO-ETL Backend started successfully!"
echo "📊 Monitor logs with: pm2 logs techno-etl-backend"
echo "📈 Monitor performance with: pm2 monit"
