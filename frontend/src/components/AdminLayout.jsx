import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate, Outlet } from 'react-router-dom';
import { LogOut, Sparkles, Users } from 'lucide-react';
import { api } from '../lib/api';
import Aurora from './Aurora';

export default function AdminLayout() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    api
      .me()
      .then((data) => setIsAdmin(data.roles?.includes('ROLE_ADMIN') ?? false))
      .catch(() => setIsAdmin(false));
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    }
    navigate('/admin/login');
  };

  return (
    <div className="admin-bg min-h-screen text-[var(--text-primary)]">
      <Aurora />
      <div className="admin-noise" aria-hidden="true" />

      <nav className="relative z-20 sticky top-0 glass border-x-0 border-t-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Link
              to="/admin"
              className="flex items-center gap-2.5 font-bold text-white tracking-tight group"
            >
              <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-900/40">
                <Sparkles className="w-4 h-4 text-white" aria-hidden="true" />
              </span>
              <span className="text-lg">
                FayeFiore <span className="text-slate-400 font-medium">Admin</span>
              </span>
            </Link>

            {isAdmin && (
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${
                    isActive
                      ? 'bg-violet-500/15 text-violet-200'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                <Users className="w-4 h-4" aria-hidden="true" />
                Utilisateurs
              </NavLink>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            Déconnexion
          </button>
        </div>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
