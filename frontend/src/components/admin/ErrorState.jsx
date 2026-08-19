import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

export default function ErrorState({ title = 'Une erreur est survenue', message, onRetry }) {
  return (
    <div className="glass rounded-[var(--radius-lg)] px-6 py-10 flex flex-col items-center text-center" role="alert">
      <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/25 flex items-center justify-center mb-3 text-red-300">
        <AlertTriangle className="w-6 h-6" aria-hidden="true" />
      </div>
      <h3 className="font-semibold text-white">{title}</h3>
      {message && <p className="mt-1 text-sm text-slate-400 max-w-sm">{message}</p>}
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          Réessayer
        </Button>
      )}
    </div>
  );
}
