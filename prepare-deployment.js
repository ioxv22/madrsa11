const fs = require('fs');
const path = require('path');

console.log('🚀 تحضير المشروع للنشر...');

// إنشاء ملف environment للإنتاج
const envProduction = `# إعدادات الإنتاج
REACT_APP_API_URL=https://your-backend-url.com/api
REACT_APP_ENVIRONMENT=production
GENERATE_SOURCEMAP=false
`;

fs.writeFileSync(path.join(__dirname, 'client', '.env.production'), envProduction);
console.log('✅ تم إنشاء ملف .env.production');

// تحديث package.json للـ client
const clientPackagePath = path.join(__dirname, 'client', 'package.json');
const clientPackage = JSON.parse(fs.readFileSync(clientPackagePath, 'utf8'));

// إضافة homepage للـ client package.json
clientPackage.homepage = '.';

fs.writeFileSync(clientPackagePath, JSON.stringify(clientPackage, null, 2));
console.log('✅ تم تحديث client/package.json');

// إنشاء ملف README للنشر
const deploymentReadme = `# 🚀 دليل النشر السريع

## للنشر على Netlify:

1. **بناء المشروع:**
\`\`\`bash
cd client
npm install
npm run build
\`\`\`

2. **رفع على Netlify:**
   - اسحب مجلد \`client/build\` إلى netlify.com
   - أو ربط مع GitHub

3. **إعداد Backend منفصل:**
   - استخدم Railway أو Render أو Heroku
   - رفع مجلد \`server\`
   - إعداد قاعدة البيانات

4. **تحديث API URL:**
   - في Netlify: Site Settings → Environment Variables
   - أضف: \`REACT_APP_API_URL=https://your-backend-url.com/api\`

## روابط مهمة:
- Frontend: Netlify
- Backend: Railway/Render/Heroku  
- Database: PlanetScale/Supabase

راجع NETLIFY_DEPLOYMENT_GUIDE.md للتفاصيل الكاملة.
`;

fs.writeFileSync(path.join(__dirname, 'DEPLOYMENT_README.md'), deploymentReadme);
console.log('✅ تم إنشاء DEPLOYMENT_README.md');

console.log('\n🎉 تم تحضير المشروع للنشر!');
console.log('\n📋 الخطوات التالية:');
console.log('1. رفع Frontend على Netlify');
console.log('2. رفع Backend على Railway/Render');
console.log('3. إعداد قاعدة البيانات');
console.log('4. تحديث API URLs');
console.log('\nراجع NETLIFY_DEPLOYMENT_GUIDE.md للتفاصيل الكاملة.');