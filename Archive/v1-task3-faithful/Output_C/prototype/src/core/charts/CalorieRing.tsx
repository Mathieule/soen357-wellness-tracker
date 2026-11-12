/**
 * Small calorie graph with the numbers beside it (Task 3, C19).
 * The ring is decorative; the same numbers are always written as text.
 */
export function CalorieRing({ eaten, goal, size = 112 }: { eaten: number; goal: number; size?: number }) {
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(eaten / goal, 1);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#5A5353" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#7FD98A"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${c * pct} ${c}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fill="#F2F0EF" fontSize={20} fontWeight={700} fontFamily="Arial">
        {Math.round(pct * 100)}%
      </text>
    </svg>
  );
}

/** Labelled progress bars for protein, carbohydrates and fat. */
export function MacroBars({ items }: { items: { label: string; value: number; goal: number; unit: string }[] }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-4 p-0">
      {items.map((it) => {
        const pct = Math.min(it.value / it.goal, 1);
        return (
          <li key={it.label}>
            <div className="flex justify-between text-base">
              <span className="font-bold">{it.label}</span>
              <span>
                {it.value} of {it.goal} {it.unit}
              </span>
            </div>
            <div
              role="progressbar"
              aria-label={it.label}
              aria-valuemin={0}
              aria-valuemax={it.goal}
              aria-valuenow={it.value}
              aria-valuetext={`${it.value} of ${it.goal} ${it.unit}`}
              className="mt-1 h-3 overflow-hidden rounded-full bg-raised"
            >
              <div className="h-full rounded-full bg-food-accent" style={{ width: `${pct * 100}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
