const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

const token = '7780270031:AAFfIDHckiW7dMKzUjsxrN1D2sBJVvqm-2k';
const bot = new TelegramBot(token, { polling: true });

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Basic Test Bot is running');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('Server running on port', PORT);
});

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Bot is working! Send /test to verify.');
});

bot.onText(/\/test/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Test successful! Bot is responding.');
});

bot.onText(/\/generate/, (msg) => {
  const testAddress = '7YWiMT7MqLBeelkKpVQ9gnyNJwKfx4JoVQUvqm6sPGVB';
  const testPrivateKey = '4JYXG5Z9mK3gU2wR7nFe8tPqM6bNhC8xDaEfGhIjKlMnOpQrStUvWxYz1A2bCdEfGhIjKlMnOpQrStUvWxYz1A2b';
  
  const message = `Test Wallet:\n${testAddress}\n${testPrivateKey}`;
  bot.sendMessage(msg.chat.id, message);
});

console.log('Basic test bot started');
