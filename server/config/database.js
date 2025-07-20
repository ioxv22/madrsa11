const mysql = require('mysql2');
require('dotenv').config();

// إنشاء اتصال بقاعدة البيانات
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: 'utf8mb4'
});

// اختبار الاتصال
connection.connect((err) => {
  if (err) {
    console.error('خطأ في الاتصال بقاعدة البيانات:', err);
    return;
  }
  console.log('تم الاتصال بقاعدة البيانات بنجاح');
});

// إنشاء الجداول إذا لم تكن موجودة
const createTables = () => {
  // جدول المستخدمين
  const usersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('student', 'admin', 'teacher') DEFAULT 'student',
      full_name VARCHAR(100) NOT NULL,
      subject_id INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `;

  // جدول المواد الدراسية
  const subjectsTable = `
    CREATE TABLE IF NOT EXISTS subjects (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      name_ar VARCHAR(100) NOT NULL,
      description TEXT,
      color VARCHAR(7) DEFAULT '#007bff',
      icon VARCHAR(50) DEFAULT 'book',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `;

  // جدول الملفات
  const filesTable = `
    CREATE TABLE IF NOT EXISTS files (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      filename VARCHAR(255) NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      file_type VARCHAR(50) NOT NULL,
      file_size INT NOT NULL,
      subject_id INT NOT NULL,
      uploaded_by INT NOT NULL,
      download_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
      FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `;

  // تنفيذ إنشاء الجداول
  connection.query(usersTable, (err) => {
    if (err) console.error('خطأ في إنشاء جدول المستخدمين:', err);
    else console.log('تم إنشاء جدول المستخدمين');
  });

  connection.query(subjectsTable, (err) => {
    if (err) console.error('خطأ في إنشاء جدول المواد:', err);
    else console.log('تم إنشاء جدول المواد');
  });

  connection.query(filesTable, (err) => {
    if (err) console.error('خطأ في إنشاء جدول الملفات:', err);
    else console.log('تم إنشاء جدول الملفات');
  });

  // إدراج المواد الافتراضية
  const defaultSubjects = [
    ['mathematics', 'الرياضيات', 'مادة الرياضيات للصف الحادي عشر', '#ff6b6b', 'calculator'],
    ['physics', 'الفيزياء', 'مادة الفيزياء للصف الحادي عشر', '#4ecdc4', 'atom'],
    ['chemistry', 'الكيمياء', 'مادة الكيمياء للصف الحادي عشر', '#45b7d1', 'flask'],
    ['english', 'اللغة الإنجليزية', 'مادة اللغة الإنجليزية للصف الحادي عشر', '#96ceb4', 'language'],
    ['arabic', 'اللغة العربية', 'مادة اللغة العربية للصف الحادي عشر', '#feca57', 'book-open'],
    ['biology', 'الأحياء', 'مادة الأحياء للصف الحادي عشر', '#ff9ff3', 'leaf']
  ];

  const insertSubjects = `
    INSERT IGNORE INTO subjects (name, name_ar, description, color, icon) VALUES ?
  `;

  connection.query(insertSubjects, [defaultSubjects], (err) => {
    if (err) console.error('خطأ في إدراج المواد الافتراضية:', err);
    else console.log('تم إدراج المواد الافتراضية');
  });
};

// تنفيذ إنشاء الجداول
createTables();

module.exports = connection;