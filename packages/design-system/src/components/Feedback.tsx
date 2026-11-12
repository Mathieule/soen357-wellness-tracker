/**
 * Feedback (AR10).
 *  - InlineStatus: message placed where the action happened (forms, errors).
 *  - Toast: short confirmation after a successful action, announced politely,
 *    visible for 5 s and dismissible. Errors never use toasts: they stay
 *    inline next to the problem with a way to fix it.
 * Each message has an icon and a word, never colour alone (AR1).
 */
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '../cn';

export type StatusKind = 'success' | 'error' | 'info';
const KIND = {
  success: { Icon: CheckCircle2, word: 'Done', cls: 'bg-food-deep' },
  error: { Icon: AlertCircle, word: 'Error', cls: 'bg-act-deep' },
  info: { Icon: Info, word: 'Note', cls: 'bg-sleep-deep' },
};

export function InlineStatus({ kind, children, action, onDismiss, className }: { kind: StatusKind; children: ReactNode; action?: ReactNode; onDismiss?: () => void; className?: string }) {
  const k = KIND[kind];
  return (
    <div role={kind === 'error' ? 'alert' : 'status'} className={cn('flex items-start gap-3 rounded-2xl px-4 py-3.5', k.cls, className)}>
      <k.Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="m-0">
          <strong>{k.word}: </strong>
          {children}
        </p>
        {action && <div className="mt-2">{action}</div>}
      </div>
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="Dismiss message" className="-my-2 -mr-2 inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-transparent text-ink">
          <X aria-hidden="true" className="size-5" />
        </button>
      )}
    </div>
  );
}

interface Toast {
  id: number;
  kind: StatusKind;
  text: string;
}
const ToastCtx = createContext<(kind: StatusKind, text: string) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  const push = useCallback((kind: StatusKind, text: string) => {
    const id = nextId.current++;
    setToasts((t) => [...t.slice(-1), { id, kind, text }]);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[calc(100px+env(safe-area-inset-bottom))] z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-auto lg:left-auto lg:right-6 lg:top-6 lg:w-[420px] lg:px-0">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDone={() => setToasts((all) => all.filter((x) => x.id !== t.id))} />
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

function ToastItem({ toast, onDone }: { toast: Toast; onDone: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onDone, 5000);
    return () => window.clearTimeout(t);
  }, [onDone]);
  const k = KIND[toast.kind];
  return (
    <div role="status" className={cn('anim-rise pointer-events-auto flex w-full max-w-[440px] items-center gap-3 rounded-2xl px-4 py-3 shadow-[var(--shadow-pop)]', k.cls)}>
      <k.Icon aria-hidden="true" className="size-5 shrink-0" />
      <p className="m-0 flex-1">
        <strong>{k.word}: </strong>
        {toast.text}
      </p>
      <button type="button" onClick={onDone} aria-label="Dismiss message" className="-my-1 -mr-2 inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-transparent text-ink">
        <X aria-hidden="true" className="size-5" />
      </button>
    </div>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}
