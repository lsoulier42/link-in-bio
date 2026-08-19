import * as LucideIcons from 'lucide-react';
import { resolveIcon } from '../icons';

export default function LinkCard({ link, slug, onTrackClick }) {
  const Icon = resolveIcon(link.iconName);
  const main = link.title || link.displayName || (link.handle ? `@${link.handle}` : '') || 'Lien';
  const sub = link.subtitle || (link.displayName && link.handle ? `@${link.handle}` : null);

  const handleClick = () => {
    if (onTrackClick) {
      onTrackClick(slug, link.id);
    }
  };

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="group block w-full rounded-2xl p-4 backdrop-blur-md transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-0.5"
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        boxShadow: 'var(--card-shadow)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--card-hover-bg)';
        e.currentTarget.style.borderColor = 'var(--card-hover-border)';
        e.currentTarget.style.boxShadow = `var(--card-shadow), 0 0 20px var(--accent-glow)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--card-bg)';
        e.currentTarget.style.borderColor = 'var(--card-border)';
        e.currentTarget.style.boxShadow = 'var(--card-shadow)';
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0 transition-colors duration-300"
          style={{ background: 'var(--accent-glow)' }}
        >
          {link.iconUrl ? (
            <img
              src={link.iconUrl}
              alt=""
              className="w-5 h-5 rounded object-contain"
              draggable={false}
            />
          ) : (
            <Icon
              className="w-5 h-5 transition-transform duration-300 group-hover:scale-110"
              style={{ color: 'var(--accent)' }}
            />
          )}
        </div>
        <span className="flex-1 min-w-0">
          <span
            className="block font-semibold text-sm tracking-wide truncate"
            style={{ color: 'var(--text-primary)' }}
          >
            {main}
          </span>
          {sub && (
            <span
              className="block text-xs truncate"
              style={{ color: 'var(--text-secondary)' }}
            >
              {sub}
            </span>
          )}
        </span>
        <LucideIcons.ArrowUpRight
          className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          style={{ color: 'var(--text-secondary)' }}
        />
      </div>
    </a>
  );
}
