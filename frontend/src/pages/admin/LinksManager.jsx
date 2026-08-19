import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, Pencil, ExternalLink,
  AtSign, MoreVertical, GripVertical, Link2, ArrowUp, ArrowDown,
  EyeOff, BarChart3, Smartphone, AlertCircle,
  Link as LinkIcon, Globe as GlobeIcon,
  Tag, FolderPlus, Check, X,
} from 'lucide-react';
import { api } from '../../lib/api';
import IconPicker from '../../components/IconPicker';
import PlatformPicker from '../../components/PlatformPicker';
import ImageUpload from '../../components/ImageUpload';
import { resolveIcon, ICONS } from '../../icons';
import Button from '../../components/admin/Button';
import { TextInput, Field, inputCls } from '../../components/admin/Field';
import Toggle from '../../components/admin/Toggle';
import Badge from '../../components/admin/Badge';
import Drawer from '../../components/admin/Drawer';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import Skeleton from '../../components/admin/Skeleton';
import EmptyState from '../../components/admin/EmptyState';
import ErrorState from '../../components/admin/ErrorState';
import DropdownMenu from '../../components/admin/DropdownMenu';
import PhonePreview from '../../components/admin/PhonePreview';
import { StepperIndicator, StepperFooter } from '../../components/admin/Stepper';
import { useToast } from '../../components/admin/Toast';

const EMPTY_FORM = {
  platform: '',
  linkMode: 'handle',
  handle: '',
  url: '',
  title: '',
  subtitle: '',
  iconName: '',
  iconUrl: '',
  displayStyle: 'card',
  categoryId: '',
  isActive: true,
};

const STEPS = [
  { key: 'platform', label: 'Plateforme' },
  { key: 'link', label: 'Lien' },
  { key: 'title', label: 'Titre' },
  { key: 'category', label: 'Catégorie' },
  { key: 'subtitle', label: 'Sous-titre' },
  { key: 'icon', label: 'Icône' },
  { key: 'display', label: 'Affichage' },
];

const STEP_DESCRIPTIONS = {
  platform: 'Choisissez une plateforme (optionnel) ou créez un lien libre.',
  link: 'Générez le lien depuis un pseudo ou saisissez une URL personnalisée.',
  title: 'Donnez un titre à votre lien.',
  category: 'Rangez ce lien dans une catégorie (optionnel).',
  subtitle: 'Ajoutez un sous-titre (optionnel).',
  icon: 'Choisissez une icône existante ou importez la vôtre.',
  display: 'Choisissez comment afficher ce lien sur votre page.',
};

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function hostnameOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url || '';
  }
}

