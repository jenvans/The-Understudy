import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Admin review page served as a serverless function.
 * Access: /api/admin/gr33nr00m?key=<ADMIN_SECRET>
 * Set ADMIN_SECRET env var in Vercel (never committed to git).
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  // Simple secret check via query param
  const secret = process.env.ADMIN_SECRET;
  if (secret && req.query.key !== secret) {
    return res.status(404).send('Not found');
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');

  return res.status(200).send(PAGE_HTML);
}

const PAGE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>The Understudy — Cache Review</title>
  <meta name="robots" content="noindex, nofollow" />
  <style>
    :root {
      --bg: #0f1117;
      --surface: #1a1d27;
      --surface2: #242736;
      --border: #2e3140;
      --text: #e4e6ef;
      --muted: #8b8fa3;
      --accent: #1D9E75;
      --accent-dim: rgba(29, 158, 117, 0.15);
      --yellow: #eab308;
      --yellow-dim: rgba(234, 179, 8, 0.15);
      --green: #22c55e;
      --green-dim: rgba(34, 197, 94, 0.15);
      --red: #ef4444;
      --red-dim: rgba(239, 68, 68, 0.15);
      --purple: #a78bfa;
      --purple-dim: rgba(167, 139, 250, 0.15);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      padding: 2rem;
    }

    header {
      max-width: 1200px;
      margin: 0 auto 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }

    h1 {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--accent);
    }

    h1 span { color: var(--muted); font-weight: 400; font-size: 0.9rem; margin-left: 0.5rem; }

    .stats {
      display: flex;
      gap: 1.5rem;
      font-size: 0.85rem;
      color: var(--muted);
    }

    .stats b { color: var(--text); }

    .toolbar {
      max-width: 1200px;
      margin: 0 auto 1rem;
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .toolbar button, .toolbar select {
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 0.4rem 0.75rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.8rem;
    }

    .toolbar button:hover { border-color: var(--accent); }
    .toolbar button.active { background: var(--accent-dim); border-color: var(--accent); color: var(--accent); }
    .toolbar select { appearance: auto; }

    #entries {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .entry {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      overflow: hidden;
      transition: border-color 0.2s;
    }

    .entry:hover { border-color: var(--accent); }

    .entry-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      cursor: pointer;
      user-select: none;
    }

    .entry-header:hover { background: var(--surface2); }

    .term {
      font-weight: 600;
      font-size: 1rem;
      flex: 1;
    }

    .badge {
      font-size: 0.7rem;
      font-weight: 600;
      padding: 0.15rem 0.5rem;
      border-radius: 999px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .badge-kitchen { background: var(--accent-dim); color: var(--accent); }
    .badge-bar { background: var(--purple-dim); color: var(--purple); }
    .badge-pending { background: var(--yellow-dim); color: var(--yellow); }
    .badge-approved { background: var(--green-dim); color: var(--green); }
    .badge-rejected { background: var(--red-dim); color: var(--red); }

    .meta {
      display: flex;
      gap: 1rem;
      font-size: 0.75rem;
      color: var(--muted);
    }

    .entry-body {
      display: none;
      padding: 0 1rem 1rem;
      border-top: 1px solid var(--border);
    }

    .entry.open .entry-body { display: block; }

    .filters-row {
      display: flex;
      gap: 0.35rem;
      flex-wrap: wrap;
      margin: 0.5rem 0;
    }

    .filter-tag {
      font-size: 0.7rem;
      padding: 0.1rem 0.45rem;
      border-radius: 4px;
      background: var(--surface2);
      color: var(--muted);
    }

    .sub-card {
      background: var(--surface2);
      border-radius: 8px;
      padding: 0.65rem 0.85rem;
      margin-top: 0.5rem;
    }

    .sub-card h4 { font-size: 0.9rem; margin-bottom: 0.25rem; }
    .sub-card p { font-size: 0.8rem; color: var(--muted); line-height: 1.4; }
    .sub-card .ratio { color: var(--accent); font-weight: 500; }

    .sub-tags {
      display: flex;
      gap: 0.3rem;
      flex-wrap: wrap;
      margin-top: 0.3rem;
    }

    .sub-tags span {
      font-size: 0.65rem;
      padding: 0.05rem 0.4rem;
      border-radius: 4px;
      background: var(--accent-dim);
      color: var(--accent);
    }

    .actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.75rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--border);
    }

    .actions button {
      flex: 1;
      padding: 0.45rem 0.75rem;
      border-radius: 6px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text);
      font-size: 0.8rem;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.15s;
    }

    .btn-approve { border-color: var(--green) !important; color: var(--green) !important; }
    .btn-approve:hover { background: var(--green-dim) !important; }
    .btn-reject { border-color: var(--red) !important; color: var(--red) !important; }
    .btn-reject:hover { background: var(--red-dim) !important; }
    .btn-delete { border-color: var(--muted) !important; color: var(--muted) !important; }
    .btn-delete:hover { background: rgba(139,143,163,0.1) !important; }
    .btn-pending { border-color: var(--yellow) !important; color: var(--yellow) !important; }
    .btn-pending:hover { background: var(--yellow-dim) !important; }

    .empty {
      text-align: center;
      padding: 4rem 1rem;
      color: var(--muted);
      font-size: 1rem;
    }

    .loading {
      text-align: center;
      padding: 4rem 1rem;
      color: var(--muted);
    }

    .loading::after {
      content: '';
      display: inline-block;
      width: 1.2rem;
      height: 1.2rem;
      border: 2px solid var(--border);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      margin-left: 0.5rem;
      vertical-align: middle;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .toast {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      background: var(--surface);
      border: 1px solid var(--accent);
      padding: 0.6rem 1rem;
      border-radius: 8px;
      font-size: 0.85rem;
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.3s;
      pointer-events: none;
      z-index: 100;
    }

    .toast.show { opacity: 1; transform: translateY(0); }
  </style>
</head>
<body>
  <header>
    <h1>\\u{1F3AD} The Understudy <span>Cache Review</span></h1>
    <div class="stats" id="stats"></div>
  </header>

  <div class="toolbar" id="toolbar">
    <button class="active" data-filter="all">All</button>
    <button data-filter="pending">\\u23F3 Pending</button>
    <button data-filter="approved">\\u2705 Approved</button>
    <button data-filter="rejected">\\u274C Rejected</button>
    <select id="tabFilter">
      <option value="all">All tabs</option>
      <option value="kitchen">\\u{1F373} Kitchen</option>
      <option value="bar">\\u{1F378} Bar</option>
    </select>
    <button id="refreshBtn">\\u21BB Refresh</button>
  </div>

  <div id="entries">
    <div class="loading">Loading cache entries</div>
  </div>

  <div class="toast" id="toast"></div>

  <script>
    const API = '/api/admin/cache';
    let allEntries = [];
    let statusFilter = 'all';
    let tabFilter = 'all';

    async function loadEntries() {
      const container = document.getElementById('entries');
      container.innerHTML = '<div class="loading">Loading cache entries</div>';
      try {
        const res = await fetch(API);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        allEntries = data.entries || [];
        updateStats();
        render();
      } catch (e) {
        container.innerHTML = '<div class="empty">\\u26A0\\uFE0F Could not load cache. Is Redis configured?<br><small style="color:#666;margin-top:0.5rem;display:block;">' + e.message + '</small></div>';
      }
    }

    function updateStats() {
      const pending = allEntries.filter(e => e.status === 'pending').length;
      const approved = allEntries.filter(e => e.status === 'approved').length;
      const rejected = allEntries.filter(e => e.status === 'rejected').length;
      const total = allEntries.reduce((s, e) => s + (e.searchCount || 0), 0);
      document.getElementById('stats').innerHTML =
        '<span><b>' + allEntries.length + '</b> cached</span>' +
        '<span><b>' + pending + '</b> pending</span>' +
        '<span><b>' + approved + '</b> approved</span>' +
        '<span><b>' + rejected + '</b> rejected</span>' +
        '<span><b>' + total + '</b> total searches</span>';
    }

    function render() {
      const container = document.getElementById('entries');
      let filtered = allEntries;
      if (statusFilter !== 'all') filtered = filtered.filter(e => e.status === statusFilter);
      if (tabFilter !== 'all') filtered = filtered.filter(e => e.tab === tabFilter);

      if (filtered.length === 0) {
        container.innerHTML = '<div class="empty">No entries match the current filter.</div>';
        return;
      }

      container.innerHTML = filtered.map(entry => {
        const subs = entry.substitutes || [];
        const filterTags = (entry.filters || []).map(f =>
          '<span class="filter-tag">' + esc(f) + '</span>'
        ).join('');

        const subsHtml = subs.map(s => \`
          <div class="sub-card">
            <h4>\${esc(s.name)} <span class="ratio">\${esc(s.ratio)}</span></h4>
            <p>\${esc(s.notes || '')}</p>
            <div class="sub-tags">
              \${(s.tags || []).map(t => '<span>' + esc(t) + '</span>').join('')}
            </div>
            \${s.bestFor ? '<p style="margin-top:0.25rem;font-size:0.75rem;color:#8b8fa3">Best for: ' + (s.bestFor || []).map(esc).join(', ') + '</p>' : ''}
          </div>
        \`).join('');

        const ago = timeAgo(entry.lastSearched || entry.createdAt);

        return \`
          <div class="entry" data-key="\${esc(entry.key)}">
            <div class="entry-header" onclick="toggle(this)">
              <span class="badge badge-\${entry.tab}">\${entry.tab}</span>
              <span class="term">\${esc(entry.searchTerm)}</span>
              <span class="badge badge-\${entry.status}">\${entry.status}</span>
              <div class="meta">
                <span>\${subs.length} subs</span>
                <span>\\u00D7\${entry.searchCount || 1}</span>
                <span>\${ago}</span>
              </div>
            </div>
            <div class="entry-body">
              \${filterTags ? '<div class="filters-row">' + filterTags + '</div>' : ''}
              \${subsHtml}
              <div class="actions">
                \${entry.status !== 'approved' ? '<button class="btn-approve" onclick="setStatus(\\'' + esc(entry.key) + '\\',\\'approved\\')">\\u2705 Approve</button>' : ''}
                \${entry.status !== 'rejected' ? '<button class="btn-reject" onclick="setStatus(\\'' + esc(entry.key) + '\\',\\'rejected\\')">\\u274C Reject</button>' : ''}
                \${entry.status !== 'pending' ? '<button class="btn-pending" onclick="setStatus(\\'' + esc(entry.key) + '\\',\\'pending\\')">\\u23F3 Reset</button>' : ''}
                <button class="btn-delete" onclick="deleteEntry('\\'\${esc(entry.key)}\\'')">\\u{1F5D1} Delete</button>
              </div>
            </div>
          </div>
        \`;
      }).join('');
    }

    function toggle(header) { header.closest('.entry').classList.toggle('open'); }

    async function setStatus(key, status) {
      try {
        const res = await fetch(API, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, status }),
        });
        if (!res.ok) throw new Error('Failed');
        const entry = allEntries.find(e => e.key === key);
        if (entry) entry.status = status;
        updateStats();
        render();
        toast('Marked "' + (entry ? entry.searchTerm : '') + '" as ' + status);
      } catch (e) {
        toast('\\u26A0\\uFE0F Failed to update status');
      }
    }

    async function deleteEntry(key) {
      if (!confirm('Delete this cached entry? Next search will hit Gemini again.')) return;
      try {
        const res = await fetch(API, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key }),
        });
        if (!res.ok) throw new Error('Failed');
        allEntries = allEntries.filter(e => e.key !== key);
        updateStats();
        render();
        toast('Entry deleted');
      } catch (e) {
        toast('\\u26A0\\uFE0F Failed to delete');
      }
    }

    document.getElementById('toolbar').addEventListener('click', e => {
      const btn = e.target.closest('button[data-filter]');
      if (!btn) return;
      statusFilter = btn.dataset.filter;
      document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      render();
    });

    document.getElementById('tabFilter').addEventListener('change', e => {
      tabFilter = e.target.value;
      render();
    });

    document.getElementById('refreshBtn').addEventListener('click', loadEntries);

    function esc(s) {
      const d = document.createElement('div');
      d.textContent = String(s != null ? s : '');
      return d.innerHTML;
    }

    function timeAgo(iso) {
      if (!iso) return '';
      const diff = Date.now() - new Date(iso).getTime();
      const m = Math.floor(diff / 60000);
      if (m < 1) return 'just now';
      if (m < 60) return m + 'm ago';
      const h = Math.floor(m / 60);
      if (h < 24) return h + 'h ago';
      const d = Math.floor(h / 24);
      return d + 'd ago';
    }

    function toast(msg) {
      const el = document.getElementById('toast');
      el.textContent = msg;
      el.classList.add('show');
      setTimeout(() => el.classList.remove('show'), 2500);
    }

    loadEntries();
  </script>
</body>
</html>`;
