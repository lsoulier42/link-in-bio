import { Smartphone, EyeOff } from 'lucide-react';
import { getTheme } from '../../themes';
import { getFontStack } from '../../themes/fonts';
import { groupLinksByCategory } from '../../lib/groupLinks';
import LinkCard from '../LinkCard';
import LinkIconButton from '../LinkIconButton';

export default function PhonePreview({ profile, links, categories = [] }) {
  if (!profile) return null;

  const theme = getTheme(profile.themeName);
  const visibleLinks = links.filter((link) => link.isActive);
  const hiddenCount = links.length - visibleLinks.length;
  const sections = groupLinksByCategory(visibleLinks, categories);

  // Couleurs de texte personnalisées (priorité sur celles du thème).
  const textColorStyles = {
    ...(profile.nameColor ? { '--profile-name-color': profile.nameColor } : {}),
    ...(profile.bioColor ? { '--profile-bio-color': profile.bioColor } : {}),
    ...(profile.categoryColor ? { '--category-name-color': profile.categoryColor } : {}),
  };

  // Familles de police personnalisées (priorité sur celle du thème).
  const textFontStyles = {
    ...(profile.nameFont ? { '--profile-name-font': getFontStack(profile.nameFont) } : {}),
    ...(profile.bioFont ? { '--profile-bio-font': getFontStack(profile.bioFont) } : {}),
    ...(profile.categoryFont ? { '--category-name-font': getFontStack(profile.categoryFont) } : {}),
  };

  return (
    <div className="glass rounded-[var(--radius-lg)] p-4">
      <div className="flex items-center justify-between mb-4 px-1">
        <p className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300">
          <Smartphone className="w-4 h-4 text-violet-300" aria-hidden="true" />
          Aperçu public
        </p>
        <span className="text-[11px] text-slate-500">valeurs enregistrées</span>
      </div>

      <div className="mx-auto max-w-[300px] rounded-[28px] p-2 border border-white/15 bg-black/30">
        <div
          className="relative rounded-[22px] overflow-hidden"
          style={{
            ...theme.styles,
            ...textColorStyles,
            ...textFontStyles,
            background: theme.styles['--bg-gradient'],
          }}
        >
          {profile.backgroundUrl && (
            <div className="absolute inset-0" aria-hidden="true">
              <img
                src={profile.backgroundUrl}
                alt=""
                draggable={false}
                className="w-full h-full"
                style={{
                  objectFit: profile.backgroundSize,
                  objectPosition: profile.backgroundPosition,
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background: theme.styles['--bg-gradient'],
                  opacity: profile.backgroundOverlay / 100,
                }}
              />
            </div>
          )}
          <div className="relative px-5 py-8">
            <div className="flex flex-col items-center mb-8">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.displayName || ''}
                  className="w-20 h-20 rounded-full object-cover mb-3"
                  style={{ boxShadow: `0 0 24px var(--accent-glow)` }}
                />
              ) : (
                <div
                  className="w-20 h-20 rounded-full mb-3 flex items-center justify-center text-2xl font-bold"
                  style={{
                    background: 'var(--card-bg)',
                    color: 'var(--accent)',
                    border: '3px solid var(--accent)',
                    boxShadow: `0 0 24px var(--accent-glow)`,
                  }}
                >
                  {profile.displayName?.charAt(0)?.toUpperCase()}
                </div>
              )}
              <h2
                className="text-lg font-bold"
                style={{
                  color: 'var(--profile-name-color, var(--text-primary))',
                  fontFamily: 'var(--profile-name-font, inherit)',
                }}
              >
                {profile.displayName}
              </h2>
              {profile.bio && (
                <p
                  className="mt-1.5 text-xs text-center leading-relaxed max-w-[220px]"
                  style={{
                    color: 'var(--profile-bio-color, var(--text-secondary))',
                    fontWeight: 'var(--text-bio-weight, 400)',
                    fontFamily: 'var(--profile-bio-font, inherit)',
                  }}
                >
                  {profile.bio}
                </p>
              )}
            </div>

            {sections.map((section) => (
              <div key={section.id ?? 'uncategorized'} className={section.id != null ? 'mb-5' : ''}>
                {section.name && (
                  <h3
                    className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide"
                    style={{
                      color: 'var(--category-name-color, var(--text-secondary))',
                      fontWeight: 'var(--text-category-weight, 600)',
                      fontFamily: 'var(--category-name-font, inherit)',
                    }}
                  >
                    {section.name}
                  </h3>
                )}

                {section.iconLinks.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center gap-2.5 mb-3">
                    {section.iconLinks.map((link) => (
                      <LinkIconButton key={link.id} link={link} />
                    ))}
                  </div>
                )}

                {section.cardLinks.length > 0 && (
                  <div className="space-y-2.5">
                    {section.cardLinks.map((link) => (
                      <LinkCard key={link.id} link={link} />
                    ))}
                  </div>
                )}
              </div>
            ))}

            {links
              .filter((link) => !link.isActive)
              .map((link) => (
                <div
                  key={link.id}
                  className="relative rounded-2xl p-4 opacity-40 grayscale"
                  style={{
                    background: 'var(--card-bg)',
                    border: '1px dashed var(--card-border)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
                      {link.displayName?.charAt(0) || link.title?.charAt(0) || 'L'}
                    </div>
                    <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {link.displayName || (link.handle ? `@${link.handle}` : link.title)}
                    </span>
                  </div>
                </div>
              ))}

            {hiddenCount > 0 && (
              <p className="mt-3 inline-flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                {hiddenCount} lien{hiddenCount > 1 ? 's' : ''} masqué{hiddenCount > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
