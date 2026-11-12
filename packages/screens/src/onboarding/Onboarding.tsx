/**
 * C2 Initial questionnaire (T1). One question per page, progress bar, Back /
 * Next. Focus moves to the first answer of each question. Next with no answer
 * shows an error that says what to do. Questions:
 *   1 name · 2 goal (sets the experience: Casual / Training / Performance)
 *   3 level (sedentary → experienced) · 4 sessions per week (0–7, builds the
 *   plan) · 5 data that matters (at least one) · 6 preview of "your
 *   experience" before creating the dashboard.
 */
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { buildExperience, defaultTrainingDays, DAY_SHORT, EXPERIENCE_INFO, LEVEL_LABEL, MODULE_INFO, useStore, type ExperienceId, type Level, type MetricId, type Profile } from '@core';
import { Button, CategoryBadge, ChoiceCards, InlineStatus, Stepper, TextField, useToast } from '@ds';
import { Activity, Gauge, HeartPulse, Sofa, Footprints, Trophy, Dumbbell } from 'lucide-react';

const STEPS = ['name', 'goal', 'level', 'sessions', 'interests', 'preview'] as const;
type Step = (typeof STEPS)[number];

const icon = (I: typeof Activity) => (
  <span className="flex size-11 items-center justify-center rounded-full bg-sunken">
    <I className="size-6" />
  </span>
);

export function Onboarding() {
  const { completeOnboarding, session } = useStore();
  const toast = useToast();
  const navigate = useNavigate();
  const [i, setI] = useState(0);
  const [name, setName] = useState('');
  const [experience, setExperience] = useState<ExperienceId[]>([]);
  const [level, setLevel] = useState<Level[]>([]);
  const [sessions, setSessions] = useState(3);
  const [interests, setInterests] = useState<MetricId[]>([]);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const step: Step = STEPS[i];

  useEffect(() => {
    formRef.current?.querySelector<HTMLElement>('input, button')?.focus();
    document.title = `Set up ${i + 1} of ${STEPS.length} · Wellness Tracker`;
  }, [i]);

  const validate = (): string | null => {
    if (step === 'name' && !name.trim()) return 'Enter your first name so we can greet you.';
    if (step === 'goal' && !experience.length) return 'Choose what brings you here to continue.';
    if (step === 'level' && !level.length) return 'Choose the level that fits you best to continue.';
    if (step === 'interests' && !interests.length) return 'Choose at least one type of data to create your dashboard.';
    return null;
  };

  const next = () => {
    const e = validate();
    setError(e);
    if (e) return;
    if (step !== 'preview') return setI(i + 1);
    completeOnboarding({ name, experience: experience[0], level: level[0], sessionsPerWeek: sessions, interests: (['fitness', 'nutrition', 'sleep'] as MetricId[]).filter((m) => interests.includes(m)) });
    toast('success', 'Your profile is saved and your dashboard is ready.');
    navigate('/');
  };

  const previewProfile: Profile | null =
    experience[0] && level[0]
      ? { name, email: session ?? '', experience: experience[0], level: level[0], sessionsPerWeek: sessions, trainingDays: defaultTrainingDays(sessions), interests: interests.length ? interests : ['fitness'], dashboard: null, ratings: [], goals: { steps: 0, activeMin: 0, calories: 0, proteinG: 0, carbsG: 0, fatG: 0, sleepMin: 480 } }
      : null;

  return (
    <main className="mx-auto flex min-h-dvh max-w-[520px] flex-col px-5 pb-8 pt-[max(24px,env(safe-area-inset-top))]">
      <p className="m-0 text-ink-soft">
        Set up · {i + 1} of {STEPS.length}
      </p>
      <div role="progressbar" aria-label="Setup progress" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={i + 1} className="mt-3 flex gap-1.5">
        {STEPS.map((s, k) => (
          <span key={s} className={`h-1.5 flex-1 rounded-full ${k <= i ? 'bg-ink' : 'bg-surface'}`} />
        ))}
      </div>

      <form
        ref={formRef}
        noValidate
        className="anim-rise mt-8 flex flex-1 flex-col"
        key={step}
        onSubmit={(e) => {
          e.preventDefault();
          next();
        }}
      >
        {step === 'name' && (
          <>
            <h1 className="m-0 text-3xl font-bold">Welcome. What should we call you?</h1>
            <p className="m-0 mb-6 mt-2 text-ink-soft">Your first name is enough.</p>
            <TextField label="First name" autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} error={error ?? undefined} />
          </>
        )}
        {step === 'goal' && (
          <ChoiceCards
            name="goal"
            legend={<span className="text-3xl">What brings you here?</span>}
            hint="This shapes your dashboard. You can change it later in Settings."
            value={experience}
            onChange={(v) => (setExperience(v), setError(null))}
            choices={[
              { value: 'casual', label: EXPERIENCE_INFO.casual.tagline, description: 'Simple daily view, no advanced numbers', icon: icon(Footprints) },
              { value: 'training', label: EXPERIENCE_INFO.training.tagline, description: 'Weekly plan, sessions and progress', icon: icon(Dumbbell) },
              { value: 'performance', label: EXPERIENCE_INFO.performance.tagline, description: 'Detailed load, recovery and nutrition', icon: icon(Trophy) },
            ]}
            error={error ?? undefined}
          />
        )}
        {step === 'level' && (
          <ChoiceCards
            name="level"
            legend={<span className="text-3xl">How active are you today?</span>}
            hint="We use this to set the length and difficulty of your sessions."
            value={level}
            onChange={(v) => (setLevel(v), setError(null))}
            choices={[
              { value: 'sedentary', label: LEVEL_LABEL.sedentary, description: 'I rarely exercise', icon: icon(Sofa) },
              { value: 'beginner', label: LEVEL_LABEL.beginner, description: 'I am starting or restarting', icon: icon(Activity) },
              { value: 'regular', label: LEVEL_LABEL.regular, description: 'I exercise most weeks', icon: icon(HeartPulse) },
              { value: 'athlete', label: LEVEL_LABEL.athlete, description: 'I train hard and often', icon: icon(Gauge) },
            ]}
            error={error ?? undefined}
          />
        )}
        {step === 'sessions' && (
          <>
            <h1 className="m-0 text-3xl font-bold">How many sessions per week?</h1>
            <p className="m-0 mb-6 mt-2 text-ink-soft">Your weekly plan will have this many sessions. Zero is fine: we will focus on daily movement.</p>
            <Stepper label="Sessions per week" value={sessions} onChange={setSessions} min={0} max={7} />
            <div className="card mt-6 p-4" aria-live="polite">
              <p className="m-0 mb-3 font-bold">Your week</p>
              <ul className="m-0 grid list-none grid-cols-7 gap-1 p-0">
                {DAY_SHORT.map((d, k) => {
                  const on = defaultTrainingDays(sessions).includes(k);
                  return (
                    <li key={d} className="flex flex-col items-center gap-2">
                      <span className="text-ink-soft">{d}</span>
                      <span aria-hidden="true" className={`size-9 rounded-full ${on ? 'bg-act' : 'bg-sunken'}`} />
                      <span className="sr-only">{on ? 'training' : 'rest'}</span>
                    </li>
                  );
                })}
              </ul>
              <p className="m-0 mt-3 text-ink-soft">
                {sessions === 0 ? 'No planned sessions.' : `${sessions} session${sessions > 1 ? 's' : ''}, rest days in between. You can move them later.`}
              </p>
            </div>
          </>
        )}
        {step === 'interests' && (
          <ChoiceCards
            name="interests"
            multiple
            legend={<span className="text-3xl">What data matters to you?</span>}
            hint="Choose at least one. These get a tab and a place on your dashboard."
            value={interests}
            onChange={(v) => (setInterests(v), setError(null))}
            choices={[
              { value: 'fitness', label: 'Training and activity', description: 'Workouts, steps, active minutes', icon: <CategoryBadge category="fitness" size={44} /> },
              { value: 'nutrition', label: 'Nutrition', description: 'Calories, meals and macros', icon: <CategoryBadge category="nutrition" size={44} /> },
              { value: 'sleep', label: 'Sleep', description: 'Sleep time and sleep stages', icon: <CategoryBadge category="sleep" size={44} /> },
            ]}
            error={error ?? undefined}
          />
        )}
        {step === 'preview' && previewProfile && <Preview profile={previewProfile} />}

        {error && step !== 'goal' && step !== 'level' && step !== 'interests' && step !== 'name' && <InlineStatus kind="error" className="mt-4">{error}</InlineStatus>}

        <div className="mt-auto flex gap-3 pt-10">
          {i > 0 && (
            <Button variant="secondary" size="lg" onClick={() => (setError(null), setI(i - 1))}>
              Back
            </Button>
          )}
          <Button type="submit" size="lg" className="flex-1">
            {step === 'preview' ? 'Create my dashboard' : 'Continue'}
          </Button>
        </div>
      </form>
    </main>
  );
}

