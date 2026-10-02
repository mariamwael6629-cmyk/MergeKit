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
