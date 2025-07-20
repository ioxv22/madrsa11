@echo off
echo ========================================
echo    منصة الدراسة للصف الحادي عشر
echo ========================================
echo.

echo جاري تثبيت التبعيات...
call npm run install-all

echo.
echo جاري تشغيل المشروع...
echo الخادم: http://localhost:5000
echo الواجهة: http://localhost:3000
echo.
echo للإيقاف اضغط Ctrl+C
echo.

call npm run dev

pause