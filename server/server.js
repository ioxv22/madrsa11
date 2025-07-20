const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// استيراد قاعدة البيانات
require('./config/database');

// إنشاء المستخدمين الافتراضيين
const createDefaultUsers = require('./scripts/createDefaultUsers');
const createTeachers = require('./scripts/createTeachers');

// استيراد المسارات
const authRoutes = require('./routes/auth');
const subjectRoutes = require('./routes/subjects');
const fileRoutes = require('./routes/files');
const userRoutes = require('./routes/users');
const pathRoutes = require('./routes/paths');
const scenarioRoutes = require('./routes/scenarios');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// تقديم الملفات الثابتة (الملفات المرفوعة)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// المسارات
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/users', userRoutes);
app.use('/api/paths', pathRoutes);
app.use('/api/scenarios', scenarioRoutes);

// مسار الصفحة الرئيسية
app.get('/', (req, res) => {
  res.json({
    message: 'مرحباً بك في منصة الدراسة للصف الحادي عشر',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      subjects: '/api/subjects',
      files: '/api/files',
      users: '/api/users'
    }
  });
});

// مسار للحصول على إحصائيات عامة
app.get('/api/stats', (req, res) => {
  const db = require('./config/database');
  
  const queries = {
    totalSubjects: 'SELECT COUNT(*) as count FROM subjects',
    totalFiles: 'SELECT COUNT(*) as count FROM files',
    totalUsers: 'SELECT COUNT(*) as count FROM users',
    totalDownloads: 'SELECT SUM(download_count) as total FROM files'
  };

  const results = {};
  let completedQueries = 0;
  const totalQueries = Object.keys(queries).length;

  Object.keys(queries).forEach(key => {
    db.query(queries[key], (err, queryResults) => {
      if (err) {
        console.error(`خطأ في استعلام ${key}:`, err);
        results[key] = 0;
      } else {
        results[key] = queryResults[0].count || queryResults[0].total || 0;
      }

      completedQueries++;
      if (completedQueries === totalQueries) {
        res.json(results);
      }
    });
  });
});

// معالجة الأخطاء
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'حجم الملف كبير جداً. الحد الأقصى 100 ميجابايت' });
  }
  
  if (err.message === 'نوع الملف غير مدعوم') {
    return res.status(400).json({ message: err.message });
  }
  
  res.status(500).json({ message: 'خطأ في الخادم' });
});

// معالجة المسارات غير الموجودة
app.use('*', (req, res) => {
  res.status(404).json({ message: 'المسار غير موجود' });
});

// بدء تشغيل الخادم
app.listen(PORT, () => {
  console.log(`🚀 الخادم يعمل على المنفذ ${PORT}`);
  console.log(`📚 منصة الدراسة للصف الحادي عشر`);
  console.log(`🌐 الرابط: http://localhost:${PORT}`);
  
  // إنشاء المستخدمين الافتراضيين بعد بدء الخادم
  setTimeout(() => {
    createDefaultUsers();
  }, 2000);
  
  // إنشاء حسابات الأساتذة
  setTimeout(() => {
    createTeachers();
  }, 4000);
});

module.exports = app;