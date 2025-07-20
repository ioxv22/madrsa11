const db = require('../config/database');

const updateRoleEnum = async () => {
  try {
    console.log('🔧 تحديث ENUM للأدوار لإضافة teacher...');

    // تحديث ENUM لإضافة teacher
    const updateEnumQuery = `
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('student', 'admin', 'teacher') DEFAULT 'student'
    `;

    db.query(updateEnumQuery, (err, result) => {
      if (err) {
        console.error('❌ خطأ في تحديث ENUM:', err);
      } else {
        console.log('✅ تم تحديث ENUM بنجاح - أضيف دور teacher');
      }
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ خطأ عام:', error);
    process.exit(1);
  }
};

// تشغيل السكريبت
updateRoleEnum();