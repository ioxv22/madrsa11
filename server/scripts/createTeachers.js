const bcrypt = require('bcryptjs');
const db = require('../config/database');

const createTeachers = async () => {
  try {
    console.log('🎓 إنشاء حسابات الأساتذة...');

    // كلمة مرور موحدة للأساتذة
    const teacherPassword = await bcrypt.hash('teacher123', 10);

    // بيانات الأساتذة لكل مادة
    const teachers = [
      {
        username: 'math_teacher',
        email: 'math.teacher@grade11.com',
        password: teacherPassword,
        full_name: 'أستاذ الرياضيات',
        role: 'teacher',
        subject: 'mathematics'
      },
      {
        username: 'physics_teacher',
        email: 'physics.teacher@grade11.com',
        password: teacherPassword,
        full_name: 'أستاذ الفيزياء',
        role: 'teacher',
        subject: 'physics'
      },
      {
        username: 'chemistry_teacher',
        email: 'chemistry.teacher@grade11.com',
        password: teacherPassword,
        full_name: 'أستاذ الكيمياء',
        role: 'teacher',
        subject: 'chemistry'
      },
      {
        username: 'english_teacher',
        email: 'english.teacher@grade11.com',
        password: teacherPassword,
        full_name: 'أستاذ اللغة الإنجليزية',
        role: 'teacher',
        subject: 'english'
      },
      {
        username: 'arabic_teacher',
        email: 'arabic.teacher@grade11.com',
        password: teacherPassword,
        full_name: 'أستاذ اللغة العربية',
        role: 'teacher',
        subject: 'arabic'
      },
      {
        username: 'biology_teacher',
        email: 'biology.teacher@grade11.com',
        password: teacherPassword,
        full_name: 'أستاذ الأحياء',
        role: 'teacher',
        subject: 'biology'
      }
    ];

    // إنشاء الأساتذة
    for (const teacher of teachers) {
      // الحصول على ID المادة
      const subjectQuery = 'SELECT id FROM subjects WHERE name = ?';
      
      db.query(subjectQuery, [teacher.subject], (err, subjectResults) => {
        if (err) {
          console.error(`❌ خطأ في البحث عن المادة ${teacher.subject}:`, err);
          return;
        }

        if (subjectResults.length === 0) {
          console.error(`❌ المادة ${teacher.subject} غير موجودة`);
          return;
        }

        const subjectId = subjectResults[0].id;

        // التحقق من وجود المعلم
        const checkQuery = 'SELECT id FROM users WHERE username = ? OR email = ?';
        
        db.query(checkQuery, [teacher.username, teacher.email], (err, results) => {
          if (err) {
            console.error(`❌ خطأ في التحقق من المعلم ${teacher.username}:`, err);
            return;
          }

          if (results.length > 0) {
            console.log(`⚠️  المعلم ${teacher.username} موجود مسبقاً`);
            return;
          }

          // إدراج المعلم الجديد
          const insertQuery = `
            INSERT INTO users (username, email, password, full_name, role, subject_id) 
            VALUES (?, ?, ?, ?, ?, ?)
          `;

          db.query(
            insertQuery,
            [teacher.username, teacher.email, teacher.password, teacher.full_name, teacher.role, subjectId],
            (err, result) => {
              if (err) {
                console.error(`❌ خطأ في إنشاء المعلم ${teacher.username}:`, err);
              } else {
                console.log(`✅ تم إنشاء حساب ${teacher.full_name} (${teacher.username})`);
              }
            }
          );
        });
      });
    }

    console.log('✨ تم الانتهاء من إنشاء حسابات الأساتذة');
    console.log('🔑 كلمة المرور الموحدة للأساتذة: teacher123');
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء حسابات الأساتذة:', error);
  }
};

// تشغيل السكريبت إذا تم استدعاؤه مباشرة
if (require.main === module) {
  createTeachers();
  
  // إغلاق الاتصال بعد 5 ثوان
  setTimeout(() => {
    process.exit(0);
  }, 5000);
}

module.exports = createTeachers;