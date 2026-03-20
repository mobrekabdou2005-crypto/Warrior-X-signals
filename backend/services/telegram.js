import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

let bot = null;

if (token && token.length > 10) {
    // Polling is set to false because we only send messages from this server, not receiving commands
    bot = new TelegramBot(token, { polling: false });
}

export const sendTelegramMessage = async (message) => {
    if (!bot || !chatId) {
        console.warn('⚠️ Telegram bot token or chat ID is missing. Skipping message.');
        return false;
    }

    try {
        await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        console.log('✅ Telegram message sent successfully');
        return true;
    } catch (error) {
        console.error('❌ Failed to send Telegram message:', error.message);
        return false;
    }
};
