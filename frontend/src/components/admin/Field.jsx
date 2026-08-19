import { useId } from 'react';

export function Field({ label, htmlFor, helper, error, required = false, children, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-200 mb-1.5">
          {label}
          {required && (
            <span className="ml-1 text-violet-400" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="mt-1.5 text-xs text-red-300">
          {error}
        </p>
      ) : (
        helper && <p className="mt-1.5 text-xs text-slate-400">{helper}</p>
      )}
    </div>
  );
}

export function inputCls({ invalid = false } = {}) {
  return [
    'w-full rounded-xl border px-4 py-2.5 text-sm text-white placeholder:text-slate-500',
    'bg-white/5 transition-colors duration-150',
    invalid
      ? 'border-red-400/60 focus:border-red-400 focus:ring-2 focus:ring-red-400/30'
      : 'border-white/10 hover:border-white/20 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30',
    'focus:outline-none',
  ].join(' ');
}

export function TextInput({ id, label, error, helper, required, ...props }) {
  const autoId = useId();
  const inputId = id || autoId;
  return (
    <Field label={label} htmlFor={inputId} error={error} helper={helper} required={required}>
      <input id={inputId} className={inputCls({ invalid: Boolean(error) })} {...props} />
    </Field>
  );
}

export function TextArea({ id, label, error, helper, required, ...props }) {
  const autoId = useId();
  const inputId = id || autoId;
  return (
    <Field label={label} htmlFor={inputId} error={error} helper={helper} required={required}>
      <textarea id={inputId} className={inputCls({ invalid: Boolean(error) })} {...props} />
    </Field>
  );
}
