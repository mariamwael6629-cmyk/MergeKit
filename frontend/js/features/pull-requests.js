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
