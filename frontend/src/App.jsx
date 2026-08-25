import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PublicProfile from './pages/PublicProfile';
import Privacy from './pages/Privacy';
import Login from './pages/Login';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ProfileEditor from './pages/admin/ProfileEditor';
import LinksManager from './pages/admin/LinksManager';
import UsersManager from './pages/admin/UsersManager';

const RESERVED_SUBDOMAINS = ['www', 'app', 'api'];

// Production domain used for per-profile subdomains, e.g. <slug>.example.com.
// Change this to match your own domain when you deploy the app.
const APP_DOMAIN = 'example.com';

function getProfileSubdomain() {
  const match = window.location.hostname.match(new RegExp(`^([a-z0-9-]+)\\.${APP_DOMAIN.replace(/\./g, '\\.')}$`, 'i'));
  return match && !RESERVED_SUBDOMAINS.includes(match[1]) ? match[1] : null;
}

export default function App() {
  const profileSlug = getProfileSubdomain();

  // On a profile subdomain (e.g. alice.example.com), render the public
  // profile directly, without the /app prefix used on the main domain.
  if (profileSlug) {
    return (
      <BrowserRouter basename="/">
        <Routes>
          <Route path="/" element={<PublicProfile slug={profileSlug} />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter basename="/app">
      <Routes>
        {/* Public pages — freely accessible */}
        <Route path="/" element={<Home />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/:slug" element={<PublicProfile />} />

        {/* Admin — auth required */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="profile/:id" element={<ProfileEditor />} />
          <Route path="links/:profileId" element={<LinksManager />} />
          <Route path="users" element={<UsersManager />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
