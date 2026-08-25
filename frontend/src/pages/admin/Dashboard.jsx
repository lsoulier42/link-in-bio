import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LinkIcon, Eye, Settings, Users } from 'lucide-react';
import { api } from '../../lib/api';
import Skeleton from '../../components/admin/Skeleton';
import EmptyState from '../../components/admin/EmptyState';
import ErrorState from '../../components/admin/ErrorState';

export default function Dashboard() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchProfiles = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .me()
      .then((data) => setProfiles(data.profiles))
      .catch((err) => {
        if (err.message === 'Unauthorized' || err.message.includes('401')) {
          navigate('/admin/login');
        } else {
          setError(err.message);
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="glass rounded-[var(--radius-lg)] p-6 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchProfiles} />;
  }

  return (
    <div className="relative z-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">My profiles</h1>
        <p className="mt-1 text-sm text-slate-400">
          Manage your link pages and how they look.
        </p>
      </div>

      {profiles.length === 0 ? (
        <EmptyState
          icon={<Users className="w-7 h-7" aria-hidden="true" />}
          title="No profile yet"
          description="Your account doesn't have any public link page yet."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="glass rounded-[var(--radius-lg)] p-6 hover:bg-[rgba(30,41,59,0.8)] transition-colors duration-150 anim-pop-in"
            >
              <div className="flex items-center gap-3 mb-4">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover border border-white/10"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[var(--accent-soft)] flex items-center justify-center text-violet-300 font-bold text-lg">
                    {profile.displayName?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <h2 className="font-semibold text-white truncate">{profile.displayName}</h2>
                  <p className="text-sm text-slate-400 truncate">/{profile.slug}</p>
                </div>
              </div>

              {profile.bio && (
                <p className="text-sm text-slate-300 mb-4 line-clamp-2">{profile.bio}</p>
              )}

              <div className="flex gap-2">
                <Link
                  to={`/admin/links/${profile.id}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[var(--accent-soft)] text-violet-200 rounded-xl text-sm font-medium hover:bg-[var(--accent)] hover:text-white transition-colors"
                >
                  <LinkIcon className="w-4 h-4" aria-hidden="true" />
                  Links
                </Link>
                <Link
                  to={`/admin/profile/${profile.id}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-slate-200 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors"
                >
                  <Settings className="w-4 h-4" aria-hidden="true" />
                  Profile
                </Link>
                <a
                  href={`/app/${profile.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-3 py-2 bg-white/5 border border-white/10 text-slate-200 rounded-xl text-sm hover:bg-white/10 transition-colors"
                  title="View public page"
                  aria-label={`View the public page of ${profile.displayName}`}
                >
                  <Eye className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
