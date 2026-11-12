/**
 * Sheet: the pop-up window of the app. On phones it rises from the bottom
 * (thumb reach); from 640 px it is a centred dialog. Built on the Base UI
 * Dialog used by the shadcn template: focus trap, Escape, focus return,
 * labelled by its title (AR7, AR14).
 */
import { Dialog as D } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../cn';
import { Button } from './Button';

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  hideClose?: boolean;
  className?: string;
}

export function Sheet({ open, onOpenChange, title, description, children, footer, hideClose, className }: SheetProps) {
  return (
    <D.Root open={open} onOpenChange={(o) => onOpenChange(o)}>
      <D.Portal>
        <D.Backdrop className="fixed inset-0 z-50 bg-black/60 transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <D.Popup
          className={cn(
            'fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-[var(--radius-sheet)] bg-surface text-ink shadow-[var(--shadow-pop)] outline-none transition-[transform,opacity] duration-250 ease-[var(--ease-out)] data-[ending-style]:translate-y-8 data-[ending-style]:opacity-0 data-[starting-style]:translate-y-8 data-[starting-style]:opacity-0 motion-reduce:transition-none',
            'sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-[min(480px,calc(100%-48px))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[var(--radius-sheet)] sm:data-[ending-style]:translate-y-[-46%] sm:data-[starting-style]:translate-y-[-46%]',
            className,
          )}
        >
          <div aria-hidden="true" className="mx-auto mt-2.5 h-1.5 w-11 rounded-full bg-hair sm:hidden" />
          <div className="flex items-start gap-3 px-5 pb-2 pt-4">
            <div className="min-w-0 flex-1">
              <D.Title className="m-0 text-2xl font-bold">{title}</D.Title>
              {description && <D.Description className="m-0 mt-1 text-ink-soft">{description}</D.Description>}
            </div>
            {!hideClose && (
              <D.Close className="-mr-1 inline-flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full bg-surface-hi text-ink" aria-label="Close">
                <X aria-hidden="true" className="size-5" />
              </D.Close>
            )}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-2">{children}</div>
          {footer && <div className="flex flex-wrap gap-3 border-t border-hair px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-4 [&>*]:flex-1">{footer}</div>}
        </D.Popup>
      </D.Portal>
    </D.Root>
  );
}

/** Confirmation (Task 2: confirm profile changes; C3: "Are you sure?"). Focus starts on Cancel. */
export function ConfirmDialog({ open, title, children, confirmLabel, danger, onConfirm, onCancel }: { open: boolean; title: string; children: ReactNode; confirmLabel: string; danger?: boolean; onConfirm: () => void; onCancel: () => void }) {
  return (
    <Sheet
      open={open}
      onOpenChange={(o) => !o && onCancel()}
      title={title}
      hideClose
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} autoFocus>
            Cancel
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="text-lg">{children}</div>
    </Sheet>
  );
}
