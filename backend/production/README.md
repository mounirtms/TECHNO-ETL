# TECHNO-ETL Backend - Production Deployment

## Quick Start

### Option 1: Direct Node.js
```bash
node start-production.js
```

### Option 2: PM2 (Recommended)
```bash
# Start all services
node pm2-deploy.js start

# Check status
node pm2-deploy.js status

# View logs
node pm2-deploy.js logs

# Monitor
node pm2-deploy.js monit

# Restart
node pm2-deploy.js restart

# Stop
node pm2-deploy.js stop
```

## Features

✅ **API Server** - Main REST API on port 5000
✅ **Cron Jobs** - Scheduled tasks every 5 minutes
✅ **File Logging** - Structured logs in ./logs/
✅ **Caching** - Redis with in-memory fallback
✅ **Workers** - Image processing with fallback
✅ **Monitoring** - Performance metrics and health checks
✅ **Security** - Rate limiting, CORS, Helmet
✅ **Error Handling** - Comprehensive error tracking

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/metrics` - Performance metrics
- `GET /api/cache/stats` - Cache statistics

## Environment Variables

Copy `.env.production` and configure:
- `NODE_ENV=production`
- `PORT=5000`
- `HOST=0.0.0.0`
- `LOG_LEVEL=info`
- `REDIS_URL=redis://localhost:6379` (optional)

## Logs

Logs are written to `./logs/` directory:
- `combined-YYYY-MM-DD.log` - All logs
- `error-YYYY-MM-DD.log` - Error logs only
- `warn-YYYY-MM-DD.log` - Warning logs only

## Monitoring

- PM2 Dashboard: `pm2 monit`
- Health Check: `curl http://localhost:5000/api/health`
- Metrics: `curl http://localhost:5000/api/metrics`
