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
