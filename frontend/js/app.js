function switchTab(name) {
  document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));

  const targetSection = document.getElementById('tab-' + name);
  if (targetSection) targetSection.classList.add('active');

  const targetButton = document.querySelector(`.nav-tab[data-tab="${name}"]`);
  if (targetButton) targetButton.classList.add('active');

  if (name === 'analytics') loadAnalytics();
  if (name === 'prs' && !state.prsLoaded) loadPullRequests();
  if (name === 'discover' && !state.reposLoaded) loadRepositories();
  if (name === 'community' && !state.communityLoaded) loadCommunity();
}

const state = {
  prsLoaded: false,
  reposLoaded: false,
  communityLoaded: false,
  prFilters: { status: 'all', language: 'all', tag: 'all' },
  repoFilter: 'all',
  allPRs: [],
  allRepos: []
};

function showToast(message, isError = false) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = 'toast show' + (isError ? ' error' : '');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 3500);
}

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const LANG_COLORS = {
  TypeScript: '#3178c6', Python: '#3572a5', Go: '#00add8', Rust: '#dea584',
  JavaScript: '#f1e05a', Java: '#b07219', 'C++': '#f34b7d'
};

/* ---------- DASHBOARD ---------- */
async function loadDashboard() {
  try {
    const data = await Api.get('/dashboard');
    renderDashboard(data);
  } catch (e) {
    console.error('Failed to load dashboard', e);
    showToast('Could not load dashboard data', true);
  }
}

function renderDashboard(data) {
  const s = data.summary;
  document.getElementById('dash-sub').textContent =
    `Tracking contributions across ${s.repos_count} repositories · Updated just now`;

  document.getElementById('stat-total').textContent = s.total_contributions;
  document.getElementById('stat-total-delta').textContent = `+${s.total_contributions_delta} this month`;
  document.getElementById('stat-merged').textContent = s.merged_prs;
  document.getElementById('stat-merged-delta').textContent = `+${s.merged_prs_delta} this month`;
  document.getElementById('stat-open').textContent = s.open_prs;
  document.getElementById('stat-open-delta').textContent = `${s.open_prs_awaiting_review} awaiting review`;
  document.getElementById('stat-repos').textContent = s.repos_contributed;
  document.getElementById('stat-repos-delta').textContent = `+${s.repos_contributed_delta} this month`;
  document.getElementById('stat-streak').textContent = s.streak_days;
  document.getElementById('stat-score').textContent = s.community_score.toLocaleString();
  document.getElementById('stat-score-delta').textContent = s.community_percentile;
  document.getElementById('streak-title').textContent = `Current streak · ${s.streak_days} days`;
  document.getElementById('nav-streak').textContent = `${s.streak_days} streak`;
  document.getElementById('avatar-initials').textContent = s.initials;

  // impact ring
  const ring = data.impact;
  document.getElementById('ring-num').textContent = `${ring.score_pct}%`;
  const circle = document.getElementById('ring-progress');
  const circumference = 2 * Math.PI * 44;
  const filled = (ring.score_pct / 100) * circumference;
  circle.setAttribute('stroke-dasharray', `${filled} ${circumference - filled}`);

  const impactWrap = document.getElementById('impact-metrics');
  impactWrap.innerHTML = ring.metrics.map(m => `
    <div class="imp-row">
      <span class="imp-name">${escapeHtml(m.name)}</span>
      <div class="imp-bar-wrap"><div class="imp-bar" style="width:${m.pct}%"></div></div>
      <span class="imp-pct">${m.pct}%</span>
    </div>`).join('');

  // languages
  const langWrap = document.getElementById('lang-bars');
  langWrap.innerHTML = data.languages.map(l => `
    <div class="lang-row">
      <div class="lang-info"><span class="lang-name">${escapeHtml(l.name)}</span><span class="lang-pct">${l.pct}%</span></div>
      <div class="lang-track"><div class="lang-fill" style="width:${l.pct}%;background:${l.color}"></div></div>
    </div>`).join('');

  // heatmap
  const heatWrap = document.getElementById('heatmap');
  heatWrap.innerHTML = '';
  const frag = document.createDocumentFragment();
  data.heatmap.forEach(day => {
    const d = document.createElement('div');
    d.className = 'heat-cell' + (day.level > 0 ? ` l${day.level}` : '');
    d.title = `${day.date}: ${day.count} contribution${day.count === 1 ? '' : 's'}`;
    frag.appendChild(d);
  });
  heatWrap.appendChild(frag);

  // streak row
  const streakWrap = document.getElementById('streak-row');
  streakWrap.innerHTML = '';
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  data.streak.history.forEach((entry, idx) => {
    const el = document.createElement('div');
    let cls = 'streak-dot';
    if (entry.is_today) cls += ' today';
    else if (entry.active) cls += ' done';
    el.className = cls;
    el.textContent = days[idx % 7];
    streakWrap.appendChild(el);
  });

  // recent activity
  const tl = document.getElementById('timeline');
  tl.innerHTML = data.recent_activity.map(item => {
    const dotCls = item.type === 'merged' ? 'm' : item.type === 'opened' ? 'o' : 'c';
    const verb = item.type === 'merged' ? 'PR merged' : item.type === 'opened' ? 'PR opened' : 'PR closed';
    return `
    <div class="tl-item">
      <div class="tl-dot ${dotCls}"></div>
      <div class="tl-content">
        <div class="tl-title">${verb} — <em>${escapeHtml(item.title)}</em> · ${escapeHtml(item.repo)}</div>
        <div class="tl-meta">${escapeHtml(item.meta)}</div>
      </div>
      <div class="tl-date">${escapeHtml(item.time_ago)}</div>
    </div>`;
  }).join('');
}

