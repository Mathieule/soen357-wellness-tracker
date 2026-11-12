/**
 * C15–C17 Sleep page. Sections per experience:
 *   casual      → last night, week of nights, log
 *   training    → + sleep stages, bedtime regularity
 *   performance → + 14-night trend
 * Add / edit sleep for a day; tap a night to see its stage graph, edit or
 * delete it. SIMULATED: stages of hand-entered nights are estimated.
 */
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  buildStages, dayLabel, formatDay, formatDuration, formatLongDay, lastDays, lastSleep, minutesBetween, relativeDay, sleepConsistency, sleepMinutes, sortedSleep, stageTotals,
  today, useUser, weekComparison, type SleepSession,
} from '@core';
import { BarsChart, Button, Card, CATEGORY, ConfirmDialog, Delta, EmptyState, Hypnogram, InlineStatus, ListGroup, ListRow, Pill, SectionHeader, Sheet, StageBar, StatTile, TextField, TrendChart, useToast } from '@ds';
import { TopBar } from '../layout/TopBar';
import { useMainAction } from '../lib/focus';
import { ProgressChart } from '../lib/ProgressChart';

const ACCENT = CATEGORY.sleep.accent;
const hours = (m: number) => Math.round(m / 6) / 10;

export function quality(min: number, goal: number) {
  const r = min / goal;
  return r >= 0.94 ? 'Great night' : r >= 0.85 ? 'Good night' : r >= 0.75 ? 'A bit short' : 'Short night';
}

export function SleepScreen() {
  const { user, experience } = useUser();
  const addRef = useRef<HTMLButtonElement>(null);
  const [form, setForm] = useState<{ open: boolean; edit: SleepSession | null }>({ open: false, edit: null });
  const [detail, setDetail] = useState<SleepSession | null>(null);
  const mainKeys = useMainAction(addRef);
  const last = lastSleep(user);
  const g = user.profile.goals.sleepMin;

  const sections: Record<string, React.ReactNode> = {
    lastNight: <LastNight key="l" />,
    stages: last ? <Stages key="s" s={last} /> : null,
    weekDurations: user.sleep.length ? (
      <Card key="w" aria-labelledby="sw-title">
        <SectionHeader id="sw-title" title="Last 7 nights" />
        <BarsChart points={lastDays(7).map((d, i, arr) => ({ label: dayLabel(d), longLabel: formatLongDay(d), value: hours(sleepMinutes(user, [d])[0]), state: i === arr.length - 1 ? 'today' : undefined }))} accent={ACCENT} unit="h" title="Hours of sleep, last 7 nights" goal={hours(g)} />
      </Card>
    ) : null,
    consistency: <Consistency key="c" />,
    trend: user.sleep.length > 7 ? (
      <Card key="t" aria-labelledby="st-title" className="lg:col-span-2">
        <SectionHeader id="st-title" title="Sleep trend, 14 nights" subtitle={<Delta value={weekComparison(user).sleep.delta} label="this week vs last" />} />
        <TrendChart points={lastDays(14).map((d) => ({ label: String(Number(d.slice(8))), longLabel: formatLongDay(d), value: hours(sleepMinutes(user, [d])[0]) }))} accent={ACCENT} unit="h" title="Hours of sleep, last 14 nights" goal={hours(g)} />
      </Card>
    ) : null,
    progress: <ProgressChart key="p" kind="sleep" title="Hours of sleep" category="sleep" goal={{ week: hours(g), month: hours(g), year: hours(g) }} yearNote="Average per night, per month" />,
    log: <Log key="g" onOpen={setDetail} onAdd={() => setForm({ open: true, edit: null })} />,
  };

  return (
    <>
      <TopBar title="Sleep Metrics" category="sleep" subtitle={last ? `Last night: ${formatDuration(last.durationMin)}` : 'No nights recorded yet'} />
      <Button ref={addRef} onKeyDown={mainKeys} variant="sleep" size="lg" block className="mt-6" onClick={() => setForm({ open: true, edit: null })}>
        <Plus aria-hidden="true" /> Enter a new sleep log
      </Button>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">{experience.sleep.map((s) => sections[s])}</div>
      <SleepSheet open={form.open} edit={form.edit} onOpenChange={(o) => setForm({ open: o, edit: o ? form.edit : null })} />
      <SleepDetailSheet session={detail} onClose={() => setDetail(null)} onEdit={(s) => (setDetail(null), setForm({ open: true, edit: s }))} />
    </>
  );
}

