/**
 * Labelled form fields (AR5, AR9). Adapted from the template's input/label/field.
 * Every field has a visible <label>, an optional hint and an error message.
 * The error is linked with aria-describedby and the input gets aria-invalid.
 */
import { AlertCircle } from 'lucide-react';
import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

const controlClass =
  'block w-full min-h-12 rounded-xl border-2 border-line bg-bg px-3 py-2 text-base text-ink placeholder:text-ink/80 aria-[invalid=true]:border-fit-accent';

interface BaseProps {
  label: string;
  hint?: ReactNode;
  error?: string;
  className?: string;
}

function useFieldIds(id?: string) {
  const auto = useId();
  const fieldId = id ?? auto;
  return { fieldId, hintId: `${fieldId}-hint`, errorId: `${fieldId}-error` };
}

function FieldShell({
  label,
  hint,
  error,
  className,
  ids,
  children,
}: BaseProps & { ids: ReturnType<typeof useFieldIds>; children: ReactNode }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={ids.fieldId} className="text-base font-bold">
        {label}
      </label>
      {hint && (
        <p id={ids.hintId} className="m-0 text-base">
          {hint}
        </p>
      )}
      {children}
      {error && <FieldError id={ids.errorId}>{error}</FieldError>}
    </div>
  );
}

/** Error text: icon + words, never colour alone (AR1). */
export function FieldError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="m-0 flex items-start gap-2 rounded-lg bg-fit px-3 py-2 text-base">
      <AlertCircle aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      <span>
        <span className="sr-only">Error: </span>
        {children}
      </span>
    </p>
  );
}

function describedBy(hint: unknown, error: unknown, ids: ReturnType<typeof useFieldIds>) {
  return [hint ? ids.hintId : null, error ? ids.errorId : null].filter(Boolean).join(' ') || undefined;
}

export function TextField({ label, hint, error, className, id, ...props }: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  const ids = useFieldIds(id);
  return (
    <FieldShell label={label} hint={hint} error={error} className={className} ids={ids}>
      <input
        id={ids.fieldId}
        className={controlClass}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(hint, error, ids)}
        {...props}
      />
    </FieldShell>
  );
}

export function SelectField({
  label,
  hint,
  error,
  className,
  id,
  children,
  ...props
}: BaseProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const ids = useFieldIds(id);
  return (
    <FieldShell label={label} hint={hint} error={error} className={className} ids={ids}>
      <select
        id={ids.fieldId}
        className={controlClass}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(hint, error, ids)}
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  );
}

export function TextAreaField({ label, hint, error, className, id, ...props }: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ids = useFieldIds(id);
  return (
    <FieldShell label={label} hint={hint} error={error} className={className} ids={ids}>
      <textarea
        id={ids.fieldId}
        className={cn(controlClass, 'min-h-24')}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(hint, error, ids)}
        {...props}
      />
    </FieldShell>
  );
}