/* ---------- PULL REQUESTS ---------- */
async function loadPullRequests() {
  try {
    const data = await Api.get('/pull-requests');
    state.allPRs = data;
    state.prsLoaded = true;
    renderPRs();
  } catch (e) {
    console.error('Failed to load pull requests', e);
    showToast('Could not load pull requests', true);
  }
}

function renderPRs() {
  const grid = document.getElementById('pr-grid');
  const { status, language, tag } = state.prFilters;
  const filtered = state.allPRs.filter(pr => {
    if (status !== 'all' && pr.status !== status) return false;
    if (language !== 'all' && pr.language !== language) return false;
    if (tag !== 'all' && pr.tag !== tag) return false;
    return true;
  });

  if (!filtered.length) {
    grid.innerHTML = '<div class="pr-empty">No pull requests match these filters.</div>';
    return;
  }

  grid.innerHTML = filtered.map(pr => `
    <div class="pr-card">
      <div class="pr-top">
        <div class="pr-repo"><i class="ti ti-git-branch" aria-hidden="true"></i> ${escapeHtml(pr.repo)}</div>
        <span class="pr-status ${pr.status}">${capitalize(pr.status)}</span>
      </div>
      <div class="pr-title">${escapeHtml(pr.title)}</div>
      <div class="pr-desc">${escapeHtml(pr.description)}</div>
      <div class="pr-meta">
        <span class="pr-lang"><span class="lang-dot" style="background:${LANG_COLORS[pr.language] || '#888'}"></span>${escapeHtml(pr.language)}</span>
        <span class="pr-additions">+${pr.additions}</span>
        <span class="pr-deletions">−${pr.deletions}</span>
        <span class="pr-impact"><i class="ti ti-star" aria-hidden="true"></i> ${escapeHtml(pr.impact_tag)}</span>
      </div>
    </div>`).join('');
}

function setupPRFilters() {
  const statusSelect = document.getElementById('pr-status-filter');
  const langSelect = document.getElementById('pr-lang-filter');
  statusSelect.addEventListener('change', () => {
    state.prFilters.status = statusSelect.value;
    renderPRs();
  });
  langSelect.addEventListener('change', () => {
    state.prFilters.language = langSelect.value;
    renderPRs();
  });

  document.getElementById('pr-tag-filters').addEventListener('click', (e) => {
    const chip = e.target.closest('.filter-chip');
    if (!chip) return;
    document.querySelectorAll('#pr-tag-filters .filter-chip').forEach(c => c.classList.remove('on'));
    chip.classList.add('on');
    state.prFilters.tag = chip.dataset.value;
    renderPRs();
  });
}

/* ---------- DISCOVER ---------- */
async function loadRepositories() {
  try {
    const data = await Api.get('/repositories');
    state.allRepos = data;
    state.reposLoaded = true;
    renderRepos();
  } catch (e) {
    console.error('Failed to load repositories', e);
    showToast('Could not load repository recommendations', true);
  }
}