function LastNight() {
  const { user, experience } = useUser();
  const s = lastSleep(user);
  const g = user.profile.goals.sleepMin;
  if (!s) return <div className="lg:col-span-2"><EmptyState category="sleep" title="No sleep recorded yet">Add last night's sleep to see your stages and trends.</EmptyState></div>;
  return (
    <Card hero="sleep" aria-labelledby="ln-title" className="lg:col-span-2">
      {/* C.1 (C1-02): label row on top so the duration keeps one line at 390 px. */}
      <div className="flex items-center justify-between gap-3">
        <h2 id="ln-title" className="m-0 text-lg font-bold">
          {relativeDay(s.date) === 'Today' ? 'Last night' : relativeDay(s.date)}
        </h2>
        <Pill tone="sleep">{quality(s.durationMin, g)}</Pill>
      </div>
      <p className="m-0 mt-2 whitespace-nowrap text-4xl font-bold">{formatDuration(s.durationMin)}</p>
      <p className="m-0 mt-1">
        {s.bedtime}–{s.wakeTime} · goal {formatDuration(g)}
      </p>
      {experience.detail !== 'simple' && (
        <div className="mt-5">
          <Hypnogram stages={s.stages} durationMin={s.durationMin} bedtime={s.bedtime} />
          {s.estimated && <p className="m-0 mt-2">Stages estimated (simulated, no sleep sensor).</p>}
        </div>
      )}
    </Card>
  );
}

function Stages({ s }: { s: SleepSession }) {
  const { experience } = useUser();
  const t = stageTotals(s);
  return (
    <Card aria-labelledby="stg-title">
      <SectionHeader id="stg-title" title="Sleep stages" />
      <StageBar totals={t} />
      {experience.detail === 'advanced' && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <StatTile label="Deep" value={formatDuration(t.Deep)} sub="Typical 13–23 %" />
          <StatTile label="REM" value={formatDuration(t.REM)} sub="Typical 20–25 %" />
        </div>
      )}
    </Card>
  );
}

function Consistency() {
  const { user } = useUser();
  const c = sleepConsistency(user);
  if (!c) return null;
  return (
    <Card aria-labelledby="con-title">
      <SectionHeader id="con-title" title="Bedtime regularity" />
      <div className="grid grid-cols-2 gap-2">
        <StatTile label="Usual bedtime" value={c.avgBedtime} />
        <StatTile label="Spread" value={`±${c.spreadMin}`} unit="min" sub={c.label} />
      </div>
      <p className="m-0 mt-3 text-ink-soft">A regular bedtime usually means better sleep.</p>
    </Card>
  );
}

function Log({ onOpen, onAdd }: { onOpen: (s: SleepSession) => void; onAdd: () => void }) {
  const { user } = useUser();
  const [shown, setShown] = useState(7);
  const all = sortedSleep(user);
  return (
    <section aria-labelledby="log-title" className="lg:col-span-2">
      <SectionHeader id="log-title" title="Previous sleep logs" subtitle="Tap a night to see its details." />
      {all.length === 0 ? (
        <EmptyState category="sleep" title="Your sleep log is empty" action={<Button variant="sleep" onClick={onAdd}><Plus aria-hidden="true" /> Add a night</Button>}>
          Each night you add appears here.
        </EmptyState>
      ) : (
        <>
          <ListGroup>
            {all.slice(0, shown).map((s) => (
              <li key={s.id}>
                <ListRow title={`${relativeDay(s.date)} · ${formatDuration(s.durationMin)}`} meta={`${s.bedtime}–${s.wakeTime} · ${quality(s.durationMin, user.profile.goals.sleepMin)}`} onClick={() => onOpen(s)} />
              </li>
            ))}
          </ListGroup>
          {all.length > shown && (
            <Button variant="outline" block className="mt-4" onClick={() => setShown(shown + 7)}>
              Show more ({all.length - shown} left)
            </Button>
          )}
        </>
      )}
    </section>
  );
}

