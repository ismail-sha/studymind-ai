// ─────────────────────────────────────────────────────────────
//  Auth API — talks to the Express backend
// ─────────────────────────────────────────────────────────────

const BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

// ── Auth ──────────────────────────────────────────────────────
export const signup = (name, email, password) =>
  request('/api/auth/signup', {
    method: 'POST',
    body:   JSON.stringify({ name, email, password }),
  });

export const login = (email, password) =>
  request('/api/auth/login', {
    method: 'POST',
    body:   JSON.stringify({ email, password }),
  });

export const getMe = (token) =>
  request('/api/auth/me', { headers: authHeader(token) });

// ── Admin ─────────────────────────────────────────────────────
export const getAdminStats = (token) =>
  request('/api/admin/stats', { headers: authHeader(token) });

export const getAdminUsers = (token) =>
  request('/api/admin/users', { headers: authHeader(token) });

export const deleteUser = (token, id) =>
  request(`/api/admin/users/${id}`, {
    method:  'DELETE',
    headers: authHeader(token),
  });

export const updateUserRole = (token, id, role) =>
  request(`/api/admin/users/${id}/role`, {
    method:  'PATCH',
    headers: authHeader(token),
    body:    JSON.stringify({ role }),
  });
