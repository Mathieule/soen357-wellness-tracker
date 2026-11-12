/**
 * Status message (AR10). Success uses a green surface, errors a red surface
 * (Task 2: "green hue" / "red hue"), and both always include an icon and
 * a word ("Success", "Error") so colour is never the only cue (AR1).
 * role="status" is announced politely; errors use role="alert".
 */
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export type StatusKind = 'success' | 'error' | 'info';

const styles: Record<StatusKind, { cls: string; Icon: typeof Info; word: string }> = {
  success: { cls: 'bg-food', Icon: CheckCircle2, word: 'Success' },
  error: { cls: 'bg-fit', Icon: AlertCircle, word: 'Error' },
  info: { cls: 'bg-sleep', Icon: Info, word: 'Note' },
};

export function StatusMessage({
  kind,
  children,
  onDismiss,
  className,
}: {
  kind: StatusKind;
  children: ReactNode;
  onDismiss?: () => void;
  className?: string;
}) {
  const { cls, Icon, word } = styles[kind];
  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      className={cn('flex items-start gap-3 rounded-xl px-4 py-3 text-base', cls, className)}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-6 shrink-0" />
      <p className="m-0 flex-1">
        <strong>{word}: </strong>
        {children}
      </p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss message"
          className="-my-2 -mr-2 inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-transparent text-ink"
        >
          <X aria-hidden="true" className="size-5" />
        </button>
      )}
    </div>
  );
}
