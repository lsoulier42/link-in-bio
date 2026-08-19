import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle } from 'lucide-react';
import Button from './Button';

export default function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  busy = false,
}) {
  const confirmRef = useRef(null);
  const restoreRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    restoreRef.current = document.activeElement;
    const el = confirmRef.current;
    if (el) el.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !busy) {
        e.stopPropagation();
        onCancel();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      restoreRef.current?.focus?.();
    };
  }, [open, onCancel, busy]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fermer"
        onClick={onCancel}
        disabled={busy}
        className="absolute inset-0 bg-black/55 backdrop-blur-sm cursor-default anim-fade-in"
        tabIndex={-1}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        className="glass-elevated relative w-full max-w-sm rounded-[var(--radius-lg)] p-6 anim-pop-in"
      >
        <div className="w-11 h-11 rounded-2xl bg-red-500/15 border border-red-500/25 flex items-center justify-center mb-4 text-red-300">
          <AlertTriangle className="w-5 h-5" aria-hidden="true" />
        </div>
        <h2 id="confirm-title" className="text-lg font-semibold text-white">
          {title}
        </h2>
        <p id="confirm-message" className="mt-1.5 text-sm text-slate-400">
          {message}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button ref={confirmRef} variant="danger" onClick={onConfirm} loading={busy} disabled={busy}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
