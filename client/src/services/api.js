import axios from 'axios';

// إنشاء مثيل axios
const api = axios.create({
  baseURL:
    window.location.hostname === "localhost"
      ? "http://localhost:5000/api"
      : "https://madrsa11-1.onrender.com/api",
  timeout: 30000, // 30 ثانية
  headers: {
    'Content-Type': 'application/json',
  }
});

// إضافة التوكن تلقائياً لكل طلب
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// معالجة الاستجابات والأخطاء
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // إذا كان الخطأ 401 (غير مصرح) قم بتسجيل الخروج
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // إذا كان الخطأ 403 (ممنوع) اعرض رسالة مناسبة
    if (error.response?.status === 403) {
      console.error('ليس لديك صلاحية للوصول لهذا المورد');
    }
    
    // إذا كان خطأ في الشبكة
    if (!error.response) {
      console.error('خطأ في الشبكة - تأكد من اتصالك بالإنترنت');
    }
    
    return Promise.reject(error);
  }
);

// دوال مساعدة للطلبات الشائعة
export const apiHelpers = {
  // GET request
  get: (url, config = {}) => api.get(url, config),
  
  // POST request
  post: (url, data = {}, config = {}) => api.post(url, data, config),
  
  // PUT request
  put: (url, data = {}, config = {}) => api.put(url, data, config),
  
  // DELETE request
  delete: (url, config = {}) => api.delete(url, config),
  
  // PATCH request
  patch: (url, data = {}, config = {}) => api.patch(url, data, config),
  
  // رفع ملف
  uploadFile: (url, formData, onUploadProgress = null) => {
    return api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onUploadProgress ? (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onUploadProgress(percentCompleted);
      } : undefined,
    });
  },
  
  // تحميل ملف
  downloadFile: (url, filename = null) => {
    return api.get(url, {
      responseType: 'blob',
    }).then(response => {
      // إنشاء رابط تحميل
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // تحديد اسم الملف
      if (filename) {
        link.download = filename;
      } else {
        // محاولة الحصول على اسم الملف من headers
        const contentDisposition = response.headers['content-disposition'];
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch) {
            link.download = filenameMatch[1];
          }
        }
      }
      
      // تنفيذ التحميل
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      return response;
    });
  }
};

// دوال للتعامل مع الأخطاء
export const errorHelpers = {
  // استخراج رسالة الخطأ
  getErrorMessage: (error) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error.message) {
      return error.message;
    }
    
    return 'حدث خطأ غير متوقع';
  },
  
  // التحقق من نوع الخطأ
  isNetworkError: (error) => !error.response,
  isServerError: (error) => error.response?.status >= 500,
  isClientError: (error) => error.response?.status >= 400 && error.response?.status < 500,
  isUnauthorized: (error) => error.response?.status === 401,
  isForbidden: (error) => error.response?.status === 403,
  isNotFound: (error) => error.response?.status === 404,
  
  // معالجة الأخطاء الشائعة
  handleCommonErrors: (error) => {
    if (errorHelpers.isNetworkError(error)) {
      return 'خطأ في الشبكة - تأكد من اتصالك بالإنترنت';
    }
    
    if (errorHelpers.isUnauthorized(error)) {
      return 'يجب تسجيل الدخول للوصول لهذا المورد';
    }
    
    if (errorHelpers.isForbidden(error)) {
      return 'ليس لديك صلاحية للوصول لهذا المورد';
    }
    
    if (errorHelpers.isNotFound(error)) {
      return 'المورد المطلوب غير موجود';
    }
    
    if (errorHelpers.isServerError(error)) {
      return 'خطأ في الخادم - يرجى المحاولة لاحقاً';
    }
    
    return errorHelpers.getErrorMessage(error);
  }
};

export default api;
