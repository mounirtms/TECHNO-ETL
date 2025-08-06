require('dotenv').config();

module.exports = {
  telegramToken: process.env.BOT_TOKEN,
  magentoBaseUrl: process.env.MAGENTO_API,
  openaiKey: process.env.OPENAI_API_KEY,
  adminIds: process.env.ADMINS ? process.env.ADMINS.split(',').map(id => id.trim()) : [],
};
