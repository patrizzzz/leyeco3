/**
 * Frontend-focused dashboard behavior:
 * - Fetches posts from Flask at /api/posts (falls back to sample data if API fails)
 * - Search + status filters in the sidebar
 * - Color-coded markers + synced selection between list and map
 */

const FALLBACK_POSTS = [
  { id: 1, name: 'Pole A', lat: 40.7128, lng: -74.0060, status: 'active' },
  { id: 2, name: 'Pole B', lat: 40.7138, lng: -74.0050, status: 'maintenance' },
  { id: 3, name: 'Pole C', lat: 40.7148, lng: -74.0040, status: 'inactive' },
];

const STATUS_COLORS = {
  active: '#059669',
  maintenance: '#b45309',
  inactive: '#64748b',
};

function normalizeStatus(status) {
  const s = String(status || '').trim().toLowerCase();
  if (s === 'active' || s === 'maintenance' || s === 'inactive') return s;
  return 'inactive';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = String(text ?? '');
  return div.innerHTML;
}

function getPosts() {
  return fetch('/api/posts')
    .then((r) => {
      if (!r.ok) throw new Error('API error');
      return r.json();
    })
    .then((posts) => (Array.isArray(posts) ? posts : []))
    .catch(() => FALLBACK_POSTS);
}

