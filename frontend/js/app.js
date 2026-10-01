/* ── State ── */
const state = {
  user: null,
  dashboard: null,
  prs: null,
  repos: null,
  community: null,
  analytics: null,
  prFilter: { tag: null, status: null },
  repoFilter: { gfi: null, difficulty: null },
};

/* ── Language colors ── */
const LANG_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5',
  Rust: '#dea584', Go: '#00ADD8', Java: '#b07219',
  'C++': '#f34b7d', C: '#555555', Ruby: '#701516',
  Swift: '#ffac45', Kotlin: '#A97BFF', CSS: '#563d7c',
};

/* ── Toast ── */
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `show ${type}`;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = ''; }, 3000);
}

/* ── Tab switching ── */
function switchTab(name) {
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.tab === name);
  });
  document.querySelectorAll('.tab-panel').forEach(el => {
    el.classList.toggle('active', el.id === `tab-${name}`);
  });
  const titles = {
    dashboard: 'Dashboard', prs: 'Pull Requests',
    discover: 'Discover Repos', community: 'Community', analytics: 'Analytics',
  };
  document.getElementById('page-title').textContent = titles[name] || name;
  loadTab(name);
}

/* ── Lazy load per tab ── */
async function loadTab(name) {
  if (name === 'dashboard'  && !state.dashboard)  await loadDashboard();
  if (name === 'prs'        && !state.prs)         await loadPRs();
  if (name === 'discover'   && !state.repos)        await loadRepos();
  if (name === 'community'  && !state.community)    await loadCommunity();
  if (name === 'analytics'  && !state.analytics)    await loadAnalytics();
}

/* ══════════════════════════════════════════
   DASHBOARD
══════════════════════════════════════════ */
async function loadDashboard() {
  try {
    state.dashboard = await Api.get('/api/dashboard');
    renderDashboard();
  } catch (e) {
    document.getElementById('tab-dashboard').innerHTML = `<div class="empty-state">Could not load dashboard. Is the backend running?</div>`;
  }
}

function renderDashboard() {
  const d = state.dashboard;
  const u = state.user;

  // Stats
  document.getElementById('stat-contributions').textContent = (u?.contributions_count || d.total_contributions).toLocaleString();
  document.getElementById('stat-merged').textContent = d.merged_prs;
  document.getElementById('stat-score').textContent = u ? u.score.toLocaleString() : d.score.toLocaleString();
  document.getElementById('stat-streak').textContent = u ? u.streak : d.streak;

  // Heatmap
  renderHeatmap(d.heatmap);

  // Challenges
  renderChallenges(d.challenges);

  // Streak panel
  if (u) {
    document.getElementById('streak-num').textContent = u.streak;
  }

  // PRs preview (load if not already loaded)
  if (!state.prs) {
    Api.get('/api/pull-requests?limit=5').then(data => {
      state.prs = data;
      renderPRPreview(data.items.slice(0, 5));
    }).catch(() => {});
  } else {
    renderPRPreview(state.prs.items.slice(0, 5));
  }

  // Leaderboard
  Api.get('/api/community/leaderboard').then(data => {
    renderLeaderboard(data, 'dash-leaderboard');
  }).catch(() => {});
}

/* ── Heatmap ── */
function renderHeatmap(days) {
  const root = document.getElementById('heatmap-grid');
  if (!root) return;
  const map = {};
  (days || []).forEach(d => { map[d.date] = d.count; });
  const max = Math.max(...Object.values(map), 1);

  root.innerHTML = '';
  const today = new Date();
  for (let w = 51; w >= 0; w--) {
    const col = document.createElement('div');
    col.className = 'hm-col';
    for (let d = 6; d >= 0; d--) {
      const date = new Date(today);
      date.setDate(today.getDate() - (w * 7 + d));
      const key = date.toISOString().split('T')[0];
      const count = map[key] || 0;
      const cell = document.createElement('div');
      cell.className = 'hm-cell';
      const pct = count / max;
      cell.style.background = pct === 0 ? 'var(--border)' :
        pct < 0.25 ? '#1E4033' : pct < 0.5 ? '#276B50' : pct < 0.75 ? '#339966' : 'var(--green)';
      cell.title = `${key}: ${count}`;
      col.appendChild(cell);
    }
    root.appendChild(col);
  }
}

