/**
 * Output A – Wellness Tracker. Same code base as Output C; the iteration
 * settings (packages/core/src/iteration.ts) select the Output A features.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ITERATIONS } from '@core';
import { WellnessApp } from '@screens/App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WellnessApp iteration={ITERATIONS.A} />
  </StrictMode>,
);
