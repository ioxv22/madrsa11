import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaUserPlus,
  FaIdCard
} from 'react-icons/fa';
import authService from '../../services/authService';
import { errorHelpers } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
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

    // التحقق من اسم المستخدم
    if (!formData.username.trim()) {
      newErrors.username = 'اسم المستخدم مطلوب';
    } else if (formData.username.length < 3) {
      newErrors.username = 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'اسم المستخدم يجب أن يحتوي على أحرف وأرقام فقط';
    }

    // التحقق من البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'يرجى إدخال بريد إلكتروني صحيح';
    }

    // التحقق من الاسم الكامل
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'الاسم الكامل مطلوب';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'الاسم الكامل يجب أن يكون حرفين على الأقل';
    }

    // التحقق من كلمة المرور
    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }

    // التحقق من تأكيد كلمة المرور
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمة المرور وتأكيدها غير متطابقتين';
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
      const registerData = {
        username: formData.username,
        email: formData.email,
        fullName: formData.fullName,
        password: formData.password
      };

      await authService.register(registerData);
      
      toast.success('تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول');
      navigate('/login');
      
    } catch (error) {
      const errorMessage = errorHelpers.handleCommonErrors(error);
      toast.error(errorMessage);
      
      // معالجة أخطاء محددة
      if (error.response?.status === 400) {
        const message = error.response.data.message;
        if (message.includes('اسم المستخدم')) {
          setErrors({ username: message });
        } else if (message.includes('البريد الإلكتروني')) {
          setErrors({ email: message });
        } else {
          setErrors({ general: message });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="جاري إنشاء الحساب..." />;
  }

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-overlay"></div>
      </div>
      
      <div className="auth-content">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <span className="logo-icon">📚</span>
              <h1>منصة الدراسة</h1>
            </div>
            <p>الصف الحادي عشر</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>إنشاء حساب جديد</h2>
            
            {errors.general && (
              <div className="alert alert-danger">
                {errors.general}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="fullName" className="form-label">
                الاسم الكامل
              </label>
              <div className="input-group">
                <FaIdCard className="input-icon" />
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                  placeholder="أدخل اسمك الكامل"
                  autoComplete="name"
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
                  value={formData.username}
                  onChange={handleChange}
                  className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                  placeholder="أدخل اسم المستخدم"
                  autoComplete="username"
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
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="أدخل بريدك الإلكتروني"
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <div className="invalid-feedback">{errors.email}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                كلمة المرور
              </label>
              <div className="input-group">
                <FaLock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  placeholder="أدخل كلمة المرور"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <div className="invalid-feedback">{errors.password}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                تأكيد كلمة المرور
              </label>
              <div className="input-group">
                <FaLock className="input-icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                  placeholder="أعد إدخال كلمة المرور"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  title={showConfirmPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="invalid-feedback">{errors.confirmPassword}</div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg auth-submit"
              disabled={loading}
            >
              <FaUserPlus />
              {loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              لديك حساب بالفعل؟{' '}
              <Link to="/login" className="auth-link">
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;