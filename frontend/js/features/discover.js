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
