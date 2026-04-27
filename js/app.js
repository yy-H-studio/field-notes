/* ── State ────────────────────────────────────────────────── */

let map;
let markers        = {};
let activeId       = null;
let lightboxPhotos = [];
let lightboxIndex  = 0;

// Focus management — remember where focus came from so we can restore it
// when a panel/lightbox closes. Track the data-id too as a fallback for
// markers that get re-rendered by Leaflet on zoom/pan.
let lastPanelFocus    = null;
let lastPanelFocusId  = null;
let lastLightboxFocus = null;

/* ── Init ─────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  initMap();
  buildNav();
  buildMarkers();
  bindMarkerKeyboard();
  bindPanelClose();
  bindLightbox();
  bindAbout();
});

/* ── Map ──────────────────────────────────────────────────── */

function initMap() {
  // Center on southeastern Taiwan, encompassing all three locations
  map = L.map('map', {
    center: [22.35, 121.15],
    zoom: 9,
    zoomControl: true,
    attributionControl: true,
    scrollWheelZoom: true,
  });

  // CartoDB Positron — clean, near-grayscale; CSS filter makes it true B&W
  const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(map);

  // Hide loading state once any tile lands
  tileLayer.once('load', () => {
    document.getElementById('map').classList.add('tiles-loaded');
  });

  // Move zoom control to bottom-right
  map.zoomControl.setPosition('bottomright');
}

/* ── Navigation ───────────────────────────────────────────── */

function buildNav() {
  const nav = document.getElementById('location-nav');
  GALLERY_DATA.locations.forEach(loc => {
    const btn = document.createElement('button');
    btn.className = 'nav-item';
    btn.textContent = loc.name.toUpperCase();
    btn.dataset.id = loc.id;
    btn.addEventListener('click', () => openPanel(loc.id));
    nav.appendChild(btn);
  });

  // Site title from metadata
  const titleText = document.getElementById('title-text');
  if (GALLERY_DATA.meta && GALLERY_DATA.meta.title) {
    titleText.textContent = GALLERY_DATA.meta.title.toUpperCase();
    document.title = GALLERY_DATA.meta.title;
  }
}

/* ── Markers ──────────────────────────────────────────────── */

function buildMarkers() {
  GALLERY_DATA.locations.forEach(loc => {
    const icon = L.divIcon({
      className: '',
      html: `
        <div class="marker-wrap" data-id="${loc.id}" tabindex="0" role="button" aria-label="Open ${loc.name} panel">
          <div class="marker-dot"></div>
          <div class="marker-label">${loc.name.toUpperCase()}</div>
        </div>`,
      iconSize: [0, 0],
      iconAnchor: [0, 5],
    });

    const marker = L.marker(loc.coordinates, { icon, title: loc.name })
      .addTo(map)
      .on('click', () => openPanel(loc.id));

    markers[loc.id] = marker;
  });
}

// Markers are inside Leaflet's pane, which it rebuilds on zoom/pan.
// Bind via delegation on the map container so handlers survive rebuilds.
function bindMarkerKeyboard() {
  const mapEl = document.getElementById('map');
  mapEl.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const wrap = e.target.closest('.marker-wrap');
    if (!wrap) return;
    e.preventDefault();
    const id = wrap.dataset.id;
    if (id) openPanel(id);
  });
}

function setActiveMarker(id) {
  // Remove active from all
  document.querySelectorAll('.marker-wrap').forEach(el => {
    el.classList.remove('active');
  });
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.remove('active');
  });

  if (!id) return;

  // Set active on target marker
  const markerEl = document.querySelector(`.marker-wrap[data-id="${id}"]`);
  if (markerEl) markerEl.classList.add('active');

  // Set active on nav item
  const navEl = document.querySelector(`.nav-item[data-id="${id}"]`);
  if (navEl) navEl.classList.add('active');
}

/* ── Panel ────────────────────────────────────────────────── */

