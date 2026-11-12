/**
 * Form controls. Every control has a visible label (AR5) and instructions /
 * errors linked with aria-describedby (AR9, AR10). Native inputs are used
 * underneath (radio, checkbox, number, select) so keyboard and screen-reader
 * support comes from the platform.
 */
import { AlertCircle, Check, Minus, Plus } from 'lucide-react';
import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '../cn';

const control =
  'block w-full min-h-13 rounded-[var(--radius-field)] border-2 border-hair bg-sunken px-4 py-3 text-base text-ink placeholder:text-ink-soft transition-colors hover:border-line/60 focus:border-ink aria-[invalid=true]:border-act';

interface Base {
  label: string;
  hint?: ReactNode;
  error?: string;
  className?: string;
}

function useIds(id?: string) {
  const auto = useId();
  const f = id ?? auto;
  return { f, hint: `${f}-hint`, err: `${f}-err` };
}

function describedBy(hint: unknown, error: unknown, ids: ReturnType<typeof useIds>) {
  return [hint ? ids.hint : null, error ? ids.err : null].filter(Boolean).join(' ') || undefined;
}

export function FieldError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="m-0 flex items-start gap-2 text-base">
      <AlertCircle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-act" />
      <span>
        <span className="sr-only">Error: </span>
        {children}
      </span>
    </p>
  );
}

function Shell({ label, hint, error, className, ids, children }: Base & { ids: ReturnType<typeof useIds>; children: ReactNode }) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-2', className)}>
      <label htmlFor={ids.f} className="font-bold">
        {label}
      </label>
      {hint && (
        <p id={ids.hint} className="m-0 -mt-1 text-ink-soft">
          {hint}
        </p>
      )}
      {children}
      {error && <FieldError id={ids.err}>{error}</FieldError>}
    </div>
  );
}

export function TextField({ label, hint, error, className, id, ...p }: Base & InputHTMLAttributes<HTMLInputElement>) {
  const ids = useIds(id);
  return (
    <Shell label={label} hint={hint} error={error} className={className} ids={ids}>
      <input id={ids.f} className={control} aria-invalid={error ? true : undefined} aria-describedby={describedBy(hint, error, ids)} {...p} />
    </Shell>
  );
}

export function SelectField({ label, hint, error, className, id, children, ...p }: Base & SelectHTMLAttributes<HTMLSelectElement>) {
  const ids = useIds(id);
  return (
    <Shell label={label} hint={hint} error={error} className={className} ids={ids}>
      <select id={ids.f} className={cn(control, 'appearance-auto')} aria-invalid={error ? true : undefined} aria-describedby={describedBy(hint, error, ids)} {...p}>
        {children}
      </select>
    </Shell>
  );
}

export function TextAreaField({ label, hint, error, className, id, ...p }: Base & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ids = useIds(id);
  return (
    <Shell label={label} hint={hint} error={error} className={className} ids={ids}>
      <textarea id={ids.f} className={cn(control, 'min-h-24')} aria-invalid={error ? true : undefined} aria-describedby={describedBy(hint, error, ids)} {...p} />
    </Shell>
  );
}

/** Number with − / + buttons around a native number input. */
export function Stepper({ label, value, onChange, min, max, step = 1, unit, hint, error, id }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number; unit?: string; hint?: ReactNode; error?: string; id?: string }) {
  const ids = useIds(id);
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  return (
    <Shell label={label} hint={hint} error={error} ids={ids}>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => onChange(clamp(value - step))} disabled={value <= min} aria-label={`Decrease ${label}`} className="inline-flex size-13 shrink-0 cursor-pointer items-center justify-center rounded-full bg-surface-hi text-ink disabled:cursor-not-allowed disabled:bg-transparent disabled:ring-2 disabled:ring-hair">
          <Minus aria-hidden="true" className="size-5" />
        </button>
        <div className="relative flex-1">
          <input
            id={ids.f}
            type="number"
            inputMode="numeric"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(clamp(Number(e.target.value) || 0))}
            aria-describedby={describedBy(hint, error, ids)}
            className={cn(control, 'text-center text-2xl font-bold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none')}
          />
          {unit && <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-soft">{unit}</span>}
        </div>
        <button type="button" onClick={() => onChange(clamp(value + step))} disabled={value >= max} aria-label={`Increase ${label}`} className="inline-flex size-13 shrink-0 cursor-pointer items-center justify-center rounded-full bg-surface-hi text-ink disabled:cursor-not-allowed disabled:bg-transparent disabled:ring-2 disabled:ring-hair">
          <Plus aria-hidden="true" className="size-5" />
        </button>
      </div>
    </Shell>
  );
}

