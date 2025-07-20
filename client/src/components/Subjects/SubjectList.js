import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaBook, 
  FaFile, 
  FaSearch, 
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import subjectService from '../../services/subjectService';
import LoadingSpinner from '../Common/LoadingSpinner';
import './SubjectList.css';

const SubjectList = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSubjects, setFilteredSubjects] = useState([]);

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    // تصفية المواد حسب البحث
    const filtered = subjects.filter(subject =>
      subject.name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSubjects(filtered);
  }, [subjects, searchTerm]);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const response = await subjectService.getAllSubjects();
      setSubjects(response.data);
    } catch (error) {
      console.error('خطأ في تحميل المواد:', error);
      toast.error('حدث خطأ في تحميل المواد الدراسية');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubject = async (subjectId, subjectName) => {
    if (!window.confirm(`هل أنت متأكد من حذف مادة "${subjectName}"؟`)) {
      return;
    }

    try {
      await subjectService.deleteSubject(subjectId);
      toast.success('تم حذف المادة بنجاح');
      loadSubjects();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'حدث خطأ في حذف المادة';
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return <LoadingSpinner message="جاري تحميل المواد الدراسية..." />;
  }

  return (
    <div className="subject-list-container">
      <div className="page-header">
        <div className="header-content">
          <h1>
            <FaBook />
            المواد الدراسية
          </h1>
          <p>تصفح جميع المواد الدراسية المتاحة للصف الحادي عشر</p>
        </div>
        
        {user.role === 'admin' && (
          <Link to="/admin/subjects" className="btn btn-primary">
            <FaPlus />
            إدارة المواد
          </Link>
        )}
      </div>

      <div className="filters-section">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="البحث في المواد الدراسية..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="results-info">
          <span>
            {filteredSubjects.length} من {subjects.length} مادة
          </span>
        </div>
      </div>

      {filteredSubjects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3>لا توجد مواد دراسية</h3>
          <p>
            {searchTerm 
              ? 'لم يتم العثور على مواد تطابق البحث' 
              : 'لم يتم إضافة أي مواد دراسية بعد'
            }
          </p>
          {user.role === 'admin' && !searchTerm && (
            <Link to="/admin/subjects" className="btn btn-primary">
              <FaPlus />
              إضافة مادة جديدة
            </Link>
          )}
        </div>
      ) : (
        <div className="subjects-grid">
          {filteredSubjects.map(subject => (
            <div 
              key={subject.id} 
              className="subject-card"
              style={{ '--subject-color': subject.color }}
            >
              <div className="subject-header">
                <div className="subject-icon">
                  {getSubjectIcon(subject.icon)}
                </div>
                <div className="subject-actions">
                  {user.role === 'admin' && (
                    <>
                      <button
                        className="action-btn edit"
                        onClick={() => handleEditSubject(subject.id)}
                        title="تعديل المادة"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDeleteSubject(subject.id, subject.name_ar)}
                        title="حذف المادة"
                      >
                        <FaTrash />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="subject-content">
                <h3>{subject.name_ar}</h3>
                <p className="subject-description">{subject.description}</p>
                
                <div className="subject-stats">
                  <div className="stat">
                    <FaFile />
                    <span>{subject.file_count || 0} ملف</span>
                  </div>
                </div>
              </div>

              <div className="subject-footer">
                <Link 
                  to={`/files?subject=${subject.id}`}
                  className="btn btn-primary btn-block"
                >
                  <FaEye />
                  عرض الملفات
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="subjects-summary">
        <div className="summary-card">
          <h3>إحصائيات المواد</h3>
          <div className="summary-stats">
            <div className="summary-stat">
              <span className="stat-number">{subjects.length}</span>
              <span className="stat-label">إجمالي المواد</span>
            </div>
            <div className="summary-stat">
              <span className="stat-number">
                {subjects.reduce((total, subject) => total + (subject.file_count || 0), 0)}
              </span>
              <span className="stat-label">إجمالي الملفات</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// دالة مساعدة لعرض أيقونة المادة
const getSubjectIcon = (iconName) => {
  const icons = {
    calculator: '🧮',
    atom: '⚛️',
    flask: '🧪',
    language: '🇬🇧',
    'book-open': '📖',
    leaf: '🧬',
    book: '📚',
    default: '📚'
  };
  
  return icons[iconName] || icons.default;
};

// دالة مساعدة لتعديل المادة (يمكن تطويرها لاحقاً)
const handleEditSubject = (subjectId) => {
  // يمكن إضافة modal أو توجيه لصفحة التعديل
  console.log('تعديل المادة:', subjectId);
};

export default SubjectList;