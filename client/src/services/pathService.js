import apiHelpers from './apiHelpers';

const pathService = {
  // الحصول على جميع المسارات
  getAllPaths: async () => {
    try {
      const response = await apiHelpers.get('/paths');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // الحصول على جميع السيناريوهات مع المواد
  getAllScenarios: async () => {
    try {
      const response = await apiHelpers.get('/scenarios');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // الحصول على السيناريوهات حسب المسار
  getScenariosByPath: async (pathId) => {
    try {
      const response = await apiHelpers.get(`/scenarios/path/${pathId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // الحصول على مسار محدد
  getPath: async (pathId) => {
    try {
      const response = await apiHelpers.get(`/paths/${pathId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // الحصول على سيناريو محدد مع المواد
  getScenario: async (scenarioId) => {
    try {
      const response = await apiHelpers.get(`/scenarios/${scenarioId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // تحديث مسار المستخدم
  updateUserPath: async (userId, pathId, scenarioId) => {
    try {
      const response = await apiHelpers.put(`/users/${userId}/path`, {
        pathId,
        scenarioId
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // الحصول على المواد حسب السيناريو
  getSubjectsByScenario: async (scenarioId) => {
    try {
      const response = await apiHelpers.get(`/scenarios/${scenarioId}/subjects`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // الحصول على إحصائيات المسارات (للأدمن)
  getPathStats: async () => {
    try {
      const response = await apiHelpers.get('/paths/stats');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // إنشاء مسار جديد (للأدمن)
  createPath: async (pathData) => {
    try {
      const response = await apiHelpers.post('/paths', pathData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // تحديث مسار (للأدمن)
  updatePath: async (pathId, pathData) => {
    try {
      const response = await apiHelpers.put(`/paths/${pathId}`, pathData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // حذف مسار (للأدمن)
  deletePath: async (pathId) => {
    try {
      const response = await apiHelpers.delete(`/paths/${pathId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // إنشاء سيناريو جديد (للأدمن)
  createScenario: async (scenarioData) => {
    try {
      const response = await apiHelpers.post('/scenarios', scenarioData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // تحديث سيناريو (للأدمن)
  updateScenario: async (scenarioId, scenarioData) => {
    try {
      const response = await apiHelpers.put(`/scenarios/${scenarioId}`, scenarioData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // حذف سيناريو (للأدمن)
  deleteScenario: async (scenarioId) => {
    try {
      const response = await apiHelpers.delete(`/scenarios/${scenarioId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ربط مواد بسيناريو (للأدمن)
  linkSubjectsToScenario: async (scenarioId, subjectIds) => {
    try {
      const response = await apiHelpers.post(`/scenarios/${scenarioId}/subjects`, {
        subjectIds
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // إلغاء ربط مادة من سيناريو (للأدمن)
  unlinkSubjectFromScenario: async (scenarioId, subjectId) => {
    try {
      const response = await apiHelpers.delete(`/scenarios/${scenarioId}/subjects/${subjectId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // الحصول على المستخدمين حسب المسار
  getUsersByPath: async (pathId) => {
    try {
      const response = await apiHelpers.get(`/paths/${pathId}/users`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // الحصول على المستخدمين حسب السيناريو
  getUsersByScenario: async (scenarioId) => {
    try {
      const response = await apiHelpers.get(`/scenarios/${scenarioId}/users`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // التحقق من صحة اختيار المسار
  validatePathSelection: (pathId, scenarioId) => {
    if (!pathId || !scenarioId) {
      return {
        valid: false,
        message: 'يجب اختيار المسار والسيناريو'
      };
    }

    return {
      valid: true,
      message: 'الاختيار صحيح'
    };
  },

  // الحصول على وصف المسار
  getPathDescription: (pathName) => {
    const descriptions = {
      general: {
        title: 'المسار العام',
        description: 'مسار شامل يغطي المواد الأساسية مع التركيز على العلوم الطبيعية',
        features: [
          'مناسب للطلاب الذين يرغبون في دراسة متوازنة',
          'يؤهل للالتحاق بمعظم التخصصات الجامعية',
          'يركز على المهارات الأساسية في العلوم والرياضيات'
        ]
      },
      advanced: {
        title: 'المسار المتقدم',
        description: 'مسار متخصص للطلاب المتفوقين الذين يسعون للتميز الأكاديمي',
        features: [
          'مناسب للطلاب المتفوقين أكاديمياً',
          'يؤهل للالتحاق بالتخصصات العلمية المتقدمة',
          'يتضمن مواد إضافية ومحتوى متقدم'
        ]
      }
    };

    return descriptions[pathName] || null;
  },

  // الحصول على وصف السيناريو
  getScenarioDescription: (scenarioName) => {
    const descriptions = {
      general_scenario_1: {
        title: 'السيناريو الأول - العام',
        focus: 'التركيز على الكيمياء والأحياء',
        suitableFor: 'الطلاب المهتمين بالعلوم الطبية والحيوية'
      },
      general_scenario_2: {
        title: 'السيناريو الثاني - العام',
        focus: 'التركيز على الفيزياء والكيمياء',
        suitableFor: 'الطلاب المهتمين بالهندسة والعلوم التطبيقية'
      },
      advanced_scenario_1: {
        title: 'السيناريو الأول - المتقدم',
        focus: 'التركيز على الفيزياء والكيمياء المتقدمة',
        suitableFor: 'الطلاب المتفوقين في العلوم الفيزيائية'
      },
      advanced_scenario_2: {
        title: 'السيناريو الثاني - المتقدم',
        focus: 'التركيز الشامل على جميع العلوم',
        suitableFor: 'الطلاب الذين يسعون للتفوق في جميع المجالات العلمية'
      }
    };

    return descriptions[scenarioName] || null;
  }
};

export default pathService;