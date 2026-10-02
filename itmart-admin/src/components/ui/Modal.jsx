import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Modal({ open, onClose, title, children, width = 'max-w-lg' }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div
        className="absolute inset-0 bg-ink-950/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full ${width} max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto pb-[env(safe-area-inset-bottom)]`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-surface-border sticky top-0 z-10 bg-white rounded-t-2xl sm:rounded-t-xl">
          <h3 className="text-base sm:text-lg font-semibold text-ink-900 truncate pr-2">{title}</h3>
          <button
            onClick={onClose}
            className="text-ink-500 hover:text-ink-900 rounded-lg p-1 hover:bg-surface"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
