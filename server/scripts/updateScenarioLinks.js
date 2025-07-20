const db = require('../config/database');

const updateScenarioLinks = async () => {
  try {
    console.log('🔗 تحديث ربط السيناريوهات بالمواد الجديدة...');

    // حذف جميع الروابط القديمة
    const clearLinksQuery = 'DELETE FROM scenario_subjects';
    
    await new Promise((resolve, reject) => {
      db.query(clearLinksQuery, (err, result) => {
        if (err) {
          console.error('❌ خطأ في حذف الروابط القديمة:', err);
          reject(err);
        } else {
          console.log('🗑️ تم حذف جميع الروابط القديمة');
          resolve(result);
        }
      });
    });

    // الحصول على IDs المواد الجديدة
    const getSubjectIds = `
      SELECT id, name FROM subjects 
      WHERE name IN ('mathematics', 'physics', 'chemistry', 'english', 'arabic', 'biology')
      ORDER BY name
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

    console.log('📋 المواد المتاحة:');
    subjects.forEach(subject => {
      console.log(`- ${subject.name}: ID ${subject.id}`);
    });

    const subjectMap = {};
    subjects.forEach(subject => {
      subjectMap[subject.name] = subject.id;
    });

    // المواد الأساسية لجميع السيناريوهات
    const coreSubjects = ['mathematics', 'english', 'arabic'];

    // تعريف السيناريوهات الجديدة
    const scenarioSubjects = {
      1: [...coreSubjects, 'chemistry', 'biology'], // عام - سيناريو 1
      2: [...coreSubjects, 'physics', 'chemistry'], // عام - سيناريو 2
      3: [...coreSubjects, 'physics', 'chemistry'], // متقدم - سيناريو 1
      4: [...coreSubjects, 'chemistry', 'physics', 'biology'] // متقدم - سيناريو 2
    };

    console.log('🎯 ربط السيناريوهات بالمواد:');

    // إدراج الروابط الجديدة
    for (const [scenarioId, subjectNames] of Object.entries(scenarioSubjects)) {
      console.log(`\n📌 السيناريو ${scenarioId}:`);
      
      for (const subjectName of subjectNames) {
        const subjectId = subjectMap[subjectName];
        const isCore = coreSubjects.includes(subjectName);

        if (!subjectId) {
          console.error(`❌ المادة ${subjectName} غير موجودة`);
          continue;
        }

        const insertLink = `
          INSERT INTO scenario_subjects (scenario_id, subject_id, is_core) 
          VALUES (?, ?, ?)
        `;

        await new Promise((resolve, reject) => {
          db.query(insertLink, [scenarioId, subjectId, isCore], (err, result) => {
            if (err) {
              console.error(`❌ خطأ في ربط المادة ${subjectName} بالسيناريو ${scenarioId}:`, err);
              reject(err);
            } else {
              console.log(`   ✅ ${subjectName} ${isCore ? '(أساسي)' : '(اختياري)'}`);
              resolve(result);
            }
          });
        });
      }
    }

    console.log('\n🎉 تم تحديث جميع روابط السيناريوهات بنجاح!');
    console.log('\n📋 ملخص السيناريوهات:');
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
updateScenarioLinks();