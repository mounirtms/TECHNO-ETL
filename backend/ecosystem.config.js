/**
 * PM2 configuration file for Techno-ETL Backend
 *
 * This file configures the application to run in cluster mode for the API
 * and a fork mode for the scheduled cron worker.
 *
 * To use:
 *   - Start all: pm2 start backend/ecosystem.config.js
 *   - Stop all:  pm2 stop all
 *   - Reload API: pm2 reload techno-etl-api
 *   - Logs:      pm2 logs <name>
 */
module.exports = {
  apps: [
    {
      name: 'techno-etl-api',
      script: './dist/index.js', // Path to the built server entry file
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster', // Enable cluster mode for the API
      autorestart: true,
      watch: false, // Disable watch in production, handle deployments via reload
      max_memory_restart: '1G', // Restart if it exceeds 1GB memory
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'techno-etl-cron',
      script: './dist/cron-runner.js', // Path to the cron job runner
      instances: 1,
      exec_mode: 'fork', // Cron jobs should run in a single instance
      cron_restart: '0 2 * * *', // Run every day at 2:00 AM
      watch: false,
      autorestart: false, // Do not restart after completion
      env: {
        NODE_ENV: 'production',
      },
    }
  ],
};