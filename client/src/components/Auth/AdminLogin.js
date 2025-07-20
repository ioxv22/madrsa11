import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash, FaLock, FaUser, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import './Auth.css';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      toast.error('جميع الحقول مطلوبة');
      return;
    }

    try {
      setLoading(true);
      const response = await authService.login(formData.username, formData.password);
      
      // التحقق من أن المستخدم أدمن
      if (response.data.user.role !== 'admin') {
        toast.error('هذه الصفحة مخصصة للمدير فقط');
        return;
      }

      login(response.data.user, response.data.token);
      toast.success('مرحباً بك أيها المدير');
      navigate('/admin');
    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error);
      toast.error(error.response?.data?.message || 'خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-overlay"></div>
      </div>
      
      <div className="auth-content">
        <div className="auth-card admin-login-card">
          <div className="auth-header">
            <div className="admin-icon">
              <FaShieldAlt />
            </div>
            <h1>🔒 دخول المدير</h1>
            <p>صفحة سرية - للمدير فقط</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username">
                <FaUser />
                اسم المستخدم
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="أدخل اسم المستخدم"
                required
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <FaLock />
                كلمة المرور
              </label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="أدخل كلمة المرور"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="auth-button admin-button"
              disabled={loading}
            >
              {loading ? (
                <div className="loading-spinner"></div>
              ) : (
                <>
                  <FaShieldAlt />
                  دخول لوحة الإدارة
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <div className="security-notice">
              <FaLock />
              <span>هذه منطقة محمية - للمدير المعتمد فقط</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;