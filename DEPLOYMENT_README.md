# 🚀 دليل النشر السريع

## للنشر على Netlify:

1. **بناء المشروع:**
```bash
cd client
npm install
npm run build
```

2. **رفع على Netlify:**
   - اسحب مجلد `client/build` إلى netlify.com
   - أو ربط مع GitHub

3. **إعداد Backend منفصل:**
   - استخدم Railway أو Render أو Heroku
   - رفع مجلد `server`
   - إعداد قاعدة البيانات

4. **تحديث API URL:**
   - في Netlify: Site Settings → Environment Variables
   - أضف: `REACT_APP_API_URL=https://your-backend-url.com/api`

## روابط مهمة:
- Frontend: Netlify
- Backend: Railway/Render/Heroku  
- Database: PlanetScale/Supabase

راجع NETLIFY_DEPLOYMENT_GUIDE.md للتفاصيل الكاملة.
