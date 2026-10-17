import { Button } from "./Button";
import { Modal } from "./Modal";
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
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
      {/* Phones: full-width stacked buttons, the destructive one on top for thumb reach.
          sm+: the familiar right-aligned pair. */}
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button
          variant="ghost"
          className="w-full sm:w-auto"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          className="w-full sm:order-last sm:w-auto"
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
