interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm',
  message = 'Are you sure?',
  confirmText = 'Yes',
  cancelText = 'Cancel',
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-surface rounded-xl border border-border p-6 max-w-sm w-full mx-4 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-outline text-sm px-4 py-2">
            {cancelText}
          </button>
          <button onClick={onConfirm} className="btn-primary text-sm px-4 py-2">
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}