function openPanel(id) {
  const loc = GALLERY_DATA.locations.find(l => l.id === id);
  if (!loc) return;

  // Hide the first-visit hint the moment any panel opens
  hideMapHint();

  // Remember where focus came from so closePanel() can restore it.
  // Mouse clicks may not focus the trigger element in Safari, so the
  // data-id fallback below is what usually fires for marker clicks.
  capturePanelFocus();

  activeId = id;
  populatePanel(loc);

  const panel = document.getElementById('detail-panel');
  panel.removeAttribute('inert');
  panel.classList.add('open');
  panel.setAttribute('aria-hidden', 'false');
  panel.scrollTop = 0;

  document.getElementById('map').classList.add('panel-open');

  setActiveMarker(id);

  // Update document.title so the open panel is reflected in the tab/bookmark
  const baseTitle = (GALLERY_DATA.meta && GALLERY_DATA.meta.title) || 'Field Notes';
  document.title = `${baseTitle} — ${loc.name}`;

  // Move focus into the panel so screen readers announce the new content
  // and keyboard users land somewhere useful. preventScroll keeps the
  // panel pinned to the top after our manual scrollTop = 0.
  const heading = document.getElementById('panel-name');
  if (heading) heading.focus({ preventScroll: true });

  // Fly to location with a slight offset so marker isn't behind the panel
  const targetLng = loc.coordinates[1];
  const adjustedLng = window.innerWidth > 768
    ? targetLng - 0.35   // shift left on desktop to account for panel
    : targetLng;

  map.flyTo([loc.coordinates[0], adjustedLng], 11, {
    animate: true,
    duration: 1.2,
    easeLinearity: 0.4,
  });
}

function closePanel() {
  activeId = null;
  const panel = document.getElementById('detail-panel');
  panel.classList.remove('open');
  panel.setAttribute('aria-hidden', 'true');
  panel.setAttribute('inert', '');
  document.getElementById('map').classList.remove('panel-open');
  setActiveMarker(null);
  restorePanelFocus();

  // Restore base title
  const baseTitle = (GALLERY_DATA.meta && GALLERY_DATA.meta.title) || 'Field Notes';
  document.title = baseTitle;
}

function capturePanelFocus() {
  lastPanelFocus = document.activeElement;
  if (lastPanelFocus && lastPanelFocus.dataset && lastPanelFocus.dataset.id) {
    lastPanelFocusId = lastPanelFocus.dataset.id;
  } else {
    lastPanelFocusId = null;
  }
}

function restorePanelFocus() {
  // Try the original element first
  if (lastPanelFocus && document.body.contains(lastPanelFocus)) {
    try { lastPanelFocus.focus(); return; } catch (_) { /* fallthrough */ }
  }
  // Fall back to the nav-item with the matching id (always in the DOM)
  if (lastPanelFocusId) {
    const fallback =
      document.querySelector(`.marker-wrap[data-id="${lastPanelFocusId}"]`) ||
      document.querySelector(`.nav-item[data-id="${lastPanelFocusId}"]`);
    if (fallback) { fallback.focus(); return; }
  }
}

function populatePanel(loc) {
  // Meta row
  document.getElementById('panel-date').textContent = loc.date || '';
  document.getElementById('panel-coords').textContent =
    formatCoords(loc.coordinates);

  // Names
  document.getElementById('panel-name').textContent = loc.name;
  document.getElementById('panel-local-name').textContent = loc.localName || '';
  document.getElementById('panel-subtitle').textContent = loc.subtitle || '';

  // Tags — explicit list semantics so screen readers don't read the
  // tags as a single run-on phrase
  const tagsEl = document.getElementById('panel-tags');
  tagsEl.innerHTML = '';
  tagsEl.setAttribute('role', 'list');
  (loc.tags || []).forEach(tag => {
    const span = document.createElement('span');
    span.className = 'tag';
    span.setAttribute('role', 'listitem');
    span.textContent = tag;
    tagsEl.appendChild(span);
  });

  // Description (lead paragraph)
  document.getElementById('panel-description').textContent = loc.description || '';

  // Story (multi-paragraph)
  const storyEl = document.getElementById('panel-story');
  storyEl.innerHTML = '';
  if (loc.story) {
    loc.story.split('\n\n').forEach(para => {
      if (para.trim()) {
        const p = document.createElement('p');
        p.textContent = para.trim();
        storyEl.appendChild(p);
      }
    });
  }

  // Photos
  renderPhotos(loc);
}

