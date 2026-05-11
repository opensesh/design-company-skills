// DESIGN-OPS Dashboard - Frontend Application
// Snapshot view - shows current state without filters

const API_BASE = '';
let autoRefreshInterval = null;
const AUTO_REFRESH_MS = 60000; // 60 seconds

// Utility functions
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;

  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function truncate(str, len = 60) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '...' : str;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// API functions
async function fetchApi(endpoint) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`);
    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    return { success: false, error: error.message };
  }
}

// Render functions
function renderLoading(cardId) {
  const card = document.getElementById(cardId);
  if (!card) return;

  const content = card.querySelector('.card-content');
  const status = card.querySelector('.status-dot');

  content.innerHTML = '<div class="loading-state">Loading...</div>';
  status.dataset.status = 'loading';
}

function renderError(cardId, message) {
  const card = document.getElementById(cardId);
  if (!card) return;

  const content = card.querySelector('.card-content');
  const status = card.querySelector('.status-dot');

  content.innerHTML = `<div class="error-state">${escapeHtml(message)}</div>`;
  status.dataset.status = 'error';
}

function renderNotConfigured(cardId, service) {
  const card = document.getElementById(cardId);
  if (!card) return;

  const content = card.querySelector('.card-content');
  const status = card.querySelector('.status-dot');

  content.innerHTML = `
    <div class="not-configured-state">
      <div>${service} not configured</div>
      <div style="font-size: 11px; opacity: 0.7;">Run: load-design-ops-secrets</div>
    </div>
  `;
  status.dataset.status = 'not-configured';
}

function renderEmpty(cardId, message = 'No data') {
  const card = document.getElementById(cardId);
  if (!card) return;

  const content = card.querySelector('.card-content');
  const status = card.querySelector('.status-dot');

  content.innerHTML = `<div class="empty-state">${escapeHtml(message)}</div>`;
  status.dataset.status = 'success';
}

function renderSuccess(cardId, html) {
  const card = document.getElementById(cardId);
  if (!card) return;

  const content = card.querySelector('.card-content');
  const status = card.querySelector('.status-dot');

  content.innerHTML = html;
  status.dataset.status = 'success';
}

// Data loaders - Snapshot view (no filters)
async function loadCommits() {
  renderLoading('commits-card');

  const result = await fetchApi('/api/github/commits');

  if (!result.configured) {
    renderNotConfigured('commits-card', 'GitHub');
    return;
  }

  if (!result.success) {
    renderError('commits-card', result.error);
    return;
  }

  const commits = result.data || [];
  if (commits.length === 0) {
    renderEmpty('commits-card', 'No recent commits');
    return;
  }

  const html = `
    <div class="item-list">
      ${commits.slice(0, 8).map(c => `
        <div class="item">
          <div class="item-icon">${c.sha}</div>
          <div class="item-content">
            <div class="item-title">
              <a href="${escapeHtml(c.url)}" target="_blank">${escapeHtml(truncate(c.message, 50))}</a>
            </div>
            <div class="item-meta">${escapeHtml(c.author)} &middot; ${escapeHtml(c.repo)} &middot; ${formatDate(c.date)}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  renderSuccess('commits-card', html);
}

async function loadPRs() {
  renderLoading('prs-card');

  const result = await fetchApi('/api/github/prs');

  if (!result.configured) {
    renderNotConfigured('prs-card', 'GitHub');
    return;
  }

  if (!result.success) {
    renderError('prs-card', result.error);
    return;
  }

  const prs = result.data || [];
  if (prs.length === 0) {
    renderEmpty('prs-card', 'No open PRs');
    return;
  }

  const html = `
    <div class="item-list">
      ${prs.slice(0, 8).map(pr => `
        <div class="item">
          <div class="item-icon">#${pr.number}</div>
          <div class="item-content">
            <div class="item-title">
              <a href="${escapeHtml(pr.url)}" target="_blank">${escapeHtml(truncate(pr.title, 45))}</a>
            </div>
            <div class="item-meta">${escapeHtml(pr.author)} &middot; ${escapeHtml(pr.repo)} &middot; ${formatDate(pr.updated_at)}</div>
          </div>
          ${pr.draft ? '<span class="item-badge draft">Draft</span>' : ''}
        </div>
      `).join('')}
    </div>
  `;

  renderSuccess('prs-card', html);
}

async function loadTasks() {
  renderLoading('tasks-card');

  const result = await fetchApi('/api/notion/tasks');

  if (!result.configured) {
    renderNotConfigured('tasks-card', 'Notion');
    return;
  }

  if (!result.success) {
    renderError('tasks-card', result.error);
    return;
  }

  const tasks = result.data || [];
  if (tasks.length === 0) {
    renderEmpty('tasks-card', 'No tasks due today');
    return;
  }

  const html = `
    <div class="item-list">
      ${tasks.slice(0, 8).map(t => `
        <div class="item">
          <div class="item-content">
            <div class="item-title">
              <a href="${escapeHtml(t.url)}" target="_blank">${escapeHtml(truncate(t.title, 50))}</a>
            </div>
            <div class="item-meta">${escapeHtml(t.status)}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  renderSuccess('tasks-card', html);
}

async function loadCalendar() {
  renderLoading('calendar-card');

  const result = await fetchApi('/api/google/calendar');

  if (!result.configured) {
    renderNotConfigured('calendar-card', 'Google Calendar');
    return;
  }

  if (!result.success) {
    renderError('calendar-card', result.error);
    return;
  }

  const events = result.data || [];
  if (events.length === 0) {
    renderEmpty('calendar-card', 'No events today');
    return;
  }

  const html = `
    <div class="item-list">
      ${events.slice(0, 6).map(e => `
        <div class="item">
          <div class="item-icon">${formatTime(e.start)}</div>
          <div class="item-content">
            <div class="item-title">
              ${e.htmlLink ? `<a href="${escapeHtml(e.htmlLink)}" target="_blank">${escapeHtml(truncate(e.summary, 40))}</a>` : escapeHtml(truncate(e.summary, 40))}
            </div>
            ${e.attendees > 1 ? `<div class="item-meta">${e.attendees} attendees</div>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;

  renderSuccess('calendar-card', html);
}

async function loadEmail() {
  renderLoading('email-card');

  const result = await fetchApi('/api/google/email');

  if (!result.configured) {
    renderNotConfigured('email-card', 'Gmail');
    return;
  }

  if (!result.success) {
    renderError('email-card', result.error);
    return;
  }

  const emails = result.data || [];
  if (emails.length === 0) {
    renderEmpty('email-card', 'No unread important emails');
    return;
  }

  const html = `
    <div class="item-list">
      ${emails.slice(0, 6).map(e => `
        <div class="item">
          <div class="item-content">
            <div class="item-title">${escapeHtml(truncate(e.subject, 45))}</div>
            <div class="item-meta">${escapeHtml(truncate(e.from, 30))} &middot; ${formatDate(e.date)}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  renderSuccess('email-card', html);
}

async function loadDeployments() {
  renderLoading('deployments-card');

  const result = await fetchApi('/api/vercel/deployments');

  if (!result.configured) {
    renderNotConfigured('deployments-card', 'Vercel');
    return;
  }

  if (!result.success) {
    renderError('deployments-card', result.error);
    return;
  }

  const deployments = result.data || [];
  if (deployments.length === 0) {
    renderEmpty('deployments-card', 'No recent deployments');
    return;
  }

  const stateColors = {
    READY: 'success',
    BUILDING: 'warning',
    ERROR: 'error',
    CANCELED: 'draft',
  };

  const html = `
    <div class="item-list">
      ${deployments.slice(0, 8).map(d => `
        <div class="item">
          <div class="item-content">
            <div class="item-title">
              <a href="${escapeHtml(d.url)}" target="_blank">${escapeHtml(d.name)}</a>
            </div>
            <div class="item-meta">${d.target || 'preview'} &middot; ${formatDate(new Date(d.created))}</div>
          </div>
          <span class="item-badge ${stateColors[d.state] || 'info'}">${d.state}</span>
        </div>
      `).join('')}
    </div>
  `;

  renderSuccess('deployments-card', html);
}

async function loadLinks() {
  renderLoading('links-card');

  const result = await fetchApi('/api/dub/links');

  if (!result.configured) {
    renderNotConfigured('links-card', 'Dub.co');
    return;
  }

  if (!result.success) {
    renderError('links-card', result.error);
    return;
  }

  const links = result.data || [];
  if (links.length === 0) {
    renderEmpty('links-card', 'No links tracked');
    return;
  }

  const html = `
    <div class="item-list">
      ${links.slice(0, 8).map(l => `
        <div class="item">
          <div class="item-content">
            <div class="item-title">
              <a href="${escapeHtml(l.shortLink)}" target="_blank">${escapeHtml(l.key)}</a>
            </div>
            <div class="item-meta">${escapeHtml(truncate(l.url, 35))}</div>
          </div>
          <span class="item-badge info">${l.clicks} clicks</span>
        </div>
      `).join('')}
    </div>
  `;

  renderSuccess('links-card', html);
}

async function loadInstagram() {
  renderLoading('instagram-card');

  const result = await fetchApi('/api/instagram/metrics');

  if (!result.configured) {
    renderNotConfigured('instagram-card', 'Instagram');
    return;
  }

  if (!result.success) {
    renderError('instagram-card', result.error);
    return;
  }

  const metrics = result.data;
  if (!metrics) {
    renderEmpty('instagram-card', 'No data available');
    return;
  }

  const html = `
    <div class="metrics-grid">
      <div class="metric">
        <div class="metric-value">${metrics.followers_count.toLocaleString()}</div>
        <div class="metric-label">Followers</div>
      </div>
      <div class="metric">
        <div class="metric-value">${metrics.follows_count.toLocaleString()}</div>
        <div class="metric-label">Following</div>
      </div>
      <div class="metric">
        <div class="metric-value">${metrics.media_count.toLocaleString()}</div>
        <div class="metric-label">Posts</div>
      </div>
      <div class="metric">
        <div class="metric-value">@${escapeHtml(metrics.username)}</div>
        <div class="metric-label">Account</div>
      </div>
    </div>
  `;

  renderSuccess('instagram-card', html);
}

async function loadFigma() {
  renderLoading('figma-card');

  const result = await fetchApi('/api/figma/activity');

  if (!result.configured) {
    renderNotConfigured('figma-card', 'Figma');
    return;
  }

  if (!result.success) {
    renderError('figma-card', result.error);
    return;
  }

  const activity = result.data;
  if (!activity || activity.files.length === 0) {
    renderEmpty('figma-card', 'No tracked files');
    return;
  }

  const html = `
    <div class="metrics-grid" style="margin-bottom: 12px;">
      <div class="metric">
        <div class="metric-value">${activity.summary.total_files}</div>
        <div class="metric-label">Files</div>
      </div>
      <div class="metric">
        <div class="metric-value">${activity.summary.unresolved_comments}</div>
        <div class="metric-label">Comments</div>
      </div>
    </div>
    <div class="item-list">
      ${activity.comments.slice(0, 4).map(c => `
        <div class="item">
          <div class="item-content">
            <div class="item-title">${escapeHtml(truncate(c.message, 40))}</div>
            <div class="item-meta">${escapeHtml(c.user.handle)} in ${escapeHtml(c.file_name)} &middot; ${formatDate(c.created_at)}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  renderSuccess('figma-card', html);
}

// Load all data
async function loadAllData() {
  const refreshBtn = document.getElementById('refresh-btn');
  refreshBtn.classList.add('spinning');

  // Load in parallel
  await Promise.all([
    loadCommits(),
    loadPRs(),
    loadTasks(),
    loadCalendar(),
    loadEmail(),
    loadDeployments(),
    loadLinks(),
    loadInstagram(),
    loadFigma(),
  ]);

  refreshBtn.classList.remove('spinning');

  // Update last updated time
  document.getElementById('last-updated').textContent = `Updated ${new Date().toLocaleTimeString()}`;
}

// Load health/status
async function loadHealth() {
  const result = await fetchApi('/api/health');

  if (result.status === 'ok') {
    const services = result.services;
    const configured = Object.entries(services).filter(([, v]) => v).map(([k]) => k);
    const notConfigured = Object.entries(services).filter(([, v]) => !v).map(([k]) => k);

    document.getElementById('service-status').textContent =
      `${configured.length} services connected` +
      (notConfigured.length > 0 ? ` (${notConfigured.length} not configured)` : '');

    if (result.cache) {
      document.getElementById('cache-info').textContent =
        `Cache: ${result.cache.keys} keys, ${result.cache.hits} hits, ${result.cache.misses} misses`;
    }
  }
}

// Event handlers
function setupEventListeners() {
  // Refresh button
  document.getElementById('refresh-btn').addEventListener('click', () => {
    loadAllData();
    loadHealth();
  });
}

// Auto-refresh
function startAutoRefresh() {
  if (autoRefreshInterval) clearInterval(autoRefreshInterval);
  autoRefreshInterval = setInterval(() => {
    loadAllData();
    loadHealth();
  }, AUTO_REFRESH_MS);
}

// Initialize
async function init() {
  setupEventListeners();
  await loadHealth();
  await loadAllData();
  startAutoRefresh();
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
