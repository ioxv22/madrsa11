import { apiHelpers } from './api';

const userService = {
  // الحصول على جميع المستخدمين (أدمن فقط)
  getUsers: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiHelpers.get(`/users?${queryString}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // الحصول على مستخدم واحد (أدمن فقط)
  getUser: async (id) => {
    try {
      const response = await apiHelpers.get(`/users/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // إنشاء مستخدم جديد (أدمن فقط)
  createUser: async (userData) => {
    try {
      const response = await apiHelpers.post('/users', userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // تحديث معلومات المستخدم (أدمن فقط)
  updateUser: async (id, userData) => {
    try {
      const response = await apiHelpers.put(`/users/${id}`, userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // تغيير كلمة مرور المستخدم (أدمن فقط)
  changeUserPassword: async (id, passwordData) => {
    try {
      const response = await apiHelpers.put(`/users/${id}/password`, passwordData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // حذف مستخدم (أدمن فقط)
  deleteUser: async (id) => {
    try {
      const response = await apiHelpers.delete(`/users/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // البحث في المستخدمين (أدمن فقط)
  searchUsers: async (query, filters = {}) => {
    try {
      const params = {
        search: query,
        ...filters
      };
      return await userService.getUsers(params);
    } catch (error) {
      throw error;
    }
  },

  // الحصول على المستخدمين حسب الدور (أدمن فقط)
  getUsersByRole: async (role, params = {}) => {
    try {
      const queryParams = {
        role: role,
        ...params
      };
      return await userService.getUsers(queryParams);
    } catch (error) {
      throw error;
    }
  },

  // الحصول على إحصائيات المستخدمين (أدمن فقط)
  getUserStats: async () => {
    try {
      const response = await apiHelpers.get('/users/stats/overview');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // الحصول على المستخدمين النشطين (أدمن فقط)
  getActiveUsers: async (limit = 10) => {
    try {
      const params = {
        limit: limit,
        sort: 'last_login',
        order: 'desc'
      };
      return await userService.getUsers(params);
    } catch (error) {
      throw error;
    }
  },

  // الحصول على أحدث المستخدمين (أدمن فقط)
  getRecentUsers: async (limit = 10) => {
    try {
      const params = {
        limit: limit,
        sort: 'created_at',
        order: 'desc'
      };
      return await userService.getUsers(params);
    } catch (error) {
      throw error;
    }
  },

  // تحديث الملف الشخصي للمستخدم الحالي
  updateProfile: async (userData) => {
    try {
      const response = await apiHelpers.put('/auth/profile', userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // تغيير كلمة المرور للمستخدم الحالي
  changePassword: async (passwordData) => {
    try {
      const response = await apiHelpers.put('/auth/change-password', passwordData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // التحقق من صحة البيانات
  validateUserData: (userData) => {
    const errors = {};

    // التحقق من اسم المستخدم
    if (!userData.username || userData.username.trim().length < 3) {
      errors.username = 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل';
    }

    // التحقق من البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userData.email || !emailRegex.test(userData.email)) {
      errors.email = 'يرجى إدخال بريد إلكتروني صحيح';
    }

    // التحقق من الاسم الكامل
    if (!userData.fullName || userData.fullName.trim().length < 2) {
      errors.fullName = 'الاسم الكامل يجب أن يكون حرفين على الأقل';
    }

    // التحقق من كلمة المرور (للمستخدمين الجدد)
    if (userData.password !== undefined) {
      if (!userData.password || userData.password.length < 6) {
        errors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
      }
    }

    // التحقق من تأكيد كلمة المرور
    if (userData.confirmPassword !== undefined) {
      if (userData.password !== userData.confirmPassword) {
        errors.confirmPassword = 'كلمة المرور وتأكيدها غير متطابقتين';
      }
    }

    // التحقق من الدور
    if (userData.role && !['student', 'admin'].includes(userData.role)) {
      errors.role = 'الدور المحدد غير صحيح';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // تنسيق تاريخ آخر تسجيل دخول
  formatLastLogin: (lastLogin) => {
    if (!lastLogin) return 'لم يسجل دخول من قبل';

    const date = new Date(lastLogin);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'اليوم';
    } else if (diffInDays === 1) {
      return 'أمس';
    } else if (diffInDays < 7) {
      return `منذ ${diffInDays} أيام`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `منذ ${weeks} ${weeks === 1 ? 'أسبوع' : 'أسابيع'}`;
    } else {
      const months = Math.floor(diffInDays / 30);
      return `منذ ${months} ${months === 1 ? 'شهر' : 'أشهر'}`;
    }
  },

  // الحصول على لون الدور
  getRoleColor: (role) => {
    const colors = {
      admin: 'danger',
      student: 'primary'
    };
    return colors[role] || 'secondary';
  },

  // الحصول على نص الدور
  getRoleText: (role) => {
    const roles = {
      admin: 'مدير',
      student: 'طالب'
    };
    return roles[role] || role;
  }
};

export default userService;