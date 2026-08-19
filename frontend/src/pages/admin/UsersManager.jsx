import { useCallback, useEffect, useState } from 'react';
import { Plus, ShieldCheck, ShieldOff, UserX, Users, Pencil, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import Button from '../../components/admin/Button';
import Badge from '../../components/admin/Badge';
import Drawer from '../../components/admin/Drawer';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { Field } from '../../components/admin/Field';
import Toggle from '../../components/admin/Toggle';
import Skeleton from '../../components/admin/Skeleton';
import EmptyState from '../../components/admin/EmptyState';
import ErrorState from '../../components/admin/ErrorState';
import { useToast } from '../../components/admin/Toast';

const emptyForm = {
  email: '',
  password: '',
  isAdmin: false,
  profileSlug: '',
  profileDisplayName: '',
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function UsersManager() {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .me()
      .then((me) => setCurrentUserId(me.id))
      .catch(() => {})
      .then(() => api.getUsers())
      .then((data) => setUsers(data.users))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setDrawerOpen(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setForm({
      email: user.email,
      password: '',
      isAdmin: user.roles.includes('ROLE_ADMIN'),
      profileSlug: '',
      profileDisplayName: '',
    });
    setFormError(null);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    if (saving) return;
    setDrawerOpen(false);
  };

  const handleSave = async () => {
    setFormError(null);
    if (!form.email.trim()) {
      setFormError('L\'email est requis.');
      return;
    }
    if (!editing && !form.password) {
      setFormError('Le mot de passe est requis.');
      return;
    }

    setSaving(true);
    try {
      const roles = form.isAdmin ? ['ROLE_ADMIN'] : [];
      if (editing) {
        const payload = { email: form.email.trim(), roles };
        if (form.password) payload.password = form.password;
        await api.updateUser(editing.id, payload);
        toast('Utilisateur mis à jour');
      } else {
        const payload = { email: form.email.trim(), password: form.password, roles };
        if (form.profileSlug.trim()) {
          payload.profile = {
            slug: form.profileSlug.trim(),
            displayName: form.profileDisplayName.trim() || form.profileSlug.trim(),
          };
        }
        await api.createUser(payload);
        toast('Utilisateur créé');
      }
      setDrawerOpen(false);
      fetchUsers();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleAdmin = async (user) => {
    const isAdmin = user.roles.includes('ROLE_ADMIN');
    setBusyId(user.id);
    try {
      await api.updateUser(user.id, {
        roles: isAdmin ? [] : ['ROLE_ADMIN'],
      });
      toast(isAdmin ? 'Rôle administrateur retiré' : 'Utilisateur promu administrateur');
      fetchUsers();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.deleteUser(deleteTarget.id);
      toast('Utilisateur supprimé');
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className="glass rounded-[var(--radius-lg)] p-4 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchUsers} />;
  }

  return (
    <div className="relative z-10">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Utilisateurs</h1>
          <p className="mt-1 text-sm text-slate-400">
            Gérez les comptes et les rôles administrateurs.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" aria-hidden="true" />
          Nouvel utilisateur
        </Button>
      </div>

      {users.length === 0 ? (
        <EmptyState
          icon={<Users className="w-7 h-7" aria-hidden="true" />}
          title="Aucun utilisateur"
          description="Créez votre premier utilisateur."
          action={
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4" aria-hidden="true" />
              Créer un utilisateur
            </Button>
          }
        />
      ) : (
        <div className="glass rounded-[var(--radius-lg)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-3 font-medium">Utilisateur</th>
                  <th className="px-5 py-3 font-medium">Rôle</th>
                  <th className="hidden sm:table-cell px-5 py-3 font-medium">Créé le</th>
                  <th className="hidden md:table-cell px-5 py-3 font-medium">Profils</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => {
                  const isSelf = user.id === currentUserId;
                  const isAdmin = user.roles.includes('ROLE_ADMIN');
                  return (
                    <tr key={user.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="text-slate-100 font-medium">{user.email}</p>
                        {isSelf && (
                          <p className="text-xs text-violet-300 mt-0.5">Votre compte</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {isAdmin ? (
                          <Badge tone="success">Admin</Badge>
                        ) : (
                          <Badge tone="neutral">Utilisateur</Badge>
                        )}
                      </td>
                      <td className="hidden sm:table-cell px-5 py-3.5 text-slate-400">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="hidden md:table-cell px-5 py-3.5">
                        {user.profiles.length === 0 ? (
                          <span className="text-slate-500">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {user.profiles.map((p) => (
                              <span
                                key={p.id}
                                className="inline-flex items-center rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-xs text-slate-300"
                              >
                                /{p.slug}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          {busyId === user.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-slate-400" aria-hidden="true" />
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => toggleAdmin(user)}
                                disabled={isSelf}
                                title={isAdmin ? 'Retirer le rôle admin' : 'Rendre administrateur'}
                                aria-label={isAdmin ? `Retirer le rôle admin de ${user.email}` : `Rendre ${user.email} administrateur`}
                                className={`p-2 rounded-lg transition-colors disabled:opacity-40 disabled:pointer-events-none ${
                                  isAdmin
                                    ? 'text-amber-300 hover:bg-amber-500/15'
                                    : 'text-emerald-300 hover:bg-emerald-500/15'
                                }`}
                              >
                                {isAdmin ? (
                                  <ShieldOff className="w-4 h-4" aria-hidden="true" />
                                ) : (
                                  <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => openEdit(user)}
                                title="Modifier"
                                aria-label={`Modifier ${user.email}`}
                                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                              >
                                <Pencil className="w-4 h-4" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(user)}
                                disabled={isSelf}
                                title={isSelf ? 'Impossible de supprimer votre compte' : 'Supprimer'}
                                aria-label={`Supprimer ${user.email}`}
                                className="p-2 rounded-lg text-red-400 hover:bg-red-500/15 hover:text-red-300 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                              >
                                <UserX className="w-4 h-4" aria-hidden="true" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={editing ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
        description={editing ? 'Mettez à jour les informations du compte.' : 'Créez un compte pour un nouvel utilisateur.'}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={closeDrawer} disabled={saving}>
              Annuler
            </Button>
            <Button onClick={handleSave} loading={saving} disabled={saving}>
              {editing ? 'Enregistrer' : 'Créer l\'utilisateur'}
            </Button>
          </div>
        }
      >
        {formError && (
          <div
            className="mb-4 p-3 rounded-[var(--radius-md)] bg-red-500/10 border border-red-500/25 text-sm text-red-300"
            role="alert"
          >
            {formError}
          </div>
        )}

        <div className="space-y-4">
          <Field label="Email" htmlFor="user-email" required>
            <input
              id="user-email"
              type="email"
              autoComplete="off"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30 transition-colors"
              placeholder="email@exemple.com"
            />
          </Field>

          <Field
            label={editing ? 'Mot de passe' : 'Mot de passe'}
            htmlFor="user-password"
            required={!editing}
            helper={editing ? 'Laisser vide pour conserver le mot de passe actuel.' : 'Minimum 8 caractères.'}
          >
            <input
              id="user-password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30 transition-colors"
              placeholder="••••••••"
            />
          </Field>

          <div className="flex items-center justify-between gap-3 glass-subtle rounded-[var(--radius-md)] px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-200">Administrateur</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Accès à la gestion des utilisateurs.
              </p>
            </div>
            <Toggle
              checked={form.isAdmin}
              onChange={(v) => setForm({ ...form, isAdmin: v })}
              label={form.isAdmin ? 'Rendre utilisateur' : 'Rendre administrateur'}
              disabled={editing?.id === currentUserId}
            />
          </div>

          {!editing && (
            <>
              <div className="pt-2">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-medium mb-3">
                  Profil initial <span className="text-slate-500 normal-case">(optionnel)</span>
                </p>
                <div className="space-y-4">
                  <Field label="Slug" htmlFor="profile-slug" helper="Ex. « camille » pour camille.fayefiore.com">
                    <input
                      id="profile-slug"
                      type="text"
                      value={form.profileSlug}
                      onChange={(e) => setForm({ ...form, profileSlug: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30 transition-colors"
                      placeholder="camille"
                    />
                  </Field>
                  <Field label="Nom affiché" htmlFor="profile-display-name">
                    <input
                      id="profile-display-name"
                      type="text"
                      value={form.profileDisplayName}
                      onChange={(e) => setForm({ ...form, profileDisplayName: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30 transition-colors"
                      placeholder="Camille"
                    />
                  </Field>
                </div>
              </div>
            </>
          )}
        </div>
      </Drawer>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        busy={deleting}
        title="Supprimer l'utilisateur ?"
        message={
          deleteTarget
            ? `Le compte ${deleteTarget.email} et tous ses profils, liens et catégories seront définitivement supprimés.`
            : ''
        }
        confirmLabel="Supprimer"
      />
    </div>
  );
}
