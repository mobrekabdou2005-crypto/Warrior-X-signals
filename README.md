# 🚀 منصة إشارات التداول الآلية (Trading Signal Platform)

تم بناء هذه المنصة باستخدام Node.js (Express) للجهة الخلفية، و React (Vite + Tailwind CSS) لواجهة المستخدم Dashboard المتطورة.
هذه المنصة تستقبل إشارات TradingView عبر الـ Webhook، وتقوم بحفظها في قاعدة بيانات **InsForge**، ثم تقوم بإرسال إشعارات فورية عبر **Telegram Bot**.

---

## 📁 تنظيم ملفات المشروع (Folder Structure)
```text
/trading-signal-platform
├── backend/                   # الخادم الخلفي (Node.js)
│   ├── .env.example           # ملف البيئة الجاهز للتعبئة
│   ├── package.json           # الحزم المطلوبة
│   ├── server.js              # الخادم الرئيسي والـ Webhook
│   └── services/              # خدمات الربط (Telegram & InsForge)
│       ├── telegram.js        
│       └── insforge.js        
└── frontend/                  # واجهة لوحة التحكم (React)
    ├── index.html             # ملف الـ HTML الأساسي
    ├── package.json           # الحزم المطلوبة
    ├── postcss.config.js      
    ├── tailwind.config.js     # إعدادات Tailwind CSS
    ├── vite.config.js         # إعدادات Vite
    └── src/
        ├── App.jsx            # الواجهة التفاعلية (Dashboard)
        ├── index.css          # التصاميم الحصرية وتأثيرات الإضاءة
        └── main.jsx           # ملف الإقلاع للـ React
```

---

## ⚙️ شرح خطوة بخطوة لكيفية التشغيل المتطلبات:

بما أننا لاحظنا عدم توفر حزم `npm` محلياً على جهازك الحالي، فستقوم بإنشاء هذا المشروع على خادم **VPS** أو بيئة تحتوي على `Node.js`.

### 1️⃣ إعداد الخادم الخلفي (Backend):
1. افتح سطر الأوامر وانتقل لمجلد الخادم:
   ```bash
   cd backend
   npm install
   ```
2. انسخ ملف البيئة وضبط المتغيرات:
   ```bash
   cp .env.example .env
   ```
   *قم بتعبئة مفتاح التليجرام الخاص بك، و InsForge URL وغيرها داخل ملف `.env`.*
3. تشغيل الخادم:
   ```bash
   npm run dev
   ```

### 2️⃣ إعداد الواجهة الأمامية (Frontend Dashboard):
1. في نافذة طرفية أخرى، انتقل لمجلد الواجهة:
   ```bash
   cd frontend
   npm install
   ```
2. أنشئ ملف `.env` لمتغيرات InsForge (الواجهة تحتاج للمفاتيح للاتصال المباشر بقاعدة البيانات Real-Time):
   ```env
   VITE_INSFORGE_URL=https://your-app.region.insforge.app
   VITE_INSFORGE_ANON_KEY=your_anon_key
   ```
3. تشغيل لوحة التحكم وقت التطوير:
   ```bash
   npm run dev
   ```
   **الآن يمكنك تصفح اللوحة الاحترافية الجاهزة!**

---

## 📡 توثيق الـ API (TradingView Webhook)

يجب عليك إعداد التنبيه في Pine Script أو واجهة TradingView للإرسال كالتالي.

**نقطة الاستقبال (Endpoint):**
`POST https://<your-vps-ip>:3000/webhook`

**الهيدر المطلوب (Headers):**
يجب تفعيل المصادقة لحماية السيرفر من الطلبات الوهمية:
`Authorization: my_super_secret_key_123` *(ضع نفس الكود الموجود في خطوة الـ BACKEND .env)*

**شكل إرسال البيانات (JSON Body):**
```json
{
  "symbol": "{{ticker}}",
  "signal": "BUY",
  "price": {{close}},
  "time": "{{timenow}}"
}
```

---

## ☁️ دليل النشر (Deployment Guide على VPS)

لضبط المشروع بشكل احترافي للعمل الدائم:
1. **تثبيت PM2** لإبقاء الـ Backend يعمل في الخلفية:
   ```bash
   npm install -g pm2
   cd backend
   pm2 start server.js --name "trading-webhook"
   pm2 save
   ```
2. **بناء Frontend للإنتاج:**
   ```bash
   cd frontend
   npm run build
   ```
3. **ضبط Nginx:**
   خدمة ملفات الساكنة الموجودة في مجلد `frontend/dist` عبر منفذ `80`، وتحويل المسار `/webhook` ليستهدف المنفذ `3000` الداخلي للخادم.

بالتوفيق في تداولاتك! 🚀
