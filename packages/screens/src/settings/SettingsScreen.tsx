/**
 * C3 Profile and settings (T4: change personal information and preferences).
 * Every change is confirmed (Task 2) and followed by a status message (AR10).
 *   All versions: personal info (age, weight, height) · persona · fitness
 *     goals · daily goals (calorie goal set by the user) · "show more data" ·
 *     log out · delete account ("Are you sure?").
 *   Output A: pin / unpin / order dashboard metrics HERE (Task 2 Output A).
 *   Output B: + rate the app 1–5.
 *   Output C: full lifestyle / persona editor (level, workouts per week,
 *     training days, data), accessibility mode, smart device + sync status.
 */
import { ArrowDown, ArrowUp, Bluetooth, Loader2, LogOut, Pin, PinOff, RefreshCw, Star, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { buildExperience, dashboardModules, DAY_SHORT, DEVICES, EXPERIENCE_INFO, LEVEL_LABEL, MODULE_INFO, useUser, type ExperienceId, type FitnessGoal, type Level, type MetricId, type ModuleId } from '@core';
import { Avatar, Button, Card, CategoryBadge, ChipGroup, ChoiceCards, cn, ConfirmDialog, FieldError, InlineStatus, Pill, SectionHeader, Stepper, TextAreaField, TextField, useToast } from '@ds';
import { TopBar } from '../layout/TopBar';
import { GOAL_LABEL } from '../onboarding/Onboarding';

export function SettingsScreen() {
  const { user, experience, iteration } = useUser();
  const p = user.profile;
  return (
    <>
      <TopBar title={iteration.settingsInNav ? 'Profile' : 'Settings'} />
      <div className="mt-6 flex items-center gap-4">
        <Avatar name={p.name} size={72} />
        <div className="min-w-0">
          <p className="m-0 text-2xl font-bold">{p.name}</p>
          <p className="m-0 text-ink-soft">{p.email}</p>
          <Pill className="mt-2">{experience.name} persona</Pill>
        </div>
      </div>
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {iteration.personaEditor === 'full' ? <ExperienceSection /> : <PersonaSection />}
        {iteration.pinning === 'settings' && <PinSection />}
        <PersonalSection />
        <GoalsSection />
        <ViewSection />
        {iteration.device && <DeviceSection />}
        {iteration.rating && <RatingSection />}
        <ToolsSection />
        <AccountSection />
      </div>
    </>
  );
}

/** Accessible on/off switch (≥ 44 px, state shown by position AND "On/Off"). */
function Toggle({ label, hint, checked, onChange, id }: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void; id: string }) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-4">
      <span>
        <span id={`${id}-l`} className="block font-bold">{label}</span>
        <span id={`${id}-h`} className="block text-ink-soft">{hint}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-l`}
        aria-describedby={`${id}-h`}
        onClick={() => onChange(!checked)}
        className={cn('relative inline-flex h-11 w-[84px] shrink-0 cursor-pointer items-center rounded-full border-2 px-1 text-base font-bold transition-colors', checked ? 'justify-end border-ink bg-ink text-on-ink' : 'justify-start border-line/60 bg-sunken text-ink')}
      >
        <span aria-hidden="true" className={cn('absolute top-1/2 -translate-y-1/2', checked ? 'left-3' : 'right-3')}>{checked ? 'On' : 'Off'}</span>
        <span aria-hidden="true" className={cn('size-8 rounded-full', checked ? 'bg-on-ink' : 'bg-ink')} />
      </button>
    </div>
  );
}

/** Output A / B: change persona and fitness goals (Task 2 T4: select a new persona → confirm). */
function PersonaSection() {
  const { user, iteration, updateProfile } = useUser();
  const toast = useToast();
  const p = user.profile;
  const [exp, setExp] = useState<ExperienceId[]>([p.experience]);
  const [goals, setGoals] = useState<FitnessGoal[]>(p.fitnessGoals);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const changed = exp[0] !== p.experience || goals.join() !== p.fitnessGoals.join();
  const preview = buildExperience({ ...p, experience: exp[0], dashboard: null }, iteration);
  const goalOptions = (Object.keys(GOAL_LABEL) as FitnessGoal[]).filter((g) => g !== 'sleep-better' || iteration.sleep);
  return (
    <Card aria-labelledby="ps-title" className="lg:col-span-2">
      <SectionHeader id="ps-title" title="Persona and goals" subtitle="Your persona decides your dashboard and how much detail you see." />
      <div className="flex flex-col gap-6">
        <ChoiceCards name="persona" legend="Persona" legendClassName="text-lg" value={exp} onChange={setExp} choices={iteration.experiences.map((e) => ({ value: e, label: `${EXPERIENCE_INFO[e].name}: ${EXPERIENCE_INFO[e].tagline}`, description: EXPERIENCE_INFO[e].description }))} />
        <div className="flex flex-col gap-2">
          <span className="text-lg font-bold">Fitness goals</span>
          <ChipGroup label="Fitness goals" multiple value={goals} onChange={(v) => (setGoals(v), setError(null))} options={goalOptions.map((g) => ({ value: g, label: GOAL_LABEL[g].label }))} />
        </div>
        {error && <FieldError>{error}</FieldError>}
        <Button disabled={!changed} onClick={() => (goals.length ? setConfirm(true) : setError('Choose at least one fitness goal.'))}>
          Save persona
        </Button>
        {!changed && <p className="m-0 -mt-3 text-ink-soft">Change something above to save.</p>}
      </div>
      <ConfirmDialog
        open={confirm}
        title={`Change your persona to ${preview.name}?`}
        confirmLabel="Yes, change it"
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          updateProfile({ experience: exp[0], fitnessGoals: goals, ...(exp[0] !== p.experience ? { dashboard: null } : {}) });
          toast('success', `Persona updated to ${preview.name}. Your dashboard has changed.`);
          setConfirm(false);
        }}
      >
        <p className="m-0">Your dashboard will show:</p>
        <ul className="m-0 mt-2 pl-5">
          {preview.modules.map((m) => (
            <li key={m}>{MODULE_INFO[m].name}</li>
          ))}
        </ul>
        {exp[0] !== p.experience && <p className="m-0 mt-3">Your daily goals and pinned metrics will be reset to the {preview.name} defaults.</p>}
      </ConfirmDialog>
    </Card>
  );
}

/** Output A (Task 2 Output A: "Going into application settings to pin preferred metrics"). */
function PinSection() {
  const { user, experience, setDashboard } = useUser();
  const toast = useToast();
  const pinned = dashboardModules(user.profile, experience);
  const others = experience.pinnable.filter((m) => !pinned.includes(m));
  const save = (next: ModuleId[], text: string) => (setDashboard(next), toast('success', text));
  const move = (i: number, d: -1 | 1) => {
    const next = [...pinned];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    save(next, `${MODULE_INFO[pinned[i]].name} moved to position ${i + d + 1} of ${pinned.length}.`);
  };
  return (
    <Card aria-labelledby="pin-title" className="lg:col-span-2">
      <SectionHeader id="pin-title" title="Dashboard metrics" subtitle="Pin the metrics you want on your dashboard, in the order you like." />
      <h3 className="m-0 mb-2 text-lg font-bold">Pinned</h3>
      {pinned.length === 0 && <p className="m-0 mb-3 text-ink-soft">No metric is pinned.</p>}
      <ol className="m-0 grid list-none gap-2 p-0">
        {pinned.map((m, i) => (
          <li key={m} className="inset flex flex-wrap items-center gap-2 p-3">
            <CategoryBadge category={MODULE_INFO[m].category} size={36} />
            <span className="min-w-0 flex-1 font-bold">
              {i + 1}. {MODULE_INFO[m].name}
            </span>
            <span className="flex gap-2">
              <Button variant="secondary" size="icon" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Move ${MODULE_INFO[m].name} up`}>
                <ArrowUp aria-hidden="true" />
              </Button>
              <Button variant="secondary" size="icon" disabled={i === pinned.length - 1} onClick={() => move(i, 1)} aria-label={`Move ${MODULE_INFO[m].name} down`}>
                <ArrowDown aria-hidden="true" />
              </Button>
              <Button variant="secondary" size="sm" onClick={() => save(pinned.filter((x) => x !== m), `${MODULE_INFO[m].name} unpinned.`)} aria-label={`Unpin metric: ${MODULE_INFO[m].name}`}>
                <PinOff aria-hidden="true" /> Unpin metric
              </Button>
            </span>
          </li>
        ))}
      </ol>
      {others.length > 0 && (
        <>
          <h3 className="m-0 mb-2 mt-5 text-lg font-bold">Not pinned</h3>
          <ul className="m-0 grid list-none gap-2 p-0">
            {others.map((m) => (
              <li key={m} className="inset flex items-center gap-3 p-3">
                <CategoryBadge category={MODULE_INFO[m].category} size={36} />
                <span className="min-w-0 flex-1">
                  <span className="block font-bold">{MODULE_INFO[m].name}</span>
                  <span className="block text-ink-soft">{MODULE_INFO[m].description}</span>
                </span>
                <Button size="sm" onClick={() => save([...pinned, m], `${MODULE_INFO[m].name} pinned to your dashboard.`)} aria-label={`Pin metric: ${MODULE_INFO[m].name}`}>
                  <Pin aria-hidden="true" /> Pin metric
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}
      <Button variant="outline" block className="mt-4" onClick={() => (setDashboard(null), toast('success', 'Dashboard metrics reset to the recommended order.'))}>
        Reset to recommended
      </Button>
    </Card>
  );
}

/** "Show more data" (answer to the Task 2 question, changeable later) + Output C accessibility mode. */
function ViewSection() {
  const { user, iteration, updateProfile } = useUser();
  const toast = useToast();
  const p = user.profile;
  return (
    <Card aria-labelledby="vw-title">
      <SectionHeader id="vw-title" title="Display" />
      <div className="flex flex-col gap-4">
        <Toggle id="more" label="Show more data" hint={p.experience === 'performance' ? 'Performance already shows the most detail.' : 'More detail on the dashboard and pages.'} checked={!!p.moreData} onChange={(v) => (updateProfile({ moreData: v, dashboard: null }), toast('success', v ? 'More data is now shown.' : 'Simple view restored.'))} />
        {iteration.largeTextMode && (
          <Toggle id="large" label="Large text and buttons" hint="Accessibility mode: bigger text, bigger controls, bold labels." checked={!!p.largeText} onChange={(v) => (updateProfile({ largeText: v }), toast('success', v ? 'Large text mode is on.' : 'Large text mode is off.'))} />
        )}
      </div>
    </Card>
  );
}

function PersonalSection() {
  const { user, updateProfile } = useUser();
  const toast = useToast();
  const p = user.profile;
  const [f, setF] = useState({ name: p.name, age: p.age?.toString() ?? '', weight: p.weightKg?.toString() ?? '', height: p.heightCm?.toString() ?? '' });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [confirm, setConfirm] = useState(false);
  const range = (v: string, a: number, b: number, w: string) => (!v ? undefined : Number(v) >= a && Number(v) <= b ? undefined : `Enter ${w} between ${a} and ${b}, or leave it empty.`);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const er = { name: f.name.trim() ? undefined : 'Enter your name.', age: range(f.age, 13, 120, 'an age'), weight: range(f.weight, 25, 300, 'a weight in kg'), height: range(f.height, 100, 250, 'a height in cm') };
    setErrors(er);
    if (!Object.values(er).some(Boolean)) setConfirm(true);
  };
  return (
    <Card aria-labelledby="pi-title">
      <SectionHeader id="pi-title" title="Personal information" />
      <form noValidate onSubmit={submit} className="flex flex-col gap-4">
        {Object.values(errors).some(Boolean) && <InlineStatus kind="error">Nothing was saved. Fix the fields marked with an error.</InlineStatus>}
        <TextField label="Name" autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} error={errors.name} />
        <div className="grid grid-cols-3 gap-2">
          <TextField label="Age" inputMode="numeric" value={f.age} onChange={(e) => setF({ ...f, age: e.target.value })} error={errors.age} />
          <TextField label="Weight kg" inputMode="decimal" value={f.weight} onChange={(e) => setF({ ...f, weight: e.target.value })} error={errors.weight} />
          <TextField label="Height cm" inputMode="numeric" value={f.height} onChange={(e) => setF({ ...f, height: e.target.value })} error={errors.height} />
        </div>
        <Button type="submit">Save personal information</Button>
      </form>
      <ConfirmDialog
        open={confirm}
        title="Save your personal information?"
        confirmLabel="Yes, save"
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          updateProfile({ name: f.name.trim(), age: f.age ? +f.age : undefined, weightKg: f.weight ? +f.weight : undefined, heightCm: f.height ? +f.height : undefined });
          toast('success', 'Personal information saved.');
          setConfirm(false);
        }}
      >
        Your name, age, weight and height will be updated.
      </ConfirmDialog>
    </Card>
  );
}

