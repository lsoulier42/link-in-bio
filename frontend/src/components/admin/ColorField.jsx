import { useEffect, useState } from 'react';
import { useId } from 'react';
import { RotateCcw } from 'lucide-react';
import { Field, inputCls } from './Field';

const HEX_PARTIAL = /^#[0-9a-fA-F]{0,7}$/;
const HEX_FULL = /^#[0-9a-fA-F]{6}$/;

/**
 * Color picker with a hex input and an "Auto" button
 * to fall back to the theme's default color (value = null).
 */
export default function ColorField({ id, label, value, onChange, helper, disabled = false }) {
  const autoId = useId();
  const fieldId = id || autoId;
  const [draft, setDraft] = useState(value ?? '');

  useEffect(() => {
    setDraft(value ?? '');
  }, [value]);

  const isAuto = !value;

  const commitDraft = () => {
    const v = draft.trim().toLowerCase();
    setDraft(v);
    if (v === '') {
      onChange(null);
    } else if (HEX_FULL.test(v)) {
      onChange(v);
    } else {
      // Incomplete input: fall back to the last valid value.
      setDraft(value ?? '');
    }
  };

  return (
    <Field label={label} htmlFor={fieldId} helper={helper}>
      <div className="flex items-center gap-2">
        <input
          id={fieldId}
          type="color"
          value={isAuto ? '#000000' : value}
          onChange={(e) => onChange(e.target.value)}
          disabled={isAuto || disabled}
          className="w-10 h-10 shrink-0 cursor-pointer rounded-xl border border-white/10 bg-white/5 p-1 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label={label}
        />
        <input
          type="text"
          value={draft}
          onChange={(e) => {
            const v = e.target.value;
            if (v === '' || HEX_PARTIAL.test(v)) setDraft(v);
          }}
          onBlur={commitDraft}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commitDraft();
            }
          }}
          placeholder="Theme default"
          disabled={disabled}
          className={inputCls()}
          spellCheck={false}
        />
        <button
          type="button"
          onClick={() => {
            onChange(null);
            setDraft('');
          }}
          disabled={isAuto || disabled}
          title="Back to theme color"
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium border border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/25 disabled:opacity-40 transition-all duration-150"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          Auto
        </button>
      </div>
    </Field>
  );
}
