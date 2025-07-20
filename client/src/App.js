import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// استيراد المكونات
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import AdminLogin from './components/Auth/AdminLogin';
import Dashboard from './components/Dashboard/Dashboard';
import SubjectList from './components/Subjects/SubjectList';
import FileList from './components/Files/FileList';
import FileUpload from './components/Files/FileUpload';
import AdminPanel from './components/Admin/AdminPanel';
import UserManagement from './components/Admin/UserManagement';
import SubjectManagement from './components/Admin/SubjectManagement';
import TeacherPanel from './components/Teacher/TeacherPanel';
import Profile from './components/Profile/Profile';
import LoadingSpinner from './components/Common/LoadingSpinner';

// استيراد السياق
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

// استيراد الخدمات
import authService from './services/authService';

function AppContent() {
  const { user, login, logout, loading } = useAuth();
  const { darkMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // تطبيق الوضع الليلي
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  useEffect(() => {
    // التحقق من وجود توكن محفوظ
    const token = localStorage.getItem('token');
    if (token && !user) {
      authService.getCurrentUser()
        .then(response => {
          login(response.data, token);
        })
        .catch(() => {
          localStorage.removeItem('token');
        });
    }
  }, [user, login]);

  if (loading) {
    return <LoadingSpinner />;
  }

  // إذا لم يكن المستخدم مسجل دخول
  if (!user) {
    return (
      <div className="auth-container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="app">
      <Navbar 
        user={user} 
        onLogout={logout}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="app-body">
        <div className={`sidebar-container ${sidebarOpen ? 'open' : ''}`}>
          <Sidebar 
            user={user}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        </div>
        
        <div className="main-content">
          <div className="container-fluid">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/subjects" element={<SubjectList />} />
              <Route path="/files" element={<FileList />} />
              <Route path="/profile" element={<Profile />} />
              
              {/* مسارات الأدمن فقط */}
              {user.role === 'admin' && (
                <>
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="/admin/users" element={<UserManagement />} />
                  <Route path="/admin/subjects" element={<SubjectManagement />} />
                  <Route path="/admin/upload" element={<FileUpload />} />
                </>
              )}
              
              {/* مسارات المعلم فقط */}
              {user.role === 'teacher' && (
                <>
                  <Route path="/teacher" element={<TeacherPanel />} />
                  <Route path="/teacher/upload" element={<FileUpload />} />
                </>
              )}
              
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </div>
      </div>
      
      {/* طبقة تغطية للشاشات الصغيرة */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={true}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;