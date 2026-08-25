import { useState } from 'react';
import { Search, Check, X } from 'lucide-react';
import { CATEGORIES, ICONS } from '../icons';

export default function IconPicker({ value, onSelect, onClear }) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  const filtered = CATEGORIES
    .map((category) => ({
      ...category,
      icons: Object.entries(ICONS)
        .filter(([, entry]) => entry.category === category.key)
        .filter(([key, entry]) =>
          !q || entry.label.toLowerCase().includes(q) || key.includes(q)
        )
        .map(([key, entry]) => ({ key, ...entry })),
    }))
    .filter((category) => category.icons.length > 0);

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <label className="text-sm font-medium text-slate-200">Icon</label>
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-3 h-3" aria-hidden="true" />
            Reset
          </button>
        )}
      </div>

      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
        <input
          type="text"
          placeholder="Search for a platform..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30 transition-colors"
        />
      </div>

      <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
        {filtered.map((category) => (
          <div key={category.key}>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
              {category.label}
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {category.icons.map((icon) => {
                const selected = value === icon.key;
                const Icon = icon.Icon;
                return (
                  <button
                    key={icon.key}
                    type="button"
                    title={icon.label}
                    onClick={() => onSelect(icon.key)}
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
                      {icon.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-4">No icons found</p>
        )}
      </div>
    </div>
  );
}
