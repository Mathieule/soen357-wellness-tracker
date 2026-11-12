/**
 * C18 Nutrition menu (Output A).
 * Today's nutrition goals (C19: small graph with the numbers beside it) and a
 * button beside them that opens in-depth nutrient data. Below: the light green
 * "Add food" bar button (C21), then today's nutrition log (C20).
 * Keyboard focus starts on "Add food", then goes through the log.
 */
import { ChevronRight, Plus, Soup } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { CalorieRing } from '@shared/charts/CalorieRing';
import { useUser } from '@shared/data/appData';
import { mealsOn, totalsOf } from '@shared/data/selectors';
import type { Meal } from '@shared/data/types';
import { Button } from '@shared/ui/button';
import { StatusMessage } from '@shared/ui/status';
import { AddFoodDialog, MealDetailDialog, NutrientDetailDialog } from '@/components/NutritionDialogs';
import { PageTitle, Section } from '@/components/PageTitle';

export function NutritionPage() {
  const { user, addMeal } = useUser();
  const addRef = useRef<HTMLButtonElement>(null);
  const meals = mealsOn(user);
  const totals = totalsOf(meals);
  const left = Math.max(user.goals.calories - totals.calories, 0);
  const [adding, setAdding] = useState(false);
  const [nutrients, setNutrients] = useState(false);
  const [detail, setDetail] = useState<Meal | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => addRef.current?.focus(), []);

  return (
    <>
      <PageTitle icon={<Soup aria-hidden="true" className="size-8" />}>Nutrition Metrics</PageTitle>

      <Section title="Today's goals" className="mt-5">
        <div className="mt-3 flex items-center gap-4">
          <CalorieRing eaten={totals.calories} goal={user.goals.calories} />
          <div className="flex-1">
            <p className="m-0 text-2xl font-bold">{totals.calories.toLocaleString('en-CA')} kcal</p>
            <p className="m-0">of {user.goals.calories.toLocaleString('en-CA')} kcal goal</p>
            <p className="m-0 mt-1">{left.toLocaleString('en-CA')} kcal left</p>
          </div>
        </div>
        <Button variant="outline" className="mt-4 w-full" onClick={() => setNutrients(true)}>
          Nutrient details
        </Button>
      </Section>

      <Button ref={addRef} variant="nutrition" size="block" className="mt-5" onClick={() => setAdding(true)}>
        <Plus aria-hidden="true" /> Add food
      </Button>
      {status && (
        <StatusMessage kind="success" onDismiss={() => setStatus(null)} className="mt-3">
          {status}
        </StatusMessage>
      )}

      <section aria-labelledby="food-log-title" className="mt-6">
        <h2 id="food-log-title" className="m-0 text-xl font-bold">
          Today's food log
        </h2>
        {meals.length === 0 ? (
          <p className="mt-3">No food added today.</p>
        ) : (
          <ul className="m-0 mt-3 flex list-none flex-col gap-3 p-0">
            {meals.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => setDetail(m)}
                  className="flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-xl border-2 border-transparent bg-raised px-4 py-3 text-left text-base text-ink hover:border-line"
                >
                  <span className="flex-1">
                    <span className="block font-bold">{m.name}</span>
                    {m.mealType} · {m.time} · {m.calories} kcal
                  </span>
                  <ChevronRight aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <AddFoodDialog
        open={adding}
        onOpenChange={setAdding}
        onSave={(m) => {
          addMeal(m);
          setStatus(`Food saved: ${m.name} (${m.calories} kcal) added to ${m.mealType.toLowerCase()}.`);
        }}
      />
      <MealDetailDialog meal={detail} onClose={() => setDetail(null)} />
      <NutrientDetailDialog open={nutrients} onOpenChange={setNutrients} totals={totals} goals={user.goals} />
    </>
  );
}
