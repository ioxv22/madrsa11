import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaChartBar, 
  FaBook, 
  FaFile,
  FaDownload,
  FaUpload,
  FaEye,
  FaArrowUp,
  FaChartLine,
  FaPlus
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import fileService from '../../services/fileService';
import subjectService from '../../services/subjectService';
import LoadingSpinner from '../Common/LoadingSpinner';
import './TeacherPanel.css';

const TeacherPanel = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    overview: {
      totalFiles: 0,
      totalDownloads: 0,
      recentFiles: 0
    }
  });
  const [recentFiles, setRecentFiles] = useState([]);
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeacherData();
  }, []);

  const loadTeacherData = async () => {
    try {
      setLoading(true);
      
      // تحميل بيانات المادة
      if (user.subjectId) {
        const subjectResponse = await subjectService.getSubject(user.subjectId);
        setSubject(subjectResponse.data);
        
        // تحميل ملفات المادة
        const filesResponse = await fileService.getFiles({ 
          subject: user.subjectId,
          limit: 5 
        });
        setRecentFiles(filesResponse.data.files);
        
        // تحميل الإحصائيات
        const statsResponse = await fileService.getTeacherStats(user.subjectId);
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error('خطأ في تحميل بيانات المعلم:', error);
      toast.error('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('ar-SA').format(num);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="teacher-panel">
      <div className="teacher-panel-header">
        <div className="header-content">
          <h1>لوحة تحكم المعلم</h1>
          <p>مرحباً {user.fullName}</p>
          {subject && (
            <div className="subject-info">
              <div 
                className="subject-badge"
                style={{ backgroundColor: subject.color }}
              >
                <i className={`fas fa-${subject.icon}`}></i>
                <span>{subject.name_ar}</span>
              </div>
            </div>
          )}
        </div>
        <div className="header-actions">
          <Link to="/files/upload" className="btn btn-primary">
            <FaUpload />
            رفع ملف جديد
          </Link>
        </div>
      </div>

      {/* الإحصائيات */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FaFile />
          </div>
          <div className="stat-content">
            <h3>{formatNumber(stats.overview.totalFiles)}</h3>
            <p>إجمالي الملفات</p>
            <div className="stat-trend positive">
              <FaArrowUp />
              <span>+{stats.overview.recentFiles} هذا الأسبوع</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaDownload />
          </div>
          <div className="stat-content">
            <h3>{formatNumber(stats.overview.totalDownloads)}</h3>
            <p>مرات التحميل</p>
            <div className="stat-trend positive">
              <FaChartLine />
              <span>+25% هذا الأسبوع</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaEye />
          </div>
          <div className="stat-content">
            <h3>{formatNumber(stats.overview.totalViews || 0)}</h3>
            <p>المشاهدات</p>
            <div className="stat-trend positive">
              <FaArrowUp />
              <span>+15% هذا الأسبوع</span>
            </div>
          </div>
        </div>
      </div>

      {/* الملفات الحديثة */}
      <div className="recent-files-section">
        <div className="section-header">
          <h2>الملفات الحديثة</h2>
          <Link to={`/files?subject=${user.subjectId}`} className="view-all-link">
            عرض الكل
          </Link>
        </div>

        {recentFiles.length > 0 ? (
          <div className="files-grid">
            {recentFiles.map(file => (
              <div key={file.id} className="file-card">
                <div className="file-icon">
                  <FaFile />
                </div>
                <div className="file-info">
                  <h4>{file.title}</h4>
                  <p>{file.description}</p>
                  <div className="file-meta">
                    <span className="file-date">
                      {formatDate(file.created_at)}
                    </span>
                    <span className="file-downloads">
                      <FaDownload />
                      {formatNumber(file.download_count)}
                    </span>
                  </div>
                </div>
                <div className="file-actions">
                  <Link 
                    to={`/files/${file.id}`}
                    className="btn btn-sm btn-outline"
                  >
                    <FaEye />
                    عرض
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FaFile />
            <h3>لا توجد ملفات</h3>
            <p>ابدأ برفع أول ملف لمادتك</p>
            <Link to="/files/upload" className="btn btn-primary">
              <FaPlus />
              رفع ملف جديد
            </Link>
          </div>
        )}
      </div>

      {/* روابط سريعة */}
      <div className="quick-links">
        <h2>روابط سريعة</h2>
        <div className="links-grid">
          <Link to="/files/upload" className="quick-link">
            <FaUpload />
            <span>رفع ملف جديد</span>
          </Link>
          <Link to={`/files?subject=${user.subjectId}`} className="quick-link">
            <FaFile />
            <span>إدارة الملفات</span>
          </Link>
          <Link to="/profile" className="quick-link">
            <FaEye />
            <span>الملف الشخصي</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TeacherPanel;