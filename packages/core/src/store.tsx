/**
 * Prototype "backend": accounts, session and user data in localStorage.
 *
 * SIMULATED: no server, no password hashing, no real authentication.
 * Three demo accounts exist from the start (one per experience); accounts
 * created in the prototype start empty. Every action returns enough
 * information for the screen to show a precise success or error message.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { buildExperience, type Experience } from './experience';
import type { Iteration } from './iteration';
import { defaultTrainingDays } from './program';
import { defaultGoals, demoUsers, newProfile, sampleHistory, uid } from './sample';
import { connectDevice as simConnect, syncNow as simSync } from './sim/device';
import { createStorage } from './storage';
import type { Account, Meal, ModuleId, OnboardingAnswers, Profile, Rating, SleepSession, UserData, Workout } from './types';

export type Result = { ok: true } | { ok: false; error: string };
export type SyncState = { state: 'idle' | 'syncing' | 'synced' | 'failed'; at?: string; error?: string };

interface Store {
  iteration: Iteration;
  session: string | null;
  user: UserData | null;
  experience: Experience | null;
  sync: SyncState;
  failNextSync: boolean;
  setFailNextSync(v: boolean): void;
  signUp(email: string, password: string): Result;
  logIn(email: string, password: string): Result;
  logOut(): void;
  completeOnboarding(a: OnboardingAnswers): void;
  updateProfile(changes: Partial<Profile>): void;
  setDashboard(modules: ModuleId[] | null): void;
  saveWorkout(w: Omit<Workout, 'id'> & { id?: string }): 'added' | 'updated';
  deleteWorkout(id: string): Workout | undefined;
  restoreWorkout(w: Workout): void;
  saveSleep(s: Omit<SleepSession, 'id'>): 'added' | 'updated';
  deleteSleep(id: string): void;
  saveMeal(m: Omit<Meal, 'id'> & { id?: string }): 'added' | 'updated';
  deleteMeal(id: string): Meal | undefined;
  restoreMeal(m: Meal): void;
  rate(r: Omit<Rating, 'date'>): void;
  connectDevice(name: string): Promise<Result>;
  disconnectDevice(): void;
  syncNow(): Promise<Result>;
  loadSampleData(): void;
  deleteAccount(): void;
  resetPrototype(): void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ iteration, children }: { iteration: Iteration; children: ReactNode }) {
  const prefix = iteration.storagePrefix;
  const store = useMemo(() => createStorage(prefix), [prefix]);
  const seed = useMemo(() => demoUsers(), []);
  const [accounts, setAccounts] = useState<Account[]>(() => store.get('accounts', seed.accounts));
  const [users, setUsers] = useState<Record<string, UserData>>(() => store.get('users', seed.users));
  const [session, setSession] = useState<string | null>(() => store.get('session', null));
  const [failNextSync, setFail] = useState<boolean>(() => store.get('failNextSync', false));
  const [sync, setSync] = useState<SyncState>({ state: 'idle' });

  // Keep a ref so async actions always write the latest users map.
  const usersRef = useRef(users);
  usersRef.current = users;

  const saveUsers = useCallback((u: Record<string, UserData>) => {
    usersRef.current = u;
    setUsers(u);
    store.set('users', u);
  }, [store]);
  const saveAccounts = (a: Account[]) => (setAccounts(a), store.set('accounts', a));
  const saveSession = (s: string | null) => (setSession(s), store.set('session', s));

  const mutate = useCallback(
    (fn: (u: UserData) => UserData) => {
      const s = session;
      const all = usersRef.current;
      if (!s || !all[s]) return;
      saveUsers({ ...all, [s]: fn(all[s]) });
    },
    [session, saveUsers],
  );

  const user = session ? (users[session] ?? null) : null;
  const experience = useMemo(() => (user ? buildExperience(user.profile, iteration) : null), [user, iteration]);

  const runSync = useCallback(async (): Promise<Result> => {
    setSync({ state: 'syncing' });
    try {
      await simSync(failNextSync);
      const at = new Date().toISOString();
      setSync({ state: 'synced', at });
      return { ok: true };
    } catch (e) {
      const error = (e as Error).message;
      setSync({ state: 'failed', error });
      return { ok: false, error };
    }
  }, [failNextSync]);

  // T2 / T3 flows (Output C, with a device): after log in, check the data synchronization status.
  useEffect(() => {
    if (iteration.device && session && users[session]) void runSync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const value: Store = {
    iteration,
    session,
    user,
    experience,
    sync,
    failNextSync,
    setFailNextSync(v) {
      setFail(v);
      store.set('failNextSync', v);
    },

    signUp(email, password) {
      const e = email.trim().toLowerCase();
      if (accounts.some((a) => a.email === e)) return { ok: false, error: 'An account with this email already exists. Log in instead, or use another email.' };
      saveAccounts([...accounts, { email: e, password }]);
      saveSession(e);
      return { ok: true };
    },

    logIn(email, password) {
      const e = email.trim().toLowerCase();
      const acc = accounts.find((a) => a.email === e);
      if (!acc || acc.password !== password) return { ok: false, error: 'The email or password is incorrect. Check both and try again.' };
      saveSession(e);
      return { ok: true };
    },

    logOut() {
      setSync({ state: 'idle' });
      saveSession(null);
    },

    completeOnboarding(a) {
      if (!session) return;
      // Short questionnaire (A/B) only asks persona + fitness goals: the rest comes from the persona.
      const byPersona = { casual: { level: 'beginner', sessions: 2 }, training: { level: 'regular', sessions: 4 }, performance: { level: 'athlete', sessions: 5 } } as const;
      const fromEmail = session.split('@')[0].replace(/[._-]+/g, ' ');
      const profile = newProfile({
        name: a.name?.trim() || fromEmail.charAt(0).toUpperCase() + fromEmail.slice(1),
        email: session,
        experience: a.experience,
        level: a.level ?? byPersona[a.experience].level,
        sessionsPerWeek: a.sessionsPerWeek ?? byPersona[a.experience].sessions,
        interests: a.interests ?? (iteration.sleep ? ['fitness', 'nutrition', 'sleep'] : ['fitness', 'nutrition']),
        fitnessGoals: a.fitnessGoals,
      });
      profile.largeText = a.largeText;
      // Output C: new accounts start EMPTY (designed empty states). A/B: sample history so every screen can be explored.
      const data = iteration.emptyAccounts ? { workouts: [], activity: [], meals: [], sleep: [] } : sampleHistory(profile, 61);
      saveUsers({ ...usersRef.current, [session]: { profile, ...data } });
    },

    updateProfile(changes) {
      mutate((u) => {
        const next = { ...u.profile, ...changes };
        if (changes.sessionsPerWeek !== undefined && !changes.trainingDays) next.trainingDays = defaultTrainingDays(changes.sessionsPerWeek);
        // A new experience or level gets the matching default goals and dashboard.
        if ((changes.experience && changes.experience !== u.profile.experience) || (changes.level && changes.level !== u.profile.level)) {
          next.goals = defaultGoals(next.experience, next.level, next.weightKg, next.fitnessGoals);
          if (changes.experience && changes.experience !== u.profile.experience) next.dashboard = null;
        }
        return { ...u, profile: next };
      });
    },

    setDashboard(modules) {
      mutate((u) => ({ ...u, profile: { ...u.profile, dashboard: modules } }));
    },

    saveWorkout(w) {
      const exists = !!w.id && !!user?.workouts.some((x) => x.id === w.id);
      mutate((u) => ({ ...u, workouts: exists ? u.workouts.map((x) => (x.id === w.id ? ({ ...w, id: w.id } as Workout) : x)) : [{ ...w, id: uid('w') } as Workout, ...u.workouts] }));
      return exists ? 'updated' : 'added';
    },
    deleteWorkout(id) {
      const w = user?.workouts.find((x) => x.id === id);
      mutate((u) => ({ ...u, workouts: u.workouts.filter((x) => x.id !== id) }));
      return w;
    },
    restoreWorkout(w) {
      mutate((u) => ({ ...u, workouts: [w, ...u.workouts] }));
    },

    saveSleep(s) {
      const exists = !!user?.sleep.some((x) => x.date === s.date);
      mutate((u) => ({ ...u, sleep: [...u.sleep.filter((x) => x.date !== s.date), { ...s, id: uid('s') }] }));
      return exists ? 'updated' : 'added';
    },
    deleteSleep(id) {
      mutate((u) => ({ ...u, sleep: u.sleep.filter((x) => x.id !== id) }));
    },

    saveMeal(m) {
      const exists = !!m.id && !!user?.meals.some((x) => x.id === m.id);
      mutate((u) => ({ ...u, meals: exists ? u.meals.map((x) => (x.id === m.id ? ({ ...m, id: m.id } as Meal) : x)) : [{ ...m, id: uid('m') } as Meal, ...u.meals] }));
      return exists ? 'updated' : 'added';
    },
    deleteMeal(id) {
      const m = user?.meals.find((x) => x.id === id);
      mutate((u) => ({ ...u, meals: u.meals.filter((x) => x.id !== id) }));
      return m;
    },
    restoreMeal(m) {
      mutate((u) => ({ ...u, meals: [m, ...u.meals] }));
    },

    rate(r) {
      mutate((u) => ({ ...u, profile: { ...u.profile, ratings: [...u.profile.ratings, { ...r, date: new Date().toISOString() }] } }));
    },

    async connectDevice(name) {
      try {
        const res = await simConnect(name);
        const now = new Date().toISOString();
        mutate((u) => {
          const byDate = new Map(u.activity.map((a) => [a.date, a]));
          res.activity.forEach((a) => byDate.set(a.date, a));
          return { ...u, activity: [...byDate.values()], profile: { ...u.profile, device: { name: res.name, connectedAt: now, lastSync: now } } };
        });
        setSync({ state: 'synced', at: now });
        return { ok: true };
      } catch {
        return { ok: false, error: 'The device could not be connected. Try again.' };
      }
    },
    disconnectDevice() {
      mutate((u) => ({ ...u, profile: { ...u.profile, device: undefined } }));
    },
    syncNow: runSync,

    loadSampleData() {
      mutate((u) => ({ ...u, ...sampleHistory(u.profile, 51) }));
    },

    deleteAccount() {
      if (!session) return;
      const rest = { ...usersRef.current };
      delete rest[session];
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

export function useStore(): Store {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore must be used inside <StoreProvider>');
  return v;
}

/** For signed-in, onboarded screens: user and experience are guaranteed. */
export function useUser() {
  const s = useStore();
  if (!s.user || !s.experience) throw new Error('useUser requires a completed profile');
  return { ...s, user: s.user, experience: s.experience };
}