function createMarkerIcon(status) {
  const s = normalizeStatus(status);
  const color = STATUS_COLORS[s] || STATUS_COLORS.inactive;
  return L.divIcon({
    className: 'custom-marker',
    html: `<span style="background-color:${color};width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 8px rgba(15,23,42,0.22);display:block;"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function computeStats(posts) {
  const stats = { total: posts.length, active: 0, maintenance: 0, inactive: 0 };
  posts.forEach((p) => {
    const s = normalizeStatus(p.status);
    stats[s] += 1;
  });
  return stats;
}

function applyFilters(posts, { query, status }) {
  const q = String(query || '').trim().toLowerCase();
  return posts.filter((p) => {
    const s = normalizeStatus(p.status);
    if (status && status !== 'all' && s !== status) return false;
    if (!q) return true;
    const hay = `${p.id ?? ''} ${p.name ?? ''}`.toLowerCase();
    return hay.includes(q);
  });
}

function renderPostsList({ posts, selectedId, onSelect }) {
  const list = document.getElementById('posts-list');
  if (!list) return;

  list.innerHTML = posts
    .map((p) => {
      const s = normalizeStatus(p.status);
      const isSelected = String(p.id) === String(selectedId);
      return `<li class="${isSelected ? 'is-selected' : ''}" data-id="${escapeHtml(p.id)}" role="button" tabindex="0">
        <span class="post-name">${escapeHtml(p.name || `Post ${p.id}`)}</span>
        <span class="post-status status-${escapeHtml(s)}">${escapeHtml(s)}</span>
      </li>`;
    })
    .join('');

  list.querySelectorAll('li').forEach((li) => {
    const id = li.getAttribute('data-id');
    const handler = () => onSelect?.(id);
    li.addEventListener('click', handler);
    li.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handler();
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  const mapEl = document.getElementById('map');
  if (!mapEl || typeof L === 'undefined') return;

  // CRITICAL: Leaflet needs explicit height to render (header = 64px)
  const mapHeight = window.innerHeight - 64;
  mapEl.style.height = mapHeight + 'px';
  mapEl.style.width = '100%';

  const map = L.map('map', { zoomControl: true }).setView([10.0, 122.0], 6);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors',
  }).addTo(map);

<<<<<<< HEAD
  // Force Leaflet to recognize the size immediately
  setTimeout(() => map.invalidateSize(), 50);
=======
  // Rotation wrapper to allow visual rotation (tiles & overlays) without rotating controls
  const mapContainer = document.getElementById('map');
  const mapPane = map.getPane('mapPane');
  const rotateWrap = document.createElement('div');
  rotateWrap.className = 'rotate-wrapper';
  mapContainer.insertBefore(rotateWrap, mapPane);
  rotateWrap.appendChild(mapPane);
  let rotation = 0;
  function setMapRotation(deg) {
    rotation = ((deg % 360) + 360) % 360;
    rotateWrap.style.transform = `rotate(${rotation}deg)`;
  }
  function rotateBy(delta) { setMapRotation(rotation + delta); }

  // Rotate control: left/right/reset and slider
  const RotateControl = L.Control.extend({
    options: { position: 'topleft' },
    onAdd: function() {
      const container = L.DomUtil.create('div', 'leaflet-bar rotate-control');
      container.innerHTML = `
        <button id="rot-left" title="Rotate left 15°">◀</button>
        <input id="rot-range" type="range" min="0" max="360" step="1" value="0" style="width:80px; vertical-align:middle;">
        <button id="rot-right" title="Rotate right 15°">▶</button>
        <button id="rot-reset" title="Reset rotation">↺</button>
      `;
      L.DomEvent.disableClickPropagation(container);
      setTimeout(() => {
        const left = container.querySelector('#rot-left');
        const right = container.querySelector('#rot-right');
        const reset = container.querySelector('#rot-reset');
        const range = container.querySelector('#rot-range');
        left.addEventListener('click', () => { rotateBy(-15); range.value = rotation; });
        right.addEventListener('click', () => { rotateBy(15); range.value = rotation; });
        reset.addEventListener('click', () => { setMapRotation(0); range.value = rotation; });
        range.addEventListener('input', (e) => setMapRotation(parseInt(e.target.value, 10)));
      }, 0);
      return container;
    }
  });
  map.addControl(new RotateControl());

  const postsLayer = L.layerGroup();
  const latlongLayer = L.layerGroup();
  const bounds = L.latLngBounds();
>>>>>>> upstream/main

  const searchInput = document.getElementById('search-input');
  const filterButtons = Array.from(document.querySelectorAll('.chip[data-filter]'));

  let allPosts = [];
  let filteredPosts = [];
  let selectedId = null;
  let activeFilter = 'all';

  const markersById = new Map();

  function updateUI() {
    filteredPosts = applyFilters(allPosts, { query: searchInput?.value, status: activeFilter });
    setText('post-count', `(${filteredPosts.length})`);

    const stats = computeStats(filteredPosts);
    setText('stat-total', String(stats.total));
    setText('stat-active', String(stats.active));
    setText('stat-maintenance', String(stats.maintenance));
    setText('stat-inactive', String(stats.inactive));

    // Toggle markers visibility based on filtered list
    const visibleIds = new Set(filteredPosts.map((p) => String(p.id)));
    markersById.forEach((marker, id) => {
      const shouldShow = visibleIds.has(String(id));
      const isOnMap = marker._map != null;
      if (shouldShow && !isOnMap) marker.addTo(map);
      if (!shouldShow && isOnMap) marker.removeFrom(map);
    });

    renderPostsList({
      posts: filteredPosts,
      selectedId,
      onSelect: (id) => selectById(id, true),
    });
  }

  function selectById(id, focusMap) {
    selectedId = id;
    const marker = markersById.get(String(id));
    if (marker && focusMap) {
      map.flyTo(marker.getLatLng(), Math.max(map.getZoom(), 16), { duration: 0.6 });
      marker.openPopup();
    }
    updateUI();
  }

  function setActiveChip(value) {
    activeFilter = value;
    filterButtons.forEach((b) => b.classList.toggle('is-active', b.dataset.filter === value));
    updateUI();
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => updateUI());
  }

  filterButtons.forEach((b) => {
    b.addEventListener('click', () => setActiveChip(b.dataset.filter || 'all'));
  });

  getPosts().then((posts) => {
    allPosts = posts
      .filter((p) => p && typeof p.lat === 'number' && typeof p.lng === 'number')
      .map((p) => ({ ...p, status: normalizeStatus(p.status) }));

    // Create markers once
    allPosts.forEach((p) => {
      const marker = L.marker([p.lat, p.lng], { icon: createMarkerIcon(p.status) })
        .addTo(map)
        .bindPopup(
          `<div class="popup-content">
            <div class="popup-name">${escapeHtml(p.name || `Post ${p.id}`)}</div>
            <div class="popup-status">${escapeHtml(normalizeStatus(p.status))}</div>
          </div>`
        )
        .on('click', () => selectById(String(p.id), false));
      markersById.set(String(p.id), marker);
    });

    // Fit map to markers (more realistic UX than a hard-coded city)
    if (allPosts.length) {
      const bounds = L.latLngBounds(allPosts.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds.pad(0.25));
    }

    updateUI();
    setTimeout(() => map.invalidateSize(), 100);
  });

  // Keep map crisp on resize
  window.addEventListener('resize', () => setTimeout(() => map.invalidateSize(), 150));
});
