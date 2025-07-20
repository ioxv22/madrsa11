const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// إعداد multer لرفع الملفات
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // إنشاء اسم ملف فريد
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
  }
});

// فلترة أنواع الملفات المسموحة
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'video/mp4',
    'video/avi',
    'video/mov',
    'text/plain'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('نوع الملف غير مدعوم'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  }
});

// الحصول على جميع الملفات مع إمكانية التصفية
router.get('/', (req, res) => {
  const { subject_id, search, file_type, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT f.*, s.name_ar as subject_name, s.color as subject_color,
           u.full_name as uploader_name
    FROM files f
    JOIN subjects s ON f.subject_id = s.id
    JOIN users u ON f.uploaded_by = u.id
    WHERE 1=1
  `;
  
  const queryParams = [];

  if (subject_id) {
    query += ' AND f.subject_id = ?';
    queryParams.push(subject_id);
  }

  if (search) {
    query += ' AND (f.title LIKE ? OR f.description LIKE ?)';
    queryParams.push(`%${search}%`, `%${search}%`);
  }

  if (file_type) {
    query += ' AND f.file_type LIKE ?';
    queryParams.push(`%${file_type}%`);
  }

  query += ' ORDER BY f.created_at DESC LIMIT ? OFFSET ?';
  queryParams.push(parseInt(limit), parseInt(offset));

  db.query(query, queryParams, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'خطأ في الخادم' });
    }

    // الحصول على العدد الإجمالي للملفات
    let countQuery = `
      SELECT COUNT(*) as total
      FROM files f
      WHERE 1=1
    `;
    
    const countParams = [];
    
    if (subject_id) {
      countQuery += ' AND f.subject_id = ?';
      countParams.push(subject_id);
    }

    if (search) {
      countQuery += ' AND (f.title LIKE ? OR f.description LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    if (file_type) {
      countQuery += ' AND f.file_type LIKE ?';
      countParams.push(`%${file_type}%`);
    }

    db.query(countQuery, countParams, (err, countResults) => {
      if (err) {
        return res.status(500).json({ message: 'خطأ في الخادم' });
      }

      const total = countResults[0].total;
      const totalPages = Math.ceil(total / limit);

      res.json({
        files: results,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalFiles: total,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      });
    });
  });
});

// الحصول على ملف واحد
router.get('/:id', (req, res) => {
  const fileId = req.params.id;

  const query = `
    SELECT f.*, s.name_ar as subject_name, s.color as subject_color,
           u.full_name as uploader_name
    FROM files f
    JOIN subjects s ON f.subject_id = s.id
    JOIN users u ON f.uploaded_by = u.id
    WHERE f.id = ?
  `;

  db.query(query, [fileId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'خطأ في الخادم' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'الملف غير موجود' });
    }

    res.json(results[0]);
  });
});

// رفع ملف جديد (أدمن فقط)
router.post('/upload', authenticateToken, requireAdmin, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'لم يتم اختيار ملف' });
    }

    const { title, description, subject_id } = req.body;

    if (!title || !subject_id) {
      // حذف الملف المرفوع إذا كانت البيانات ناقصة
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'عنوان الملف ومعرف المادة مطلوبان' });
    }

    // التحقق من وجود المادة
    db.query('SELECT id FROM subjects WHERE id = ?', [subject_id], (err, subjectResults) => {
      if (err) {
        fs.unlinkSync(req.file.path);
        return res.status(500).json({ message: 'خطأ في الخادم' });
      }

      if (subjectResults.length === 0) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: 'المادة غير موجودة' });
      }

      // إدراج معلومات الملف في قاعدة البيانات
      const query = `
        INSERT INTO files (title, description, filename, original_name, file_type, file_size, subject_id, uploaded_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(
        query,
        [
          title,
          description || '',
          req.file.filename,
          req.file.originalname,
          req.file.mimetype,
          req.file.size,
          subject_id,
          req.user.id
        ],
        (err, result) => {
          if (err) {
            fs.unlinkSync(req.file.path);
            return res.status(500).json({ message: 'خطأ في حفظ معلومات الملف' });
          }

          res.status(201).json({
            message: 'تم رفع الملف بنجاح',
            fileId: result.insertId,
            filename: req.file.filename
          });
        }
      );
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'خطأ في رفع الملف' });
  }
});

// تحديث معلومات الملف (أدمن فقط)
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  const fileId = req.params.id;
  const { title, description, subject_id } = req.body;

  if (!title || !subject_id) {
    return res.status(400).json({ message: 'عنوان الملف ومعرف المادة مطلوبان' });
  }

  // التحقق من وجود المادة
  db.query('SELECT id FROM subjects WHERE id = ?', [subject_id], (err, subjectResults) => {
    if (err) {
      return res.status(500).json({ message: 'خطأ في الخادم' });
    }

    if (subjectResults.length === 0) {
      return res.status(400).json({ message: 'المادة غير موجودة' });
    }

    const query = `
      UPDATE files 
      SET title = ?, description = ?, subject_id = ?
      WHERE id = ?
    `;

    db.query(query, [title, description || '', subject_id, fileId], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'خطأ في تحديث الملف' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'الملف غير موجود' });
      }

      res.json({ message: 'تم تحديث الملف بنجاح' });
    });
  });
});

