/**
 * C18–C21 Nutrition page. Sections per experience:
 *   casual      → today, meals, previous days
 *   training    → + macros, calories this week
 *   performance → + macro rings with g/kg targets, fuel advice for today's session
 * Two main actions: "Scan a photo" (simulated recognition) and "Enter manually".
 */
import { Camera, PencilLine, Plus } from 'lucide-react';
import { useRef, useState } from 'react';
import { addDays, mealsOn, relativeDay, today, totals, useUser, weekPlan, type Meal, type MealType } from '@core';
import { Button, Card, CATEGORY, EmptyState, ListGroup, ListRow, ProgressRing, SectionHeader } from '@ds';
import { TopBar } from '../layout/TopBar';
import { useMainAction } from '../lib/focus';
import { ProgressChart } from '../lib/ProgressChart';
import { DaySheet, MealDetailSheet, MealSheet, MEAL_TYPES, PhotoSheet, type MealDraft } from './MealSheets';

const ACCENT = CATEGORY.nutrition.accent;

export function NutritionScreen() {
  const { user, experience } = useUser();
  const addRef = useRef<HTMLButtonElement>(null);
  const [photo, setPhoto] = useState(false);
  const [manual, setManual] = useState<{ open: boolean; draft: MealDraft | null }>({ open: false, draft: null });
  const [detail, setDetail] = useState<Meal | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const mainKeys = useMainAction(addRef);
  const openManual = (draft?: MealDraft) => setManual({ open: true, draft: draft ?? null });
  const t = totals(mealsOn(user));
  const g = user.profile.goals;

  const sections: Record<string, React.ReactNode> = {
    today: <TodayCard key="t" />,
    macros: <Macros key="m" />,
    fuel: <Fuel key="f" />,
    meals: <Meals key="ml" onOpen={setDetail} onAdd={(mt) => openManual({ mealType: mt })} />,
    progress: <ProgressChart key="w" kind="calories" title="Calorie intake" category="nutrition" goal={{ week: g.calories, month: g.calories, year: g.calories }} yearNote="Average per day, per month" />,
    history: <History key="h" onDay={setDay} />,
  };

  return (
    <>
      <TopBar title="Nutrition Metrics" category="nutrition" subtitle={`${Math.max(0, g.calories - t.calories).toLocaleString('en-CA')} kcal left today`} />
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button ref={addRef} onKeyDown={mainKeys} variant="nutrition" size="lg" onClick={() => setPhoto(true)}>
          <Camera aria-hidden="true" /> Scan photo
        </Button>
        <Button variant="secondary" size="lg" onClick={() => openManual()}>
          <PencilLine aria-hidden="true" /> Type it in
        </Button>
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">{experience.nutrition.map((s) => sections[s])}</div>

      <PhotoSheet open={photo} onOpenChange={setPhoto} onManual={openManual} />
      <MealSheet open={manual.open} draft={manual.draft} onOpenChange={(o) => setManual({ open: o, draft: o ? manual.draft : null })} />
      <MealDetailSheet meal={detail} onClose={() => setDetail(null)} onEdit={(m) => (setDetail(null), openManual(m))} />
      <DaySheet date={day} onClose={() => setDay(null)} onOpenMeal={(m) => (setDay(null), setDetail(m))} />
    </>
  );
}

