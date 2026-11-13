import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.jsx';
import { DashboardProvider } from './state/DashboardProvider.jsx';
import './styles/index.css';

// Paint the system theme before React mounts so there is no flash of the
// wrong palette while stored settings are being read.
document.documentElement.dataset.theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DashboardProvider>
      <App />
    </DashboardProvider>
  </React.StrictMode>,
);