function ExperienceSection() {
  const { user, updateProfile, iteration } = useUser();
  const toast = useToast();
  const p = user.profile;
  const [exp, setExp] = useState<ExperienceId[]>([p.experience]);
  const [level, setLevel] = useState<Level[]>([p.level]);
  const [sessions, setSessions] = useState(p.sessionsPerWeek);
  const [days, setDays] = useState<string[]>(p.trainingDays.map(String));
  const [interests, setInterests] = useState<MetricId[]>(p.interests);
  const [goals, setGoals] = useState<FitnessGoal[]>(p.fitnessGoals);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const changed = exp[0] !== p.experience || level[0] !== p.level || sessions !== p.sessionsPerWeek || days.join() !== p.trainingDays.join() || interests.join() !== p.interests.join() || goals.join() !== p.fitnessGoals.join();
  const preview = buildExperience({ ...p, experience: exp[0], interests: interests.length ? interests : p.interests, dashboard: null }, iteration);

  const onSessions = (n: number) => {
    setSessions(n);
    // Keep the chosen days valid: trim or extend to the new count.
    const cur = days.map(Number).sort();
    const free = [0, 1, 2, 3, 4, 5, 6].filter((d) => !cur.includes(d));
    setDays((n <= cur.length ? cur.slice(0, n) : [...cur, ...free.slice(0, n - cur.length)]).sort().map(String));
  };
  const save = () => {
    if (!interests.length) return setError('Choose at least one type of data.');
    if (!goals.length) return setError('Choose at least one fitness goal.');
    if (days.length !== sessions) return setError(`Choose exactly ${sessions} training day${sessions === 1 ? '' : 's'} (you chose ${days.length}).`);
    setError(null);
    setConfirm(true);
  };

  return (
    <Card aria-labelledby="ex-title" className="lg:col-span-2">
      <SectionHeader id="ex-title" title="Persona and lifestyle" subtitle="Your habits changed? Update them here: the dashboard, tabs and detail follow." />
      <div className="flex flex-col gap-6">
        <ChoiceCards name="exp" legend="What brings you here?" legendClassName="text-lg" value={exp} onChange={setExp} choices={(['casual', 'training', 'performance'] as ExperienceId[]).map((e) => ({ value: e, label: `${EXPERIENCE_INFO[e].name}: ${EXPERIENCE_INFO[e].tagline}`, description: EXPERIENCE_INFO[e].description }))} />
        <div className="flex flex-col gap-2">
          <span className="text-lg font-bold">Level</span>
          <ChipGroup label="Level" value={level} onChange={setLevel} options={(['sedentary', 'beginner', 'regular', 'athlete'] as Level[]).map((l) => ({ value: l, label: LEVEL_LABEL[l] }))} />
        </div>
        <Stepper label="Workouts per week" value={sessions} onChange={onSessions} min={0} max={7} />
        {sessions > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-lg font-bold">Training days</span>
            <span className="text-ink-soft">Choose {sessions} day{sessions === 1 ? '' : 's'}.</span>
            <ChipGroup label="Training days" multiple value={days} onChange={setDays} options={DAY_SHORT.map((d, i) => ({ value: String(i), label: d }))} />
          </div>
        )}
        <div className="flex flex-col gap-2">
          <span className="text-lg font-bold">Fitness goals</span>
          <ChipGroup label="Fitness goals" multiple value={goals} onChange={setGoals} options={(Object.keys(GOAL_LABEL) as FitnessGoal[]).map((g) => ({ value: g, label: GOAL_LABEL[g].label }))} />
        </div>
        <ChoiceCards name="int" multiple legend="What you want to track" legendClassName="text-lg" value={interests} onChange={setInterests} columns={1} choices={[{ value: 'fitness', label: 'Training and activity' }, { value: 'nutrition', label: 'Nutrition' }, { value: 'sleep', label: 'Sleep' }]} />
        {error && <FieldError>{error}</FieldError>}
        <Button onClick={save} disabled={!changed}>
          Save persona and lifestyle
        </Button>
        {!changed && <p className="m-0 -mt-3 text-ink-soft">Change something above to save.</p>}
      </div>
      <ConfirmDialog
        open={confirm}
        title={`Update your persona (${preview.name})?`}
        confirmLabel="Yes, apply"
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          updateProfile({ experience: exp[0], level: level[0], sessionsPerWeek: sessions, trainingDays: days.map(Number).sort(), interests: (['fitness', 'nutrition', 'sleep'] as MetricId[]).filter((m) => interests.includes(m)), fitnessGoals: goals });
          toast('success', `Persona updated: ${preview.name}, ${sessions} workout${sessions === 1 ? '' : 's'} a week. Your dashboard has changed.`);
          setConfirm(false);
        }}
      >
        <p className="m-0">Your dashboard will show:</p>
        <ul className="m-0 mt-2 pl-5">
          {preview.modules.map((m) => (
            <li key={m}>{MODULE_INFO[m].name}</li>
          ))}
        </ul>
        {exp[0] !== p.experience && <p className="m-0 mt-3">Your daily goals and pinned metrics will be reset to the {preview.name} defaults.</p>}
      </ConfirmDialog>
    </Card>
  );
}

