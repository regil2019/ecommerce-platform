import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import App from './App';
import { ThemeProvider } from './hooks/useTheme';
import { I18nProvider } from './i18n';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ThemeProvider>
    <I18nProvider>
      <App />
    </I18nProvider>
  </ThemeProvider>
);
