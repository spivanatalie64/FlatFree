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

  function search(query) {
    if (!query.trim() || !index.length) return [];
    const q = query.toLowerCase();
    return index.filter(app =>
      app.id.toLowerCase().includes(q) ||
      app.name.toLowerCase().includes(q) ||
      app.description.toLowerCase().includes(q)
    ).slice(0, 20);
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
          dropdown.innerHTML = '<div class="search-no-results">No applications found.</div>';
          return;
        }
        for (const app of results) {
          const item = document.createElement('a');
          item.className = 'search-result-item';
          item.href = `app.html?id=${encodeURIComponent(app.id)}`;
          item.innerHTML = `
            <div class="search-result-icon">${app.name.charAt(0)}</div>
            <div class="search-result-info">
              <div class="search-result-name">${app.name}</div>
              <div class="search-result-id">${app.id}</div>
            </div>
          `;
          dropdown.appendChild(item);
        }
      }, 200);
    });

    input.addEventListener('blur', () => {
      setTimeout(() => { if (dropdown) dropdown.innerHTML = ''; }, 200);
    });
  }

  function init() {
    // Navbar search
    const navInput = document.getElementById('navSearch');
    if (navInput) {
      const nav = navInput.closest('.navbar') || document.querySelector('.navbar');
      const dd = document.createElement('div');
      dd.className = 'search-dropdown';
      if (navInput.parentElement) {
        navInput.parentElement.style.position = 'relative';
        navInput.parentElement.appendChild(dd);
      }
      bindSearchInput(navInput, dd);
    }

    // Apps page search bar
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

    // Handle ?q= param on apps.html
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
