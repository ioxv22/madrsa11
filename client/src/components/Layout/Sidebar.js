import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaBook, 
  FaFile, 
  FaUser, 
  FaUpload,
  FaChartBar,
  FaTimes
} from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = ({ user, isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    {
      path: '/dashboard',
      icon: FaHome,
      label: 'الرئيسية',
      roles: ['student', 'admin']
    },
    {
      path: '/subjects',
      icon: FaBook,
      label: 'المواد الدراسية',
      roles: ['student', 'admin']
    },
    {
      path: '/files',
      icon: FaFile,
      label: 'الملفات',
      roles: ['student', 'admin']
    },
    {
      path: '/profile',
      icon: FaUser,
      label: 'الملف الشخصي',
      roles: ['student', 'admin']
    }
  ];

  const adminMenuItems = [
    // روابط المعلم فقط (الأدمن مخفي)
    {
      path: '/teacher',
      icon: FaChartBar,
      label: 'لوحة المعلم',
      roles: ['teacher']
    },
    {
      path: '/teacher/upload',
      icon: FaUpload,
      label: 'رفع ملف',
      roles: ['teacher']
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const canAccess = (item) => {
    return item.roles.includes(user.role);
  };

  return (
    <>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>القائمة</h3>
          <button className="sidebar-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">
            {menuItems.map((item) => {
              if (!canAccess(item)) return null;
              
              const Icon = item.icon;
              return (
                <li key={item.path} className="nav-item">
                  <Link
                    to={item.path}
                    className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                    onClick={onClose}
                  >
                    <Icon className="nav-icon" />
                    <span className="nav-label">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {user.role === 'admin' && (
            <>
              <div className="nav-divider">
                <span>إدارة النظام</span>
              </div>
              
              <ul className="nav-list">
                {adminMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.path} className="nav-item">
                      <Link
                        to={item.path}
                        className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                        onClick={onClose}
                      >
                        <Icon className="nav-icon" />
                        <span className="nav-label">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <FaUser />
            </div>
            <div className="user-details">
              <h4>{user.fullName}</h4>
              <p>{user.role === 'admin' ? 'مدير' : 'طالب'}</p>
            </div>
          </div>
        </div>
      </div>

      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
    </>
  );
};

export default Sidebar;
