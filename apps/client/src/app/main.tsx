import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './global.css';

const storedTheme = localStorage.getItem('team-task-manager-theme');
document.documentElement.dataset.theme = storedTheme === 'dark' ? 'dark' : 'light';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
