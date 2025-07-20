import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// إخفاء شاشة التحميل
const loadingElement = document.getElementById('loading');
if (loadingElement) {
  setTimeout(() => {
    loadingElement.style.opacity = '0';
    setTimeout(() => {
      loadingElement.style.display = 'none';
    }, 300);
  }, 500);
}