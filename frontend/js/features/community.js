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
