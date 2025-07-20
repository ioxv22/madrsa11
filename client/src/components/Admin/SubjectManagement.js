import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  FaBook, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSave,
  FaTimes,
  FaPalette,
  FaEye
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import subjectService from '../../services/subjectService';
import LoadingSpinner from '../Common/LoadingSpinner';
import './SubjectManagement.css';

const SubjectManagement = () => {
  const { user } = useAuth();
  
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    description: '',
    color: '#667eea',
    icon: 'book'
  });
  
  const [errors, setErrors] = useState({});

  // قائمة الألوان المتاحة
  const availableColors = [
    '#667eea', '#ff6b6b', '#4ecdc4', '#45b7d1', 
    '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff',
    '#5f27cd', '#00d2d3', '#ff9f43', '#10ac84',
    '#ee5a52', '#0abde3', '#006ba6', '#f368e0'
  ];

  // قائمة الأيقونات المتاحة
  const availableIcons = [
    { value: 'book', label: '📚', name: 'كتاب' },
    { value: 'calculator', label: '🧮', name: 'آلة حاسبة' },
    { value: 'atom', label: '⚛️', name: 'ذرة' },
    { value: 'flask', label: '🧪', name: 'قارورة' },
    { value: 'language', label: '🇬🇧', name: 'لغة' },
    { value: 'book-open', label: '📖', name: 'كتاب مفتوح' },
    { value: 'leaf', label: '🧬', name: 'ورقة' },
    { value: 'globe', label: '🌍', name: 'كرة أرضية' },
    { value: 'music', label: '🎵', name: 'موسيقى' },
    { value: 'palette', label: '🎨', name: 'لوحة ألوان' },
    { value: 'dumbbell', label: '🏋️', name: 'رياضة' },
    { value: 'computer', label: '💻', name: 'حاسوب' }
  ];

  useEffect(() => {
    if (user.role !== 'admin') {
      return;
    }
    loadSubjects();
  }, [user]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // مسح الخطأ عند الكتابة
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'الاسم الإنجليزي مطلوب';
    }

    if (!formData.name_ar.trim()) {
      newErrors.name_ar = 'الاسم العربي مطلوب';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'الوصف مطلوب';
    }

    // التحقق من عدم تكرار الاسم
    const existingSubject = subjects.find(subject => 
      (subject.name.toLowerCase() === formData.name.toLowerCase() || 
       subject.name_ar === formData.name_ar) &&
      subject.id !== editingSubject?.id
    );

    if (existingSubject) {
      if (existingSubject.name.toLowerCase() === formData.name.toLowerCase()) {
        newErrors.name = 'هذا الاسم موجود بالفعل';
      }
      if (existingSubject.name_ar === formData.name_ar) {
        newErrors.name_ar = 'هذا الاسم موجود بالفعل';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (editingSubject) {
        await subjectService.updateSubject(editingSubject.id, formData);
        toast.success('تم تحديث المادة بنجاح');
      } else {
        await subjectService.createSubject(formData);
        toast.success('تم إضافة المادة بنجاح');
      }

      resetForm();
      loadSubjects();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'حدث خطأ في حفظ المادة';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      name_ar: subject.name_ar,
      description: subject.description,
      color: subject.color,
      icon: subject.icon
    });
    setShowAddForm(true);
  };

  const handleDelete = async (subject) => {
    if (!window.confirm(`هل أنت متأكد من حذف مادة "${subject.name_ar}"؟\nسيتم حذف جميع الملفات المرتبطة بها.`)) {
      return;
    }

    try {
      await subjectService.deleteSubject(subject.id);
      toast.success('تم حذف المادة بنجاح');
      loadSubjects();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'حدث خطأ في حذف المادة';
      toast.error(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      name_ar: '',
      description: '',
      color: '#667eea',
      icon: 'book'
    });
    setEditingSubject(null);
    setShowAddForm(false);
    setErrors({});
  };

  const getIconDisplay = (iconValue) => {
    const icon = availableIcons.find(i => i.value === iconValue);
    return icon ? icon.label : '📚';
  };

  if (user.role !== 'admin') {
    return (
      <div className="access-denied">
        <h2>غير مصرح لك بالوصول لهذه الصفحة</h2>
      </div>
    );
  }

  if (loading && subjects.length === 0) {
    return <LoadingSpinner message="جاري تحميل المواد الدراسية..." />;
  }

  return (
    <div className="subject-management">
      <div className="page-header">
        <div className="header-content">
          <h1>
            <FaBook />
            إدارة المواد الدراسية
          </h1>
          <p>إضافة وتعديل وحذف المواد الدراسية</p>
        </div>
        
        <button
          className="btn btn-primary"
          onClick={() => setShowAddForm(true)}
        >
          <FaPlus />
          إضافة مادة جديدة
        </button>
      </div>

      {/* نموذج إضافة/تعديل المادة */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                {editingSubject ? 'تعديل المادة' : 'إضافة مادة جديدة'}
              </h2>
              <button
                className="close-btn"
                onClick={resetForm}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="subject-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name_ar" className="form-label">
                    الاسم العربي *
                  </label>
                  <input
                    type="text"
                    id="name_ar"
                    name="name_ar"
                    value={formData.name_ar}
                    onChange={handleInputChange}
                    className={`form-control ${errors.name_ar ? 'is-invalid' : ''}`}
                    placeholder="مثال: الرياضيات"
                  />
                  {errors.name_ar && (
                    <div className="invalid-feedback">{errors.name_ar}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    الاسم الإنجليزي *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    placeholder="مثال: mathematics"
                  />
                  {errors.name && (
                    <div className="invalid-feedback">{errors.name}</div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  الوصف *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                  placeholder="وصف مختصر للمادة الدراسية"
                  rows="3"
                />
                {errors.description && (
                  <div className="invalid-feedback">{errors.description}</div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <FaPalette />
                    اللون
                  </label>
                  <div className="color-picker">
                    {availableColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`color-option ${formData.color === color ? 'selected' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="icon" className="form-label">
                    الأيقونة
                  </label>
                  <select
                    id="icon"
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    className="form-control"
                  >
                    {availableIcons.map(icon => (
                      <option key={icon.value} value={icon.value}>
                        {icon.label} {icon.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* معاينة المادة */}
              <div className="subject-preview">
                <h3>معاينة:</h3>
                <div 
                  className="preview-card"
                  style={{ '--subject-color': formData.color }}
                >
                  <div className="preview-icon">
                    {getIconDisplay(formData.icon)}
                  </div>
                  <div className="preview-content">
                    <h4>{formData.name_ar || 'اسم المادة'}</h4>
                    <p>{formData.description || 'وصف المادة'}</p>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={resetForm}
                  disabled={loading}
                >
                  <FaTimes />
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <LoadingSpinner size="small" overlay={false} />
                  ) : (
                    <FaSave />
                  )}
                  {editingSubject ? 'تحديث المادة' : 'إضافة المادة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* قائمة المواد */}
      <div className="subjects-list">
        {subjects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>لا توجد مواد دراسية</h3>
            <p>ابدأ بإضافة مادة دراسية جديدة</p>
            <button
              className="btn btn-primary"
              onClick={() => setShowAddForm(true)}
            >
              <FaPlus />
              إضافة مادة جديدة
            </button>
          </div>
        ) : (
          <div className="subjects-grid">
            {subjects.map(subject => (
              <div 
                key={subject.id} 
                className="subject-item"
                style={{ '--subject-color': subject.color }}
              >
                <div className="subject-header">
                  <div className="subject-icon">
                    {getIconDisplay(subject.icon)}
                  </div>
                  <div className="subject-actions">
                    <button
                      className="action-btn view"
                      title="عرض الملفات"
                      onClick={() => window.open(`/files?subject=${subject.id}`, '_blank')}
                    >
                      <FaEye />
                    </button>
                    <button
                      className="action-btn edit"
                      title="تعديل المادة"
                      onClick={() => handleEdit(subject)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="action-btn delete"
                      title="حذف المادة"
                      onClick={() => handleDelete(subject)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <div className="subject-content">
                  <h3>{subject.name_ar}</h3>
                  <p className="subject-name-en">{subject.name}</p>
                  <p className="subject-description">{subject.description}</p>
                  
                  <div className="subject-stats">
                    <span className="file-count">
                      {subject.file_count || 0} ملف
                    </span>
                    <span className="download-count">
                      {subject.total_downloads || 0} تحميل
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectManagement;