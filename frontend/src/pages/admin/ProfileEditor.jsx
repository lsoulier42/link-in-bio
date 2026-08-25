import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { ArrowLeft, Image, Save, Type, User } from 'lucide-react';
import { api } from '../../lib/api';
import ThemeSelector from '../../components/ThemeSelector';
import ImageUpload from '../../components/ImageUpload';
import ColorField from '../../components/admin/ColorField';
import FontField from '../../components/admin/FontField';
import { TextInput, TextArea } from '../../components/admin/Field';
import Button from '../../components/admin/Button';
import Skeleton from '../../components/admin/Skeleton';
import ErrorState from '../../components/admin/ErrorState';
import { useToast } from '../../components/admin/Toast';

function Segmented({ label, value, options, onChange, className = 'grid-cols-2' }) {
  return (
    <div>
      <span className="block text-sm font-medium text-slate-200 mb-1.5">{label}</span>
      <div className={`grid gap-2 ${className}`}>
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              aria-pressed={selected}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 border ${
                selected
                  ? 'border-violet-400 ring-2 ring-violet-400/30 bg-violet-500/10 text-white'
                  : 'border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/25'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ProfileEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .getMyProfiles()
      .then((data) => {
        const found = data.profiles.find((p) => p.id === parseInt(id));
        if (found) setProfile(found);
        else navigate('/admin');
      })
      .catch((err) => {
        if (err.message === 'Unauthorized' || err.message.includes('401')) {
          navigate('/admin/login');
        } else {
          setError(err.message);
        }
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await api.updateProfile(id, {
        slug: profile.slug,
        displayName: profile.displayName,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
        themeName: profile.themeName,
        backgroundUrl: profile.backgroundUrl,
        backgroundOverlay: profile.backgroundOverlay,
        backgroundSize: profile.backgroundSize,
        backgroundPosition: profile.backgroundPosition,
        nameColor: profile.nameColor,
        bioColor: profile.bioColor,
        categoryColor: profile.categoryColor,
        nameFont: profile.nameFont,
        bioFont: profile.bioFont,
        categoryFont: profile.categoryFont,
      });
      setProfile(updated);
      toast('Profile saved');
    } catch (err) {
      toast(err.message || 'Error while saving', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="glass rounded-[var(--radius-lg)] p-8 space-y-4" aria-hidden="true">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => navigate('/admin')} />;
  }

  return (
    <div className="relative z-10">
      <RouterLink
        to="/admin"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-5"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Back to dashboard
      </RouterLink>

      <div className="glass rounded-[var(--radius-lg)] p-6 sm:p-8 anim-pop-in">
        <h1 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-violet-300" aria-hidden="true" />
          Edit profile — {profile.slug}
        </h1>

        <div className="space-y-5">
          <TextInput
            id="profile-slug"
            label="Slug (subdomain)"
            value={profile.slug || ''}
            onChange={(e) => setProfile({ ...profile, slug: e.target.value })}
            helper="Public address: your-slug.example.com"
            required
          />

          <TextInput
            id="profile-display-name"
            label="Display name"
            value={profile.displayName || ''}
            onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
            required
          />

          <TextArea
            id="profile-bio"
            label="Bio"
            value={profile.bio || ''}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            rows={3}
            className="resize-none"
          />

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1.5">Avatar</label>
            <ImageUpload
              value={profile.avatarUrl || ''}
              onChange={(avatarUrl) => setProfile({ ...profile, avatarUrl })}
            />
          </div>

          <div className="glass-subtle rounded-[var(--radius-md)] p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-200">
                <Image className="w-4 h-4 text-violet-300" aria-hidden="true" />
                Background image
              </p>
              <span className="text-[11px] text-slate-500">optional</span>
            </div>

            <ImageUpload
              value={profile.backgroundUrl || ''}
              onChange={(backgroundUrl) => setProfile({ ...profile, backgroundUrl })}
              uploadDir="backgrounds"
              crop={false}
              banner
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="background-overlay" className="block text-sm font-medium text-slate-200">
                  Overlay opacity
                </label>
                <span className="text-xs text-slate-400 tabular-nums">{profile.backgroundOverlay}%</span>
              </div>
              <input
                id="background-overlay"
                type="range"
                min={0}
                max={100}
                step={5}
                value={profile.backgroundOverlay}
                onChange={(e) => setProfile({ ...profile, backgroundOverlay: Number(e.target.value) })}
                className="w-full accent-violet-500"
              />
              <p className="mt-1.5 text-xs text-slate-500">
                The higher the opacity, the more the theme covers the image to keep it readable.
              </p>
            </div>

            <Segmented
              label="Image display"
              value={profile.backgroundSize}
              options={[
                { value: 'cover', label: 'Cover' },
                { value: 'contain', label: 'Fit' },
              ]}
              onChange={(backgroundSize) => setProfile({ ...profile, backgroundSize })}
            />

            <Segmented
              label="Position"
              value={profile.backgroundPosition}
              className="grid-cols-3"
              options={[
                { value: 'top', label: 'Top' },
                { value: 'center', label: 'Center' },
                { value: 'bottom', label: 'Bottom' },
              ]}
              onChange={(backgroundPosition) => setProfile({ ...profile, backgroundPosition })}
            />
          </div>

          <ThemeSelector
            currentTheme={profile.themeName}
            onSelect={(name) => setProfile({ ...profile, themeName: name })}
          />

          <div className="glass-subtle rounded-[var(--radius-md)] p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-200">
                <Type className="w-4 h-4 text-violet-300" aria-hidden="true" />
                Text colors
              </p>
              <span className="text-[11px] text-slate-500">optional</span>
            </div>

            <ColorField
              id="profile-name-color"
              label="Display name"
              value={profile.nameColor}
              onChange={(nameColor) => setProfile({ ...profile, nameColor })}
            />

            <ColorField
              id="profile-bio-color"
              label="Bio"
              value={profile.bioColor}
              onChange={(bioColor) => setProfile({ ...profile, bioColor })}
            />

            <ColorField
              id="profile-category-color"
              label="Category titles"
              value={profile.categoryColor}
              onChange={(categoryColor) => setProfile({ ...profile, categoryColor })}
              helper="Leave « Auto » to use the theme colors."
            />
          </div>

          <div className="glass-subtle rounded-[var(--radius-md)] p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-200">
                <Type className="w-4 h-4 text-violet-300" aria-hidden="true" />
                Text fonts
              </p>
              <span className="text-[11px] text-slate-500">optional</span>
            </div>

            <FontField
              id="profile-name-font"
              label="Display name"
              value={profile.nameFont}
              onChange={(nameFont) => setProfile({ ...profile, nameFont })}
            />

            <FontField
              id="profile-bio-font"
              label="Bio"
              value={profile.bioFont}
              onChange={(bioFont) => setProfile({ ...profile, bioFont })}
            />

            <FontField
              id="profile-category-font"
              label="Category titles"
              value={profile.categoryFont}
              onChange={(categoryFont) => setProfile({ ...profile, categoryFont })}
              helper="Leave « Auto » to use the theme's default font."
            />
          </div>

          <div className="pt-2">
            <Button onClick={handleSave} loading={saving} disabled={saving}>
              {!saving && <Save className="w-4 h-4" aria-hidden="true" />}
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
