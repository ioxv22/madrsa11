const db = require('../config/database');

const addSubjectColumn = async () => {
  try {
    console.log('🔧 إضافة عمود subject_id إلى جدول المستخدمين...');

    // التحقق من وجود العمود
    const checkColumnQuery = `
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'subject_id'
      AND TABLE_SCHEMA = DATABASE()
    `;

    db.query(checkColumnQuery, (err, results) => {
      if (err) {
        console.error('❌ خطأ في التحقق من العمود:', err);
        return;
      }

      if (results.length > 0) {
        console.log('✅ العمود subject_id موجود مسبقاً');
        process.exit(0);
        return;
      }

      // إضافة العمود
      const addColumnQuery = `
        ALTER TABLE users 
        ADD COLUMN subject_id INT NULL,
        ADD FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
      `;

      db.query(addColumnQuery, (err, result) => {
        if (err) {
          console.error('❌ خطأ في إضافة العمود:', err);
        } else {
          console.log('✅ تم إضافة عمود subject_id بنجاح');
        }
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ خطأ عام:', error);
    process.exit(1);
  }
};

// تشغيل السكريبت
addSubjectColumn();