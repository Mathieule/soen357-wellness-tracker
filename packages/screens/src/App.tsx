/**
 * Wellness Tracker app (Output C).
 * Routes: /auth (C1) → /onboarding (C2) → / dashboard (C4), /fitness (C11),
 * /nutrition (C18), /sleep (C15), /settings (C3).
 */
import { HashRouter, Navigate, Route, Routes } from 'react-router';
import { StoreProvider, useStore } from '@core';
import { ToastProvider } from '@ds';
import { AuthScreen } from './auth/AuthScreen';
import { Dashboard } from './dashboard/Dashboard';
import { FitnessScreen } from './fitness/FitnessScreen';
import { AppShell } from './layout/AppShell';
import { NutritionScreen } from './nutrition/NutritionScreen';
import { Onboarding } from './onboarding/Onboarding';
import { SettingsScreen } from './settings/SettingsScreen';
import { SleepScreen } from './sleep/SleepScreen';

function Guard({ step, children }: { step: 'auth' | 'onboarding' | 'app'; children: React.ReactNode }) {
  const { session, user } = useStore();
  const current = !session ? 'auth' : !user ? 'onboarding' : 'app';
  if (current === step) return <>{children}</>;
  return <Navigate to={current === 'auth' ? '/auth' : current === 'onboarding' ? '/onboarding' : '/'} replace />;
}

export function WellnessApp({ storagePrefix }: { storagePrefix: string }) {
  return (
    <StoreProvider prefix={storagePrefix}>
      <ToastProvider>
        <HashRouter>
          <Routes>
            <Route path="/auth" element={<Guard step="auth"><AuthScreen /></Guard>} />
            <Route path="/onboarding" element={<Guard step="onboarding"><Onboarding /></Guard>} />
            <Route element={<Guard step="app"><AppShell /></Guard>}>
              <Route index element={<Dashboard />} />
              <Route path="fitness" element={<FitnessScreen />} />
              <Route path="nutrition" element={<NutritionScreen />} />
              <Route path="sleep" element={<SleepScreen />} />
              <Route path="settings" element={<SettingsScreen />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </ToastProvider>
    </StoreProvider>
  );
}
