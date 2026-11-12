/**
 * C18 Nutrition menu, Output C.
 * Kept from B: Back + Settings, photo recognition (simulated) as the main
 * action with focus rules and ↑ to nav bar, meal detail, nutrient details.
 * NEW in C:
 *  - Two ways to add food: "Scan a photo" and "Enter manually".
 *  - Today card: calorie ring, kcal left, macro bars, in one place.
 *  - "Calories, last 7 days" bar chart with the goal line.
 *  - Today's meals grouped by meal (Breakfast, Lunch, Snack, Dinner) with an
 *    empty state + "Add" button for meals not logged yet.
 *  - Previous days (history): tap a day to see its meals.
 */
import { Camera, ChevronRight, PencilLine, Plus } from 'lucide-react';
import { useRef, useState } from 'react';
import { MacroBars } from '@shared/charts/CalorieRing';
import { WeekBars } from '@shared/charts/WeekBars';
import { useUser } from '@shared/data/appData';
import { DAY_SHORT } from '@shared/data/program';
import { mealsOn, totalsOf } from '@shared/data/selectors';
import type { Meal, MealType } from '@shared/data/types';
import { addDays, formatDay, fromISODate, today } from '@shared/lib/dates';
import { Button } from '@shared/ui/button';
import { CATEGORY, ProgressRing, SectionHeader } from '@shared/ui/kit';
import { StatusMessage } from '@shared/ui/status';
import { AddFoodDialog, DayMealsDialog, ManualMealDialog, MealDetailDialog, type MealDraft } from '@/components/NutritionDialogs';
import { TopBar } from '@/components/TopBar';
import { arrowUpToNav, useInitialFocus } from '@/lib/focus';

const MEALS: MealType[] = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];

