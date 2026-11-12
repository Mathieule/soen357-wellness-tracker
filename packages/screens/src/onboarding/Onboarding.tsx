/**
 * C2 Initial questionnaire (T1).
 * Task 2 rules: one question per page; the next question is shown after the
 * user chooses an answer; no way forward without an answer; the persona comes
 * before the fitness goals; "Create my dashboard" only appears once at least
 * one fitness goal is chosen. Back goes to the previous question.
 *
 *  Output A / B (short): persona → fitness goals.
 *  Output C (full, "lifestyle choices determine the persona"):
 *    name (+ large-text mode) → persona → level → sessions per week →
 *    data that matters → fitness goals (+ preview of the dashboard).
 *
 * Auto-advance happens on a tap / click only. With the keyboard, arrow keys
 * change the radio choice without leaving the page; the user confirms with
 * Continue, so keyboard users are never moved by accident.
 */
import { Activity, Dumbbell, Footprints, Gauge, HeartPulse, Sofa, Trophy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { buildExperience, defaultTrainingDays, DAY_SHORT, EXPERIENCE_INFO, LEVEL_LABEL, MODULE_INFO, useStore, type ExperienceId, type FitnessGoal, type Level, type MetricId, type Profile } from '@core';
import { Button, CategoryBadge, ChoiceCards, Stepper, TextField, useToast } from '@ds';

type Step = 'name' | 'persona' | 'level' | 'sessions' | 'interests' | 'goals';

const icon = (I: typeof Activity) => (
  <span className="flex size-11 items-center justify-center rounded-full bg-sunken">
    <I className="size-6" />
  </span>
);

const PERSONA_ICON: Record<ExperienceId, typeof Activity> = { casual: Footprints, training: Dumbbell, performance: Trophy };

export const GOAL_LABEL: Record<FitnessGoal, { label: string; description: string }> = {
  'lose-weight': { label: 'Lose weight', description: 'Lower daily calorie goal' },
  'build-strength': { label: 'Build strength', description: 'More strength sessions and protein' },
  endurance: { label: 'Improve endurance', description: 'Cardio and steady progress' },
  'stay-healthy': { label: 'Stay healthy and active', description: 'Move every day, eat balanced' },
  'sleep-better': { label: 'Sleep better', description: 'Regular bedtime and sleep tracking' },
};

export function Onboarding() {
  const { completeOnboarding, session, iteration } = useStore();
  const toast = useToast();
  const navigate = useNavigate();
  const steps: Step[] = iteration.questionnaire === 'full' ? ['name', 'persona', 'level', 'sessions', 'interests', 'goals'] : ['persona', 'goals'];
  const [i, setI] = useState(0);
  const [name, setName] = useState('');
  const [largeText, setLargeText] = useState(false);
  const [persona, setPersona] = useState<ExperienceId[]>([]);
  const [level, setLevel] = useState<Level[]>([]);
  const [sessions, setSessions] = useState(3);
  const [interests, setInterests] = useState<MetricId[]>([]);
  const [goals, setGoals] = useState<FitnessGoal[]>([]);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const pointer = useRef(false);
  const step = steps[i];

  useEffect(() => {
    formRef.current?.querySelector<HTMLElement>('input, button')?.focus();
    document.title = `Set up ${i + 1} of ${steps.length} · Wellness Tracker`;
  }, [i, steps.length]);
  useEffect(() => {
    document.documentElement.classList.toggle('large-ui', largeText);
  }, [largeText]);

  const validate = (): string | null => {
    if (step === 'name' && !name.trim()) return 'Enter your first name so we can greet you.';
    if (step === 'persona' && !persona.length) return 'Choose the profile that fits you to continue.';
    if (step === 'level' && !level.length) return 'Choose the level that fits you best to continue.';
    if (step === 'interests' && !interests.length) return 'Choose at least one type of data to continue.';
    if (step === 'goals' && !goals.length) return 'Choose at least one fitness goal to create your dashboard.';
    return null;
  };
  const next = () => {
    const e = validate();
    setError(e);
    if (e) return;
    if (step !== 'goals') return setI(i + 1);
    completeOnboarding({
      name: name || undefined,
      experience: persona[0],
      level: level[0],
      sessionsPerWeek: iteration.questionnaire === 'full' ? sessions : undefined,
      interests: iteration.questionnaire === 'full' ? (['fitness', 'nutrition', 'sleep'] as MetricId[]).filter((m) => interests.includes(m)) : undefined,
      fitnessGoals: goals,
      largeText: iteration.largeTextMode ? largeText : undefined,
    });
    toast('success', 'Your profile is saved and your dashboard is ready.');
    navigate('/');
  };
  /** Single-choice answer: go to the next question when chosen with a tap / click. */
  const chooseThenAdvance = <T,>(set: (v: T[]) => void) => (v: T[]) => {
    set(v);
    setError(null);
    if (pointer.current) window.setTimeout(() => setI((x) => x + 1), 280);
  };

  const goalOptions = (Object.keys(GOAL_LABEL) as FitnessGoal[]).filter((g) => g !== 'sleep-better' || iteration.sleep);
  const preview: Profile | null =
    iteration.questionnaire === 'full' && persona[0] && level[0]
      ? { name, email: session ?? '', experience: persona[0], level: level[0], sessionsPerWeek: sessions, trainingDays: defaultTrainingDays(sessions), interests: interests.length ? interests : ['fitness'], fitnessGoals: goals, dashboard: null, ratings: [], goals: { steps: 0, activeMin: 0, calories: 0, proteinG: 0, carbsG: 0, fatG: 0, sleepMin: 480 } }
      : null;

  return (
    <main className="mx-auto flex min-h-dvh max-w-[520px] flex-col px-5 pb-8 pt-[max(24px,env(safe-area-inset-top))]">
      <p className="m-0 text-ink-soft">
        Set up · question {i + 1} of {steps.length}
      </p>
      <div role="progressbar" aria-label="Questionnaire progress" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={i + 1} className="mt-3 flex gap-1.5">
        {steps.map((s, k) => (
          <span key={s} className={`h-1.5 flex-1 rounded-full ${k <= i ? 'bg-ink' : 'bg-surface'}`} />
        ))}
      </div>

      <form
        ref={formRef}
        noValidate
        key={step}
        className="anim-rise mt-8 flex flex-1 flex-col"
        onPointerDown={() => (pointer.current = true)}
        onKeyDown={() => (pointer.current = false)}
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
            {iteration.largeTextMode && (
              <label className="card mt-6 flex min-h-16 cursor-pointer items-center gap-4 p-4">
                <input type="checkbox" checked={largeText} onChange={(e) => setLargeText(e.target.checked)} className="size-6 shrink-0 accent-[var(--color-ink)]" />
                <span>
                  <span className="block font-bold">Use large text and bigger buttons</span>
                  <span className="block text-ink-soft">Accessibility mode. You can change it later in Settings.</span>
                </span>
              </label>
            )}
          </>
        )}
        {step === 'persona' && (
          <ChoiceCards
            name="persona"
            legend={<span className="text-3xl">Which describes you best?</span>}
            hint="Your answer chooses your dashboard. You can change it later."
            value={persona}
            onChange={chooseThenAdvance(setPersona)}
            choices={iteration.experiences.map((e) => ({
              value: e,
              label: e === 'casual' ? 'Casual user' : e === 'performance' ? 'Performance athlete' : 'Regular training',
              description: EXPERIENCE_INFO[e].tagline,
              icon: icon(PERSONA_ICON[e]),
            }))}
            error={error ?? undefined}
          />
        )}
        {step === 'level' && (
          <ChoiceCards
            name="level"
            legend={<span className="text-3xl">How active are you today?</span>}
            hint="Sets the length and difficulty of your workouts."
            value={level}
            onChange={chooseThenAdvance(setLevel)}
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
            <h1 className="m-0 text-3xl font-bold">How many workouts per week?</h1>
            <p className="m-0 mb-6 mt-2 text-ink-soft">Your weekly plan will have this many workouts. Zero is fine.</p>
            <Stepper label="Workouts per week" value={sessions} onChange={setSessions} min={0} max={7} />
            <div className="card mt-6 p-4" aria-live="polite">
              <p className="m-0 mb-3 font-bold">Your week</p>
              <ul className="m-0 grid list-none grid-cols-7 gap-1 p-0">
                {DAY_SHORT.map((d, k) => {
                  const on = defaultTrainingDays(sessions).includes(k);
                  return (
                    <li key={d} className="flex flex-col items-center gap-2">
                      <span className="text-ink-soft">{d}</span>
                      <span aria-hidden="true" className={`size-9 rounded-full ${on ? 'bg-act' : 'bg-sunken'}`} />
                      <span className="sr-only">{on ? 'workout' : 'rest'}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </>
        )}
        {step === 'interests' && (
          <ChoiceCards
            name="interests"
            multiple
            legend={<span className="text-3xl">What do you want to track?</span>}
            hint="Choose at least one. Each gets a tab and a place on your dashboard."
            value={interests}
            onChange={(v) => (setInterests(v), setError(null))}
            choices={[
              { value: 'fitness', label: 'Workouts and activity', description: 'Workouts, steps, active minutes', icon: <CategoryBadge category="fitness" size={44} /> },
              { value: 'nutrition', label: 'Meals and calories', description: 'Track what you eat', icon: <CategoryBadge category="nutrition" size={44} /> },
              { value: 'sleep', label: 'Sleep', description: 'Sleep time and sleep stages', icon: <CategoryBadge category="sleep" size={44} /> },
            ]}
            error={error ?? undefined}
          />
        )}
        {step === 'goals' && (
          <>
            <ChoiceCards
              name="goals"
              multiple
              legend={<span className="text-3xl">What are your fitness goals?</span>}
              hint="Choose at least one. The button to create your dashboard appears when you do."
              value={goals}
              onChange={(v) => (setGoals(v), setError(null))}
              choices={goalOptions.map((g) => ({ value: g, label: GOAL_LABEL[g].label, description: GOAL_LABEL[g].description }))}
              error={error ?? undefined}
            />
            {preview && goals.length > 0 && <Preview profile={preview} />}
          </>
        )}

        <div className="mt-auto flex gap-3 pt-10">
          {i > 0 && (
            <Button variant="secondary" size="lg" onClick={() => (setError(null), setI(i - 1))}>
              Back
            </Button>
          )}
          {step !== 'goals' ? (
            <Button type="submit" size="lg" className="flex-1">
              Continue
            </Button>
          ) : (
            goals.length > 0 && (
              <Button type="submit" size="lg" className="anim-rise flex-1">
                Create my dashboard
              </Button>
            )
          )}
        </div>
      </form>
    </main>
  );
}

function Preview({ profile }: { profile: Profile }) {
  const { iteration } = useStore();
  const e = buildExperience(profile, iteration);
  return (
    <div className="card mt-6 p-5" aria-live="polite">
      <h2 className="m-0 text-lg font-bold">Your dashboard: {e.name}</h2>
      <ol className="m-0 mt-3 grid list-none gap-2 p-0">
        {e.modules.map((m, k) => (
          <li key={m} className="flex items-center gap-3">
            <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sunken font-bold">
              {k + 1}
            </span>
            <span>
              <strong>{MODULE_INFO[m].name}</strong> · {MODULE_INFO[m].description}
            </span>
          </li>
        ))}
      </ol>
      <p className="m-0 mt-3 text-ink-soft">
        {profile.sessionsPerWeek} workout{profile.sessionsPerWeek === 1 ? '' : 's'} a week · {LEVEL_LABEL[profile.level]} level. Your account starts empty.
      </p>
    </div>
  );
}
