const db = require('../config/database');

const cleanDuplicateSubjects = async () => {
  try {
    console.log('🧹 تنظيف المواد المكررة...');

    // عرض المواد الحالية
    const showSubjectsQuery = 'SELECT * FROM subjects ORDER BY name';
    
    db.query(showSubjectsQuery, (err, results) => {
      if (err) {
        console.error('❌ خطأ في عرض المواد:', err);
        return;
      }

      console.log('📋 المواد الحالية:');
      results.forEach(subject => {
        console.log(`- ID: ${subject.id}, Name: ${subject.name}, Arabic: ${subject.name_ar}`);
      });

      // البحث عن المواد المكررة
      const findDuplicatesQuery = `
        SELECT name, COUNT(*) as count 
        FROM subjects 
        GROUP BY name 
        HAVING COUNT(*) > 1
      `;

      db.query(findDuplicatesQuery, (err, duplicates) => {
        if (err) {
          console.error('❌ خطأ في البحث عن المكررات:', err);
          return;
        }

        if (duplicates.length === 0) {
          console.log('✅ لا توجد مواد مكررة');
          process.exit(0);
          return;
        }

        console.log('🔍 المواد المكررة:');
        duplicates.forEach(dup => {
          console.log(`- ${dup.name}: ${dup.count} مرات`);
        });

        // حذف المكررات (الاحتفاظ بأقل ID)
        const cleanupPromises = duplicates.map(duplicate => {
          return new Promise((resolve, reject) => {
            // الحصول على جميع IDs للمادة المكررة
            const getIdsQuery = 'SELECT id FROM subjects WHERE name = ? ORDER BY id';
            
            db.query(getIdsQuery, [duplicate.name], (err, ids) => {
              if (err) {
                reject(err);
                return;
              }

              // الاحتفاظ بأول ID وحذف الباقي
              const keepId = ids[0].id;
              const deleteIds = ids.slice(1).map(item => item.id);

              if (deleteIds.length === 0) {
                resolve();
                return;
              }

              console.log(`🗑️ حذف المكررات للمادة ${duplicate.name}: IDs ${deleteIds.join(', ')}`);

              // حذف المكررات
              const deleteQuery = `DELETE FROM subjects WHERE id IN (${deleteIds.map(() => '?').join(',')})`;
              
              db.query(deleteQuery, deleteIds, (err, result) => {
                if (err) {
                  console.error(`❌ خطأ في حذف مكررات ${duplicate.name}:`, err);
                  reject(err);
                } else {
                  console.log(`✅ تم حذف ${result.affectedRows} مكررات للمادة ${duplicate.name}`);
                  resolve();
                }
              });
            });
          });
        });

        // تنفيذ جميع عمليات التنظيف
        Promise.all(cleanupPromises)
          .then(() => {
            console.log('🎉 تم تنظيف جميع المواد المكررة بنجاح!');
            
            // عرض المواد النهائية
            db.query(showSubjectsQuery, (err, finalResults) => {
              if (err) {
                console.error('❌ خطأ في عرض المواد النهائية:', err);
              } else {
                console.log('📋 المواد النهائية:');
                finalResults.forEach(subject => {
                  console.log(`- ID: ${subject.id}, Name: ${subject.name}, Arabic: ${subject.name_ar}`);
                });
              }
              process.exit(0);
            });
          })
          .catch(error => {
            console.error('❌ خطأ في تنظيف المكررات:', error);
            process.exit(1);
          });
      });
    });

  } catch (error) {
    console.error('❌ خطأ عام:', error);
    process.exit(1);
  }
};

// تشغيل السكريبت
cleanDuplicateSubjects();