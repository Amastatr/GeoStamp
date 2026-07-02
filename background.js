// GeoStamp v3.0.2 - badge shows armed/off state in suite tokens
function setBadge(v) {
  const on = v && v.mode && v.mode !== 'off';
  chrome.action.setBadgeText({ text: on ? 'ON' : 'OFF' });
  chrome.action.setBadgeBackgroundColor({ color: on ? '#188038' : '#C8102E' });
  chrome.action.setBadgeTextColor({ color: '#FFFFFF' });
}
chrome.storage.local.get('geostamp', r => setBadge(r.geostamp));
chrome.storage.onChanged.addListener(ch => { if (ch.geostamp) setBadge(ch.geostamp.newValue); });
chrome.runtime.onInstalled.addListener(() =>
  chrome.storage.local.get('geostamp', r => setBadge(r.geostamp)));
