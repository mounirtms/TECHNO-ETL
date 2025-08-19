/**
 * TECHNO-ETL Fixed PM2 Configuration
 * Author: Mounir Abderrahmani
 * Fixed paths and configuration
 */

module.exports = {
  apps: [
    {
      name: 'techno-etl-api',
      script: process.env.NODE_ENV === 'production' ? './dist/server.js' : './server.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_file: './logs/api-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      node_args: '--max-old-space-size=1024 --no-warnings --expose-gc',
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
      script: process.env.NODE_ENV === 'production' ? './dist/src/cron/cron-runner.js' : './src/cron/cron-runner.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      autorestart: true,
      max_memory_restart: '512M',
      error_file: './logs/cron-error.log',
      out_file: './logs/cron-out.log',
      log_file: './logs/cron-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      node_args: '--max-old-space-size=512',
      env: {
        NODE_ENV: 'production',
        LOG_LEVEL: 'info',
        ENABLE_CRON: 'true'
      },
      env_development: {
        NODE_ENV: 'development',
        LOG_LEVEL: 'debug',
        ENABLE_CRON: 'true'
      }
    }
  ]
};