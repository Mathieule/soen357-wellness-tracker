/**
 * Pop-up window (Task 3: "pop-up box"). Adapted from the shadcn dashboard
 * template dialog, which wraps the Base UI Dialog. Base UI provides the focus
 * trap, Escape to close, focus return and the aria-modal / labelling.
 * Changes: palette colours, 16 px text, 48 px close button with a text label,
 * no zoom animation (only a short fade, AR8).
 */
import { Dialog as D } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../lib/cn';
import { buttonVariants } from './button';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  /** Footer actions (buttons). */
  footer?: ReactNode;
  className?: string;
  /** Hide the "Close" button in the corner (e.g. for confirmation dialogs). */
  hideClose?: boolean;
}

export function Dialog({ open, onOpenChange, title, description, children, footer, className, hideClose }: DialogProps) {
  return (
    <D.Root open={open} onOpenChange={(o) => onOpenChange(o)}>
      <D.Portal>
        <D.Backdrop className="fixed inset-0 z-50 bg-black/60 transition-opacity duration-150 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0" />
        <D.Popup
          className={cn(
            'fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] max-w-[420px] -translate-x-1/2 -translate-y-1/2 flex-col rounded-[var(--radius-card)] border-2 border-line bg-popup text-ink outline-none transition-opacity duration-150 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0',
            className,
          )}
        >
          <div className="flex items-start gap-2 border-b border-line/50 p-4">
            <div className="min-w-0 flex-1">
              <D.Title className="m-0 text-xl font-bold leading-snug">{title}</D.Title>
              {description && <D.Description className="m-0 mt-1 text-base">{description}</D.Description>}
            </div>
            {!hideClose && (
              <D.Close className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), '-mr-2 -mt-1')} aria-label="Close">
                <X aria-hidden="true" />
              </D.Close>
            )}
          </div>
          <div className="overflow-y-auto p-4">{children}</div>
          {footer && <div className="flex flex-wrap gap-3 border-t border-line/50 p-4 [&>*]:flex-1">{footer}</div>}
        </D.Popup>
      </D.Portal>
    </D.Root>
  );
}
