import { ArrowLeft, ArrowRight, Check, Save } from 'lucide-react';
import Button from './Button';

export function StepperIndicator({ steps, current, onStepClick }) {
  return (
    <ol className="flex items-stretch gap-1.5 mb-6" aria-label="Steps">
      {steps.map((step, index) => {
        const isDone = index < current;
        const isActive = index === current;
        return (
          <li key={step.key} className="flex-1 min-w-0">
            <button
              type="button"
              onClick={() => isDone && onStepClick?.(index)}
              disabled={!isDone}
              aria-current={isActive ? 'step' : undefined}
              title={isDone ? `Back to the ${step.label} step` : undefined}
              className={`w-full flex flex-col items-center gap-1 rounded-xl px-1.5 py-2 border transition-all duration-150 ${
                isActive
                  ? 'border-violet-400/50 bg-violet-500/10'
                  : isDone
                    ? 'border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer'
                    : 'border-white/5 bg-transparent opacity-40 cursor-default'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                  isDone
                    ? 'bg-violet-500 text-white'
                    : isActive
                      ? 'bg-violet-500/20 text-violet-200 ring-1 ring-violet-400/50'
                      : 'bg-white/10 text-slate-400'
                }`}
              >
                {isDone ? <Check className="w-3.5 h-3.5" aria-hidden="true" /> : index + 1}
              </span>
              <span
                className={`text-[11px] leading-tight truncate w-full text-center ${
                  isActive ? 'text-white font-medium' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export function StepperFooter({
  current,
  isLast,
  canGoNext,
  onBack,
  onNext,
  onSubmit,
  submitLabel,
  saving,
  onCancel,
  cancelDisabled = false,
}) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" onClick={onCancel} disabled={saving || cancelDisabled}>
        Cancel
      </Button>
      <div className="flex-1" />
      {current > 0 && (
        <Button variant="secondary" onClick={onBack} disabled={saving}>
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back
        </Button>
      )}
      {isLast ? (
        <Button onClick={onSubmit} loading={saving} disabled={!canGoNext}>
          <Save className="w-4 h-4" aria-hidden="true" />
          {submitLabel}
        </Button>
      ) : (
        <Button onClick={onNext} disabled={!canGoNext}>
          Next
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}
