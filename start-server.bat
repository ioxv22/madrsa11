@echo off
echo ========================================
echo    تشغيل خادم منصة الدراسة
echo ========================================
echo.

cd server
echo جاري تثبيت تبعيات الخادم...
call npm install

echo.
echo جاري تشغيل الخادم...
echo الخادم متاح على: http://localhost:5000
echo.

call npm run dev

pause