/* ── PR preview ── */
function renderPRPreview(prs) {
  const root = document.getElementById('pr-preview-list');
  if (!root) return;
  root.innerHTML = '';
  (prs || []).forEach(pr => {
    const daysAgo = Math.floor((Date.now() - new Date(pr.created_at)) / 86400000);
    const timeStr = daysAgo === 0 ? 'today' : `${daysAgo}d ago`;
    root.innerHTML += `
      <div class="pr-item">
        <div class="pr-dot ${pr.status}"></div>
        <div class="pr-body">
          <div class="pr-repo">${escapeHtml(pr.repo)}</div>
          <div class="pr-title">${escapeHtml(pr.title)}</div>
          <div class="pr-meta">${pr.status === 'merged' ? 'merged' : 'opened'} ${timeStr} · +${pr.additions} −${pr.deletions}</div>
        </div>
        <div class="pr-badge ${pr.status}">${pr.status}</div>
      </div>`;
  });
  if (!prs || prs.length === 0) root.innerHTML = '<div class="empty-state">No pull requests yet.</div>';
}

/* ── Challenges ── */
function renderChallenges(challenges) {
  const root = document.getElementById('challenges-list');
  if (!root) return;
  root.innerHTML = '';
  (challenges || []).forEach(c => {
    const pct = Math.round((c.current / c.target) * 100);
    root.innerHTML += `
      <div class="challenge-card">
        <div class="ch-top">
          <span class="ch-diff ${c.difficulty}">${c.difficulty}</span>
          <span class="ch-pts">+${c.points} pts</span>
        </div>
        <div class="ch-title">${escapeHtml(c.title)}</div>
        <div class="ch-progress"><div class="ch-bar" style="width:${pct}%"></div></div>
        <div class="ch-prog-text">${c.current} of ${c.target} completed</div>
      </div>`;
  });
}

/* ── Leaderboard ── */
function renderLeaderboard(entries, rootId) {
  const root = document.getElementById(rootId);
  if (!root) return;
  const maxScore = Math.max(...entries.map(e => e.score), 1);
  root.innerHTML = '';
  entries.forEach(e => {
    const pct = Math.round((e.score / maxScore) * 100);
    const isYou = state.user && e.user_id === state.user.id;
    const initials = e.name.split(' ').map(n => n[0]).join('').slice(0, 2);
    const colors = ['#47967A','#5880B0','#C08040','#A85050','#7B96AE','#47967A'];
    const color = colors[(e.rank - 1) % colors.length];
    root.innerHTML += `
      <div class="lb-item">
        <div class="lb-rank ${e.rank <= 3 ? 'top' : ''}">${e.rank}</div>
        <div class="lb-avatar" style="background:${color}">${initials}</div>
        <div class="lb-name">${escapeHtml(e.name)}${isYou ? '<span class="lb-you">YOU</span>' : ''}</div>
        <div class="lb-bar-wrap"><div class="lb-bar-fill" style="width:${pct}%"></div></div>
        <div class="lb-score">${e.score.toLocaleString()}</div>
      </div>`;
  });
}

/* ══════════════════════════════════════════
   PULL REQUESTS
══════════════════════════════════════════ */
async function loadPRs() {
  const { tag, status } = state.prFilter;
  const params = new URLSearchParams({ limit: '50' });
  if (tag)    params.set('tag', tag);
  if (status) params.set('status', status);
  try {
    state.prs = await Api.get(`/api/pull-requests?${params}`);
    renderPRs();
  } catch (e) {
    document.getElementById('pr-list').innerHTML = '<div class="empty-state">Could not load pull requests.</div>';
  }
}

function renderPRs() {
  const root = document.getElementById('pr-list');
  if (!root) return;
  const items = state.prs?.items || [];
  document.getElementById('pr-count').textContent = `${state.prs?.total || 0} total`;
  root.innerHTML = '';
  items.forEach(pr => {
    const daysAgo = Math.floor((Date.now() - new Date(pr.created_at)) / 86400000);
    const timeStr = daysAgo === 0 ? 'today' : `${daysAgo}d ago`;
    root.innerHTML += `
      <div class="pr-item">
        <div class="pr-dot ${pr.status}"></div>
        <div class="pr-body">
          <div class="pr-repo">${escapeHtml(pr.repo)}</div>
          <div class="pr-title">${escapeHtml(pr.title)}</div>
          <div class="pr-meta">${pr.status === 'merged' ? 'merged' : 'opened'} ${timeStr}
            ${pr.tag ? ` · <span style="color:var(--green-l)">${escapeHtml(pr.tag)}</span>` : ''}
            · +${pr.additions} −${pr.deletions}
          </div>
        </div>
        <div class="pr-badge ${pr.status}">${pr.status}</div>
      </div>`;
  });
  if (!items.length) root.innerHTML = '<div class="empty-state">No pull requests match this filter.</div>';
}

