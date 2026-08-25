import { Check, Palette } from 'lucide-react';
import { getAllThemes } from '../themes';

export default function ThemeSelector({ currentTheme, onSelect }) {
  const themes = getAllThemes();

  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-slate-200 mb-3">
        <Palette className="w-4 h-4" aria-hidden="true" />
        Profile theme
      </label>
      <div className="grid grid-cols-2 gap-3">
        {themes.map((theme) => {
          const selected = currentTheme === theme.name;
          return (
            <button
              key={theme.name}
              onClick={() => onSelect(theme.name)}
              aria-pressed={selected}
              className={`relative rounded-xl p-3 text-left transition-all duration-150 border ${
                selected
                  ? 'border-violet-400 ring-2 ring-violet-400/30 bg-violet-500/10'
                  : 'border-white/10 hover:border-white/25 hover:bg-white/5'
              }`}
            >
              {selected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" aria-hidden="true" />
                </div>
              )}
              <div className="flex gap-1.5 mb-2">
                {Object.values(theme.preview).map((color, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full border border-white/20"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <p className="text-sm font-medium text-white">{theme.label}</p>
              <p className="text-xs text-slate-400">{theme.name}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
