const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// الحصول على جميع السيناريوهات مع المواد
router.get('/', (req, res) => {
  const query = `
    SELECT 
      s.*,
      p.name_ar as path_name,
      GROUP_CONCAT(
        JSON_OBJECT(
          'id', sub.id,
          'name', sub.name,
          'name_ar', sub.name_ar,
          'color', sub.color,
          'icon', sub.icon,
          'is_core', ss.is_core
        )
      ) as subjects_json
    FROM scenarios s
    JOIN paths p ON s.path_id = p.id
    LEFT JOIN scenario_subjects ss ON s.id = ss.scenario_id
    LEFT JOIN subjects sub ON ss.subject_id = sub.id
    GROUP BY s.id
    ORDER BY s.path_id, s.id
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('خطأ في جلب السيناريوهات:', err);
      return res.status(500).json({ message: 'خطأ في الخادم' });
    }
    
    // تحويل JSON strings إلى objects
    const scenarios = results.map(scenario => {
      let subjects = [];
      if (scenario.subjects_json) {
        try {
          const subjectsStr = scenario.subjects_json;
          subjects = subjectsStr.split(',').map(subjectStr => JSON.parse(subjectStr));
        } catch (e) {
          console.error('خطأ في تحليل JSON:', e);
        }
      }
      
      return {
        ...scenario,
        subjects,
        subjects_json: undefined
      };
    });
    
    res.json({ data: scenarios });
  });
});

// الحصول على سيناريو محدد مع المواد
router.get('/:id', (req, res) => {
  const scenarioId = req.params.id;
  const query = `
    SELECT 
      s.*,
      p.name_ar as path_name,
      GROUP_CONCAT(
        JSON_OBJECT(
          'id', sub.id,
          'name', sub.name,
          'name_ar', sub.name_ar,
          'color', sub.color,
          'icon', sub.icon,
          'is_core', ss.is_core
        )
      ) as subjects_json
    FROM scenarios s
    JOIN paths p ON s.path_id = p.id
    LEFT JOIN scenario_subjects ss ON s.id = ss.scenario_id
    LEFT JOIN subjects sub ON ss.subject_id = sub.id
    WHERE s.id = ?
    GROUP BY s.id
  `;
  
  db.query(query, [scenarioId], (err, results) => {
    if (err) {
      console.error('خطأ في جلب السيناريو:', err);
      return res.status(500).json({ message: 'خطأ في الخادم' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'السيناريو غير موجود' });
    }
    
    const scenario = results[0];
    let subjects = [];
    
    if (scenario.subjects_json) {
      try {
        const subjectsStr = scenario.subjects_json;
        subjects = subjectsStr.split(',').map(subjectStr => JSON.parse(subjectStr));
      } catch (e) {
        console.error('خطأ في تحليل JSON:', e);
      }
    }
    
    res.json({ 
      data: {
        ...scenario,
        subjects,
        subjects_json: undefined
      }
    });
  });
});

// الحصول على السيناريوهات حسب المسار
router.get('/path/:pathId', (req, res) => {
  const pathId = req.params.pathId;
  const query = `
    SELECT 
      s.*,
      GROUP_CONCAT(
        JSON_OBJECT(
          'id', sub.id,
          'name', sub.name,
          'name_ar', sub.name_ar,
          'color', sub.color,
          'icon', sub.icon,
          'is_core', ss.is_core
        )
      ) as subjects_json
    FROM scenarios s
    LEFT JOIN scenario_subjects ss ON s.id = ss.scenario_id
    LEFT JOIN subjects sub ON ss.subject_id = sub.id
    WHERE s.path_id = ?
    GROUP BY s.id
    ORDER BY s.id
  `;
  
  db.query(query, [pathId], (err, results) => {
    if (err) {
      console.error('خطأ في جلب سيناريوهات المسار:', err);
      return res.status(500).json({ message: 'خطأ في الخادم' });
    }
    
    const scenarios = results.map(scenario => {
      let subjects = [];
      if (scenario.subjects_json) {
        try {
          const subjectsStr = scenario.subjects_json;
          subjects = subjectsStr.split(',').map(subjectStr => JSON.parse(subjectStr));
        } catch (e) {
          console.error('خطأ في تحليل JSON:', e);
        }
      }
      
      return {
        ...scenario,
        subjects,
        subjects_json: undefined
      };
    });
    
    res.json({ data: scenarios });
  });
});

// الحصول على المواد حسب السيناريو
router.get('/:id/subjects', (req, res) => {
  const scenarioId = req.params.id;
  const query = `
    SELECT 
      sub.*,
      ss.is_core
    FROM scenario_subjects ss
    JOIN subjects sub ON ss.subject_id = sub.id
    WHERE ss.scenario_id = ?
    ORDER BY ss.is_core DESC, sub.name_ar
  `;
  
  db.query(query, [scenarioId], (err, results) => {
    if (err) {
      console.error('خطأ في جلب مواد السيناريو:', err);
      return res.status(500).json({ message: 'خطأ في الخادم' });
    }
    
    res.json({ data: results });
  });
});

// إنشاء سيناريو جديد (للأدمن)
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  const { path_id, name, name_ar, description } = req.body;
  
  if (!path_id || !name || !name_ar) {
    return res.status(400).json({ message: 'معرف المسار واسم السيناريو مطلوبان' });
  }
  
  // التحقق من وجود المسار
  const checkPathQuery = 'SELECT id FROM paths WHERE id = ?';
  
  db.query(checkPathQuery, [path_id], (err, pathResults) => {
    if (err) {
      console.error('خطأ في التحقق من المسار:', err);
      return res.status(500).json({ message: 'خطأ في الخادم' });
    }
    
    if (pathResults.length === 0) {
      return res.status(400).json({ message: 'المسار غير موجود' });
    }
    
    // إنشاء السيناريو
    const insertQuery = 'INSERT INTO scenarios (path_id, name, name_ar, description) VALUES (?, ?, ?, ?)';
    
    db.query(insertQuery, [path_id, name, name_ar, description], (err, result) => {
      if (err) {
        console.error('خطأ في إنشاء السيناريو:', err);
        return res.status(500).json({ message: 'خطأ في إنشاء السيناريو' });
      }
      
      res.status(201).json({
        message: 'تم إنشاء السيناريو بنجاح',
        scenarioId: result.insertId
      });
    });
  });
});

// تحديث سيناريو (للأدمن)
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  const scenarioId = req.params.id;
  const { name, name_ar, description } = req.body;
  
  if (!name || !name_ar) {
    return res.status(400).json({ message: 'اسم السيناريو مطلوب بالعربية والإنجليزية' });
  }
  
  const query = 'UPDATE scenarios SET name = ?, name_ar = ?, description = ? WHERE id = ?';
  
  db.query(query, [name, name_ar, description, scenarioId], (err, result) => {
    if (err) {
      console.error('خطأ في تحديث السيناريو:', err);
      return res.status(500).json({ message: 'خطأ في تحديث السيناريو' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'السيناريو غير موجود' });
    }
    
    res.json({ message: 'تم تحديث السيناريو بنجاح' });
  });
});

// ربط مواد بسيناريو (للأدمن)
router.post('/:id/subjects', authenticateToken, requireAdmin, (req, res) => {
  const scenarioId = req.params.id;
  const { subjectIds } = req.body;
  
  if (!Array.isArray(subjectIds) || subjectIds.length === 0) {
    return res.status(400).json({ message: 'قائمة معرفات المواد مطلوبة' });
  }
  
  // حذف الروابط الحالية
  const deleteQuery = 'DELETE FROM scenario_subjects WHERE scenario_id = ?';
  
  db.query(deleteQuery, [scenarioId], (err) => {
    if (err) {
      console.error('خطأ في حذف الروابط الحالية:', err);
      return res.status(500).json({ message: 'خطأ في الخادم' });
    }
    
    // إضافة الروابط الجديدة
    const insertQuery = 'INSERT INTO scenario_subjects (scenario_id, subject_id, is_core) VALUES ?';
    const values = subjectIds.map(subjectId => [scenarioId, subjectId.id || subjectId, subjectId.is_core || false]);
    
    db.query(insertQuery, [values], (err, result) => {
      if (err) {
        console.error('خطأ في ربط المواد:', err);
        return res.status(500).json({ message: 'خطأ في ربط المواد' });
      }
      
      res.json({ 
        message: 'تم ربط المواد بالسيناريو بنجاح',
        linkedSubjects: subjectIds.length
      });
    });
  });
});

// إلغاء ربط مادة من سيناريو (للأدمن)
router.delete('/:scenarioId/subjects/:subjectId', authenticateToken, requireAdmin, (req, res) => {
  const { scenarioId, subjectId } = req.params;
  
  const query = 'DELETE FROM scenario_subjects WHERE scenario_id = ? AND subject_id = ?';
  
  db.query(query, [scenarioId, subjectId], (err, result) => {
    if (err) {
      console.error('خطأ في إلغاء ربط المادة:', err);
      return res.status(500).json({ message: 'خطأ في إلغاء ربط المادة' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'الربط غير موجود' });
    }
    
    res.json({ message: 'تم إلغاء ربط المادة بنجاح' });
  });
});

// حذف سيناريو (للأدمن)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  const scenarioId = req.params.id;
  
  // التحقق من عدم وجود مستخدمين مرتبطين بهذا السيناريو
  const checkUsersQuery = 'SELECT COUNT(*) as count FROM users WHERE scenario_id = ?';
  
  db.query(checkUsersQuery, [scenarioId], (err, results) => {
    if (err) {
      console.error('خطأ في التحقق من المستخدمين:', err);
      return res.status(500).json({ message: 'خطأ في الخادم' });
    }
    
    if (results[0].count > 0) {
      return res.status(400).json({ 
        message: 'لا يمكن حذف السيناريو لوجود مستخدمين مرتبطين به' 
      });
    }
    
    // حذف السيناريو (سيتم حذف الروابط تلقائياً بسبب CASCADE)
    const deleteQuery = 'DELETE FROM scenarios WHERE id = ?';
    
    db.query(deleteQuery, [scenarioId], (err, result) => {
      if (err) {
        console.error('خطأ في حذف السيناريو:', err);
        return res.status(500).json({ message: 'خطأ في حذف السيناريو' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'السيناريو غير موجود' });
      }
      
      res.json({ message: 'تم حذف السيناريو بنجاح' });
    });
  });
});

// الحصول على المستخدمين حسب السيناريو
router.get('/:id/users', authenticateToken, requireAdmin, (req, res) => {
  const scenarioId = req.params.id;
  const query = `
    SELECT u.id, u.username, u.full_name, u.email, u.created_at
    FROM users u
    WHERE u.scenario_id = ?
    ORDER BY u.full_name
  `;
  
  db.query(query, [scenarioId], (err, results) => {
    if (err) {
      console.error('خطأ في جلب مستخدمي السيناريو:', err);
      return res.status(500).json({ message: 'خطأ في الخادم' });
    }
    
    res.json({ data: results });
  });
});

module.exports = router;