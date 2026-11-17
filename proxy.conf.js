require('dotenv').config({ path: __dirname + '/.env' });

module.exports = {
  '/api/chat': {
    target: 'https://api.groq.com',
    secure: true,
    changeOrigin: true,
    pathRewrite: { '^/api/chat': '/openai/v1/chat/completions' },
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
  },
};