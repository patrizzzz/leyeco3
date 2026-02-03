document.addEventListener('DOMContentLoaded', function() {
  const map = L.map('map').setView([40.7128, -74.0060], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors',
  }).addTo(map);

  fetch('/api/posts')
    .then(r => r.json())
    .then(posts => {
      posts.forEach(p => {
        L.marker([p.lat, p.lng]).addTo(map).bindPopup(`<strong>${p.name}</strong><br>Status: ${p.status}`);
      });
    })
    .catch(err => console.error('Failed to load posts', err));
});