export default function LinksManager() {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [links, setLinks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [networks, setNetworks] = useState([]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [initialForm, setInitialForm] = useState(EMPTY_FORM);
  const [subtitleAuto, setSubtitleAuto] = useState(true);
  const [serverError, setServerError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savingToggleId, setSavingToggleId] = useState(null);

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [discardDialog, setDiscardDialog] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [confirmDeleteCategory, setConfirmDeleteCategory] = useState(null);
  const [categoryBusy, setCategoryBusy] = useState(false);

  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  const savingRef = useRef(false);
  const dragIndexRef = useRef(null);

  const fetchLinks = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    api
      .getLinks(profileId)
      .then((data) => setLinks(data.links))
      .catch((err) => {
        if (err.message === 'Unauthorized' || err.message.includes('401')) {
          navigate('/admin/login');
        } else {
          setLoadError(err.message);
        }
      })
      .finally(() => setLoading(false));
  }, [profileId, navigate]);

  const fetchCategories = useCallback(() => {
    api
      .getCategories(profileId)
      .then((data) => setCategories(data.categories))
      .catch(() => {});
  }, [profileId]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    api
      .getMyProfiles()
      .then((data) => {
        const found = data.profiles.find((p) => p.id === parseInt(profileId));
        if (found) setProfile(found);
      })
      .catch(() => {});
  }, [profileId]);

  useEffect(() => {
    api
      .getSocialNetworks()
      .then((data) => setNetworks(data.networks))
      .catch(() => setNetworks([]));
  }, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setInitialForm(EMPTY_FORM);
    setSubtitleAuto(true);
    setEditingLink(null);
    setStep(0);
    setServerError(null);
    setDrawerOpen(false);
  };

  const openCreate = () => {
    setEditingLink(null);
    setForm(EMPTY_FORM);
    setInitialForm(EMPTY_FORM);
    setSubtitleAuto(true);
    setStep(0);
    setServerError(null);
    setDrawerOpen(true);
  };

  const openEdit = (link) => {
    setEditingLink(link);
    const hasNetwork = Boolean(link.networkType);
    const nextForm = {
      platform: link.networkType || '',
      linkMode: hasNetwork ? 'handle' : 'url',
      handle: link.handle || '',
      url: link.url || '',
      title: link.title || '',
      subtitle: link.subtitle || '',
      iconName: link.iconName || '',
      iconUrl: link.iconUrl || '',
      displayStyle: link.displayStyle || 'card',
      categoryId: link.categoryId ?? '',
      isActive: link.isActive,
    };
    setSubtitleAuto(false);
    setForm(nextForm);
    setInitialForm(nextForm);
    setStep(0);
    setServerError(null);
    setDrawerOpen(true);
  };

  const isDirty = useMemo(() => {
    if (!drawerOpen) return false;
    return JSON.stringify(form) !== JSON.stringify(initialForm);
  }, [drawerOpen, form, initialForm]);

  const requestClose = () => {
    if (saving) return;
    if (isDirty) {
      setDiscardDialog(true);
    } else {
      resetForm();
    }
  };

  const handlePlatformSelect = (key) => {
    setForm((prev) => {
      if (prev.platform === key) return prev;
      const next = { ...prev, platform: key };
      if (key) {
        const entry = ICONS[key];
        const network = networks.find((n) => n.key === key);
        const hasTemplate = Boolean(network?.urlTemplate);
        if (!next.title) next.title = entry?.label || '';
        if (!next.iconName) next.iconName = key;
        next.linkMode = hasTemplate ? 'handle' : 'url';
      } else {
        next.linkMode = 'url';
      }
      return next;
    });
  };

  const handleHandleChange = (handle) => {
    setForm((prev) => {
      if (handle === prev.handle) return prev;
      const next = { ...prev, handle };
      if (subtitleAuto) {
        const clean = handle.trim().replace(/^@/, '');
        next.subtitle = clean ? `@${clean}` : '';
      }
      return next;
    });
  };

  const generatedUrl = useMemo(() => {
    if (form.linkMode !== 'handle' || !form.platform || !form.handle.trim()) return '';
    const network = networks.find((n) => n.key === form.platform);
    if (!network) return '';
    const handle = form.handle.trim().replace(/^@/, '');
    if (network.key === 'mastodon') {
      const [user, instance] = handle.split('@');
      return user && instance ? `https://${instance}/@${user}` : '';
    }
    return network.urlTemplate.replace('%s', handle);
  }, [form.linkMode, form.platform, form.handle, networks]);

  const validateStep = (index) => {
    const errors = {};
    switch (index) {
      case 1:
        if (form.linkMode === 'handle') {
          if (!form.platform) errors.platform = 'Choisissez une plateforme pour générer le lien';
          if (!form.handle.trim()) errors.handle = 'Le pseudo est requis';
          else if (!generatedUrl) errors.handle = 'Pseudo invalide pour cette plateforme';
        } else {
          if (!form.url.trim()) errors.url = 'L’URL est requise';
          else if (!isValidHttpUrl(form.url.trim())) {
            errors.url = 'Entrez une URL valide (http:// ou https://)';
          }
        }
        break;
      case 2:
        if (!form.title.trim()) errors.title = 'Le titre est requis';
        break;
      default:
        break;
    }
    return errors;
  };

  const stepErrors = validateStep(step);
  const canGoNext = Object.keys(stepErrors).length === 0;

  const handleNext = () => {
    if (!canGoNext) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 0));
  };

  const validateAll = () => {
    let errors = {};
    STEPS.forEach((_, index) => {
      errors = { ...errors, ...validateStep(index) };
    });
    return errors;
  };

  const handleSubmit = async () => {
    if (savingRef.current) return;
    const errors = validateAll();
    if (Object.keys(errors).length > 0) {
      setStep(STEPS.findIndex((_, i) => Object.keys(validateStep(i)).length > 0));
      setServerError(null);
      return;
    }

    savingRef.current = true;
    setSaving(true);
    setServerError(null);
    try {
      const payload = {
        platform: form.platform,
        linkMode: form.linkMode,
        handle: form.linkMode === 'handle' ? form.handle : null,
        url: form.linkMode === 'url' ? form.url : null,
        title: form.title,
        subtitle: form.subtitle || null,
        iconName: form.iconName || null,
        iconUrl: form.iconUrl || null,
        displayStyle: form.displayStyle,
        categoryId: form.categoryId === '' ? null : Number(form.categoryId),
        isActive: form.isActive,
      };
      if (editingLink) {
        await api.updateLink(profileId, editingLink.id, payload);
        toast('Lien modifié');
      } else {
        await api.createLink(profileId, payload);
        toast('Lien créé');
      }
      resetForm();
      fetchLinks();
    } catch (err) {
      setServerError(err.message || 'Erreur lors de l’enregistrement');
      toast(editingLink ? 'Erreur lors de la modification' : 'Erreur lors de la création', 'error');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const handleToggle = async (link) => {
    setSavingToggleId(link.id);
    try {
      await api.updateLink(profileId, link.id, { isActive: !link.isActive });
      toast(link.isActive ? 'Lien masqué' : 'Lien activé');
      fetchLinks();
    } catch {
      toast('Erreur lors de la mise à jour', 'error');
    } finally {
      setSavingToggleId(null);
    }
  };

  const persistOrder = async (ordered) => {
    try {
      await api.reorderLinks(profileId, ordered.map((l) => l.id));
      toast('Ordre enregistré');
    } catch {
      toast('Impossible d’enregistrer l’ordre', 'error');
      fetchLinks();
    }
  };

  const moveLink = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= links.length) return;
    const next = [...links];
    [next[index], next[target]] = [next[target], next[index]];
    setLinks(next);
    persistOrder(next);
  };

  const handleDragStart = (index) => (e) => {
    dragIndexRef.current = index;
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (index) => (e) => {
    if (dragIndexRef.current === null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (overIndex !== index) setOverIndex(index);
  };

  const handleDrop = (index) => (e) => {
    e.preventDefault();
    const from = dragIndexRef.current;
    if (from === null || from === index) return;
    dragIndexRef.current = null;
    setDragIndex(null);
    setOverIndex(null);
    const next = [...links];
    const [moved] = next.splice(from, 1);
    next.splice(index, 0, moved);
    setLinks(next);
    persistOrder(next);
  };

  const handleDragEnd = () => {
    dragIndexRef.current = null;
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await api.deleteLink(profileId, confirmDelete.id);
      toast('Lien supprimé');
      setConfirmDelete(null);
      fetchLinks();
    } catch {
      toast('Erreur lors de la suppression', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateCategory = async (name, { select = false } = {}) => {
    const trimmed = name.trim();
    if (!trimmed) return null;
    setCategoryBusy(true);
    try {
      const created = await api.createCategory(profileId, { name: trimmed });
      toast('Catégorie créée');
      fetchCategories();
      if (select) setForm((prev) => ({ ...prev, categoryId: String(created.id) }));
      setNewCategoryName('');
      setCreatingCategory(false);
      return created;
    } catch (err) {
      toast(err.message || 'Erreur lors de la création de la catégorie', 'error');
      return null;
    } finally {
      setCategoryBusy(false);
    }
  };

  const handleRenameCategory = async (category, name) => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === category.name) {
      setEditingCategoryId(null);
      return;
    }
    setCategoryBusy(true);
    try {
      await api.updateCategory(profileId, category.id, { name: trimmed });
      toast('Catégorie renommée');
      fetchCategories();
    } catch (err) {
      toast(err.message || 'Erreur lors du renommage', 'error');
    } finally {
      setCategoryBusy(false);
      setEditingCategoryId(null);
    }
  };

  const handleDeleteCategoryConfirm = async () => {
    if (!confirmDeleteCategory) return;
    setCategoryBusy(true);
    try {
      await api.deleteCategory(profileId, confirmDeleteCategory.id);
      toast('Catégorie supprimée');
      setConfirmDeleteCategory(null);
      fetchCategories();
      fetchLinks();
    } catch (err) {
      toast(err.message || 'Erreur lors de la suppression', 'error');
    } finally {
      setCategoryBusy(false);
    }
  };

  const moveCategory = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= categories.length) return;
    const next = [...categories];
    [next[index], next[target]] = [next[target], next[index]];
    setCategories(next);
    api
      .reorderCategories(profileId, next.map((c) => c.id))
      .catch(() => {
        toast('Impossible d’enregistrer l’ordre', 'error');
        fetchCategories();
      });
  };

  const publicHref = profile ? `/app/${profile.slug}` : null;
  const isLastStep = step === STEPS.length - 1;
  const ChosenIcon = resolveIcon(form.iconName);

  return (
    <div className="relative z-10">
      <RouterLink
        to="/admin"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-5"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Retour au dashboard
      </RouterLink>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Gérer les liens</h1>
          <p className="mt-1 text-sm text-slate-400">
            {profile ? (
              <>
                Page publique : <span className="text-slate-300">/{profile.slug}</span>
              </>
            ) : (
              'Réordonnez, activez ou modifiez vos liens.'
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {publicHref && (
            <>
              <a
                href={publicHref}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex"
              >
                <Button variant="secondary">
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                  Voir la page publique
                </Button>
              </a>
              <Button
                variant="secondary"
                className="sm:hidden"
                onClick={() => setPreviewOpen(true)}
              >
                <Smartphone className="w-4 h-4" aria-hidden="true" />
                Aperçu
              </Button>
            </>
          )}
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4" aria-hidden="true" />
            Ajouter un lien
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-[var(--radius-md)] p-4 flex items-center gap-4">
              <Skeleton className="w-9 h-9 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="w-10 h-6 rounded-full" />
            </div>
          ))}
        </div>
      ) : loadError ? (
        <ErrorState message={loadError} onRetry={fetchLinks} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] items-start">
          {/* Link list */}
          <div className="space-y-2.5 min-w-0">
            {/* Categories management */}
            <div className="glass rounded-[var(--radius-md)] p-4 mb-1">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                    <Tag className="w-4 h-4 text-violet-300" aria-hidden="true" />
                    Catégories
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Optionnel — groupez vos liens pour les afficher par sections.
                  </p>
                </div>
                {!creatingCategory && (
                  <Button variant="secondary" size="sm" onClick={() => { setCreatingCategory(true); setNewCategoryName(''); }}>
                    <FolderPlus className="w-4 h-4" aria-hidden="true" />
                    Nouvelle
                  </Button>
                )}
              </div>

              {creatingCategory && (
                <div className="flex items-center gap-2 mb-3">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Nom de la catégorie (ex : Réseaux sociaux)"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateCategory(newCategoryName);
                      if (e.key === 'Escape') setCreatingCategory(false);
                    }}
                    className={`${inputCls()} text-sm`}
                  />
                  <Button
                    size="sm"
                    onClick={() => handleCreateCategory(newCategoryName)}
                    loading={categoryBusy}
                    disabled={!newCategoryName.trim()}
                  >
                    <Check className="w-4 h-4" aria-hidden="true" />
                    Créer
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setCreatingCategory(false)} disabled={categoryBusy}>
                    <X className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </div>
              )}

              {categories.length === 0 && !creatingCategory ? (
                <p className="text-xs text-slate-500">
                  Aucune catégorie. Les liens sans catégorie s'affichent directement en haut de la page.
                </p>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {categories.map((category, index) => (
                    <li
                      key={category.id}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 pl-3 pr-1.5 py-1"
                    >
                      {editingCategoryId === category.id ? (
                        <>
                          <input
                            autoFocus
                            type="text"
                            value={editCategoryName}
                            onChange={(e) => setEditCategoryName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRenameCategory(category, editCategoryName);
                              if (e.key === 'Escape') setEditingCategoryId(null);
                            }}
                            className="bg-transparent text-sm text-white outline-none w-32"
                          />
                          <button
                            type="button"
                            onClick={() => handleRenameCategory(category, editCategoryName)}
                            disabled={categoryBusy}
                            className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                            aria-label="Valider le renommage"
                          >
                            <Check className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-sm text-slate-200">{category.name}</span>
                          <span className="text-[11px] text-slate-500" title="Nombre de liens">
                            {category.linkCount}
                          </span>
                          <button
                            type="button"
                            onClick={() => { setEditingCategoryId(category.id); setEditCategoryName(category.name); }}
                            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                            aria-label={`Renommer ${category.name}`}
                          >
                            <Pencil className="w-3 h-3" aria-hidden="true" />
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => moveCategory(index, -1)}
                        disabled={index === 0}
                        className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                        aria-label={`Monter ${category.name}`}
                      >
                        <ArrowUp className="w-3 h-3" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveCategory(index, 1)}
                        disabled={index === categories.length - 1}
                        className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                        aria-label={`Descendre ${category.name}`}
                      >
                        <ArrowDown className="w-3 h-3" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteCategory(category)}
                        className="p-1 rounded-full text-slate-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                        aria-label={`Supprimer ${category.name}`}
                      >
                        <Trash2 className="w-3 h-3" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {links.map((link, index) => {
              const Icon = resolveIcon(link.iconName);
              const title = link.title || link.displayName || (link.handle ? `@${link.handle}` : '');
              const category = categories.find((c) => c.id === link.categoryId);
              return (
                <div
                  key={link.id}
                  onDragOver={handleDragOver(index)}
                  onDrop={handleDrop(index)}
                  className={`glass rounded-[var(--radius-md)] p-4 flex items-center gap-3 transition-all duration-150 ${
                    dragIndex === index
                      ? 'opacity-40'
                      : overIndex === index
                        ? 'border-[var(--accent)] shadow-[0_0_0_1px_var(--accent),var(--glass-shadow)]'
                        : ''
                  } ${link.isActive ? '' : 'opacity-70'}`}
                >
                  <div
                    draggable
                    onDragStart={handleDragStart(index)}
                    onDragEnd={handleDragEnd}
                    aria-label={`Réordonner le lien ${title || ''}`}
                    title="Glisser pour réordonner"
                    className="cursor-grab active:cursor-grabbing p-1 rounded-md text-slate-500 hover:text-slate-200 hover:bg-white/10 transition-colors touch-none"
                  >
                    <GripVertical className="w-4 h-4" aria-hidden="true" />
                  </div>

                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: 'var(--accent-soft)',
                      color: 'var(--accent)',
                      filter: link.isActive ? undefined : 'grayscale(1)',
                    }}
                  >
                    {link.iconUrl ? (
                      <img
                        src={link.iconUrl}
                        alt=""
                        className="w-4 h-4 rounded object-contain"
                        draggable={false}
                      />
                    ) : (
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-medium text-sm truncate ${link.isActive ? 'text-white' : 'text-slate-300'}`}>
                        {title || 'Lien'}
                      </p>
                      {!link.isActive && (
                        <Badge tone="muted">
                          <EyeOff className="w-3 h-3" aria-hidden="true" />
                          Masqué
                        </Badge>
                      )}
                      {category && (
                        <Badge>
                          <Tag className="w-3 h-3" aria-hidden="true" />
                          {category.name}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate">
                      {link.subtitle ? `${link.subtitle} · ` : ''}
                      {hostnameOf(link.url)}
                    </p>
                  </div>

                  <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-400" title="Nombre de clics">
                    <BarChart3 className="w-3.5 h-3.5" aria-hidden="true" />
                    {link.clickCount}
                  </span>

                  <Toggle
                    checked={link.isActive}
                    onChange={() => handleToggle(link)}
                    label={link.isActive ? `Masquer ${title || ''}` : `Activer ${title || ''}`}
                    busy={savingToggleId === link.id}
                  />

                  <DropdownMenu
                    label="Actions du lien"
                    trigger={<MoreVertical className="w-4 h-4" aria-hidden="true" />}
                    items={[
                      {
                        label: 'Modifier',
                        icon: <Pencil className="w-4 h-4" aria-hidden="true" />,
                        onClick: () => openEdit(link),
                      },
                      {
                        label: 'Ouvrir le lien',
                        icon: <ExternalLink className="w-4 h-4" aria-hidden="true" />,
                        onClick: () => window.open(link.url, '_blank', 'noopener,noreferrer'),
                      },
                      {
                        label: 'Monter',
                        icon: <ArrowUp className="w-4 h-4" aria-hidden="true" />,
                        disabled: index === 0,
                        onClick: () => moveLink(index, -1),
                      },
                      {
                        label: 'Descendre',
                        icon: <ArrowDown className="w-4 h-4" aria-hidden="true" />,
                        disabled: index === links.length - 1,
                        onClick: () => moveLink(index, 1),
                      },
                      {
                        label: 'Supprimer',
                        icon: <Trash2 className="w-4 h-4" aria-hidden="true" />,
                        danger: true,
                        onClick: () => setConfirmDelete(link),
                      },
                    ]}
                  />
                </div>
              );
            })}

            {links.length === 0 && (
              <EmptyState
                icon={<Link2 className="w-7 h-7" aria-hidden="true" />}
                title="Aucun lien pour le moment"
                description="Ajoutez votre premier lien pour commencer à partager vos réseaux, votre site ou tout autre contenu."
                action={
                  <Button onClick={openCreate}>
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    Ajouter votre premier lien
                  </Button>
                }
              />
            )}
          </div>

          {/* Desktop preview */}
          {profile && (
            <div className="hidden lg:block sticky top-24">
              <PhonePreview profile={profile} links={links} categories={categories} />
            </div>
          )}
        </div>
      )}

      {/* Create/Edit drawer */}
      <Drawer
        open={drawerOpen}
        onClose={requestClose}
        title={editingLink ? 'Modifier le lien' : 'Nouveau lien'}
        description={STEP_DESCRIPTIONS[STEPS[step].key]}
        footer={
          <StepperFooter
            current={step}
            isLast={isLastStep}
            canGoNext={canGoNext}
            onBack={handleBack}
            onNext={handleNext}
            onSubmit={handleSubmit}
            submitLabel={editingLink ? 'Enregistrer' : 'Créer le lien'}
            saving={saving}
            onCancel={requestClose}
            cancelDisabled={saving}
          />
        }
      >
        {serverError && (
          <div
            className="mb-4 p-3 rounded-[var(--radius-md)] bg-red-500/10 border border-red-500/25 flex items-start gap-2 text-sm text-red-300"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            {serverError}
          </div>
        )}

        <StepperIndicator steps={STEPS} current={step} onStepClick={setStep} />

        {step === 0 && (
          <PlatformPicker value={form.platform} onSelect={handlePlatformSelect} />
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="flex gap-2">
              {[
                { key: 'handle', label: 'Pseudo / handle' },
                { key: 'url', label: 'Lien personnalisé' },
              ].map((mode) => (
                <button
                  key={mode.key}
                  type="button"
                  onClick={() => setForm({ ...form, linkMode: mode.key })}
                  aria-pressed={form.linkMode === mode.key}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    form.linkMode === mode.key
                      ? 'bg-gradient-to-b from-violet-500 to-violet-600 text-white shadow-lg shadow-violet-900/40'
                      : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {form.linkMode === 'handle' ? (
              <>
                {!form.platform && (
                  <div className="flex items-center justify-between gap-3 glass-subtle rounded-[var(--radius-md)] px-4 py-3">
                    <p className="text-sm text-slate-300">
                      Le mode « pseudo » nécessite une plateforme.
                    </p>
                    <Button variant="secondary" size="sm" onClick={() => setStep(0)}>
                      Choisir une plateforme
                    </Button>
                  </div>
                )}
                <Field
                  label="Pseudo / handle"
                  htmlFor="handle"
                  error={stepErrors.handle}
                  helper="Sans le @, il sera ajouté automatiquement."
                  required
                >
                  <div className="relative">
                    <AtSign
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
                      aria-hidden="true"
                    />
                    <input
                      id="handle"
                      type="text"
                      placeholder="ex : louise"
                      value={form.handle}
                      onChange={(e) => handleHandleChange(e.target.value)}
                      className={`${inputCls({ invalid: Boolean(stepErrors.handle) })} pl-10`}
                    />
                  </div>
                </Field>

                {form.platform && generatedUrl && (
                  <div className="flex items-center gap-3 glass-subtle rounded-[var(--radius-md)] px-4 py-3">
                    <LinkIcon className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500">Lien généré</p>
                      <p className="text-sm text-slate-300 truncate">{generatedUrl}</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <TextInput
                id="link-url"
                label="URL"
                type="text"
                inputMode="url"
                autoCapitalize="off"
                spellCheck={false}
                placeholder="https://..."
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                error={stepErrors.url}
                helper="L’URL doit commencer par http:// ou https://."
                required
              />
            )}
          </div>
        )}

        {step === 2 && (
          <TextInput
            id="link-title"
            label="Titre"
            placeholder="Ex : Mon site web"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            error={stepErrors.title}
            helper="Pré-rempli avec la plateforme, modifiable librement."
            required
          />
        )}

        {step === 3 && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setForm({ ...form, categoryId: '' })}
              aria-pressed={form.categoryId === ''}
              className={`w-full text-left rounded-[var(--radius-md)] border px-4 py-3 transition-all duration-150 ${
                form.categoryId === ''
                  ? 'border-violet-400 ring-2 ring-violet-400/30 bg-violet-500/10'
                  : 'border-white/10 hover:border-white/25 hover:bg-white/5'
              }`}
            >
              <span className="block text-sm font-semibold text-white">Aucune catégorie</span>
              <span className="block text-xs text-slate-400 mt-0.5">
                Le lien s'affichera en haut de la page, hors sections.
              </span>
            </button>

            {categories.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                  Catégories existantes
                </p>
                <div className="space-y-2">
                  {categories.map((category) => {
                    const selected = form.categoryId === String(category.id);
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setForm({ ...form, categoryId: String(category.id) })}
                        aria-pressed={selected}
                        className={`w-full text-left rounded-[var(--radius-md)] border px-4 py-3 transition-all duration-150 ${
                          selected
                            ? 'border-violet-400 ring-2 ring-violet-400/30 bg-violet-500/10'
                            : 'border-white/10 hover:border-white/25 hover:bg-white/5'
                        }`}
                      >
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                          <Tag className="w-4 h-4 text-slate-300 shrink-0" aria-hidden="true" />
                          <span className="truncate">{category.name}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pt-1 border-t border-white/10">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                Ou créer une catégorie
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Nom de la catégorie"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateCategory(newCategoryName, { select: true });
                  }}
                  className={inputCls()}
                />
                <Button
                  size="sm"
                  onClick={() => handleCreateCategory(newCategoryName, { select: true })}
                  loading={categoryBusy}
                  disabled={!newCategoryName.trim()}
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  Créer
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <TextInput
            id="link-subtitle"
            label="Sous-titre"
            placeholder="Ex : @louise"
            value={form.subtitle}
            onChange={(e) => {
              setSubtitleAuto(false);
              setForm({ ...form, subtitle: e.target.value });
            }}
            helper="Pré-rempli avec le pseudo, modifiable ou vide."
          />
        )}

        {step === 5 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 glass-subtle rounded-[var(--radius-md)] px-4 py-3">
              {form.iconUrl ? (
                <img src={form.iconUrl} alt="" className="w-9 h-9 rounded-lg object-contain shrink-0" />
              ) : (
                <ChosenIcon className="w-5 h-5 text-slate-200 shrink-0" aria-hidden="true" />
              )}
              <span className="text-sm text-slate-300 truncate">
                {form.iconUrl
                  ? 'Icône personnalisée'
                  : ICONS[form.iconName]?.label || 'Icône par défaut'}
              </span>
              {(form.iconName || form.iconUrl) && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, iconName: '', iconUrl: '' })}
                  className="ml-auto text-xs text-slate-400 hover:text-white transition-colors shrink-0"
                >
                  Réinitialiser
                </button>
              )}
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                Choisir une icône
              </p>
              <IconPicker
                value={form.iconName}
                onSelect={(iconName) => setForm({ ...form, iconName, iconUrl: '' })}
                onClear={() => setForm({ ...form, iconName: '' })}
              />
            </div>

            <div className="pt-1 border-t border-white/10">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                Ou importer une image / un GIF
              </p>
              <ImageUpload
                value={form.iconUrl}
                onChange={(iconUrl) => setForm({ ...form, iconUrl, iconName: '' })}
                previewClassName="w-9 h-9 rounded-lg"
                uploadDir="icons"
              />
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-3">
            {[
              {
                key: 'icon',
                title: 'Icône seule',
                description: 'Sous la bio, en ligne avec les autres icônes, sans titre ni sous-titre.',
                preview: (
                  <span className="flex items-center gap-2" aria-hidden="true">
                    <span className="w-9 h-9 rounded-xl border border-white/15 bg-white/10 flex items-center justify-center">
                      <ChosenIcon className="w-4 h-4" />
                    </span>
                    <span className="w-9 h-9 rounded-xl border border-white/15 bg-white/10 flex items-center justify-center">
                      <LinkIcon className="w-4 h-4 text-slate-300" />
                    </span>
                    <span className="w-9 h-9 rounded-xl border border-white/15 bg-white/10 flex items-center justify-center">
                      <GlobeIcon className="w-4 h-4 text-slate-300" />
                    </span>
                  </span>
                ),
              },
              {
                key: 'card',
                title: 'Carte',
                description: 'Avec l’icône, le titre et le sous-titre, comme actuellement.',
                preview: (
                  <span className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 p-2" aria-hidden="true">
                    <span className="w-8 h-8 rounded-lg border border-white/15 bg-white/10 flex items-center justify-center">
                      <ChosenIcon className="w-4 h-4" />
                    </span>
                    <span className="flex-1 space-y-1">
                      <span className="block h-2 w-3/4 rounded bg-white/25" />
                      <span className="block h-1.5 w-1/2 rounded bg-white/15" />
                    </span>
                  </span>
                ),
              },
            ].map((option) => {
              const selected = form.displayStyle === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setForm({ ...form, displayStyle: option.key })}
                  aria-pressed={selected}
                  className={`w-full text-left rounded-[var(--radius-md)] border p-4 transition-all duration-150 ${
                    selected
                      ? 'border-violet-400 ring-2 ring-violet-400/30 bg-violet-500/10'
                      : 'border-white/10 hover:border-white/25 hover:bg-white/5'
                  }`}
                >
                  <span className="block mb-3">{option.preview}</span>
                  <span className="block text-sm font-semibold text-white">{option.title}</span>
                  <span className="block text-xs text-slate-400 mt-0.5">{option.description}</span>
                </button>
              );
            })}
          </div>
        )}
      </Drawer>

      {/* Mobile preview drawer */}
      <Drawer
        open={previewOpen && Boolean(profile)}
        onClose={() => setPreviewOpen(false)}
        title="Aperçu public"
        description="Valeurs enregistrées"
      >
        <PhonePreview profile={profile} links={links} categories={categories} />
      </Drawer>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={Boolean(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleDeleteConfirm}
        busy={deleting}
        title="Supprimer ce lien ?"
        message={`« ${confirmDelete ? (confirmDelete.title || confirmDelete.displayName || '@' + confirmDelete.handle || 'Lien') : ''} » sera définitivement supprimé de votre page publique. Cette action est irréversible.`}
        confirmLabel="Supprimer"
      />

      {/* Unsaved changes confirmation */}
      <ConfirmDialog
        open={discardDialog}
        onCancel={() => setDiscardDialog(false)}
        onConfirm={() => {
          setDiscardDialog(false);
          resetForm();
        }}
        title="Abandonner les modifications ?"
        message="Vous avez des modifications non enregistrées. Elles seront perdues si vous fermez cet éditeur."
        confirmLabel="Abandonner"
        cancelLabel="Continuer l’édition"
      />

      {/* Delete category confirmation */}
      <ConfirmDialog
        open={Boolean(confirmDeleteCategory)}
        onCancel={() => setConfirmDeleteCategory(null)}
        onConfirm={handleDeleteCategoryConfirm}
        busy={categoryBusy}
        title="Supprimer cette catégorie ?"
        message={`« ${confirmDeleteCategory ? confirmDeleteCategory.name : ''} » sera supprimée. Les liens qu'elle contient seront conservés et affichés sans catégorie.`}
        confirmLabel="Supprimer"
      />
    </div>
  );
}