// حذف ملف (أدمن فقط)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  const fileId = req.params.id;

  // الحصول على معلومات الملف أولاً
  db.query('SELECT filename FROM files WHERE id = ?', [fileId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'خطأ في الخادم' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'الملف غير موجود' });
    }

    const filename = results[0].filename;
    const filePath = path.join(__dirname, '../uploads', filename);

    // حذف الملف من قاعدة البيانات
    db.query('DELETE FROM files WHERE id = ?', [fileId], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'خطأ في حذف الملف من قاعدة البيانات' });
      }

      // حذف الملف الفعلي من النظام
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (error) {
          console.error('خطأ في حذف الملف:', error);
        }
      }

      res.json({ message: 'تم حذف الملف بنجاح' });
    });
  });
});

// تحميل ملف
router.get('/download/:id', (req, res) => {
  const fileId = req.params.id;

  db.query('SELECT * FROM files WHERE id = ?', [fileId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'خطأ في الخادم' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'الملف غير موجود' });
    }

    const file = results[0];
    const filePath = path.join(__dirname, '../uploads', file.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'الملف غير موجود على الخادم' });
    }

    // زيادة عداد التحميل
    db.query('UPDATE files SET download_count = download_count + 1 WHERE id = ?', [fileId]);

    // إرسال الملف
    res.download(filePath, file.original_name, (err) => {
      if (err) {
        console.error('خطأ في تحميل الملف:', err);
        res.status(500).json({ message: 'خطأ في تحميل الملف' });
      }
    });
  });
});

// الحصول على إحصائيات الملفات (أدمن فقط)
router.get('/stats/overview', authenticateToken, requireAdmin, (req, res) => {
  const queries = {
    totalFiles: 'SELECT COUNT(*) as count FROM files',
    totalSize: 'SELECT SUM(file_size) as size FROM files',
    totalDownloads: 'SELECT SUM(download_count) as downloads FROM files',
    filesByType: `
      SELECT 
        CASE 
          WHEN file_type LIKE '%pdf%' THEN 'PDF'
          WHEN file_type LIKE '%image%' THEN 'صور'
          WHEN file_type LIKE '%video%' THEN 'فيديو'
          WHEN file_type LIKE '%word%' OR file_type LIKE '%document%' THEN 'مستندات'
          WHEN file_type LIKE '%powerpoint%' OR file_type LIKE '%presentation%' THEN 'عروض تقديمية'
          ELSE 'أخرى'
        END as type,
        COUNT(*) as count
      FROM files
      GROUP BY type
    `,
    recentFiles: `
      SELECT f.title, f.created_at, s.name_ar as subject_name
      FROM files f
      JOIN subjects s ON f.subject_id = s.id
      ORDER BY f.created_at DESC
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

// إحصائيات المعلم لمادته
router.get('/stats/teacher/:subjectId', authenticateToken, (req, res) => {
  const subjectId = req.params.subjectId;
  const userId = req.user.id;

  // التحقق من أن المعلم يدرس هذه المادة أو أنه أدمن
  if (req.user.role !== 'admin' && req.user.subject_id != subjectId) {
    return res.status(403).json({ message: 'غير مصرح لك بالوصول لهذه البيانات' });
  }

  const queries = {
    totalFiles: 'SELECT COUNT(*) as count FROM files WHERE subject_id = ?',
    totalDownloads: 'SELECT SUM(download_count) as downloads FROM files WHERE subject_id = ?',
    recentFiles: 'SELECT COUNT(*) as count FROM files WHERE subject_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)',
    totalViews: 'SELECT SUM(download_count) as views FROM files WHERE subject_id = ?'
  };

  const results = {};
  let completedQueries = 0;
  const totalQueries = Object.keys(queries).length;

  Object.keys(queries).forEach(key => {
    db.query(queries[key], [subjectId], (err, queryResults) => {
      if (err) {
        console.error(`خطأ في استعلام ${key}:`, err);
        results[key] = 0;
      } else {
        const result = queryResults[0];
        results[key] = result.count || result.downloads || result.views || 0;
      }

      completedQueries++;
      if (completedQueries === totalQueries) {
        res.json({
          overview: {
            totalFiles: results.totalFiles,
            totalDownloads: results.totalDownloads,
            recentFiles: results.recentFiles,
            totalViews: results.totalViews
          }
        });
      }
    });
  });
});

module.exports = router;