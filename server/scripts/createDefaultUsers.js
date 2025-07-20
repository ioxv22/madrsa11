const bcrypt = require('bcryptjs');
const db = require('../config/database');

const createDefaultUsers = async () => {
  try {
    console.log('🔄 إنشاء المستخدمين الافتراضيين...');

    // تشفير كلمات المرور
    const adminPassword = await bcrypt.hash('SuperAdmin@2024#SecurePass!', 10);
    const studentPassword = await bcrypt.hash('student123', 10);

    // المستخدمين الافتراضيين
    const defaultUsers = [
      {
        username: 'admin',
        email: 'admin@grade11.com',
        password: adminPassword,
        full_name: 'مدير النظام',
        role: 'admin'
      },
      {
        username: 'student',
        email: 'student@grade11.com',
        password: studentPassword,
        full_name: 'طالب تجريبي',
        role: 'student'
      }
    ];

    // إدراج المستخدمين
    for (const user of defaultUsers) {
      // التحقق من وجود المستخدم
      const checkQuery = 'SELECT id FROM users WHERE username = ? OR email = ?';
      
      db.query(checkQuery, [user.username, user.email], (err, results) => {
        if (err) {
          console.error(`❌ خطأ في التحقق من المستخدم ${user.username}:`, err);
          return;
        }

        if (results.length > 0) {
          console.log(`⚠️  المستخدم ${user.username} موجود مسبقاً`);
          return;
        }

        // إدراج المستخدم الجديد
        const insertQuery = `
          INSERT INTO users (username, email, password, full_name, role) 
          VALUES (?, ?, ?, ?, ?)
        `;

        db.query(
          insertQuery,
          [user.username, user.email, user.password, user.full_name, user.role],
          (err, result) => {
            if (err) {
              console.error(`❌ خطأ في إنشاء المستخدم ${user.username}:`, err);
            } else {
              console.log(`✅ تم إنشاء المستخدم ${user.username} بنجاح`);
            }
          }
        );
      });
    }

    console.log('✨ تم الانتهاء من إنشاء المستخدمين الافتراضيين');
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء المستخدمين الافتراضيين:', error);
  }
};

// تشغيل السكريبت إذا تم استدعاؤه مباشرة
if (require.main === module) {
  createDefaultUsers();
  
  // إغلاق الاتصال بعد 3 ثوان
  setTimeout(() => {
    process.exit(0);
  }, 3000);
}

module.exports = createDefaultUsers;