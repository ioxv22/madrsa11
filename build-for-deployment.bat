@echo off
echo 🚀 بناء المشروع للنشر...
echo.

echo 📦 تثبيت dependencies للـ client...
cd client
call npm install
if %errorlevel% neq 0 (
    echo ❌ فشل في تثبيت dependencies
    pause
    exit /b 1
)

echo 🔨 بناء المشروع...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ فشل في بناء المشروع
    pause
    exit /b 1
)

cd ..
echo.
echo ✅ تم بناء المشروع بنجاح!
echo.
echo 📁 مجلد البناء: client\build
echo 🌐 يمكنك الآن رفع مجلد build على Netlify
echo.
echo 📋 الخطوات التالية:
echo 1. اذهب إلى netlify.com
echo 2. اسحب مجلد client\build إلى الموقع
echo 3. أو ربط مع GitHub
echo.
pause