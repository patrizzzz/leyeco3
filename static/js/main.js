/**
 * Fetches posts from Flask backend. Falls back to mock data only if the API fails.
 */
const MOCK_POSTS = [
  { id: 1, name: 'Pole A', lat: 40.7128, lng: -74.006, status: 'active' },
  { id: 2, name: 'Pole B', lat: 40.7138, lng: -74.005, status: 'maintenance' },
];

function getPosts() {
  return fetch('/api/posts')
    .then((r) => {
      if (!r.ok) throw new Error('API error');
      return r.json();
    })
    .catch(() => MOCK_POSTS);
}

const STATUS_COLORS = {
  active: '#059669',
  maintenance: '#b45309',
  inactive: '#64748b',
};

function createMarkerIcon(status) {
  const color = STATUS_COLORS[status] || STATUS_COLORS.inactive;
  return L.divIcon({
    className: 'custom-marker',
    html: `<span style="background-color:${color};width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.3);display:block;"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function renderPostsList(posts, map, markers) {
  const list = document.getElementById('posts-list');
  if (!list) return;
  list.innerHTML = posts
    .map(
      (p, i) =>
        `<li data-index="${i}" role="button" tabindex="0">
          <span class="post-name">${escapeHtml(p.name)}</span><br>
          <span class="post-status status-${p.status}">${escapeHtml(p.status)}</span>
        </li>`
    )
    .join('');

  list.querySelectorAll('li').forEach((li, i) => {
    li.addEventListener('click', () => {
      const m = markers[i];
      if (m) {
        map.setView(m.getLatLng(), 16);
        m.openPopup();
      }
    });
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', function () {
  const mapEl = document.getElementById('map');
  if (!mapEl || typeof L === 'undefined') return;

  // Give map a fixed height so Leaflet can render (header = 64px)
  mapEl.style.height = (window.innerHeight - 64) + 'px';

  const map = L.map('map').setView([40.7128, -74.006], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors',
  }).addTo(map);

  const markers = [];

  getPosts()
    .then((posts) => {
      posts.forEach((p) => {
        const icon = createMarkerIcon(p.status);
        const marker = L.marker([p.lat, p.lng], { icon })
          .addTo(map)
          .bindPopup(
            `<div class="popup-content">
              <div class="popup-name">${escapeHtml(p.name)}</div>
              <div class="popup-status">${escapeHtml(p.status)}</div>
            </div>`
          );
        markers.push(marker);
      });
      renderPostsList(posts, map, markers);
      var countEl = document.getElementById('post-count');
      if (countEl) countEl.textContent = '(' + posts.length + ')';
      setTimeout(function () { map.invalidateSize(); }, 100);
    })
    .catch((err) => console.error('Failed to load posts', err));
});
