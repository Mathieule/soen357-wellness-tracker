/**
 * Multiple-choice list for the questionnaire and settings (Task 3, C2).
 * Uses native radio / checkbox inputs inside a <fieldset> with a <legend>,
 * so screen readers and keyboards work without extra scripting.
 * Each option row is at least 56 px tall and options are spaced 16 px apart.
 */
import { Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface Choice<T extends string> {
  value: T;
  label: string;
  description?: string;
}

interface ChoiceListProps<T extends string> {
  name: string;
  legend: ReactNode;
  choices: Choice<T>[];
  multiple?: boolean;
  value: T[];
  onChange: (value: T[]) => void;
  /** Id of an element describing the group (instructions or error). */
  describedBy?: string;
  invalid?: boolean;
  legendClassName?: string;
}

export function ChoiceList<T extends string>({
  name,
  legend,
  choices,
  multiple,
  value,
  onChange,
  describedBy,
  invalid,
  legendClassName,
}: ChoiceListProps<T>) {
  const toggle = (v: T) => {
    if (!multiple) return onChange([v]);
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  };
  return (
    <fieldset className="m-0 border-0 p-0" aria-describedby={describedBy} aria-invalid={invalid || undefined}>
      <legend className={cn('mb-4 p-0 text-xl font-bold', legendClassName)}>{legend}</legend>
      <div className="flex flex-col gap-4">
        {choices.map((c) => {
          const checked = value.includes(c.value);
          return (
            <label
              key={c.value}
              className={cn(
                'relative flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-ink',
                checked ? 'border-ink bg-sleep' : 'border-line bg-raised',
              )}
            >
              <input
                type={multiple ? 'checkbox' : 'radio'}
                name={name}
                value={c.value}
                checked={checked}
                onChange={() => toggle(c.value)}
                className="peer sr-only"
              />
              {/* Visual indicator: shape + check mark, not colour alone. */}
              <span
                aria-hidden="true"
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center border-2 border-ink',
                  multiple ? 'rounded-md' : 'rounded-full',
                  checked && 'bg-ink text-bg',
                )}
              >
                {checked && <Check className="size-5" strokeWidth={3} />}
              </span>
              <span className="flex flex-col">
                <span className="text-base font-bold">{c.label}</span>
                {c.description && <span className="text-base">{c.description}</span>}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
