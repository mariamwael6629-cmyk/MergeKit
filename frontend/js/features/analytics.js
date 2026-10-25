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
        backgroundColor: 'rgba(176,141,25,0.5)', borderColor: '#B08D19', borderWidth: 1, borderRadius: 4
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
      datasets: [{ data: [outcome.merged, outcome.open, outcome.closed], backgroundColor: ['#B08D19', '#E2BA36', '#f43f5e'], borderWidth: 0, hoverOffset: 4 }]
    },
    options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { display: false } } }
  });

  charts.line = new Chart(lineCanvas, {
    type: 'line',
    data: {
      labels: data.growth.labels,
      datasets: [{
        label: 'Cumulative contributions', data: data.growth.data,
        borderColor: '#B08D19', backgroundColor: 'rgba(176,141,25,0.08)',
        borderWidth: 2, fill: true, tension: 0.4, pointBackgroundColor: '#B08D19', pointRadius: 3
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