function GoalsSection() {
  const { user, updateProfile } = useUser();
  const toast = useToast();
  const g = user.profile.goals;
  const [f, setF] = useState({ steps: String(g.steps), active: String(g.activeMin), calories: String(g.calories), sleep: String(g.sleepMin / 60) });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const r = (v: string, a: number, b: number) => (Number(v) >= a && Number(v) <= b ? undefined : `Enter a number between ${a} and ${b}.`);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const er = { steps: r(f.steps, 1000, 40000), active: r(f.active, 5, 300), calories: r(f.calories, 1000, 6000), sleep: r(f.sleep, 4, 12) };
    setErrors(er);
    if (Object.values(er).some(Boolean)) return;
    updateProfile({ goals: { ...g, steps: +f.steps, activeMin: +f.active, calories: +f.calories, sleepMin: Math.round(+f.sleep * 60) } });
    toast('success', 'Daily goals saved.');
  };
  return (
    <Card aria-labelledby="g-title">
      <SectionHeader id="g-title" title="Daily goals" subtitle="Your calorie goal appears at the top of the dashboard." />
      <form noValidate onSubmit={submit} className="grid grid-cols-2 gap-3">
        <TextField label="Steps" inputMode="numeric" value={f.steps} onChange={(e) => setF({ ...f, steps: e.target.value })} error={errors.steps} />
        <TextField label="Active min" inputMode="numeric" value={f.active} onChange={(e) => setF({ ...f, active: e.target.value })} error={errors.active} />
        <TextField label="Calories" inputMode="numeric" value={f.calories} onChange={(e) => setF({ ...f, calories: e.target.value })} error={errors.calories} />
        <TextField label="Sleep (hours)" inputMode="decimal" value={f.sleep} onChange={(e) => setF({ ...f, sleep: e.target.value })} error={errors.sleep} />
        <Button type="submit" className="col-span-2">
          Save goals
        </Button>
      </form>
    </Card>
  );
}