function setPRFilter(field, value) {
  if (state.prFilter[field] === value) state.prFilter[field] = null;
  else state.prFilter[field] = value;
  state.prs = null;
  updateFilterPills('pr-tag-filters',    'tag',    state.prFilter.tag);
  updateFilterPills('pr-status-filters', 'status', state.prFilter.status);
  loadPRs();
}

/* ══════════════════════════════════════════
   DISCOVER (REPOS)
══════════════════════════════════════════ */
async function loadRepos() {
  const { gfi, difficulty } = state.repoFilter;
  const params = new URLSearchParams();
  if (gfi !== null) params.set('good_first_issue', gfi);
  if (difficulty)   params.set('difficulty', difficulty);
  try {
    state.repos = await Api.get(`/api/repositories?${params}`);
    renderRepos();
  } catch (e) {
    document.getElementById('repo-grid').innerHTML = '<div class="empty-state">Could not load repositories.</div>';
  }
}

function renderRepos() {
  const root = document.getElementById('repo-grid');
  if (!root) return;
  const repos = state.repos || [];
  root.innerHTML = '';
  repos.forEach(r => {
    const langColor = LANG_COLORS[r.language] || '#7B96AE';
    const topics = r.topics ? r.topics.split(',').filter(Boolean) : [];
    root.innerHTML += `
      <div class="repo-card">
        <div class="repo-name">${escapeHtml(r.full_name)}</div>
        <div class="repo-desc">${escapeHtml(r.description)}</div>
        <div class="repo-meta">
          ${r.language ? `<span class="repo-stat"><span class="lang-dot" style="background:${langColor}"></span>${escapeHtml(r.language)}</span>` : ''}
          <span class="repo-stat">★ ${r.stars.toLocaleString()}</span>
          <span class="repo-stat">${r.open_issues.toLocaleString()} issues</span>
        </div>
        <div class="repo-tags">
          ${r.has_good_first_issue ? '<span class="repo-tag gfi">good first issue</span>' : ''}
          <span class="repo-tag diff-${r.difficulty}">${r.difficulty}</span>
          ${topics.slice(0,2).map(t => `<span class="repo-tag" style="background:var(--card2);color:var(--fg3)">${escapeHtml(t)}</span>`).join('')}
        </div>
      </div>`;
  });
  if (!repos.length) root.innerHTML = '<div class="empty-state">No repositories found.</div>';
}

function setRepoFilter(field, value) {
  if (field === 'gfi') {
    state.repoFilter.gfi = state.repoFilter.gfi === value ? null : value;
  } else {
    state.repoFilter[field] = state.repoFilter[field] === value ? null : value;
  }
  state.repos = null;
  loadRepos();
}

/* ══════════════════════════════════════════
   COMMUNITY
══════════════════════════════════════════ */
async function loadCommunity() {
  try {
    const [lb, feed] = await Promise.all([
      Api.get('/api/community/leaderboard'),
      Api.get('/api/community/feed'),
    ]);
    state.community = { leaderboard: lb, feed };
    renderCommunity();
  } catch (e) {
    document.getElementById('tab-community').innerHTML = '<div class="empty-state">Could not load community data.</div>';
  }
}

function renderCommunity() {
  renderLeaderboard(state.community.leaderboard, 'community-leaderboard');
  renderFeed(state.community.feed);
}

function renderFeed(items) {
  const root = document.getElementById('feed-list');
  if (!root) return;
  const colors = ['#47967A','#5880B0','#C08040','#A85050','#7B96AE'];
  root.innerHTML = '';
  (items || []).forEach((f, i) => {
    const initials = f.actor.split(' ').map(n => n[0]).join('').slice(0, 2);
    const color = colors[i % colors.length];
    root.innerHTML += `
      <div class="feed-item">
        <div class="feed-avatar" style="background:${color}">${initials}</div>
        <div class="feed-body">
          <span class="feed-actor">${escapeHtml(f.actor)}</span>
          <span class="feed-action"> ${escapeHtml(f.action)} </span>
          ${f.repo ? `<span class="feed-repo">${escapeHtml(f.repo)}</span>` : ''}
          <div class="feed-time">${f.time_ago}</div>
        </div>
      </div>`;
  });
  if (!items || !items.length) root.innerHTML = '<div class="empty-state">No activity yet.</div>';
}

