(() => {
  let index = [];

  async function loadIndex() {
    try {
      const res = await fetch('search.json');
      index = await res.json();
    } catch (e) {
      console.warn('search.json not available yet');
    }
  }

  // Levenshtein distance for fuzzy matching
  function levenshtein(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
    return dp[m][n];
  }

  function closestMatch(query, maxDist = 3) {
    const q = query.toLowerCase().trim();
    if (!q) return null;
    let best = null, bestDist = Infinity;
    for (const app of index) {
      const id = app.id.toLowerCase();
      const name = app.name.toLowerCase();
      const dist = Math.min(levenshtein(q, id), levenshtein(q, name));
      if (dist < bestDist && dist <= maxDist) {
        bestDist = dist;
        best = app;
      }
    }
    return best;
  }

  function search(query) {
    if (!query.trim() || !index.length) return [];
    const q = query.toLowerCase();
    const exact = index.filter(app =>
      app.id.toLowerCase().includes(q) ||
      app.name.toLowerCase().includes(q) ||
      app.description.toLowerCase().includes(q)
    ).slice(0, 20);
    return exact;
  }

  function renderNoResults(dropdown, query) {
    const suggestion = closestMatch(query);
    let html = '';

    if (suggestion) {
      html += `<div class="search-no-results">No matches for "<strong>${escapeHtml(query)}</strong>"</div>`;
      html += `<div class="search-did-you-mean">Did you mean?</div>`;
      html += `<a class="search-result-item" href="app.html?id=${encodeURIComponent(suggestion.id)}">
        <div class="search-result-icon">${suggestion.name.charAt(0)}</div>
        <div class="search-result-info">
          <div class="search-result-name">${escapeHtml(suggestion.name)}</div>
          <div class="search-result-id">${escapeHtml(suggestion.id)}</div>
        </div>
      </a>`;
    } else {
      html += `<div class="search-no-results">No applications found for "<strong>${escapeHtml(query)}</strong>"</div>`;
    }

    html += `<div class="search-submit-cta">
      <p>Can't find what you're looking for?</p>
      <p>FlatFree is community-driven, not corporate-driven. If this app doesn't exist yet, <a href="https://github.com/spivanatalie64/FlatFree" class="search-cta-link">submit it yourself</a> — we accept all free software.</p>
      <p class="search-thanks">Thank you for being part of the FlatFree community. 💜</p>
    </div>`;

    dropdown.innerHTML = html;
  }

  function escapeHtml(text) {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
  }

  function bindSearchInput(input, dropdown) {
    if (!input) return;
    input.disabled = false;
    input.placeholder = 'Search applications...';

    let debounceTimer;
    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (!dropdown) return;
        const results = search(input.value);
        dropdown.innerHTML = '';
        if (!input.value.trim()) return;

        if (!results.length) {
          renderNoResults(dropdown, input.value);
          return;
        }

        for (const app of results) {
          const item = document.createElement('a');
          item.className = 'search-result-item';
          item.href = `app.html?id=${encodeURIComponent(app.id)}`;
          item.innerHTML = `
            <div class="search-result-icon">${app.name.charAt(0)}</div>
            <div class="search-result-info">
              <div class="search-result-name">${escapeHtml(app.name)}</div>
              <div class="search-result-id">${escapeHtml(app.id)}</div>
            </div>
          `;
          dropdown.appendChild(item);
        }

        // Show community footer after results
        const footer = document.createElement('div');
        footer.className = 'search-results-footer';
        footer.innerHTML = `<span>FlatFree — for the community, not corporations</span>`;
        dropdown.appendChild(footer);
      }, 200);
    });

    input.addEventListener('blur', () => {
      setTimeout(() => { if (dropdown) dropdown.innerHTML = ''; }, 200);
    });
  }

  function init() {
    const navInput = document.getElementById('navSearch');
    if (navInput) {
      const dd = document.createElement('div');
      dd.className = 'search-dropdown';
      if (navInput.parentElement) {
        navInput.parentElement.style.position = 'relative';
        navInput.parentElement.appendChild(dd);
      }
      bindSearchInput(navInput, dd);
    }

    const searchBar = document.querySelector('.search-bar');
    if (searchBar) {
      const input = searchBar.querySelector('input');
      if (input) {
        let dropdown = searchBar.querySelector('.search-dropdown');
        if (!dropdown) {
          dropdown = document.createElement('div');
          dropdown.className = 'search-dropdown';
          searchBar.appendChild(dropdown);
        }
        bindSearchInput(input, dropdown);
      }
    }

    if (window.location.pathname.endsWith('apps.html') || window.location.pathname.endsWith('apps/')) {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      if (q) {
        setTimeout(() => {
          const inp = document.querySelector('.search-bar input') || document.getElementById('navSearch');
          if (inp) {
            inp.value = q;
            inp.dispatchEvent(new Event('input'));
          }
        }, 500);
      }
    }
  }

  loadIndex().then(() => {
    if (document.readyState !== 'loading') init();
    else document.addEventListener('DOMContentLoaded', init);
  });
})();
