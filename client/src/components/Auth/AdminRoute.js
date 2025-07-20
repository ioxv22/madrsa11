import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../Common/LoadingSpinner';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '100px 20px',
        color: 'var(--danger-color)'
      }}>
        <h2>🚫 غير مصرح لك بالوصول</h2>
        <p>هذه الصفحة مخصصة للمديرين فقط</p>
        <button 
          onClick={() => window.history.back()}
          style={{
            padding: '10px 20px',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          العودة
        </button>
      </div>
    );
  }

  return children;
};

export default AdminRoute;