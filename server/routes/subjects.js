const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// الحصول على جميع المواد
router.get('/', (req, res) => {
  const query = `
    SELECT s.*, 
           COUNT(f.id) as file_count
    FROM subjects s
    LEFT JOIN files f ON s.id = f.subject_id
    GROUP BY s.id
    ORDER BY s.name_ar
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'خطأ في الخادم' });
    }

    res.json(results);
  });
});

// الحصول على مادة واحدة
router.get('/:id', (req, res) => {
  const subjectId = req.params.id;

  const query = `
    SELECT s.*, 
           COUNT(f.id) as file_count
    FROM subjects s
    LEFT JOIN files f ON s.id = f.subject_id
    WHERE s.id = ?
    GROUP BY s.id
  `;

  db.query(query, [subjectId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'خطأ في الخادم' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'المادة غير موجودة' });
    }

    res.json(results[0]);
  });
});

// إضافة مادة جديدة (أدمن فقط)
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  const { name, nameAr, description, color, icon } = req.body;

  if (!name || !nameAr) {
    return res.status(400).json({ message: 'اسم المادة باللغتين مطلوب' });
  }

  const query = `
    INSERT INTO subjects (name, name_ar, description, color, icon)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [name, nameAr, description || '', color || '#007bff', icon || 'book'],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ message: 'اسم المادة موجود مسبقاً' });
        }
        return res.status(500).json({ message: 'خطأ في إضافة المادة' });
      }

      res.status(201).json({
        message: 'تم إضافة المادة بنجاح',
        subjectId: result.insertId
      });
    }
  );
});

// تحديث مادة (أدمن فقط)
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  const subjectId = req.params.id;
  const { name, nameAr, description, color, icon } = req.body;

  if (!name || !nameAr) {
    return res.status(400).json({ message: 'اسم المادة باللغتين مطلوب' });
  }

  const query = `
    UPDATE subjects 
    SET name = ?, name_ar = ?, description = ?, color = ?, icon = ?
    WHERE id = ?
  `;

  db.query(
    query,
    [name, nameAr, description || '', color || '#007bff', icon || 'book', subjectId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'خطأ في تحديث المادة' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'المادة غير موجودة' });
      }

      res.json({ message: 'تم تحديث المادة بنجاح' });
    }
  );
});

// حذف مادة (أدمن فقط)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  const subjectId = req.params.id;

  // التحقق من وجود ملفات مرتبطة بالمادة
  db.query(
    'SELECT COUNT(*) as file_count FROM files WHERE subject_id = ?',
    [subjectId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'خطأ في الخادم' });
      }

      const fileCount = results[0].file_count;
      if (fileCount > 0) {
        return res.status(400).json({ 
          message: `لا يمكن حذف المادة لأنها تحتوي على ${fileCount} ملف. يرجى حذف الملفات أولاً.` 
        });
      }

      // حذف المادة
      db.query('DELETE FROM subjects WHERE id = ?', [subjectId], (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'خطأ في حذف المادة' });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'المادة غير موجودة' });
        }

        res.json({ message: 'تم حذف المادة بنجاح' });
      });
    }
  );
});

// الحصول على إحصائيات المواد (أدمن فقط)
router.get('/stats/overview', authenticateToken, requireAdmin, (req, res) => {
  const query = `
    SELECT 
      s.id,
      s.name_ar,
      s.color,
      COUNT(f.id) as file_count,
      COALESCE(SUM(f.file_size), 0) as total_size,
      COALESCE(SUM(f.download_count), 0) as total_downloads
    FROM subjects s
    LEFT JOIN files f ON s.id = f.subject_id
    GROUP BY s.id, s.name_ar, s.color
    ORDER BY file_count DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'خطأ في الخادم' });
    }

    res.json(results);
  });
});

module.exports = router;