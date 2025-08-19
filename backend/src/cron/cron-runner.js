/**
 * TECHNO-ETL Cron Runner
 * Author: Mounir Abderrahmani
 * Handles all scheduled tasks
 */

import cron from 'node-cron';

console.log('🕐 TECHNO-ETL Cron Runner Starting...');

// Simple logger fallback
const logger = {
  info: (msg) => console.log(`[${new Date().toISOString()}] INFO: ${msg}`),
  error: (msg, err) => console.error(`[${new Date().toISOString()}] ERROR: ${msg}`, err || '')
};

// Price Sync - Every 6 hours
cron.schedule(process.env.PRICE_SYNC_CRON || '0 */6 * * *', async () => {
  logger.info('🔄 Starting price sync cron job');
  try {
    // Add your price sync logic here
    logger.info('✅ Price sync completed');
  } catch (error) {
    logger.error('❌ Price sync failed:', error);
  }
}, {
  timezone: process.env.CRON_TIMEZONE || 'Europe/Paris'
});

// Stock Sync - Every 4 hours
cron.schedule(process.env.STOCK_SYNC_CRON || '0 */4 * * *', async () => {
  logger.info('📦 Starting stock sync cron job');
  try {
    // Add your stock sync logic here
    logger.info('✅ Stock sync completed');
  } catch (error) {
    logger.error('❌ Stock sync failed:', error);
  }
}, {
  timezone: process.env.CRON_TIMEZONE || 'Europe/Paris'
});

// Inventory Sync - Daily at 2 AM
cron.schedule(process.env.INVENTORY_SYNC_CRON || '0 2 * * *', async () => {
  logger.info('🏭 Starting inventory sync cron job');
  try {
    // Add your inventory sync logic here
    logger.info('✅ Inventory sync completed');
  } catch (error) {
    logger.error('❌ Inventory sync failed:', error);
  }
}, {
  timezone: process.env.CRON_TIMEZONE || 'Europe/Paris'
});

logger.info('✅ All cron jobs scheduled successfully');

// Keep the process alive
process.on('SIGINT', () => {
  logger.info('🛑 Cron runner shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('🛑 Cron runner terminated');
  process.exit(0);
});
