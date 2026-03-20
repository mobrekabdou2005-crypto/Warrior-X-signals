import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sendTelegramMessage } from './services/telegram.js';
import { saveSignal } from './services/insforge.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

// حالة الخادم للتأكد من عمله
app.get('/status', (req, res) => {
    res.json({ status: 'Platform is running', timestamp: new Date() });
});

// استقبال Webhook من TradingView
app.post('/webhook', async (req, res) => {
    try {
        // حماية نقطة الاستقبال - التأكد من وجود المفتاح السري في الهيدر
        const secretHeader = req.headers['authorization'] || req.headers['x-secret'];
        if (secretHeader !== WEBHOOK_SECRET) {
            console.warn('Unauthorized webhook attempt');
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { symbol, signal, price, time } = req.body;

        // التحقق من صحة البيانات
        if (!symbol || !signal || !price) {
            return res.status(400).json({ error: 'Missing required data (symbol, signal, price)' });
        }

        // فلترة (مثال على فلترة الإشارات القوية فقط لو كان مطلوباً)
        // if (signal !== 'BOS' && signal !== 'CHoCH' && signal !== 'BUY' && signal !== 'SELL') {
        //     return res.status(200).json({ message: 'Signal ignored' });
        // }

        console.log(`Received signal: ${signal} on ${symbol} at ${price}`);

        // 1. تسجيل الإشارة في قاعدة بيانات InsForge
        await saveSignal({
            symbol,
            signal_type: signal,
            price: parseFloat(price),
            timestamp: time || new Date().toISOString()
        });

        // 2. إرسال إلى تليجرام
        const msg = `🚀 *Trade Alert*\n\n` +
                    `📌 *Pair:* ${symbol}\n` +
                    `📊 *Signal:* ${signal}\n` +
                    `💰 *Price:* ${price}\n` +
                    `⏱️ *Time:* ${time || new Date().toISOString()}`;
        
        await sendTelegramMessage(msg);

        res.status(200).json({ message: 'Signal processed successfully' });
    } catch (error) {
        console.error('Webhook Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
