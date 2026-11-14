import { Button } from './Button';
import { Dialog } from './Dialog';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'danger' | 'primary';
  /** Extra line under the description; defaults to the irreversible warning. */
  note?: string;
  onConfirm: () => void;
  onClose: () => void;
}

/** Shared confirmation step for destructive or hard-to-undo actions. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  tone = 'danger',
  note = 'This action can’t be undone.',
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      title={title}
      description={description}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === 'danger' ? 'danger' : 'primary'}
            data-autofocus
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="reset-note">{note}</p>
    </Dialog>
  );
}
