import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaBars, 
  FaUser, 
  FaSignOutAlt, 
  FaMoon, 
  FaSun,
  FaBell,
  FaSearch
} from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import './Navbar.css';

const Navbar = ({ user, onLogout, onToggleSidebar }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    if (window.confirm('هل أنت متأكد من تسجيل الخروج؟')) {
      onLogout();
    }
  };

  return (
    <nav className="navbar">
      <div className="container-fluid">
        <div className="navbar-content">
          {/* الجانب الأيمن */}
          <div className="navbar-right">
            <button 
              className="sidebar-toggle"
              onClick={onToggleSidebar}
              title="فتح/إغلاق القائمة الجانبية"
            >
              <FaBars />
            </button>
            
            <Link to="/" className="navbar-brand">
              <span className="brand-icon">📚</span>
              منصة الدراسة
            </Link>
          </div>

          {/* الجانب الأوسط - البحث */}
          <div className="navbar-center">
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="البحث في الملفات والمواد..."
                className="search-input"
              />
            </div>
          </div>

          {/* الجانب الأيسر */}
          <div className="navbar-left">
            {/* زر الوضع الليلي */}
            <button
              className="theme-toggle"
              onClick={toggleDarkMode}
              title={darkMode ? 'الوضع النهاري' : 'الوضع الليلي'}
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>

            {/* الإشعارات */}
            <div className="notifications-container">
              <button
                className="notifications-toggle"
                onClick={() => setShowNotifications(!showNotifications)}
                title="الإشعارات"
              >
                <FaBell />
                <span className="notification-badge">3</span>
              </button>
              
              {showNotifications && (
                <div className="notifications-dropdown">
                  <div className="notifications-header">
                    <h4>الإشعارات</h4>
                  </div>
                  <div className="notifications-list">
                    <div className="notification-item">
                      <div className="notification-content">
                        <p>تم رفع ملف جديد في مادة الرياضيات</p>
                        <small>منذ 5 دقائق</small>
                      </div>
                    </div>
                    <div className="notification-item">
                      <div className="notification-content">
                        <p>تم تحديث ملف في مادة الفيزياء</p>
                        <small>منذ ساعة</small>
                      </div>
                    </div>
                    <div className="notification-item">
                      <div className="notification-content">
                        <p>مرحباً بك في المنصة!</p>
                        <small>منذ يوم</small>
                      </div>
                    </div>
                  </div>
                  <div className="notifications-footer">
                    <Link to="/notifications">عرض جميع الإشعارات</Link>
                  </div>
                </div>
              )}
            </div>

            {/* قائمة المستخدم */}
            <div className="user-menu-container">
              <button
                className="user-menu-toggle"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="user-avatar">
                  <FaUser />
                </div>
                <div className="user-info">
                  <span className="user-name">{user.fullName}</span>
                  <span className="user-role">
                    {user.role === 'admin' ? 'مدير' : 'طالب'}
                  </span>
                </div>
              </button>

              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <div className="user-avatar large">
                      <FaUser />
                    </div>
                    <div className="user-details">
                      <h4>{user.fullName}</h4>
                      <p>{user.email}</p>
                      <span className={`role-badge ${user.role}`}>
                        {user.role === 'admin' ? 'مدير' : 'طالب'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="user-dropdown-menu">
                    <Link 
                      to="/profile" 
                      className="dropdown-item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FaUser />
                      الملف الشخصي
                    </Link>
                    
                    {user.role === 'admin' && (
                      <Link 
                        to="/admin" 
                        className="dropdown-item"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <FaBars />
                        لوحة التحكم
                      </Link>
                    )}
                    
                    <hr className="dropdown-divider" />
                    
                    <button 
                      className="dropdown-item logout"
                      onClick={handleLogout}
                    >
                      <FaSignOutAlt />
                      تسجيل الخروج
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;