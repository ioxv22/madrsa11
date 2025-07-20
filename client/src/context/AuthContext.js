import React, { createContext, useContext, useReducer, useEffect } from 'react';

// إنشاء السياق
const AuthContext = createContext();

// الحالات الأولية
const initialState = {
  user: null,
  token: null,
  loading: true,
  error: null
};

// أنواع الإجراءات
const actionTypes = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER'
};

// المخفض (Reducer)
function authReducer(state, action) {
  switch (action.type) {
    case actionTypes.LOGIN_START:
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case actionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null
      };
    
    case actionTypes.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: action.payload
      };
    
    case actionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: null
      };
    
    case actionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    
    case actionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    
    case actionTypes.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    
    default:
      return state;
  }
}

// مزود السياق
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // تسجيل الدخول
  const login = (user, token) => {
    localStorage.setItem('token', token);
    dispatch({
      type: actionTypes.LOGIN_SUCCESS,
      payload: { user, token }
    });
  };

  // تسجيل الخروج
  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: actionTypes.LOGOUT });
  };

  // بدء تسجيل الدخول
  const loginStart = () => {
    dispatch({ type: actionTypes.LOGIN_START });
  };

  // فشل تسجيل الدخول
  const loginFailure = (error) => {
    dispatch({
      type: actionTypes.LOGIN_FAILURE,
      payload: error
    });
  };

  // تعيين حالة التحميل
  const setLoading = (loading) => {
    dispatch({
      type: actionTypes.SET_LOADING,
      payload: loading
    });
  };

  // مسح الخطأ
  const clearError = () => {
    dispatch({ type: actionTypes.CLEAR_ERROR });
  };

  // تحديث معلومات المستخدم
  const updateUser = (userData) => {
    dispatch({
      type: actionTypes.UPDATE_USER,
      payload: userData
    });
  };

  // التحقق من التوكن عند تحميل التطبيق
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // يمكن إضافة التحقق من صحة التوكن هنا
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const value = {
    user: state.user,
    token: state.token,
    loading: state.loading,
    error: state.error,
    login,
    logout,
    loginStart,
    loginFailure,
    setLoading,
    clearError,
    updateUser,
    isAuthenticated: !!state.user,
    isAdmin: state.user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// خطاف لاستخدام السياق
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;