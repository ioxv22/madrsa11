import { apiHelpers } from './api';

const subjectService = {
  // الحصول على جميع المواد
  getAllSubjects: async () => {
    try {
      const response = await apiHelpers.get('/subjects');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // الحصول على مادة واحدة
  getSubject: async (id) => {
    try {
      const response = await apiHelpers.get(`/subjects/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // إضافة مادة جديدة (أدمن فقط)
  createSubject: async (subjectData) => {
    try {
      const response = await apiHelpers.post('/subjects', subjectData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // تحديث مادة (أدمن فقط)
  updateSubject: async (id, subjectData) => {
    try {
      const response = await apiHelpers.put(`/subjects/${id}`, subjectData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // حذف مادة (أدمن فقط)
  deleteSubject: async (id) => {
    try {
      const response = await apiHelpers.delete(`/subjects/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // الحصول على إحصائيات المواد (أدمن فقط)
  getSubjectStats: async () => {
    try {
      const response = await apiHelpers.get('/subjects/stats/overview');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // البحث في المواد
  searchSubjects: async (query) => {
    try {
      const response = await apiHelpers.get(`/subjects?search=${encodeURIComponent(query)}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // الحصول على المواد مع عدد الملفات
  getSubjectsWithFileCount: async () => {
    try {
      const response = await apiHelpers.get('/subjects?include_file_count=true');
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default subjectService;