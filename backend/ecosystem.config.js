/**
 * PM2 configuration file for Techno-ETL Backend
 *
 * This file configures the application to run in cluster mode for the API
 * and a fork mode for the scheduled cron worker.
 *
 * To use:
 *   - Start all: pm2 start ecosystem.config.js
 *   - Stop all:  pm2 stop all
 *   - Reload API: pm2 reload techno-etl-api
 *   - Logs:      pm2 logs <name>
 */
module.exports = {
  apps: [
    {
      name: 'techno-etl-api',
      script: process.env.NODE_ENV === 'production' ? './dist/server.js' : './server.js',
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster', // Enable cluster mode for the API
      autorestart: true,
      watch: false, // Disable watch in production, handle deployments via reload
      max_memory_restart: '1G', // Restart if it exceeds 1GB memory
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      // Logging configuration
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Node.js optimization
      node_args: '--max-old-space-size=1024',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        LOG_LEVEL: 'info'
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 5000,
        LOG_LEVEL: 'debug'
      }
    },
    {
      name: 'techno-etl-cron',
      script: process.env.NODE_ENV === 'production' ? './dist/cron-runner.js' : './cron-runner.js',
      instances: 1,
      exec_mode: 'fork', // Cron jobs should run in a single instance
      cron_restart: '0 2 * * *', // Run every day at 2:00 AM
      watch: false,
      autorestart: false, // Do not restart after completion
      // Logging configuration
      error_file: './logs/cron-error.log',
      out_file: './logs/cron-out.log',
      log_file: './logs/cron-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Node.js optimization
      node_args: '--max-old-space-size=512',
      env: {
        NODE_ENV: 'production',
        LOG_LEVEL: 'info'
      },
      env_development: {
        NODE_ENV: 'development',
        LOG_LEVEL: 'debug'
      }
    }
  ],
};