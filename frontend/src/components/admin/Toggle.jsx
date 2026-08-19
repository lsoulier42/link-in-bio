import { Loader2 } from 'lucide-react';

export default function Toggle({ checked, onChange, label, disabled = false, busy = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      disabled={disabled || busy}
      className="inline-flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none group"
    >
      {busy ? (
        <Loader2 className="w-5 h-5 animate-spin text-slate-400" aria-hidden="true" />
      ) : (
        <span
          aria-hidden="true"
          className={`relative inline-flex w-10 h-6 shrink-0 rounded-full transition-colors duration-200 ${
            checked ? 'bg-emerald-500/80' : 'bg-white/10 border border-white/15'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
              checked ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </span>
      )}
      <span className="sr-only">{label}</span>
    </button>
  );
}
