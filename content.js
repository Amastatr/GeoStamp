// GeoStamp v3.0.0 - AI Contextualizers - Amastatr
// Doctrine: OFF by default. Stamps fire once, on send intent only - never on input mutation.
// (The TimeStamp lesson, 2026-06-09: per-mutation stamping produced 24 stamps in 8 seconds.)

(() => {
  const COMPOSERS = [
    'div[contenteditable="true"].ProseMirror',
    '#prompt-textarea',
    'rich-textarea div[contenteditable="true"]',
    'div[contenteditable="true"]',
    'textarea'
  ];
  const SEND_BTNS = [
    'button[aria-label*="Send" i]',
    'button[data-testid*="send" i]',
    'button[type="submit"]'
  ];

  let cfg = { mode: 'off', label: '', presets: [], precision: 'approx', resolveCity: false };
  let coordsCache = null;        // {lat, lon, t}
  let cityCache = null;          // {name, t}
  let cityInFlight = false;
  let lastStampAt = 0;
  const DEBOUNCE_MS = 1200;
  const CACHE_MS = 5 * 60 * 1000;
  const CITY_MS = 10 * 60 * 1000;
  // No-key, CORS-enabled reverse geocoding (BigDataCloud reverse-geocode-client). Named in README.
  function refreshCity(c) {
    if (cityInFlight) return;
    cityInFlight = true;
    fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${c.lat}&longitude=${c.lon}&localityLanguage=en`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(j => { const name = j.city || j.locality || j.principalSubdivision;
        if (name) cityCache = { name, t: Date.now() }; })
      .catch(() => {})
      .finally(() => { cityInFlight = false; });
  }

  function loadCfg() {
    try {
      chrome.storage.local.get('geostamp', r => {
        if (r && r.geostamp) cfg = Object.assign(cfg, r.geostamp);
        if (cfg.mode === 'auto') refreshCoords();
      });
      chrome.storage.onChanged.addListener(ch => {
        if (ch.geostamp) { cfg = Object.assign(cfg, ch.geostamp.newValue || {});
          if (cfg.mode === 'auto') refreshCoords(); }
      });
    } catch (e) { /* harness mode: window.__geostampCfg may set cfg */ }
  }
  if (typeof window !== 'undefined' && window.__geostampCfg) cfg = Object.assign(cfg, window.__geostampCfg);

  function refreshCoords() {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      p => { coordsCache = { lat: p.coords.latitude, lon: p.coords.longitude, t: Date.now() }; },
      () => {}, { maximumAge: CACHE_MS, timeout: 4000 }
    );
  }

  function stampText() {
    if (cfg.mode === 'off') return null;
    if (cfg.mode === 'manual') return cfg.label ? ` [GEO \u00b7 ${cfg.label}]` : null;
    // auto: synchronous read from cache; async fetch can't beat the send.
    if (!coordsCache || Date.now() - coordsCache.t > CACHE_MS) { refreshCoords();
      return cfg.label ? ` [GEO \u00b7 ${cfg.label}]` : null; }
    if (cfg.resolveCity) {
      if (cityCache && Date.now() - cityCache.t < CITY_MS) return ` [GEO \u00b7 ${cityCache.name}]`;
      refreshCity(coordsCache);                            // resolve for next send; fall back to coords now
    }
    const dp = cfg.precision === 'fine' ? 4 : 2;
    return ` [GEO \u00b7 ${coordsCache.lat.toFixed(dp)}, ${coordsCache.lon.toFixed(dp)}]`;
  }

  function findComposer(from) {
    if (from) { for (const s of COMPOSERS) { const c = from.closest && from.closest(s); if (c) return c; } }
    for (const s of COMPOSERS) { const el = document.querySelector(s); if (el && el.offsetParent !== null) return el; }
    return null;
  }

  function insertAtEnd(el, text) {
    if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
      el.value = el.value + text;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    }
    el.focus();
    const sel = window.getSelection(); const range = document.createRange();
    range.selectNodeContents(el); range.collapse(false);
    sel.removeAllRanges(); sel.addRange(range);
    return document.execCommand('insertText', false, text);
  }

  function currentText(el) {
    return (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') ? el.value : (el.textContent || '');
  }

  function stampNow(composer) {
    const t = stampText(); if (!t) return;
    const now = Date.now();
    if (now - lastStampAt < DEBOUNCE_MS) return;          // once per send
    const cur = currentText(composer);
    if (!cur.trim()) return;                               // never stamp an empty message
    if (/\[GEO · [^\]]*\]\s*$/.test(cur)) return;                           // never double-stamp
    if (insertAtEnd(composer, t)) lastStampAt = now;
  }

  // Send intent A: Enter (without Shift) inside a composer - capture phase, before the site's handler.
  window.addEventListener('keydown', e => {
    if (e.key !== 'Enter' || e.shiftKey || e.isComposing) return;
    const composer = findComposer(e.target); if (!composer) return;
    if (!composer.contains(e.target) && composer !== e.target) return;
    stampNow(composer);
  }, true);

  // Send intent B: pointerdown on a send button - fires before the click the site listens for.
  window.addEventListener('pointerdown', e => {
    const btn = e.target && e.target.closest && SEND_BTNS.map(s => e.target.closest(s)).find(Boolean);
    if (!btn) return;
    const composer = findComposer(null); if (!composer) return;
    stampNow(composer);
  }, true);

  loadCfg();
})();