/* ══════════════════════════════════════════
   ANALYTICS
══════════════════════════════════════════ */
async function loadAnalytics() {
  try {
    state.analytics = await Api.get('/api/analytics');
    renderAnalytics();
  } catch (e) {
    document.getElementById('tab-analytics').innerHTML = '<div class="empty-state">Could not load analytics.</div>';
  }
}

function renderAnalytics() {
  const d = state.analytics;
  document.getElementById('an-additions').textContent = d.total_additions.toLocaleString();
  document.getElementById('an-deletions').textContent = d.total_deletions.toLocaleString();
  document.getElementById('an-merge-rate').textContent = `${d.merge_rate}%`;

  // Monthly chart
  const monthlyCtx = document.getElementById('monthly-chart');
  if (monthlyCtx && window.Chart) {
    new Chart(monthlyCtx, {
      type: 'bar',
      data: {
        labels: d.monthly_contributions.map(m => m.month.slice(5)),
        datasets: [{ data: d.monthly_contributions.map(m => m.count), backgroundColor: '#47967A', borderRadius: 4 }],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: { x: { ticks: { color: '#435870' } }, y: { ticks: { color: '#435870' } } },
        responsive: true, maintainAspectRatio: false,
      },
    });
  }

  // Tag doughnut
  const tagCtx = document.getElementById('tag-chart');
  if (tagCtx && window.Chart) {
    const colors = ['#47967A','#5880B0','#C08040','#A85050','#7B96AE','#3D6B52'];
    new Chart(tagCtx, {
      type: 'doughnut',
      data: {
        labels: d.tag_breakdown.map(t => t.tag),
        datasets: [{ data: d.tag_breakdown.map(t => t.count), backgroundColor: colors }],
      },
      options: {
        plugins: { legend: { position: 'right', labels: { color: '#7B96AE', font: { size: 11 } } } },
        responsive: true, maintainAspectRatio: false,
      },
    });
  }
}

/* ── Helpers ── */
function updateFilterPills(containerId, field, activeValue) {
  document.querySelectorAll(`#${containerId} .filter-pill`).forEach(el => {
    el.classList.toggle('active', el.dataset[field] === activeValue);
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function setupConnectButton() {
  const btn = document.getElementById('connect-btn');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    try {
      const user = await Api.ensureSession();
      state.user = user;
      btn.textContent = `Connected as ${user.username}`;
      btn.classList.add('connected');
      showToast(`Logged in as ${user.name}`, 'success');
    } catch (e) {
      showToast('Connection failed', 'error');
    }
  });
}

/* ── Bootstrap ── */
document.addEventListener('DOMContentLoaded', async () => {
  // Nav click handlers
  document.querySelectorAll('.nav-item[data-tab]').forEach(el => {
    el.addEventListener('click', () => switchTab(el.dataset.tab));
  });

  // PR filter pills
  document.querySelectorAll('#pr-tag-filters .filter-pill').forEach(el => {
    el.addEventListener('click', () => setPRFilter('tag', el.dataset.tag));
  });
  document.querySelectorAll('#pr-status-filters .filter-pill').forEach(el => {
    el.addEventListener('click', () => setPRFilter('status', el.dataset.status));
  });

  // Repo filter pills
  document.querySelectorAll('#repo-filters .filter-pill').forEach(el => {
    el.addEventListener('click', () => {
      const { gfi, difficulty } = el.dataset;
      if (gfi !== undefined)       setRepoFilter('gfi', gfi === 'true');
      if (difficulty !== undefined) setRepoFilter('difficulty', difficulty);
    });
  });

  setupConnectButton();

  // Auto-login
  try {
    state.user = await Api.ensureSession();
    // Fill sidebar user
    const nameEl   = document.getElementById('sidebar-user-name');
    const handleEl = document.getElementById('sidebar-user-handle');
    if (nameEl)   nameEl.textContent   = state.user.name;
    if (handleEl) handleEl.textContent = `@${state.user.username}`;
    const avatarEl = document.getElementById('sidebar-avatar-initials');
    if (avatarEl) avatarEl.textContent = state.user.name.split(' ').map(n => n[0]).join('').slice(0, 2);
  } catch (_) {}

  // Load default tab
  switchTab('dashboard');
});
