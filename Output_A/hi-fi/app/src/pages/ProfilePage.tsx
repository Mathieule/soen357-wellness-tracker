/**
 * C3 User profile menu (Output A, reached from the navigation bar).
 * Profile picture and name centred at the top, a horizontal bar, then the
 * individual settings one by one. "Delete account" is at the bottom below
 * another horizontal bar and asks "Are you sure?".
 *
 * Output A: showing / hiding and ordering the dashboard widgets is done here
 * ("which can be modified in user settings", C4).
 */
import { ArrowDown, ArrowUp, LogOut, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { queueFlash } from '@shared/lib/useFlash';
import { useUser } from '@shared/data/appData';
import type { Frequency, MetricId, Persona } from '@shared/data/types';
import { Avatar } from '@shared/ui/avatar';
import { Button } from '@shared/ui/button';
import { ChoiceList } from '@shared/ui/choices';
import { ConfirmDialog } from '@shared/ui/confirm';
import { SelectField, TextField } from '@shared/ui/field';
import { StatusMessage, type StatusKind } from '@shared/ui/status';
import { Section } from '@/components/PageTitle';

const METRIC_LABEL: Record<MetricId, string> = { fitness: 'Fitness', nutrition: 'Nutrition', sleep: 'Sleep' };
const ALL_METRICS: MetricId[] = ['fitness', 'nutrition', 'sleep'];

type Pending = { kind: 'personal' } | { kind: 'fitness' } | { kind: 'delete' } | null;
type Msg = { section: 'personal' | 'fitness' | 'widgets'; kind: StatusKind; text: string } | null;

function numberError(v: string, min: number, max: number, what: string) {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n >= min && n <= max ? undefined : `Enter ${what} between ${min} and ${max}, or leave it empty.`;
}

export function ProfilePage() {
  const { user, updateProfile, deleteAccount, logOut, resetPrototype } = useUser();
  const navigate = useNavigate();
  const p = user.profile;

  const [personal, setPersonal] = useState({
    name: p.name,
    age: p.age?.toString() ?? '',
    weight: p.weightKg?.toString() ?? '',
    height: p.heightCm?.toString() ?? '',
  });
  const [personalErrors, setPersonalErrors] = useState<Record<string, string | undefined>>({});
  const [persona, setPersona] = useState<Persona>(p.persona);
  const [frequency, setFrequency] = useState<Frequency>(p.frequency);
  // Widget order: shown metrics first (in their order), then hidden ones.
  const [order, setOrder] = useState<MetricId[]>([...p.metrics, ...ALL_METRICS.filter((m) => !p.metrics.includes(m))]);
  const [shown, setShown] = useState<MetricId[]>(p.metrics);
  const [pending, setPending] = useState<Pending>(null);
  const [msg, setMsg] = useState<Msg>(null);

  const message = (section: NonNullable<Msg>['section']) =>
    msg?.section === section ? (
      <StatusMessage kind={msg.kind} onDismiss={() => setMsg(null)} className="mt-4">
        {msg.text}
      </StatusMessage>
    ) : null;

  const submitPersonal = (e: FormEvent) => {
    e.preventDefault();
    const errs = {
      name: personal.name.trim() ? undefined : 'Enter your name.',
      age: numberError(personal.age, 13, 120, 'an age'),
      weight: numberError(personal.weight, 25, 300, 'a weight in kg'),
      height: numberError(personal.height, 100, 250, 'a height in cm'),
    };
    setPersonalErrors(errs);
    if (Object.values(errs).some(Boolean)) {
      setMsg({ section: 'personal', kind: 'error', text: 'Your information was not saved. Fix the fields marked with an error.' });
      return;
    }
    setPending({ kind: 'personal' });
  };

  const move = (i: number, d: -1 | 1) => {
    const next = [...order];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    setOrder(next);
  };

  const saveWidgets = () => {
    if (shown.length === 0) {
      setMsg({ section: 'widgets', kind: 'error', text: 'Choose at least one metric to show on your dashboard.' });
      return;
    }
    updateProfile({ metrics: order.filter((m) => shown.includes(m)) });
    setMsg({ section: 'widgets', kind: 'success', text: 'Your dashboard widgets were saved.' });
  };

  const confirm = () => {
    if (pending?.kind === 'personal') {
      updateProfile({
        name: personal.name.trim(),
        age: personal.age ? Number(personal.age) : undefined,
        weightKg: personal.weight ? Number(personal.weight) : undefined,
        heightCm: personal.height ? Number(personal.height) : undefined,
      });
      setMsg({ section: 'personal', kind: 'success', text: 'Your personal information was saved.' });
    } else if (pending?.kind === 'fitness') {
      updateProfile({ persona, frequency });
      setMsg({ section: 'fitness', kind: 'success', text: 'Your fitness profile was changed. Your dashboard now reflects it.' });
    } else if (pending?.kind === 'delete') {
      deleteAccount();
      queueFlash({ kind: 'success', text: 'Your account and its data were deleted.' });
      navigate('/auth', { replace: true });
    }
    setPending(null);
  };

  return (
    <>
      <h1 className="sr-only">Profile and Settings</h1>
      <header className="flex flex-col items-center gap-3 text-center">
        <Avatar name={p.name} />
        <p className="m-0 text-2xl font-bold">{p.name}</p>
        <p className="m-0">{p.email}</p>
      </header>
      <hr className="my-6 h-0.5 border-0 bg-line" />

      <div className="flex flex-col gap-5">
        <Section title="Personal information">
          <form noValidate onSubmit={submitPersonal} className="mt-4 flex flex-col gap-4">
            <TextField label="Name" value={personal.name} onChange={(e) => setPersonal({ ...personal, name: e.target.value })} error={personalErrors.name} autoComplete="name" />
            <TextField label="Age (years)" inputMode="numeric" value={personal.age} onChange={(e) => setPersonal({ ...personal, age: e.target.value })} error={personalErrors.age} />
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Weight (kg)" inputMode="decimal" value={personal.weight} onChange={(e) => setPersonal({ ...personal, weight: e.target.value })} error={personalErrors.weight} />
              <TextField label="Height (cm)" inputMode="numeric" value={personal.height} onChange={(e) => setPersonal({ ...personal, height: e.target.value })} error={personalErrors.height} />
            </div>
            <Button type="submit">Save personal information</Button>
          </form>
          {message('personal')}
        </Section>

        <Section title="Fitness profile">
          <div className="mt-4 flex flex-col gap-4">
            <ChoiceList
              name="persona"
              legend="Your needs"
              legendClassName="text-base"
              choices={[
                { value: 'casual', label: 'Casual', description: 'Simple daily tracking' },
                { value: 'performance', label: 'Performance', description: 'Detailed data for training' },
              ]}
              value={[persona]}
              onChange={(v) => setPersona(v[0] as Persona)}
            />
            <SelectField label="How often do you exercise?" value={frequency} onChange={(e) => setFrequency(e.target.value as Frequency)}>
              <option value="rarely">Rarely or never</option>
              <option value="1-2">1 to 2 times a week</option>
              <option value="3-4">3 to 4 times a week</option>
              <option value="5+">5 or more times a week</option>
            </SelectField>
            <Button onClick={() => setPending({ kind: 'fitness' })} disabled={persona === p.persona && frequency === p.frequency}>
              Save fitness profile
            </Button>
          </div>
          {message('fitness')}
        </Section>

        <Section title="Dashboard widgets">
          <p className="m-0 mt-2">Choose which metrics appear on your dashboard and in what order.</p>
          <ol className="m-0 mt-4 flex list-none flex-col gap-3 p-0">
            {order.map((m, i) => (
              <li key={m} className="flex items-center gap-2 rounded-xl bg-bg p-2">
                <label className="flex min-h-12 flex-1 cursor-pointer items-center gap-3 px-2">
                  <input
                    type="checkbox"
                    className="size-6 accent-sleep-accent"
                    checked={shown.includes(m)}
                    onChange={() => setShown(shown.includes(m) ? shown.filter((x) => x !== m) : [...shown, m])}
                  />
                  <span>
                    <span className="font-bold">{METRIC_LABEL[m]}</span>
                    <span className="block">{shown.includes(m) ? 'Shown' : 'Hidden'}</span>
                  </span>
                </label>
                <Button variant="outline" size="icon" aria-label={`Move ${METRIC_LABEL[m]} up`} disabled={i === 0} onClick={() => move(i, -1)}>
                  <ArrowUp aria-hidden="true" />
                </Button>
                <Button variant="outline" size="icon" aria-label={`Move ${METRIC_LABEL[m]} down`} disabled={i === order.length - 1} onClick={() => move(i, 1)}>
                  <ArrowDown aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ol>
          <Button className="mt-4 w-full" onClick={saveWidgets}>
            Save dashboard widgets
          </Button>
          {message('widgets')}
        </Section>

        <Button variant="secondary" size="block" onClick={() => (logOut(), navigate('/auth'))}>
          <LogOut aria-hidden="true" /> Log out
        </Button>
      </div>

      <hr className="my-6 h-0.5 border-0 bg-line" />
      <Button variant="danger" size="block" onClick={() => setPending({ kind: 'delete' })}>
        <Trash2 aria-hidden="true" /> Delete account
      </Button>
      <Button variant="ghost" size="block" className="mt-3 underline" onClick={resetPrototype}>
        Reset prototype data (for testing)
      </Button>

      <ConfirmDialog
        open={pending?.kind === 'personal'}
        title="Save your personal information?"
        confirmLabel="Yes, save"
        onCancel={() => setPending(null)}
        onConfirm={confirm}
      >
        Your name, age, weight and height will be updated.
      </ConfirmDialog>
      <ConfirmDialog
        open={pending?.kind === 'fitness'}
        title="Change your fitness profile?"
        confirmLabel="Yes, change it"
        onCancel={() => setPending(null)}
        onConfirm={confirm}
      >
        Your dashboard and your daily goals will change to match the {persona === 'performance' ? 'Performance' : 'Casual'} profile.
      </ConfirmDialog>
      <ConfirmDialog
        open={pending?.kind === 'delete'}
        title="Are you sure?"
        confirmLabel="Delete my account"
        danger
        onCancel={() => setPending(null)}
        onConfirm={confirm}
      >
        Your account and all your saved data will be deleted. This cannot be undone.
      </ConfirmDialog>
    </>
  );
}
