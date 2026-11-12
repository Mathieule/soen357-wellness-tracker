/**
 * Progress over the past week, month or year (Task 2, Exploring: "Browsing
 * progress charts from the past week, month, year"; Nutrition: "Graph
 * summarizing previous calorie intake (month, week, year)").
 * Week = daily bars, Month = daily trend line, Year = monthly bars.
 */
import { useState } from 'react';
import { rangeSeries, useUser, type Range, type SeriesKind } from '@core';
import { BarsChart, Card, CATEGORY, Segmented, SectionHeader, TrendChart, type Category } from '@ds';

const UNIT: Record<SeriesKind, string> = { calories: 'kcal', minutes: 'min', steps: 'steps', sleep: 'h' };

export function ProgressChart({ kind, title, category, goal, yearNote }: { kind: SeriesKind; title: string; category: Category; goal?: { week?: number; month?: number; year?: number }; yearNote?: string }) {
  const { user } = useUser();
  const [range, setRange] = useState<Range>('week');
  const pts = rangeSeries(user, kind, range).map((p) => ({ label: p.label, longLabel: p.longLabel, value: p.value, state: p.isNow ? ('today' as const) : undefined }));
  const accent = CATEGORY[category].accent;
  const unit = UNIT[kind];
  const g = goal?.[range];
  const chartTitle = `${title}, past ${range}`;
  const id = `prog-${kind}`;
  return (
    <Card aria-labelledby={id} className="lg:col-span-2">
      <SectionHeader id={id} title={title} />
      <Segmented
        label={`${title}: time range`}
        value={range}
        onChange={setRange}
        options={[
          { value: 'week', label: 'Week' },
          { value: 'month', label: 'Month' },
          { value: 'year', label: 'Year' },
        ]}
        className="mb-4"
      />
      {range === 'month' ? (
        <TrendChart points={pts} accent={accent} unit={unit} title={chartTitle} goal={g} />
      ) : (
        <BarsChart points={pts} accent={accent} unit={unit} title={chartTitle} goal={g} footnote={range === 'year' ? <span>{yearNote ?? 'One bar per month'}</span> : undefined} />
      )}
    </Card>
  );
}
