@echo off
echo ========================================
echo    إعداد قاعدة البيانات
echo ========================================
echo.

echo يرجى التأكد من تشغيل MySQL أولاً
echo.

echo إنشاء قاعدة البيانات...
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS grade11_study_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo.
echo تم إنشاء قاعدة البيانات بنجاح!
echo.

echo الآن يمكنك تشغيل المشروع باستخدام start.bat
echo.

pause