const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// تسجيل مستخدم جديد
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, fullName, role = 'student' } = req.body;

    // التحقق من وجود البيانات المطلوبة
    if (!username || !email || !password || !fullName) {
      return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
    }

    // التحقق من وجود المستخدم مسبقاً
    db.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email],
      async (err, results) => {
        if (err) {
          console.error('خطأ في التحقق من المستخدم:', err);
          return res.status(500).json({ 
            message: 'خطأ في الخادم',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
          });
        }

        if (results.length > 0) {
          return res.status(400).json({ message: 'اسم المستخدم أو البريد الإلكتروني موجود مسبقاً' });
        }

        // تشفير كلمة المرور
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // إدراج المستخدم الجديد
        db.query(
          'INSERT INTO users (username, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)',
          [username, email, hashedPassword, fullName, role],
          (err, result) => {
            if (err) {
              console.error('خطأ في إنشاء المستخدم:', err);
              if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: 'اسم المستخدم أو البريد الإلكتروني موجود مسبقاً' });
              }
              return res.status(500).json({ 
                message: 'خطأ في إنشاء المستخدم',
                error: process.env.NODE_ENV === 'development' ? err.message : undefined
              });
            }

            res.status(201).json({ 
              message: 'تم إنشاء المستخدم بنجاح',
              userId: result.insertId
            });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// تسجيل الدخول
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'اسم المستخدم وكلمة المرور مطلوبان' });
    }

    // البحث عن المستخدم
    db.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, username],
      async (err, results) => {
        if (err) {
          console.error('خطأ في البحث عن المستخدم:', err);
          return res.status(500).json({ 
            message: 'خطأ في الخادم',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
          });
        }

        if (results.length === 0) {
          return res.status(400).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
        }

        const user = results[0];

        // التحقق من كلمة المرور
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return res.status(400).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
        }

        // إنشاء التوكن
        const token = jwt.sign(
          { id: user.id, username: user.username, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.json({
          message: 'تم تسجيل الدخول بنجاح',
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.full_name,
            role: user.role
          }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// الحصول على معلومات المستخدم الحالي
router.get('/me', authenticateToken, (req, res) => {
  db.query(
    'SELECT id, username, email, full_name, role, created_at FROM users WHERE id = ?',
    [req.user.id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'خطأ في الخادم' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'المستخدم غير موجود' });
      }

      const user = results[0];
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        createdAt: user.created_at
      });
    }
  );
});

// تسجيل الخروج (في الواقع يتم التعامل معه في الواجهة الأمامية)
router.post('/logout', (req, res) => {
  res.json({ message: 'تم تسجيل الخروج بنجاح' });
});

module.exports = router;