function renderRepos() {
  const list = document.getElementById('repo-list');
  const filtered = state.repoFilter === 'all'
    ? state.allRepos
    : state.allRepos.filter(r => r.tags.includes(state.repoFilter));

  document.getElementById('repo-count').textContent =
    `Showing ${filtered.length} repositories matching your profile · Sorted by match score`;

  if (!filtered.length) {
    list.innerHTML = '<div class="repo-empty">No repositories match this filter.</div>';
    return;
  }

  list.innerHTML = filtered.map(r => `
    <div class="repo-item">
      <div class="repo-icon"><i class="ti ${escapeHtml(r.icon || 'ti-code')}" aria-hidden="true"></i></div>
      <div class="repo-info">
        <div class="repo-name">${escapeHtml(r.full_name)}</div>
        <div class="repo-desc">${escapeHtml(r.description)}</div>
        <div class="repo-tags">${r.tags.map(tagPill).join('')}</div>
      </div>
      <div>
        <div class="repo-stars"><i class="ti ti-star" aria-hidden="true"></i> ${escapeHtml(r.stars_display)}</div>
        <div class="repo-match">${r.match_pct}% match</div>
      </div>
    </div>`).join('');
}

function tagPill(tag) {
  const map = {
    'good first issue': 'gfi', 'help wanted': 'hw', 'hacktoberfest': 'hack'
  };
  const cls = map[tag] || 'lang';
  return `<span class="repo-tag ${cls}">${escapeHtml(tag)}</span>`;
}

function setupRepoFilters() {
  document.getElementById('discover-filters').addEventListener('click', (e) => {
    const chip = e.target.closest('.filter-chip');
    if (!chip) return;
    document.querySelectorAll('#discover-filters .filter-chip').forEach(c => c.classList.remove('on'));
    chip.classList.add('on');
    state.repoFilter = chip.dataset.value;
    renderRepos();
  });
}

/* ---------- COMMUNITY ---------- */
async function loadCommunity() {
  try {
    const [leaderboard, challenges, feed] = await Promise.all([
      Api.get('/community/leaderboard'),
      Api.get('/community/challenges'),
      Api.get('/community/feed')
    ]);
    state.communityLoaded = true;
    renderLeaderboard(leaderboard);
    renderChallenges(challenges);
    renderFeed(feed);
  } catch (e) {
    console.error('Failed to load community data', e);
    showToast('Could not load community data', true);
  }
}

const RANK_CLASS = { 1: 'gold', 2: 'silver', 3: '', 4: 'bronze' };
const AVATAR_COLORS = ['#3178c6', '#a78bfa', '#10b981', '#f97316', '#6b6762'];

function renderLeaderboard(items) {
  document.getElementById('leader-list').innerHTML = items.map(item => {
    const rankCls = item.is_current_user ? 'you' : (RANK_CLASS[item.rank] || '');
    const avColor = AVATAR_COLORS[(item.rank - 1) % AVATAR_COLORS.length];
    return `
    <div class="leader-item ${item.is_current_user ? 'you' : ''}">
      <span class="leader-rank ${rankCls}">${item.rank}</span>
      <div class="leader-av" style="background:${item.is_current_user ? 'var(--emerald-faint)' : avColor};color:${item.is_current_user ? 'var(--emerald)' : '#fff'}">${escapeHtml(item.initials)}</div>
      <div class="leader-body">
        <div class="leader-name">${item.is_current_user ? 'You — ' : ''}${escapeHtml(item.name)}</div>
        <div class="leader-sub">${item.contributions} contributions</div>
      </div>
      <span class="leader-score">${item.score.toLocaleString()}</span>
    </div>`;
  }).join('');
}

function renderChallenges(items) {
  document.getElementById('challenge-list').innerHTML = items.map(c => {
    const pct = Math.min(100, Math.round((c.progress / c.target) * 100));
    const done = c.progress >= c.target;
    return `
    <div class="challenge-card ${done ? 'done' : ''}">
      <div class="chal-head"><div class="chal-title">${escapeHtml(c.title)}</div><span class="chal-pts">+${c.points} pts</span></div>
      <div class="chal-desc">${escapeHtml(c.description)}</div>
      <div class="chal-progress"><div class="chal-bar" style="width:${pct}%"></div></div>
      <div class="chal-footer"><span>${c.progress} / ${c.target} completed</span><span>${c.days_left} days left</span></div>
    </div>`;
  }).join('');
}

