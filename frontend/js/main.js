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
