/**
 * Output C – final interactive prototype. Same code base as Output A and B;
 * the iteration settings (packages/core/src/iteration.ts) select the C features.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ITERATIONS } from '@core';
import { WellnessApp } from '@screens/App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WellnessApp iteration={ITERATIONS.C} />
  </StrictMode>,
);