function renderFeed(items) {
  document.getElementById('feed-list').innerHTML = items.map((f, idx) => {
    const verb = f.action === 'merged' ? 'merged a PR into' : f.action === 'opened' ? 'opened a PR in' : 'closed a PR in';
    const avColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
    return `
    <div class="feed-item">
      <div class="feed-av" style="background:${avColor}">${escapeHtml(f.actor_initials)}</div>
      <div>
        <div class="feed-text"><strong>${escapeHtml(f.actor_name)}</strong> ${verb} <a>${escapeHtml(f.repo)}</a> — <em>${escapeHtml(f.pr_title)}</em></div>
        <div class="feed-time">${escapeHtml(f.time_ago)} · ${escapeHtml(f.meta)}</div>
      </div>
    </div>`;
  }).join('');
}

/* ---------- ANALYTICS ---------- */
let chartsBuilt = false;
let charts = {};
async function loadAnalytics() {
  if (chartsBuilt) return;
  try {
    const data = await Api.get('/analytics');
    renderAnalytics(data);
    chartsBuilt = true;
  } catch (e) {
    console.error('Failed to load analytics', e);
    showToast('Could not load analytics data', true);
  }
}

function renderAnalytics(data) {
  document.getElementById('an-merge-rate').textContent = `${data.merge_success_rate}%`;
  document.getElementById('an-merge-rate-delta').textContent = `${data.merge_success_delta >= 0 ? '+' : ''}${data.merge_success_delta}% vs last quarter`;
  document.getElementById('an-review-time').textContent = `${data.avg_review_time_days}d`;
  document.getElementById('an-review-time-delta').textContent = `${data.avg_review_time_delta}d improvement`;
  document.getElementById('an-lines').textContent = formatK(data.lines_contributed);
  document.getElementById('an-lines-delta').textContent = `+${formatK(data.lines_contributed_delta)} this month`;
  document.getElementById('an-orgs').textContent = data.orgs_count;
  document.getElementById('an-orgs-delta').textContent = data.orgs_sample.join(', ') + '...';

  const outcome = data.outcome_breakdown;
  document.getElementById('legend-merged').textContent = `Merged ${outcome.merged}%`;
  document.getElementById('legend-open').textContent = `Open ${outcome.open}%`;
  document.getElementById('legend-closed').textContent = `Closed ${outcome.closed}%`;

  const monthCanvas = document.getElementById('monthChart');
  const donutCanvas = document.getElementById('donutChart');
  const lineCanvas = document.getElementById('lineChart');
  if (!monthCanvas || !donutCanvas || !lineCanvas || typeof Chart === 'undefined') return;

  charts.month = new Chart(monthCanvas, {
    type: 'bar',
    data: {
      labels: data.monthly_volume.labels,
      datasets: [{
        label: 'PRs', data: data.monthly_volume.data,
        backgroundColor: 'rgba(16,185,129,0.5)', borderColor: '#10b981', borderWidth: 1, borderRadius: 4
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#6b6762', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
        y: { ticks: { color: '#6b6762', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.04)' } }
      }
    }
  });

  charts.donut = new Chart(donutCanvas, {
    type: 'doughnut',
    data: {
      labels: ['Merged', 'Open', 'Closed'],
      datasets: [{ data: [outcome.merged, outcome.open, outcome.closed], backgroundColor: ['#10b981', '#a78bfa', '#f43f5e'], borderWidth: 0, hoverOffset: 4 }]
    },
    options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { display: false } } }
  });

  charts.line = new Chart(lineCanvas, {
    type: 'line',
    data: {
      labels: data.growth.labels,
      datasets: [{
        label: 'Cumulative contributions', data: data.growth.data,
        borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.08)',
        borderWidth: 2, fill: true, tension: 0.4, pointBackgroundColor: '#10b981', pointRadius: 3
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#6b6762', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
        y: { ticks: { color: '#6b6762', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.04)' } }
      }
    }
  });
}

/* ---------- HELPERS ---------- */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function formatK(n) { return n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : String(n); }

/* ---------- CONNECT GITHUB ---------- */
function setupConnectButton() {
  const btn = document.getElementById('connect-github-btn');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    try {
      const res = await Api.post('/auth/connect-github', {});
      showToast(res.message || 'GitHub connection requested');
    } catch (e) {
      showToast(e.message || 'Could not start GitHub connection', true);
    }
  });
}

/* ---------- INIT ---------- */
document.addEventListener('DOMContentLoaded', async () => {
  setupPRFilters();
  setupRepoFilters();
  setupConnectButton();

  try {
    await Api.ensureSession();
  } catch (e) {
    console.error('Session init failed', e);
    showToast('Could not connect to MergeKit API. Is the backend running?', true);
    return;
  }
  loadDashboard();
});
