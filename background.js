// GeoStamp v0.2.0 - badge shows armed state
function setBadge(v) {
  const on = v && v.mode && v.mode !== 'off';
  chrome.action.setBadgeText({ text: on ? 'ON' : '' });
  if (on) chrome.action.setBadgeBackgroundColor({ color: '#c84a3e' });
}
chrome.storage.local.get('geostamp', r => setBadge(r.geostamp));
chrome.storage.onChanged.addListener(ch => { if (ch.geostamp) setBadge(ch.geostamp.newValue); });
chrome.runtime.onInstalled.addListener(() =>
  chrome.storage.local.get('geostamp', r => setBadge(r.geostamp)));
