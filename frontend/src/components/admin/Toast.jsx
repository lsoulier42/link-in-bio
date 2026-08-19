import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: { icon: CheckCircle2, cls: 'text-emerald-400' },
  error: { icon: AlertCircle, cls: 'text-red-400' },
  info: { icon: Info, cls: 'text-violet-300' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, type = 'success', duration = 3200) => {
      const id = ++counter.current;
      setToasts((list) => [...list, { id, message, type }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss],
  );

  const value = { toast: push };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-sm"
        role="status"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          const { icon: Icon, cls } = ICONS[toast.type] || ICONS.info;
          return (
            <div
              key={toast.id}
              className="glass-elevated rounded-[var(--radius-md)] px-4 py-3 flex items-start gap-3 anim-toast-in"
            >
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${cls}`} aria-hidden="true" />
              <p className="flex-1 text-sm text-slate-100 min-w-0 break-words">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Fermer la notification"
                className="shrink-0 p-0.5 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast doit être utilisé dans un <ToastProvider>');
  return ctx;
}
