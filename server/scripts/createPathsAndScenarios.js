const db = require('../config/database');

const createPathsAndScenarios = async () => {
  try {
    console.log('🎯 إنشاء جداول المسارات والسيناريوهات...');

    // إنشاء جدول المسارات
    const createPathsTable = `
      CREATE TABLE IF NOT EXISTS paths (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        name_ar VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `;

    // إنشاء جدول السيناريوهات
    const createScenariosTable = `
      CREATE TABLE IF NOT EXISTS scenarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        path_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        name_ar VARCHAR(200) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (path_id) REFERENCES paths(id) ON DELETE CASCADE
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `;

    // إنشاء جدول ربط السيناريوهات بالمواد
    const createScenarioSubjectsTable = `
      CREATE TABLE IF NOT EXISTS scenario_subjects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        scenario_id INT NOT NULL,
        subject_id INT NOT NULL,
        is_core BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (scenario_id) REFERENCES scenarios(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        UNIQUE KEY unique_scenario_subject (scenario_id, subject_id)
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `;

    // إضافة عمود المسار للمستخدمين
    const addPathToUsers = `
      ALTER TABLE users 
      ADD COLUMN path_id INT NULL,
      ADD COLUMN scenario_id INT NULL,
      ADD FOREIGN KEY (path_id) REFERENCES paths(id) ON DELETE SET NULL,
      ADD FOREIGN KEY (scenario_id) REFERENCES scenarios(id) ON DELETE SET NULL
    `;

    // تنفيذ الاستعلامات
    const queries = [
      { name: 'إنشاء جدول المسارات', query: createPathsTable },
      { name: 'إنشاء جدول السيناريوهات', query: createScenariosTable },
      { name: 'إنشاء جدول ربط السيناريوهات بالمواد', query: createScenarioSubjectsTable }
    ];

    for (const { name, query } of queries) {
      await new Promise((resolve, reject) => {
        db.query(query, (err, result) => {
          if (err) {
            console.error(`❌ خطأ في ${name}:`, err);
            reject(err);
          } else {
            console.log(`✅ ${name}`);
            resolve(result);
          }
        });
      });
    }

    // إضافة عمود المسار للمستخدمين (قد يكون موجود)
    await new Promise((resolve) => {
      db.query(addPathToUsers, (err, result) => {
        if (err && !err.message.includes('Duplicate column name')) {
          console.error('❌ خطأ في إضافة عمود المسار:', err);
        } else {
          console.log('✅ تم إضافة عمود المسار للمستخدمين');
        }
        resolve();
      });
    });

    // إدراج المسارات
    const insertPaths = `
      INSERT IGNORE INTO paths (name, name_ar, description) VALUES
      ('general', 'المسار العام', 'المسار العام للصف الحادي عشر'),
      ('advanced', 'المسار المتقدم', 'المسار المتقدم للصف الحادي عشر')
    `;

    await new Promise((resolve, reject) => {
      db.query(insertPaths, (err, result) => {
        if (err) {
          console.error('❌ خطأ في إدراج المسارات:', err);
          reject(err);
        } else {
          console.log('✅ تم إدراج المسارات');
          resolve(result);
        }
      });
    });

    // إدراج السيناريوهات
    const insertScenarios = `
      INSERT IGNORE INTO scenarios (path_id, name, name_ar, description) VALUES
      (1, 'general_scenario_1', 'السيناريو الأول - العام', 'كيمياء + أحياء + المواد الأساسية'),
      (1, 'general_scenario_2', 'السيناريو الثاني - العام', 'فيزياء + كيمياء + المواد الأساسية'),
      (2, 'advanced_scenario_1', 'السيناريو الأول - المتقدم', 'فيزياء + كيمياء + المواد الأساسية'),
      (2, 'advanced_scenario_2', 'السيناريو الثاني - المتقدم', 'كيمياء + فيزياء + أحياء + المواد الأساسية')
    `;

    await new Promise((resolve, reject) => {
      db.query(insertScenarios, (err, result) => {
        if (err) {
          console.error('❌ خطأ في إدراج السيناريوهات:', err);
          reject(err);
        } else {
          console.log('✅ تم إدراج السيناريوهات');
          resolve(result);
        }
      });
    });

    // ربط المواد بالسيناريوهات
    const linkSubjectsToScenarios = async () => {
      // الحصول على IDs المواد
      const getSubjectIds = `
        SELECT id, name FROM subjects 
        WHERE name IN ('mathematics', 'physics', 'chemistry', 'english', 'arabic', 'biology')
      `;

      const subjects = await new Promise((resolve, reject) => {
        db.query(getSubjectIds, (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });

      const subjectMap = {};
      subjects.forEach(subject => {
        subjectMap[subject.name] = subject.id;
      });

      // المواد الأساسية لجميع السيناريوهات
      const coreSubjects = ['mathematics', 'english', 'arabic'];

      // تعريف السيناريوهات
      const scenarioSubjects = {
        1: [...coreSubjects, 'chemistry', 'biology'], // عام - سيناريو 1
        2: [...coreSubjects, 'physics', 'chemistry'], // عام - سيناريو 2
        3: [...coreSubjects, 'physics', 'chemistry'], // متقدم - سيناريو 1
        4: [...coreSubjects, 'chemistry', 'physics', 'biology'] // متقدم - سيناريو 2
      };

      // إدراج ربط المواد بالسيناريوهات
      for (const [scenarioId, subjectNames] of Object.entries(scenarioSubjects)) {
        for (const subjectName of subjectNames) {
          const subjectId = subjectMap[subjectName];
          const isCore = coreSubjects.includes(subjectName);

          const insertLink = `
            INSERT IGNORE INTO scenario_subjects (scenario_id, subject_id, is_core) 
            VALUES (?, ?, ?)
          `;

          await new Promise((resolve, reject) => {
            db.query(insertLink, [scenarioId, subjectId, isCore], (err, result) => {
              if (err) {
                console.error(`❌ خطأ في ربط المادة ${subjectName} بالسيناريو ${scenarioId}:`, err);
                reject(err);
              } else {
                resolve(result);
              }
            });
          });
        }
      }

      console.log('✅ تم ربط جميع المواد بالسيناريوهات');
    };

    await linkSubjectsToScenarios();

    console.log('🎉 تم إنشاء نظام المسارات والسيناريوهات بنجاح!');
    console.log('');
    console.log('📋 ملخص السيناريوهات:');
    console.log('🎓 المسار العام:');
    console.log('   📌 السيناريو 1: رياضيات + إنجليزي + عربي + كيمياء + أحياء');
    console.log('   📌 السيناريو 2: رياضيات + إنجليزي + عربي + فيزياء + كيمياء');
    console.log('🚀 المسار المتقدم:');
    console.log('   📌 السيناريو 1: رياضيات + إنجليزي + عربي + فيزياء + كيمياء');
    console.log('   📌 السيناريو 2: رياضيات + إنجليزي + عربي + كيمياء + فيزياء + أحياء');

    process.exit(0);

  } catch (error) {
    console.error('❌ خطأ عام:', error);
    process.exit(1);
  }
};

// تشغيل السكريبت
createPathsAndScenarios();