export function SleepSheet({ open, edit, onOpenChange }: { open: boolean; edit: SleepSession | null; onOpenChange: (o: boolean) => void }) {
  const { user, saveSleep } = useUser();
  const toast = useToast();
  const [f, setF] = useState({ date: today(), bedtime: '23:00', wakeTime: '07:00' });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  useEffect(() => {
    if (!open) return;
    setErrors({});
    setF(edit ? { date: edit.date, bedtime: edit.bedtime, wakeTime: edit.wakeTime } : { date: today(), bedtime: '23:00', wakeTime: '07:00' });
  }, [open, edit]);
  const dur = f.bedtime && f.wakeTime ? minutesBetween(f.bedtime, f.wakeTime) : 0;
  const replaces = !edit && user.sleep.some((s) => s.date === f.date);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    const e = {
      date: !f.date ? 'Choose the date you woke up.' : f.date > today() ? 'The date cannot be in the future.' : undefined,
      bedtime: f.bedtime ? undefined : 'Enter the time you went to bed.',
      wakeTime: !f.wakeTime ? 'Enter the time you woke up.' : dur < 60 || dur > 16 * 60 ? 'Sleep must last between 1 and 16 hours. Check both times.' : undefined,
    };
    setErrors(e);
    if (Object.values(e).some(Boolean)) return;
    const r = saveSleep({ date: f.date, bedtime: f.bedtime, wakeTime: f.wakeTime, durationMin: dur, stages: buildStages(dur, Number(f.date.replaceAll('-', '')) + dur), estimated: true });
    toast('success', `Sleep ${r} for ${formatDay(f.date)}: ${formatDuration(dur)}.`);
    onOpenChange(false);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={edit ? 'Edit sleep log' : 'New sleep log'}
      description="When did you go to bed and wake up?"
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="sleep-form" variant="sleep">
            Save night
          </Button>
        </>
      }
    >
      <form id="sleep-form" noValidate onSubmit={submit} className="flex flex-col gap-5">
        {Object.values(errors).some(Boolean) && <InlineStatus kind="error">The night was not saved. Fix the fields marked with an error.</InlineStatus>}
        <TextField label="Date you woke up" type="date" max={today()} value={f.date} onChange={set('date')} error={errors.date} disabled={!!edit} hint={edit ? 'The date cannot change when editing.' : undefined} />
        {replaces && <InlineStatus kind="info">A night is already saved for {formatDay(f.date)}. Saving will replace it.</InlineStatus>}
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Bedtime" type="time" value={f.bedtime} onChange={set('bedtime')} error={errors.bedtime} />
          <TextField label="Wake-up time" type="time" value={f.wakeTime} onChange={set('wakeTime')} error={errors.wakeTime} />
        </div>
        <div className="inset flex items-center justify-between p-4" aria-live="polite">
          <span>Total sleep</span>
          <strong className="text-2xl">{dur ? formatDuration(dur) : '–'}</strong>
        </div>
        <p className="m-0 text-ink-soft">Sleep stages will be estimated (simulated, there is no sleep sensor).</p>
      </form>
    </Sheet>
  );
}

function SleepDetailSheet({ session, onClose, onEdit }: { session: SleepSession | null; onClose: () => void; onEdit: (s: SleepSession) => void }) {
  const { deleteSleep, user, iteration } = useUser();
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <Sheet
        open={!!session && !confirm}
        onOpenChange={(o) => !o && onClose()}
        title={session ? formatLongDay(session.date) : ''}
        description={session ? `${formatDuration(session.durationMin)} · ${session.bedtime} to ${session.wakeTime}` : undefined}
        footer={
          session && (
            <>
              {iteration.editDelete ? (
                <Button variant="secondary" onClick={() => setConfirm(true)}>
                  <Trash2 aria-hidden="true" /> Delete
                </Button>
              ) : (
                <Button variant="secondary" onClick={onClose}>
                  Return
                </Button>
              )}
              <Button onClick={() => onEdit(session)}>
                <Pencil aria-hidden="true" /> Edit
              </Button>
            </>
          )
        }
      >
        {session && (
          <>
            <Pill tone="sleep">{quality(session.durationMin, user.profile.goals.sleepMin)}</Pill>
            <div className="mt-4">
              <Hypnogram stages={session.stages} durationMin={session.durationMin} bedtime={session.bedtime} />
            </div>
            <div className="mt-4">
              <StageBar totals={stageTotals(session)} />
            </div>
            {session.estimated && <p className="m-0 mt-3 text-ink-soft">Stages estimated (simulated).</p>}
          </>
        )}
      </Sheet>
      <ConfirmDialog
        open={confirm}
        title="Delete this night?"
        confirmLabel="Delete night"
        danger
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          if (session) {
            deleteSleep(session.id);
            toast('success', `Night of ${formatDay(session.date)} deleted.`);
          }
          setConfirm(false);
          onClose();
        }}
      >
        The sleep saved for {session ? formatLongDay(session.date) : ''} will be removed.
      </ConfirmDialog>
    </>
  );
}
