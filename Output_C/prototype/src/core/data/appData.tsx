/**
 * Prototype "backend": accounts, session and user data kept in localStorage.
 *
 * SIMULATED: there is no server, no password hashing and no real
 * authentication. One demo account exists from the start
 * (demo@example.com / Demo1234) so reviewers can test login, wrong
 * credentials and "email already used".
 */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { createStorage } from '../lib/storage';
import { DEMO_ACCOUNT, DEMO_PROFILE, defaultGoals, seedUserData, uid } from './sample';
import type { Account, Frequency, Meal, MetricId, Persona, Profile, SleepSession, UserData, Workout } from './types';

export type Result = { ok: true } | { ok: false; error: string };

export interface QuestionnaireAnswers {
  frequency: Frequency;
  persona: Persona;
  metrics: MetricId[];
}

interface AppDataValue {
  /** Email of the signed-in account, or null. */
  session: string | null;
  /** Data of the signed-in user, or null if the questionnaire is not done yet. */
  user: UserData | null;
  signUp(email: string, password: string): Result;
  logIn(email: string, password: string): Result;
  logOut(): void;
  completeQuestionnaire(answers: QuestionnaireAnswers): void;
  updateProfile(changes: Partial<Profile>): void;
  addWorkout(w: Omit<Workout, 'id'>): void;
  /** Adds a sleep session, or replaces the one already stored for the same date. */
  saveSleep(s: Omit<SleepSession, 'id'>): 'added' | 'updated';
  addMeal(m: Omit<Meal, 'id'>): void;
  deleteAccount(): void;
  resetPrototype(): void;
}

const Ctx = createContext<AppDataValue | null>(null);

export function AppDataProvider({ prefix, children }: { prefix: string; children: ReactNode }) {
  const store = useMemo(() => createStorage(prefix), [prefix]);

  const [accounts, setAccounts] = useState<Account[]>(() => store.get('accounts', [DEMO_ACCOUNT]));
  const [users, setUsers] = useState<Record<string, UserData>>(() =>
    store.get('users', { [DEMO_ACCOUNT.email]: seedUserData(DEMO_PROFILE) }),
  );
  const [session, setSession] = useState<string | null>(() => store.get('session', null));

  const saveAccounts = (a: Account[]) => (setAccounts(a), store.set('accounts', a));
  const saveUsers = (u: Record<string, UserData>) => (setUsers(u), store.set('users', u));
  const saveSession = (s: string | null) => (setSession(s), store.set('session', s));

  /** Applies a change to the signed-in user's data and persists it. */
  const mutate = useCallback(
    (fn: (u: UserData) => UserData) => {
      if (!session || !users[session]) return;
      saveUsers({ ...users, [session]: fn(users[session]) });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session, users],
  );

  const value: AppDataValue = {
    session,
    user: session ? (users[session] ?? null) : null,

    signUp(email, password) {
      const e = email.trim().toLowerCase();
      if (accounts.some((a) => a.email === e)) {
        return { ok: false, error: 'An account with this email already exists. Log in instead.' };
      }
      saveAccounts([...accounts, { email: e, password }]);
      saveSession(e);
      return { ok: true };
    },

    logIn(email, password) {
      const e = email.trim().toLowerCase();
      const acc = accounts.find((a) => a.email === e);
      if (!acc || acc.password !== password) {
        return { ok: false, error: 'The email or password is incorrect. Check them and try again.' };
      }
      saveSession(e);
      return { ok: true };
    },

    logOut: () => saveSession(null),

    completeQuestionnaire({ frequency, persona, metrics }) {
      if (!session) return;
      const name = session.split('@')[0].replace(/[._-]+/g, ' ');
      const profile: Profile = {
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email: session,
        frequency,
        persona,
        metrics,
      };
      // Sample history is pre-filled so a new account can explore every screen.
      saveUsers({ ...users, [session]: seedUserData(profile) });
    },

    updateProfile(changes) {
      mutate((u) => {
        const profile = { ...u.profile, ...changes };
        const goals = changes.persona && changes.persona !== u.profile.persona ? defaultGoals(changes.persona) : u.goals;
        return { ...u, profile, goals };
      });
    },

    addWorkout(w) {
      mutate((u) => ({ ...u, workouts: [{ ...w, id: uid('w') }, ...u.workouts] }));
    },

    saveSleep(s) {
      const exists = !!users[session ?? '']?.sleep.some((x) => x.date === s.date);
      mutate((u) => {
        const others = u.sleep.filter((x) => x.date !== s.date);
        const next = [...others, { ...s, id: uid('s') }].sort((a, b) => b.date.localeCompare(a.date));
        return { ...u, sleep: next };
      });
      return exists ? 'updated' : 'added';
    },

    addMeal(m) {
      mutate((u) => ({ ...u, meals: [{ ...m, id: uid('m') }, ...u.meals] }));
    },

    deleteAccount() {
      if (!session) return;
      const { [session]: _removed, ...rest } = users;
      void _removed;
      saveUsers(rest);
      saveAccounts(accounts.filter((a) => a.email !== session));
      saveSession(null);
    },

    resetPrototype() {
      store.clearAll();
      window.location.reload();
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppData(): AppDataValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAppData must be used inside <AppDataProvider>');
  return v;
}

/** Same as useAppData but guarantees a completed profile (used inside signed-in pages). */
export function useUser() {
  const app = useAppData();
  if (!app.user) throw new Error('useUser called without a completed profile');
  return { ...app, user: app.user };
}
