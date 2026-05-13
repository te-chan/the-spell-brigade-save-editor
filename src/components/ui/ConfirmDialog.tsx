import { useEffect, useCallback } from 'react';
import { Button } from './Button';
import { useTranslation } from '../../i18n';

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t('dialog.confirmTitle');
  const resolvedConfirm = confirmLabel ?? t('dialog.confirm');
  const resolvedCancel = cancelLabel ?? t('dialog.cancel');
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    },
    [onCancel]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />

      {/* Dialog */}
      <div
        className="relative bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Warning Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-amber-500">
              warning
            </span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-center text-slate-900 dark:text-white mb-3">
          {resolvedTitle}
        </h2>

        {/* Message */}
        <p className="text-slate-600 dark:text-slate-300 text-center leading-relaxed mb-6">
          {message}
        </p>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" size="md" onClick={onCancel}>
            {resolvedCancel}
          </Button>
          <Button variant="primary" size="md" onClick={onConfirm}>
            {resolvedConfirm}
          </Button>
        </div>
      </div>
    </div>
  );
}
