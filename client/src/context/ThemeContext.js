import React, { createContext, useContext, useState, useEffect } from 'react';

// إنشاء السياق
const ThemeContext = createContext();

// مزود السياق
export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    // التحقق من الإعداد المحفوظ في localStorage
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      return JSON.parse(savedTheme);
    }
    
    // التحقق من إعدادات النظام
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return true;
    }
    
    return false;
  });

  // تبديل الوضع
  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem('darkMode', JSON.stringify(newMode));
      return newMode;
    });
  };

  // تعيين الوضع
  const setTheme = (isDark) => {
    setDarkMode(isDark);
    localStorage.setItem('darkMode', JSON.stringify(isDark));
  };

  // مراقبة تغييرات إعدادات النظام
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // تطبيق إعدادات النظام فقط إذا لم يكن هناك إعداد محفوظ
      const savedTheme = localStorage.getItem('darkMode');
      if (savedTheme === null) {
        setDarkMode(e.matches);
      }
    };

    mediaQuery.addListener(handleChange);
    
    return () => {
      mediaQuery.removeListener(handleChange);
    };
  }, []);

  const value = {
    darkMode,
    toggleDarkMode,
    setTheme,
    theme: darkMode ? 'dark' : 'light'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// خطاف لاستخدام السياق
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeContext;