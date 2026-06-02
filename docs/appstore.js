(() => {
  let apps = [];
  let currentView = localStorage.getItem('flatfree-view') || 'grid';

  const grid = document.getElementById('appGrid');
  const searchInput = document.getElementById('appstoreSearch');
  const countEl = document.getElementById('appCount');
  const footerEl = document.getElementById('appStoreFooter');
  const viewBtns = document.querySelectorAll('.view-btn');

  function getInitials(name) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  function getColor(id) {
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 55%, 35%)`;
  }

  function licenseBadge(app) {
    const lic = (app.license || 'FOSS').toUpperCase();
    return `<span class="tag tag-foss" title="License: ${escapeHtml(app.projectLicense || app.license || 'Free and Open Source')}">
      ${lic === 'FOSS' ? 'FOSS' : lic}
    </span>`;
  }

  function filterApps(query) {
    if (!query.trim()) return apps;
    const q = query.toLowerCase();
    return apps.filter(a =>
      a.id.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      a.runtime.toLowerCase().includes(q)
    );
  }

  function render() {
    const query = searchInput ? searchInput.value : '';
    const filtered = filterApps(query);
    const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name));

    if (countEl) countEl.textContent = `${sorted.length} app${sorted.length !== 1 ? 's' : ''}`;

    if (!sorted.length) {
      grid.innerHTML = `
        <div class="appstore-empty">
          <div class="empty-icon">🔍</div>
          <h3>No applications found</h3>
          <p>Try a different search term.</p>
          <p>If you're looking for something that doesn't exist here yet, <a href="contribute.html" style="color: #8957e5;">submit it yourself</a> — we accept all free software.</p>
          <p style="font-size: 0.85rem; color: #6e40c9; margin-top: 16px;">FlatFree — for the community, not corporations</p>
        </div>`;
      if (footerEl) footerEl.innerHTML = '';
      return;
    }

    if (currentView === 'grid') renderGrid(sorted);
    else renderList(sorted);

    if (footerEl) {
      footerEl.innerHTML = `
        <p style="text-align: center; color: #484f58; font-size: 0.8rem; padding: 16px 0;">
          Showing ${sorted.length} of ${apps.length} apps &mdash; All apps are Free & Open Source &mdash;
          <a href="https://github.com/spivanatalie64/FlatFree" style="color: #8957e5;">Submit yours</a>
        </p>`;
    }
  }

  function renderGrid(sorted) {
    grid.className = 'appstore-grid';
    grid.innerHTML = sorted.map(a => `
      <a class="appstore-card" href="app.html?id=${encodeURIComponent(a.id)}">
        <div class="appstore-card-icon" style="background: ${getColor(a.id)}">${getInitials(a.name)}</div>
        <div class="appstore-card-body">
          <div class="appstore-card-name">${escapeHtml(a.name)}</div>
          <div class="appstore-card-id">${escapeHtml(a.id)}</div>
          <div class="appstore-card-desc">${escapeHtml(truncate(a.description, 80))}</div>
          <div class="appstore-card-meta">
            ${licenseBadge(a)}
            <span class="tag" title="Runtime">${escapeHtml(a.runtime.split('.').pop())}</span>
          </div>
        </div>
      </a>
    `).join('');
  }

  function renderList(sorted) {
    grid.className = 'appstore-list';
    grid.innerHTML = sorted.map(a => `
      <a class="appstore-list-item" href="app.html?id=${encodeURIComponent(a.id)}">
        <div class="appstore-list-icon" style="background: ${getColor(a.id)}">${getInitials(a.name)}</div>
        <div class="appstore-list-body">
          <div class="appstore-list-name">${escapeHtml(a.name)}</div>
          <div class="appstore-list-id">${escapeHtml(a.id)}</div>
          <div class="appstore-list-desc">${escapeHtml(truncate(a.description, 120))}</div>
        </div>
        <div class="appstore-list-meta" style="display:flex;gap:6px;align-items:center">
          ${licenseBadge(a)}
          <span class="tag">${escapeHtml(a.runtime.split('.').pop())}</span>
        </div>
      </a>
    `).join('');
  }

  function escapeHtml(t) {
    const d = document.createElement('div');
    d.textContent = t;
    return d.innerHTML;
  }

  function truncate(s, n) {
    return s.length > n ? s.slice(0, n) + '\u2026' : s;
  }

  function init() {
    fetch('search.json').then(r => r.json()).then(data => {
      apps = data;
      render();

      if (searchInput) {
        let timer;
        searchInput.addEventListener('input', () => {
          clearTimeout(timer);
          timer = setTimeout(render, 150);
        });
      }

      viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          viewBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentView = btn.dataset.view;
          localStorage.setItem('flatfree-view', currentView);
          render();
        });
        if (btn.dataset.view === currentView) btn.classList.add('active');
        else btn.classList.remove('active');
      });

      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      if (q && searchInput) {
        searchInput.value = q;
        render();
      }
    }).catch(() => {
      grid.innerHTML = '<div class="appstore-empty"><h3>Failed to load apps</h3><p>Please try again later.</p></div>';
    });
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
