import { apiHelpers } from './api';

const authService = {
  // تسجيل الدخول
  login: async (credentials) => {
    try {
      const response = await apiHelpers.post('/auth/login', credentials);
      
      // حفظ التوكن
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  // تسجيل مستخدم جديد
  register: async (userData) => {
    try {
      const response = await apiHelpers.post('/auth/register', userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // تسجيل الخروج
  logout: async () => {
    try {
      const response = await apiHelpers.post('/auth/logout');
      
      // إزالة التوكن
      localStorage.removeItem('token');
      
      return response;
    } catch (error) {
      // حتى لو فشل الطلب، قم بإزالة التوكن محلياً
      localStorage.removeItem('token');
      throw error;
    }
  },

  // الحصول على معلومات المستخدم الحالي
  getCurrentUser: async () => {
    try {
      const response = await apiHelpers.get('/auth/me');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // تحديث معلومات المستخدم
  updateProfile: async (userData) => {
    try {
      const response = await apiHelpers.put('/auth/profile', userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // تغيير كلمة المرور
  changePassword: async (passwordData) => {
    try {
      const response = await apiHelpers.put('/auth/change-password', passwordData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // التحقق من صحة التوكن
  verifyToken: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('لا يوجد توكن');
      }

      const response = await apiHelpers.get('/auth/verify');
      return response;
    } catch (error) {
      localStorage.removeItem('token');
      throw error;
    }
  },

  // الحصول على التوكن المحفوظ
  getToken: () => {
    return localStorage.getItem('token');
  },

  // التحقق من وجود توكن
  hasToken: () => {
    return !!localStorage.getItem('token');
  },

  // إزالة التوكن
  removeToken: () => {
    localStorage.removeItem('token');
  },

  // فك تشفير التوكن (بدون التحقق من الصحة)
  decodeToken: (token) => {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (error) {
      return null;
    }
  },

  // التحقق من انتهاء صلاحية التوكن
  isTokenExpired: (token) => {
    try {
      const decoded = authService.decodeToken(token);
      if (!decoded || !decoded.exp) {
        return true;
      }

      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  },

  // التحقق من صحة التوكن المحفوظ
  isValidToken: () => {
    const token = authService.getToken();
    if (!token) {
      return false;
    }

    return !authService.isTokenExpired(token);
  }
};

export default authService;