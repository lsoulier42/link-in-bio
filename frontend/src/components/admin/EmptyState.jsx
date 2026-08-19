export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="glass rounded-[var(--radius-lg)] px-6 py-14 flex flex-col items-center text-center anim-pop-in">
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center mb-4 text-violet-300">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {description && <p className="mt-1.5 text-sm text-slate-400 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
