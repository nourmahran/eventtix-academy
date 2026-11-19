import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'node:url';
import { createChatServer, DEFAULT_MODEL } from './chat-server.mjs';

try { loadEnvFile(fileURLToPath(new URL('../.env', import.meta.url))); }
catch (error) { if (error.code !== 'ENOENT') { console.error('Could not read .env. Check its format.'); process.exit(1); } }
const port = Number(process.env.CHAT_PORT || 3001);
if (!Number.isInteger(port) || port < 1024 || port > 65535) { console.error('CHAT_PORT must be between 1024 and 65535.'); process.exit(1); }
const apiKey = process.env.GEMINI_API_KEY?.trim() ?? '';
const server = createChatServer({ apiKey, model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
  allowedOrigins: (process.env.CHAT_ALLOWED_ORIGINS || 'http://localhost:4200,http://127.0.0.1:4200').split(',').map(s => s.trim()) });
server.on('error', error => { console.error(error.code === 'EADDRINUSE' ? `Chat port ${port} is already in use.` : 'Chat server could not start.'); process.exit(1); });
server.listen(port, '127.0.0.1', () => {
  console.log(`Chat backend: http://127.0.0.1:${port}`);
  console.log(apiKey ? 'Gemini API key configured (connection checked on first message).' : 'Gemini API key missing. Add GEMINI_API_KEY to .env and restart npm start.');
  if (process.send) process.send('ready');
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
  server.close(); server.closeAllConnections(); process.exit(0);
});
