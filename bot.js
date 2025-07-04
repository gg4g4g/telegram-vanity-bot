const TelegramBot = require('node-telegram-bot-api');
const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58').default;
const bip39 = require('bip39');
const { derivePath } = require('ed25519-hd-key');
const http = require('http');

const token = '7780270031:AAFfIDHckiW7dMKzUjsxrN1D2sBJVvqm-2k';
const bot = new TelegramBot(token, { polling: true });

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Wallet Generator Bot is running');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('Health check server running on port', PORT);
});

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `🔑 Solana Wallet Generator

Generate fresh Solana wallets instantly!

Commands:
/generate - Generate 1 wallet
/generate5 - Generate 5 wallets  
/generate10 - Generate 10 wallets
/generate25 - Generate 25 wallets
/generate50 - Generate 50 wallets

Each wallet includes:
• 12-word mnemonic phrase
• Public address
• Private key

⚠️ Save your keys securely!`);
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

  bot.sendMessage(chatId, `⏳ Generating ${count} fresh Solana wallet${count > 1 ? 's' : ''}...`);
  generateWallets(chatId, count);
});

function generateWallets(chatId, count) {
  const wallets = [];
  
  for (let i = 0; i < count; i++) {
    const mnemonic = bip39.generateMnemonic();
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const derivedSeed = derivePath("m/44'/501'/0'/0'", seed.toString('hex')).key;
    const keypair = Keypair.fromSeed(derivedSeed);
    
    wallets.push({
      number: i + 1,
      mnemonic,
      publicKey: keypair.publicKey.toBase58(),
      privateKey: bs58.encode(keypair.secretKey)
    });
  }
  
  if (count === 1) {
    const wallet = wallets[0];
    const message = `🎉 New Solana Wallet Generated!

🔤 **Mnemonic Phrase:**
\`${wallet.mnemonic}\`

🔑 **Public Address:**
\`${wallet.publicKey}\`

🔐 **Private Key:**
\`${wallet.privateKey}\`

⚠️ **IMPORTANT:** Save these securely!`;
    
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } else {
    const batchSize = 5;
    for (let i = 0; i < wallets.length; i += batchSize) {
      const batch = wallets.slice(i, i + batchSize);
      let message = `🎉 Wallets ${batch[0].number}-${batch[batch.length - 1].number} of ${count}:\n\n`;
      
      batch.forEach(wallet => {
        message += `**Wallet ${wallet.number}:**\n`;
        message += `Mnemonic: \`${wallet.mnemonic}\`\n`;
        message += `Address: \`${wallet.publicKey}\`\n`;
        message += `Private Key: \`${wallet.privateKey}\`\n\n`;
      });
      
      message += `⚠️ Save these securely!`;
      
      setTimeout(() => {
        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      }, (i / batchSize) * 1000);
    }
  }
}

console.log('Solana Wallet Generator Bot started successfully!');
