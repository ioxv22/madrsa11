const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// الحصول على جميع المسارات
router.get('/', (req, res) => {
  const query = 'SELECT * FROM paths ORDER BY id';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('خطأ في جلب المسارات:', err);
      return res.status(500).json({ message: 'خطأ في الخادم' });
    }
    
    res.json({ data: results });
  });
});

// الحصول على مسار محدد
router.get('/:id', (req, res) => {
  const pathId = req.params.id;
  const query = 'SELECT * FROM paths WHERE id = ?';
  
  db.query(query, [pathId], (err, results) => {
    if (err) {
      console.error('خطأ في جلب المسار:', err);
      return res.status(500).json({ message: 'خطأ في الخادم' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'المسار غير موجود' });
    }
    
    res.json({ data: results[0] });
  });
});

// الحصول على جميع السيناريوهات مع المواد
router.get('/scenarios/all', (req, res) => {
  const query = `
    SELECT 
      s.*,
      GROUP_CONCAT(
        JSON_OBJECT(
          'id', sub.id,
          'name', sub.name,
          'name_ar', sub.name_ar,
          'is_core', ss.is_core
        )
      ) as subjects_json
    FROM scenarios s
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
          // تحويل GROUP_CONCAT result إلى array
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

// الحصول على السيناريوهات حسب المسار
router.get('/:pathId/scenarios', (req, res) => {
  const pathId = req.params.pathId;
  const query = `
    SELECT 
      s.*,
      GROUP_CONCAT(
        JSON_OBJECT(
          'id', sub.id,
          'name', sub.name,
          'name_ar', sub.name_ar,
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

// تحديث مسار المستخدم
router.put('/users/:userId/path', authenticateToken, (req, res) => {
  const userId = req.params.userId;
  const { pathId, scenarioId } = req.body;
  
  // التحقق من أن المستخدم يحدث مساره الخاص أو أنه أدمن
  if (req.user.id != userId && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'غير مصرح لك بتحديث هذا المستخدم' });
  }
  
  if (!pathId || !scenarioId) {
    return res.status(400).json({ message: 'معرف المسار والسيناريو مطلوبان' });
  }
  
  // التحقق من وجود المسار والسيناريو
  const checkQuery = `
    SELECT p.id as path_id, s.id as scenario_id 
    FROM paths p, scenarios s 
    WHERE p.id = ? AND s.id = ? AND s.path_id = p.id
  `;
  
  db.query(checkQuery, [pathId, scenarioId], (err, results) => {
    if (err) {
      console.error('خطأ في التحقق من المسار والسيناريو:', err);
      return res.status(500).json({ message: 'خطأ في الخادم' });
    }
    
    if (results.length === 0) {
      return res.status(400).json({ message: 'المسار أو السيناريو غير صحيح' });
    }
    
    // تحديث مسار المستخدم
    const updateQuery = 'UPDATE users SET path_id = ?, scenario_id = ? WHERE id = ?';
    
    db.query(updateQuery, [pathId, scenarioId, userId], (err, result) => {
      if (err) {
        console.error('خطأ في تحديث مسار المستخدم:', err);
        return res.status(500).json({ message: 'خطأ في تحديث المسار' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'المستخدم غير موجود' });
      }
      
      res.json({ 
        message: 'تم تحديث المسار بنجاح',
        pathId,
        scenarioId
      });
    });
  });
});

// الحصول على إحصائيات المسارات (للأدمن)
router.get('/stats/overview', authenticateToken, requireAdmin, (req, res) => {
  const queries = {
    totalPaths: 'SELECT COUNT(*) as count FROM paths',
    totalScenarios: 'SELECT COUNT(*) as count FROM scenarios',
    usersByPath: `
      SELECT p.name_ar, COUNT(u.id) as user_count
      FROM paths p
      LEFT JOIN users u ON p.id = u.path_id
      GROUP BY p.id, p.name_ar
    `,
    usersByScenario: `
      SELECT s.name_ar, COUNT(u.id) as user_count
      FROM scenarios s
      LEFT JOIN users u ON s.id = u.scenario_id
      GROUP BY s.id, s.name_ar
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

// إنشاء مسار جديد (للأدمن)
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  const { name, name_ar, description } = req.body;
  
  if (!name || !name_ar) {
    return res.status(400).json({ message: 'اسم المسار مطلوب بالعربية والإنجليزية' });
  }
  
  const query = 'INSERT INTO paths (name, name_ar, description) VALUES (?, ?, ?)';
  
  db.query(query, [name, name_ar, description], (err, result) => {
    if (err) {
      console.error('خطأ في إنشاء المسار:', err);
      return res.status(500).json({ message: 'خطأ في إنشاء المسار' });
    }
    
    res.status(201).json({
      message: 'تم إنشاء المسار بنجاح',
      pathId: result.insertId
    });
  });
});

// تحديث مسار (للأدمن)
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  const pathId = req.params.id;
  const { name, name_ar, description } = req.body;
  
  if (!name || !name_ar) {
    return res.status(400).json({ message: 'اسم المسار مطلوب بالعربية والإنجليزية' });
  }
  
  const query = 'UPDATE paths SET name = ?, name_ar = ?, description = ? WHERE id = ?';
  
  db.query(query, [name, name_ar, description, pathId], (err, result) => {
    if (err) {
      console.error('خطأ في تحديث المسار:', err);
      return res.status(500).json({ message: 'خطأ في تحديث المسار' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'المسار غير موجود' });
    }
    
    res.json({ message: 'تم تحديث المسار بنجاح' });
  });
});

// حذف مسار (للأدمن)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  const pathId = req.params.id;
  
  // التحقق من عدم وجود مستخدمين مرتبطين بهذا المسار
  const checkUsersQuery = 'SELECT COUNT(*) as count FROM users WHERE path_id = ?';
  
  db.query(checkUsersQuery, [pathId], (err, results) => {
    if (err) {
      console.error('خطأ في التحقق من المستخدمين:', err);
      return res.status(500).json({ message: 'خطأ في الخادم' });
    }
    
    if (results[0].count > 0) {
      return res.status(400).json({ 
        message: 'لا يمكن حذف المسار لوجود مستخدمين مرتبطين به' 
      });
    }
    
    // حذف المسار
    const deleteQuery = 'DELETE FROM paths WHERE id = ?';
    
    db.query(deleteQuery, [pathId], (err, result) => {
      if (err) {
        console.error('خطأ في حذف المسار:', err);
        return res.status(500).json({ message: 'خطأ في حذف المسار' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'المسار غير موجود' });
      }
      
      res.json({ message: 'تم حذف المسار بنجاح' });
    });
  });
});

module.exports = router;