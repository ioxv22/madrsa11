import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaUpload, 
 
  FaTimes,
  FaCheck,
  FaExclamationTriangle
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import fileService from '../../services/fileService';
import subjectService from '../../services/subjectService';
import LoadingSpinner from '../Common/LoadingSpinner';
import './FileUpload.css';

const FileUpload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject_id: '',
    file: null
  });
  
  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    // التحقق من صلاحيات الأدمن
    if (user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    
    loadSubjects();
  }, [user, navigate]);

  const loadSubjects = async () => {
    try {
      const response = await subjectService.getAllSubjects();
      setSubjects(response.data);
    } catch (error) {
      console.error('خطأ في تحميل المواد:', error);
      toast.error('حدث خطأ في تحميل المواد الدراسية');
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

  const handleFileSelect = (file) => {
    // التحقق من نوع الملف
    if (!fileService.isValidFileType(file)) {
      setErrors(prev => ({
        ...prev,
        file: 'نوع الملف غير مدعوم. الأنواع المدعومة: PDF, Word, PowerPoint, صور, فيديو'
      }));
      return;
    }

    // التحقق من حجم الملف
    if (!fileService.isValidFileSize(file, 100)) {
      setErrors(prev => ({
        ...prev,
        file: 'حجم الملف كبير جداً. الحد الأقصى 100 ميجابايت'
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      file: file,
      title: prev.title || file.name.split('.')[0] // استخدام اسم الملف كعنوان افتراضي
    }));

    // مسح خطأ الملف
    if (errors.file) {
      setErrors(prev => ({
        ...prev,
        file: ''
      }));
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'عنوان الملف مطلوب';
    }

    if (!formData.subject_id) {
      newErrors.subject_id = 'يجب اختيار المادة الدراسية';
    }

    if (!formData.file) {
      newErrors.file = 'يجب اختيار ملف للرفع';
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
    setUploadProgress(0);

    try {
      await fileService.uploadFile(formData, (progress) => {
        setUploadProgress(progress);
      });

      toast.success('تم رفع الملف بنجاح!');
      
      // إعادة تعيين النموذج
      setFormData({
        title: '',
        description: '',
        subject_id: '',
        file: null
      });
      setUploadProgress(0);
      
      // التوجه لصفحة الملفات
      navigate('/files');
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'حدث خطأ في رفع الملف';
      toast.error(errorMessage);
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const removeFile = () => {
    setFormData(prev => ({
      ...prev,
      file: null
    }));
    setUploadProgress(0);
  };

  const getFileIcon = (filename) => {
    if (!filename) return '📄';
    const extension = filename.split('.').pop().toLowerCase();
    const iconMap = {
      pdf: '📄',
      doc: '📝', docx: '📝',
      ppt: '📊', pptx: '📊',
      xls: '📈', xlsx: '📈',
      jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️',
      mp4: '🎥', avi: '🎥', mov: '🎥',
      mp3: '🎵', wav: '🎵',
      zip: '📦', rar: '📦'
    };
    return iconMap[extension] || '📄';
  };

  return (
    <div className="file-upload-container">
      <div className="page-header">
        <h1>
          <FaUpload />
          رفع ملف جديد
        </h1>
        <p>قم برفع ملف دراسي جديد وتصنيفه حسب المادة</p>
      </div>

      <form onSubmit={handleSubmit} className="upload-form">
        {/* منطقة رفع الملف */}
        <div className="upload-section">
          <div
            className={`file-drop-zone ${dragActive ? 'active' : ''} ${formData.file ? 'has-file' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {!formData.file ? (
              <>
                <div className="drop-zone-content">
                  <FaUpload className="upload-icon" />
                  <h3>اسحب الملف هنا أو انقر للاختيار</h3>
                  <p>الأنواع المدعومة: PDF, Word, PowerPoint, صور, فيديو</p>
                  <p>الحد الأقصى: 100 ميجابايت</p>
                </div>
                <input
                  type="file"
                  onChange={handleFileInputChange}
                  className="file-input"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.txt"
                />
              </>
            ) : (
              <div className="selected-file">
                <div className="file-info">
                  <div className="file-icon">
                    {getFileIcon(formData.file.name)}
                  </div>
                  <div className="file-details">
                    <h4>{formData.file.name}</h4>
                    <p>
                      {fileService.getFileType(formData.file.name)} • {fileService.formatFileSize(formData.file.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="remove-file"
                  onClick={removeFile}
                  title="إزالة الملف"
                >
                  <FaTimes />
                </button>
              </div>
            )}
          </div>
          
          {errors.file && (
            <div className="error-message">
              <FaExclamationTriangle />
              {errors.file}
            </div>
          )}
        </div>

        {/* معلومات الملف */}
        <div className="file-info-section">
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              عنوان الملف *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`form-control ${errors.title ? 'is-invalid' : ''}`}
              placeholder="أدخل عنوان الملف"
            />
            {errors.title && (
              <div className="invalid-feedback">{errors.title}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              وصف الملف
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="form-control"
              placeholder="أدخل وصف مختصر للملف (اختياري)"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="subject_id" className="form-label">
              المادة الدراسية *
            </label>
            <select
              id="subject_id"
              name="subject_id"
              value={formData.subject_id}
              onChange={handleInputChange}
              className={`form-control ${errors.subject_id ? 'is-invalid' : ''}`}
            >
              <option value="">اختر المادة الدراسية</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name_ar}
                </option>
              ))}
            </select>
            {errors.subject_id && (
              <div className="invalid-feedback">{errors.subject_id}</div>
            )}
          </div>
        </div>

        {/* شريط التقدم */}
        {loading && (
          <div className="upload-progress">
            <div className="progress-info">
              <span>جاري رفع الملف...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* أزرار التحكم */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate('/files')}
            disabled={loading}
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !formData.file}
          >
            {loading ? (
              <>
                <LoadingSpinner size="small" overlay={false} />
                جاري الرفع...
              </>
            ) : (
              <>
                <FaCheck />
                رفع الملف
              </>
            )}
          </button>
        </div>
      </form>

      {/* نصائح مفيدة */}
      <div className="upload-tips">
        <h3>نصائح لرفع الملفات:</h3>
        <ul>
          <li>تأكد من أن اسم الملف واضح ومفهوم</li>
          <li>اكتب عنوان ووصف مفيد للملف</li>
          <li>اختر المادة الدراسية المناسبة</li>
          <li>تأكد من جودة الملف قبل الرفع</li>
          <li>استخدم أسماء ملفات باللغة العربية أو الإنجليزية</li>
        </ul>
      </div>
    </div>
  );
};

export default FileUpload;