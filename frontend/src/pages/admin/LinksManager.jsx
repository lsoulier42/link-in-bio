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
  { key: 'platform', label: 'Platform' },
  { key: 'link', label: 'Link' },
  { key: 'title', label: 'Title' },
  { key: 'category', label: 'Category' },
  { key: 'subtitle', label: 'Subtitle' },
  { key: 'icon', label: 'Icon' },
  { key: 'display', label: 'Display' },
];

const STEP_DESCRIPTIONS = {
  platform: 'Choose a platform (optional) or create a free link.',
  link: 'Generate the link from a handle or enter a custom URL.',
  title: 'Give your link a title.',
  category: 'Put this link in a category (optional).',
  subtitle: 'Add a subtitle (optional).',
  icon: 'Choose an existing icon or import your own.',
  display: 'Choose how this link appears on your page.',
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
          if (!form.platform) errors.platform = 'Choose a platform to generate the link';
          if (!form.handle.trim()) errors.handle = 'The handle is required';
          else if (!generatedUrl) errors.handle = 'Invalid handle for this platform';
        } else {
          if (!form.url.trim()) errors.url = 'The URL is required';
          else if (!isValidHttpUrl(form.url.trim())) {
            errors.url = 'Enter a valid URL (http:// or https://)';
          }
        }
        break;
      case 2:
        if (!form.title.trim()) errors.title = 'The title is required';
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
        toast('Link updated');
      } else {
        await api.createLink(profileId, payload);
        toast('Link created');
      }
      resetForm();
      fetchLinks();
    } catch (err) {
      setServerError(err.message || 'Error while saving');
      toast(editingLink ? 'Error while updating' : 'Error while creating', 'error');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const handleToggle = async (link) => {
    setSavingToggleId(link.id);
    try {
      await api.updateLink(profileId, link.id, { isActive: !link.isActive });
      toast(link.isActive ? 'Link hidden' : 'Link activated');
      fetchLinks();
    } catch {
      toast('Error while updating', 'error');
    } finally {
      setSavingToggleId(null);
    }
  };

  const persistOrder = async (ordered) => {
    try {
      await api.reorderLinks(profileId, ordered.map((l) => l.id));
      toast('Order saved');
    } catch {
      toast('Unable to save the order', 'error');
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
      toast('Link deleted');
      setConfirmDelete(null);
      fetchLinks();
    } catch {
      toast('Error while deleting', 'error');
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
      toast('Category created');
      fetchCategories();
      if (select) setForm((prev) => ({ ...prev, categoryId: String(created.id) }));
      setNewCategoryName('');
      setCreatingCategory(false);
      return created;
    } catch (err) {
      toast(err.message || 'Error while creating the category', 'error');
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
      toast('Category renamed');
      fetchCategories();
    } catch (err) {
      toast(err.message || 'Error while renaming', 'error');
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
      toast('Category deleted');
      setConfirmDeleteCategory(null);
      fetchCategories();
      fetchLinks();
    } catch (err) {
      toast(err.message || 'Error while deleting', 'error');
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
        toast('Unable to save the order', 'error');
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
        Back to dashboard
      </RouterLink>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Manage links</h1>
          <p className="mt-1 text-sm text-slate-400">
            {profile ? (
              <>
                Public page: <span className="text-slate-300">/{profile.slug}</span>
              </>
            ) : (
              'Reorder, toggle or edit your links.'
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
                  View public page
                </Button>
              </a>
              <Button
                variant="secondary"
                className="sm:hidden"
                onClick={() => setPreviewOpen(true)}
              >
                <Smartphone className="w-4 h-4" aria-hidden="true" />
                Preview
              </Button>
            </>
          )}
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4" aria-hidden="true" />
            Add a link
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
                    Categories
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Optional — group your links to display them as sections.
                  </p>
                </div>
                {!creatingCategory && (
                  <Button variant="secondary" size="sm" onClick={() => { setCreatingCategory(true); setNewCategoryName(''); }}>
                    <FolderPlus className="w-4 h-4" aria-hidden="true" />
                    New
                  </Button>
                )}
              </div>

              {creatingCategory && (
                <div className="flex items-center gap-2 mb-3">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Category name (e.g. Social media)"
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
                    Create
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setCreatingCategory(false)} disabled={categoryBusy}>
                    <X className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </div>
              )}

              {categories.length === 0 && !creatingCategory ? (
                <p className="text-xs text-slate-500">
                  No categories yet. Links without a category appear at the top of the page.
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
                            aria-label="Confirm rename"
                          >
                            <Check className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-sm text-slate-200">{category.name}</span>
                          <span className="text-[11px] text-slate-500" title="Number of links">
                            {category.linkCount}
                          </span>
                          <button
                            type="button"
                            onClick={() => { setEditingCategoryId(category.id); setEditCategoryName(category.name); }}
                            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                            aria-label={`Rename ${category.name}`}
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
                        aria-label={`Move ${category.name} up`}
                      >
                        <ArrowUp className="w-3 h-3" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveCategory(index, 1)}
                        disabled={index === categories.length - 1}
                        className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                        aria-label={`Move ${category.name} down`}
                      >
                        <ArrowDown className="w-3 h-3" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteCategory(category)}
                        className="p-1 rounded-full text-slate-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                        aria-label={`Delete ${category.name}`}
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
                    aria-label={`Reorder the link ${title || ''}`}
                    title="Drag to reorder"
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
                        {title || 'Link'}
                      </p>
                      {!link.isActive && (
                        <Badge tone="muted">
                          <EyeOff className="w-3 h-3" aria-hidden="true" />
                          Hidden
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

                  <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-400" title="Click count">
                    <BarChart3 className="w-3.5 h-3.5" aria-hidden="true" />
                    {link.clickCount}
                  </span>

                  <Toggle
                    checked={link.isActive}
                    onChange={() => handleToggle(link)}
                    label={link.isActive ? `Hide ${title || ''}` : `Show ${title || ''}`}
                    busy={savingToggleId === link.id}
                  />

                  <DropdownMenu
                    label="Link actions"
                    trigger={<MoreVertical className="w-4 h-4" aria-hidden="true" />}
                    items={[
                      {
                        label: 'Edit',
                        icon: <Pencil className="w-4 h-4" aria-hidden="true" />,
                        onClick: () => openEdit(link),
                      },
                      {
                        label: 'Open link',
                        icon: <ExternalLink className="w-4 h-4" aria-hidden="true" />,
                        onClick: () => window.open(link.url, '_blank', 'noopener,noreferrer'),
                      },
                      {
                        label: 'Move up',
                        icon: <ArrowUp className="w-4 h-4" aria-hidden="true" />,
                        disabled: index === 0,
                        onClick: () => moveLink(index, -1),
                      },
                      {
                        label: 'Move down',
                        icon: <ArrowDown className="w-4 h-4" aria-hidden="true" />,
                        disabled: index === links.length - 1,
                        onClick: () => moveLink(index, 1),
                      },
                      {
                        label: 'Delete',
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
                title="No links yet"
                description="Add your first link to start sharing your social networks, your website or anything else."
                action={
                  <Button onClick={openCreate}>
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    Add your first link
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
        title={editingLink ? 'Edit link' : 'New link'}
        description={STEP_DESCRIPTIONS[STEPS[step].key]}
        footer={
          <StepperFooter
            current={step}
            isLast={isLastStep}
            canGoNext={canGoNext}
            onBack={handleBack}
            onNext={handleNext}
            onSubmit={handleSubmit}
            submitLabel={editingLink ? 'Save' : 'Create link'}
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
                { key: 'handle', label: 'Handle' },
                { key: 'url', label: 'Custom URL' },
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
                      Handle mode requires a platform.
                    </p>
                    <Button variant="secondary" size="sm" onClick={() => setStep(0)}>
                      Choose a platform
                    </Button>
                  </div>
                )}
                <Field
                  label="Handle"
                  htmlFor="handle"
                  error={stepErrors.handle}
                  helper="Without the @, it will be added automatically."
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
                      placeholder="ex : alice"
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
                      <p className="text-xs text-slate-500">Generated link</p>
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
                helper="The URL must start with http:// or https://."
                required
              />
            )}
          </div>
        )}

        {step === 2 && (
          <TextInput
            id="link-title"
            label="Titre"
            placeholder="Ex: My website"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            error={stepErrors.title}
            helper="Pre-filled with the platform, freely editable."
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
              <span className="block text-sm font-semibold text-white">No category</span>
              <span className="block text-xs text-slate-400 mt-0.5">
                The link will appear at the top of the page, outside sections.
              </span>
            </button>

            {categories.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                  Existing categories
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
                Or create a category
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Category name"
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
                  Create
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <TextInput
            id="link-subtitle"
            label="Subtitle"
            placeholder="Ex: @alice"
            value={form.subtitle}
            onChange={(e) => {
              setSubtitleAuto(false);
              setForm({ ...form, subtitle: e.target.value });
            }}
            helper="Pre-filled with the handle, editable or empty."
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
                  ? 'Custom icon'
                  : ICONS[form.iconName]?.label || 'Default icon'}
              </span>
              {(form.iconName || form.iconUrl) && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, iconName: '', iconUrl: '' })}
                  className="ml-auto text-xs text-slate-400 hover:text-white transition-colors shrink-0"
                >
                  Reset
                </button>
              )}
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                Choose an icon
              </p>
              <IconPicker
                value={form.iconName}
                onSelect={(iconName) => setForm({ ...form, iconName, iconUrl: '' })}
                onClear={() => setForm({ ...form, iconName: '' })}
              />
            </div>

            <div className="pt-1 border-t border-white/10">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                Or import an image / GIF
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
                title: 'Icon only',
                description: 'Below the bio, inline with the other icons, without title or subtitle.',
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
                title: 'Card',
                description: 'With the icon, title and subtitle, as currently displayed.',
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
        title="Public preview"
        description="Saved values"
      >
        <PhonePreview profile={profile} links={links} categories={categories} />
      </Drawer>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={Boolean(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleDeleteConfirm}
        busy={deleting}
        title="Delete this link?"
        message={`"${confirmDelete ? (confirmDelete.title || confirmDelete.displayName || '@' + confirmDelete.handle || 'Link') : ''}" will be permanently removed from your public page. This action cannot be undone.`}
        confirmLabel="Delete"
      />

      {/* Unsaved changes confirmation */}
      <ConfirmDialog
        open={discardDialog}
        onCancel={() => setDiscardDialog(false)}
        onConfirm={() => {
          setDiscardDialog(false);
          resetForm();
        }}
        title="Discard changes?"
        message="You have unsaved changes. They will be lost if you close this editor."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
      />

      {/* Delete category confirmation */}
      <ConfirmDialog
        open={Boolean(confirmDeleteCategory)}
        onCancel={() => setConfirmDeleteCategory(null)}
        onConfirm={handleDeleteCategoryConfirm}
        busy={categoryBusy}
        title="Delete this category?"
        message={`"${confirmDeleteCategory ? confirmDeleteCategory.name : ''}" will be deleted. The links it contains will be kept and displayed without a category.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
