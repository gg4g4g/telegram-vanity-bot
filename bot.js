const TelegramBot = require('node-telegram-bot-api');
const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58').default;
const http = require('http');

const token = '7780270031:AAFfIDHckiW7dMKzUjsxrN1D2sBJVvqm-2k';
const bot = new TelegramBot(token, { polling: true });

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Working Wallet Bot is running');
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

  try {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        try {
          const keypair = Keypair.generate();
          const address = keypair.publicKey.toBase58();
          const privateKey = bs58.encode(keypair.secretKey);
          
          bot.sendMessage(chatId, `Wallet ${i + 1}:\n${address}\n${privateKey}`);
        } catch (error) {
          console.error('Error generating wallet:', error);
          bot.sendMessage(chatId, 'Error generating wallet. Please try again.');
        }
      }, i * 200);
    }
  } catch (error) {
    console.error('Error in generate command:', error);
    bot.sendMessage(chatId, 'Error processing request. Please try again.');
  }
});

console.log('Working wallet bot started');
