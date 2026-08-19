export default function Badge({ tone = 'neutral', children }) {
  const tones = {
    neutral: 'bg-white/5 text-slate-300 border-white/10',
    success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
    muted: 'bg-white/[0.03] text-slate-400 border-white/10',
    warning: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  };
  const dots = {
    neutral: 'bg-slate-400',
    success: 'bg-emerald-400',
    muted: 'bg-slate-500',
    warning: 'bg-amber-400',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${dots[tone]}`} />
      {children}
    </span>
  );
}
