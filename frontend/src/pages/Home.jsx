import { useEffect, useState } from 'react';
import { Sparkles, Users, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { api } from '../lib/api';

const FALLBACK_PROFILES = [
  { slug: 'alice', name: 'Alice', emoji: '✨' },
  { slug: 'bob', name: 'Bob', emoji: '🎵' },
];

export default function Home() {
  const [profiles, setProfiles] = useState(FALLBACK_PROFILES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProfiles()
      .then((data) => {
        if (Array.isArray(data.profiles) && data.profiles.length > 0) {
          setProfiles(data.profiles.map((p) => ({
            slug: p.slug,
            name: p.displayName,
            emoji: null,
          })));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
    }}>
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{ background: '#8b5cf6', top: '10%', left: '-10%', animationDuration: '4s' }}
        />
        <div
          className="absolute w-80 h-80 rounded-full blur-3xl opacity-15 animate-pulse"
          style={{ background: '#ec4899', bottom: '10%', right: '-5%', animationDuration: '6s', animationDelay: '2s' }}
        />
      </div>

      <div className="relative z-10 max-w-md mx-auto px-6 py-20">
        {/* Logo / Title */}
        <div className="flex flex-col items-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center mb-5 shadow-xl shadow-violet-500/30">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Link in Bio</h1>
          <p className="mt-2 text-sm text-slate-400 text-center">
            Your personalized link pages
          </p>
        </div>

        {/* Profile cards */}
        <div className="space-y-3">
          {loading && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
            </div>
          )}
          {!loading && profiles.map((p, index) => (
            <Link
              key={p.slug}
              to={`/${p.slug}`}
              className="group block w-full rounded-2xl p-5 backdrop-blur-md transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-0.5"
              style={{
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(139, 92, 246, 0.15)',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
                animation: `fadeInUp 0.4s ease-out ${index * 0.1}s both`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.85)';
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(0, 0, 0, 0.3), 0 0 20px rgba(139, 92, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.15)';
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(0, 0, 0, 0.3)';
              }}
            >
              <div className="flex items-center gap-4">
                {p.emoji ? (
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl text-2xl"
                    style={{ background: 'rgba(139, 92, 246, 0.2)' }}
                  >
                    {p.emoji}
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl text-xl font-bold text-violet-300"
                    style={{ background: 'rgba(139, 92, 246, 0.2)' }}
                  >
                    {p.name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <span className="block font-semibold text-white">{p.name}</span>
                  <span className="block text-xs text-slate-400">/{p.slug}</span>
                </div>
                <Users className="w-5 h-5 text-slate-500 group-hover:text-violet-400 transition-colors" />
              </div>
            </Link>
          ))}
        </div>

        <Footer />
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
