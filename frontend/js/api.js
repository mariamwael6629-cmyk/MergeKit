// Central API client for MergeKit. Talks to the FastAPI backend.
const API_BASE_URL = window.MERGEKIT_API_BASE_URL || 'http://localhost:8000/api';
const TOKEN_KEY = 'mergekit_token';

const Api = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  async request(path, options = {}) {
    const headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}${path}`, Object.assign({}, options, { headers }));

    if (!res.ok) {
      let detail = res.statusText;
      try {
        const body = await res.json();
        detail = body.detail || JSON.stringify(body);
      } catch (e) { /* no json body */ }
      const err = new Error(detail);
      err.status = res.status;
      throw err;
    }
    if (res.status === 204) return null;
    return res.json();
  },

  get(path) { return this.request(path, { method: 'GET' }); },
  post(path, data) { return this.request(path, { method: 'POST', body: JSON.stringify(data) }); },
  put(path, data) { return this.request(path, { method: 'PUT', body: JSON.stringify(data) }); },
  del(path) { return this.request(path, { method: 'DELETE' }); },

  // Demo auth: logs in as the seeded demo user so the dashboard has data
  // without requiring a manual login screen.
  async ensureSession() {
    if (this.getToken()) {
      try {
        await this.get('/auth/me');
        return;
      } catch (e) {
        this.clearToken();
      }
    }
    const form = new URLSearchParams();
    form.set('username', 'demo@mergekit.dev');
    form.set('password', 'demo1234');
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString()
    });
    if (!res.ok) throw new Error('Unable to start demo session');
    const data = await res.json();
    this.setToken(data.access_token);
  }
};
