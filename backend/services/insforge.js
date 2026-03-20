import { createClient } from '@insforge/sdk';
import dotenv from 'dotenv';
dotenv.config();

// إنشاء العميل للتواصل مع قاعدة البيانات
const insforgeUrl = process.env.INSFORGE_URL || '';
const insforgeKey = process.env.INSFORGE_ANON_KEY || '';

let client = null;

if (insforgeUrl && insforgeKey) {
    client = createClient({
        baseUrl: insforgeUrl,
        anonKey: insforgeKey
    });
}

/**
 * دالة حفظ الإشارة في الجدول (signals)
 */
export const saveSignal = async (signalData) => {
    if (!client) {
        console.warn('⚠️ InsForge is not configured. Skipping database save.');
        return null;
    }

    try {
        // يجب إرسال مصفوفة عند الإدخال في قاعدة البيانات (حسب توثيق InsForge)
        const { data, error } = await client.db('signals').insert([signalData]);
        
        if (error) {
            console.error('❌ Database Insert Error:', error);
            throw error;
        }
        
        console.log('✅ Signal saved to database successfully');
        return data;
    } catch (err) {
        console.error('Failed to save to InsForge:', err.message);
        return null;
    }
};
