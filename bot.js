const TelegramBot = require('node-telegram-bot-api');
const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58').default;
const http = require('http');

const token = '7780270031:AAFfIDHckiW7dMKzUjsxrN1D2sBJVvqm-2k';
const bot = new TelegramBot(token, { polling: true });

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Simple Generator Bot is running');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('Server running on port', PORT);
});

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Solana Wallet Generator\n\n/generate - Get 1 wallet\n/generate5 - Get 5 wallets\n/generate10 - Get 10 wallets');
});

bot.onText(/\/generate(\d*)/, (msg, match) => {
  const chatId = msg.chat.id;
  let count = 1;
  
  if (match[1]) {
    count = parseInt(match[1]);
  }
  
  if (count > 50) count = 50;
  if (count < 1) count = 1;

  // Generate wallets using same code as your terminal script
  for (let i = 0; i < count; i++) {
    // Same generation logic as your search-goat.js
    const keypair = Keypair.generate();
    const publicKey = keypair.publicKey.toBase58();
    const privateKey = bs58.encode(keypair.secretKey);
    
    const message = 'Wallet ' + (i + 1) + ':\n' + publicKey + '\n' + privateKey;
    
    // Send each wallet with small delay
    setTimeout(() => {
      bot.sendMessage(chatId, message);
    }, i * 300);
  }
});

console.log('Simple generator bot started');
