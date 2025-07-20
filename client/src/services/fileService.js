import { apiHelpers } from './api';

const fileService = {
  // الحصول على جميع الملفات مع التصفية والبحث
  getFiles: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiHelpers.get(`/files?${queryString}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // الحصول على ملف واحد
  getFile: async (id) => {
    try {
      const response = await apiHelpers.get(`/files/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // رفع ملف جديد (أدمن فقط)
  uploadFile: async (fileData, onUploadProgress = null) => {
    try {
      const formData = new FormData();
      formData.append('file', fileData.file);
      formData.append('title', fileData.title);
      formData.append('description', fileData.description || '');
      formData.append('subject_id', fileData.subject_id);

      const response = await apiHelpers.uploadFile('/files/upload', formData, onUploadProgress);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // تحديث معلومات الملف (أدمن فقط)
  updateFile: async (id, fileData) => {
    try {
      const response = await apiHelpers.put(`/files/${id}`, fileData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // حذف ملف (أدمن فقط)
  deleteFile: async (id) => {
    try {
      const response = await apiHelpers.delete(`/files/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // تحميل ملف
  downloadFile: async (id, filename = null) => {
    try {
      const response = await apiHelpers.downloadFile(`/files/download/${id}`, filename);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // البحث في الملفات
  searchFiles: async (query, filters = {}) => {
    try {
      const params = {
        search: query,
        ...filters
      };
      return await fileService.getFiles(params);
    } catch (error) {
      throw error;
    }
  },

  // الحصول على الملفات حسب المادة
  getFilesBySubject: async (subjectId, params = {}) => {
    try {
      const queryParams = {
        subject_id: subjectId,
        ...params
      };
      return await fileService.getFiles(queryParams);
    } catch (error) {
      throw error;
    }
  },

  // الحصول على الملفات حسب النوع
  getFilesByType: async (fileType, params = {}) => {
    try {
      const queryParams = {
        file_type: fileType,
        ...params
      };
      return await fileService.getFiles(queryParams);
    } catch (error) {
      throw error;
    }
  },

  // الحصول على أحدث الملفات
  getRecentFiles: async (limit = 10) => {
    try {
      const params = {
        limit: limit,
        sort: 'created_at',
        order: 'desc'
      };
      return await fileService.getFiles(params);
    } catch (error) {
      throw error;
    }
  },

  // الحصول على الملفات الأكثر تحميلاً
  getPopularFiles: async (limit = 10) => {
    try {
      const params = {
        limit: limit,
        sort: 'download_count',
        order: 'desc'
      };
      return await fileService.getFiles(params);
    } catch (error) {
      throw error;
    }
  },

  // الحصول على إحصائيات الملفات (أدمن فقط)
  getFileStats: async () => {
    try {
      const response = await apiHelpers.get('/files/stats/overview');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // الحصول على إحصائيات المعلم
  getTeacherStats: async (subjectId) => {
    try {
      const response = await apiHelpers.get(`/files/stats/teacher/${subjectId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // التحقق من نوع الملف
  getFileType: (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    
    const fileTypes = {
      // مستندات
      pdf: 'PDF',
      doc: 'Word',
      docx: 'Word',
      ppt: 'PowerPoint',
      pptx: 'PowerPoint',
      xls: 'Excel',
      xlsx: 'Excel',
      txt: 'نص',
      
      // صور
      jpg: 'صورة',
      jpeg: 'صورة',
      png: 'صورة',
      gif: 'صورة',
      bmp: 'صورة',
      svg: 'صورة',
      
      // فيديو
      mp4: 'فيديو',
      avi: 'فيديو',
      mov: 'فيديو',
      wmv: 'فيديو',
      flv: 'فيديو',
      mkv: 'فيديو',
      
      // صوت
      mp3: 'صوت',
      wav: 'صوت',
      flac: 'صوت',
      aac: 'صوت',
      
      // أرشيف
      zip: 'أرشيف',
      rar: 'أرشيف',
      '7z': 'أرشيف',
      tar: 'أرشيف'
    };
    
    return fileTypes[extension] || 'ملف';
  },

  // تحويل حجم الملف إلى نص قابل للقراءة
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 بايت';
    
    const k = 1024;
    const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // التحقق من صحة نوع الملف
  isValidFileType: (file) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'video/mp4',
      'video/avi',
      'video/mov',
      'text/plain'
    ];
    
    return allowedTypes.includes(file.type);
  },

  // التحقق من حجم الملف
  isValidFileSize: (file, maxSizeMB = 100) => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }
};

export default fileService;