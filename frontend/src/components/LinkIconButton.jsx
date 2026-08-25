import { resolveIcon } from '../icons';

export default function LinkIconButton({ link, slug, onTrackClick }) {
  const Icon = resolveIcon(link.iconName);
  const label = link.title || (link.handle ? `@${link.handle}` : '');

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
      aria-label={label || 'Link'}
      title={label || link.url}
      className="flex items-center justify-center w-11 h-11 rounded-2xl backdrop-blur-md transition-all duration-200 hover:scale-110 hover:-translate-y-0.5"
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        boxShadow: 'var(--card-shadow)',
        color: 'var(--accent)',
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
      {link.iconUrl ? (
        <img
          src={link.iconUrl}
          alt=""
          className="w-5 h-5 rounded object-contain"
          draggable={false}
        />
      ) : (
        <Icon className="w-5 h-5" aria-hidden="true" />
      )}
    </a>
  );
}
