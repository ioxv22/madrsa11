const mysql = require('mysql2');
require('dotenv').config({ path: './server/.env' });

console.log('🔍 اختبار الاتصال بقاعدة البيانات...\n');

// عرض الإعدادات
console.log('📋 إعدادات قاعدة البيانات:');
console.log(`   المضيف: ${process.env.DB_HOST}`);
console.log(`   المستخدم: ${process.env.DB_USER}`);
console.log(`   كلمة المرور: ${process.env.DB_PASSWORD ? '***' : 'فارغة'}`);
console.log(`   قاعدة البيانات: ${process.env.DB_NAME}\n`);

// اختبار الاتصال بدون قاعدة بيانات أولاً
const testConnection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

testConnection.connect((err) => {
  if (err) {
    console.error('❌ فشل الاتصال بـ MySQL:');
    console.error(`   الخطأ: ${err.message}`);
    console.error(`   الكود: ${err.code}`);
    
    if (err.code === 'ECONNREFUSED') {
      console.log('\n💡 الحلول المقترحة:');
      console.log('   1. تأكد من تشغيل MySQL');
      console.log('   2. إذا كنت تستخدم XAMPP، شغل MySQL من Control Panel');
      console.log('   3. إذا كنت تستخدم MySQL مباشرة، شغل الخدمة');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 الحلول المقترحة:');
      console.log('   1. تحقق من اسم المستخدم وكلمة المرور في ملف .env');
      console.log('   2. تأكد من صحة بيانات الاعتماد');
    }
    
    process.exit(1);
  }

  console.log('✅ تم الاتصال بـ MySQL بنجاح!');

  // اختبار وجود قاعدة البيانات
  testConnection.query(`SHOW DATABASES LIKE '${process.env.DB_NAME}'`, (err, results) => {
    if (err) {
      console.error('❌ خطأ في البحث عن قاعدة البيانات:', err.message);
      testConnection.end();
      process.exit(1);
    }

    if (results.length === 0) {
      console.log('⚠️  قاعدة البيانات غير موجودة');
      console.log('\n🔧 إنشاء قاعدة البيانات...');
      
      const createDbQuery = `CREATE DATABASE ${process.env.DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`;
      
      testConnection.query(createDbQuery, (err) => {
        if (err) {
          console.error('❌ فشل في إنشاء قاعدة البيانات:', err.message);
        } else {
          console.log('✅ تم إنشاء قاعدة البيانات بنجاح!');
        }
        
        testConnection.end();
        testDatabaseConnection();
      });
    } else {
      console.log('✅ قاعدة البيانات موجودة!');
      testConnection.end();
      testDatabaseConnection();
    }
  });
});

// اختبار الاتصال بقاعدة البيانات
function testDatabaseConnection() {
  console.log('\n🔍 اختبار الاتصال بقاعدة البيانات...');
  
  const dbConnection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  dbConnection.connect((err) => {
    if (err) {
      console.error('❌ فشل الاتصال بقاعدة البيانات:', err.message);
      process.exit(1);
    }

    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح!');

    // اختبار الجداول
    dbConnection.query('SHOW TABLES', (err, results) => {
      if (err) {
        console.error('❌ خطأ في عرض الجداول:', err.message);
      } else {
        console.log(`\n📊 الجداول الموجودة (${results.length}):`);
        results.forEach(row => {
          const tableName = Object.values(row)[0];
          console.log(`   - ${tableName}`);
        });

        if (results.length === 0) {
          console.log('   لا توجد جداول (سيتم إنشاؤها عند تشغيل الخادم)');
        }
      }

      dbConnection.end();
      console.log('\n🎉 اختبار قاعدة البيانات مكتمل!');
      console.log('💡 يمكنك الآن تشغيل المشروع باستخدام: npm run dev');
    });
  });
}