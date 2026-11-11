/**
 * Output A routes.
 *  /auth           C1  sign up / log in
 *  /questionnaire  C2  initial questionnaire
 *  /               C4  dashboard
 *  /nutrition      C18 nutrition menu
 *  /fitness        C11 fitness menu
 *  /sleep          C15 sleep menu
 *  /profile        C3  user profile menu (reached from the navigation bar in Output A)
 */
import { Navigate, Route, Routes } from 'react-router';
import { useAppData } from '@shared/data/appData';
import { AppShell } from './layout/AppShell';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { FitnessPage } from './pages/FitnessPage';
import { NutritionPage } from './pages/NutritionPage';
import { ProfilePage } from './pages/ProfilePage';
import { QuestionnairePage } from './pages/QuestionnairePage';
import { SleepPage } from './pages/SleepPage';

/** Sends the visitor to the right step: log in -> questionnaire -> app. */
function Guard({ children, step }: { children: React.ReactNode; step: 'auth' | 'questionnaire' | 'app' }) {
  const { session, user } = useAppData();
  const current = !session ? 'auth' : !user ? 'questionnaire' : 'app';
  if (current === step) return <>{children}</>;
  const to = current === 'auth' ? '/auth' : current === 'questionnaire' ? '/questionnaire' : '/';
  // Status messages survive this redirect: they are queued with queueFlash().
  return <Navigate to={to} replace />;
}

export function App() {
  return (
    <Routes>
      <Route path="/auth" element={<Guard step="auth"><AuthPage /></Guard>} />
      <Route path="/questionnaire" element={<Guard step="questionnaire"><QuestionnairePage /></Guard>} />
      <Route element={<Guard step="app"><AppShell /></Guard>}>
        <Route index element={<DashboardPage />} />
        <Route path="nutrition" element={<NutritionPage />} />
        <Route path="fitness" element={<FitnessPage />} />
        <Route path="sleep" element={<SleepPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
