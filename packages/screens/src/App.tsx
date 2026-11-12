/**
 * Wellness Tracker app (Output A, B or C, chosen by the `iteration` settings).
 * Routes: /auth (C1) → /onboarding (C2) → / dashboard (C4), /fitness (C11),
 * /nutrition (C18), /sleep (C15), /settings (C3).
 */
import { useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router';
import { StoreProvider, useStore, type Iteration } from '@core';
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

/** Output C accessibility mode: large font and interface elements, bold labels. */
function LargeTextMode() {
  const { user, iteration } = useStore();
  const on = iteration.largeTextMode && !!user?.profile.largeText;
  useEffect(() => {
    document.documentElement.classList.toggle('large-ui', on);
  }, [on]);
  return null;
}

function SleepRoute() {
  const { iteration } = useStore();
  return iteration.sleep ? <SleepScreen /> : <Navigate to="/" replace />;
}

export function WellnessApp({ iteration }: { iteration: Iteration }) {
  return (
    <StoreProvider iteration={iteration}>
      <ToastProvider>
        <LargeTextMode />
        <HashRouter>
          <Routes>
            <Route path="/auth" element={<Guard step="auth"><AuthScreen /></Guard>} />
            <Route path="/onboarding" element={<Guard step="onboarding"><Onboarding /></Guard>} />
            <Route element={<Guard step="app"><AppShell /></Guard>}>
              <Route index element={<Dashboard />} />
              <Route path="fitness" element={<FitnessScreen />} />
              <Route path="nutrition" element={<NutritionScreen />} />
              <Route path="sleep" element={<SleepRoute />} />
              <Route path="settings" element={<SettingsScreen />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </ToastProvider>
    </StoreProvider>
  );
}
