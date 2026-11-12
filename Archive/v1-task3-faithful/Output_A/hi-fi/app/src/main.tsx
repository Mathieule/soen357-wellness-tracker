import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router';
import { AppDataProvider } from '@shared/data/appData';
import { App } from './App';
import './index.css';

/** Storage prefix: keeps Output A data separate from the other iterations. */
const STORAGE_PREFIX = 'wellness-output-a';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppDataProvider prefix={STORAGE_PREFIX}>
      <HashRouter>
        <App />
      </HashRouter>
    </AppDataProvider>
  </StrictMode>,
);
