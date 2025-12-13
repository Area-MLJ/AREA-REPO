#!/usr/bin/env node

const path = require('path');

// Set up module paths
require('module-alias/register');

// Load environment variables
require('dotenv').config();

// Import the Discord bot
const { DiscordBot } = require('../src/services/discord/bot');
const logger = require('../src/lib/logger');

async function startDiscordBot() {
  try {
    logger.info('Discord Bot', 'Starting Discord bot service');
    
    if (!process.env.DISCORD_TOKEN) {
      throw new Error('DISCORD_TOKEN environment variable is required');
    }

    const bot = new DiscordBot();
    await bot.start();
    
    logger.info('Discord Bot', 'Discord bot started successfully');
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('Discord Bot', 'Received SIGINT, shutting down gracefully');
      await bot.stop();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      logger.info('Discord Bot', 'Received SIGTERM, shutting down gracefully');
      await bot.stop();
      process.exit(0);
    });
    
  } catch (error) {
    logger.error('Discord Bot', `Failed to start bot: ${error.message}`);
    process.exit(1);
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Discord Bot', `Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

// Start the bot
startDiscordBot();