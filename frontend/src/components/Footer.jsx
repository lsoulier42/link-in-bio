import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-12 pb-8 text-center">
      <div className="flex items-center justify-center gap-2 text-sm" style={{ color: 'var(--footer-text, #64748b)' }}>
        <span>Fait avec</span>
        <Heart className="w-3.5 h-3.5 fill-current" style={{ color: 'var(--accent, #8b5cf6)' }} />
        <span>par FayeFiore</span>
      </div>
      <Link
        to="/privacy"
        className="mt-2 inline-block text-xs underline opacity-60 hover:opacity-100 transition-opacity"
        style={{ color: 'var(--footer-text, #64748b)' }}
      >
        Politique de confidentialité
      </Link>
    </footer>
  );
}