function DeviceSection() {
  const { user, connectDevice, disconnectDevice, syncNow, sync } = useUser();
  const toast = useToast();
  const d = user.profile.device;
  const [choice, setChoice] = useState<string[]>([DEVICES[0]]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [confirm, setConfirm] = useState(false);
  return (
    <Card aria-labelledby="dv-title">
      <SectionHeader id="dv-title" title="Smart device" action={<Pill>Simulated</Pill>} />
      {d ? (
        <div className="flex flex-col gap-4">
          <div className="inset flex items-center gap-3 p-4">
            <Bluetooth aria-hidden="true" className="size-6" />
            <div>
              <p className="m-0 font-bold">{d.name}</p>
              <p className="m-0 text-ink-soft">Last sync {new Date(sync.at ?? d.lastSync).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              disabled={sync.state === 'syncing'}
              onClick={async () => {
                const r = await syncNow();
                setMsg(r.ok ? { kind: 'success', text: 'Your data is up to date.' } : { kind: 'error', text: r.error });
              }}
            >
              {sync.state === 'syncing' ? <Loader2 aria-hidden="true" className="motion-safe:animate-spin" /> : <RefreshCw aria-hidden="true" />} Sync now
            </Button>
            <Button variant="secondary" onClick={() => setConfirm(true)}>
              Disconnect
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="m-0 text-ink-soft">Connecting imports your steps for the last 14 days. No real device is used.</p>
          <ChoiceCards name="device" legend="Choose a device" legendClassName="text-base" value={choice} onChange={setChoice} choices={DEVICES.map((x) => ({ value: x, label: x }))} />
          <Button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              const r = await connectDevice(choice[0]);
              setBusy(false);
              setMsg(r.ok ? { kind: 'success', text: `${choice[0]} connected. 14 days of steps imported.` } : { kind: 'error', text: r.error });
            }}
          >
            {busy ? <Loader2 aria-hidden="true" className="motion-safe:animate-spin" /> : <Bluetooth aria-hidden="true" />} {busy ? 'Connecting…' : 'Connect device'}
          </Button>
        </div>
      )}
      {msg && <InlineStatus kind={msg.kind} className="mt-4" onDismiss={() => setMsg(null)}>{msg.text}</InlineStatus>}
      <ConfirmDialog
        open={confirm}
        title="Disconnect this device?"
        confirmLabel="Disconnect"
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          disconnectDevice();
          setConfirm(false);
          setMsg(null);
          toast('success', 'Device disconnected. Your past data is kept.');
        }}
      >
        New steps will no longer be imported. Data already imported stays.
      </ConfirmDialog>
    </Card>
  );
}

