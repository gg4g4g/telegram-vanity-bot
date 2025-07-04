const TelegramBot = require('node-telegram-bot-api');
const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58').default;
const http = require('http');

const token = '7780270031:AAFfIDHckiW7dMKzUjsxrN1D2sBJVvqm-2k';
const bot = new TelegramBot(token, { polling: true });
const activeSearches = new Map();

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is running. Active searches: ' + activeSearches.size);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('Health check server running on port', PORT);
});

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Solana Vanity Address Generator\n\n/generate <suffix> - Find address ending with suffix\n/stop - Stop search\n/status - Check progress\n\nExample: /generate haha\n\nNote: 4+ character suffixes can take hours or days!');
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

  let warning = '';
  if (suffix.length >= 4) {
    if (suffix.length === 4) warning = '\n\n⚠️ 4-character search could take several hours';
    if (suffix.length === 5) warning = '\n\n⚠️ 5-character search could take days';
    if (suffix.length === 6) warning = '\n\n⚠️ 6-character search could take months';
  }

  bot.sendMessage(chatId, 'Searching for "' + suffix + '"...' + warning);
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

bot.onText(/\/status/, (msg) => {
  const chatId = msg.chat.id;
  if (activeSearches.has(chatId)) {
    const search = activeSearches.get(chatId);
    const elapsed = (Date.now() - search.startTime) / 1000;
    const rate = Math.round(search.attempts / elapsed);
    bot.sendMessage(chatId, 'Searching for "' + search.suffix + '"\nAttempts: ' + search.attempts.toLocaleString() + '\nTime: ' + Math.round(elapsed) + 's\nRate: ' + rate.toLocaleString() + '/sec');
  } else {
    bot.sendMessage(chatId, 'No active search');
  }
});

function startSearch(chatId, suffix) {
  let attempts = 0;
  const startTime = Date.now();
  activeSearches.set(chatId, { suffix, startTime, attempts: 0 });
  
  const BATCH_SIZE = 1000;
  
  function searchBatch() {
    if (!activeSearches.has(chatId)) return;
    
    for (let i = 0; i < BATCH_SIZE; i++) {
      const keypair = Keypair.generate();
      const publicKey = keypair.publicKey.toBase58();
      attempts++;
      
      if (publicKey.toLowerCase().endsWith(suffix)) {
        activeSearches.delete(chatId);
        const privateKey = bs58.encode(keypair.secretKey);
        const elapsed = (Date.now() - startTime) / 1000;
        const rate = Math.round(attempts / elapsed);
        
        bot.sendMessage(chatId, 'FOUND!\n\nAddress: ' + publicKey + '\nPrivate Key: ' + privateKey + '\n\nAttempts: ' + attempts.toLocaleString() + '\nTime: ' + Math.round(elapsed) + 's\nRate: ' + rate.toLocaleString() + '/sec');
        return;
      }
    }
    
    if (attempts % 25000 === 0) {
      const elapsed = (Date.now() - startTime) / 1000;
      const rate = Math.round(attempts / elapsed);
      bot.sendMessage(chatId, attempts.toLocaleString() + ' attempts... (' + rate.toLocaleString() + '/sec)');
      
      const searchData = activeSearches.get(chatId);
      if (searchData) {
        searchData.attempts = attempts;
      }
    }
    
    setTimeout(searchBatch, 1);
  }
  
  searchBatch();
}

console.log('Bot started with improved stability');
