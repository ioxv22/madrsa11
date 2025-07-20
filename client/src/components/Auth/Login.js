import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaSignInAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import { errorHelpers } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, loginStart, loginFailure } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
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

    if (!formData.username.trim()) {
      newErrors.username = 'اسم المستخدم مطلوب';
    }

    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
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
    loginStart();

    try {
      const response = await authService.login(formData);
      
      login(response.data.user, response.data.token);
      toast.success('تم تسجيل الدخول بنجاح!');
      navigate('/dashboard');
      
    } catch (error) {
      const errorMessage = errorHelpers.handleCommonErrors(error);
      loginFailure(errorMessage);
      toast.error(errorMessage);
      
      // إذا كان الخطأ في بيانات الدخول
      if (error.response?.status === 400) {
        setErrors({
          username: 'اسم المستخدم أو كلمة المرور غير صحيحة',
          password: 'اسم المستخدم أو كلمة المرور غير صحيحة'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    const demoCredentials = {
      admin: { username: 'admin', password: 'admin123' },
      student: { username: 'student', password: 'student123' }
    };

    setFormData(demoCredentials[role]);
    
    // تسجيل دخول تلقائي
    setTimeout(() => {
      document.getElementById('login-form').requestSubmit();
    }, 500);
  };

  if (loading) {
    return <LoadingSpinner message="جاري تسجيل الدخول..." />;
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

          <form id="login-form" className="auth-form" onSubmit={handleSubmit}>
            <h2>تسجيل الدخول</h2>
            
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                اسم المستخدم أو البريد الإلكتروني
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
                  autoComplete="current-password"
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

            <button
              type="submit"
              className="btn btn-primary btn-lg auth-submit"
              disabled={loading}
            >
              <FaSignInAlt />
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>

          <div className="auth-divider">
            <span>أو</span>
          </div>

          <div className="demo-section">
            <p>تجربة سريعة:</p>
            <div className="demo-buttons">
              <button
                type="button"
                className="btn btn-outline demo-btn"
                onClick={() => handleDemoLogin('admin')}
              >
                دخول كمدير
              </button>
              <button
                type="button"
                className="btn btn-outline demo-btn"
                onClick={() => handleDemoLogin('student')}
              >
                دخول كطالب
              </button>
            </div>
          </div>

          <div className="auth-footer">
            <p>
              ليس لديك حساب؟{' '}
              <Link to="/register" className="auth-link">
                إنشاء حساب جديد
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;