const $ = id => document.getElementById(id);
const DEF = { mode: 'off', label: '', presets: [], precision: 'approx', resolveCity: false };
let cfg = Object.assign({}, DEF);

function save() { chrome.storage.local.set({ geostamp: cfg }); render(); }

function renderPresets() {
  const box = $('presets'); box.textContent = '';
  cfg.presets.forEach(name => {
    const chip = document.createElement('span');
    chip.className = 'chip' + (name === cfg.label ? ' active' : '');
    const t = document.createElement('span'); t.textContent = name;
    t.addEventListener('click', () => { cfg.label = name; save(); });
    const x = document.createElement('span'); x.className = 'x'; x.textContent = '×';
    x.addEventListener('click', e => { e.stopPropagation();
      cfg.presets = cfg.presets.filter(p => p !== name);
      if (cfg.label === name) cfg.label = '';
      save(); });
    chip.appendChild(t); chip.appendChild(x); box.appendChild(chip);
  });
}

function preview() {
  $('preview').textContent =
    cfg.mode === 'off' ? '(no stamp)' :
    cfg.mode === 'manual' ? (cfg.label ? `[GEO · ${cfg.label}]` : '(pick or add a named place)') :
    cfg.resolveCity ? '[GEO · <city>]' :
    cfg.precision === 'fine' ? '[GEO · 41.8781, -87.6298]' : '[GEO · 41.88, -87.63]';
}

function showPermState() {
  if (!navigator.permissions) { $('permState').textContent = 'not asked'; return; }
  navigator.permissions.query({ name: 'geolocation' }).then(p => {
    const set = s => {
      $('permState').textContent = s === 'granted' ? 'granted' : s === 'denied' ? 'denied' : 'not asked';
      let hint = $('permHint');
      if (s === 'denied') {
        if (!hint) { hint = document.createElement('div'); hint.id = 'permHint';
          hint.className = 'perm'; hint.style.color = '#c84a3e';
          hint.textContent = 'Allow location for this site in the browser bar.';
          $('perm').after(hint); }
      } else if (hint) { hint.remove(); }
    };
    set(p.state);
    p.onchange = () => set(p.state);
  }).catch(() => { $('permState').textContent = 'not asked'; });
}

function render() {
  $('mode').value = cfg.mode;
  $('label').value = cfg.label || '';
  $('precision').value = cfg.precision || 'approx';
  $('resolveCity').checked = !!cfg.resolveCity;
  $('namedSection').classList.toggle('hidden', cfg.mode !== 'manual');
  $('deviceSection').classList.toggle('hidden', cfg.mode !== 'auto');
  if (cfg.mode === 'auto') showPermState();
  renderPresets();
  preview();
}

chrome.storage.local.get('geostamp', r => { cfg = Object.assign({}, DEF, r.geostamp || {}); render(); });

$('mode').addEventListener('change', () => { cfg.mode = $('mode').value; save(); });
$('precision').addEventListener('change', () => { cfg.precision = $('precision').value; save(); });
$('resolveCity').addEventListener('change', () => { cfg.resolveCity = $('resolveCity').checked; save(); });
$('label').addEventListener('input', () => { cfg.label = $('label').value.trim(); preview(); });
$('label').addEventListener('change', save);
$('addPreset').addEventListener('click', () => {
  const v = $('label').value.trim();
  if (!v) return;
  if (!cfg.presets.includes(v) && cfg.presets.length < 6) cfg.presets.push(v);
  cfg.label = v;
  save();
});
