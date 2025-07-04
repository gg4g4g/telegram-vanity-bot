const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

const token = '7780270031:AAFfIDHckiW7dMKzUjsxrN1D2sBJVvqm-2k';
const bot = new TelegramBot(token, { polling: true });

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Step by Step Bot is running');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('Server running on port', PORT);
});

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Solana Wallet Generator\n\n/generate - Get wallet\n/test - Test');
});

bot.onText(/\/test/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Test working!');
});

bot.onText(/\/generate/, (msg) => {
  try {
    // Import Solana libraries only when needed
    const { Keypair } = require('@solana/web3.js');
    const bs58 = require('bs58').default;
    
    console.log('Libraries loaded successfully');
    
    // Generate wallet using your working terminal code
    const keypair = Keypair.generate();
    const publicKey = keypair.publicKey.toBase58();
    const privateKey = bs58.encode(keypair.secretKey);
    
    console.log('Wallet generated successfully');
    
    const message = 'New Wallet:\n' + publicKey + '\n' + privateKey;
    bot.sendMessage(msg.chat.id, message);
    
  } catch (error) {
    console.error('Error:', error);
    bot.sendMessage(msg.chat.id, 'Error: ' + error.message);
  }
});

console.log('Step by step bot started');
