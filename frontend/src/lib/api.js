const API_BASE = '/api';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const isFormData = options.body instanceof FormData;
  const config = {
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  };

  const response = await fetch(url, config);

  if (response.status === 401) {
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  // Public
  getProfiles: () => request('/public'),
  getProfile: (slug) => request(`/public/${slug}`),
  trackClick: (slug, linkId) => request(`/public/${slug}/click/${linkId}`, { method: 'POST' }),
  getThemes: () => request('/themes'),
  getSocialNetworks: () => request('/social-networks'),

  // Auth
  login: (email, password) => request('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  logout: () => request('/logout'),
  me: () => request('/me'),

  // Admin profiles
  getMyProfiles: () => request('/admin/profiles'),
  updateProfile: (id, data) => request(`/admin/profiles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Uploads
  uploadImage: (file, dir = 'avatars') => {
    const formData = new FormData();
    formData.append('file', file);
    return request(`/uploads?type=${encodeURIComponent(dir)}`, {
      method: 'POST',
      body: formData,
    });
  },

  // Admin links
  getLinks: (profileId) => request(`/admin/profiles/${profileId}/links`),
  createLink: (profileId, data) => request(`/admin/profiles/${profileId}/links`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateLink: (profileId, linkId, data) => request(`/admin/profiles/${profileId}/links/${linkId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteLink: (profileId, linkId) => request(`/admin/profiles/${profileId}/links/${linkId}`, {
    method: 'DELETE',
  }),
  reorderLinks: (profileId, ids) => request(`/admin/profiles/${profileId}/links/reorder`, {
    method: 'PUT',
    body: JSON.stringify({ ids }),
  }),

  // Admin categories
  getCategories: (profileId) => request(`/admin/profiles/${profileId}/categories`),
  createCategory: (profileId, data) => request(`/admin/profiles/${profileId}/categories`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateCategory: (profileId, categoryId, data) => request(`/admin/profiles/${profileId}/categories/${categoryId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteCategory: (profileId, categoryId) => request(`/admin/profiles/${profileId}/categories/${categoryId}`, {
    method: 'DELETE',
  }),
  reorderCategories: (profileId, ids) => request(`/admin/profiles/${profileId}/categories/reorder`, {
    method: 'PUT',
    body: JSON.stringify({ ids }),
  }),

  // Admin users
  getUsers: () => request('/admin/users'),
  getUser: (id) => request(`/admin/users/${id}`),
  createUser: (data) => request('/admin/users', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateUser: (id, data) => request(`/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteUser: (id) => request(`/admin/users/${id}`, {
    method: 'DELETE',
  }),
};
