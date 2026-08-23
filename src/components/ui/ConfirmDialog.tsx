import { Modal } from './Modal';
import { Button } from './Button';

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Delete',
  isLoading,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="text-sm text-paper-300">{description}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} isLoading={isLoading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
