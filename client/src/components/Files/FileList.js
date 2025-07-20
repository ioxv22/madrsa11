import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaFile, 
  FaDownload, 
  FaSearch, 
  FaFilter,

  FaEdit,
  FaTrash,
  FaPlus,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import fileService from '../../services/fileService';
import subjectService from '../../services/subjectService';
import LoadingSpinner from '../Common/LoadingSpinner';
import './FileList.css';

const FileList = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [files, setFiles] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  
  // فلاتر البحث
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    subject_id: searchParams.get('subject') || '',
    file_type: searchParams.get('type') || '',
    sort: searchParams.get('sort') || 'created_at',
    order: searchParams.get('order') || 'desc',
    page: parseInt(searchParams.get('page')) || 1,
    limit: 12
  });

  const [showFilters, setShowFilters] = useState(false);

  // تعريف الدوال أولاً
  const loadSubjects = async () => {
    try {
      const response = await subjectService.getAllSubjects();
      setSubjects(response.data);
    } catch (error) {
      console.error('خطأ في تحميل المواد:', error);
    }
  };

  const loadFiles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fileService.getFiles(filters);
      setFiles(response.data.files);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('خطأ في تحميل الملفات:', error);
      toast.error('حدث خطأ في تحميل الملفات');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // useEffect hooks بعد تعريف الدوال
  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  useEffect(() => {
    // تحديث URL عند تغيير الفلاتر
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] && key !== 'limit') {
        params.set(key, filters[key]);
      }
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value // إعادة تعيين الصفحة عند تغيير الفلاتر
    }));
  };

  const handleDownload = async (fileId, filename) => {
    try {
      await fileService.downloadFile(fileId, filename);
      toast.success('تم تحميل الملف بنجاح');
      // إعادة تحميل الملفات لتحديث عداد التحميل
      loadFiles();
    } catch (error) {
      toast.error('حدث خطأ في تحميل الملف');
    }
  };

  const handleDeleteFile = async (fileId, filename) => {
    if (!window.confirm(`هل أنت متأكد من حذف الملف "${filename}"؟`)) {
      return;
    }

    try {
      await fileService.deleteFile(fileId);
      toast.success('تم حذف الملف بنجاح');
      loadFiles();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'حدث خطأ في حذف الملف';
      toast.error(errorMessage);
    }
  };

  const getFileIcon = (filename) => {
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name_ar : 'غير محدد';
  };

  if (loading && filters.page === 1) {
    return <LoadingSpinner message="جاري تحميل الملفات..." />;
  }

  return (
    <div className="file-list-container">
      <div className="page-header">
        <div className="header-content">
          <h1>
            <FaFile />
            الملفات الدراسية
          </h1>
          <p>تصفح وحمل جميع الملفات الدراسية المتاحة</p>
        </div>
        
        {user.role === 'admin' && (
          <Link to="/admin/upload" className="btn btn-primary">
            <FaPlus />
            رفع ملف جديد
          </Link>
        )}
      </div>

      {/* شريط البحث والفلاتر */}
      <div className="search-filters-section">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="البحث في الملفات..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="search-input"
          />
        </div>
        
        <button
          className={`filter-toggle ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <FaFilter />
          الفلاتر
        </button>
      </div>

      {/* الفلاتر المتقدمة */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>المادة الدراسية:</label>
            <select
              value={filters.subject_id}
              onChange={(e) => handleFilterChange('subject_id', e.target.value)}
            >
              <option value="">جميع المواد</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name_ar}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>نوع الملف:</label>
            <select
              value={filters.file_type}
              onChange={(e) => handleFilterChange('file_type', e.target.value)}
            >
              <option value="">جميع الأنواع</option>
              <option value="pdf">PDF</option>
              <option value="image">صور</option>
              <option value="video">فيديو</option>
              <option value="document">مستندات</option>
            </select>
          </div>

          <div className="filter-group">
            <label>ترتيب حسب:</label>
            <select
              value={`${filters.sort}-${filters.order}`}
              onChange={(e) => {
                const [sort, order] = e.target.value.split('-');
                handleFilterChange('sort', sort);
                handleFilterChange('order', order);
              }}
            >
              <option value="created_at-desc">الأحدث</option>
              <option value="created_at-asc">الأقدم</option>
              <option value="title-asc">الاسم (أ-ي)</option>
              <option value="title-desc">الاسم (ي-أ)</option>
              <option value="download_count-desc">الأكثر تحميلاً</option>
              <option value="file_size-desc">الأكبر حجماً</option>
              <option value="file_size-asc">الأصغر حجماً</option>
            </select>
          </div>

          <button
            className="clear-filters"
            onClick={() => {
              setFilters({
                search: '',
                subject_id: '',
                file_type: '',
                sort: 'created_at',
                order: 'desc',
                page: 1,
                limit: 12
              });
            }}
          >
            مسح الفلاتر
          </button>
        </div>
      )}

      {/* معلومات النتائج */}
      <div className="results-info">
        <span>
          {pagination.totalFiles || 0} ملف
          {filters.search && ` • البحث عن: "${filters.search}"`}
          {filters.subject_id && ` • المادة: ${getSubjectName(parseInt(filters.subject_id))}`}
        </span>
      </div>

      {/* قائمة الملفات */}
      {files.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <h3>لا توجد ملفات</h3>
          <p>
            {filters.search || filters.subject_id || filters.file_type
              ? 'لم يتم العثور على ملفات تطابق الفلاتر المحددة'
              : 'لم يتم رفع أي ملفات بعد'
            }
          </p>
          {user.role === 'admin' && !filters.search && !filters.subject_id && (
            <Link to="/admin/upload" className="btn btn-primary">
              <FaPlus />
              رفع ملف جديد
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="files-grid">
            {files.map(file => (
              <div key={file.id} className="file-card">
                <div className="file-header">
                  <div className="file-icon">
                    {getFileIcon(file.original_name)}
                  </div>
                  <div className="file-actions">
                    {user.role === 'admin' && (
                      <>
                        <button
                          className="action-btn edit"
                          title="تعديل الملف"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDeleteFile(file.id, file.title)}
                          title="حذف الملف"
                        >
                          <FaTrash />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="file-content">
                  <h3 title={file.title}>{file.title}</h3>
                  {file.description && (
                    <p className="file-description">{file.description}</p>
                  )}
                  
                  <div className="file-meta">
                    <span className="subject-tag" style={{ backgroundColor: file.subject_color + '20', color: file.subject_color }}>
                      {file.subject_name}
                    </span>
                    <span className="file-type">
                      {fileService.getFileType(file.original_name)}
                    </span>
                    <span className="file-size">
                      {fileService.formatFileSize(file.file_size)}
                    </span>
                  </div>

                  <div className="file-stats">
                    <span className="upload-date">
                      {formatDate(file.created_at)}
                    </span>
                    <span className="download-count">
                      <FaDownload />
                      {file.download_count} تحميل
                    </span>
                  </div>
                </div>

                <div className="file-footer">
                  <button
                    className="btn btn-primary btn-block"
                    onClick={() => handleDownload(file.id, file.original_name)}
                  >
                    <FaDownload />
                    تحميل الملف
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* التنقل بين الصفحات */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                disabled={!pagination.hasPrev}
                onClick={() => handleFilterChange('page', filters.page - 1)}
              >
                <FaChevronRight />
                السابق
              </button>

              <div className="pagination-info">
                <span>
                  الصفحة {pagination.currentPage} من {pagination.totalPages}
                </span>
              </div>

              <button
                className="pagination-btn"
                disabled={!pagination.hasNext}
                onClick={() => handleFilterChange('page', filters.page + 1)}
              >
                التالي
                <FaChevronLeft />
              </button>
            </div>
          )}
        </>
      )}

      {loading && filters.page > 1 && (
        <div className="loading-more">
          <LoadingSpinner size="small" overlay={false} />
        </div>
      )}
    </div>
  );
};

export default FileList;