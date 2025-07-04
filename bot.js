const TelegramBot = require('node-telegram-bot-api');
const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58').default;
const http = require('http');

const token = '7780270031:AAFfIDHckiW7dMKzUjsxrN1D2sBJVvqm-2k';
const bot = new TelegramBot(token, { polling: true });

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Instant Wallet Generator Bot is running');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('Health check server running on port', PORT);
});

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `🔑 Solana Wallet Generator

Commands:
/generate - Generate 1 wallet
/generate5 - Generate 5 wallets  
/generate10 - Generate 10 wallets
/generate25 - Generate 25 wallets
/generate50 - Generate 50 wallets

⚠️ Save your private keys securely!`);
});

bot.onText(/\/generate(\d*)/, (msg, match) => {
  const chatId = msg.chat.id;
  let count = 1;
  
  if (match[1]) {
    count = parseInt(match[1]);
  }
  
  if (count > 50) {
    bot.sendMessage(chatId, '❌ Maximum 50 wallets per request');
    return;
  }
  
  if (count < 1) {
    count = 1;
  }

  // Generate wallets instantly
  const wallets = [];
  for (let i = 0; i < count; i++) {
    const keypair = Keypair.generate();
    wallets.push({
      address: keypair.publicKey.toBase58(),
      privateKey: bs58.encode(keypair.secretKey)
    });
  }
  
  // Format message exactly like your example
  let message = `New Wallets:\nAddress: `;
  
  // Add all addresses first
  message += wallets.map(w => w.address).join('\n');
  
  message += `\n\nPrivate key:\n`;
  
  // Add all private keys
  message += wallets.map(w => w.privateKey).join('\n');
  
  // Send immediately
  bot.sendMessage(chatId, message);
  
  console.log(`Generated ${count} wallets instantly for chat ${chatId}`);
});

console.log('Instant Wallet Generator Bot started!');
