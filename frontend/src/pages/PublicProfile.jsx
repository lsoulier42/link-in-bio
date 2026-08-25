import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { getTheme } from '../themes';
import { getFontStack } from '../themes/fonts';
import { groupLinksByCategory } from '../lib/groupLinks';
import LinkCard from '../components/LinkCard';
import LinkIconButton from '../components/LinkIconButton';
import Footer from '../components/Footer';

function Orbs() {
  return (
    <>
      <div
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
        style={{
          background: 'var(--accent)',
          top: '10%',
          left: '-10%',
          animationDuration: '4s',
        }}
      />
      <div
        className="absolute w-80 h-80 rounded-full blur-3xl opacity-15 animate-pulse"
        style={{
          background: 'var(--accent)',
          bottom: '10%',
          right: '-5%',
          animationDuration: '6s',
          animationDelay: '2s',
        }}
      />
    </>
  );
}

export default function PublicProfile({ slug: slugProp }) {
  const { slug: slugParam } = useParams();
  const slug = slugProp ?? slugParam;
  const [profile, setProfile] = useState(null);
  const [links, setLinks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getProfile(slug)
      .then((data) => {
        setProfile(data.profile);
        setLinks(data.links);
        setCategories(data.categories || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0b1020' }}>
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0b1020' }}>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">404</h1>
          <p className="text-gray-400">This profile doesn't exist</p>
        </div>
      </div>
    );
  }

  const theme = getTheme(profile.themeName);
  const hasBackground = Boolean(profile.backgroundUrl);
  const sections = groupLinksByCategory(links, categories);

  // Custom text colors (override the theme).
  const textColorStyles = {
    ...(profile.nameColor ? { '--profile-name-color': profile.nameColor } : {}),
    ...(profile.bioColor ? { '--profile-bio-color': profile.bioColor } : {}),
    ...(profile.categoryColor ? { '--category-name-color': profile.categoryColor } : {}),
  };

  // Custom font families (override the theme).
  const textFontStyles = {
    ...(profile.nameFont ? { '--profile-name-font': getFontStack(profile.nameFont) } : {}),
    ...(profile.bioFont ? { '--profile-bio-font': getFontStack(profile.bioFont) } : {}),
    ...(profile.categoryFont ? { '--category-name-font': getFontStack(profile.categoryFont) } : {}),
  };

  const handleTrackClick = async (slug, linkId) => {
    try {
      await api.trackClick(slug, linkId);
    } catch (e) {
      // silent fail for tracking
    }
  };

  return (
    <div className="profile-page min-h-screen relative" style={{ ...theme.styles, ...textColorStyles, ...textFontStyles }}>
      {/* Desktop-only backdrop: blurred profile image in transparency,
          or a simple background with subtle glows when there is no image. */}
      <div className="hidden md:block fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        {hasBackground ? (
          <>
            <img
              src={profile.backgroundUrl}
              alt=""
              draggable={false}
              className="w-full h-full object-cover blur-2xl scale-110"
              style={{ opacity: 0.5 }}
            />
            <div className="absolute inset-0" style={{ background: 'rgba(2, 6, 23, 0.68)' }} />
          </>
        ) : (
          <div className="profile-desktop-backdrop absolute inset-0" />
        )}
      </div>

      {/* Mobile-only: fixed full-screen background image */}
      {hasBackground && (
        <div
          className="md:hidden fixed top-0 inset-x-0 z-0 pointer-events-none"
          style={{ height: '100lvh' }}
          aria-hidden="true"
        >
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

      {/* Mobile-only: full-screen animated orbs */}
      <div className="md:hidden fixed inset-0 z-[1] overflow-hidden pointer-events-none">
        <Orbs />
      </div>

      {/* Content: full-screen on mobile, phone-style frame on desktop */}
      <div className="relative z-10 md:flex md:min-h-screen md:items-start md:justify-center">
        <div className="relative w-full md:max-w-[560px] md:mt-6 md:rounded-t-[2.75rem] md:ring-1 md:ring-white/10 md:shadow-[0_20px_60px_rgba(0,0,0,0.5)] md:overflow-hidden">
          {/* Theme surface */}
          <div
            className="relative min-h-[100lvh] md:min-h-[calc(100lvh-1.5rem)]"
            style={hasBackground ? {} : { background: theme.styles['--bg-gradient'] }}
          >
            {/* Desktop-only: background image + animated orbs inside the frame */}
            <div className="hidden md:block absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
              {hasBackground && (
                <>
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
                </>
              )}
              <Orbs />
            </div>

            <div className="relative z-[1] max-w-lg mx-auto px-6 py-16">
              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.displayName}
                    className="w-24 h-24 rounded-full object-cover mb-4 ring-4 shadow-xl"
                    style={{
                      ringColor: 'var(--accent-glow)',
                      boxShadow: `0 0 30px var(--accent-glow)`,
                    }}
                  />
                ) : (
                  <div
                    className="w-24 h-24 rounded-full mb-4 flex items-center justify-center text-3xl font-bold shadow-xl"
                    style={{
                      background: 'var(--card-bg)',
                      color: 'var(--accent)',
                      border: '3px solid var(--accent)',
                      boxShadow: `0 0 30px var(--accent-glow)`,
                    }}
                  >
                    {profile.displayName?.charAt(0)?.toUpperCase()}
                  </div>
                )}

                <h1
                  className="text-2xl font-bold tracking-tight"
                  style={{
                    color: 'var(--profile-name-color, var(--text-primary))',
                    fontFamily: 'var(--profile-name-font, inherit)',
                  }}
                >
                  {profile.displayName}
                </h1>

                {profile.bio && (
                  <p
                    className="mt-2 text-sm text-center max-w-xs leading-relaxed"
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

              {/* Links grouped by category (uncategorized first, no header) */}
              {sections.map((section) => (
                <div key={section.id ?? 'uncategorized'} className={section.id != null ? 'mb-8' : 'mb-3'}>
                  {section.name && (
                    <h2
                      className="mb-3 text-sm font-semibold tracking-wide text-center"
                      style={{
                        color: 'var(--category-name-color, var(--text-secondary))',
                        fontWeight: 'var(--text-category-weight, 600)',
                        fontFamily: 'var(--category-name-font, inherit)',
                      }}
                    >
                      {section.name}
                    </h2>
                  )}

                  {section.iconLinks.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                      {section.iconLinks.map((link, index) => (
                        <div
                          key={link.id}
                          style={{ animation: `fadeInUp 0.4s ease-out ${index * 0.06}s both` }}
                        >
                          <LinkIconButton link={link} slug={slug} onTrackClick={handleTrackClick} />
                        </div>
                      ))}
                    </div>
                  )}

                  {section.cardLinks.length > 0 && (
                    <div className="space-y-3">
                      {section.cardLinks.map((link, index) => (
                        <div
                          key={link.id}
                          style={{
                            animation: `fadeInUp 0.4s ease-out ${index * 0.08}s both`,
                          }}
                        >
                          <LinkCard link={link} slug={slug} onTrackClick={handleTrackClick} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <Footer />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
