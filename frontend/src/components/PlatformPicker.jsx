import { Check, X } from 'lucide-react';
import { CATEGORIES, ICONS } from '../icons';

export default function PlatformPicker({ value, onSelect }) {
  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => onSelect('')}
        aria-pressed={value === ''}
        className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 border transition-all duration-150 text-left ${
          value === ''
            ? 'border-violet-400 ring-2 ring-violet-400/30 bg-violet-500/10'
            : 'border-white/10 hover:border-white/25 hover:bg-white/5'
        }`}
      >
        <span className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
          <X className="w-4 h-4 text-slate-300" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-white">Aucune plateforme</span>
          <span className="block text-xs text-slate-400 truncate">
            Lien 100% personnalisé, tout est libre
          </span>
        </span>
        {value === '' && (
          <span className="w-4 h-4 bg-violet-500 rounded-full flex items-center justify-center shrink-0">
            <Check className="w-2.5 h-2.5 text-white" aria-hidden="true" />
          </span>
        )}
      </button>

      {CATEGORIES.map((category) => {
        const icons = Object.entries(ICONS).filter(([, entry]) => entry.category === category.key);
        if (icons.length === 0) return null;
        return (
          <div key={category.key}>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
              {category.label}
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {icons.map(([key, entry]) => {
                const selected = value === key;
                const Icon = entry.Icon;
                return (
                  <button
                    key={key}
                    type="button"
                    title={entry.label}
                    onClick={() => onSelect(key)}
                    aria-pressed={selected}
                    className={`relative flex flex-col items-center gap-1 rounded-xl p-2 border transition-all duration-150 ${
                      selected
                        ? 'border-violet-400 ring-2 ring-violet-400/30 bg-violet-500/10'
                        : 'border-white/10 hover:border-white/25 hover:bg-white/5'
                    }`}
                  >
                    {selected && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-violet-500 rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" aria-hidden="true" />
                      </span>
                    )}
                    <Icon className="w-5 h-5 text-slate-200" aria-hidden="true" />
                    <span className="text-[10px] text-slate-400 truncate w-full text-center">
                      {entry.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
