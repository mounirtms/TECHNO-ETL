const axios = require('axios');
const { openaiKey } = require('../config');

const openaiApi = axios.create({
  baseURL: 'https://api.openai.com/v1',
  headers: {
    Authorization: `Bearer ${openaiKey}`,
    'Content-Type': 'application/json',
  },
});

async function getAIReply(userMessage, context = '') {
  try {
    const res = await openaiApi.post('/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: context || 'You are a helpful shopping assistant.' },
        { role: 'user', content: userMessage },
      ],
    });

    return res.data.choices[0].message.content.trim();
  } catch (err) {
    console.error('GPT API error:', err.message);

    return 'Sorry, I had trouble understanding. Try rephrasing!';
  }
}

module.exports = { getAIReply };