function TodayCard() {
  const { user, experience } = useUser();
  const t = totals(mealsOn(user));
  const g = user.profile.goals;
  const left = Math.max(0, g.calories - t.calories);
  return (
    <Card hero="nutrition" aria-labelledby="nt-title" className="lg:col-span-2">
      <h2 id="nt-title" className="m-0 text-lg font-bold">
        Today
      </h2>
      <div className="mt-4 flex items-center gap-5">
        <ProgressRing value={t.calories} goal={g.calories} accent={ACCENT} size={132} stroke={14}>
          <span className="text-2xl font-bold leading-none">{t.calories.toLocaleString('en-CA')}</span>
          <span>kcal</span>
        </ProgressRing>
        <div className="min-w-0 flex-1">
          <p className="m-0 text-4xl font-bold leading-none">{left.toLocaleString('en-CA')}</p>
          <p className="m-0 mt-1">kcal left of {g.calories.toLocaleString('en-CA')}</p>
          {experience.detail !== 'simple' && (
            <p className="m-0 mt-3">
              P&nbsp;{t.proteinG}&nbsp;g · C&nbsp;{t.carbsG}&nbsp;g · F&nbsp;{t.fatG}&nbsp;g
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

function Macros() {
  const { user, experience } = useUser();
  const t = totals(mealsOn(user));
  const g = user.profile.goals;
  const rows: [string, number, number][] = [
    ['Protein', t.proteinG, g.proteinG],
    ['Carbohydrates', t.carbsG, g.carbsG],
    ['Fat', t.fatG, g.fatG],
  ];
  if (experience.detail === 'advanced') {
    const kg = user.profile.weightKg ?? 70;
    return (
      <Card aria-labelledby="mc-title">
        <SectionHeader id="mc-title" title="Macros" subtitle={`Protein target ${(g.proteinG / kg).toFixed(1)} g per kg`} />
        <div className="grid grid-cols-3 gap-2 text-center">
          {rows.map(([k, v, goal]) => (
            <div key={k} className="flex flex-col items-center gap-2">
              <ProgressRing value={v} goal={goal} accent={ACCENT} size={80} stroke={9}>
                <span className="font-bold">{Math.round((v / goal) * 100)}%</span>
              </ProgressRing>
              <span className="font-bold">{k === 'Carbohydrates' ? 'Carbs' : k}</span>
              <span className="text-ink-soft">
                {v} / {goal} g
              </span>
            </div>
          ))}
        </div>
      </Card>
    );
  }
  return (
    <Card aria-labelledby="mc-title">
      <SectionHeader id="mc-title" title="Macros" />
      <ul className="m-0 grid list-none gap-4 p-0">
        {rows.map(([k, v, goal]) => (
          <li key={k}>
            <div className="flex justify-between">
              <span className="font-bold">{k}</span>
              <span>
                {v} of {goal} g
              </span>
            </div>
            <div role="progressbar" aria-label={k} aria-valuemin={0} aria-valuemax={goal} aria-valuenow={v} aria-valuetext={`${v} of ${goal} grams`} className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-sunken">
              <div className="anim-grow-x h-full rounded-full bg-food" style={{ width: `${Math.min(v / goal, 1) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/** Performance: fuel advice tied to today's planned session. */
function Fuel() {
  const { user } = useUser();
  const s = weekPlan(user.profile, user.workouts).find((d) => d.isToday)?.session;
  const text = !s
    ? 'Rest day: keep protein steady and carbohydrates moderate.'
    : s.intensity === 'hard'
      ? `Hard ${s.type.toLowerCase()} today: about 60 g of carbohydrates 2 hours before, and 25–30 g of protein within an hour after.`
      : `${s.title} today: a normal meal 2–3 hours before is enough; add protein after.`;
  return (
    <Card aria-labelledby="fuel-title">
      <SectionHeader id="fuel-title" title="Fuel for today" />
      <p className="m-0 text-lg">{text}</p>
      <p className="m-0 mt-3 text-ink-soft">General guidance written for the prototype, not medical advice.</p>
    </Card>
  );
}

function Meals({ onOpen, onAdd }: { onOpen: (m: Meal) => void; onAdd: (t: MealType) => void }) {
  const { user } = useUser();
  const meals = mealsOn(user);
  return (
    <section aria-labelledby="meals-title" className="lg:col-span-2">
      <SectionHeader id="meals-title" title="Today's meals" />
      <div className="grid gap-3 lg:grid-cols-2">
        {MEAL_TYPES.map((mt) => {
          const items = meals.filter((m) => m.mealType === mt);
          const kcal = items.reduce((s, m) => s + m.calories, 0);
          return (
            <div key={mt} className="card overflow-hidden">
              <div className="flex min-h-14 items-center justify-between px-5 pt-2">
                <h3 className="m-0 text-lg font-bold">{mt}</h3>
                <span className="text-ink-soft">{items.length ? `${kcal} kcal` : 'Nothing yet'}</span>
              </div>
              {items.length ? (
                <ul className="m-0 list-none divide-y divide-hair border-t border-hair p-0">
                  {items.map((m) => (
                    <li key={m.id}>
                      <ListRow title={m.name} meta={`${m.time} · ${m.servings && m.servings !== 1 ? `${m.servings} servings · ` : ''}${m.calories} kcal${m.source === 'photo' ? ' · from photo' : ''}`} onClick={() => onOpen(m)} />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-5 pb-4">
                  <Button variant="outline" size="sm" onClick={() => onAdd(mt)} aria-label={`Add ${mt.toLowerCase()}`}>
                    <Plus aria-hidden="true" /> Add {mt.toLowerCase()}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function History({ onDay }: { onDay: (d: string) => void }) {
  const { user } = useUser();
  const days = Array.from({ length: 13 }, (_, i) => addDays(today(), -(i + 1))).filter((d) => user.meals.some((m) => m.date === d));
  return (
    <section aria-labelledby="nh-title" className="lg:col-span-2">
      <SectionHeader id="nh-title" title="Previous meals" subtitle="Tap a day to see its meals." />
      {days.length === 0 ? (
        <EmptyState category="nutrition" title="No history yet">Meals from previous days will appear here.</EmptyState>
      ) : (
        <ListGroup>
          {days.slice(0, 7).map((d) => {
            const t = totals(mealsOn(user, d));
            return (
              <li key={d}>
                <ListRow title={relativeDay(d)} meta={`${mealsOn(user, d).length} items · ${t.calories.toLocaleString('en-CA')} kcal · P ${t.proteinG} g`} onClick={() => onDay(d)} />
              </li>
            );
          })}
        </ListGroup>
      )}
    </section>
  );
}
