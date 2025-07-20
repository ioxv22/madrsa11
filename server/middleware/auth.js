const jwt = require('jsonwebtoken');
const db = require('../config/database');

// التحقق من صحة التوكن
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'لا يوجد توكن، الوصول مرفوض' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'توكن غير صالح' });
    }
    req.user = user;
    next();
  });
};

// التحقق من صلاحيات الأدمن
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'يجب أن تكون أدمن للوصول لهذه الصفحة' });
  }
  next();
};

// التحقق من وجود المستخدم في قاعدة البيانات
const verifyUser = (req, res, next) => {
  const userId = req.user.id;
  
  db.query('SELECT * FROM users WHERE id = ?', [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'خطأ في الخادم' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }
    
    req.userInfo = results[0];
    next();
  });
};

module.exports = {
  authenticateToken,
  requireAdmin,
  verifyUser
};