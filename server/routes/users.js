const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// الحصول على جميع المستخدمين (أدمن فقط)
router.get('/', authenticateToken, requireAdmin, (req, res) => {
  const { page = 1, limit = 10, search, role } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT id, username, email, full_name, role, created_at, updated_at
    FROM users
    WHERE 1=1
  `;
  
  const queryParams = [];

  if (search) {
    query += ' AND (username LIKE ? OR email LIKE ? OR full_name LIKE ?)';
    queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (role) {
    query += ' AND role = ?';
    queryParams.push(role);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  queryParams.push(parseInt(limit), parseInt(offset));

  db.query(query, queryParams, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'خطأ في الخادم' });
    }

    // الحصول على العدد الإجمالي للمستخدمين
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const countParams = [];

    if (search) {
      countQuery += ' AND (username LIKE ? OR email LIKE ? OR full_name LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (role) {
      countQuery += ' AND role = ?';
      countParams.push(role);
    }

    db.query(countQuery, countParams, (err, countResults) => {
      if (err) {
        return res.status(500).json({ message: 'خطأ في الخادم' });
      }

      const total = countResults[0].total;
      const totalPages = Math.ceil(total / limit);

      res.json({
        users: results,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers: total,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      });
    });
  });
});

// الحصول على مستخدم واحد (أدمن فقط)
router.get('/:id', authenticateToken, requireAdmin, (req, res) => {
  const userId = req.params.id;

  const query = `
    SELECT u.id, u.username, u.email, u.full_name, u.role, u.created_at, u.updated_at,
           COUNT(f.id) as uploaded_files
    FROM users u
    LEFT JOIN files f ON u.id = f.uploaded_by
    WHERE u.id = ?
    GROUP BY u.id
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'خطأ في الخادم' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    res.json(results[0]);
  });
});

// تحديث معلومات المستخدم (أدمن فقط)
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  const userId = req.params.id;
  const { username, email, fullName, role } = req.body;

  if (!username || !email || !fullName || !role) {
    return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
  }

  // التحقق من عدم وجود اسم المستخدم أو البريد الإلكتروني مع مستخدم آخر
  db.query(
    'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
    [username, email, userId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'خطأ في الخادم' });
      }

      if (results.length > 0) {
        return res.status(400).json({ message: 'اسم المستخدم أو البريد الإلكتروني موجود مسبقاً' });
      }

      const query = `
        UPDATE users 
        SET username = ?, email = ?, full_name = ?, role = ?
        WHERE id = ?
      `;

      db.query(query, [username, email, fullName, role, userId], (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'خطأ في تحديث المستخدم' });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'المستخدم غير موجود' });
        }

        res.json({ message: 'تم تحديث المستخدم بنجاح' });
      });
    }
  );
});

// تغيير كلمة المرور (أدمن فقط)
router.put('/:id/password', authenticateToken, requireAdmin, async (req, res) => {
  const userId = req.params.id;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
  }

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId],
      (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'خطأ في تحديث كلمة المرور' });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'المستخدم غير موجود' });
        }

        res.json({ message: 'تم تحديث كلمة المرور بنجاح' });
      }
    );
  } catch (error) {
    res.status(500).json({ message: 'خطأ في تشفير كلمة المرور' });
  }
});

// حذف مستخدم (أدمن فقط)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  const userId = req.params.id;

  // التحقق من عدم حذف المستخدم الحالي
  if (parseInt(userId) === req.user.id) {
    return res.status(400).json({ message: 'لا يمكنك حذف حسابك الخاص' });
  }

  // التحقق من وجود ملفات مرفوعة من قبل المستخدم
  db.query(
    'SELECT COUNT(*) as file_count FROM files WHERE uploaded_by = ?',
    [userId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'خطأ في الخادم' });
      }

      const fileCount = results[0].file_count;
      if (fileCount > 0) {
        return res.status(400).json({ 
          message: `لا يمكن حذف المستخدم لأنه رفع ${fileCount} ملف. يرجى حذف الملفات أولاً أو نقل ملكيتها.` 
        });
      }

      // حذف المستخدم
      db.query('DELETE FROM users WHERE id = ?', [userId], (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'خطأ في حذف المستخدم' });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'المستخدم غير موجود' });
        }

        res.json({ message: 'تم حذف المستخدم بنجاح' });
      });
    }
  );
});

// إنشاء مستخدم جديد (أدمن فقط)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { username, email, password, fullName, role = 'student' } = req.body;

    if (!username || !email || !password || !fullName) {
      return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
    }

    // التحقق من وجود المستخدم مسبقاً
    db.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email],
      async (err, results) => {
        if (err) {
          return res.status(500).json({ message: 'خطأ في الخادم' });
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
              return res.status(500).json({ message: 'خطأ في إنشاء المستخدم' });
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

// الحصول على إحصائيات المستخدمين (أدمن فقط)
router.get('/stats/overview', authenticateToken, requireAdmin, (req, res) => {
  const queries = {
    totalUsers: 'SELECT COUNT(*) as count FROM users',
    usersByRole: 'SELECT role, COUNT(*) as count FROM users GROUP BY role',
    recentUsers: `
      SELECT username, full_name, role, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 5
    `,
    activeUploaders: `
      SELECT u.username, u.full_name, COUNT(f.id) as upload_count
      FROM users u
      JOIN files f ON u.id = f.uploaded_by
      GROUP BY u.id, u.username, u.full_name
      ORDER BY upload_count DESC
      LIMIT 5
    `
  };

  const results = {};
  let completedQueries = 0;
  const totalQueries = Object.keys(queries).length;

  Object.keys(queries).forEach(key => {
    db.query(queries[key], (err, queryResults) => {
      if (err) {
        console.error(`خطأ في استعلام ${key}:`, err);
        results[key] = null;
      } else {
        results[key] = queryResults;
      }

      completedQueries++;
      if (completedQueries === totalQueries) {
        res.json(results);
      }
    });
  });
});

module.exports = router;