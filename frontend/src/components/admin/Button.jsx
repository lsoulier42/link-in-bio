import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary:
    'bg-gradient-to-b from-violet-500 to-violet-600 text-white shadow-lg shadow-violet-900/40 hover:from-violet-400 hover:to-violet-500 active:from-violet-600 active:to-violet-700',
  secondary:
    'bg-white/5 text-slate-100 border border-white/10 hover:bg-white/10 active:bg-white/[0.06]',
  ghost:
    'bg-transparent text-slate-300 hover:text-white hover:bg-white/10 active:bg-white/5',
  danger:
    'bg-red-500/15 text-red-300 border border-red-500/25 hover:bg-red-500/25 hover:text-red-200 active:bg-red-500/20',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-sm gap-2',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-150 select-none ' +
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ' +
    'active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none';

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${base} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