function RatingSection() {
  const { user, rate } = useUser();
  const toast = useToast();
  const last = user.profile.ratings[user.profile.ratings.length - 1];
  const [score, setScore] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const labels = ['Very poor', 'Poor', 'Okay', 'Good', 'Excellent'];
  return (
    <Card aria-labelledby="rt-title">
      <SectionHeader id="rt-title" title="Rate the app" />
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (!score) return setError('Choose a rating from 1 to 5 stars.');
          rate({ score: score as 1 | 2 | 3 | 4 | 5, comment: comment.trim() || undefined });
          toast('success', `Thank you! You rated the app ${score} out of 5.`);
          setScore(0);
          setComment('');
          setError(null);
        }}
        className="flex flex-col gap-4"
      >
        <fieldset className="m-0 border-0 p-0">
          <legend className="mb-2 p-0 font-bold">How satisfied are you?</legend>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <label key={n} className="cursor-pointer rounded-full has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-ink">
                <input type="radio" name="rating" value={n} checked={score === n} onChange={() => (setScore(n), setError(null))} className="sr-only" aria-label={`${n} star${n > 1 ? 's' : ''}, ${labels[n - 1]}`} />
                <span aria-hidden="true" className="flex size-12 items-center justify-center">
                  <Star className={cn('size-9', n <= score ? 'fill-ink text-ink' : 'text-ink-soft')} strokeWidth={1.8} />
                </span>
              </label>
            ))}
          </div>
          <p className="m-0 mt-1" aria-live="polite">
            {score ? `${score} of 5 · ${labels[score - 1]}` : 'No rating selected'}
          </p>
        </fieldset>
        {error && <FieldError>{error}</FieldError>}
        <TextAreaField label="Comment (optional)" value={comment} onChange={(e) => setComment(e.target.value)} />
        <Button type="submit">Send rating</Button>
        {last && <p className="m-0 text-ink-soft">Last rating: {last.score} of 5 on {new Date(last.date).toLocaleDateString('en-CA')}.</p>}
      </form>
    </Card>
  );
}

