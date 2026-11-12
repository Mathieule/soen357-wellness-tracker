/**
 * Output C – final interactive prototype.
 * Everything lives in the shared packages; this entry only picks the storage
 * key so Output C data never mixes with other iterations.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { WellnessApp } from '@screens/App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WellnessApp storagePrefix="wellness-output-c" />
  </StrictMode>,
);
