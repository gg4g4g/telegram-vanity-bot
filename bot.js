const TelegramBot = require('node-telegram-bot-api');
const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58').default;
const http = require('http');

const token = '7780270031:AAFfIDHckiW7dMKzUjsxrN1D2sBJVvqm-2k';
const bot = new TelegramBot(token, { polling: true });

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Simple Wallet Generator Bot is running');
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

Each wallet includes:
• Public address
• Private key (ready to import)

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
    bot.sendMessage(chatId, '❌ Must generate at least 1 wallet');
    return;
  }

  bot.sendMessage(chatId, `⏳ Generating ${count} fresh wallet${count > 1 ? 's' : ''}...`);
  generateWallets(chatId, count);
});

function generateWallets(chatId, count) {
  const wallets = [];
  
  for (let i = 0; i < count; i++) {
    const keypair = Keypair.generate();
    wallets.push({
      number: i + 1,
      publicKey: keypair.publicKey.toBase58(),
      privateKey: bs58.encode(keypair.secretKey)
    });
  }
  
  if (count === 1) {
    const wallet = wallets[0];
    bot.sendMessage(chatId, `🎉 New Solana Wallet!

Address: \`${wallet.publicKey}\`

Private Key: \`${wallet.privateKey}\`

⚠️ Save your private key securely!`, { parse_mode: 'Markdown' });
  } else {
    for (let i = 0; i < wallets.length; i += 10) {
      const batch = wallets.slice(i, i + 10);
      let message = `🎉 Wallets ${batch[0].number}-${batch[batch.length - 1].number}:\n\n`;
      
      batch.forEach(wallet => {
        message += `Wallet ${wallet.number}:\n`;
        message += `Address: \`${wallet.publicKey}\`\n`;
        message += `Private Key: \`${wallet.privateKey}\`\n\n`;
      });
      
      setTimeout(() => {
        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      }, (i / 10) * 2000);
    }
  }
}

console.log('Simple Wallet Generator Bot started!');