export function NutritionPage() {
  const { user, addMeal } = useUser();
  const addRef = useRef<HTMLButtonElement>(null);
  const t = today();
  const meals = mealsOn(user);
  const totals = totalsOf(meals);
  const g = user.goals;
  const left = Math.max(g.calories - totals.calories, 0);
  const [photo, setPhoto] = useState(false);
  const [manual, setManual] = useState(false);
  const [prefill, setPrefill] = useState<MealDraft | null>(null);
  const [detail, setDetail] = useState<Meal | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useInitialFocus(addRef);

  const week = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(t, i - 6);
    return {
      label: DAY_SHORT[(fromISODate(date).getDay() + 6) % 7],
      longLabel: formatDay(date),
      value: totalsOf(mealsOn(user, date)).calories,
    };
  });
  const previous = Array.from({ length: 6 }, (_, i) => addDays(t, -(i + 1)))
    .map((date) => ({ date, meals: mealsOn(user, date) }))
    .filter((d) => d.meals.length > 0);

  const save = (m: Omit<Meal, 'id'>) => {
    addMeal(m);
    setStatus(`Food saved: ${m.name} (${m.calories} kcal) added to ${m.mealType.toLowerCase()}.`);
  };
  const openManual = (p?: MealDraft) => {
    setPrefill(p ?? null);
    setManual(true);
  };

  return (
    <>
      <TopBar back title="Nutrition Metrics" metric="nutrition" />

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Button ref={addRef} onKeyDown={arrowUpToNav} variant="nutrition" size="block" className="rounded-2xl" onClick={() => setPhoto(true)}>
          <Camera aria-hidden="true" /> Scan a photo
        </Button>
        <Button variant="outline" size="block" className="rounded-2xl" onClick={() => openManual()}>
          <PencilLine aria-hidden="true" /> Enter manually
        </Button>
      </div>
      {status && (
        <StatusMessage kind="success" onDismiss={() => setStatus(null)} className="mt-3">
          {status}
        </StatusMessage>
      )}

      <section aria-labelledby="today-food" className="card mt-5 p-4">
        <SectionHeader id="today-food" title="Today" />
        <div className="flex items-center gap-4">
          <ProgressRing value={totals.calories} goal={g.calories} accent={CATEGORY.nutrition.accent} label="Calories" display={`${totals.calories.toLocaleString('en-CA')} kcal`} unit={`of ${g.calories.toLocaleString('en-CA')}`} size={112} stroke={12} />
          <div className="flex-1">
            <p className="m-0 text-3xl font-bold leading-tight">{left.toLocaleString('en-CA')}</p>
            <p className="m-0">kcal left today</p>
          </div>
        </div>
        <div className="mt-5">
          <MacroBars
            items={[
              { label: 'Protein', value: totals.proteinG, goal: g.proteinG, unit: 'g' },
              { label: 'Carbohydrates', value: totals.carbsG, goal: g.carbsG, unit: 'g' },
              { label: 'Fat', value: totals.fatG, goal: g.fatG, unit: 'g' },
            ]}
          />
        </div>
      </section>

      <section aria-labelledby="meals-title" className="mt-6">
        <SectionHeader id="meals-title" title="Today's meals" />
        <div className="flex flex-col gap-3">
          {MEALS.map((type) => {
            const items = meals.filter((m) => m.mealType === type);
            const kcal = items.reduce((s, m) => s + m.calories, 0);
            return (
              <div key={type} className="card overflow-hidden">
                <div className="flex min-h-12 items-center justify-between px-4 pt-3">
                  <h3 className="m-0 text-lg font-bold">{type}</h3>
                  <span>{items.length ? `${kcal} kcal` : 'Nothing yet'}</span>
                </div>
                {items.length > 0 ? (
                  <ul className="m-0 mt-1 list-none p-0">
                    {items.map((m) => (
                      <li key={m.id} className="border-t border-hairline">
                        <button type="button" onClick={() => setDetail(m)} className="flex min-h-14 w-full cursor-pointer items-center gap-3 bg-transparent px-4 py-2 text-left text-base text-ink hover:bg-card-hi">
                          <span className="flex-1">
                            <span className="block font-bold">{m.name}</span>
                            {m.time} · {m.calories} kcal{m.source === 'photo' ? ' · from photo' : ''}
                          </span>
                          <ChevronRight aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 pb-3 pt-1">
                    <Button variant="ghost" className="rounded-full border border-dashed border-line" onClick={() => openManual({ mealType: type })} aria-label={`Add ${type.toLowerCase()}`}>
                      <Plus aria-hidden="true" /> Add {type.toLowerCase()}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="cal-week" className="card mt-6 p-4">
        <SectionHeader id="cal-week" title="Calories, last 7 days" />
        <WeekBars data={week} goal={g.calories} accent={CATEGORY.nutrition.accent} unit="kcal" caption="Calories eaten per day for the last 7 days" />
      </section>

      {previous.length > 0 && (
        <section aria-labelledby="prev-days" className="mt-6">
          <SectionHeader id="prev-days" title="Previous days" />
          <ul className="card m-0 list-none overflow-hidden p-0">
            {previous.map((d) => (
              <li key={d.date} className="border-t border-hairline first:border-t-0">
                <button type="button" onClick={() => setDay(d.date)} className="flex min-h-14 w-full cursor-pointer items-center gap-3 bg-transparent px-4 py-3 text-left text-base text-ink hover:bg-card-hi">
                  <span className="flex-1">
                    <span className="block font-bold">{formatDay(d.date)}</span>
                    {d.meals.length} items · {totalsOf(d.meals).calories.toLocaleString('en-CA')} kcal
                  </span>
                  <ChevronRight aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <AddFoodDialog open={photo} onOpenChange={setPhoto} onSave={save} onManual={openManual} />
      <ManualMealDialog open={manual} onOpenChange={setManual} prefill={prefill} onSave={save} />
      <MealDetailDialog meal={detail} onClose={() => setDetail(null)} />
      <DayMealsDialog date={day} meals={day ? mealsOn(user, day) : []} onClose={() => setDay(null)} />
    </>
  );
}
