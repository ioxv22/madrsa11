import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  FaUsers, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSave,
  FaTimes,
  FaSearch,
  FaFilter,
  FaUserShield,
  FaUser,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import LoadingSpinner from '../Common/LoadingSpinner';
import './UserManagement.css';

const UserManagement = () => {
  const { user } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: 'student'
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user.role !== 'admin') {
      return;
    }
    loadUsers();
  }, [user]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('خطأ في تحميل المستخدمين:', error);
      toast.error('حدث خطأ في تحميل المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
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
    const validation = userService.validateUserData(formData, !editingUser);
    
    if (!validation.isValid) {
      Object.assign(newErrors, validation.errors);
    }

    // التحقق من عدم تكرار اسم المستخدم والبريد الإلكتروني
    const existingUser = users.find(u => 
      (u.username === formData.username || u.email === formData.email) &&
      u.id !== editingUser?.id
    );

    if (existingUser) {
      if (existingUser.username === formData.username) {
        newErrors.username = 'اسم المستخدم موجود بالفعل';
      }
      if (existingUser.email === formData.email) {
        newErrors.email = 'البريد الإلكتروني موجود بالفعل';
      }
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
      if (editingUser) {
        // إزالة كلمة المرور من البيانات إذا كانت فارغة
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        
        await userService.updateUser(editingUser.id, updateData);
        toast.success('تم تحديث المستخدم بنجاح');
      } else {
        await userService.createUser(formData);
        toast.success('تم إضافة المستخدم بنجاح');
      }

      resetForm();
      loadUsers();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'حدث خطأ في حفظ المستخدم';
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

  const handleEdit = (userToEdit) => {
    setEditingUser(userToEdit);
    setFormData({
      username: userToEdit.username,
      email: userToEdit.email,
      password: '', // لا نعرض كلمة المرور الحالية
      fullName: userToEdit.fullName,
      role: userToEdit.role
    });
    setShowAddForm(true);
  };

  const handleDelete = async (userToDelete) => {
    if (userToDelete.id === user.id) {
      toast.error('لا يمكنك حذف حسابك الخاص');
      return;
    }

    if (!window.confirm(`هل أنت متأكد من حذف المستخدم "${userToDelete.fullName}"؟`)) {
      return;
    }

    try {
      await userService.deleteUser(userToDelete.id);
      toast.success('تم حذف المستخدم بنجاح');
      loadUsers();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'حدث خطأ في حذف المستخدم';
      toast.error(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      fullName: '',
      role: 'student'
    });
    setEditingUser(null);
    setShowAddForm(false);
    setErrors({});
    setShowPassword(false);
  };

  // تصفية المستخدمين
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (user.role !== 'admin') {
    return (
      <div className="access-denied">
        <h2>غير مصرح لك بالوصول لهذه الصفحة</h2>
      </div>
    );
  }

  if (loading && users.length === 0) {
    return <LoadingSpinner message="جاري تحميل المستخدمين..." />;
  }

  return (
    <div className="user-management">
      <div className="page-header">
        <div className="header-content">
          <h1>
            <FaUsers />
            إدارة المستخدمين
          </h1>
          <p>إضافة وتعديل وحذف المستخدمين</p>
        </div>
        
        <button
          className="btn btn-primary"
          onClick={() => setShowAddForm(true)}
        >
          <FaPlus />
          إضافة مستخدم جديد
        </button>
      </div>

      {/* شريط البحث والفلاتر */}
      <div className="filters-section">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="البحث في المستخدمين..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-container">
          <FaFilter className="filter-icon" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">جميع الأدوار</option>
            <option value="admin">المديرين</option>
            <option value="student">الطلاب</option>
          </select>
        </div>
        
        <div className="results-info">
          <span>
            {filteredUsers.length} من {users.length} مستخدم
          </span>
        </div>
      </div>

      {/* نموذج إضافة/تعديل المستخدم */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                {editingUser ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}
              </h2>
              <button
                className="close-btn"
                onClick={resetForm}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="user-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fullName" className="form-label">
                    الاسم الكامل *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                    placeholder="الاسم الكامل للمستخدم"
                  />
                  {errors.fullName && (
                    <div className="invalid-feedback">{errors.fullName}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="username" className="form-label">
                    اسم المستخدم *
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                    placeholder="اسم المستخدم للدخول"
                  />
                  {errors.username && (
                    <div className="invalid-feedback">{errors.username}</div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  البريد الإلكتروني *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="البريد الإلكتروني"
                />
                {errors.email && (
                  <div className="invalid-feedback">{errors.email}</div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    كلمة المرور {editingUser ? '(اتركها فارغة للاحتفاظ بالحالية)' : '*'}
                  </label>
                  <div className="password-input">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      placeholder={editingUser ? 'كلمة مرور جديدة (اختياري)' : 'كلمة المرور'}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.password && (
                    <div className="invalid-feedback">{errors.password}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="role" className="form-label">
                    الدور *
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="form-control"
                  >
                    <option value="student">طالب</option>
                    <option value="admin">مدير</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={resetForm}
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
                  {editingUser ? 'تحديث المستخدم' : 'إضافة المستخدم'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* قائمة المستخدمين */}
      <div className="users-list">
        {filteredUsers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>
              {searchTerm || roleFilter !== 'all' 
                ? 'لا توجد نتائج' 
                : 'لا يوجد مستخدمون'
              }
            </h3>
            <p>
              {searchTerm || roleFilter !== 'all'
                ? 'لم يتم العثور على مستخدمين يطابقون البحث'
                : 'ابدأ بإضافة مستخدم جديد'
              }
            </p>
            {!searchTerm && roleFilter === 'all' && (
              <button
                className="btn btn-primary"
                onClick={() => setShowAddForm(true)}
              >
                <FaPlus />
                إضافة مستخدم جديد
              </button>
            )}
          </div>
        ) : (
          <div className="users-table">
            <div className="table-header">
              <div className="header-cell">المستخدم</div>
              <div className="header-cell">البريد الإلكتروني</div>
              <div className="header-cell">الدور</div>
              <div className="header-cell">تاريخ الانضمام</div>
              <div className="header-cell">الإجراءات</div>
            </div>
            
            <div className="table-body">
              {filteredUsers.map(userItem => (
                <div key={userItem.id} className="table-row">
                  <div className="table-cell user-info">
                    <div className="user-avatar">
                      {userItem.role === 'admin' ? <FaUserShield /> : <FaUser />}
                    </div>
                    <div className="user-details">
                      <h4>{userItem.fullName}</h4>
                      <p>@{userItem.username}</p>
                    </div>
                  </div>
                  
                  <div className="table-cell">
                    {userItem.email}
                  </div>
                  
                  <div className="table-cell">
                    <span className={`role-badge ${userItem.role}`}>
                      {userItem.role === 'admin' ? (
                        <>
                          <FaUserShield />
                          مدير
                        </>
                      ) : (
                        <>
                          <FaUser />
                          طالب
                        </>
                      )}
                    </span>
                  </div>
                  
                  <div className="table-cell">
                    {formatDate(userItem.createdAt)}
                  </div>
                  
                  <div className="table-cell actions">
                    <button
                      className="action-btn edit"
                      title="تعديل المستخدم"
                      onClick={() => handleEdit(userItem)}
                    >
                      <FaEdit />
                    </button>
                    {userItem.id !== user.id && (
                      <button
                        className="action-btn delete"
                        title="حذف المستخدم"
                        onClick={() => handleDelete(userItem)}
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;