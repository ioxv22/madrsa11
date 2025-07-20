# 🚀 دليل رفع المشروع على Netlify

## ⚠️ تنبيه مهم:
Netlify يدعم فقط المواقع الثابتة (Static Sites) وليس الخوادم. لذلك نحتاج لحلول بديلة للـ Backend.

## 🎯 الحلول المتاحة:

### 1. **الحل الأمثل: فصل Frontend و Backend**

#### 📱 رفع Frontend على Netlify:

1. **تحضير المشروع:**
```bash
cd client
npm install
npm run build
```

2. **رفع على Netlify:**
   - اذهب إلى [netlify.com](https://netlify.com)
   - اسحب مجلد `client/build` إلى Netlify
   - أو ربط مع GitHub

3. **إعدادات البناء في Netlify:**
```
Build command: cd client && npm run build
Publish directory: client/build
```

#### 🖥️ رفع Backend على خدمة منفصلة:

**أفضل الخيارات المجانية:**

##### A. **Railway** (الأفضل):
1. اذهب إلى [railway.app](https://railway.app)
2. ربط مع GitHub
3. اختر مجلد `server`
4. إضافة متغيرات البيئة:
```
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=your-database-name
JWT_SECRET=your-jwt-secret
```

##### B. **Render**:
1. اذهب إلى [render.com](https://render.com)
2. إنشاء Web Service جديد
3. ربط مع GitHub
4. إعدادات:
```
Build Command: cd server && npm install
Start Command: cd server && npm start
```

##### C. **Heroku**:
1. إنشاء حساب في [heroku.com](https://heroku.com)
2. تثبيت Heroku CLI
3. تشغيل الأوامر:
```bash
heroku create your-app-name
git subtree push --prefix server heroku main
```

### 2. **حل بديل: استخدام قاعدة بيانات سحابية**

#### إعداد قاعدة بيانات مجانية:

##### A. **PlanetScale** (MySQL):
1. اذهب إلى [planetscale.com](https://planetscale.com)
2. إنشاء قاعدة بيانات جديدة
3. الحصول على connection string
4. استيراد البيانات

##### B. **Supabase** (PostgreSQL):
1. اذهب إلى [supabase.com](https://supabase.com)
2. إنشاء مشروع جديد
3. استخدام SQL Editor لإنشاء الجداول

### 3. **حل متقدم: Netlify Functions**

إنشاء functions للـ API:

```javascript
// netlify/functions/api.js
exports.handler = async (event, context) => {
  // API logic here
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello from Netlify Functions' })
  };
};
```

## 📋 خطوات الرفع التفصيلية:

### الخطوة 1: تحضير Frontend
```bash
cd client
npm install
npm run build
```

### الخطوة 2: رفع على Netlify
1. اذهب إلى [netlify.com](https://netlify.com)
2. اضغط "New site from Git"
3. اختر GitHub/GitLab
4. اختر المستودع
5. إعدادات البناء:
   - **Build command:** `npm run netlify-build`
   - **Publish directory:** `client/build`

### الخطوة 3: إعداد متغيرات البيئة
في Netlify Dashboard:
- Site settings → Environment variables
- أضف:
```
REACT_APP_API_URL=https://your-backend-url.com/api
REACT_APP_ENVIRONMENT=production
```

### الخطوة 4: إعداد Redirects
إنشاء ملف `client/public/_redirects`:
```
/api/* https://your-backend-url.com/api/:splat 200
/* /index.html 200
```

## 🔧 إعدادات إضافية:

### تحديث API URLs في Frontend:
```javascript
// client/src/services/apiHelpers.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

### إعداد CORS في Backend:
```javascript
// server/server.js
app.use(cors({
  origin: ['https://your-netlify-site.netlify.app', 'http://localhost:3000'],
  credentials: true
}));
```

## 🎯 التوصية النهائية:

**للمشروع الحالي، أنصح بـ:**

1. **Frontend على Netlify** (مجاني)
2. **Backend على Railway** (مجاني ممتاز)
3. **قاعدة البيانات على PlanetScale** (MySQL مجاني)

## 📞 المساعدة:

إذا واجهت مشاكل:
1. تحقق من logs في Netlify
2. تحقق من Network tab في المتصفح
3. تأكد من CORS settings
4. تحقق من Environment Variables

## 🔗 روابط مفيدة:

- [Netlify Docs](https://docs.netlify.com)
- [Railway Docs](https://docs.railway.app)
- [PlanetScale Docs](https://docs.planetscale.com)
- [Render Docs](https://render.com/docs)

---

**ملاحظة:** هذا المشروع يحتاج backend منفصل لأنه يستخدم قاعدة بيانات MySQL وخادم Node.js. Netlify وحده لا يكفي للمشروع الكامل.