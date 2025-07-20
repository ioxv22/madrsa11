import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaChartBar, 
  FaUsers, 
  FaBook, 
  FaFile,
  FaDownload,
  FaUpload,
  FaCog,
  FaEye,
  FaArrowUp,

  FaChartLine
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import fileService from '../../services/fileService';
import userService from '../../services/userService';
import subjectService from '../../services/subjectService';
import LoadingSpinner from '../Common/LoadingSpinner';
import './AdminPanel.css';

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    overview: {},
    files: {},
    users: {},
    subjects: {}
  });
  
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    // التحقق من صلاحيات الأدمن
    if (user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    
    loadDashboardData();
  }, [user, navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // تحميل الإحصائيات بشكل متوازي
      const [
        overviewResponse,
        fileStatsResponse,
        userStatsResponse,
        subjectStatsResponse
      ] = await Promise.all([
        fetch('/api/stats').then(res => res.json()).catch(() => ({})),
        fileService.getFileStats().catch(() => ({ data: {} })),
        userService.getUserStats().catch(() => ({ data: {} })),
        subjectService.getSubjectStats().catch(() => ({ data: {} }))
      ]);

      setStats({
        overview: overviewResponse,
        files: fileStatsResponse.data || {},
        users: userStatsResponse.data || {},
        subjects: subjectStatsResponse.data || {}
      });

      // محاكاة النشاط الأخير
      setRecentActivity([
        {
          id: 1,
          type: 'file_upload',
          message: 'تم رفع ملف جديد في مادة الرياضيات',
          time: '5 دقائق',
          icon: FaUpload,
          color: 'success'
        },
        {
          id: 2,
          type: 'user_register',
          message: 'انضم مستخدم جديد للمنصة',
          time: '15 دقيقة',
          icon: FaUsers,
          color: 'info'
        },
        {
          id: 3,
          type: 'file_download',
          message: 'تم تحميل ملف من مادة الفيزياء 25 مرة',
          time: '30 دقيقة',
          icon: FaDownload,
          color: 'warning'
        },
        {
          id: 4,
          type: 'subject_update',
          message: 'تم تحديث معلومات مادة الكيمياء',
          time: '1 ساعة',
          icon: FaBook,
          color: 'primary'
        }
      ]);

    } catch (error) {
      console.error('خطأ في تحميل بيانات لوحة التحكم:', error);
      toast.error('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'م';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'ك';
    }
    return num?.toString() || '0';
  };

  const formatFileSize = (bytes) => {
    return fileService.formatFileSize(bytes || 0);
  };

  if (loading) {
    return <LoadingSpinner message="جاري تحميل لوحة التحكم..." />;
  }

  return (
    <div className="admin-panel">
      <div className="panel-header">
        <div className="header-content">
          <h1>
            <FaChartBar />
            لوحة التحكم
          </h1>
          <p>مرحباً {user.fullName}، إليك نظرة عامة على المنصة</p>
        </div>
        
        <div className="quick-actions">
          <Link to="/admin/upload" className="btn btn-primary">
            <FaUpload />
            رفع ملف
          </Link>
          <Link to="/admin/users" className="btn btn-outline">
            <FaUsers />
            إدارة المستخدمين
          </Link>
        </div>
      </div>

      {/* الإحصائيات الرئيسية */}
      <div className="stats-overview">
        <div className="stat-card users">
          <div className="stat-icon">
            <FaUsers />
          </div>
          <div className="stat-content">
            <h3>{formatNumber(stats.overview.totalUsers)}</h3>
            <p>إجمالي المستخدمين</p>
            <div className="stat-trend positive">
              <FaArrowUp />
              <span>+12% هذا الشهر</span>
            </div>
          </div>
        </div>

        <div className="stat-card subjects">
          <div className="stat-icon">
            <FaBook />
          </div>
          <div className="stat-content">
            <h3>{formatNumber(stats.overview.totalSubjects)}</h3>
            <p>المواد الدراسية</p>
            <div className="stat-trend neutral">
              <span>مستقر</span>
            </div>
          </div>
        </div>

        <div className="stat-card files">
          <div className="stat-icon">
            <FaFile />
          </div>
          <div className="stat-content">
            <h3>{formatNumber(stats.overview.totalFiles)}</h3>
            <p>إجمالي الملفات</p>
            <div className="stat-trend positive">
              <FaArrowUp />
              <span>+8% هذا الأسبوع</span>
            </div>
          </div>
        </div>

        <div className="stat-card downloads">
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
      </div>

      <div className="panel-content">
        {/* إحصائيات الملفات */}
        <div className="content-section">
          <div className="section-header">
            <h2>إحصائيات الملفات</h2>
            <Link to="/files" className="section-link">
              <FaEye />
              عرض جميع الملفات
            </Link>
          </div>
          
          <div className="files-stats">
            {stats.files.filesByType && (
              <div className="chart-card">
                <h3>الملفات حسب النوع</h3>
                <div className="file-types">
                  {stats.files.filesByType.map((type, index) => (
                    <div key={index} className="file-type-item">
                      <div className="type-info">
                        <span className="type-name">{type.type}</span>
                        <span className="type-count">{type.count} ملف</span>
                      </div>
                      <div className="type-bar">
                        <div 
                          className="type-fill"
                          style={{ 
                            width: `${(type.count / Math.max(...stats.files.filesByType.map(t => t.count))) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="storage-info">
              <h3>معلومات التخزين</h3>
              <div className="storage-stats">
                <div className="storage-item">
                  <span>إجمالي الحجم:</span>
                  <span>{formatFileSize(stats.files.totalSize?.size)}</span>
                </div>
                <div className="storage-item">
                  <span>متوسط حجم الملف:</span>
                  <span>
                    {stats.overview.totalFiles > 0 
                      ? formatFileSize((stats.files.totalSize?.size || 0) / stats.overview.totalFiles)
                      : '0 بايت'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* أحدث الملفات والنشاط */}
        <div className="content-row">
          <div className="content-section">
            <div className="section-header">
              <h2>أحدث الملفات</h2>
              <Link to="/files?sort=created_at" className="section-link">
                عرض الكل
              </Link>
            </div>
            
            <div className="recent-files">
              {stats.files.recentFiles && stats.files.recentFiles.length > 0 ? (
                stats.files.recentFiles.map((file, index) => (
                  <div key={index} className="file-item">
                    <div className="file-icon">📄</div>
                    <div className="file-info">
                      <h4>{file.title}</h4>
                      <p>{file.subject_name}</p>
                      <small>{new Date(file.created_at).toLocaleDateString('ar-SA')}</small>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>لا توجد ملفات حديثة</p>
                </div>
              )}
            </div>
          </div>

          <div className="content-section">
            <div className="section-header">
              <h2>النشاط الأخير</h2>
            </div>
            
            <div className="activity-feed">
              {recentActivity.map(activity => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className={`activity-item ${activity.color}`}>
                    <div className="activity-icon">
                      <Icon />
                    </div>
                    <div className="activity-content">
                      <p>{activity.message}</p>
                      <small>منذ {activity.time}</small>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* إحصائيات المواد */}
        <div className="content-section">
          <div className="section-header">
            <h2>إحصائيات المواد</h2>
            <Link to="/admin/subjects" className="section-link">
              <FaCog />
              إدارة المواد
            </Link>
          </div>
          
          <div className="subjects-grid">
            {stats.subjects && Array.isArray(stats.subjects) && stats.subjects.map(subject => (
              <div key={subject.id} className="subject-stat-card" style={{ '--subject-color': subject.color }}>
                <div className="subject-header">
                  <h3>{subject.name_ar}</h3>
                  <div className="subject-badge" style={{ backgroundColor: subject.color }}>
                    {subject.file_count} ملف
                  </div>
                </div>
                <div className="subject-stats">
                  <div className="stat">
                    <span>الحجم الإجمالي:</span>
                    <span>{formatFileSize(subject.total_size)}</span>
                  </div>
                  <div className="stat">
                    <span>مرات التحميل:</span>
                    <span>{formatNumber(subject.total_downloads)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;