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
