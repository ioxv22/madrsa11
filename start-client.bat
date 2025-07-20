@echo off
echo ========================================
echo    تشغيل واجهة منصة الدراسة
echo ========================================
echo.

cd client
echo جاري تثبيت تبعيات الواجهة...
call npm install

echo.
echo جاري تشغيل الواجهة...
echo الواجهة متاحة على: http://localhost:3000
echo.

call npm start

pause