function bindPanelClose() {
  document.getElementById('panel-close').addEventListener('click', closePanel);

  // Close on Escape key — priority: lightbox → about → panel
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (document.getElementById('lightbox').classList.contains('open')) {
        closeLightbox();
      } else if (document.getElementById('about').classList.contains('open')) {
        closeAbout();
      } else {
        closePanel();
      }
    }
  });
}

/* ── Reset ────────────────────────────────────────────────── */

function resetView() {
  closePanel();
  map.flyTo([22.35, 121.15], 9, { animate: true, duration: 1.0 });
}

/* ── Photos ───────────────────────────────────────────────── */

function renderPhotos(loc) {
  const grid    = document.getElementById('panel-photos-grid');
  const noPhoto = document.getElementById('panel-no-photos');
  const label   = document.getElementById('panel-photos-label');
  const photos  = loc.photos || [];

  grid.innerHTML = '';

  if (photos.length === 0) {
    noPhoto.style.display = 'block';
    grid.style.display    = 'none';
    if (label) label.style.display = 'none';
    return;
  }

  noPhoto.style.display = 'none';
  grid.style.display    = 'grid';
  if (label) label.style.display = 'block';

  photos.forEach((photo, index) => {
    const item = document.createElement('div');
    item.className = 'photo-item';

    // If odd total and this is the last one, span full width
    if (photos.length % 2 !== 0 && index === photos.length - 1) {
      item.classList.add('full-width');
    }

    const src = `locations/${loc.id}/${photo.filename}`;

    item.innerHTML = `
      <img src="${src}" alt="${photo.caption || ''}" loading="lazy">
      <div class="photo-overlay">
        <div class="photo-overlay-text">
          ${photo.caption ? photo.caption : ''}
          ${photo.date ? `<span class="photo-overlay-date">${photo.date}</span>` : ''}
        </div>
      </div>`;

    item.addEventListener('click', () => openLightbox(loc, index));
    grid.appendChild(item);
  });
}

/* ── Lightbox ─────────────────────────────────────────────── */

function openLightbox(loc, index) {
  // Defensive: renderLightboxSlide() relies on activeId to resolve the
  // photo path. If no panel is active, bail out rather than throwing.
  if (!activeId) return;

  // Remember the trigger so we can restore focus when the lightbox closes
  lastLightboxFocus = document.activeElement;

  lightboxPhotos = loc.photos || [];
  lightboxIndex  = index;

  const lb = document.getElementById('lightbox');
  lb.removeAttribute('inert');
  lb.classList.add('open');
  lb.setAttribute('aria-hidden', 'false');

  renderLightboxSlide();

  // Move focus to the close button so Esc/Tab work immediately
  document.getElementById('lightbox-close').focus({ preventScroll: true });
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  lb.classList.remove('open');
  lb.setAttribute('aria-hidden', 'true');
  lb.setAttribute('inert', '');

  // Restore focus to the photo item (or whatever triggered the lightbox)
  if (lastLightboxFocus && document.body.contains(lastLightboxFocus)) {
    try { lastLightboxFocus.focus(); } catch (_) { /* no-op */ }
  }
}

function renderLightboxSlide() {
  const photo = lightboxPhotos[lightboxIndex];
  const loc   = GALLERY_DATA.locations.find(l => l.id === activeId);

  const img = document.getElementById('lightbox-img');
  img.src = `locations/${loc.id}/${photo.filename}`;
  img.alt = photo.caption || '';

  document.getElementById('lightbox-caption').textContent = photo.caption || '';
  document.getElementById('lightbox-date').textContent    = photo.date    || '';

  document.getElementById('lightbox-counter').textContent =
    `${lightboxIndex + 1} / ${lightboxPhotos.length}`;

  // Show/hide nav arrows
  document.getElementById('lightbox-prev').style.visibility =
    lightboxIndex > 0 ? 'visible' : 'hidden';
  document.getElementById('lightbox-next').style.visibility =
    lightboxIndex < lightboxPhotos.length - 1 ? 'visible' : 'hidden';
}

