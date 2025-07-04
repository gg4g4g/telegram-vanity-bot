⚠️ IMPORTANT: Save your private key securely! This is the only way to access your wallet.`, { parse_mode: 'Markdown' });
      
      return;
    }
    
    // Send progress updates every 50,000 attempts
    if (attempts % 50000 === 0) {
      const elapsedTime = (Date.now() - startTime) / 1000;
      const rate = Math.round(attempts / elapsedTime);
      
      bot.sendMessage(chatId, `⏳ Still searching for "${suffix}"...
• Attempts: ${attempts.toLocaleString()}
• Rate: ${rate.toLocaleString()}/sec
• Time: ${Math.round(elapsedTime)}s`);
    }
    
    // Continue searching (non-blocking)
    setImmediate(search);
  }
  
  // Start the search
  search();
}

// Error handling
bot.on('error', (error) => {
  console.error('Bot error:', error);
});

bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

// Log when bot starts
console.log('🚀 Telegram Bot started successfully!');
console.log('Bot username: @smartbotbrobot');
console.log('Waiting for messages...');

// Keep the process alive
process.on('SIGINT', () => {
  console.log('Bot shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Bot shutting down...');
  process.exit(0);
});