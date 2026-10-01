const BASE_URL = 'http://localhost:8000';
const TOKEN_KEY = 'mk_token';

const Api = {
  _token: null,

  getToken() {
    if (!this._token) this._token = localStorage.getItem(TOKEN_KEY);
    return this._token;
  },

  setToken(t) {
    this._token = t;
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  },

  async request(method, path, body = null) {
    const headers = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${BASE_URL}${path}`, opts);
    if (res.status === 204) return null;
    const data = await res.json();
    if (!res.ok) throw { status: res.status, detail: data.detail || 'Request failed' };
    return data;
  },

  get(path)          { return this.request('GET', path); },
  post(path, body)   { return this.request('POST', path, body); },
  put(path, body)    { return this.request('PUT', path, body); },
  del(path)          { return this.request('DELETE', path); },

  async loginForm(email, password) {
    const body = new URLSearchParams({ username: email, password });
    const res = await fetch(`${BASE_URL}/api/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const data = await res.json();
    if (!res.ok) throw { status: res.status, detail: data.detail || 'Login failed' };
    return data;
  },

  async ensureSession() {
    if (this.getToken()) {
      try {
        return await this.get('/api/auth/me');
      } catch (_) {
        this.setToken(null);
      }
    }
    const res = await this.loginForm('demo@mergekit.dev', 'demo1234');
    this.setToken(res.access_token);
    return await this.get('/api/auth/me');
  },
};
