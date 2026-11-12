/**
 * Confirmation dialog: Task 2 asks users to confirm profile changes a second
 * time, and C3 asks "Are you sure?" before deleting the account.
 * Focus starts on the safe choice (Cancel).
 */
import type { ReactNode } from 'react';
import { Button } from './button';
import { Dialog } from './dialog';

export function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  title,
  children,
  confirmLabel,
  danger,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  danger?: boolean;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => !o && onCancel()}
      title={title}
      hideClose
      footer={
        <>
          <Button variant="outline" onClick={onCancel} autoFocus>
            Cancel
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="text-base">{children}</div>
    </Dialog>
  );
}
