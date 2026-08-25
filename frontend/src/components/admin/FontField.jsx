import { useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { FONTS, getFontStack } from '../../themes/fonts';
import { Field } from './Field';

/**
 * Font family selector with an "Auto" option
 * to fall back to the theme's default font (value = null).
 */
export default function FontField({ id, label, value, onChange, helper, disabled = false }) {
  const autoId = useId();
  const fieldId = id || autoId;
  const isAuto = !value;

  return (
    <Field label={label} htmlFor={fieldId} helper={helper}>
      <div className="relative">
        <select
          id={fieldId}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? null : e.target.value)}
          disabled={disabled}
          className={`w-full appearance-none rounded-xl border px-4 py-2.5 pr-10 text-sm text-white transition-colors duration-150 bg-white/5 focus:outline-none disabled:opacity-40 ${
            isAuto ? 'text-slate-400' : ''
          } ${
            disabled
              ? 'border-white/10'
              : 'border-white/10 hover:border-white/20 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30'
          }`}
        >
          <option value="" className="bg-slate-900 text-slate-400">
            Auto (theme)
          </option>
          {FONTS.map((font) => (
            <option key={font.name} value={font.name} className="bg-slate-900 text-white" style={{ fontFamily: getFontStack(font.name) }}>
              {font.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          aria-hidden="true"
        />
      </div>
    </Field>
  );
}
