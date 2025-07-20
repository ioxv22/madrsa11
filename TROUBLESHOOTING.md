# 🔧 حل مشاكل التسجيل والخادم

## 🚨 المشاكل الشائعة وحلولها:

### 1. خطأ في الاتصال بقاعدة البيانات:

#### الأعراض:
```
خطأ في إنشاء جدول المستخدمين: AggregateError [ECONNREFUSED]
```

#### الحلول:

**أ) تأكد من تشغيل MySQL:**
```bash
# إذا كنت تستخدم XAMPP
1. افتح XAMPP Control Panel
2. اضغط "Start" بجانب MySQL

# إذا كنت تستخدم MySQL مباشرة
net start mysql80
```

**ب) تحقق من كلمة مرور قاعدة البيانات:**
1. افتح ملف `server/.env`
2. تأكد من `DB_PASSWORD` صحيحة:
```env
DB_PASSWORD=كلمة_مرور_MySQL_الخاصة_بك
```

**ج) إنشاء قاعدة البيانات:**
```sql
-- في MySQL Command Line أو phpMyAdmin
CREATE DATABASE grade11_study_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. خطأ في التسجيل:

#### الأعراض:
- "خطأ في إنشاء المستخدم"
- "جميع الحقول مطلوبة"
- "اسم المستخدم موجود مسبقاً"

#### الحلول:

**أ) تأكد من ملء جميع الحقول:**
- اسم المستخدم
- البريد الإلكتروني
- كلمة المرور
- الاسم الكامل

**ب) تحقق من صحة البيانات:**
- اسم المستخدم: أحرف وأرقام فقط
- البريد الإلكتروني: صيغة صحيحة
- كلمة المرور: 6 أحرف على الأقل

**ج) استخدم الحسابات الافتراضية:**
```
المدير: admin / admin123
الطالب: student / student123
```

### 3. خطأ في JWT Token:

#### الأعراض:
- "خطأ في التوكن"
- "غير مصرح"

#### الحل:
تأكد من `JWT_SECRET` في ملف `.env`:
```env
JWT_SECRET=grade11_study_platform_jwt_secret_key_2024_very_strong
```

### 4. خطأ في رفع الملفات:

#### الأعراض:
- "حجم الملف كبير جداً"
- "نوع الملف غير مدعوم"

#### الحلول:
- الحد الأقصى: 100 ميجابايت
- الأنواع المدعومة: PDF, Word, PowerPoint, Excel, صور, فيديو

## 🛠️ خطوات التشخيص:

### 1. تحقق من حالة الخادم:
```bash
# في PowerShell
Get-Process | Where-Object {$_.ProcessName -like "*node*"}
```

### 2. تحقق من MySQL:
```bash
# في Command Prompt
mysql -u root -p -e "SHOW DATABASES;"
```

### 3. تحقق من المنافذ:
```bash
# في PowerShell
netstat -an | findstr ":3000"
netstat -an | findstr ":5000"
netstat -an | findstr ":3306"
```

### 4. تحقق من الملفات:
```bash
# تأكد من وجود الملفات
ls server/.env
ls server/config/database.js
ls server/routes/auth.js
```

## 🔄 إعادة تشغيل المشروع:

### 1. إيقاف العمليات:
```bash
# اضغط Ctrl+C في Terminal
# أو أغلق جميع نوافذ Terminal
```

### 2. إعادة التشغيل:
```bash
# في PowerShell
.\start.bat

# أو يدوياً
npm run dev
```

### 3. إعادة تعيين قاعدة البيانات:
```sql
DROP DATABASE IF EXISTS grade11_study_platform;
CREATE DATABASE grade11_study_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 📋 قائمة التحقق السريع:

- [ ] MySQL يعمل
- [ ] قاعدة البيانات موجودة
- [ ] ملف `.env` صحيح
- [ ] المنافذ 3000 و 5000 و 3306 متاحة
- [ ] جميع التبعيات مثبتة
- [ ] الخادم والواجهة يعملان

## 🆘 إذا لم تحل المشكلة:

### 1. تحقق من رسائل الخطأ:
- انظر إلى Terminal/Command Prompt
- ابحث عن رسائل الخطأ الحمراء
- اقرأ الرسالة بعناية

### 2. أعد تثبيت التبعيات:
```bash
# في مجلد المشروع الرئيسي
npm run install-all

# أو يدوياً
cd server && npm install
cd ../client && npm install
```

### 3. تحقق من إصدارات البرامج:
```bash
node --version    # يجب أن يكون 16+ 
npm --version     # يجب أن يكون 8+
mysql --version   # يجب أن يكون 8+
```

### 4. استخدم وضع التطوير:
```bash
# في ملف server/.env
NODE_ENV=development
```

## 📞 الحصول على المساعدة:

إذا استمرت المشكلة:
1. انسخ رسالة الخطأ كاملة
2. اذكر الخطوات التي قمت بها
3. اذكر نظام التشغيل المستخدم
4. اذكر إصدارات البرامج

---

**💡 نصيحة:** معظم المشاكل تحل بتشغيل MySQL وإنشاء قاعدة البيانات!