function bindLightbox() {
  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
  document.getElementById('lightbox-backdrop').addEventListener('click', closeLightbox);

  document.getElementById('lightbox-prev').addEventListener('click', () => {
    if (lightboxIndex > 0) {
      lightboxIndex--;
      renderLightboxSlide();
    }
  });

  document.getElementById('lightbox-next').addEventListener('click', () => {
    if (lightboxIndex < lightboxPhotos.length - 1) {
      lightboxIndex++;
      renderLightboxSlide();
    }
  });

  // Keyboard navigation + focus trap
  document.addEventListener('keydown', e => {
    const lb = document.getElementById('lightbox');
    if (!lb.classList.contains('open')) return;

    if (e.key === 'ArrowLeft'  && lightboxIndex > 0) {
      lightboxIndex--; renderLightboxSlide();
      return;
    }
    if (e.key === 'ArrowRight' && lightboxIndex < lightboxPhotos.length - 1) {
      lightboxIndex++; renderLightboxSlide();
      return;
    }
    if (e.key === 'Tab') {
      trapFocus(lb, e);
    }
  });

  // Touch swipe (mobile) — drag left/right to page through photos.
  // 50px threshold avoids accidental swipes; vertical-dominant drags are
  // ignored so users can still scroll a long caption if we ever add one.
  const lb = document.getElementById('lightbox');
  let touchStartX = 0;
  let touchStartY = 0;
  lb.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  lb.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0 && lightboxIndex < lightboxPhotos.length - 1) {
      lightboxIndex++; renderLightboxSlide();
    } else if (dx > 0 && lightboxIndex > 0) {
      lightboxIndex--; renderLightboxSlide();
    }
  });
}

// Cycle Tab focus inside `container`. Skips elements that are
// visibility:hidden or display:none (e.g. lightbox arrows at the edges).
function trapFocus(container, e) {
  const tabbables = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const visible = Array.from(tabbables).filter(el =>
    !el.disabled &&
    el.style.visibility !== 'hidden' &&
    el.offsetParent !== null
  );
  if (!visible.length) return;

  const first = visible[0];
  const last  = visible[visible.length - 1];

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

/* ── About Modal ──────────────────────────────────────────── */

let lastAboutFocus = null;

function openAbout() {
  const about = document.getElementById('about');
  lastAboutFocus = document.activeElement;
  about.removeAttribute('inert');
  about.classList.add('open');
  about.setAttribute('aria-hidden', 'false');
  // Move focus into the modal so screen readers announce it and Tab is trapped inside
  document.getElementById('about-close').focus();
}

function closeAbout() {
  const about = document.getElementById('about');
  about.classList.remove('open');
  about.setAttribute('aria-hidden', 'true');
  about.setAttribute('inert', '');
  if (lastAboutFocus && typeof lastAboutFocus.focus === 'function') {
    lastAboutFocus.focus();
  }
}

function bindAbout() {
  const trigger  = document.getElementById('about-trigger');
  const closeBtn = document.getElementById('about-close');
  const backdrop = document.getElementById('about-backdrop');
  const modal    = document.getElementById('about');

  if (trigger)  trigger.addEventListener('click', openAbout);
  if (closeBtn) closeBtn.addEventListener('click', closeAbout);
  if (backdrop) backdrop.addEventListener('click', closeAbout);

  // Focus trap when the modal is open
  if (modal) {
    modal.addEventListener('keydown', e => {
      if (e.key === 'Tab' && modal.classList.contains('open')) {
        trapFocus(modal, e);
      }
    });
  }
}

/* ── Helpers ──────────────────────────────────────────────── */

function formatCoords([lat, lng]) {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(2)}°${latDir} ${Math.abs(lng).toFixed(2)}°${lngDir}`;
}

// Fade out the first-visit hint. Idempotent — safe to call repeatedly.
function hideMapHint() {
  const hint = document.getElementById('map-hint');
  if (hint && !hint.classList.contains('hidden')) {
    hint.classList.add('hidden');
  }
}

// Auto-fade the hint after a generous pause even if the visitor never
// clicks anything — prevents it from sitting there forever.
window.addEventListener('load', () => {
  setTimeout(hideMapHint, 9000);
});
