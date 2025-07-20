import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaBook, 
  FaFile, 
  FaDownload, 
  FaUsers, 

  FaClock,
  FaStar,
  FaArrowLeft
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import subjectService from '../../services/subjectService';
import fileService from '../../services/fileService';
import LoadingSpinner from '../Common/LoadingSpinner';
import { toast } from 'react-toastify';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSubjects: 0,
    totalFiles: 0,
    totalDownloads: 0,
    totalUsers: 0
  });
  const [subjects, setSubjects] = useState([]);
  const [recentFiles, setRecentFiles] = useState([]);
  const [popularFiles, setPopularFiles] = useState([]);

  useEffect(() => {
    // إعادة توجيه المعلمين إلى لوحة تحكمهم
    if (user.role === 'teacher') {
      window.location.href = '/teacher';
      return;
    }
    
    loadDashboardData();
  }, [user.role]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // تحميل البيانات بشكل متوازي
      const [statsResponse, subjectsResponse, recentFilesResponse, popularFilesResponse] = await Promise.all([
        fetch('/api/stats').then(res => res.json()).catch(() => ({})),
        subjectService.getAllSubjects().catch(() => ({ data: [] })),
        fileService.getRecentFiles(5).catch(() => ({ data: { files: [] } })),
        fileService.getPopularFiles(5).catch(() => ({ data: { files: [] } }))
      ]);

      setStats(statsResponse);
      setSubjects(subjectsResponse.data || []);
      setRecentFiles(recentFilesResponse.data?.files || []);
      setPopularFiles(popularFilesResponse.data?.files || []);

    } catch (error) {
      console.error('خطأ في تحميل بيانات الرئيسية:', error);
      toast.error('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleFileDownload = async (fileId, filename) => {
    try {
      await fileService.downloadFile(fileId, filename);
      toast.success('تم تحميل الملف بنجاح');
      
      // تحديث الإحصائيات
      loadDashboardData();
    } catch (error) {
      toast.error('حدث خطأ في تحميل الملف');
    }
  };

  const formatFileSize = (bytes) => {
    return fileService.formatFileSize(bytes);
  };

  const getFileType = (filename) => {
    return fileService.getFileType(filename);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <LoadingSpinner message="جاري تحميل الرئيسية..." />;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>مرحباً، {user.fullName}</h1>
          <p>
            {user.role === 'admin' 
              ? 'مرحباً بك في لوحة التحكم' 
              : 'مرحباً بك في منصة الدراسة للصف الحادي عشر'
            }
          </p>
        </div>
        
        <div className="quick-actions">
          {user.role === 'admin' && (
            <Link to="/admin/upload" className="btn btn-primary">
              <FaFile />
              رفع ملف جديد
            </Link>
          )}
          <Link to="/files" className="btn btn-outline">
            <FaBook />
            تصفح الملفات
          </Link>
        </div>
      </div>

      {/* الإحصائيات */}
      <div className="stats-grid">
        <div className="stat-card subjects">
          <div className="stat-icon">
            <FaBook />
          </div>
          <div className="stat-content">
            <h3>{stats.totalSubjects}</h3>
            <p>المواد الدراسية</p>
          </div>
        </div>

        <div className="stat-card files">
          <div className="stat-icon">
            <FaFile />
          </div>
          <div className="stat-content">
            <h3>{stats.totalFiles}</h3>
            <p>إجمالي الملفات</p>
          </div>
        </div>

        <div className="stat-card downloads">
          <div className="stat-icon">
            <FaDownload />
          </div>
          <div className="stat-content">
            <h3>{stats.totalDownloads}</h3>
            <p>مرات التحميل</p>
          </div>
        </div>

        {user.role === 'admin' && (
          <div className="stat-card users">
            <div className="stat-icon">
              <FaUsers />
            </div>
            <div className="stat-content">
              <h3>{stats.totalUsers}</h3>
              <p>المستخدمين</p>
            </div>
          </div>
        )}
      </div>

      <div className="dashboard-content">
        {/* المواد الدراسية */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>
              <FaBook />
              المواد الدراسية
            </h2>
            <Link to="/subjects" className="section-link">
              عرض الكل
              <FaArrowLeft />
            </Link>
          </div>
          
          <div className="subjects-grid">
            {subjects.slice(0, 6).map(subject => (
              <Link 
                key={subject.id} 
                to={`/files?subject=${subject.id}`}
                className="subject-card"
                style={{ '--subject-color': subject.color }}
              >
                <div className="subject-header">
                  <div className="subject-icon">
                    📚
                  </div>
                  <div className="file-count">
                    {subject.file_count} ملف
                  </div>
                </div>
                <h3>{subject.name_ar}</h3>
                <p>{subject.description}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="dashboard-row">
          {/* أحدث الملفات */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>
                <FaClock />
                أحدث الملفات
              </h2>
              <Link to="/files" className="section-link">
                عرض الكل
                <FaArrowLeft />
              </Link>
            </div>
            
            <div className="files-list">
              {recentFiles.length > 0 ? (
                recentFiles.map(file => (
                  <div key={file.id} className="file-item">
                    <div className="file-info">
                      <div className="file-icon">
                        📄
                      </div>
                      <div className="file-details">
                        <h4>{file.title}</h4>
                        <p>
                          <span className="subject-name">{file.subject_name}</span>
                          <span className="file-meta">
                            {getFileType(file.original_name)} • {formatFileSize(file.file_size)}
                          </span>
                        </p>
                        <small>{formatDate(file.created_at)}</small>
                      </div>
                    </div>
                    <button
                      className="download-btn"
                      onClick={() => handleFileDownload(file.id, file.original_name)}
                      title="تحميل الملف"
                    >
                      <FaDownload />
                    </button>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>لا توجد ملفات حديثة</p>
                </div>
              )}
            </div>
          </div>

          {/* الملفات الأكثر تحميلاً */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>
                <FaStar />
                الأكثر تحميلاً
              </h2>
              <Link to="/files?sort=downloads" className="section-link">
                عرض الكل
                <FaArrowLeft />
              </Link>
            </div>
            
            <div className="files-list">
              {popularFiles.length > 0 ? (
                popularFiles.map(file => (
                  <div key={file.id} className="file-item">
                    <div className="file-info">
                      <div className="file-icon">
                        📄
                      </div>
                      <div className="file-details">
                        <h4>{file.title}</h4>
                        <p>
                          <span className="subject-name">{file.subject_name}</span>
                          <span className="file-meta">
                            {getFileType(file.original_name)} • {formatFileSize(file.file_size)}
                          </span>
                        </p>
                        <small>{file.download_count} تحميل</small>
                      </div>
                    </div>
                    <button
                      className="download-btn"
                      onClick={() => handleFileDownload(file.id, file.original_name)}
                      title="تحميل الملف"
                    >
                      <FaDownload />
                    </button>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>لا توجد ملفات شائعة</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;