function ToolsSection() {
  const { failNextSync, setFailNextSync, loadSampleData, resetPrototype, user, iteration } = useUser();
  const toast = useToast();
  const [confirm, setConfirm] = useState<'sample' | 'reset' | null>(null);
  const empty = user.workouts.length + user.meals.length + user.sleep.length === 0;
  return (
    <Card aria-labelledby="pt-title">
      <SectionHeader id="pt-title" title="Prototype tools" subtitle="For testing only. Not part of the real app." />
      {iteration.device && (
        <>
      <div className="flex min-h-14 items-center justify-between gap-4">
        <span>
          <span id="sync-fail-label" className="block font-bold">Simulate a sync failure</span>
          <span id="sync-fail-hint" className="block text-ink-soft">The next data sync will fail so you can test Retry.</span>
        </span>
        {/* C.1 (C1-01): 60 × 44 px switch; state shown by knob position AND "On/Off" text. */}
        <button
          type="button"
          role="switch"
          aria-checked={failNextSync}
          aria-labelledby="sync-fail-label"
          aria-describedby="sync-fail-hint"
          onClick={() => setFailNextSync(!failNextSync)}
          className={cn('relative inline-flex h-11 w-[84px] shrink-0 cursor-pointer items-center rounded-full border-2 px-1 text-base font-bold transition-colors', failNextSync ? 'justify-end border-ink bg-ink text-on-ink' : 'justify-start border-line/60 bg-sunken text-ink')}
        >
          <span aria-hidden="true" className={cn('absolute top-1/2 -translate-y-1/2', failNextSync ? 'left-3' : 'right-3')}>{failNextSync ? 'On' : 'Off'}</span>
          <span aria-hidden="true" className={cn('size-8 rounded-full', failNextSync ? 'bg-on-ink' : 'bg-ink')} />
        </button>
      </div>
        </>
      )}
      <div className="mt-4 grid gap-2">
        <Button variant="secondary" onClick={() => setConfirm('sample')}>
          {empty ? 'Fill my account with sample data' : 'Replace my data with sample data'}
        </Button>
        <Button variant="outline" onClick={() => setConfirm('reset')}>
          Reset the whole prototype
        </Button>
      </div>
      <ConfirmDialog open={confirm === 'sample'} title="Use sample data?" confirmLabel="Yes, load sample data" onCancel={() => setConfirm(null)} onConfirm={() => (loadSampleData(), setConfirm(null), toast('success', 'Sample workouts, meals, sleep and activity loaded.'))}>
        Your workouts, meals, sleep and activity will be replaced by about two months of sample data.
      </ConfirmDialog>
      <ConfirmDialog open={confirm === 'reset'} title="Reset the prototype?" confirmLabel="Reset everything" danger onCancel={() => setConfirm(null)} onConfirm={resetPrototype}>
        All accounts created in this browser and all changes are removed. The three demo profiles come back.
      </ConfirmDialog>
    </Card>
  );
}

function AccountSection() {
  const { logOut, deleteAccount, user } = useUser();
  const toast = useToast();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);
  return (
    <Card aria-labelledby="ac-title" className="lg:col-span-2">
      <SectionHeader id="ac-title" title="Account" />
      <div className="grid gap-2 sm:grid-cols-2">
        <Button variant="secondary" onClick={() => (logOut(), toast('success', 'You are logged out.'), navigate('/auth'))}>
          <LogOut aria-hidden="true" /> Log out
        </Button>
        <Button variant="danger" onClick={() => setConfirm(true)}>
          <Trash2 aria-hidden="true" /> Delete account
        </Button>
      </div>
      <ConfirmDialog
        open={confirm}
        title="Are you sure?"
        confirmLabel="Delete my account"
        danger
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          deleteAccount();
          toast('success', 'Your account and all its data were deleted.');
          navigate('/auth', { replace: true });
        }}
      >
        The account {user.profile.email} and all its workouts, meals and sleep will be deleted. This cannot be undone.
      </ConfirmDialog>
    </Card>
  );
}
