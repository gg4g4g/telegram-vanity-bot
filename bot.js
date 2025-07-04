const TelegramBot = require('node-telegram-bot-api');
const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58').default;
const http = require('http');

const token = '7780270031:AAFfIDHckiW7dMKzUjsxrN1D2sBJVvqm-2k';
const bot = new TelegramBot(token, { polling: true });
const activeSearches = new Map();

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is running');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('Health check server running on port', PORT);
});

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Solana Vanity Address Generator\n\n/generate <suffix> - Find address ending with suffix\n/stop - Stop search\n\nExample: /generate haha');
});

bot.onText(/\/generate (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const suffix = match[1].trim().toLowerCase();
  
  if (!/^[a-z0-9]+$/.test(suffix)) {
    bot.sendMessage(chatId, 'Only letters and numbers allowed');
    return;
  }
  
  if (suffix.length < 2 || suffix.length > 6) {
    bot.sendMessage(chatId, 'Suffix must be 2-6 characters');
    return;
  }

  if (activeSearches.has(chatId)) {
    bot.sendMessage(chatId, 'Search already running! Use /stop first');
    return;
  }

  bot.sendMessage(chatId, 'Searching for "' + suffix + '"...');
  startSearch(chatId, suffix);
});

bot.onText(/\/stop/, (msg) => {
  const chatId = msg.chat.id;
  if (activeSearches.has(chatId)) {
    activeSearches.delete(chatId);
    bot.sendMessage(chatId, 'Search stopped');
  } else {
    bot.sendMessage(chatId, 'No active search');
  }
});

function startSearch(chatId, suffix) {
  let attempts = 0;
  const startTime = Date.now();
  activeSearches.set(chatId, true);
  
  function search() {
    if (!activeSearches.has(chatId)) return;
    
    const keypair = Keypair.generate();
    const publicKey = keypair.publicKey.toBase58();
    attempts++;
    
    if (publicKey.toLowerCase().endsWith(suffix)) {
      activeSearches.delete(chatId);
      const privateKey = bs58.encode(keypair.secretKey);
      const elapsed = (Date.now() - startTime) / 1000;
      
      bot.sendMessage(chatId, 'FOUND!\n\nAddress: ' + publicKey + '\nPrivate Key: ' + privateKey + '\n\nAttempts: ' + attempts + '\nTime: ' + Math.round(elapsed) + 's');
      return;
    }
    
    if (attempts % 50000 === 0) {
      bot.sendMessage(chatId, attempts + ' attempts...');
    }
    
    setImmediate(search);
  }
  
  search();
}

console.log('Bot started');