function Preview({ profile }: { profile: Profile }) {
  const e = buildExperience(profile);
  return (
    <>
      <h1 className="m-0 text-3xl font-bold">Your experience: {e.name}</h1>
      <p className="m-0 mt-2 text-ink-soft">{EXPERIENCE_INFO[e.id].description}</p>
      <div className="card mt-6 p-5">
        <h2 className="m-0 text-lg font-bold">Your dashboard will show</h2>
        <ol className="m-0 mt-3 grid list-none gap-2 p-0">
          {e.modules.map((m, k) => (
            <li key={m} className="flex items-center gap-3">
              <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-full bg-sunken font-bold">
                {k + 1}
              </span>
              <span>
                <strong>{MODULE_INFO[m].name}</strong> · {MODULE_INFO[m].description}
              </span>
            </li>
          ))}
        </ol>
      </div>
      <div className="card mt-4 p-5">
        <h2 className="m-0 text-lg font-bold">Your plan</h2>
        <p className="m-0 mt-2">
          {profile.sessionsPerWeek} session{profile.sessionsPerWeek === 1 ? '' : 's'} a week · {LEVEL_LABEL[profile.level]} level
        </p>
        <p className="m-0 mt-1 text-ink-soft">Tabs: {e.nav.map((n) => (n === 'fitness' ? e.fitnessLabel : n[0].toUpperCase() + n.slice(1))).join(', ')}</p>
      </div>
      <p className="m-0 mt-4 text-ink-soft">Your account starts empty: add your first workout, meal or night of sleep, or connect a device (simulated) in Settings.</p>
    </>
  );
}