export interface Choice<T extends string> {
  value: T;
  label: string;
  description?: string;
  icon?: ReactNode;
}

/** Large selectable cards (questionnaire, settings). Native radio / checkbox inside a fieldset. */
export function ChoiceCards<T extends string>({ name, legend, hint, choices, value, onChange, multiple, error, columns = 1, legendClassName }: { name: string; legend: ReactNode; hint?: ReactNode; choices: Choice<T>[]; value: T[]; onChange: (v: T[]) => void; multiple?: boolean; error?: string; columns?: 1 | 2; legendClassName?: string }) {
  const ids = useIds();
  const toggle = (v: T) => (multiple ? onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]) : onChange([v]));
  return (
    <fieldset className="m-0 min-w-0 border-0 p-0" aria-describedby={[hint ? ids.hint : '', error ? ids.err : ''].join(' ').trim() || undefined}>
      <legend className={cn('mb-1 p-0 text-xl font-bold', legendClassName)}>{legend}</legend>
      {hint && (
        <p id={ids.hint} className="m-0 mb-4 text-ink-soft">
          {hint}
        </p>
      )}
      <div className={cn('grid gap-3', columns === 2 && 'grid-cols-2')}>
        {choices.map((c) => {
          const on = value.includes(c.value);
          return (
            <label
              key={c.value}
              className={cn(
                'relative flex min-h-16 cursor-pointer items-center gap-4 rounded-[18px] border-2 px-4 py-3.5 transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-ink',
                on ? 'border-ink bg-surface-hi' : 'border-transparent bg-surface hover:bg-surface-hi',
              )}
            >
              <input type={multiple ? 'checkbox' : 'radio'} name={name} value={c.value} checked={on} onChange={() => toggle(c.value)} className="sr-only" />
              {c.icon && <span aria-hidden="true" className="shrink-0">{c.icon}</span>}
              <span className="min-w-0 flex-1">
                <span className="block text-lg font-bold">{c.label}</span>
                {c.description && <span className="block text-ink-soft">{c.description}</span>}
              </span>
              <span aria-hidden="true" className={cn('flex size-7 shrink-0 items-center justify-center border-2 border-ink', multiple ? 'rounded-lg' : 'rounded-full', on && 'bg-ink text-on-ink')}>
                {on && <Check className="size-4" strokeWidth={3.5} />}
              </span>
            </label>
          );
        })}
      </div>
      {error && (
        <div className="mt-3">
          <FieldError id={ids.err}>{error}</FieldError>
        </div>
      )}
    </fieldset>
  );
}

/** Segmented control (single choice), e.g. Week / Month / Year. */
export function Segmented<T extends string>({ label, options, value, onChange, className }: { label: string; options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; className?: string }) {
  const name = useId();
  return (
    <fieldset className={cn('m-0 min-w-0 border-0 p-0', className)}>
      <legend className="sr-only">{label}</legend>
      <div className="inset flex gap-1 rounded-full p-1">
        {options.map((o) => (
          <label key={o.value} className={cn('flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-full px-3 text-base transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-ink', value === o.value ? 'bg-ink font-bold text-on-ink' : 'text-ink hover:bg-surface')}>
            <input type="radio" name={name} className="sr-only" checked={value === o.value} onChange={() => onChange(o.value)} />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Toggle chips (single or multiple). */
export function ChipGroup<T extends string>({ label, options, value, onChange, multiple }: { label: string; options: { value: T; label: string; icon?: ReactNode }[]; value: T[]; onChange: (v: T[]) => void; multiple?: boolean }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(multiple ? (on ? value.filter((x) => x !== o.value) : [...value, o.value]) : [o.value])}
            className={cn('inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-2 px-4 text-base transition-colors', on ? 'border-ink bg-ink font-bold text-on-ink' : 'border-hair bg-surface text-ink hover:bg-surface-hi')}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
