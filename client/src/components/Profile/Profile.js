import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaEdit,
  FaSave,
  FaTimes,
  FaEye,
  FaEyeSlash,
  FaUserCircle,
  FaCalendarAlt,
  FaShieldAlt
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

import userService from '../../services/userService';
import LoadingSpinner from '../Common/LoadingSpinner';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  // بيانات الملف الشخصي
  const [profileData, setProfileData] = useState({
    fullName: user.fullName || '',
    email: user.email || '',
    username: user.username || ''
  });
  
  // بيانات تغيير كلمة المرور
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [errors, setErrors] = useState({});

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
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

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
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

  const validateProfileData = () => {
    const newErrors = {};
    const validation = userService.validateUserData(profileData);
    
    if (!validation.isValid) {
      Object.assign(newErrors, validation.errors);
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordData = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'كلمة المرور الحالية مطلوبة';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'كلمة المرور الجديدة مطلوبة';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'كلمة المرور وتأكيدها غير متطابقتين';
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      newErrors.newPassword = 'كلمة المرور الجديدة يجب أن تكون مختلفة عن الحالية';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateProfileData()) {
      return;
    }

    setLoading(true);

    try {
      await userService.updateProfile(profileData);
      
      // تحديث بيانات المستخدم في السياق
      updateUser(profileData);
      
      toast.success('تم تحديث الملف الشخصي بنجاح');
      setEditMode(false);
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'حدث خطأ في تحديث الملف الشخصي';
      toast.error(errorMessage);
      
      // معالجة أخطاء محددة
      if (error.response?.status === 400) {
        const message = error.response.data.message;
        if (message.includes('اسم المستخدم')) {
          setErrors({ username: message });
        } else if (message.includes('البريد الإلكتروني')) {
          setErrors({ email: message });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordData()) {
      return;
    }

    setLoading(true);

    try {
      await userService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      toast.success('تم تغيير كلمة المرور بنجاح');
      
      // إعادة تعيين النموذج
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordForm(false);
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'حدث خطأ في تغيير كلمة المرور';
      toast.error(errorMessage);
      
      if (error.response?.status === 400) {
        setErrors({ currentPassword: 'كلمة المرور الحالية غير صحيحة' });
      }
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setProfileData({
      fullName: user.fullName || '',
      email: user.email || '',
      username: user.username || ''
    });
    setEditMode(false);
    setErrors({});
  };

  const cancelPasswordChange = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswordForm(false);
    setErrors({});
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="profile-container">
      <div className="page-header">
        <h1>
          <FaUser />
          الملف الشخصي
        </h1>
        <p>إدارة معلوماتك الشخصية وإعدادات الحساب</p>
      </div>

      <div className="profile-content">
        {/* بطاقة المعلومات الأساسية */}
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              <FaUserCircle />
            </div>
            <div className="profile-info">
              <h2>{user.fullName}</h2>
              <p className="profile-role">
                <FaShieldAlt />
                {user.role === 'admin' ? 'مدير النظام' : 'طالب'}
              </p>
              <p className="profile-date">
                <FaCalendarAlt />
                عضو منذ {formatDate(user.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* تحديث المعلومات الشخصية */}
        <div className="settings-card">
          <div className="card-header">
            <h3>المعلومات الشخصية</h3>
            {!editMode && (
              <button
                className="btn btn-outline"
                onClick={() => setEditMode(true)}
              >
                <FaEdit />
                تعديل
              </button>
            )}
          </div>

          <form onSubmit={handleProfileSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="fullName" className="form-label">
                الاسم الكامل
              </label>
              <div className="input-group">
                <FaUser className="input-icon" />
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={profileData.fullName}
                  onChange={handleProfileChange}
                  className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                  disabled={!editMode}
                />
              </div>
              {errors.fullName && (
                <div className="invalid-feedback">{errors.fullName}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="username" className="form-label">
                اسم المستخدم
              </label>
              <div className="input-group">
                <FaUser className="input-icon" />
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={profileData.username}
                  onChange={handleProfileChange}
                  className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                  disabled={!editMode}
                />
              </div>
              {errors.username && (
                <div className="invalid-feedback">{errors.username}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                البريد الإلكتروني
              </label>
              <div className="input-group">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  disabled={!editMode}
                />
              </div>
              {errors.email && (
                <div className="invalid-feedback">{errors.email}</div>
              )}
            </div>

            {editMode && (
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={cancelEdit}
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
                  حفظ التغييرات
                </button>
              </div>
            )}
          </form>
        </div>

        {/* تغيير كلمة المرور */}
        <div className="settings-card">
          <div className="card-header">
            <h3>كلمة المرور</h3>
            {!showPasswordForm && (
              <button
                className="btn btn-outline"
                onClick={() => setShowPasswordForm(true)}
              >
                <FaLock />
                تغيير كلمة المرور
              </button>
            )}
          </div>

          {showPasswordForm && (
            <form onSubmit={handlePasswordSubmit} className="password-form">
              <div className="form-group">
                <label htmlFor="currentPassword" className="form-label">
                  كلمة المرور الحالية
                </label>
                <div className="input-group">
                  <FaLock className="input-icon" />
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className={`form-control ${errors.currentPassword ? 'is-invalid' : ''}`}
                    placeholder="أدخل كلمة المرور الحالية"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('current')}
                  >
                    {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.currentPassword && (
                  <div className="invalid-feedback">{errors.currentPassword}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="newPassword" className="form-label">
                  كلمة المرور الجديدة
                </label>
                <div className="input-group">
                  <FaLock className="input-icon" />
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                    placeholder="أدخل كلمة المرور الجديدة"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('new')}
                  >
                    {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.newPassword && (
                  <div className="invalid-feedback">{errors.newPassword}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  تأكيد كلمة المرور الجديدة
                </label>
                <div className="input-group">
                  <FaLock className="input-icon" />
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    placeholder="أعد إدخال كلمة المرور الجديدة"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('confirm')}
                  >
                    {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <div className="invalid-feedback">{errors.confirmPassword}</div>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={cancelPasswordChange}
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
                  تغيير كلمة المرور
                </button>
              </div>
            </form>
          )}
        </div>

        {/* معلومات إضافية */}
        <div className="info-card">
          <h3>نصائح الأمان</h3>
          <ul>
            <li>استخدم كلمة مرور قوية تحتوي على أحرف وأرقام ورموز</li>
            <li>لا تشارك معلومات حسابك مع أي شخص آخر</li>
            <li>قم بتسجيل الخروج عند استخدام أجهزة مشتركة</li>
            <li>تأكد من صحة بريدك الإلكتروني للحصول على الإشعارات</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Profile;